from rest_framework import serializers
from .models import Category, InventoryItem, StockLevel, StockAdjustment, ConsumptionEntry, BOMEntry
from apps.menusAndRecipes.models import MenuItem


class CategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'items_count']
        read_only_fields = ['id']

    def get_items_count(self, obj):
        return obj.items.count()


class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    linked_menu_item_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'sku',
            'name',
            'category',
            'category_name',
            'uom',
            'current_stock',
            'min_stock_level',
            'linked_menu_item',
            'linked_menu_item_details',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_linked_menu_item_details(self, obj):
        if obj.linked_menu_item:
            return {
                'id': obj.linked_menu_item.id,
                'sku': obj.linked_menu_item.sku,
                'name': obj.linked_menu_item.name,
                'price': str(obj.linked_menu_item.price)
            }
        return None

    def validate_sku(self, value):
        if self.instance:
            if InventoryItem.objects.exclude(id=self.instance.id).filter(sku=value).exists():
                raise serializers.ValidationError("An inventory item with this SKU already exists")
        else:
            if InventoryItem.objects.filter(sku=value).exists():
                raise serializers.ValidationError("An inventory item with this SKU already exists")
        return value.upper()

    def validate_current_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Current stock cannot be negative")
        return value

    def validate_min_stock_level(self, value):
        if value < 0:
            raise serializers.ValidationError("Minimum stock level cannot be negative")
        return value


class InventoryItemListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    status = serializers.SerializerMethodField()
    linked_menu_item_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id',
            'sku',
            'name',
            'category',
            'category_name',
            'uom',
            'current_stock',
            'min_stock_level',
            'status',
            'linked_menu_item_details',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_status(self, obj):
        current = float(obj.current_stock)
        min_level = float(obj.min_stock_level)

        if current <= 0:
            return "Out of Stock"
        elif current <= min_level:
            return "Low Stock"
        else:
            return "In Stock"

    def get_linked_menu_item_details(self, obj):
        if obj.linked_menu_item:
            return {
                'id': obj.linked_menu_item.id,
                'sku': obj.linked_menu_item.sku,
                'name': obj.linked_menu_item.name,
                'price': str(obj.linked_menu_item.price)
            }
        return None


class StockLevelSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    item_uom = serializers.CharField(source='item.uom', read_only=True)

    class Meta:
        model = StockLevel
        fields = [
            'id',
            'branch',
            'branch_name',
            'item',
            'item_name',
            'item_sku',
            'item_uom',
            'quantity',
            'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


class StockAdjustmentSerializer(serializers.ModelSerializer):
    stock_item_name = serializers.CharField(source='stock.item.name', read_only=True)
    branch_name = serializers.CharField(source='stock.branch.name', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = [
            'id',
            'stock',
            'stock_item_name',
            'branch_name',
            'type',
            'quantity_change',
            'reason',
            'date'
        ]
        read_only_fields = ['id', 'date']


class BOMEntrySerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.CharField(source='inventory_item.sku', read_only=True, default='')

    class Meta:
        model = BOMEntry
        fields = [
            'id',
            'menu_item_name',
            'menu_item_sku',
            'units_sold',
            'ingredient_name',
            'quantity_deducted',
            'unit',
            'inventory_item',
            'inventory_item_sku',
            'inventory_matched',
        ]
        read_only_fields = fields


class ConsumptionEntrySerializer(serializers.ModelSerializer):
    bom_entries = BOMEntrySerializer(many=True, read_only=True)

    class Meta:
        model = ConsumptionEntry
        fields = [
            'id',
            'date',
            'branch_name',
            'notes',
            'submitted_at',
            'bom_entries',
        ]
        read_only_fields = ['id', 'submitted_at', 'bom_entries']


class ConsumptionEntryListSerializer(serializers.ModelSerializer):
    bom_count = serializers.SerializerMethodField()

    class Meta:
        model = ConsumptionEntry
        fields = ['id', 'date', 'branch_name', 'notes', 'submitted_at', 'bom_count']
        read_only_fields = fields

    def get_bom_count(self, obj):
        return obj.bom_entries.count()

