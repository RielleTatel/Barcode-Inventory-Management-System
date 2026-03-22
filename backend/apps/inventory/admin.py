from django.contrib import admin
from .models import (
    Category, InventoryItem, StockLevel, StockAdjustment,
    StockTransfer, ConsumptionEntry, BOMEntry,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name', 'category', 'uom', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['sku', 'name']
    ordering = ['sku']


@admin.register(StockLevel)
class StockLevelAdmin(admin.ModelAdmin):
    list_display = ['item', 'branch', 'quantity', 'threshold', 'last_updated']
    list_filter = ['branch', 'last_updated']
    search_fields = ['item__name', 'branch__name']


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ['stock', 'type', 'quantity_change', 'date']
    list_filter = ['type', 'date']
    search_fields = ['reason', 'stock__item__name']
    readonly_fields = ['date']


@admin.register(StockTransfer)
class StockTransferAdmin(admin.ModelAdmin):
    list_display = ['item', 'from_branch', 'to_branch', 'quantity', 'status', 'date', 'transferred_at']
    list_filter = ['status', 'from_branch', 'to_branch']
    search_fields = ['item__sku', 'item__name']
    ordering = ['-transferred_at']


@admin.register(ConsumptionEntry)
class ConsumptionEntryAdmin(admin.ModelAdmin):
    list_display = ['id', 'date', 'branch', 'submitted_at']
    list_filter = ['branch', 'date']
    ordering = ['-submitted_at']


@admin.register(BOMEntry)
class BOMEntryAdmin(admin.ModelAdmin):
    list_display = ['menu_item_name', 'ingredient_name', 'quantity_deducted', 'unit', 'inventory_matched']
    list_filter = ['inventory_matched']
    search_fields = ['menu_item_name', 'ingredient_name']

