from decimal import Decimal, InvalidOperation
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models, transaction

from .models import Supplier, Delivery, DeliveryItem
from .serializers import (
    SupplierSerializer,
    DeliverySerializer,
    DeliveryListSerializer,
    DeliveryItemWriteSerializer,
)
from apps.inventory.models import InventoryItem, StockLevel
from apps.branches.models import Branch


# ── Supplier Directory ────────────────────────────────────────────────────────

class SupplierViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for the Supplier Directory.
    Soft-delete via PATCH { is_archived: true } — never hard-delete.

    GET  /supply/suppliers/          — list (active only by default)
    GET  /supply/suppliers/?all=1    — include archived
    GET  /supply/suppliers/{id}/
    POST /supply/suppliers/
    PATCH /supply/suppliers/{id}/
    DELETE /supply/suppliers/{id}/   — NOT exposed; archive instead
    """
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'category', 'contact_person']
    ordering_fields = ['name', 'category', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        show_all = self.request.query_params.get('all', '0') == '1'
        if show_all:
            return Supplier.objects.all()
        return Supplier.objects.filter(is_archived=False)

    def destroy(self, request, *args, **kwargs):
        # Prevent accidental hard-deletes from the API; archive instead
        return Response(
            {'error': 'Suppliers cannot be deleted. Archive them instead by sending PATCH { "is_archived": true }.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        supplier = self.get_object()
        supplier.is_archived = True
        supplier.save(update_fields=['is_archived', 'updated_at'])
        return Response(SupplierSerializer(supplier).data)

    @action(detail=True, methods=['patch'])
    def restore(self, request, pk=None):
        supplier = self.get_object()
        supplier.is_archived = False
        supplier.save(update_fields=['is_archived', 'updated_at'])
        return Response(SupplierSerializer(supplier).data)


# ── Receive Delivery ──────────────────────────────────────────────────────────

class DeliveryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Purchase History — read-only from the UI.
    Only the /receive/ action creates records (and updates StockLevel).

    GET  /supply/deliveries/          — list
    GET  /supply/deliveries/{id}/     — detail with full item list
    POST /supply/deliveries/receive/  — THE handshake action
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['supplier', 'branch']
    search_fields = ['dr_number', 'supplier__name', 'received_by']
    ordering_fields = ['received_date', 'created_at']
    ordering = ['-received_date']

    def get_queryset(self):
        qs = Delivery.objects.select_related('supplier', 'branch').prefetch_related(
            'delivery_items__item__category'
        )
        # Optional date range filters
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(received_date__gte=date_from)
        if date_to:
            qs = qs.filter(received_date__lte=date_to)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DeliverySerializer
        return DeliveryListSerializer

    @action(detail=False, methods=['post'])
    def receive(self, request):
        """
        The "Receive Delivery" handshake.

        Payload:
        {
          "supplier_id": 1,
          "branch_id": 2,
          "dr_number": "DR-0042",         // optional
          "received_date": "2026-03-21",
          "received_by": "Chef Juan",      // optional
          "notes": "...",                  // optional
          "items": [
            { "item_id": 5, "quantity_received": 20, "cost": 280 },
            ...
          ]
        }

        Simultaneously:
        1. Creates a Delivery record + DeliveryItem lines (the log / evidence)
        2. Updates (or creates) the branch-specific StockLevel for each item
        """
        supplier_id = request.data.get('supplier_id')
        branch_id = request.data.get('branch_id')
        dr_number = request.data.get('dr_number', '')
        received_date = request.data.get('received_date')
        received_by = request.data.get('received_by', '')
        notes = request.data.get('notes', '')
        items_raw = request.data.get('items', [])

        # ── Validation ────────────────────────────────────────────────────────
        if not supplier_id:
            return Response({'error': 'supplier_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not branch_id:
            return Response({'error': 'branch_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not received_date:
            return Response({'error': 'received_date is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not items_raw:
            return Response({'error': 'items list cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        item_serializers = [DeliveryItemWriteSerializer(data=i) for i in items_raw]
        for s in item_serializers:
            if not s.is_valid():
                return Response({'error': f'Invalid item data: {s.errors}'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            supplier = Supplier.objects.get(id=supplier_id, is_archived=False)
        except Supplier.DoesNotExist:
            return Response({'error': 'Supplier not found or is archived'}, status=status.HTTP_404_NOT_FOUND)
        try:
            branch = Branch.objects.get(id=branch_id)
        except Branch.DoesNotExist:
            return Response({'error': 'Branch not found'}, status=status.HTTP_404_NOT_FOUND)

        # Resolve inventory items upfront
        item_data_list = []
        for s in item_serializers:
            vd = s.validated_data
            try:
                inv_item = InventoryItem.objects.get(id=vd['item_id'])
            except InventoryItem.DoesNotExist:
                return Response({'error': f"Inventory item {vd['item_id']} not found"}, status=status.HTTP_404_NOT_FOUND)
            item_data_list.append((inv_item, vd['quantity_received'], vd['cost']))

        # ── Atomic handshake ──────────────────────────────────────────────────
        try:
            with transaction.atomic():
                delivery = Delivery.objects.create(
                    supplier=supplier,
                    branch=branch,
                    dr_number=dr_number,
                    received_date=received_date,
                    received_by=received_by,
                    notes=notes,
                )

                for inv_item, qty, cost in item_data_list:
                    # 1. Log the delivery item
                    DeliveryItem.objects.create(
                        delivery=delivery,
                        item=inv_item,
                        quantity_received=qty,
                        cost=cost,
                    )
                    # 2. Add to branch StockLevel
                    sl, _ = StockLevel.objects.get_or_create(
                        item=inv_item,
                        branch=branch,
                        defaults={'quantity': Decimal('0'), 'threshold': Decimal('0')},
                    )
                    StockLevel.objects.filter(pk=sl.pk).update(
                        quantity=models.F('quantity') + qty
                    )

                return Response(
                    {
                        'message': (
                            f'Delivery received: {len(item_data_list)} item(s) added to '
                            f'{branch.name} from {supplier.name}. '
                            f'Stock levels updated.'
                        ),
                        'delivery': DeliverySerializer(delivery).data,
                    },
                    status=status.HTTP_201_CREATED,
                )
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
