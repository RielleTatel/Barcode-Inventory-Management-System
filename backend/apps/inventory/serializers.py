from decimal import Decimal
from rest_framework import serializers
from .models import (
    Category, InventoryItem, StockLevel, StockAdjustment,
    StockTransfer, ConsumptionEntry, BOMEntry,
)
from apps.menusAndRecipes.models import MenuItem
from apps.branches.models import Branch


class CategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'items_count']
        read_only_fields = ['id']

    def get_items_count(self, obj):
        return obj.items.count()


# ── Branch Stock (per-branch) ─────────────────────────────────────────────────

class BranchStockSerializer(serializers.ModelSerializer):
    """Serialises one StockLevel record with its status."""
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_type = serializers.CharField(source='branch.branch_type', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = StockLevel
        fields = ['id', 'branch', 'branch_name', 'branch_type', 'quantity', 'threshold', 'status', 'last_updated']
        read_only_fields = ['id', 'last_updated']

    def get_status(self, obj):
        return obj.status


class BranchStockWriteSerializer(serializers.Serializer):
    """Used for nested writes when creating / updating an InventoryItem."""
    branch_id = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all(), source='branch')
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'))
    threshold = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), default=Decimal('0'))


# ── Inventory Item ────────────────────────────────────────────────────────────

class InventoryItemSerializer(serializers.ModelSerializer):
    """Full detail serialiser — used for create / retrieve / update."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    linked_menu_item_details = serializers.SerializerMethodField(read_only=True)
    branch_stocks = BranchStockSerializer(source='stock_levels', many=True, read_only=True)
    branch_stocks_write = BranchStockWriteSerializer(many=True, write_only=True, required=False)
    total_stock = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'sku', 'name', 'category', 'category_name', 'uom',
            'total_stock', 'stock_status',
            'branch_stocks', 'branch_stocks_write',
            'linked_menu_item', 'linked_menu_item_details',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_stock(self, obj):
        return str(obj.total_stock)

    def get_stock_status(self, obj):
        return obj.stock_status

    def get_linked_menu_item_details(self, obj):
        if obj.linked_menu_item:
            return {
                'id': obj.linked_menu_item.id,
                'sku': obj.linked_menu_item.sku,
                'name': obj.linked_menu_item.name,
                'price': str(obj.linked_menu_item.price),
            }
        return None

    def validate_sku(self, value):
        qs = InventoryItem.objects.filter(sku=value.upper())
        if self.instance:
            qs = qs.exclude(id=self.instance.id)
        if qs.exists():
            raise serializers.ValidationError("An inventory item with this SKU already exists")
        return value.upper()

    def _upsert_branch_stocks(self, instance, branch_stocks_data):
        seen_branch_ids = set()
        for entry in branch_stocks_data:
            branch = entry['branch']
            seen_branch_ids.add(branch.id)
            StockLevel.objects.update_or_create(
                item=instance,
                branch=branch,
                defaults={
                    'quantity': entry['quantity'],
                    'threshold': entry.get('threshold', Decimal('0')),
                },
            )
        # Remove stock levels for branches not included in this update
        instance.stock_levels.exclude(branch_id__in=seen_branch_ids).delete()

    def create(self, validated_data):
        branch_stocks_data = validated_data.pop('branch_stocks_write', [])
        instance = super().create(validated_data)
        self._upsert_branch_stocks(instance, branch_stocks_data)
        return instance

    def update(self, instance, validated_data):
        branch_stocks_data = validated_data.pop('branch_stocks_write', None)
        instance = super().update(instance, validated_data)
        if branch_stocks_data is not None:
            self._upsert_branch_stocks(instance, branch_stocks_data)
        return instance


class InventoryItemListSerializer(serializers.ModelSerializer):
    """Lighter serialiser for the inventory table list."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    linked_menu_item_details = serializers.SerializerMethodField(read_only=True)
    total_stock = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()
    branch_stocks = BranchStockSerializer(source='stock_levels', many=True, read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'sku', 'name', 'category', 'category_name', 'uom',
            'total_stock', 'stock_status', 'branch_stocks',
            'linked_menu_item_details', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_total_stock(self, obj):
        return str(obj.total_stock)

    def get_stock_status(self, obj):
        return obj.stock_status

    def get_linked_menu_item_details(self, obj):
        if obj.linked_menu_item:
            return {
                'id': obj.linked_menu_item.id,
                'sku': obj.linked_menu_item.sku,
                'name': obj.linked_menu_item.name,
                'price': str(obj.linked_menu_item.price),
            }
        return None


# ── Stock Level ───────────────────────────────────────────────────────────────

class StockLevelSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    item_uom = serializers.CharField(source='item.uom', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = StockLevel
        fields = [
            'id', 'branch', 'branch_name', 'item', 'item_name', 'item_sku',
            'item_uom', 'quantity', 'threshold', 'status', 'last_updated',
        ]
        read_only_fields = ['id', 'last_updated']

    def get_status(self, obj):
        return obj.status


# ── Stock Adjustment ──────────────────────────────────────────────────────────

class StockAdjustmentSerializer(serializers.ModelSerializer):
    stock_item_name = serializers.CharField(source='stock.item.name', read_only=True)
    branch_name = serializers.CharField(source='stock.branch.name', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = ['id', 'stock', 'stock_item_name', 'branch_name', 'type', 'quantity_change', 'reason', 'date']
        read_only_fields = ['id', 'date']


# ── Stock Transfer ────────────────────────────────────────────────────────────

class StockTransferSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    item_uom = serializers.CharField(source='item.uom', read_only=True)
    from_branch_name = serializers.CharField(source='from_branch.name', read_only=True)
    to_branch_name = serializers.CharField(source='to_branch.name', read_only=True)

    class Meta:
        model = StockTransfer
        fields = [
            'id', 'item', 'item_name', 'item_sku', 'item_uom',
            'from_branch', 'from_branch_name',
            'to_branch', 'to_branch_name',
            'quantity', 'status',
            'date', 'notes',
            'transferred_at', 'received_at', 'received_notes',
        ]
        read_only_fields = ['id', 'status', 'transferred_at', 'received_at']


# ── BOM / Consumption ─────────────────────────────────────────────────────────

class BOMEntrySerializer(serializers.ModelSerializer):
    inventory_item_sku = serializers.CharField(source='inventory_item.sku', read_only=True, default='')

    class Meta:
        model = BOMEntry
        fields = [
            'id', 'menu_item_name', 'menu_item_sku', 'units_sold',
            'ingredient_name', 'quantity_deducted', 'unit',
            'inventory_item', 'inventory_item_sku', 'inventory_matched',
        ]
        read_only_fields = fields


class ConsumptionEntrySerializer(serializers.ModelSerializer):
    bom_entries = BOMEntrySerializer(many=True, read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True, default='')

    class Meta:
        model = ConsumptionEntry
        fields = ['id', 'date', 'branch', 'branch_name', 'notes', 'submitted_at', 'bom_entries']
        read_only_fields = ['id', 'submitted_at', 'bom_entries']


class ConsumptionEntryListSerializer(serializers.ModelSerializer):
    bom_count = serializers.SerializerMethodField()
    branch_name = serializers.CharField(source='branch.name', read_only=True, default='')

    class Meta:
        model = ConsumptionEntry
        fields = ['id', 'date', 'branch', 'branch_name', 'notes', 'submitted_at', 'bom_count']
        read_only_fields = fields

    def get_bom_count(self, obj):
        return obj.bom_entries.count()
