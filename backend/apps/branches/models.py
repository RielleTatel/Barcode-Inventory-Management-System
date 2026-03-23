from django.db import models


class Branch(models.Model):
    BRANCH_TYPES = (
        ('kitchen', 'Full-Service Restaurant'),
        ('cafe_only', 'Resto Café (No Cooking)'),
    )

    name = models.CharField(max_length=100)
    branch_type = models.CharField(max_length=20, choices=BRANCH_TYPES)
    address = models.TextField(blank=True, default='')
    contact_number = models.CharField(max_length=50, blank=True, default='')
    is_active = models.BooleanField(
        default=True,
        help_text='Inactive branches are hidden from dashboards',
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.branch_type})"
