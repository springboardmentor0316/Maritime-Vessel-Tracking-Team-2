from rest_framework import status
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Vessel
from .serializers import (
    VesselSerializer,
    VesselLiveSerializer,
    VesselPositionUpdateSerializer,
)




class VesselPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if request.method in SAFE_METHODS:
            return user and user.is_authenticated

        if request.method == "POST":
            return user.is_authenticated and user.role in ["admin", "operator"]

        if request.method == "DELETE":
            return user.is_authenticated and user.role == "admin"

        return False



class VesselViewSet(ModelViewSet):
    serializer_class = VesselSerializer
    permission_classes = [VesselPermission]

    def get_queryset(self):
        queryset = Vessel.objects.all()

        vessel_type = self.request.query_params.get("vessel_type")
        status = self.request.query_params.get("status")
        flag = self.request.query_params.get("flag")
        search = self.request.query_params.get("search")

        if vessel_type:
            queryset = queryset.filter(vessel_type=vessel_type)

        if status:
            queryset = queryset.filter(status=status)

        if flag:
            queryset = queryset.filter(flag__iexact=flag)

        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset



class LiveVesselView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vessels = Vessel.objects.all()
        serializer = VesselLiveSerializer(vessels, many=True)
        return Response(serializer.data)


@extend_schema(
    request=VesselPositionUpdateSerializer,
    responses={200: dict},
)
class UpdateVesselPositionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VesselPositionUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vessel = get_object_or_404(
            Vessel, imo_number=serializer.validated_data["imo_number"]
        )

        vessel.latitude = serializer.validated_data["latitude"]
        vessel.longitude = serializer.validated_data["longitude"]
        vessel.speed = serializer.validated_data["speed"]
        vessel.status = serializer.validated_data["status"]
        vessel.save()

        return Response(
            {"message": "Vessel position updated successfully"},
            status=status.HTTP_200_OK,
        )
