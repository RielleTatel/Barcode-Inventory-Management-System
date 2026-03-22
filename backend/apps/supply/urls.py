from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, DeliveryViewSet

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'deliveries', DeliveryViewSet, basename='delivery')

urlpatterns = router.urls
