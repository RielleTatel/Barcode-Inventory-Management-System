from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'position', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            position=validated_data.get('position', 'staff'),
            is_active=False, 
            status=False     
        )
        return user 

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'position', 'status', 'is_active', 'date_joined'
        ]

        read_only_fields = ['id', 'email', 'date_joined']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
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

    