from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Sum
from django.utils import timezone

from .models import (
    Category, Product, Warehouse, Location, StockLevel, ReorderRule,
    Receipt, ReceiptLine, DeliveryOrder, DeliveryLine,
    InternalTransfer, StockAdjustment, StockMove,
)
from .forms import (
    CategoryForm, ProductForm, WarehouseForm, LocationForm, ReorderRuleForm,
    ReceiptForm, ReceiptLineFormSet, DeliveryOrderForm, DeliveryLineFormSet,
    InternalTransferForm, StockAdjustmentForm,
)


# ══════════════════════════════════════════════
#  PRODUCTS
# ══════════════════════════════════════════════

@login_required
def product_list(request):
    products = Product.objects.select_related('category').all()
    q = request.GET.get('q', '')
    category_id = request.GET.get('category', '')
    if q:
        products = products.filter(Q(name__icontains=q) | Q(sku__icontains=q))
    if category_id:
        products = products.filter(category_id=category_id)
    categories = Category.objects.all()
    return render(request, 'inventory/product_list.html', {
        'products': products,
        'categories': categories,
        'q': q,
        'selected_category': category_id,
    })


@login_required
def product_create(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            product = form.save()
            # Handle initial stock
            initial_stock = form.cleaned_data.get('initial_stock')
            initial_location = form.cleaned_data.get('initial_location')
            if initial_stock and initial_location and initial_stock > 0:
                StockLevel.objects.create(
                    product=product,
                    location=initial_location,
                    quantity=initial_stock,
                )
                StockMove.objects.create(
                    product=product,
                    move_type=StockMove.MoveType.ADJUSTMENT,
                    reference=f'INIT-{product.sku}',
                    to_location=initial_location,
                    quantity=initial_stock,
                    performed_by=request.user,
                )
            messages.success(request, f'Product "{product.name}" created.')
            return redirect('inventory:product_list')
    else:
        form = ProductForm()
    return render(request, 'inventory/product_form.html', {
        'form': form,
        'title': 'New Product',
    })


@login_required
def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    stock_levels = StockLevel.objects.filter(product=product).select_related('location', 'location__warehouse')
    moves = StockMove.objects.filter(product=product)[:20]
    return render(request, 'inventory/product_detail.html', {
        'product': product,
        'stock_levels': stock_levels,
        'moves': moves,
    })


@login_required
def product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        form = ProductForm(request.POST, instance=product)
        if form.is_valid():
            form.save()
            messages.success(request, f'Product "{product.name}" updated.')
            return redirect('inventory:product_detail', pk=pk)
    else:
        form = ProductForm(instance=product)
    return render(request, 'inventory/product_form.html', {
        'form': form,
        'title': f'Edit — {product.name}',
        'product': product,
    })


@login_required
def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        name = product.name
        product.delete()
        messages.success(request, f'Product "{name}" deleted.')
        return redirect('inventory:product_list')
    return render(request, 'inventory/confirm_delete.html', {
        'object': product,
        'cancel_url': 'inventory:product_list',
    })


# ══════════════════════════════════════════════
#  CATEGORIES
# ══════════════════════════════════════════════

@login_required
def category_list(request):
    categories = Category.objects.all()
    return render(request, 'inventory/category_list.html', {'categories': categories})


@login_required
def category_create(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category created.')
            return redirect('inventory:category_list')
    else:
        form = CategoryForm()
    return render(request, 'inventory/category_form.html', {
        'form': form,
        'title': 'New Category',
    })


@login_required
def category_edit(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        form = CategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, f'Category "{category.name}" updated.')
            return redirect('inventory:category_list')
    else:
        form = CategoryForm(instance=category)
    return render(request, 'inventory/category_form.html', {
        'form': form,
        'title': f'Edit — {category.name}',
    })


@login_required
def category_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        category.delete()
        messages.success(request, 'Category deleted.')
        return redirect('inventory:category_list')
    return render(request, 'inventory/confirm_delete.html', {
        'object': category,
        'cancel_url': 'inventory:category_list',
    })


# ══════════════════════════════════════════════
#  WAREHOUSES & LOCATIONS
# ══════════════════════════════════════════════

@login_required
def warehouse_list(request):
    warehouses = Warehouse.objects.prefetch_related('locations').all()
    return render(request, 'inventory/warehouse_list.html', {'warehouses': warehouses})


@login_required
def warehouse_create(request):
    if request.method == 'POST':
        form = WarehouseForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Warehouse created.')
            return redirect('inventory:warehouse_list')
    else:
        form = WarehouseForm()
    return render(request, 'inventory/warehouse_form.html', {
        'form': form,
        'title': 'New Warehouse',
    })


@login_required
def warehouse_edit(request, pk):
    warehouse = get_object_or_404(Warehouse, pk=pk)
    if request.method == 'POST':
        form = WarehouseForm(request.POST, instance=warehouse)
        if form.is_valid():
            form.save()
            messages.success(request, f'Warehouse "{warehouse.name}" updated.')
            return redirect('inventory:warehouse_list')
    else:
        form = WarehouseForm(instance=warehouse)
    return render(request, 'inventory/warehouse_form.html', {
        'form': form,
        'title': f'Edit — {warehouse.name}',
    })


@login_required
def warehouse_delete(request, pk):
    warehouse = get_object_or_404(Warehouse, pk=pk)
    if request.method == 'POST':
        warehouse.delete()
        messages.success(request, 'Warehouse deleted.')
        return redirect('inventory:warehouse_list')
    return render(request, 'inventory/confirm_delete.html', {
        'object': warehouse,
        'cancel_url': 'inventory:warehouse_list',
    })


@login_required
def location_create(request):
    if request.method == 'POST':
        form = LocationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Location created.')
            return redirect('inventory:warehouse_list')
    else:
        form = LocationForm()
    return render(request, 'inventory/location_form.html', {
        'form': form,
        'title': 'New Location',
    })


@login_required
def location_delete(request, pk):
    location = get_object_or_404(Location, pk=pk)
    if request.method == 'POST':
        location.delete()
        messages.success(request, 'Location deleted.')
        return redirect('inventory:warehouse_list')
    return render(request, 'inventory/confirm_delete.html', {
        'object': location,
        'cancel_url': 'inventory:warehouse_list',
    })


# ══════════════════════════════════════════════
#  REORDER RULES
# ══════════════════════════════════════════════

@login_required
def reorder_rule_list(request):
    rules = ReorderRule.objects.select_related('product', 'warehouse').all()
    return render(request, 'inventory/reorder_rule_list.html', {'rules': rules})


@login_required
def reorder_rule_create(request):
    if request.method == 'POST':
        form = ReorderRuleForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Reorder rule created.')
            return redirect('inventory:reorder_rule_list')
    else:
        form = ReorderRuleForm()
    return render(request, 'inventory/reorder_rule_form.html', {
        'form': form,
        'title': 'New Reorder Rule',
    })


@login_required
def reorder_rule_edit(request, pk):
    rule = get_object_or_404(ReorderRule, pk=pk)
    if request.method == 'POST':
        form = ReorderRuleForm(request.POST, instance=rule)
        if form.is_valid():
            form.save()
            messages.success(request, 'Reorder rule updated.')
            return redirect('inventory:reorder_rule_list')
    else:
        form = ReorderRuleForm(instance=rule)
    return render(request, 'inventory/reorder_rule_form.html', {
        'form': form,
        'title': 'Edit Reorder Rule',
    })


@login_required
def reorder_rule_delete(request, pk):
    rule = get_object_or_404(ReorderRule, pk=pk)
    if request.method == 'POST':
        rule.delete()
        messages.success(request, 'Reorder rule deleted.')
        return redirect('inventory:reorder_rule_list')
    return render(request, 'inventory/confirm_delete.html', {
        'object': rule,
        'cancel_url': 'inventory:reorder_rule_list',
    })


# ══════════════════════════════════════════════
#  RECEIPTS (Incoming)
# ══════════════════════════════════════════════

@login_required
def receipt_list(request):
    receipts = Receipt.objects.select_related('location', 'created_by').all()
    status = request.GET.get('status', '')
    if status:
        receipts = receipts.filter(status=status)
    return render(request, 'inventory/receipt_list.html', {
        'receipts': receipts,
        'selected_status': status,
    })


@login_required
def receipt_create(request):
    if request.method == 'POST':
        form = ReceiptForm(request.POST)
        formset = ReceiptLineFormSet(request.POST)
        if form.is_valid() and formset.is_valid():
            receipt = form.save(commit=False)
            receipt.created_by = request.user
            receipt.save()
            formset.instance = receipt
            formset.save()
            messages.success(request, f'Receipt {receipt.reference} created.')
            return redirect('inventory:receipt_detail', pk=receipt.pk)
    else:
        form = ReceiptForm()
        formset = ReceiptLineFormSet()
    return render(request, 'inventory/receipt_form.html', {
        'form': form,
        'formset': formset,
        'title': 'New Receipt',
    })


@login_required
def receipt_detail(request, pk):
    receipt = get_object_or_404(Receipt.objects.select_related('location', 'created_by'), pk=pk)
    lines = receipt.lines.select_related('product').all()
    return render(request, 'inventory/receipt_detail.html', {
        'receipt': receipt,
        'lines': lines,
    })


@login_required
def receipt_validate(request, pk):
    receipt = get_object_or_404(Receipt, pk=pk)
    if request.method == 'POST' and receipt.status != Receipt.Status.DONE:
        for line in receipt.lines.select_related('product').all():
            stock, created = StockLevel.objects.get_or_create(
                product=line.product,
                location=receipt.location,
                defaults={'quantity': 0},
            )
            stock.quantity += line.quantity
            stock.save()
            StockMove.objects.create(
                product=line.product,
                move_type=StockMove.MoveType.RECEIPT,
                reference=receipt.reference,
                to_location=receipt.location,
                quantity=line.quantity,
                performed_by=request.user,
            )
        receipt.status = Receipt.Status.DONE
        receipt.validated_at = timezone.now()
        receipt.save()
        messages.success(request, f'Receipt {receipt.reference} validated. Stock updated.')
    return redirect('inventory:receipt_detail', pk=pk)


@login_required
def receipt_cancel(request, pk):
    receipt = get_object_or_404(Receipt, pk=pk)
    if request.method == 'POST' and receipt.status != Receipt.Status.DONE:
        receipt.status = Receipt.Status.CANCELLED
        receipt.save()
        messages.info(request, f'Receipt {receipt.reference} cancelled.')
    return redirect('inventory:receipt_detail', pk=pk)


# ══════════════════════════════════════════════
#  DELIVERY ORDERS (Outgoing)
# ══════════════════════════════════════════════

@login_required
def delivery_list(request):
    deliveries = DeliveryOrder.objects.select_related('location', 'created_by').all()
    status = request.GET.get('status', '')
    if status:
        deliveries = deliveries.filter(status=status)
    return render(request, 'inventory/delivery_list.html', {
        'deliveries': deliveries,
        'selected_status': status,
    })


@login_required
def delivery_create(request):
    if request.method == 'POST':
        form = DeliveryOrderForm(request.POST)
        formset = DeliveryLineFormSet(request.POST)
        if form.is_valid() and formset.is_valid():
            delivery = form.save(commit=False)
            delivery.created_by = request.user
            delivery.save()
            formset.instance = delivery
            formset.save()
            messages.success(request, f'Delivery {delivery.reference} created.')
            return redirect('inventory:delivery_detail', pk=delivery.pk)
    else:
        form = DeliveryOrderForm()
        formset = DeliveryLineFormSet()
    return render(request, 'inventory/delivery_form.html', {
        'form': form,
        'formset': formset,
        'title': 'New Delivery Order',
    })


@login_required
def delivery_detail(request, pk):
    delivery = get_object_or_404(DeliveryOrder.objects.select_related('location', 'created_by'), pk=pk)
    lines = delivery.lines.select_related('product').all()
    return render(request, 'inventory/delivery_detail.html', {
        'delivery': delivery,
        'lines': lines,
    })


@login_required
def delivery_validate(request, pk):
    delivery = get_object_or_404(DeliveryOrder, pk=pk)
    if request.method == 'POST' and delivery.status != DeliveryOrder.Status.DONE:
        # Check stock availability
        for line in delivery.lines.select_related('product').all():
            stock = StockLevel.objects.filter(
                product=line.product, location=delivery.location
            ).first()
            if not stock or stock.quantity < line.quantity:
                messages.error(
                    request,
                    f'Insufficient stock for {line.product.name} at {delivery.location}.'
                )
                return redirect('inventory:delivery_detail', pk=pk)

        for line in delivery.lines.select_related('product').all():
            stock = StockLevel.objects.get(product=line.product, location=delivery.location)
            stock.quantity -= line.quantity
            stock.save()
            StockMove.objects.create(
                product=line.product,
                move_type=StockMove.MoveType.DELIVERY,
                reference=delivery.reference,
                from_location=delivery.location,
                quantity=line.quantity,
                performed_by=request.user,
            )
        delivery.status = DeliveryOrder.Status.DONE
        delivery.validated_at = timezone.now()
        delivery.save()
        messages.success(request, f'Delivery {delivery.reference} validated. Stock updated.')
    return redirect('inventory:delivery_detail', pk=pk)


@login_required
def delivery_cancel(request, pk):
    delivery = get_object_or_404(DeliveryOrder, pk=pk)
    if request.method == 'POST' and delivery.status != DeliveryOrder.Status.DONE:
        delivery.status = DeliveryOrder.Status.CANCELLED
        delivery.save()
        messages.info(request, f'Delivery {delivery.reference} cancelled.')
    return redirect('inventory:delivery_detail', pk=pk)


# ══════════════════════════════════════════════
#  INTERNAL TRANSFERS
# ══════════════════════════════════════════════

@login_required
def transfer_list(request):
    transfers = InternalTransfer.objects.select_related(
        'product', 'from_location', 'to_location', 'created_by'
    ).all()
    status = request.GET.get('status', '')
    if status:
        transfers = transfers.filter(status=status)
    return render(request, 'inventory/transfer_list.html', {
        'transfers': transfers,
        'selected_status': status,
    })


@login_required
def transfer_create(request):
    if request.method == 'POST':
        form = InternalTransferForm(request.POST)
        if form.is_valid():
            transfer = form.save(commit=False)
            transfer.created_by = request.user
            transfer.save()
            messages.success(request, f'Transfer {transfer.reference} created.')
            return redirect('inventory:transfer_detail', pk=transfer.pk)
    else:
        form = InternalTransferForm()
    return render(request, 'inventory/transfer_form.html', {
        'form': form,
        'title': 'New Internal Transfer',
    })


@login_required
def transfer_detail(request, pk):
    transfer = get_object_or_404(
        InternalTransfer.objects.select_related('product', 'from_location', 'to_location', 'created_by'),
        pk=pk,
    )
    return render(request, 'inventory/transfer_detail.html', {'transfer': transfer})


@login_required
def transfer_validate(request, pk):
    transfer = get_object_or_404(InternalTransfer, pk=pk)
    if request.method == 'POST' and transfer.status != InternalTransfer.Status.DONE:
        # Check stock at source
        stock_from = StockLevel.objects.filter(
            product=transfer.product, location=transfer.from_location
        ).first()
        if not stock_from or stock_from.quantity < transfer.quantity:
            messages.error(request, f'Insufficient stock at {transfer.from_location}.')
            return redirect('inventory:transfer_detail', pk=pk)

        # Decrease source
        stock_from.quantity -= transfer.quantity
        stock_from.save()

        # Increase destination
        stock_to, _ = StockLevel.objects.get_or_create(
            product=transfer.product,
            location=transfer.to_location,
            defaults={'quantity': 0},
        )
        stock_to.quantity += transfer.quantity
        stock_to.save()

        StockMove.objects.create(
            product=transfer.product,
            move_type=StockMove.MoveType.TRANSFER,
            reference=transfer.reference,
            from_location=transfer.from_location,
            to_location=transfer.to_location,
            quantity=transfer.quantity,
            performed_by=request.user,
        )
        transfer.status = InternalTransfer.Status.DONE
        transfer.validated_at = timezone.now()
        transfer.save()
        messages.success(request, f'Transfer {transfer.reference} completed.')
    return redirect('inventory:transfer_detail', pk=pk)


@login_required
def transfer_cancel(request, pk):
    transfer = get_object_or_404(InternalTransfer, pk=pk)
    if request.method == 'POST' and transfer.status != InternalTransfer.Status.DONE:
        transfer.status = InternalTransfer.Status.CANCELLED
        transfer.save()
        messages.info(request, f'Transfer {transfer.reference} cancelled.')
    return redirect('inventory:transfer_detail', pk=pk)


# ══════════════════════════════════════════════
#  STOCK ADJUSTMENTS
# ══════════════════════════════════════════════

@login_required
def adjustment_list(request):
    adjustments = StockAdjustment.objects.select_related('product', 'location', 'adjusted_by').all()
    return render(request, 'inventory/adjustment_list.html', {'adjustments': adjustments})


@login_required
def adjustment_create(request):
    if request.method == 'POST':
        form = StockAdjustmentForm(request.POST)
        if form.is_valid():
            adj = form.save(commit=False)
            # Get current recorded quantity
            stock = StockLevel.objects.filter(
                product=adj.product, location=adj.location
            ).first()
            adj.recorded_quantity = stock.quantity if stock else 0
            adj.adjusted_by = request.user
            adj.save()

            # Auto-update stock
            if stock:
                stock.quantity = adj.counted_quantity
                stock.save()
            else:
                StockLevel.objects.create(
                    product=adj.product,
                    location=adj.location,
                    quantity=adj.counted_quantity,
                )

            diff = adj.counted_quantity - adj.recorded_quantity
            StockMove.objects.create(
                product=adj.product,
                move_type=StockMove.MoveType.ADJUSTMENT,
                reference=adj.reference,
                to_location=adj.location if diff > 0 else None,
                from_location=adj.location if diff < 0 else None,
                quantity=abs(diff),
                performed_by=request.user,
            )
            messages.success(request, f'Adjustment {adj.reference} applied. Stock updated by {diff:+}.')
            return redirect('inventory:adjustment_list')
    else:
        form = StockAdjustmentForm()
    return render(request, 'inventory/adjustment_form.html', {
        'form': form,
        'title': 'New Stock Adjustment',
    })


# ══════════════════════════════════════════════
#  MOVE HISTORY (Stock Ledger)
# ══════════════════════════════════════════════

@login_required
def move_history(request):
    moves = StockMove.objects.select_related(
        'product', 'from_location', 'to_location', 'performed_by'
    ).all()
    move_type = request.GET.get('type', '')
    q = request.GET.get('q', '')
    if move_type:
        moves = moves.filter(move_type=move_type)
    if q:
        moves = moves.filter(
            Q(product__name__icontains=q) | Q(product__sku__icontains=q) | Q(reference__icontains=q)
        )
    return render(request, 'inventory/move_history.html', {
        'moves': moves[:100],
        'selected_type': move_type,
        'q': q,
    })
