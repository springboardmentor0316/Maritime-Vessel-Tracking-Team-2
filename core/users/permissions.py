from rest_framework.permissions import BasePermission, SAFE_METHODS

ADMIN_EMAIL = "admin@gmail.com"


def is_admin_email(user):
    return (
        user
        and user.is_authenticated
        and (user.email or "").strip().lower() == ADMIN_EMAIL
    )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin_email(request.user)


class IsOperator(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Operator").exists()
        )


class IsAnalyst(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Analyst").exists()
        )


class AdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return (
                request.user
                and request.user.is_authenticated
            )
        return is_admin_email(request.user)
