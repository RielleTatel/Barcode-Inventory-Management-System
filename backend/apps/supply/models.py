from django.db import models
from apps.branches.models import Branch
from apps.inventory.models import InventoryItem


class Supplier(models.Model):
    """Suppliers for external deliveries"""
    name = models.CharField(max_length=200)  # e.g., "Zamboanga Meat Market"
    contact_info = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Delivery(models.Model):
    """Tracks external deliveries from suppliers"""
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='deliveries')
    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='deliveries')
    dr_number = models.CharField(max_length=100)  # Delivery Receipt #
    received_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-received_date']
        unique_together = ['supplier', 'dr_number']  # Prevent duplicate DR numbers per supplier
    
    def __str__(self):
        return f"DR #{self.dr_number} - {self.supplier.name} to {self.branch.name}"
    
    @property
    def total_cost(self):
        return sum(item.total_cost for item in self.delivery_items.all())


class DeliveryItem(models.Model):
    """Individual items in a delivery"""
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='delivery_items')
    item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='delivery_items')
    quantity_received = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2)  # Cost per unit
    
    class Meta:
        unique_together = ['delivery', 'item']
    
    def __str__(self):
        return f"{self.item.name}: {self.quantity_received} {self.item.uom} @ ${self.cost}"
    
    @property
    def total_cost(self):
        return self.quantity_received * self.cost
