from rest_framework import serializers
from .models import Vessel

class VesselSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = '__all__'
class VesselLiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vessel
        fields = [
            "id",
            "name",
            "imo_number",
            "latitude",
            "longitude",
            "speed",
            "status",
            "last_updated",
        ]
class VesselPositionUpdateSerializer(serializers.Serializer):
    imo_number = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    speed = serializers.FloatField()
    status = serializers.CharField()
