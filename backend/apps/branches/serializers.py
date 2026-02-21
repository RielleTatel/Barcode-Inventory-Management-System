from rest_framework import serializers
from .models import Branch

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = [
            'id',
            'name',
            'branch_type',
            'address',
        ]  
        read_only_fields = ['id']
    
    def validate_name(self, value):
        """Ensure branch name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Branch name cannot be empty")
        return value.strip()
    
    def validate_branch_type(self, value):
        """Validate branch type is one of the allowed choices"""
        valid_types = ['kitchen', 'cafe_only']
        if value not in valid_types:
            raise serializers.ValidationError(f"Branch type must be one of: {', '.join(valid_types)}")
        return value 


