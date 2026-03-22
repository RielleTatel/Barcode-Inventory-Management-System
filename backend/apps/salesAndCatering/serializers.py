from rest_framework import serializers
from .models import CateringEvent
from apps.menusAndRecipes.models import MenuItem
from apps.branches.models import Branch


class MenuItemSummarySerializer(serializers.ModelSerializer):
    menu_category_name = serializers.CharField(source='menu_category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = ['id', 'sku', 'name', 'price', 'menu_category_name']


class CateringEventSerializer(serializers.ModelSerializer):
    """Full serialiser — create / retrieve / update."""
    items_ordered_details = MenuItemSummarySerializer(source='items_ordered', many=True, read_only=True)
    items_ordered = serializers.PrimaryKeyRelatedField(
        many=True, queryset=MenuItem.objects.all(), required=False
    )
    prep_branch_name = serializers.CharField(source='prep_branch.name', read_only=True, default='')
    package_type_display = serializers.CharField(source='get_package_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CateringEvent
        fields = [
            'id',
            'client_name',
            'contact_number',
            'event_date',
            'venue',
            'pax',
            'package_type',
            'package_type_display',
            'items_ordered',
            'items_ordered_details',
            'status',
            'status_display',
            'prep_branch',
            'prep_branch_name',
            'notes',
            'kitchen_sheet_number',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'kitchen_sheet_number', 'created_at', 'updated_at']

    def validate_pax(self, value):
        if value < 1:
            raise serializers.ValidationError("Pax must be at least 1")
        return value


class CateringEventListSerializer(serializers.ModelSerializer):
    """Lighter serialiser for the table list view."""
    items_ordered_names = serializers.SerializerMethodField()
    prep_branch_name = serializers.CharField(source='prep_branch.name', read_only=True, default='')
    package_type_display = serializers.CharField(source='get_package_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CateringEvent
        fields = [
            'id',
            'client_name',
            'contact_number',
            'event_date',
            'venue',
            'pax',
            'package_type',
            'package_type_display',
            'items_ordered_names',
            'status',
            'status_display',
            'prep_branch',
            'prep_branch_name',
            'kitchen_sheet_number',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_items_ordered_names(self, obj):
        return [f"{item.sku} — {item.name}" for item in obj.items_ordered.all()]


class KitchenSheetSerializer(serializers.ModelSerializer):
    """Serialiser that includes full recipe/ingredient data for the Kitchen Sheet view."""
    items_with_recipes = serializers.SerializerMethodField()
    prep_branch_name = serializers.CharField(source='prep_branch.name', read_only=True, default='')
    package_type_display = serializers.CharField(source='get_package_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CateringEvent
        fields = [
            'id', 'client_name', 'contact_number', 'event_date', 'venue', 'pax',
            'package_type', 'package_type_display',
            'status', 'status_display',
            'prep_branch', 'prep_branch_name',
            'notes', 'kitchen_sheet_number',
            'items_with_recipes', 'created_at',
        ]

    def get_items_with_recipes(self, obj):
        result = []
        for item in obj.items_ordered.prefetch_related('recipes').all():
            result.append({
                'id': item.id,
                'sku': item.sku,
                'name': item.name,
                'price': str(item.price),
                'recipes': [
                    {
                        'ingredient_name': r.ingredient_name,
                        'quantity_required': str(r.quantity_required),
                        'unit': r.unit,
                    }
                    for r in item.recipes.all()
                ],
            })
        return result
