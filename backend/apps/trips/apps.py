"""Django app configuration for trip-planning services and API routes."""

from django.apps import AppConfig


class TripsConfig(AppConfig):
    """Register the trips app under the backend apps namespace."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.trips"
