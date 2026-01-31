from django.contrib import admin
from .models import TransferRequest, TransferItem


class TransferItemInline(admin.TabularInline):
    model = TransferItem
    extra = 1
    autocomplete_fields = ['item']


@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'source_branch', 'dest_branch', 'status', 'requested_by', 'created_at']
    list_filter = ['status', 'source_branch', 'dest_branch', 'created_at']
    search_fields = ['source_branch__name', 'dest_branch__name', 'requested_by__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [TransferItemInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('source_branch', 'dest_branch', 'requested_by')


@admin.register(TransferItem)
class TransferItemAdmin(admin.ModelAdmin):
    list_display = ['transfer', 'item', 'quantity']
    list_filter = ['transfer__status', 'item__category']
    search_fields = ['item__name', 'transfer__id']
    autocomplete_fields = ['transfer', 'item']
