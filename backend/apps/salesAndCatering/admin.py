from django.contrib import admin
from .models import CateringEvent, SalesOrder, SalesItem


@admin.register(CateringEvent)
class CateringEventAdmin(admin.ModelAdmin):
    list_display = ['kitchen_sheet_number', 'client_name', 'event_date', 'package_type', 'pax', 'status', 'prep_branch']
    list_filter = ['status', 'package_type', 'prep_branch']
    search_fields = ['client_name', 'venue', 'kitchen_sheet_number']
    ordering = ['-event_date']
    filter_horizontal = ['items_ordered']


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'branch', 'type', 'total_amount', 'order_date']
    list_filter = ['type', 'branch']
    ordering = ['-order_date']


@admin.register(SalesItem)
class SalesItemAdmin(admin.ModelAdmin):
    list_display = ['sales', 'menu_item', 'quantity']
