from rest_framework import serializers
from django.contrib.auth import get_user_model

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
    