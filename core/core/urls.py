from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/login/", CustomTokenView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/users/", include("users.urls")),
]
