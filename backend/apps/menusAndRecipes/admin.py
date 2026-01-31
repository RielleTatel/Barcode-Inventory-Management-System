from django.contrib import admin
from .models import MenuCategory, MenuItem, Recipe


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name', 'menu_category', 'price', 'is_available_cafe']
    list_filter = ['menu_category', 'is_available_cafe', 'created_at']
    search_fields = ['sku', 'name']
    ordering = ['sku']


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['menu_item', 'inventory_item', 'quantity_required']
    list_filter = ['menu_item__menu_category']
    search_fields = ['menu_item__name', 'inventory_item__name']
    autocomplete_fields = ['menu_item', 'inventory_item']