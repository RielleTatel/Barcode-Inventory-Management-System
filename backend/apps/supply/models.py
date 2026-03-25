from django.db import models
from apps.branches.models import Branch


class Supplier(models.Model):
    """
    Supplier Directory — the "Who."
    Soft-delete via is_archived; never hard-delete so purchase history stays intact.
    """
    name = models.CharField(max_length=200)
    # Legacy column — kept so the NOT NULL DB constraint is satisfied.
    # No longer exposed in the API; new fields below replace it.
    contact_info = models.TextField(blank=True, default='')
    category = models.CharField(
        max_length=100, blank=True, default='',
        help_text='E.g. "Meat Supplier", "Fresh Produce", "Beverages"',
    )
    contact_person = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    payment_terms = models.CharField(
        max_length=100, blank=True, default='',
        help_text='E.g. "COD", "Net 15 Days"',
    )
    lead_time_days = models.PositiveSmallIntegerField(
        default=1, help_text='Typical delivery lead time in days'
    )
    notes = models.TextField(blank=True, default='')
    is_archived = models.BooleanField(
        default=False,
        help_text='Archive instead of deleting to preserve purchase history',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        status = ' [Archived]' if self.is_archived else ''
        return f"{self.name}{status}"

    @property
    def supplier_code(self):
        return f"SUP-{self.id:04d}"


class Delivery(models.Model):
    """
    Purchase History record — auto-created by the Receive Delivery action.
    Read-only from the UI after creation.
    """
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='deliveries')
    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='deliveries')
    dr_number = models.CharField(max_length=100, blank=True, default='')
    received_date = models.DateField()
    received_by = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-received_date', '-created_at']

    def __str__(self):
        return f"DR#{self.dr_number or self.id} — {self.supplier.name} → {self.branch.name} ({self.received_date})"

    @property
    def total_cost(self):
        return sum(item.total_cost for item in self.delivery_items.all())


class DeliveryItem(models.Model):
    """
    One supply item line inside a Delivery.
    Stores raw text fields (no FK to InventoryItem) so Supply is independent.
    """
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='delivery_items')
    item_name = models.CharField(max_length=200)
    item_sku = models.CharField(max_length=50)
    item_uom = models.CharField(max_length=20)
    item_category = models.CharField(max_length=100, blank=True, default='')
    quantity_received = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2, help_text='Cost per unit')
    
    # Legacy FK kept as nullable for old records; new records leave it null
    item = models.ForeignKey(
        'inventory.InventoryItem',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery_items',
    )

    def __str__(self):
        return f"{self.item_name}: {self.quantity_received} {self.item_uom} @ ₱{self.cost}"

    @property
    def total_cost(self):
        return self.quantity_received * self.cost
