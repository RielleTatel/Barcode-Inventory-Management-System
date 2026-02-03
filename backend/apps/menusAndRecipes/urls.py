from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuCategoryViewSet, MenuItemViewSet, RecipeViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'categories', MenuCategoryViewSet, basename='menu-category')
router.register(r'items', MenuItemViewSet, basename='menu-item')
router.register(r'recipes', RecipeViewSet, basename='recipe')

urlpatterns = [
    path('', include(router.urls)),
]


