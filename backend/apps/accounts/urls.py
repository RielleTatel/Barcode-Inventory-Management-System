from django.urls import path
from .views import (
    CookieTokenObtainPairView, CookieTokenRefreshView,
    RegisterView, AdminUserListView, AdminUserDetailView,
    reset_user_password,
)

urlpatterns = [
    path('login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),

    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/reset-password/', reset_user_password, name='admin-user-reset-password'),
]
