from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Event
from .serializers import EventSerializer


class EventPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        # Everyone logged in can READ
        if request.method in SAFE_METHODS:
            return user and user.is_authenticated

        # Admin & Operator can CREATE
        if request.method == "POST":
            return user.is_authenticated and user.role in ["admin", "operator"]

        # Only Admin can DELETE
        if request.method == "DELETE":
            return user.is_authenticated and user.role == "admin"

        return False


class EventViewSet(ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [EventPermission]
