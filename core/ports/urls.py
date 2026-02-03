from django.urls import path
from .views import DashboardView

urlpatterns = [

    # Main dashboard endpoint
    path("dashboard/", DashboardView.as_view(), name="ports-dashboard"),

]
