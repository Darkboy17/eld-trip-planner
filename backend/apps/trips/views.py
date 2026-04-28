"""API views for geocoding, routing, HOS planning, and log generation."""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TripPlanRequestSerializer
from .services.geocoding_service import GeocodingService
from .services.route_service import RouteService
from .services.hos_planner import HOSPlanner
from .services.log_sheet_builder import LogSheetBuilder


class PlanTripView(APIView):
    """Build a complete truck trip plan from dispatch form inputs."""

    def post(self, request):
        """Validate input, coordinate planning services, and return the generated plan."""

        serializer = TripPlanRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

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
            # Surface service failures to the client while preserving an HTTP error status.
            return Response(
                {"detail": str(error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
