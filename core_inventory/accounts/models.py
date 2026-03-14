from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role and phone support."""

    class Role(models.TextChoices):
        MANAGER = 'manager', 'Inventory Manager'
        STAFF = 'staff', 'Warehouse Staff'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF,
    )
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.get_full_name() or self.username
