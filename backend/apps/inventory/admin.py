from django.contrib import admin
from .models import Category, InventoryItem, StockLevel, StockAdjustment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name', 'category', 'uom', 'min_stock_level']
    list_filter = ['category', 'created_at']
    search_fields = ['sku', 'name']
    ordering = ['sku']


@admin.register(StockLevel)
class StockLevelAdmin(admin.ModelAdmin):
    list_display = ['item', 'branch', 'quantity', 'last_updated']
    list_filter = ['branch', 'last_updated']
    search_fields = ['item__name', 'branch__name']


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ['stock', 'type', 'quantity_change', 'date']
    list_filter = ['type', 'date']
    search_fields = ['reason', 'stock__item__name']
    readonly_fields = ['date']

