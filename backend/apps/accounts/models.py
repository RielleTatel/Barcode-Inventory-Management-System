from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    status = models.BooleanField(default=False)

    POSITION_CHOICES = [
        ("manager", "Manager"),
        ("staff", "Staff"),
    ]
    
    position = models.CharField(
        max_length=20,
        choices=POSITION_CHOICES,
        default="staff"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

