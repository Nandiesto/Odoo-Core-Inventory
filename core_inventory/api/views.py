from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.db.models import Sum, Q
from django.utils import timezone

from inventory.models import (
    Product, Category, Warehouse, Location, StockLevel,
    ReorderRule, Receipt, ReceiptLine, DeliveryOrder, DeliveryLine,
    InternalTransfer, StockAdjustment, StockMove,
)
from .serializers import (
    UserSerializer, CategorySerializer,
    ProductListSerializer, ProductDetailSerializer,
    WarehouseSerializer, LocationSerializer, ReorderRuleSerializer,
    ReceiptListSerializer, ReceiptDetailSerializer,
    DeliveryListSerializer, DeliveryDetailSerializer,
    TransferListSerializer, AdjustmentSerializer,
    StockMoveSerializer, RegisterSerializer,
)

from django.core.mail import send_mail
from django.conf import settings as app_settings
from accounts.otp import generate_otp, store_otp, verify_otp, clear_otp
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# ═══════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Automatically log them in by generating tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_otp_request(request):
    email = request.data.get('email', '')
    try:
        User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'No account found with that email.'}, status=status.HTTP_404_NOT_FOUND)

    otp = generate_otp()
    store_otp(email, otp)
    try:
        send_mail(
            subject='Your Password Reset OTP — Core Inventory',
            message=f'Your OTP code is: {otp}\n\nThis code expires in 5 minutes.',
            from_email=app_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'detail': 'OTP has been sent to your email.'})
    except Exception as e:
        return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_otp_verify(request):
    email = request.data.get('email', '')
    otp = request.data.get('otp', '')
    if verify_otp(email, otp):
        # We issue a temporary, special token using secret key to allow the user
        # to reset their password on the next step statelessly.
        import jwt
        temp_token = jwt.encode(
            {'email': email, 'exp': timezone.now().timestamp() + 300}, 
            app_settings.SECRET_KEY, 
            algorithm='HS256'
        )
        clear_otp(email)
        return Response({'temp_token': temp_token})
    return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_password_reset(request):
    temp_token = request.data.get('temp_token', '')
    new_password = request.data.get('new_password', '')
    if not temp_token or not new_password:
        return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        import jwt
        payload = jwt.decode(temp_token, app_settings.SECRET_KEY, algorithms=['HS256'])
        email = payload.get('email')
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password reset successful.'})
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Session expired. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
    except (jwt.InvalidTokenError, User.DoesNotExist):
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def api_current_user(request):
    if request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['PUT'])
def api_update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════

@api_view(['GET'])
def api_dashboard(request):
    total_products = Product.objects.count()

    low_stock_products = []
    out_of_stock_products = []
    for rule in ReorderRule.objects.select_related('product', 'warehouse'):
        total = StockLevel.objects.filter(
            product=rule.product,
            location__warehouse=rule.warehouse,
        ).aggregate(total=Sum('quantity'))['total'] or 0
        item = {
            'product_name': rule.product.name,
            'product_id': rule.product.pk,
            'warehouse_name': rule.warehouse.name,
            'quantity': float(total),
            'min_quantity': float(rule.min_quantity),
        }
        if total <= 0:
            out_of_stock_products.append(item)
        elif total <= rule.min_quantity:
            low_stock_products.append(item)

    pending_receipts = Receipt.objects.filter(status__in=['draft', 'waiting', 'ready']).count()
    pending_deliveries = DeliveryOrder.objects.filter(status__in=['draft', 'waiting', 'ready']).count()
    scheduled_transfers = InternalTransfer.objects.filter(status__in=['draft', 'waiting', 'ready']).count()

    recent_moves = StockMove.objects.select_related(
        'product', 'from_location', 'to_location', 'performed_by'
    )[:10]

    return Response({
        'total_products': total_products,
        'low_stock_items': len(low_stock_products),
        'out_of_stock_items': len(out_of_stock_products),
        'pending_receipts': pending_receipts,
        'pending_deliveries': pending_deliveries,
        'scheduled_transfers': scheduled_transfers,
        'low_stock_products': low_stock_products,
        'out_of_stock_products': out_of_stock_products,
        'recent_moves': StockMoveSerializer(recent_moves, many=True).data,
    })


# ═══════════════════════════════════════════════
#  PRODUCTS
# ═══════════════════════════════════════════════

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q')
        cat = self.request.query_params.get('category')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(sku__icontains=q))
        if cat:
            qs = qs.filter(category_id=cat)
        return qs


# ═══════════════════════════════════════════════
#  CATEGORIES
# ═══════════════════════════════════════════════

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# ═══════════════════════════════════════════════
#  WAREHOUSES & LOCATIONS
# ═══════════════════════════════════════════════

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.prefetch_related('locations').all()
    serializer_class = WarehouseSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.select_related('warehouse').all()
    serializer_class = LocationSerializer


# ═══════════════════════════════════════════════
#  REORDER RULES
# ═══════════════════════════════════════════════

class ReorderRuleViewSet(viewsets.ModelViewSet):
    queryset = ReorderRule.objects.select_related('product', 'warehouse').all()
    serializer_class = ReorderRuleSerializer


# ═══════════════════════════════════════════════
#  RECEIPTS
# ═══════════════════════════════════════════════

