from django.db import models
from apps.inventory.models import InventoryItem


class MenuCategory(models.Model):
    """Categories for menu items (e.g., Silog Express, Beef Viands, Cater to Go)"""
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name_plural = "Menu Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """Menu items that can be ordered"""
    sku = models.CharField(max_length=50, unique=True)  # Menu SKU e.g., "MN-BF-01"
    name = models.CharField(max_length=200)  # e.g., "Beef Curry"
    menu_category = models.ForeignKey(MenuCategory, on_delete=models.PROTECT, related_name='menu_items')
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Selling Price
    is_available_cafe = models.BooleanField(default=True)  # Defines if sold at Café
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sku']
    
    def __str__(self):
        return f"{self.sku} - {self.name}"


class Recipe(models.Model):
    """Bill of Materials - Links menu items to inventory ingredients"""
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='recipes')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='used_in_recipes')  # The raw ingredient link
    quantity_required = models.DecimalField(max_digits=10, decimal_places=3)  # Amount used per 1 order
    
    class Meta:
        unique_together = ['menu_item', 'inventory_item']
        ordering = ['menu_item__sku']
    
    def __str__(self):
        return f"{self.menu_item.name} - {self.inventory_item.name}: {self.quantity_required} {self.inventory_item.uom}"