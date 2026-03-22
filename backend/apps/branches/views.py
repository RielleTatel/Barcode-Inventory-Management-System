from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models as db_models

from .models import Branch
from .serializers import BranchSerializer


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all().order_by('name')
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        branch = serializer.save()
        return Response(
            {'message': 'Branch created successfully', 'data': BranchSerializer(branch).data},
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        branch = serializer.save()
        return Response({'message': 'Branch updated successfully', 'data': BranchSerializer(branch).data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Branch deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    # ── Per-branch dashboard ──────────────────────────────────────────────────

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """
        GET /api/branches/{id}/dashboard/
        Returns KPI data scoped to a single branch.
        """
        branch = self.get_object()

        # Lazy imports to avoid circular dependency
        from apps.inventory.models import StockLevel, StockTransfer
        from apps.supply.models import Delivery

        # ── Stock snapshot ────────────────────────────────────────────────────
        all_levels = (
            StockLevel.objects
            .filter(branch=branch)
            .select_related('item__category')
        )
        total_items = all_levels.count()
        out_of_stock_count = all_levels.filter(quantity__lte=0).count()
        items_in_stock = total_items - out_of_stock_count

        # Low stock = quantity > 0 AND quantity ≤ threshold AND threshold > 0
        low_levels = all_levels.filter(
            quantity__gt=0,
            quantity__lte=db_models.F('threshold'),
            threshold__gt=0,
        )
        low_stock_count = low_levels.count()

        low_stock_items = [
            {
                'item_id': sl.item.id,
                'sku': sl.item.sku,
                'name': sl.item.name,
                'category': sl.item.category.name,
                'uom': sl.item.uom,
                'quantity': float(sl.quantity),
                'threshold': float(sl.threshold),
                'status': sl.status,
            }
            for sl in low_levels.order_by('quantity')[:20]
        ]

        # Prepared food stock
        prepared_count = all_levels.filter(
            item__linked_menu_item__isnull=False,
            quantity__gt=0,
        ).count()
        if prepared_count == 0:
            prepared_count = all_levels.filter(
                item__category__name__icontains='prepared',
                quantity__gt=0,
            ).count()

        # ── Transfers ─────────────────────────────────────────────────────────
        pending_in = StockTransfer.objects.filter(
            to_branch=branch,
            status__in=[StockTransfer.STATUS_INITIATED, StockTransfer.STATUS_IN_TRANSIT],
        )
        pending_out = StockTransfer.objects.filter(
            from_branch=branch,
            status__in=[StockTransfer.STATUS_INITIATED, StockTransfer.STATUS_IN_TRANSIT],
        )
        pending_in_count = pending_in.count()
        pending_out_count = pending_out.count()

        pending_transfers = [
            {
                'id': t.id,
                'direction': 'in' if t.to_branch_id == branch.id else 'out',
                'item': f"{t.item.sku} — {t.item.name}",
                'quantity': float(t.quantity),
                'uom': t.item.uom,
                'other_branch': t.from_branch.name if t.to_branch_id == branch.id else t.to_branch.name,
                'status': t.status,
                'date': str(t.date),
            }
            for t in list(pending_in.select_related('item', 'from_branch', 'to_branch')[:5]) +
                      list(pending_out.select_related('item', 'from_branch', 'to_branch')[:5])
        ]

        # ── Recent deliveries ─────────────────────────────────────────────────
        deliveries = (
            Delivery.objects
            .filter(branch=branch)
            .select_related('supplier')
            .prefetch_related('delivery_items')
            .order_by('-received_date')[:5]
        )
        recent_deliveries = [
            {
                'id': d.id,
                'supplier': d.supplier.name,
                'dr_number': d.dr_number,
                'received_date': str(d.received_date),
                'item_count': d.delivery_items.count(),
                'total_cost': float(d.total_cost),
            }
            for d in deliveries
        ]

        return Response({
            'branch': {
                'id': branch.id,
                'name': branch.name,
                'branch_type': branch.branch_type,
                'address': branch.address,
            },
            'total_items': total_items,
            'items_in_stock': items_in_stock,
            'out_of_stock_count': out_of_stock_count,
            'low_stock_count': low_stock_count,
            'prepared_food_count': prepared_count,
            'pending_transfers_in': pending_in_count,
            'pending_transfers_out': pending_out_count,
            'low_stock_items': low_stock_items,
            'pending_transfers': pending_transfers,
            'recent_deliveries': recent_deliveries,
        })

    # ── Global (admin) dashboard ──────────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='global-dashboard')
    def global_dashboard(self, request):
        """
        GET /api/branches/global-dashboard/
        Returns company-wide KPIs plus a per-branch breakdown.
        """
        from apps.inventory.models import StockLevel, StockTransfer
        from apps.supply.models import Delivery

        branches = Branch.objects.all().order_by('name')

        # Global counts
        total_items_global = StockLevel.objects.values('item').distinct().count()
        low_stock_global = StockLevel.objects.filter(
            quantity__gt=0,
            quantity__lte=db_models.F('threshold'),
            threshold__gt=0,
        ).count()
        out_of_stock_global = StockLevel.objects.filter(quantity__lte=0).count()
        pending_transfers_global = StockTransfer.objects.filter(
            status__in=[StockTransfer.STATUS_INITIATED, StockTransfer.STATUS_IN_TRANSIT],
        ).count()

        # Per-branch breakdown
        branch_breakdown = []
        for branch in branches:
            levels = StockLevel.objects.filter(branch=branch)
            b_total = levels.count()
            b_low = levels.filter(
                quantity__gt=0,
                quantity__lte=db_models.F('threshold'),
                threshold__gt=0,
            ).count()
            b_out = levels.filter(quantity__lte=0).count()
            b_pending_in = StockTransfer.objects.filter(
                to_branch=branch,
                status__in=[StockTransfer.STATUS_INITIATED, StockTransfer.STATUS_IN_TRANSIT],
            ).count()
            b_pending_out = StockTransfer.objects.filter(
                from_branch=branch,
                status__in=[StockTransfer.STATUS_INITIATED, StockTransfer.STATUS_IN_TRANSIT],
            ).count()
            branch_breakdown.append({
                'id': branch.id,
                'name': branch.name,
                'branch_type': branch.branch_type,
                'total_items': b_total,
                'low_stock_count': b_low,
                'out_of_stock_count': b_out,
                'pending_in': b_pending_in,
                'pending_out': b_pending_out,
                'health': (
                    'critical' if b_out > 0 or b_low > 2 else
                    'warning' if b_low > 0 else
                    'healthy'
                ),
            })

        # Most critical low stock items across all branches
        all_low = (
            StockLevel.objects
            .filter(quantity__gt=0, quantity__lte=db_models.F('threshold'), threshold__gt=0)
            .select_related('item__category', 'branch')
            .order_by('quantity')[:15]
        )
        critical_items = [
            {
                'sku': sl.item.sku,
                'name': sl.item.name,
                'branch': sl.branch.name,
                'quantity': float(sl.quantity),
                'threshold': float(sl.threshold),
                'uom': sl.item.uom,
            }
            for sl in all_low
        ]

        # Recent deliveries across all branches
        recent_deliveries = []
        for d in Delivery.objects.select_related('supplier', 'branch').order_by('-received_date')[:8]:
            recent_deliveries.append({
                'id': d.id,
                'supplier': d.supplier.name,
                'branch': d.branch.name,
                'dr_number': d.dr_number,
                'received_date': str(d.received_date),
                'item_count': d.delivery_items.count(),
                'total_cost': float(d.total_cost),
            })

        return Response({
            'totals': {
                'total_items': total_items_global,
                'low_stock_count': low_stock_global,
                'out_of_stock_count': out_of_stock_global,
                'pending_transfers': pending_transfers_global,
            },
            'branch_breakdown': branch_breakdown,
            'critical_items': critical_items,
            'recent_deliveries': recent_deliveries,
        })
