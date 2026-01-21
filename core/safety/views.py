from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from vessels.models import Vessel


class SafetyOverlayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = [
            {
                "type": "Storm",
                "severity": "High",
                "latitude": 18.5,
                "longitude": 72.8,
                "radius_km": 120
            },
            {
                "type": "Piracy",
                "severity": "Medium",
                "latitude": 12.9,
                "longitude": 50.2,
                "radius_km": 80
            },
            {
                "type": "Accident Zone",
                "severity": "Low",
                "latitude": 15.3,
                "longitude": 73.9,
                "radius_km": 40
            }
        ]
        return Response(data)


class SafetyAlertView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        safety_zones = [
            {
                "type": "Storm",
                "severity": "High",
                "latitude": 18.5,
                "longitude": 72.8,
            },
            {
                "type": "Piracy",
                "severity": "Medium",
                "latitude": 12.9,
                "longitude": 50.2,
            },
            {
                "type": "Accident Zone",
                "severity": "Low",
                "latitude": 15.3,
                "longitude": 73.9,
            },
        ]

        vessels = Vessel.objects.all()
        alerts = []

        for vessel in vessels:
            for zone in safety_zones:
                if (
                    abs(vessel.latitude - zone["latitude"]) <= 1
                    and abs(vessel.longitude - zone["longitude"]) <= 1
                ):
                    alerts.append({
                        "vessel": vessel.name,
                        "imo_number": vessel.imo_number,
                        "risk_type": zone["type"],
                        "severity": zone["severity"],
                    })

        return Response(alerts)
