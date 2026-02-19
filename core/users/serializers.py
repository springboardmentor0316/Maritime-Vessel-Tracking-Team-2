from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from .models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework import serializers
from .permissions import is_admin_email



class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod 
    def get_token(cls, user):
        token = super().get_token(user)
        effective_role = "admin" if is_admin_email(user) else ("operator" if user.role == "admin" else user.role)
        token["email"] = user.email
        token["role"] = effective_role
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "role"]

    def validate_role(self, value):
        if value not in ["operator", "analyst"]:
            raise serializers.ValidationError(
                "You cannot register as admin."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"]
        )
        return user
    
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    uid = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
