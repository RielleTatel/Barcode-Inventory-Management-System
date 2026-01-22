from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims to the token
        token['email'] = user.email
        token['status'] = user.status
        token['role'] = 'admin' if user.is_superuser else 'user'
        
        return token

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    pass  # Inherits from parent, will use the same token generation from CustomTokenObtainPairSerializer


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Decode the refresh token to get user info
        refresh = RefreshToken(attrs['refresh'])
        
        # Get the user from the token
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(id=refresh['user_id'])
        
        # Create new access token with custom claims
        access = refresh.access_token
        access['email'] = user.email
        access['status'] = user.status
        access['role'] = 'admin' if user.is_superuser else 'user'
        
        data['access'] = str(access)
        
        return data
