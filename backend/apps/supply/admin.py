from django.contrib import admin
from .models import Supplier, Delivery, DeliveryItem


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['supplier_code', 'name', 'category', 'contact_person', 'phone', 'is_archived']
    list_filter = ['is_archived', 'category']
    search_fields = ['name', 'category', 'contact_person']
    ordering = ['name']


class DeliveryItemInline(admin.TabularInline):
    model = DeliveryItem
    extra = 0
    readonly_fields = ['item', 'quantity_received', 'cost']


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['id', 'supplier', 'branch', 'dr_number', 'received_date', 'received_by', 'created_at']
    list_filter = ['branch', 'supplier', 'received_date']
    search_fields = ['dr_number', 'supplier__name', 'received_by']
    ordering = ['-received_date']
    inlines = [DeliveryItemInline]
    readonly_fields = ['created_at', 'updated_at']
