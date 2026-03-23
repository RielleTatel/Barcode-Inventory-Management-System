from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UomPresetViewSet,
    CategoryViewSet,
    InventoryItemViewSet,
    StockLevelViewSet,
    StockAdjustmentViewSet,
    ConsumptionEntryViewSet,
    StockTransferViewSet,
)

router = DefaultRouter()
router.register(r'uoms', UomPresetViewSet, basename='inventory-uom')
router.register(r'categories', CategoryViewSet, basename='inventory-category')
router.register(r'items', InventoryItemViewSet, basename='inventory-item')
router.register(r'stock-levels', StockLevelViewSet, basename='stock-level')
router.register(r'adjustments', StockAdjustmentViewSet, basename='stock-adjustment')
router.register(r'consumption', ConsumptionEntryViewSet, basename='consumption')
router.register(r'transfers', StockTransferViewSet, basename='stock-transfer')

urlpatterns = [
    path('', include(router.urls)),
]

