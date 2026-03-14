from rest_framework import serializers
from django.contrib.auth import get_user_model
from inventory.models import (
    Product, Category, Warehouse, Location, StockLevel,
    ReorderRule, Receipt, ReceiptLine, DeliveryOrder, DeliveryLine,
    InternalTransfer, StockAdjustment, StockMove,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 'phone']
        read_only_fields = ['id', 'username']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'staff'),
            phone=validated_data.get('phone', ''),
            password=validated_data['password']
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'product_count', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', default='—', read_only=True)
    uom_display = serializers.CharField(source='get_unit_of_measure_display', read_only=True)
    total_stock = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category', 'category_name',
            'unit_of_measure', 'uom_display', 'total_stock',
            'description', 'created_at', 'updated_at',
        ]


class ProductDetailSerializer(ProductListSerializer):
    stock_levels = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['stock_levels']

    def get_stock_levels(self, obj):
        return [
            {
                'location': str(sl.location),
                'location_id': sl.location_id,
                'quantity': float(sl.quantity),
            }
            for sl in obj.stock_levels.select_related('location__warehouse').all()
        ]


class WarehouseSerializer(serializers.ModelSerializer):
    locations = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'address', 'locations', 'created_at']

    def get_locations(self, obj):
        return [
            {'id': loc.id, 'name': loc.name}
            for loc in obj.locations.all()
        ]


class LocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = Location
        fields = ['id', 'name', 'warehouse', 'warehouse_name']


class ReorderRuleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = ReorderRule
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'warehouse', 'warehouse_name',
            'min_quantity', 'reorder_quantity',
        ]


# ── Receipt ──────────────────────────────────────────────────

class ReceiptLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = ReceiptLine
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity']


class ReceiptListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    location_display = serializers.CharField(source='location', read_only=True)
    created_by_name = serializers.CharField(source='created_by', read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id', 'reference', 'supplier', 'status', 'status_display',
            'location', 'location_display', 'created_by_name',
            'scheduled_date', 'validated_at', 'created_at', 'notes',
        ]


class ReceiptDetailSerializer(ReceiptListSerializer):
    lines = ReceiptLineSerializer(many=True, read_only=True)

    class Meta(ReceiptListSerializer.Meta):
        fields = ReceiptListSerializer.Meta.fields + ['lines']


# ── Delivery ─────────────────────────────────────────────────

class DeliveryLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = DeliveryLine
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity']


class DeliveryListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    location_display = serializers.CharField(source='location', read_only=True)

    class Meta:
        model = DeliveryOrder
        fields = [
            'id', 'reference', 'customer', 'status', 'status_display',
            'location', 'location_display',
            'scheduled_date', 'validated_at', 'created_at', 'notes',
        ]


class DeliveryDetailSerializer(DeliveryListSerializer):
    lines = DeliveryLineSerializer(many=True, read_only=True)

    class Meta(DeliveryListSerializer.Meta):
        fields = DeliveryListSerializer.Meta.fields + ['lines']


# ── Transfer ─────────────────────────────────────────────────

class TransferListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    from_location_display = serializers.CharField(source='from_location', read_only=True)
    to_location_display = serializers.CharField(source='to_location', read_only=True)

    class Meta:
        model = InternalTransfer
        fields = [
            'id', 'reference', 'product', 'product_name',
            'from_location', 'from_location_display',
            'to_location', 'to_location_display',
            'quantity', 'status', 'status_display',
            'scheduled_date', 'validated_at', 'created_at', 'notes',
        ]


# ── Adjustment ───────────────────────────────────────────────

class AdjustmentSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    location_display = serializers.CharField(source='location', read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    difference = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = StockAdjustment
        fields = [
            'id', 'reference', 'product', 'product_name',
            'location', 'location_display',
            'recorded_quantity', 'counted_quantity', 'difference',
            'reason', 'reason_display', 'notes', 'created_at',
        ]


# ── Stock Move ───────────────────────────────────────────────

class StockMoveSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    move_type_display = serializers.CharField(source='get_move_type_display', read_only=True)
    from_location_display = serializers.SerializerMethodField()
    to_location_display = serializers.SerializerMethodField()
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StockMove
        fields = [
            'id', 'product', 'product_name', 'move_type', 'move_type_display',
            'reference', 'from_location_display', 'to_location_display',
            'quantity', 'performed_by_name', 'timestamp',
        ]

    def get_from_location_display(self, obj):
        return str(obj.from_location) if obj.from_location else None

    def get_to_location_display(self, obj):
        return str(obj.to_location) if obj.to_location else None

    def get_performed_by_name(self, obj):
        return str(obj.performed_by) if obj.performed_by else None


# ── Dashboard ────────────────────────────────────────────────

class DashboardSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    low_stock_items = serializers.IntegerField()
    out_of_stock_items = serializers.IntegerField()
    pending_receipts = serializers.IntegerField()
    pending_deliveries = serializers.IntegerField()
    scheduled_transfers = serializers.IntegerField()
    low_stock_products = serializers.ListField()
    out_of_stock_products = serializers.ListField()
    recent_moves = StockMoveSerializer(many=True)
