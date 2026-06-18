from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthorOrReadOnly(BasePermission):
    """
    Read-only for everyone.
    Write access only for the object's author (or staff).
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        # Allow staff to do anything
        if request.user.is_staff:
            return True
        # For Post and Comment, check .author
        return getattr(obj, 'author', None) == request.user
