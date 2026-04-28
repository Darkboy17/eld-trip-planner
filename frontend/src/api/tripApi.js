import axios from "axios";

// Shared Axios client for the trip-planning backend.
// Vite exposes VITE_API_BASE_URL at build time for environment-specific API roots.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * Submit the dispatch form payload and return the complete trip plan response.
 *
 * Expected payload shape:
 * - current_location, pickup_location, dropoff_location: address/search strings
 * - current_cycle_used: number of hours already used in the current cycle
 */
export async function planTrip(payload) {
  const response = await api.post("/trips/plan/", payload);
  return response.data;
}
