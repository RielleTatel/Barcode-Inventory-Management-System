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
        return f"Order #{self.id} - {self.branch.name} ({self.type}) - ${self.total_amount}"


class SalesItem(models.Model):
    """Individual menu items in a sales order"""
    sales = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='sales_items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT, related_name='sales_items')
    quantity = models.IntegerField()  # How many ordered
    
    class Meta:
        unique_together = ['sales', 'menu_item']
    
    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"
    
    @property
    def subtotal(self):
        return self.menu_item.price * self.quantity


class CateringEvent(models.Model):
    """Extension for bulk catering orders"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
    )
    
    sales = models.OneToOneField(SalesOrder, on_delete=models.CASCADE, related_name='catering_event')
    client_name = models.CharField(max_length=200)
    event_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    prep_branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='catering_events')  # Which kitchen is cooking
    
    class Meta:
        ordering = ['-event_date']
    
    def __str__(self):
        return f"Catering: {self.client_name} - {self.event_date.date()} ({self.status})"
