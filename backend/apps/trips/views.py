"""API views for geocoding, routing, HOS planning, and log generation."""

import logging
from time import perf_counter

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TripPlanRequestSerializer
from .services.geocoding_service import GeocodingService
from .services.route_service import RouteService
from .services.hos_planner import HOSPlanner
from .services.log_sheet_builder import LogSheetBuilder
from .services.memory_usage import get_memory_usage_snapshot


logger = logging.getLogger(__name__)


class PlanTripView(APIView):
    """Build a complete truck trip plan from dispatch form inputs."""

    def post(self, request):
        """Validate input, coordinate planning services, and return the generated plan."""

        serializer = TripPlanRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        started_at = perf_counter()
        start_memory = get_memory_usage_snapshot()

        logger.info(
            "Trip plan API request started memory=%s",
            start_memory,
        )

        try:
            # Keep service orchestration in the view while calculation details stay isolated.
            geocoder = GeocodingService()
            route_service = RouteService()
            planner = HOSPlanner()
            log_builder = LogSheetBuilder()

            # Convert user-entered place names into routeable coordinates.
            current = geocoder.geocode(data["current_location"])
            pickup = geocoder.geocode(data["pickup_location"])
            dropoff = geocoder.geocode(data["dropoff_location"])

            # Route through current location, pickup, and final dropoff in order.
            route = route_service.get_route([current, pickup, dropoff])

            # HOS planning uses distance plus cycle usage to produce events and stops.
            trip_plan = planner.build_plan(
                distance_miles=route["distance_miles"],
                current_cycle_used=data["current_cycle_used"],
                current_location=data["current_location"],
                pickup_location=data["pickup_location"],
                dropoff_location=data["dropoff_location"],
            )

            # Daily logs are derived from the same duty events returned in the plan.
            logs = log_builder.build_daily_logs(trip_plan["events"])

            end_memory = get_memory_usage_snapshot()
            logger.info(
                "Trip plan API request finished duration_ms=%s memory=%s memory_delta=%s",
                round((perf_counter() - started_at) * 1000, 2),
                end_memory,
                _memory_delta(start_memory, end_memory),
            )

            return Response({
                "locations": {
                    "current": current,
                    "pickup": pickup,
                    "dropoff": dropoff,
                },
                "route": route,
                "trip_plan": trip_plan,
                "daily_logs": logs,
            })

        except Exception as error:
            error_memory = get_memory_usage_snapshot()
            logger.exception(
                "Trip plan API request failed duration_ms=%s memory=%s memory_delta=%s",
                round((perf_counter() - started_at) * 1000, 2),
                error_memory,
                _memory_delta(start_memory, error_memory),
            )
            # Surface service failures to the client while preserving an HTTP error status.
            return Response(
                {"detail": str(error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


def _memory_delta(start_memory: dict, end_memory: dict) -> dict:
    return {
        "process_rss_mb": _subtract_memory_value(
            start_memory.get("process_rss_mb"),
            end_memory.get("process_rss_mb"),
        ),
        "system_available_mb": _subtract_memory_value(
            start_memory.get("system_available_mb"),
            end_memory.get("system_available_mb"),
        ),
        "system_used_percent": _subtract_memory_value(
            start_memory.get("system_used_percent"),
            end_memory.get("system_used_percent"),
        ),
    }


def _subtract_memory_value(start_value, end_value):
    if start_value is None or end_value is None:
        return None

    return round(end_value - start_value, 2)
