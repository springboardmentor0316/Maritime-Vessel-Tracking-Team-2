from datetime import timedelta

from django.utils.timezone import now
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics

from ports.models import Port
from vessels.models import Vessel
from ports.serializers import PortSerializer
from users.permissions import IsAdmin

from .pagination import DashboardPagination


# =========================
# PORT CRUD (ADMIN)
# =========================

class PortViewSet(ModelViewSet):

    queryset = Port.objects.all().order_by("name")
    serializer_class = PortSerializer
    permission_classes = [IsAdmin]


# =========================
# PORT LIST (BASIC)
# =========================

class PortListView(generics.ListAPIView):

    queryset = Port.objects.all().order_by("name")
    serializer_class = PortSerializer
    permission_classes = [IsAuthenticated]


# =========================
# PORT DASHBOARD (MAIN API)
# =========================

class DashboardView(APIView):

    permission_classes = [IsAuthenticated]
    pagination_class = DashboardPagination


    def get(self, request):

        query = request.GET.get("search", "").strip()

        ports = Port.objects.all()

        if query:
         ports = ports.filter(
          name__icontains=query
         ) | ports.filter(
         country__icontains=query
        )

        ports = ports.order_by("name")
        

        paginator = DashboardPagination()
        page = paginator.paginate_queryset(ports, request)

        recent_time = now() - timedelta(hours=6)

        vessels = Vessel.objects.filter(
            updated_at__gte=recent_time
        )


        data = []

        for port in page:

            lat = port.latitude
            lon = port.longitude


            # ---------- LOCATION ----------
            location = port.city if hasattr(port, "city") and port.city else None


            # ---------- VESSELS NEAR PORT ----------
            nearby = vessels.filter(
                latitude__range=(lat - 0.4, lat + 0.4),
                longitude__range=(lon - 0.4, lon + 0.4),
            ).count()


            # ---------- CONGESTION ----------
            if nearby <= 3:
                congestion = 20
            elif nearby <= 8:
                congestion = 50
            else:
                congestion = 80


            # ---------- WAIT TIME ----------
            avg_wait = round(nearby * 0.8, 1)


            data.append({
                "id": port.id,
                "name": port.name,
                "location": location,
                "country": port.country,

                "congestion": congestion,
                "avg_wait_time": avg_wait,

                "arrivals": max(0, nearby // 2),
                "departures": max(0, nearby // 3),

                "last_update": now(),
            })


        return paginator.get_paginated_response(data)

# =========================
# PORT CONGESTION (FAST)
# =========================

class PortCongestionView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        ports = Port.objects.only(
            "id",
            "name",
            "country",
            "latitude",
            "longitude"
        )


        recent_time = now() - timedelta(minutes=10)

        vessels = Vessel.objects.filter(
            updated_at__gte=recent_time
        ).only("latitude", "longitude")


        result = []


        for port in ports:

            if not port.latitude or not port.longitude:
                continue


            nearby = vessels.filter(
                latitude__range=(port.latitude - 0.5, port.latitude + 0.5),
                longitude__range=(port.longitude - 0.5, port.longitude + 0.5),
            )


            count = nearby.count()


            if count <= 2:
                congestion = "Normal"
            elif count <= 5:
                congestion = "Busy"
            else:
                congestion = "Congested"


            result.append({

                "port": port.name,
                "country": port.country,

                "vessel_count": count,
                "congestion_level": congestion,
            })


        return Response(result)


# =========================
# PORT STATUS
# =========================

class PortStatusView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        ports = Port.objects.only(
            "id",
            "name",
            "country",
            "latitude",
            "longitude"
        )


        recent_time = now() - timedelta(minutes=15)

        vessels = Vessel.objects.filter(
            updated_at__gte=recent_time
        )


        result = []


        for port in ports:

            if not port.latitude or not port.longitude:
                continue


            nearby = vessels.filter(
                latitude__range=(port.latitude - 0.3, port.latitude + 0.3),
                longitude__range=(port.longitude - 0.3, port.longitude + 0.3),
            )


            count = nearby.count()


            if count > 10:
                status = "Overloaded"
            elif count > 3:
                status = "Busy"
            else:
                status = "Operational"


            result.append({

                "port": port.name,
                "country": port.country,

                "status": status,
                "nearby_vessels": count,
            })


        return Response(result)
