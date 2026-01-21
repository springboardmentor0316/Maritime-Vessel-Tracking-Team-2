from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/login/", CustomTokenView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/users/", include("users.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),

    # APIs
    path('api/users/', include('users.urls')),
    path('api/', include('vessels.urls')),
    path('api/', include('ports.urls')),
    path('api/', include('voyages.urls')),
    path('api/', include('events.urls')),
    path('api/safety/', include('safety.urls')),
]