class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.select_related('location', 'created_by').all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ReceiptDetailSerializer
        return ReceiptListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)
        return qs

    @action(detail=True, methods=['post'])
    def validate_receipt(self, request, pk=None):
        receipt = self.get_object()
        if receipt.status == 'done':
            return Response({'error': 'Already validated'}, status=400)
        if receipt.status == 'cancelled':
            return Response({'error': 'Cannot validate cancelled receipt'}, status=400)

        for line in receipt.lines.select_related('product'):
            sl, _ = StockLevel.objects.get_or_create(
                product=line.product, location=receipt.location
            )
            sl.quantity += line.quantity
            sl.save()
            StockMove.objects.create(
                product=line.product,
                move_type='receipt',
                reference=receipt.reference,
                to_location=receipt.location,
                quantity=line.quantity,
                performed_by=request.user,
            )

        receipt.status = 'done'
        receipt.validated_at = timezone.now()
        receipt.save()
        return Response(ReceiptDetailSerializer(receipt).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        receipt = self.get_object()
        if receipt.status == 'done':
            return Response({'error': 'Cannot cancel validated receipt'}, status=400)
        receipt.status = 'cancelled'
        receipt.save()
        return Response(ReceiptDetailSerializer(receipt).data)


# ═══════════════════════════════════════════════
#  DELIVERIES
# ═══════════════════════════════════════════════

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOrder.objects.select_related('location', 'created_by').all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DeliveryDetailSerializer
        return DeliveryListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)
        return qs

    @action(detail=True, methods=['post'])
    def validate_delivery(self, request, pk=None):
        delivery = self.get_object()
        if delivery.status == 'done':
            return Response({'error': 'Already validated'}, status=400)
        if delivery.status == 'cancelled':
            return Response({'error': 'Cannot validate cancelled delivery'}, status=400)

        for line in delivery.lines.select_related('product'):
            try:
                sl = StockLevel.objects.get(product=line.product, location=delivery.location)
            except StockLevel.DoesNotExist:
                return Response({'error': f'No stock for {line.product.name}'}, status=400)
            if sl.quantity < line.quantity:
                return Response({'error': f'Insufficient stock for {line.product.name}'}, status=400)
            sl.quantity -= line.quantity
            sl.save()
            StockMove.objects.create(
                product=line.product,
                move_type='delivery',
                reference=delivery.reference,
                from_location=delivery.location,
                quantity=line.quantity,
                performed_by=request.user,
            )

        delivery.status = 'done'
        delivery.validated_at = timezone.now()
        delivery.save()
        return Response(DeliveryDetailSerializer(delivery).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        delivery = self.get_object()
        if delivery.status == 'done':
            return Response({'error': 'Cannot cancel validated delivery'}, status=400)
        delivery.status = 'cancelled'
        delivery.save()
        return Response(DeliveryDetailSerializer(delivery).data)


# ═══════════════════════════════════════════════
#  TRANSFERS
# ═══════════════════════════════════════════════

class TransferViewSet(viewsets.ModelViewSet):
    queryset = InternalTransfer.objects.select_related(
        'product', 'from_location', 'to_location'
    ).all()
    serializer_class = TransferListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)
        return qs

    @action(detail=True, methods=['post'])
    def validate_transfer(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status == 'done':
            return Response({'error': 'Already validated'}, status=400)

        try:
            sl_from = StockLevel.objects.get(
                product=transfer.product, location=transfer.from_location
            )
        except StockLevel.DoesNotExist:
            return Response({'error': 'No stock at source location'}, status=400)

        if sl_from.quantity < transfer.quantity:
            return Response({'error': 'Insufficient stock at source'}, status=400)

        sl_from.quantity -= transfer.quantity
        sl_from.save()

        sl_to, _ = StockLevel.objects.get_or_create(
            product=transfer.product, location=transfer.to_location
        )
        sl_to.quantity += transfer.quantity
        sl_to.save()

        StockMove.objects.create(
            product=transfer.product,
            move_type='transfer',
            reference=transfer.reference,
            from_location=transfer.from_location,
            to_location=transfer.to_location,
            quantity=transfer.quantity,
            performed_by=request.user,
        )

        transfer.status = 'done'
        transfer.validated_at = timezone.now()
        transfer.save()
        return Response(TransferListSerializer(transfer).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status == 'done':
            return Response({'error': 'Cannot cancel validated transfer'}, status=400)
        transfer.status = 'cancelled'
        transfer.save()
        return Response(TransferListSerializer(transfer).data)


# ═══════════════════════════════════════════════
#  ADJUSTMENTS
# ═══════════════════════════════════════════════

class AdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.select_related('product', 'location').all()
    serializer_class = AdjustmentSerializer

    def perform_create(self, serializer):
        adj = serializer.save(adjusted_by=self.request.user)
        # Apply adjustment
        sl, _ = StockLevel.objects.get_or_create(
            product=adj.product, location=adj.location
        )
        sl.quantity = adj.counted_quantity
        sl.save()
        StockMove.objects.create(
            product=adj.product,
            move_type='adjustment',
            reference=adj.reference,
            from_location=adj.location,
            to_location=adj.location,
            quantity=adj.counted_quantity - adj.recorded_quantity,
            performed_by=self.request.user,
        )


# ═══════════════════════════════════════════════
#  STOCK MOVES
# ═══════════════════════════════════════════════

class StockMoveViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMove.objects.select_related(
        'product', 'from_location', 'to_location', 'performed_by'
    ).all()
    serializer_class = StockMoveSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        move_type = self.request.query_params.get('type')
        if move_type:
            qs = qs.filter(move_type=move_type)
        return qs

import os
from django.conf import settings
from django.http import HttpResponse

def react_app_view(request):
    index_path = os.path.join(settings.BASE_DIR, 'react_dist', 'index.html')
    try:
        with open(index_path, 'r') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse("React app not built yet. Run 'npm run build' in frontend.", status=501)
