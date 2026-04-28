import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useTheme } from "../theme/useTheme";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

/**
 * Renders the planned trip route and its key waypoints.
 *
 * Expected data shape:
 * - data.locations.current/pickup/dropoff: { lat, lng }
 * - data.route.geometry: valid GeoJSON LineString or MultiLineString
 */
export default function RouteMap({ data }) {
  const { theme } = useTheme();
  const { current, pickup, dropoff } = data.locations;

  // Center the initial map viewport on the driver's current location.
  const center = [current.lat, current.lng];

  return (
    <section className={`overflow-hidden ${theme.card}`}>
      <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={theme.sectionTitle}>Route map</h2>
          <p className={theme.sectionSubtitle}>
            Current, pickup, and destination waypoints with the calculated path.
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-md border border-[#d9e0e8] bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#637083]">
          <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
          Route active
        </div>
      </div>

      <div className="route-map-frame h-90 overflow-hidden rounded-lg border border-[#d9e0e8] sm:h-107.5 lg:h-130">
        {/* Leaflet owns the map canvas; React controls only the route and waypoint inputs. */}
        <MapContainer center={center} zoom={5} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Waypoint markers keep dispatch-critical points discoverable on the map. */}
          <Marker position={[current.lat, current.lng]}>
            <Popup>Current location</Popup>
          </Marker>

          <Marker position={[pickup.lat, pickup.lng]}>
            <Popup>Pickup location</Popup>
          </Marker>

          <Marker position={[dropoff.lat, dropoff.lng]}>
            <Popup>Dropoff location</Popup>
          </Marker>

          {/* Render the backend-calculated route geometry as the authoritative path. */}
          <GeoJSON
            data={data.route.geometry}
            style={{
              color: "#0b6bcb",
              weight: 5,
              opacity: 0.86,
            }}
          />
        </MapContainer>
      </div>
    </section>
  );
}
