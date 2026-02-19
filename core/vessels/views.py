from urllib import request
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema

from .models import Vessel, VesselPosition
from ports.models import Port
from users.permissions import is_admin_email
from .serializers import (
    VesselSerializer,
    VesselLiveSerializer,
    VesselMapSerializer,
    VesselRouteSerializer,
    VesselDetailSerializer,
    VesselPositionSerializer,
    VesselPositionUpdateSerializer,
)


class VesselPermission(BasePermission):
    """Your existing permission class"""
    def has_permission(self, request, view):
        user = request.user

        if request.method in SAFE_METHODS:
            return user and user.is_authenticated

        if request.method == "POST":
            return user.is_authenticated and (is_admin_email(user) or user.role == "operator")

        if request.method in ["PUT", "PATCH"]:  
            return user.is_authenticated and (is_admin_email(user) or user.role == "operator")

        if request.method == "DELETE":
            return is_admin_email(user)

        return False


class VesselViewSet(ModelViewSet):
    """Enhanced VesselViewSet with your existing filtering + new AIS endpoints"""
    serializer_class = VesselSerializer
    permission_classes = [VesselPermission]

    def get_queryset(self):
        """Your existing queryset filtering"""
        queryset = Vessel.objects.all()

        vessel_type = self.request.query_params.get("vessel_type")
        status_param = self.request.query_params.get("status")
        flag = self.request.query_params.get("flag")
        search = self.request.query_params.get("search")

        if vessel_type:
            queryset = queryset.filter(vessel_type=vessel_type)

        if status_param:
            queryset = queryset.filter(status=status_param)

        if flag:
            queryset = queryset.filter(flag__iexact=flag)

        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'live_tracking':
            return VesselLiveSerializer
        elif self.action == 'map_view':
            return VesselMapSerializer
        elif self.action == 'retrieve':
            return VesselDetailSerializer
        elif self.action == 'vessel_route':
            return VesselRouteSerializer
        return VesselSerializer

    # ========== NEW ENDPOINTS FOR AIS STREAMING ==========
    
    @action(detail=False, methods=['get'], url_path='live-tracking', permission_classes=[IsAuthenticated])
    def live_tracking(self, request):
        """Get live vessels with fallback"""
        hours = int(request.query_params.get('hours', 1))
        since = timezone.now() - timedelta(hours=hours)

        vessels = Vessel.objects.filter(
            last_position_update__gte=since,
            latitude__isnull=False,
            longitude__isnull=False
        ).order_by('-last_position_update')

        # Fallback
        if not vessels.exists():
            vessels = Vessel.objects.filter(
                latitude__isnull=False,
                longitude__isnull=False
            ).order_by('-last_position_update')[:2000]

        serializer = self.get_serializer(vessels, many=True)

        return Response({
            'count': vessels.count(),
            'last_updated': timezone.now(),
            'vessels': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='map-view', permission_classes=[IsAuthenticated])
    def map_view(self, request):
        """Optimized endpoint for map display (with fallback)"""
        hours = int(request.query_params.get('hours', 1))
        since = timezone.now() - timedelta(hours=hours)

        # Try fresh vessels first
        vessels = Vessel.objects.filter(
            last_position_update__gte=since,
            latitude__isnull=False,
            longitude__isnull=False
        )

        # Fallback: if no fresh vessels, show latest known positions
        if not vessels.exists():
            vessels = Vessel.objects.filter(
                latitude__isnull=False,
                longitude__isnull=False
            ).order_by('-last_position_update')[:2000]

        serializer = self.get_serializer(vessels, many=True)

        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='route', permission_classes=[IsAuthenticated])
    def vessel_route(self, request, pk=None):
        """Get vessel route (historical positions)"""
        vessel = self.get_object()
        hours = int(request.query_params.get('hours', 24))
        limit = int(request.query_params.get('limit', 100))
        since = timezone.now() - timedelta(hours=hours)
        
        positions = VesselPosition.objects.filter(
            vessel=vessel,
            timestamp__gte=since
        ).order_by('timestamp')[:limit]
        
        return Response({
            'vessel': {
                'id': vessel.id,
                'name': vessel.name,
                'mmsi': vessel.mmsi,
                'imo_number': vessel.imo_number,
            },
            'route': VesselPositionSerializer(positions, many=True).data,
            'total_positions': positions.count()
        })
    
    @action(detail=False, methods=['get'], url_path='statistics', permission_classes=[IsAuthenticated])
    def statistics(self, request):
        """Get overall vessel statistics"""
        total = Vessel.objects.count()
        active_1h = Vessel.objects.filter(
            last_position_update__gte=timezone.now() - timedelta(hours=1)
        ).count()
        active_24h = Vessel.objects.filter(
            last_position_update__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        # Count by status
        status_counts = {}
        all_statuses = ['underway', 'anchored', 'moored', 'active', 'inactive', 'Moving', 'Anchored', 'Docked']
        for vessel_status in all_statuses:
            count = Vessel.objects.filter(status=vessel_status).count()
            if count > 0:
                status_counts[vessel_status] = count
        
        # Count by type
        type_counts = {}
        for vtype in ['Cargo', 'Tanker', 'Passenger', 'Fishing', 'Sailing', 'Tug', 'Other']:
            count = Vessel.objects.filter(vessel_type=vtype).count()
            if count > 0:
                type_counts[vtype] = count
        
        return Response({
            'total_vessels': total,
            'total_ports': Port.objects.count(),
            'active_1h': active_1h,
            'active_24h': active_24h,
            'by_status': status_counts,
            'by_type': type_counts,
            'last_updated': timezone.now()
        })


# ========== YOUR EXISTING API VIEWS (PRESERVED) ==========

class LiveVesselView(APIView):
    """Your existing live vessel view"""
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
        vessel.last_position_update = timezone.now()
        vessel.data_source = 'manual'
        vessel.save()
        
        # Save position history
        VesselPosition.objects.create(
            vessel=vessel,
            latitude=vessel.latitude,
            longitude=vessel.longitude,
            speed=vessel.speed,
            timestamp=timezone.now(),
            data_source='manual'
        )

        return Response(
            {"message": "Vessel position updated successfully"},
            status=status.HTTP_200_OK,
        )
