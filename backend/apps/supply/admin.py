from django.contrib import admin
from .models import Supplier, Delivery, DeliveryItem


class DeliveryItemInline(admin.TabularInline):
    model = DeliveryItem
    extra = 1
    autocomplete_fields = ['item']
    readonly_fields = ['total_cost']
    
    def total_cost(self, obj):
        if obj.id:
            return f"${obj.total_cost}"
        return "-"
    total_cost.short_description = 'Total Cost'


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name', 'contact_info']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['dr_number', 'supplier', 'branch', 'received_date', 'total_cost']
    list_filter = ['supplier', 'branch', 'received_date']
    search_fields = ['dr_number', 'supplier__name', 'branch__name']
    readonly_fields = ['created_at', 'updated_at', 'total_cost']
    inlines = [DeliveryItemInline]
    date_hierarchy = 'received_date'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('supplier', 'branch')


@admin.register(DeliveryItem)
class DeliveryItemAdmin(admin.ModelAdmin):
    list_display = ['delivery', 'item', 'quantity_received', 'cost', 'total_cost']
    list_filter = ['item__category', 'delivery__received_date']
    search_fields = ['item__name', 'delivery__dr_number']
    autocomplete_fields = ['delivery', 'item']
