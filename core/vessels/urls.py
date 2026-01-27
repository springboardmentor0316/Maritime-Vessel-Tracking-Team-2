from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    VesselViewSet,
    LiveVesselView,
    UpdateVesselPositionView,
)

router = DefaultRouter()
router.register(r'vessels', VesselViewSet, basename='vessel')

urlpatterns = [
    # Your existing custom endpoints (preserved)
    path("vessels/live-all/", LiveVesselView.as_view(), name="live-vessels-all"),  # Renamed to avoid conflict
    path(
        "vessels/update-position/",
        UpdateVesselPositionView.as_view(),
        name="update-vessel-position",
    ),
]

# Router endpoints (includes new AIS endpoints)
urlpatterns += router.urls