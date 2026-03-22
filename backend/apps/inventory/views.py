from decimal import Decimal
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models, transaction
from django.utils import timezone

from .models import Category, InventoryItem, StockLevel, StockAdjustment, StockTransfer, ConsumptionEntry, BOMEntry
from .serializers import (
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


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for inventory categories (Raw Materials, Prepared Items)"""
    
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
                {"error": "Cannot delete category with existing inventory items. Please reassign or delete items first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """ViewSet for inventory items CRUD operations"""
    
    queryset = InventoryItem.objects.select_related('category').prefetch_related('stock_levels__branch', 'branches')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['sku', 'name', 'category__name']
    ordering_fields = ['sku', 'name', 'created_at', 'min_stock_level']
    ordering = ['sku']

    def get_serializer_class(self):
        if self.action == 'list':
            return InventoryItemListSerializer
        return InventoryItemSerializer

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get inventory items filtered by category name"""
        category_name = request.query_params.get('name', None)
        if not category_name:
            return Response(
                {"error": "Category name is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.filter_queryset(
            self.get_queryset().filter(category__name__icontains=category_name)
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get all items that are at or below minimum stock level"""
        items = []
        for item in self.get_queryset():
            total_stock = sum(
                float(sl.quantity) for sl in item.stock_levels.all()
            )
            if total_stock <= float(item.min_stock_level):
                items.append(item)
        
        serializer = InventoryItemListSerializer(items, many=True)
        return Response(serializer.data)


class StockLevelViewSet(viewsets.ModelViewSet):
    """ViewSet for stock levels per branch"""
    
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
        """Get all stock levels for a specific branch"""
        branch_id = request.query_params.get('branch_id', None)
        if not branch_id:
            return Response(
                {"error": "branch_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(branch_id=branch_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    """ViewSet for stock adjustments (wastage, spoilage, corrections)"""
    
    queryset = StockAdjustment.objects.select_related('stock__item', 'stock__branch').all()
    serializer_class = StockAdjustmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stock', 'type']
    search_fields = ['stock__item__name', 'reason']
    ordering_fields = ['date', 'quantity_change']
    ordering = ['-date']


def _match_inventory_item(ingredient_name: str):
    """
    Try to match a free-text ingredient name to an InventoryItem.
    Strategy (in order):
      1. Exact SKU match — ingredient_name starts with "<SKU>" or "<SKU> - "
      2. Case-insensitive full-name match on InventoryItem.name
    Returns the matched InventoryItem or None.
    """
    if not ingredient_name:
        return None

    # Extract leading token (handles "RM-005 Longanisa" or "RM-005 - Longanisa")
    first_token = ingredient_name.split()[0].rstrip('-').strip()
    try:
        return InventoryItem.objects.get(sku__iexact=first_token)
    except (InventoryItem.DoesNotExist, InventoryItem.MultipleObjectsReturned):
        pass

    # Fallback: match by exact item name
    try:
        return InventoryItem.objects.get(name__iexact=ingredient_name.strip())
    except (InventoryItem.DoesNotExist, InventoryItem.MultipleObjectsReturned):
        return None


class ConsumptionEntryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read — list / retrieve ConsumptionEntries with their BOM lines.
    Write — POST to /consumption/submit/ to record a shift submission.
    """
    queryset = ConsumptionEntry.objects.prefetch_related('bom_entries__inventory_item').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['submitted_at', 'date']
    ordering = ['-submitted_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ConsumptionEntryListSerializer
        return ConsumptionEntrySerializer

    @action(detail=False, methods=['get'])
    def bom(self, request):
        """Flat list of all BOM entries — used for the BOM data table."""
        qs = BOMEntry.objects.select_related(
            'consumption', 'inventory_item'
        ).order_by('-consumption__submitted_at', 'menu_item_sku', 'ingredient_name')
        serializer = BOMEntrySerializer(qs, many=True)

        # Attach date / branch_name from parent for each row
        data = []
        for entry, row in zip(qs, serializer.data):
            data.append({
                **row,
                'date': str(entry.consumption.date),
                'branch_name': entry.consumption.branch_name,
                'consumption_id': entry.consumption.id,
                'submitted_at': entry.consumption.submitted_at.isoformat(),
            })
        return Response(data)

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """
        Submit an end-of-shift consumption entry.

        Expected payload:
        {
          "date": "2026-03-21",
          "branch_name": "Branch 1",
          "notes": "...",
          "menu_items_sold": [
            {"menu_item_id": 3, "units_sold": 5},
            ...
          ]
        }
        """
        date_str = request.data.get('date')
        branch_name = request.data.get('branch_name', '')
        notes = request.data.get('notes', '')
        menu_items_sold = request.data.get('menu_items_sold', [])

        if not date_str:
            return Response({'error': 'date is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not menu_items_sold:
            return Response({'error': 'menu_items_sold cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                entry = ConsumptionEntry.objects.create(
                    date=date_str,
                    branch_name=branch_name,
                    notes=notes,
                )

                bom_rows = []
                # inventory_item_id -> total deduction amount
                deductions: dict[int, Decimal] = {}

                for sold in menu_items_sold:
                    menu_item_id = sold.get('menu_item_id')
                    units_sold_raw = sold.get('units_sold', 0)
                    try:
                        units_sold = Decimal(str(units_sold_raw))
                    except Exception:
                        continue
                    if units_sold <= 0:
                        continue

                    try:
                        menu_item = MenuItem.objects.get(id=menu_item_id)
                    except MenuItem.DoesNotExist:
                        continue

                    # 1. Deduct the prepared dish itself from inventory
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
                        pass  # No prepared-item inventory entry for this menu item

                    # 2. Deduct raw materials from recipe
                    recipes = Recipe.objects.filter(menu_item=menu_item)
                    for recipe in recipes:
                        qty_deducted = units_sold * recipe.quantity_required
                        inv_item = _match_inventory_item(recipe.ingredient_name)
                        matched = inv_item is not None

                        if inv_item:
                            deductions[inv_item.id] = deductions.get(inv_item.id, Decimal('0')) + qty_deducted

                        bom_rows.append(BOMEntry(
                            consumption=entry,
                            menu_item_name=menu_item.name,
                            menu_item_sku=menu_item.sku,
                            units_sold=units_sold,
                            ingredient_name=recipe.ingredient_name,
                            quantity_deducted=qty_deducted,
                            unit=recipe.unit,
                            inventory_item=inv_item,
                            inventory_matched=matched,
                        ))

                BOMEntry.objects.bulk_create(bom_rows)

                # Apply deductions to inventory
                for item_id, total in deductions.items():
                    InventoryItem.objects.filter(id=item_id).update(
                        current_stock=models.F('current_stock') - total
                    )

                serializer = ConsumptionEntrySerializer(entry)
                return Response(
                    {
                        'message': (
                            f'Submission saved. {len(bom_rows)} BOM lines recorded, '
                            f'{len(deductions)} inventory items deducted.'
                        ),
                        'entry': serializer.data,
                        'unmatched': [
                            r.ingredient_name for r in bom_rows if not r.inventory_matched
                        ],
                    },
                    status=status.HTTP_201_CREATED,
                )
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class StockTransferViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET  /inventory/transfers/         — list all transfer logs
    GET  /inventory/transfers/{id}/    — retrieve one log
    POST /inventory/transfers/submit/  — create a transfer
    """
    queryset = StockTransfer.objects.select_related(
        'item', 'from_branch', 'to_branch'
    ).all()
    serializer_class = StockTransferSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['item', 'from_branch', 'to_branch']
    ordering_fields = ['transferred_at', 'date']
    ordering = ['-transferred_at']

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """
        Transfer stock between branches.

        Payload:
        {
          "item_id": 5,
          "from_branch_id": 1,
          "to_branch_id": 2,
          "quantity": 10,
          "date": "2026-03-21",
          "notes": "optional"
        }

        Effects:
        - Ensures destination branch is added to item.branches
        - Removes source branch from item.branches if quantity == current_stock
          (full transfer). For partial transfers the source branch stays.
        - Logs a StockTransfer record.
        """
        item_id = request.data.get('item_id')
        from_branch_id = request.data.get('from_branch_id')
        to_branch_id = request.data.get('to_branch_id')
        quantity_raw = request.data.get('quantity')
        date_str = request.data.get('date')
        notes = request.data.get('notes', '')

        # ── validation ──────────────────────────────────────────────────
        if not all([item_id, from_branch_id, to_branch_id, quantity_raw, date_str]):
            return Response(
                {'error': 'item_id, from_branch_id, to_branch_id, quantity and date are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if from_branch_id == to_branch_id:
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
            from apps.branches.models import Branch as BranchModel
            item = InventoryItem.objects.get(id=item_id)
            from_branch = BranchModel.objects.get(id=from_branch_id)
            to_branch = BranchModel.objects.get(id=to_branch_id)
        except InventoryItem.DoesNotExist:
            return Response({'error': 'Inventory item not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'error': 'Invalid branch.'}, status=status.HTTP_400_BAD_REQUEST)

        if quantity > item.current_stock:
            return Response(
                {'error': f'Transfer quantity ({quantity}) exceeds current stock ({item.current_stock}).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                # Log the transfer
                transfer = StockTransfer.objects.create(
                    item=item,
                    from_branch=from_branch,
                    to_branch=to_branch,
                    quantity=quantity,
                    date=date_str,
                    notes=notes,
                )

                # Update branch assignments
                item.branches.add(to_branch)
                # Full transfer → remove source branch
                if quantity >= item.current_stock:
                    item.branches.remove(from_branch)

                serializer = StockTransferSerializer(transfer)
                return Response(
                    {
                        'message': (
                            f'Transfer recorded: {quantity} {item.uom} of '
                            f'"{item.sku} {item.name}" from {from_branch.name} to {to_branch.name}.'
                        ),
                        'transfer': serializer.data,
                    },
                    status=status.HTTP_201_CREATED,
                )
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
