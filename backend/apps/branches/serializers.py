from rest_framework import serializers
from .models import Branch


class BranchSerializer(serializers.ModelSerializer):
    branch_type_display = serializers.CharField(source='get_branch_type_display', read_only=True)

    class Meta:
        model = Branch
        fields = ['id', 'name', 'branch_type', 'branch_type_display', 'address', 'contact_number', 'is_active']
        read_only_fields = ['id']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Branch name cannot be empty")
        return value.strip()

    def validate_branch_type(self, value):
        valid_types = ['kitchen', 'cafe_only']
        if value not in valid_types:
            raise serializers.ValidationError(f"Branch type must be one of: {', '.join(valid_types)}")
        return value
