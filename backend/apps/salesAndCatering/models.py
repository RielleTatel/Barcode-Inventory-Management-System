from django.db import models
from apps.branches.models import Branch
from apps.menusAndRecipes.models import MenuItem


class SalesOrder(models.Model):
    """Tracks sales orders to trigger recipe logic"""
    ORDER_TYPES = (
        ('dine_in', 'Dine In'),
        ('takeout', 'Takeout'),
        ('catering', 'Catering'),
    )

    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='sales_orders')
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=20, choices=ORDER_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-order_date']

    def __str__(self):
        return f"Order #{self.id} - {self.branch.name} ({self.type}) - ₱{self.total_amount}"


class SalesItem(models.Model):
    """Individual menu items in a sales order"""
    sales = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='sales_items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT, related_name='sales_items')
    quantity = models.IntegerField()

    class Meta:
        unique_together = ['sales', 'menu_item']

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"

    @property
    def subtotal(self):
        return self.menu_item.price * self.quantity


class CateringEvent(models.Model):
    """
    Standalone catering order.
    Stores client details, event metadata, the dish list, and generates
    a Kitchen Sheet reference automatically.
    """
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    )

    PACKAGE_CHOICES = (
        ('basic', 'Basic'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('premium', 'Premium'),
        ('custom', 'Custom'),
    )

    client_name = models.CharField(max_length=200)
    contact_number = models.CharField(max_length=50, blank=True, default='')
    event_date = models.DateField()
    venue = models.CharField(max_length=300, blank=True, default='')
    pax = models.PositiveIntegerField(default=1, help_text='Number of guests')
    package_type = models.CharField(max_length=20, choices=PACKAGE_CHOICES, default='custom')
    items_ordered = models.ManyToManyField(
        MenuItem,
        blank=True,
        related_name='catering_events',
        help_text='Dishes included in this catering event',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    prep_branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='catering_prep_events',
        help_text='Kitchen branch responsible for this event',
    )
    notes = models.TextField(blank=True, default='')
    kitchen_sheet_number = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date', '-created_at']

    def __str__(self):
        return f"CAT-{self.id:04d} | {self.client_name} — {self.event_date} [{self.status}]"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.kitchen_sheet_number:
            self.kitchen_sheet_number = f"KS-{self.id:04d}"
            CateringEvent.objects.filter(pk=self.pk).update(kitchen_sheet_number=self.kitchen_sheet_number)
