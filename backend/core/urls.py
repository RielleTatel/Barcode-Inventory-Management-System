from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/menus/', include('apps.menusAndRecipes.urls')),
    path('api/branches/', include('apps.branches.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/catering/', include('apps.salesAndCatering.urls')),
    path('api/supply/', include('apps.supply.urls')),
]
