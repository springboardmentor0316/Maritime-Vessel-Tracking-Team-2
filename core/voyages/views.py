from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Voyage
from .serializers import VoyageSerializer
from users.permissions import is_admin_email


class VoyagePermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        # Everyone logged in can READ
        if request.method in SAFE_METHODS:
            return user.is_authenticated

        # Admin & Operator can CREATE
        if request.method == "POST":
            return user.is_authenticated and (is_admin_email(user) or user.role == "operator")

        # Only Admin can DELETE
        if request.method == "DELETE":
            return is_admin_email(user)

        return False


class VoyageViewSet(ModelViewSet):
    queryset = Voyage.objects.all()
    serializer_class = VoyageSerializer
    permission_classes = [VoyagePermission]
