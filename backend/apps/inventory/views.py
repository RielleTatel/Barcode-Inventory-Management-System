from decimal import Decimal
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models, transaction
from django.db.models.deletion import ProtectedError
from django.utils import timezone

from .models import (
    Category, UomPreset, InventoryItem, StockLevel, StockAdjustment,
    StockTransfer, ConsumptionEntry, BOMEntry,
)
from .serializers import (
    UomPresetSerializer,
    CategorySerializer,
    InventoryItemSerializer,
    InventoryItemListSerializer,
    StockLevelSerializer,
    StockAdjustmentSerializer,
    StockTransferSerializer,
    ConsumptionEntrySerializer,
    ConsumptionEntryListSerializer,
    BOMEntrySerializer,
)
from apps.menusAndRecipes.models import MenuItem, Recipe
from apps.branches.models import Branch


class UomPresetViewSet(viewsets.ModelViewSet):
    """CRUD for Unit-of-Measurement presets — managed in Settings > Standards."""
    queryset = UomPreset.objects.all()
    serializer_class = UomPresetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'abbreviation']
    ordering = ['name']

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'id']
    ordering = ['name']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.items.exists():
            return Response(
                {'error': 'Cannot delete a category that still has inventory items.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.select_related('category', 'linked_menu_item').prefetch_related(
        'stock_levels__branch',
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['sku', 'name', 'category__name']
    ordering_fields = ['sku', 'name', 'created_at']
    ordering = ['sku']

    def get_serializer_class(self):
        if self.action == 'list':
            return InventoryItemListSerializer
        return InventoryItemSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.transfer_items.exists():
            return Response(
                {
                    'error': (
                        'Cannot delete this inventory item because it is still referenced by '
                        'branch transfer request line(s). Remove or change those records first, or archive the item instead.'
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    'error': (
                        'Cannot delete this inventory item because other records still depend on it '
                        '(protected foreign keys).'
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_name = request.query_params.get('name')
        if not category_name:
            return Response({'error': 'Category name is required'}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.filter_queryset(self.get_queryset().filter(category__name__icontains=category_name))
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Return items where at least one branch is at or below its threshold."""
        low_ids = (
            StockLevel.objects
            .filter(quantity__lte=models.F('threshold'))
            .values_list('item_id', flat=True)
            .distinct()
        )
        qs = self.get_queryset().filter(id__in=low_ids)
        return Response(InventoryItemListSerializer(qs, many=True).data)


class StockLevelViewSet(viewsets.ModelViewSet):
    queryset = StockLevel.objects.select_related('branch', 'item').all()
    serializer_class = StockLevelSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['branch', 'item']
    search_fields = ['item__name', 'item__sku', 'branch__name']
    ordering_fields = ['quantity', 'last_updated']
    ordering = ['-last_updated']

    @action(detail=False, methods=['get'])
    def by_branch(self, request):
        branch_id = request.query_params.get('branch_id')
        if not branch_id:
            return Response({'error': 'branch_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(branch_id=branch_id)
        return Response(self.get_serializer(qs, many=True).data)


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.select_related('stock__item', 'stock__branch').all()
    serializer_class = StockAdjustmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stock', 'type']
    search_fields = ['stock__item__name', 'reason']
    ordering_fields = ['date', 'quantity_change']
    ordering = ['-date']


# ── Helpers ───────────────────────────────────────────────────────────────────

def _match_inventory_item(ingredient_name: str):
    """
    Match a free-text ingredient name to an InventoryItem via:
      1. Leading SKU token (e.g. "RM-005 Longanisa" → SKU=RM-005)
      2. Exact name match (case-insensitive)
    """
    if not ingredient_name:
        return None
    first_token = ingredient_name.split()[0].rstrip('-').strip()
    try:
        return InventoryItem.objects.get(sku__iexact=first_token)
    except (InventoryItem.DoesNotExist, InventoryItem.MultipleObjectsReturned):
        pass
    try:
        return InventoryItem.objects.get(name__iexact=ingredient_name.strip())
    except (InventoryItem.DoesNotExist, InventoryItem.MultipleObjectsReturned):
        return None


def _deduct_from_branch_stock(item: InventoryItem, branch: Branch, amount: Decimal):
    """
    Deduct `amount` from the StockLevel for (item, branch).
    Creates the record at quantity=0 first if it doesn't exist.
    """
    sl, _ = StockLevel.objects.get_or_create(
        item=item, branch=branch,
        defaults={'quantity': Decimal('0'), 'threshold': Decimal('0')},
    )
    StockLevel.objects.filter(pk=sl.pk).update(quantity=models.F('quantity') - amount)


# ── Consumption Entry ─────────────────────────────────────────────────────────

class ConsumptionEntryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET  /inventory/consumption/        — list entries (summary)
    GET  /inventory/consumption/{id}/   — detail with BOM lines
    GET  /inventory/consumption/bom/    — flat list of all BOM lines
    POST /inventory/consumption/submit/ — record end-of-shift sales
    """
    queryset = ConsumptionEntry.objects.select_related('branch').prefetch_related(
        'bom_entries__inventory_item'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['branch']
    ordering_fields = ['submitted_at', 'date']
    ordering = ['-submitted_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ConsumptionEntryListSerializer
        return ConsumptionEntrySerializer

    @action(detail=False, methods=['get'])
    def bom(self, request):
        """Flat list of all BOM lines for the BOM data table."""
        qs = BOMEntry.objects.select_related(
            'consumption__branch', 'inventory_item'
        ).order_by('-consumption__submitted_at', 'menu_item_sku', 'ingredient_name')
        rows = []
        for entry in qs:
            rows.append({
                **BOMEntrySerializer(entry).data,
                'date': str(entry.consumption.date),
                'branch_name': entry.consumption.branch.name if entry.consumption.branch else '',
                'consumption_id': entry.consumption.id,
                'submitted_at': entry.consumption.submitted_at.isoformat(),
            })
        return Response(rows)

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """
        Submit an end-of-shift consumption entry.

        Payload:
        {
          "date": "2026-03-21",
          "branch_id": 1,
          "notes": "...",
          "menu_items_sold": [
            {"menu_item_id": 3, "units_sold": 5},
            ...
          ]
        }

        Effects:
        - Creates ConsumptionEntry + BOMEntry lines
        - Deducts quantities from the branch's specific StockLevel records
        """
        date_str = request.data.get('date')
        branch_id = request.data.get('branch_id')
        notes = request.data.get('notes', '')
        menu_items_sold = request.data.get('menu_items_sold', [])

        if not date_str:
            return Response({'error': 'date is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not menu_items_sold:
            return Response({'error': 'menu_items_sold cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        branch = None
        if branch_id:
            try:
                branch = Branch.objects.get(id=branch_id)
            except Branch.DoesNotExist:
                return Response({'error': 'Branch not found'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                entry = ConsumptionEntry.objects.create(
                    date=date_str,
                    branch=branch,
                    notes=notes,
                )

                bom_rows = []
                # {inventory_item_id: Decimal amount to deduct}
                deductions: dict[int, Decimal] = {}

                for sold in menu_items_sold:
                    menu_item_id = sold.get('menu_item_id')
                    try:
                        units_sold = Decimal(str(sold.get('units_sold', 0)))
                    except Exception:
                        continue
                    if units_sold <= 0:
                        continue

                    try:
                        menu_item = MenuItem.objects.get(id=menu_item_id)
                    except MenuItem.DoesNotExist:
                        continue

                    # 1. Deduct the prepared-dish inventory item itself
                    try:
                        prepared_inv = InventoryItem.objects.get(linked_menu_item=menu_item)
                        deductions[prepared_inv.id] = (
                            deductions.get(prepared_inv.id, Decimal('0')) + units_sold
                        )
                        bom_rows.append(BOMEntry(
                            consumption=entry,
                            menu_item_name=menu_item.name,
                            menu_item_sku=menu_item.sku,
                            units_sold=units_sold,
                            ingredient_name=f"{prepared_inv.sku} {prepared_inv.name}",
                            quantity_deducted=units_sold,
                            unit=prepared_inv.uom,
                            inventory_item=prepared_inv,
                            inventory_matched=True,
                        ))
                    except InventoryItem.DoesNotExist:
                        pass

                    # 2. Deduct raw materials via recipe
                    for recipe in Recipe.objects.filter(menu_item=menu_item):
                        qty_deducted = units_sold * recipe.quantity_required
                        inv_item = _match_inventory_item(recipe.ingredient_name)
                        if inv_item:
                            deductions[inv_item.id] = (
                                deductions.get(inv_item.id, Decimal('0')) + qty_deducted
                            )
                        bom_rows.append(BOMEntry(
                            consumption=entry,
                            menu_item_name=menu_item.name,
                            menu_item_sku=menu_item.sku,
                            units_sold=units_sold,
                            ingredient_name=recipe.ingredient_name,
                            quantity_deducted=qty_deducted,
                            unit=recipe.unit,
                            inventory_item=inv_item,
                            inventory_matched=inv_item is not None,
                        ))

                BOMEntry.objects.bulk_create(bom_rows)

                # Apply deductions to branch-specific StockLevel records
                for item_id, total in deductions.items():
                    try:
                        inv_item = InventoryItem.objects.get(id=item_id)
                    except InventoryItem.DoesNotExist:
                        continue
                    if branch:
                        _deduct_from_branch_stock(inv_item, branch, total)
                    else:
                        # No branch context — deduct from the first available StockLevel
                        sl = inv_item.stock_levels.order_by('id').first()
                        if sl:
                            StockLevel.objects.filter(pk=sl.pk).update(
                                quantity=models.F('quantity') - total
                            )

                return Response(
                    {
                        'message': (
                            f'Saved. {len(bom_rows)} BOM lines recorded, '
                            f'{len(deductions)} inventory items deducted.'
                        ),
                        'entry': ConsumptionEntrySerializer(entry).data,
                        'unmatched': [r.ingredient_name for r in bom_rows if not r.inventory_matched],
                    },
                    status=status.HTTP_201_CREATED,
                )
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


# ── Stock Transfer ────────────────────────────────────────────────────────────

class StockTransferViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET  /inventory/transfers/             — list all transfers
    GET  /inventory/transfers/{id}/        — retrieve one transfer
    POST /inventory/transfers/submit/      — initiate a transfer
    POST /inventory/transfers/{id}/receive/— confirm receipt
    """
    queryset = StockTransfer.objects.select_related(
        'item', 'from_branch', 'to_branch'
    ).all()
    serializer_class = StockTransferSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['item', 'from_branch', 'to_branch', 'status']
    ordering_fields = ['transferred_at', 'date', 'status']
    ordering = ['-transferred_at']

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """
        Initiate a stock transfer.

        Payload:
        {
          "item_id": 5,
          "from_branch_id": 1,
          "to_branch_id": 2,
          "quantity": 10,
          "date": "2026-03-21",
          "notes": "optional"
        }

        Immediately deducts from the source branch's StockLevel.
        Status is set to 'initiated'. Stock is credited to the destination
        only when /receive/ is called.
        """
        item_id = request.data.get('item_id')
        from_branch_id = request.data.get('from_branch_id')
        to_branch_id = request.data.get('to_branch_id')
        quantity_raw = request.data.get('quantity')
        date_str = request.data.get('date')
        notes = request.data.get('notes', '')

        if not all([item_id, from_branch_id, to_branch_id, quantity_raw, date_str]):
            return Response(
                {'error': 'item_id, from_branch_id, to_branch_id, quantity and date are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if str(from_branch_id) == str(to_branch_id):
            return Response(
                {'error': 'Source and destination branches must be different.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            quantity = Decimal(str(quantity_raw))
        except Exception:
            return Response({'error': 'Invalid quantity.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = InventoryItem.objects.get(id=item_id)
            from_branch = Branch.objects.get(id=from_branch_id)
            to_branch = Branch.objects.get(id=to_branch_id)
        except InventoryItem.DoesNotExist:
            return Response({'error': 'Inventory item not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Branch.DoesNotExist:
            return Response({'error': 'Branch not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify source has enough stock
        try:
            source_sl = StockLevel.objects.get(item=item, branch=from_branch)
        except StockLevel.DoesNotExist:
            return Response(
                {'error': f'{from_branch.name} has no stock record for this item.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if quantity > source_sl.quantity:
            return Response(
                {'error': f'Transfer quantity ({quantity}) exceeds available stock at {from_branch.name} ({source_sl.quantity}).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                # Deduct from source immediately
                StockLevel.objects.filter(pk=source_sl.pk).update(
                    quantity=models.F('quantity') - quantity
                )

                transfer = StockTransfer.objects.create(
                    item=item,
                    from_branch=from_branch,
                    to_branch=to_branch,
                    quantity=quantity,
                    date=date_str,
                    notes=notes,
                    status=StockTransfer.STATUS_INITIATED,
                )

                return Response(
                    {
                        'message': (
                            f'Transfer initiated: {quantity} {item.uom} of '
                            f'"{item.sku} {item.name}" is now in transit from '
                            f'{from_branch.name} to {to_branch.name}. '
                            f'Awaiting confirmation from {to_branch.name}.'
                        ),
                        'transfer': StockTransferSerializer(transfer).data,
                    },
                    status=status.HTTP_201_CREATED,
                )
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """
        Confirm receipt of an in-transit transfer.

        Payload:
        {
          "notes": "optional receipt notes"
        }

        Adds the transferred quantity to the destination branch's StockLevel.
        Updates status to 'received'.
        """
        transfer = self.get_object()

        if transfer.status == StockTransfer.STATUS_RECEIVED:
            return Response({'error': 'This transfer has already been received.'}, status=status.HTTP_400_BAD_REQUEST)
        if transfer.status == StockTransfer.STATUS_CANCELLED:
            return Response({'error': 'This transfer was cancelled and cannot be received.'}, status=status.HTTP_400_BAD_REQUEST)

        received_notes = request.data.get('notes', '')

        try:
            with transaction.atomic():
                # Credit destination branch
                dest_sl, _ = StockLevel.objects.get_or_create(
                    item=transfer.item,
                    branch=transfer.to_branch,
                    defaults={'quantity': Decimal('0'), 'threshold': Decimal('0')},
                )
                StockLevel.objects.filter(pk=dest_sl.pk).update(
                    quantity=models.F('quantity') + transfer.quantity
                )

                transfer.status = StockTransfer.STATUS_RECEIVED
                transfer.received_at = timezone.now()
                transfer.received_notes = received_notes
                transfer.save(update_fields=['status', 'received_at', 'received_notes'])

                return Response(
                    {
                        'message': (
                            f'Receipt confirmed: {transfer.quantity} {transfer.item.uom} of '
                            f'"{transfer.item.sku} {transfer.item.name}" added to {transfer.to_branch.name}.'
                        ),
                        'transfer': StockTransferSerializer(transfer).data,
                    },
                    status=status.HTTP_200_OK,
                )
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an initiated/in-transit transfer and return stock to source branch.
        """
        transfer = self.get_object()

        if transfer.status == StockTransfer.STATUS_RECEIVED:
            return Response({'error': 'Cannot cancel a transfer that has already been received.'}, status=status.HTTP_400_BAD_REQUEST)
        if transfer.status == StockTransfer.STATUS_CANCELLED:
            return Response({'error': 'Transfer is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Return stock to source
                source_sl, _ = StockLevel.objects.get_or_create(
                    item=transfer.item,
                    branch=transfer.from_branch,
                    defaults={'quantity': Decimal('0'), 'threshold': Decimal('0')},
                )
                StockLevel.objects.filter(pk=source_sl.pk).update(
                    quantity=models.F('quantity') + transfer.quantity
                )

                transfer.status = StockTransfer.STATUS_CANCELLED
                transfer.save(update_fields=['status'])

                return Response(
                    {
                        'message': f'Transfer cancelled. {transfer.quantity} {transfer.item.uom} returned to {transfer.from_branch.name}.',
                        'transfer': StockTransferSerializer(transfer).data,
                    },
                    status=status.HTTP_200_OK,
                )
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
