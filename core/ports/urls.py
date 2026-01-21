from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PortViewSet, PortCongestionView, PortStatusView

router = DefaultRouter()
router.register(r'ports', PortViewSet, basename='port')

urlpatterns = [
    path("ports/congestion/", PortCongestionView.as_view(), name="port-congestion"),
    path("ports/status/", PortStatusView.as_view(), name="port-status"),
]

urlpatterns += router.urls
