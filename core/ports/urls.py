from django.urls import path
from .views import PortListView,  DashboardView

urlpatterns = [

    path("ports/", PortListView.as_view()),

    path("dashboard/", DashboardView.as_view()),  
]

