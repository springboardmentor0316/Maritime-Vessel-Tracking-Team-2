from rest_framework import serializers
from .models import Vessel, VesselPosition

class VesselPositionSerializer(serializers.ModelSerializer):
    """Serializer for historical vessel positions"""
    class Meta:
        model = VesselPosition
        fields = ['id', 'latitude', 'longitude', 'speed', 'course', 'heading', 'timestamp', 'data_source']


class VesselSerializer(serializers.ModelSerializer):
    """Full vessel serializer with latest position"""
    latest_position = serializers.SerializerMethodField()
    position_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = '__all__'
    
    def get_latest_position(self, obj):
        """Get the most recent position"""
        latest = obj.positions.first()
        if latest:
            return VesselPositionSerializer(latest).data
        return None
    
    def get_position_count(self, obj):
        """Count of historical positions"""
        return obj.positions.count()


class VesselLiveSerializer(serializers.ModelSerializer):
    """Lightweight serializer for live map"""
    class Meta:
        model = Vessel
        fields = [
            "id",
            "name",
            "imo_number",  # Your existing field
            "mmsi",
            "latitude",
            "longitude",
            "speed",
            "course",
            "heading",
            "status",
            "vessel_type",  # Your existing field
            "type",  # New simplified type
            "flag",
            "last_updated",  # Your existing field
            "last_position_update",  # New field
            "data_source",
        ]


class VesselMapSerializer(serializers.ModelSerializer):
    """Optimized serializer for map markers"""
    status_color = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = [
            "id",
            "name",
            "mmsi",
            "imo_number",
            "latitude",
            "longitude",
            "speed",
            "heading",
            "status",
            "status_color",
            "vessel_type",
            "type",
            "destination",
            "data_source",
        ]
    
    def get_status_color(self, obj):
        """Return color for map marker based on status"""
        colors = {
            'underway': '#3b82f6',
            'Moving': '#3b82f6',
            'active': '#10b981',
            'anchored': '#f59e0b',
            'Anchored': '#f59e0b',
            'moored': '#6366f1',
            'Docked': '#6366f1',
            'aground': '#ef4444',
            'inactive': '#64748b',
        }
        return colors.get(obj.status, '#64748b')


class VesselPositionUpdateSerializer(serializers.Serializer):
    """Your existing serializer for manual position updates"""
    imo_number = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    speed = serializers.FloatField()
    status = serializers.CharField()


class VesselRouteSerializer(serializers.ModelSerializer):
    """Serializer for vessel with full route"""
    route = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = [
            'id', 'name', 'mmsi', 'imo_number', 'vessel_type', 'type', 'flag',
            'latitude', 'longitude', 'speed', 'course', 'heading',
            'status', 'destination', 'route'
        ]
    
    def get_route(self, obj):
        """Get last 100 positions"""
        positions = obj.positions.all()[:100]
        return VesselPositionSerializer(positions, many=True).data


class VesselDetailSerializer(serializers.ModelSerializer):
    """Detailed vessel info with statistics"""
    latest_position = serializers.SerializerMethodField()
    position_history_count = serializers.SerializerMethodField()
    last_update_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Vessel
        fields = '__all__'
    
    def get_latest_position(self, obj):
        latest = obj.positions.first()
        if latest:
            return VesselPositionSerializer(latest).data
        return None
    
    def get_position_history_count(self, obj):
        return obj.positions.count()
    
    def get_last_update_ago(self, obj):
        if obj.last_position_update:
            from django.utils import timezone
            delta = timezone.now() - obj.last_position_update
            
            if delta.seconds < 60:
                return f"{delta.seconds}s ago"
            elif delta.seconds < 3600:
                return f"{delta.seconds // 60}m ago"
            elif delta.days == 0:
                return f"{delta.seconds // 3600}h ago"
            else:
                return f"{delta.days}d ago"
        return "Never"