from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction

from .models import MenuCategory, MenuItem, Recipe

from .serializers import (
    MenuCategorySerializer,
    MenuItemSerializer,
    MenuItemListSerializer,
    RecipeSerializer,
    RecipeCreateSerializer
)

class MenuCategoryViewSet(viewsets.ModelViewSet):

    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'id']
    ordering = ['name']
    
    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()
        if instance.menu_items.exists():
            return Response(
                {"error": "Cannot delete category with existing menu items. Please reassign or delete menu items first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class MenuItemViewSet(viewsets.ModelViewSet):

    queryset = MenuItem.objects.select_related('menu_category').prefetch_related('recipes__inventory_item')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['menu_category', 'is_available_cafe']
    search_fields = ['sku', 'name', 'menu_category__name']
    ordering_fields = ['sku', 'name', 'price', 'created_at']
    ordering = ['sku']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MenuItemListSerializer
        return MenuItemSerializer
    
    @action(detail=False, methods=['get'])
    def with_recipes(self, request):
        """Get all menu items with their recipes included"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = MenuItemSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def recipes(self, request, pk=None):
        """Get all recipes for a specific menu item"""
        menu_item = self.get_object()
        recipes = menu_item.recipes.all()
        serializer = RecipeSerializer(recipes, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete menu item (recipes will cascade delete)"""
        return super().destroy(request, *args, **kwargs)


class RecipeViewSet(viewsets.ModelViewSet):

    queryset = Recipe.objects.select_related('menu_item', 'inventory_item').all()
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['menu_item', 'inventory_item']
    search_fields = ['menu_item__name', 'menu_item__sku', 'inventory_item__name', 'inventory_item__sku']
    ordering_fields = ['menu_item__sku', 'quantity_required']
    ordering = ['menu_item__sku']
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):

        recipes_data = request.data.get('recipes', [])
        
        if not recipes_data:
            return Response(
                {"error": "No recipes provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = RecipeCreateSerializer(data=recipes_data, many=True)
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    recipes = serializer.save()
                    response_serializer = RecipeSerializer(recipes, many=True)
                    return Response(
                        {
                            "message": f"Successfully created {len(recipes)} recipes",
                            "recipes": response_serializer.data
                        },
                        status=status.HTTP_201_CREATED
                    )
            except Exception as e:
                return Response(
                    {"error": f"Error creating recipes: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['put'])
    def bulk_update(self, request):
        """
        Update all recipes for a menu item
        Expected format: {"menu_item": 1, "recipes": [{"inventory_item": 2, "quantity_required": 0.5}, ...]}
        """
        menu_item_id = request.data.get('menu_item')
        recipes_data = request.data.get('recipes', [])
        
        if not menu_item_id:
            return Response(
                {"error": "menu_item is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            menu_item = MenuItem.objects.get(id=menu_item_id)
        except MenuItem.DoesNotExist:
            return Response(
                {"error": "Menu item not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            with transaction.atomic():

                menu_item.recipes.all().delete()
                
                recipes = []
                for recipe_data in recipes_data:
                    recipe_data['menu_item'] = menu_item_id
                    serializer = RecipeCreateSerializer(data=recipe_data)
                    
                    if serializer.is_valid():
                        recipes.append(serializer.save())
                    else:
                        raise Exception(f"Invalid recipe data: {serializer.errors}")
                
                response_serializer = RecipeSerializer(recipes, many=True)
                return Response(
                    {
                        "message": f"Successfully updated recipes for {menu_item.name}",
                        "recipes": response_serializer.data
                    },
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            return Response(
                {"error": f"Error updating recipes: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """
        Delete multiple recipes
        Expected format: {"recipe_ids": [1, 2, 3]}
        """
        recipe_ids = request.data.get('recipe_ids', [])
        
        if not recipe_ids:
            return Response(
                {"error": "No recipe IDs provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            deleted_count, _ = Recipe.objects.filter(id__in=recipe_ids).delete()
            return Response(
                {"message": f"Successfully deleted {deleted_count} recipes"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Error deleting recipes: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


