from django.urls import path
from .views import SafetyOverlayView

urlpatterns = [
    path('overlays/', SafetyOverlayView.as_view(), name='safety-overlays'),
]
