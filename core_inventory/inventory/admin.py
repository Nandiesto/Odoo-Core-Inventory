from django.contrib import admin
from .models import (
    Category, Product, Warehouse, Location, StockLevel, ReorderRule,
    Receipt, ReceiptLine, DeliveryOrder, DeliveryLine,
    InternalTransfer, StockAdjustment, StockMove,
)


class ReceiptLineInline(admin.TabularInline):
    model = ReceiptLine
    extra = 1


class DeliveryLineInline(admin.TabularInline):
    model = DeliveryLine
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'unit_of_measure', 'total_stock')
    list_filter = ('category', 'unit_of_measure')
    search_fields = ('name', 'sku')


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'address')


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'warehouse')
    list_filter = ('warehouse',)


@admin.register(StockLevel)
class StockLevelAdmin(admin.ModelAdmin):
    list_display = ('product', 'location', 'quantity')
    list_filter = ('location__warehouse',)


@admin.register(ReorderRule)
class ReorderRuleAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'min_quantity', 'reorder_quantity')


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('reference', 'supplier', 'status', 'scheduled_date')
    list_filter = ('status',)
    inlines = [ReceiptLineInline]


@admin.register(DeliveryOrder)
class DeliveryOrderAdmin(admin.ModelAdmin):
    list_display = ('reference', 'customer', 'status', 'scheduled_date')
    list_filter = ('status',)
    inlines = [DeliveryLineInline]


@admin.register(InternalTransfer)
class InternalTransferAdmin(admin.ModelAdmin):
    list_display = ('reference', 'product', 'from_location', 'to_location', 'status')
    list_filter = ('status',)


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('reference', 'product', 'location', 'recorded_quantity', 'counted_quantity', 'reason')
    list_filter = ('reason',)


@admin.register(StockMove)
class StockMoveAdmin(admin.ModelAdmin):
    list_display = ('product', 'move_type', 'reference', 'quantity', 'timestamp')
    list_filter = ('move_type',)
