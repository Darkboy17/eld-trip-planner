"""Serializers for validating trip-planning API payloads."""

from rest_framework import serializers


class TripPlanRequestSerializer(serializers.Serializer):
    """Validate route anchors and the driver's current 70-hour cycle usage."""

    current_location = serializers.CharField()
    pickup_location = serializers.CharField()
    dropoff_location = serializers.CharField()
    current_cycle_used = serializers.FloatField(
        min_value=0,
        max_value=70,
    )


class TripPlanResponseSerializer(serializers.Serializer):
    """Placeholder for response validation if the generated payload becomes fixed."""

    pass
