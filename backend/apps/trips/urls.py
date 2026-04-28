"""URL routes for the trip-planning API."""

from django.urls import path
from .views import PlanTripView

urlpatterns = [
    # POST endpoint that accepts dispatch inputs and returns the generated trip plan.
    path("plan/", PlanTripView.as_view(), name="plan-trip"),
]
