import { createStoredState } from "@/lib/stored";

/*
 * The visitor's city, used for on-road price estimates. Picked on first visit
 * and kept in localStorage. Once sign-in exists, the onboarding flow can call
 * setCity() with the city saved on the user's profile.
 */

export type StateCode = "DL" | "MH" | "KA" | "TN" | "TG" | "GJ" | "UP" | "RJ" | "KL" | "HR";

export type City = { id: string; name: string; state: StateCode; lat: number; lng: number };

export const cities: City[] = [
  { id: "mumbai", name: "Mumbai", state: "MH", lat: 19.076, lng: 72.8777 },
  { id: "pune", name: "Pune", state: "MH", lat: 18.5204, lng: 73.8567 },
  { id: "nagpur", name: "Nagpur", state: "MH", lat: 21.1458, lng: 79.0882 },
  { id: "delhi", name: "New Delhi", state: "DL", lat: 28.6139, lng: 77.209 },
  { id: "gurugram", name: "Gurugram", state: "HR", lat: 28.4595, lng: 77.0266 },
  { id: "noida", name: "Noida", state: "UP", lat: 28.5355, lng: 77.391 },
  { id: "lucknow", name: "Lucknow", state: "UP", lat: 26.8467, lng: 80.9462 },
  { id: "bengaluru", name: "Bengaluru", state: "KA", lat: 12.9716, lng: 77.5946 },
  { id: "chennai", name: "Chennai", state: "TN", lat: 13.0827, lng: 80.2707 },
  { id: "coimbatore", name: "Coimbatore", state: "TN", lat: 11.0168, lng: 76.9558 },
  { id: "hyderabad", name: "Hyderabad", state: "TG", lat: 17.385, lng: 78.4867 },
  { id: "ahmedabad", name: "Ahmedabad", state: "GJ", lat: 23.0225, lng: 72.5714 },
  { id: "surat", name: "Surat", state: "GJ", lat: 21.1702, lng: 72.8311 },
  { id: "jaipur", name: "Jaipur", state: "RJ", lat: 26.9124, lng: 75.7873 },
  { id: "kochi", name: "Kochi", state: "KL", lat: 9.9312, lng: 76.2673 },
  { id: "thiruvananthapuram", name: "Thiruvananthapuram", state: "KL", lat: 8.5241, lng: 76.9366 },
];

export const getCity = (id: string | null | undefined) => cities.find((c) => c.id === id);

/** Closest supported city to a coordinate (equirectangular distance is plenty at this scale). */
export function nearestCity(lat: number, lng: number): City {
  const d = (c: City) => {
    const x = (c.lng - lng) * Math.cos(((c.lat + lat) / 2) * (Math.PI / 180));
    const y = c.lat - lat;
    return x * x + y * y;
  };
  return cities.reduce((best, c) => (d(c) < d(best) ? c : best));
}

/** `undefined` = not asked yet, `null` = visitor skipped the question. */
type Choice = string | null | undefined;

const store = createStoredState<Choice>(
  "motohub.city",
  (raw) => (raw === null ? null : typeof raw === "string" && getCity(raw) ? raw : undefined),
  undefined,
);

export function useCity() {
  const choice = store.use();
  return {
    city: getCity(choice),
    /** True until the visitor has picked a city or skipped the prompt. */
    needsOnboarding: choice === undefined,
    setCity: (id: string) => store.set(id),
    skip: () => store.set(null),
  };
}
