from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, Q
from inventory.models import (
    Product, Category, StockLevel, Receipt, DeliveryOrder,
    InternalTransfer, StockAdjustment, StockMove, ReorderRule,
    Warehouse,
)


@login_required
def home(request):
    """Dashboard home with KPI cards, dynamic filters, low stock alerts, and recent activity."""

    # ── KPI cards ──
    total_products = Product.objects.count()

    # Low stock / out of stock based on reorder rules
    low_stock_products = []
    out_of_stock_products = []
    for rule in ReorderRule.objects.select_related('product', 'warehouse'):
        total = StockLevel.objects.filter(
            product=rule.product,
            location__warehouse=rule.warehouse,
        ).aggregate(total=Sum('quantity'))['total'] or 0
        if total <= 0:
            out_of_stock_products.append({
                'product': rule.product,
                'warehouse': rule.warehouse,
                'quantity': total,
                'min_quantity': rule.min_quantity,
            })
        elif total <= rule.min_quantity:
            low_stock_products.append({
                'product': rule.product,
                'warehouse': rule.warehouse,
                'quantity': total,
                'min_quantity': rule.min_quantity,
            })

    low_stock_items = len(low_stock_products)
    out_of_stock_items = len(out_of_stock_products)

    pending_receipts = Receipt.objects.filter(
        status__in=['draft', 'waiting', 'ready']
    ).count()
    pending_deliveries = DeliveryOrder.objects.filter(
        status__in=['draft', 'waiting', 'ready']
    ).count()
    scheduled_transfers = InternalTransfer.objects.filter(
        status__in=['draft', 'waiting', 'ready']
    ).count()

    # ── Dynamic filters ──
    doc_type = request.GET.get('doc_type', '')
    status = request.GET.get('status', '')
    warehouse_id = request.GET.get('warehouse', '')
    category_id = request.GET.get('category', '')

    filtered_docs = []
    show_filters = doc_type or status or warehouse_id or category_id

    if show_filters:
        if doc_type == 'receipt' or not doc_type:
            qs = Receipt.objects.select_related('location', 'created_by').all()
            if status:
                qs = qs.filter(status=status)
            if warehouse_id:
                qs = qs.filter(location__warehouse_id=warehouse_id)
            for item in qs[:25]:
                filtered_docs.append({
                    'type': 'Receipt',
                    'type_class': 'done',
                    'reference': item.reference,
                    'partner': item.supplier,
                    'status': item.get_status_display(),
                    'status_class': item.status,
                    'date': item.scheduled_date,
                    'url': f'/inventory/receipts/{item.pk}/',
                })

        if doc_type == 'delivery' or not doc_type:
            qs = DeliveryOrder.objects.select_related('location', 'created_by').all()
            if status:
                qs = qs.filter(status=status)
            if warehouse_id:
                qs = qs.filter(location__warehouse_id=warehouse_id)
            for item in qs[:25]:
                filtered_docs.append({
                    'type': 'Delivery',
                    'type_class': 'cancelled',
                    'reference': item.reference,
                    'partner': item.customer,
                    'status': item.get_status_display(),
                    'status_class': item.status,
                    'date': item.scheduled_date,
                    'url': f'/inventory/deliveries/{item.pk}/',
                })

        if doc_type == 'transfer' or not doc_type:
            qs = InternalTransfer.objects.select_related('product', 'from_location', 'to_location').all()
            if status:
                qs = qs.filter(status=status)
            if warehouse_id:
                qs = qs.filter(
                    Q(from_location__warehouse_id=warehouse_id) |
                    Q(to_location__warehouse_id=warehouse_id)
                )
            for item in qs[:25]:
                filtered_docs.append({
                    'type': 'Transfer',
                    'type_class': 'ready',
                    'reference': item.reference,
                    'partner': str(item.product),
                    'status': item.get_status_display(),
                    'status_class': item.status,
                    'date': item.scheduled_date,
                    'url': f'/inventory/transfers/{item.pk}/',
                })

        if doc_type == 'adjustment' or not doc_type:
            qs = StockAdjustment.objects.select_related('product', 'location').all()
            if warehouse_id:
                qs = qs.filter(location__warehouse_id=warehouse_id)
            for item in qs[:25]:
                filtered_docs.append({
                    'type': 'Adjustment',
                    'type_class': 'waiting',
                    'reference': item.reference,
                    'partner': str(item.product),
                    'status': item.get_reason_display(),
                    'status_class': 'draft',
                    'date': item.created_at,
                    'url': '/inventory/adjustments/',
                })

        # Sort by date descending
        filtered_docs.sort(key=lambda x: x['date'], reverse=True)
        filtered_docs = filtered_docs[:50]

    # ── Recent activity ──
    recent_moves = StockMove.objects.select_related(
        'product', 'from_location', 'to_location', 'performed_by'
    )[:8]

    context = {
        'total_products': total_products,
        'low_stock_items': low_stock_items,
        'out_of_stock_items': out_of_stock_items,
        'pending_receipts': pending_receipts,
        'pending_deliveries': pending_deliveries,
        'scheduled_transfers': scheduled_transfers,
        # Low stock alerts
        'low_stock_products': low_stock_products,
        'out_of_stock_products': out_of_stock_products,
        # Filters
        'warehouses': Warehouse.objects.all(),
        'categories': Category.objects.all(),
        'doc_type': doc_type,
        'selected_status': status,
        'selected_warehouse': warehouse_id,
        'selected_category': category_id,
        'filtered_docs': filtered_docs,
        'show_filters': show_filters,
        # Recent activity
        'recent_moves': recent_moves,
    }
    return render(request, 'dashboard/dashboard.html', context)
