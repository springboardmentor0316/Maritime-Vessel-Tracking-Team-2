from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


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
        ]

        return Response(data)


class SafetyAlertView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # TEMP: disable heavy logic
        return Response([])
