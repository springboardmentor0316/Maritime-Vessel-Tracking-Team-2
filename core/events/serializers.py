from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    vessel_name = serializers.CharField(source='vessel.name', read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'vessel', 'vessel_name', 'event_type', 'description', 'severity', 'timestamp']
