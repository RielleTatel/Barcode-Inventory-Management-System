from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import generics, permissions
from .serializers import RegisterSerializer, AdminUserSerializer
from .serializers_jwt import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model(); 

class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('refresh'):
            cookie_max_age = 3600 * 24 * 7 # 7 days
            response.set_cookie(
                'refresh_token', 
                response.data['refresh'], 
                max_age=cookie_max_age, 
                httponly=True, 
                samesite='Lax',
                secure=False,  # Set to True in production with HTTPS
                domain=None    # Allow cookie on localhost
            )
            del response.data['refresh'] # Remove from JSON body
        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
    
    def post(self, request, *args, **kwargs):
        # Get refresh token from cookie instead of request body
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            request.data['refresh'] = refresh_token
        
        return super().post(request, *args, **kwargs) 

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny] 

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    # Security: Only allow Superadmins to see this list
    permission_classes = [permissions.IsAdminUser]

    # 2. UPDATE USER (Activate): To approve a specific user
class AdminUserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

    # Custom logic: When the admin updates 'status', we ensure 'is_active' matches
    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status:  # If Superadmin set 'status' to True
            instance.is_active = True
            instance.save()