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
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2)
    branches = models.ManyToManyField(
        Branch,
        blank=True,
        related_name='available_inventory_items',
        help_text='Branches where this item is available',
    )
    linked_menu_item = models.ForeignKey(
        'menusAndRecipes.MenuItem',
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='inventory_items',
        help_text='Link to menu item for Prepared Items category'
    )
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


class StockTransfer(models.Model):
    """Records a stock transfer between branches."""
    item = models.ForeignKey(
        InventoryItem, on_delete=models.CASCADE, related_name='transfers'
    )
    from_branch = models.ForeignKey(
        Branch, on_delete=models.PROTECT, related_name='transfers_out'
    )
    to_branch = models.ForeignKey(
        Branch, on_delete=models.PROTECT, related_name='transfers_in'
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    notes = models.TextField(blank=True, default='')
    transferred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-transferred_at']

    def __str__(self):
        return (
            f"{self.item.sku} | {self.from_branch.name} → {self.to_branch.name} "
            f"× {self.quantity} on {self.date}"
        )


class ConsumptionEntry(models.Model):
    """Header record for one end-of-shift submission."""
    date = models.DateField()
    branch_name = models.CharField(max_length=200, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Consumption #{self.id} — {self.date} ({self.branch_name})"


class BOMEntry(models.Model):
    """One deducted ingredient line inside a ConsumptionEntry."""
    consumption = models.ForeignKey(
        ConsumptionEntry, on_delete=models.CASCADE, related_name='bom_entries'
    )
    menu_item_name = models.CharField(max_length=200)
    menu_item_sku = models.CharField(max_length=50)
    units_sold = models.DecimalField(max_digits=10, decimal_places=2)
    ingredient_name = models.CharField(max_length=200)
    quantity_deducted = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=50, blank=True, default='')
    inventory_item = models.ForeignKey(
        InventoryItem, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='bom_entries',
    )
    inventory_matched = models.BooleanField(default=False)

    class Meta:
        ordering = ['menu_item_sku', 'ingredient_name']

    def __str__(self):
        return (
            f"{self.menu_item_name} × {self.units_sold} → "
            f"{self.ingredient_name}: -{self.quantity_deducted} {self.unit}"
        )
