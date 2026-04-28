"""Routing service backed by the public OSRM driving route API."""

import requests


class RouteService:
    """Calculate driving routes between geocoded waypoints."""

    # Public OSRM route endpoint for driving profiles.
    BASE_URL = "https://router.project-osrm.org/route/v1/driving"

    def get_route(self, points: list[dict]) -> dict:
        """Return distance, duration, GeoJSON geometry, and route legs for ordered points."""

        # OSRM expects semicolon-separated longitude,latitude coordinate pairs.
        coordinates = ";".join(
            f"{point['lng']},{point['lat']}" for point in points
        )

        response = requests.get(
            f"{self.BASE_URL}/{coordinates}",
            params={
                "overview": "full",
                "geometries": "geojson",
                "steps": "true",
            },
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()

        if data.get("code") != "Ok":
            raise ValueError("Could not calculate route")

        # OSRM returns best-first alternatives; this planner uses the primary route.
        route = data["routes"][0]

        return {
            "distance_miles": route["distance"] / 1609.344,
            "duration_hours": route["duration"] / 3600,
            "geometry": route["geometry"],
            "legs": route["legs"],
        }
