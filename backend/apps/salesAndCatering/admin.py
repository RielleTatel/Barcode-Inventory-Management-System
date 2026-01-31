from django.contrib import admin
from .models import SalesOrder, SalesItem, CateringEvent


class SalesItemInline(admin.TabularInline):
    model = SalesItem
    extra = 1
    autocomplete_fields = ['menu_item']
    readonly_fields = ['subtotal']
    
    def subtotal(self, obj):
        if obj.id:
            return f"${obj.subtotal}"
        return "-"
    subtotal.short_description = 'Subtotal'


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'branch', 'type', 'total_amount', 'order_date']
    list_filter = ['type', 'branch', 'order_date']
    search_fields = ['id', 'branch__name']
    readonly_fields = ['order_date', 'created_at', 'updated_at']
    inlines = [SalesItemInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('branch')


@admin.register(SalesItem)
class SalesItemAdmin(admin.ModelAdmin):
    list_display = ['sales', 'menu_item', 'quantity', 'subtotal']
    list_filter = ['menu_item__menu_category', 'sales__type']
    search_fields = ['menu_item__name', 'sales__id']
    autocomplete_fields = ['sales', 'menu_item']


@admin.register(CateringEvent)
class CateringEventAdmin(admin.ModelAdmin):
    list_display = ['client_name', 'event_date', 'status', 'prep_branch', 'sales']
    list_filter = ['status', 'prep_branch', 'event_date']
    search_fields = ['client_name', 'sales__id']
    readonly_fields = ['sales']
    date_hierarchy = 'event_date'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('sales', 'prep_branch')
