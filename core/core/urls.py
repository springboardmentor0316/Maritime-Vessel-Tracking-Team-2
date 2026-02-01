from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from stats.views import StatsView


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/auth/login/", CustomTokenView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Core APIs
    path("api/stats/", StatsView.as_view(), name="stats"),
    path("api/users/", include("users.urls")),

    # Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),

    # Domain APIs
    path("api/", include("vessels.urls")),
    path("api/", include("ports.urls")),
    path("api/", include("voyages.urls")),
    path("api/", include("events.urls")),
    path("api/safety/", include("safety.urls")),
]
