from django.urls import path
from .views import MeView,RegisterView
from .views import ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("register/", RegisterView.as_view(), name="register"),
    path("forget-password/", ForgotPasswordView.as_view(), name="forget-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]
