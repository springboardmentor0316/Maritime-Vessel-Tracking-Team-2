from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Voyage
from .serializers import VoyageSerializer


class VoyagePermission(BasePermission):
    def has_permission(self, request, view):
        # Everyone logged in can READ
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        # Admin & Operator can CREATE
        if request.method == "POST":
            return request.user.groups.filter(
                name__in=["Admin", "Operator"]
            ).exists()

        # Only Admin can DELETE
        if request.method == "DELETE":
            return request.user.groups.filter(name="Admin").exists()

        return False


class VoyageViewSet(ModelViewSet):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer
    permission_classes = [VoyagePermission]
