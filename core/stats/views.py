from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from vessels.models import Vessel
from events.models import Event


class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "total_vessels": Vessel.objects.count(),
            "total_events": Event.objects.count(),
        })
