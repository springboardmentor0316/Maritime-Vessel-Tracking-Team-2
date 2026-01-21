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
    # custom endpoints FIRST
    path("vessels/live/", LiveVesselView.as_view(), name="live-vessels"),
    path(
        "vessels/update-position/",
        UpdateVesselPositionView.as_view(),
        name="update-vessel-position",
    ),
]

# router endpoints AFTER
urlpatterns += router.urls
