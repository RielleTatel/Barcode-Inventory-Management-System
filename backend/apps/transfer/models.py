from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from apps.branches.models import Branch
from apps.inventory.models import InventoryItem


class TransferRequest(models.Model):
    """Requests for moving items between branches (Kitchen to Café)"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    )
    4
    source_branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='outgoing_transfers')  # Where stock comes from (Kitchen)
    dest_branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='incoming_transfers')  # Where stock goes (Café)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='transfer_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Transfer #{self.id}: {self.source_branch.name} → {self.dest_branch.name} ({self.status})"


class TransferItem(models.Model):
    """Individual items in a transfer request"""
    transfer = models.ForeignKey(TransferRequest, on_delete=models.CASCADE, related_name='transfer_items')
    item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='transfer_items')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        unique_together = ['transfer', 'item']
    
    def __str__(self):
        return f"{self.item.name}: {self.quantity} {self.item.uom}"
