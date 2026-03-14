from django.urls import path
from . import views

app_name = 'inventory'

urlpatterns = [
    # Products
    path('products/', views.product_list, name='product_list'),
    path('products/create/', views.product_create, name='product_create'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    path('products/<int:pk>/edit/', views.product_edit, name='product_edit'),
    path('products/<int:pk>/delete/', views.product_delete, name='product_delete'),

    # Categories
    path('categories/', views.category_list, name='category_list'),
    path('categories/create/', views.category_create, name='category_create'),
    path('categories/<int:pk>/edit/', views.category_edit, name='category_edit'),
    path('categories/<int:pk>/delete/', views.category_delete, name='category_delete'),

    # Warehouses & Locations
    path('settings/warehouses/', views.warehouse_list, name='warehouse_list'),
    path('settings/warehouses/create/', views.warehouse_create, name='warehouse_create'),
    path('settings/warehouses/<int:pk>/edit/', views.warehouse_edit, name='warehouse_edit'),
    path('settings/warehouses/<int:pk>/delete/', views.warehouse_delete, name='warehouse_delete'),
    path('settings/locations/create/', views.location_create, name='location_create'),
    path('settings/locations/<int:pk>/delete/', views.location_delete, name='location_delete'),

    # Receipts
    path('receipts/', views.receipt_list, name='receipt_list'),
    path('receipts/create/', views.receipt_create, name='receipt_create'),
    path('receipts/<int:pk>/', views.receipt_detail, name='receipt_detail'),
    path('receipts/<int:pk>/validate/', views.receipt_validate, name='receipt_validate'),
    path('receipts/<int:pk>/cancel/', views.receipt_cancel, name='receipt_cancel'),

    # Delivery Orders
    path('deliveries/', views.delivery_list, name='delivery_list'),
    path('deliveries/create/', views.delivery_create, name='delivery_create'),
    path('deliveries/<int:pk>/', views.delivery_detail, name='delivery_detail'),
    path('deliveries/<int:pk>/validate/', views.delivery_validate, name='delivery_validate'),
    path('deliveries/<int:pk>/cancel/', views.delivery_cancel, name='delivery_cancel'),

    # Internal Transfers
    path('transfers/', views.transfer_list, name='transfer_list'),
    path('transfers/create/', views.transfer_create, name='transfer_create'),
    path('transfers/<int:pk>/', views.transfer_detail, name='transfer_detail'),
    path('transfers/<int:pk>/validate/', views.transfer_validate, name='transfer_validate'),
    path('transfers/<int:pk>/cancel/', views.transfer_cancel, name='transfer_cancel'),

    # Stock Adjustments
    path('adjustments/', views.adjustment_list, name='adjustment_list'),
    path('adjustments/create/', views.adjustment_create, name='adjustment_create'),

    # Move History
    path('moves/', views.move_history, name='move_history'),

    # Reorder Rules
    path('reorder-rules/', views.reorder_rule_list, name='reorder_rule_list'),
    path('reorder-rules/create/', views.reorder_rule_create, name='reorder_rule_create'),
    path('reorder-rules/<int:pk>/edit/', views.reorder_rule_edit, name='reorder_rule_edit'),
    path('reorder-rules/<int:pk>/delete/', views.reorder_rule_delete, name='reorder_rule_delete'),
]
