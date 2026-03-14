from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('password-reset/', views.otp_request_view, name='otp_request'),
    path('password-reset/verify/', views.otp_verify_view, name='otp_verify'),
    path('password-reset/new/', views.reset_password_view, name='reset_password'),
    path('profile/', views.profile_view, name='profile'),
]
