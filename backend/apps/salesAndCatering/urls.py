from rest_framework.routers import DefaultRouter
from .views import CateringEventViewSet, MenuItemForCateringViewSet

router = DefaultRouter()
router.register(r'events', CateringEventViewSet, basename='catering-event')
router.register(r'dishes', MenuItemForCateringViewSet, basename='catering-dish')

urlpatterns = router.urls
