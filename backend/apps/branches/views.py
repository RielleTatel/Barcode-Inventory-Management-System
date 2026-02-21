from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Branch
from .serializers import BranchSerializer

class BranchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Branch CRUD operations.
    
    Provides:
    - GET /api/branches/ - List all branches
    - POST /api/branches/ - Create a new branch
    - GET /api/branches/{id}/ - Retrieve a specific branch
    - PUT/PATCH /api/branches/{id}/ - Update a branch
    - DELETE /api/branches/{id}/ - Delete a branch
    """
    queryset = Branch.objects.all().order_by('name')
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Create a new branch"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Branch created successfully',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Update a branch"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'message': 'Branch updated successfully',
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete a branch"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Branch deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
