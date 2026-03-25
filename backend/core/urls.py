from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def root_health(_request):
    """So GET / returns 200; API routes live under /api/ and /admin/."""
    return JsonResponse({"ok": True, "service": "barcode-inventory-api"})


urlpatterns = [
    path('', root_health),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/menus/', include('apps.menusAndRecipes.urls')),
    path('api/branches/', include('apps.branches.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/catering/', include('apps.salesAndCatering.urls')),
    path('api/supply/', include('apps.supply.urls')),
]
