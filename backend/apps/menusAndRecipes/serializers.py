from rest_framework import serializers
from .models import MenuCategory, MenuItem, Recipe


class MenuCategorySerializer(serializers.ModelSerializer):

    menu_items_count = serializers.SerializerMethodField()

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'menu_items_count']
        read_only_fields = ['id']

    def get_menu_items_count(self, obj):
        return obj.menu_items.count()


class RecipeSerializer(serializers.ModelSerializer):

    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_sku = serializers.CharField(source='menu_item.sku', read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id',
            'menu_item',
            'menu_item_name',
            'menu_item_sku',
            'ingredient_name',
            'unit',
            'quantity_required',
        ]
        read_only_fields = ['id']

    def validate(self, data):
        if 'quantity_required' in data and data['quantity_required'] <= 0:
            raise serializers.ValidationError("Quantity required must be greater than 0")
        return data


class MenuItemSerializer(serializers.ModelSerializer):

    menu_category_name = serializers.CharField(source='menu_category.name', read_only=True)
    recipes = RecipeSerializer(many=True, read_only=True)
    recipe_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = [
            'id',
            'sku',
            'name',
            'menu_category',
            'menu_category_name',
            'price',
            'is_available_cafe',
            'recipe_count',
            'recipes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_recipe_count(self, obj):

        return obj.recipes.count()
    
    def validate_sku(self, value):

        if self.instance:  # Update
            if MenuItem.objects.exclude(id=self.instance.id).filter(sku=value).exists():
                raise serializers.ValidationError("A menu item with this SKU already exists")
        else:  # Create
            if MenuItem.objects.filter(sku=value).exists():
                raise serializers.ValidationError("A menu item with this SKU already exists")
        
        return value.upper()
    
    def validate_price(self, value):

        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value


class MenuItemListSerializer(serializers.ModelSerializer):

    menu_category_name = serializers.CharField(source='menu_category.name', read_only=True)
    recipe_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = [
            'id',
            'sku',
            'name',
            'menu_category',
            'menu_category_name',
            'price',
            'is_available_cafe',
            'recipe_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_recipe_count(self, obj):

        return obj.recipes.count()


class RecipeCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Recipe
        fields = ['id', 'menu_item', 'ingredient_name', 'unit', 'quantity_required']
        read_only_fields = ['id']

    def validate_quantity_required(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity required must be greater than 0")
        return value

    def validate_ingredient_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Ingredient name is required")
        return value.strip()
