from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Admin").exists()
        )


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
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Admin").exists()
        )
