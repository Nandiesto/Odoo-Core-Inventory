from django.conf import settings
from django.db import models
from django.utils import timezone


# ──────────────────────────────────────────────
#  Product & Category
# ──────────────────────────────────────────────

class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    class UnitOfMeasure(models.TextChoices):
        UNIT = 'unit', 'Unit'
        KG = 'kg', 'Kilogram'
        LITRE = 'litre', 'Litre'
        METRE = 'metre', 'Metre'
        BOX = 'box', 'Box'
        PACK = 'pack', 'Pack'

    name = models.CharField(max_length=200)
    sku = models.CharField('SKU / Code', max_length=60, unique=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='products',
    )
    unit_of_measure = models.CharField(
        max_length=20, choices=UnitOfMeasure.choices, default=UnitOfMeasure.UNIT,
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.sku})'

    @property
    def total_stock(self):
        return self.stock_levels.aggregate(total=models.Sum('quantity'))['total'] or 0


# ──────────────────────────────────────────────
#  Warehouse & Location
# ──────────────────────────────────────────────

class Warehouse(models.Model):
    name = models.CharField(max_length=120, unique=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Location(models.Model):
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.CASCADE, related_name='locations',
    )
    name = models.CharField(max_length=120)

    class Meta:
        unique_together = ('warehouse', 'name')
        ordering = ['warehouse__name', 'name']

    def __str__(self):
        return f'{self.warehouse.name} / {self.name}'


# ──────────────────────────────────────────────
#  Stock Level (per product per location)
# ──────────────────────────────────────────────

class StockLevel(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='stock_levels',
    )
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name='stock_levels',
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ('product', 'location')

    def __str__(self):
        return f'{self.product.sku} @ {self.location}: {self.quantity}'


# ──────────────────────────────────────────────
#  Reorder Rule
# ──────────────────────────────────────────────

class ReorderRule(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='reorder_rules',
    )
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.CASCADE, related_name='reorder_rules',
    )
    min_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reorder_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ('product', 'warehouse')

    def __str__(self):
        return f'Reorder {self.product.sku}: min={self.min_quantity}'


# ──────────────────────────────────────────────
#  Operations – Receipts (Incoming)
# ──────────────────────────────────────────────

class Receipt(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        WAITING = 'waiting', 'Waiting'
        READY = 'ready', 'Ready'
        DONE = 'done', 'Done'
        CANCELLED = 'cancelled', 'Cancelled'

    reference = models.CharField(max_length=60, unique=True)
    supplier = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name='receipts',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    scheduled_date = models.DateField(default=timezone.now)
    validated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.reference


class ReceiptLine(models.Model):
    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f'{self.product.sku} x {self.quantity}'


# ──────────────────────────────────────────────
#  Operations – Delivery Orders (Outgoing)
# ──────────────────────────────────────────────

class DeliveryOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        WAITING = 'waiting', 'Waiting'
        READY = 'ready', 'Ready'
        DONE = 'done', 'Done'
        CANCELLED = 'cancelled', 'Cancelled'

    reference = models.CharField(max_length=60, unique=True)
    customer = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name='delivery_orders',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    scheduled_date = models.DateField(default=timezone.now)
    validated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.reference


class DeliveryLine(models.Model):
    delivery_order = models.ForeignKey(
        DeliveryOrder, on_delete=models.CASCADE, related_name='lines',
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f'{self.product.sku} x {self.quantity}'


# ──────────────────────────────────────────────
#  Operations – Internal Transfer
# ──────────────────────────────────────────────

class InternalTransfer(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        WAITING = 'waiting', 'Waiting'
        READY = 'ready', 'Ready'
        DONE = 'done', 'Done'
        CANCELLED = 'cancelled', 'Cancelled'

    reference = models.CharField(max_length=60, unique=True)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    from_location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name='transfers_out',
    )
    to_location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name='transfers_in',
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    scheduled_date = models.DateField(default=timezone.now)
    validated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.reference


# ──────────────────────────────────────────────
#  Operations – Stock Adjustment
# ──────────────────────────────────────────────

class StockAdjustment(models.Model):
    class Reason(models.TextChoices):
        DAMAGE = 'damage', 'Damaged Goods'
        CORRECTION = 'correction', 'Inventory Correction'
        LOSS = 'loss', 'Loss / Shrinkage'
        OTHER = 'other', 'Other'

    reference = models.CharField(max_length=60, unique=True)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    location = models.ForeignKey(Location, on_delete=models.PROTECT)
    recorded_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    counted_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=20, choices=Reason.choices, default=Reason.CORRECTION)
    notes = models.TextField(blank=True)
    adjusted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def difference(self):
        return self.counted_quantity - self.recorded_quantity

    def __str__(self):
        return self.reference


# ──────────────────────────────────────────────
#  Stock Ledger (Move History)
# ──────────────────────────────────────────────

class StockMove(models.Model):
    class MoveType(models.TextChoices):
        RECEIPT = 'receipt', 'Receipt'
        DELIVERY = 'delivery', 'Delivery'
        TRANSFER = 'transfer', 'Internal Transfer'
        ADJUSTMENT = 'adjustment', 'Adjustment'

    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='moves')
    move_type = models.CharField(max_length=20, choices=MoveType.choices)
    reference = models.CharField(max_length=60)
    from_location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='+',
    )
    to_location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='+',
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.move_type} | {self.product.sku} x {self.quantity}'
