from django.contrib import admin
from django.urls import path, include, re_path
from api.views import react_app_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^.*$', react_app_view, name='react_app'),
]
