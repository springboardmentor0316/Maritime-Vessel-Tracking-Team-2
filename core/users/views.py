from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema

from .serializers import (
    RegisterSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)
from .permissions import is_admin_email

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

User = get_user_model()
token_generator = PasswordResetTokenGenerator()


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        effective_role = "admin" if is_admin_email(user) else ("operator" if user.role == "admin" else user.role)
        return Response({
            "id": user.id,
            "email": user.email,
            "role": effective_role,
        })


@extend_schema(request=RegisterSerializer)
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED
        )


@extend_schema(request=ForgotPasswordSerializer)
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal whether email exists
            return Response(
                {"message": "If the email exists, a reset token has been generated."},
                status=status.HTTP_200_OK,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        return Response(
            {
                "uid": uid,
                "token": token,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(request=ResetPasswordSerializer)
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {"error": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not token_generator.check_token(user, token):
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=status.HTTP_200_OK
        )
