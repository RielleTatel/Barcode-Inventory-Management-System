from decimal import Decimal
from rest_framework import serializers
from .models import Supplier, Delivery, DeliveryItem


class SupplierSerializer(serializers.ModelSerializer):
    supplier_code = serializers.SerializerMethodField()
    deliveries_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            'id', 'supplier_code', 'name', 'category',
            'contact_person', 'phone', 'email',
            'payment_terms', 'lead_time_days',
            'notes', 'is_archived',
            'deliveries_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'supplier_code', 'created_at', 'updated_at']

    def get_supplier_code(self, obj):
        return obj.supplier_code

    def get_deliveries_count(self, obj):
        return obj.deliveries.count()


class DeliveryItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    item_uom = serializers.CharField(source='item.uom', read_only=True)
    item_category = serializers.CharField(source='item.category.name', read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryItem
        fields = [
            'id', 'item', 'item_name', 'item_sku', 'item_uom', 'item_category',
            'quantity_received', 'cost', 'total_cost',
        ]
        read_only_fields = ['id']

    def get_total_cost(self, obj):
        return str(obj.total_cost)


class DeliveryItemWriteSerializer(serializers.Serializer):
    """Used for nested writes inside the receive endpoint."""
    item_id = serializers.IntegerField()
    quantity_received = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    cost = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'))


class DeliverySerializer(serializers.ModelSerializer):
    """Full detail — used for the Purchase History detail view."""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    delivery_items = DeliveryItemSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Delivery
        fields = [
            'id', 'supplier', 'supplier_name',
            'branch', 'branch_name',
            'dr_number', 'received_date', 'received_by', 'notes',
            'delivery_items', 'total_cost',
            'created_at',
        ]
        read_only_fields = fields

    def get_total_cost(self, obj):
        return str(obj.total_cost)


class DeliveryListSerializer(serializers.ModelSerializer):
    """Lightweight — used for the Purchase History table."""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    supplier_code = serializers.CharField(source='supplier.supplier_code', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    total_cost = serializers.SerializerMethodField()
    items_summary = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Delivery
        fields = [
            'id', 'supplier', 'supplier_name', 'supplier_code',
            'branch', 'branch_name',
            'dr_number', 'received_date', 'received_by', 'notes',
            'total_cost', 'items_summary', 'item_count',
            'created_at',
        ]
        read_only_fields = fields

    def get_total_cost(self, obj):
        return str(obj.total_cost)

    def get_items_summary(self, obj):
        return [
            f"{di.item.name} ({di.quantity_received} {di.item.uom})"
            for di in obj.delivery_items.select_related('item').all()
        ]

    def get_item_count(self, obj):
        return obj.delivery_items.count()
