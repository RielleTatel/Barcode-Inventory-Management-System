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
