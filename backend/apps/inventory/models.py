from django.db import models
from django.utils import timezone
from apps.branches.models import Branch


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    """
    Master Product record — the "What."
    Contains information that never changes regardless of location.
    Per-branch stock & thresholds live in StockLevel.
    """
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='items')
    uom = models.CharField(max_length=20)
    linked_menu_item = models.ForeignKey(
        'menusAndRecipes.MenuItem',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory_items',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sku']

    def __str__(self):
        return f"{self.sku} - {self.name}"

    @property
    def total_stock(self):
        """Sum of all branch stock levels."""
        result = self.stock_levels.aggregate(total=models.Sum('quantity'))
        return result['total'] or 0

    @property
    def stock_status(self):
        """
        Aggregate status:
        - 'Out of Stock'  if total == 0
        - 'Low Stock'     if any branch is at or below its threshold
        - 'In Stock'      otherwise
        """
        levels = self.stock_levels.all()
        if not levels.exists():
            return 'Out of Stock'
        total = sum(float(lvl.quantity) for lvl in levels)
        if total <= 0:
            return 'Out of Stock'
        if any(float(lvl.quantity) <= float(lvl.threshold) for lvl in levels):
            return 'Low Stock'
        return 'In Stock'


class StockLevel(models.Model):
    """
    Branch Stock — the "Where and How Many."
    One record per Product–Branch combination.
    """
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='stock_levels')
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='stock_levels')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    threshold = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text='Minimum quantity before a low-stock alert is raised for this branch',
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['branch', 'item']

    @property
    def status(self):
        q, t = float(self.quantity), float(self.threshold)
        if q <= 0:
            return 'Out of Stock'
        if q <= t:
            return 'Low Stock'
        return 'In Stock'

    def __str__(self):
        return f"{self.item.sku} @ {self.branch.name}: {self.quantity} {self.item.uom}"


class StockAdjustment(models.Model):
    ADJUSTMENT_TYPES = (
        ('wastage', 'Wastage'),
        ('spoilage', 'Spoilage'),
        ('manual_correction', 'Manual Correction'),
    )

    stock = models.ForeignKey(StockLevel, on_delete=models.CASCADE, related_name='adjustments')
    type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPES)
    quantity_change = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.type} - {self.quantity_change} on {self.date}"


class StockTransfer(models.Model):
    """
    Transactional stock movement between branches.
    Status workflow: initiated → in_transit → received (or cancelled).
    """
    STATUS_INITIATED = 'initiated'
    STATUS_IN_TRANSIT = 'in_transit'
    STATUS_RECEIVED = 'received'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = (
        (STATUS_INITIATED, 'Initiated'),
        (STATUS_IN_TRANSIT, 'In Transit'),
        (STATUS_RECEIVED, 'Received'),
        (STATUS_CANCELLED, 'Cancelled'),
    )

    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='transfers')
    from_branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='transfers_out')
    to_branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='transfers_in')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_INITIATED)
    date = models.DateField()
    notes = models.TextField(blank=True, default='')
    transferred_at = models.DateTimeField(auto_now_add=True)
    received_at = models.DateTimeField(null=True, blank=True)
    received_notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-transferred_at']

    def __str__(self):
        return (
            f"{self.item.sku} | {self.from_branch.name} → {self.to_branch.name} "
            f"× {self.quantity} [{self.status}]"
        )


class ConsumptionEntry(models.Model):
    """Header record for one end-of-shift submission."""
    date = models.DateField()
    branch = models.ForeignKey(
        Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='consumption_entries'
    )
    notes = models.TextField(blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        branch_label = self.branch.name if self.branch else 'Unknown'
        return f"Consumption #{self.id} — {self.date} ({branch_label})"


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
