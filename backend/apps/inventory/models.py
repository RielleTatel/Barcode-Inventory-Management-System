from django.db import models
from apps.branches.models import Branch

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='items')
    uom = models.CharField(max_length=20)  
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sku']
    
    def __str__(self):
        return f"{self.sku} - {self.name}"


class StockLevel(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='stock_levels')
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='stock_levels')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['branch', 'item']
    
    def __str__(self):
        return f"{self.item.name} - {self.branch.name}: {self.quantity} {self.item.uom}"

class StockAdjustment(models.Model):
    ADJUSTMENT_TYPES = (
        ('wastage', 'Wastage'),
        ('spoilage', 'Spoilage'),
        ('manual_correction', 'Manual Correction'),
    )
    
    stock = models.ForeignKey(StockLevel, on_delete=models.CASCADE, related_name='adjustments')
    type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPES)
    quantity_change = models.DecimalField(max_digits=10, decimal_places=2)  # Negative for loss
    reason = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.type} - {self.quantity_change} on {self.date}"
