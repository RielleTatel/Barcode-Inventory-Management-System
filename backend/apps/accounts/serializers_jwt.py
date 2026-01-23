from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

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
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Get the refresh token to extract user_id
        refresh = RefreshToken(attrs['refresh'])
        
        try:
            # Get the user from the database
            user = User.objects.get(id=refresh['user_id'])
            
            # Create new access token with custom claims using our custom serializer
            new_refresh = CustomTokenObtainPairSerializer.get_token(user)
            
            # Override the access token with one that has custom claims
            data['access'] = str(new_refresh.access_token)
            
        except User.DoesNotExist:
            # If user doesn't exist, just return the default token
            # This will still work but without custom claims
            pass
        
        return data
