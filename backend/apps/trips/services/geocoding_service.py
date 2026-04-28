import requests


class GeocodingService:
    """Resolve user-entered location strings into map-ready coordinates."""
    
    # Nominatim provides public OpenStreetMap search results without an API key.
    BASE_URL = "https://nominatim.openstreetmap.org/search"

    def geocode(self, location: str) -> dict:
        """Return the best matching coordinate result for a location string."""

        # Include a product User-Agent because Nominatim requires identifiable clients.
        response = requests.get(
            self.BASE_URL,
            params={
                "q": location,
                "format": "json",
                "limit": 1,
            },
            headers={"User-Agent": "eld-trip-planner"},
            timeout=20,
        )
        
        response.raise_for_status()

        data = response.json()
        if not data:
            raise ValueError(f"Could not geocode location: {location}")

        # The route planner uses the highest-ranked geocoder match as the waypoint.
        item = data[0]
        return {
            "name": location,
            "lat": float(item["lat"]),
            "lng": float(item["lon"]),
            "display_name": item["display_name"],
        }
