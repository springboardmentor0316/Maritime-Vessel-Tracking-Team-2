from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from vessels.models import Vessel
from rest_framework.viewsets import ModelViewSet
from .models import Port
from .serializers import PortSerializer
from users.permissions import IsAdmin


class PortViewSet(ModelViewSet):
    queryset = Port.objects.all()
    serializer_class = PortSerializer
    permission_classes = [IsAdmin]

class PortCongestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ports = Port.objects.all()
        vessels = Vessel.objects.all()

        result = []

        for port in ports:
            nearby_vessels = vessels.filter(
                latitude__gte=port.latitude - 0.5,
                latitude__lte=port.latitude + 0.5,
                longitude__gte=port.longitude - 0.5,
                longitude__lte=port.longitude + 0.5,
            )

            vessel_count = nearby_vessels.count()

            if vessel_count <= 2:
                congestion = "Normal"
            elif vessel_count <= 5:
                congestion = "Busy"
            else:
                congestion = "Congested"

            result.append({
                "port": port.name,
                "country": port.country,
                "vessel_count": vessel_count,
                "congestion_level": congestion,
            })

        return Response(result)

class PortStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Temporary static response (logic will be added next)
        data = [
            {
                "port": "Sample Port",
                "country": "Sample Country",
                "status": "Operational",
            }
        ]
        return Response(data)
    