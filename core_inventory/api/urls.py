from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'warehouses', views.WarehouseViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'reorder-rules', views.ReorderRuleViewSet)
router.register(r'receipts', views.ReceiptViewSet)
router.register(r'deliveries', views.DeliveryViewSet)
router.register(r'transfers', views.TransferViewSet)
router.register(r'adjustments', views.AdjustmentViewSet)
router.register(r'moves', views.StockMoveViewSet)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', views.api_register, name='api_register'),
    path('auth/otp/request/', views.api_otp_request, name='api_otp_request'),
    path('auth/otp/verify/', views.api_otp_verify, name='api_otp_verify'),
    path('auth/password/reset/', views.api_password_reset, name='api_password_reset'),
    path('dashboard/', views.api_dashboard, name='api_dashboard'),
    path('', include(router.urls)),
]
