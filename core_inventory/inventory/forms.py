from django import forms
from .models import (
    Category, Product, Warehouse, Location, ReorderRule,
    Receipt, ReceiptLine, DeliveryOrder, DeliveryLine,
    InternalTransfer, StockAdjustment,
)


# ──────────────────────────────────────────────
#  Product & Category Forms
# ──────────────────────────────────────────────

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ('name', 'description')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Category name'}),
            'description': forms.Textarea(attrs={'class': 'form-input', 'placeholder': 'Description (optional)', 'rows': 3}),
        }


class ProductForm(forms.ModelForm):
    initial_stock = forms.DecimalField(
        required=False, min_value=0,
        widget=forms.NumberInput(attrs={'class': 'form-input', 'placeholder': '0'}),
        help_text='Optional — sets initial stock at the selected location',
    )
    initial_location = forms.ModelChoiceField(
        queryset=Location.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-input'}),
        help_text='Location for the initial stock',
    )

    class Meta:
        model = Product
        fields = ('name', 'sku', 'category', 'unit_of_measure', 'description')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Product name'}),
            'sku': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. STL-001'}),
            'category': forms.Select(attrs={'class': 'form-input'}),
            'unit_of_measure': forms.Select(attrs={'class': 'form-input'}),
            'description': forms.Textarea(attrs={'class': 'form-input', 'placeholder': 'Description (optional)', 'rows': 3}),
        }


# ──────────────────────────────────────────────
#  Warehouse & Location Forms
# ──────────────────────────────────────────────

class WarehouseForm(forms.ModelForm):
    class Meta:
        model = Warehouse
        fields = ('name', 'address')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Warehouse name'}),
            'address': forms.Textarea(attrs={'class': 'form-input', 'placeholder': 'Address', 'rows': 3}),
        }


class LocationForm(forms.ModelForm):
    class Meta:
        model = Location
        fields = ('warehouse', 'name')
        widgets = {
            'warehouse': forms.Select(attrs={'class': 'form-input'}),
            'name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. Rack A, Shelf 1'}),
        }


# ──────────────────────────────────────────────
#  Reorder Rule Form
# ──────────────────────────────────────────────

class ReorderRuleForm(forms.ModelForm):
    class Meta:
        model = ReorderRule
        fields = ('product', 'warehouse', 'min_quantity', 'reorder_quantity')
        widgets = {
            'product': forms.Select(attrs={'class': 'form-input'}),
            'warehouse': forms.Select(attrs={'class': 'form-input'}),
            'min_quantity': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'Minimum qty'}),
            'reorder_quantity': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'Reorder qty'}),
        }


# ──────────────────────────────────────────────
#  Receipt Forms
# ──────────────────────────────────────────────

class ReceiptForm(forms.ModelForm):
    class Meta:
        model = Receipt
        fields = ('reference', 'supplier', 'location', 'scheduled_date', 'notes')
        widgets = {
            'reference': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. REC-001'}),
            'supplier': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Supplier name'}),
            'location': forms.Select(attrs={'class': 'form-input'}),
            'scheduled_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'notes': forms.Textarea(attrs={'class': 'form-input', 'rows': 3, 'placeholder': 'Notes (optional)'}),
        }


class ReceiptLineForm(forms.ModelForm):
    class Meta:
        model = ReceiptLine
        fields = ('product', 'quantity')
        widgets = {
            'product': forms.Select(attrs={'class': 'form-input'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'Qty', 'step': '0.01'}),
        }


ReceiptLineFormSet = forms.inlineformset_factory(
    Receipt, ReceiptLine, form=ReceiptLineForm, extra=1, can_delete=True,
)


# ──────────────────────────────────────────────
#  Delivery Order Forms
# ──────────────────────────────────────────────

class DeliveryOrderForm(forms.ModelForm):
    class Meta:
        model = DeliveryOrder
        fields = ('reference', 'customer', 'location', 'scheduled_date', 'notes')
        widgets = {
            'reference': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. DEL-001'}),
            'customer': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Customer name'}),
            'location': forms.Select(attrs={'class': 'form-input'}),
            'scheduled_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'notes': forms.Textarea(attrs={'class': 'form-input', 'rows': 3, 'placeholder': 'Notes (optional)'}),
        }


class DeliveryLineForm(forms.ModelForm):
    class Meta:
        model = DeliveryLine
        fields = ('product', 'quantity')
        widgets = {
            'product': forms.Select(attrs={'class': 'form-input'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'Qty', 'step': '0.01'}),
        }


DeliveryLineFormSet = forms.inlineformset_factory(
    DeliveryOrder, DeliveryLine, form=DeliveryLineForm, extra=1, can_delete=True,
)


# ──────────────────────────────────────────────
#  Internal Transfer Form
# ──────────────────────────────────────────────

class InternalTransferForm(forms.ModelForm):
    class Meta:
        model = InternalTransfer
        fields = ('reference', 'product', 'from_location', 'to_location', 'quantity', 'scheduled_date', 'notes')
        widgets = {
            'reference': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. TRF-001'}),
            'product': forms.Select(attrs={'class': 'form-input'}),
            'from_location': forms.Select(attrs={'class': 'form-input'}),
            'to_location': forms.Select(attrs={'class': 'form-input'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'Quantity', 'step': '0.01'}),
            'scheduled_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'notes': forms.Textarea(attrs={'class': 'form-input', 'rows': 3, 'placeholder': 'Notes (optional)'}),
        }

    def clean(self):
        cleaned = super().clean()
        if cleaned.get('from_location') == cleaned.get('to_location'):
            raise forms.ValidationError('Source and destination locations cannot be the same.')
        return cleaned


# ──────────────────────────────────────────────
#  Stock Adjustment Form
# ──────────────────────────────────────────────

class StockAdjustmentForm(forms.ModelForm):
    class Meta:
        model = StockAdjustment
        fields = ('reference', 'product', 'location', 'counted_quantity', 'reason', 'notes')
        widgets = {
            'reference': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. ADJ-001'}),
            'product': forms.Select(attrs={'class': 'form-input'}),
            'location': forms.Select(attrs={'class': 'form-input'}),
            'counted_quantity': forms.NumberInput(attrs={'class': 'form-input', 'placeholder': 'Counted qty', 'step': '0.01'}),
            'reason': forms.Select(attrs={'class': 'form-input'}),
            'notes': forms.Textarea(attrs={'class': 'form-input', 'rows': 3, 'placeholder': 'Notes (optional)'}),
        }
