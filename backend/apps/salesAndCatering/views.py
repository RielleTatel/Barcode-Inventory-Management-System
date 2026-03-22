from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import CateringEvent
from .serializers import (
    CateringEventSerializer,
    CateringEventListSerializer,
    KitchenSheetSerializer,
)
from apps.menusAndRecipes.models import MenuItem
from apps.menusAndRecipes.serializers import MenuItemSerializer


class CateringEventViewSet(viewsets.ModelViewSet):
    """
    CRUD for catering events.

    GET  /catering/events/                    — list (table view)
    GET  /catering/events/{id}/               — detail
    POST /catering/events/                    — create
    PATCH/PUT /catering/events/{id}/          — update
    DELETE /catering/events/{id}/             — delete
    GET  /catering/events/{id}/kitchen_sheet/ — kitchen sheet data
    GET  /catering/menu_items/                — available menu items for the dropdown
    """
    queryset = CateringEvent.objects.prefetch_related(
        'items_ordered', 'items_ordered__recipes',
    ).select_related('prep_branch').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'package_type', 'prep_branch']
    search_fields = ['client_name', 'venue', 'kitchen_sheet_number']
    ordering_fields = ['event_date', 'created_at', 'client_name', 'status']
    ordering = ['-event_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return CateringEventListSerializer
        return CateringEventSerializer

    @action(detail=True, methods=['get'])
    def kitchen_sheet(self, request, pk=None):
        """Return the full kitchen sheet data for a catering event."""
        event = self.get_object()
        return Response(KitchenSheetSerializer(event).data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Quick status update endpoint."""
        event = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in CateringEvent.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        event.status = new_status
        event.save(update_fields=['status', 'updated_at'])
        return Response(CateringEventSerializer(event).data)


class MenuItemForCateringViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /catering/dishes/ — simple list of all menu items for the catering dish dropdown.
    """
    queryset = MenuItem.objects.select_related('menu_category').all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sku', 'name', 'menu_category__name']
    ordering = ['sku']
