/*
 * Read access to the vehicle catalog. Pages go through these functions only,
 * so the seeded data in src/data/vehicles.ts can later be replaced by an API
 * or database without touching the UI.
 */
import { vehiclePhotos, type VehiclePhoto } from "@/data/vehicle-photos";
import { vehicleSeed, type Fuel, type VehicleSeed, type VehicleType } from "@/data/vehicles";

export type { Fuel, Specs, Variant, VehicleType } from "@/data/vehicles";
export type { VehiclePhoto } from "@/data/vehicle-photos";

export type Vehicle = VehicleSeed & {
  name: string;
  priceMin: number;
  priceMax: number;
  fuels: Fuel[];
  photo?: VehiclePhoto;
};

const uniq = <T>(xs: T[]) => [...new Set(xs)];

const vehicles: Vehicle[] = vehicleSeed.map((s) => {
  const prices = s.variants.map((x) => x.price);
  return {
    ...s,
    name: `${s.brand} ${s.model}`,
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    fuels: uniq(s.variants.map((x) => x.fuel)),
    photo: vehiclePhotos[s.slug],
  };
});

const bySlug = new Map(vehicles.map((x) => [x.slug, x]));

export const listVehicles = (): Vehicle[] => vehicles;

export const getVehicle = (slug: string): Vehicle | undefined => bySlug.get(slug);

export const listBrands = (type?: VehicleType): { name: string; count: number }[] => {
  const counts = new Map<string, number>();
  for (const x of vehicles) {
    if (type && x.type !== type) continue;
    counts.set(x.brand, (counts.get(x.brand) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
};

export const listBodies = (type?: VehicleType): string[] =>
  uniq(vehicles.filter((x) => !type || x.type === type).map((x) => x.body)).sort();

export const listFuels = (type?: VehicleType): Fuel[] =>
  uniq(vehicles.filter((x) => !type || x.type === type).flatMap((x) => x.fuels)).sort();

/* ---------- filtering ---------- */

export const budgets = {
  car: [
    { key: "u8", label: "Under ₹8 lakh", min: 0, max: 800000 },
    { key: "8-15", label: "₹8–15 lakh", min: 800000, max: 1500000 },
    { key: "15-25", label: "₹15–25 lakh", min: 1500000, max: 2500000 },
    { key: "25+", label: "Above ₹25 lakh", min: 2500000, max: Infinity },
  ],
  bike: [
    { key: "u1", label: "Under ₹1 lakh", min: 0, max: 100000 },
    { key: "1-2", label: "₹1–2 lakh", min: 100000, max: 200000 },
    { key: "2-3", label: "₹2–3 lakh", min: 200000, max: 300000 },
    { key: "3+", label: "Above ₹3 lakh", min: 300000, max: Infinity },
  ],
} as const;

export const sortOptions = [
  { key: "popular", label: "Popular" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "power", label: "Most powerful" },
] as const;

export type SortKey = (typeof sortOptions)[number]["key"];

export type CatalogFilters = {
  q?: string;
  type?: VehicleType;
  brand?: string;
  body?: string;
  fuel?: Fuel;
  budget?: string;
  sort?: SortKey;
};

const allBudgets = [...budgets.car, ...budgets.bike];

export function filterVehicles(f: CatalogFilters): Vehicle[] {
  const words = (f.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const budget = allBudgets.find((b) => b.key === f.budget);

  const out = vehicles.filter((x) => {
    if (f.type && x.type !== f.type) return false;
    if (f.brand && x.brand !== f.brand) return false;
    if (f.body && x.body !== f.body) return false;
    if (f.fuel && !x.fuels.includes(f.fuel)) return false;
    // A model is in budget when any of its variants is.
    if (budget && !(x.priceMin < budget.max && x.priceMax >= budget.min)) return false;
    if (words.length) {
      const hay = `${x.name} ${x.body} ${x.type} ${x.fuels.join(" ")}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });

  switch (f.sort) {
    case "price-asc":
      return out.sort((a, b) => a.priceMin - b.priceMin);
    case "price-desc":
      return out.sort((a, b) => b.priceMin - a.priceMin);
    case "power":
      return out.sort((a, b) => b.specs.powerBhp - a.specs.powerBhp);
    default:
      return out;
  }
}

/** "Off-road SUV" is closer to "SUV" than to "Sedan". */
const bodyDistance = (a: string, b: string) => {
  if (a === b) return 0;
  const family = (s: string) => s.split(" ").pop();
  return family(a) === family(b) ? 0.5 : 1;
};

/** Same type and body style first, then the closest in starting price. */
export function similarVehicles(x: Vehicle, limit = 4): Vehicle[] {
  return vehicles
    .filter((o) => o.type === x.type && o.slug !== x.slug)
    .map((o) => ({
      o,
      score: bodyDistance(o.body, x.body) + Math.abs(Math.log(o.priceMin / x.priceMin)),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ o }) => o);
}

/* ---------- formatting ---------- */

export function formatPrice(rupees: number): string {
  if (rupees >= 1e7) return `₹${trim(rupees / 1e7)} crore`;
  if (rupees >= 1e5) return `₹${trim(rupees / 1e5)} lakh`;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatPriceRange(x: Pick<Vehicle, "priceMin" | "priceMax">): string {
  if (x.priceMin === x.priceMax) return formatPrice(x.priceMin);
  const lo = formatPrice(x.priceMin);
  const hi = formatPrice(x.priceMax);
  // "₹5.79 lakh – ₹8.8 lakh" reads better as "₹5.79 – 8.8 lakh"
  const unit = (s: string) => s.split(" ")[1];
  return unit(lo) && unit(lo) === unit(hi)
    ? `${lo.split(" ")[0]} – ${hi.replace("₹", "")}`
    : `${lo} – ${hi}`;
}

const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, "");

/* ---------- spec rows shared by detail and compare pages ---------- */

type SpecRow = {
  label: string;
  value: (x: Vehicle) => string | undefined;
  /** Numeric value used to highlight the best entry in compare; higher wins unless lowerIsBetter. */
  rank?: (x: Vehicle) => number | undefined;
  lowerIsBetter?: boolean;
};

const unit = (n: number | undefined, u: string) => (n === undefined ? undefined : `${n} ${u}`);

export const specRows: SpecRow[] = [
  {
    label: "Starting price",
    value: (x) => formatPrice(x.priceMin),
    rank: (x) => x.priceMin,
    lowerIsBetter: true,
  },
  { label: "Engine / motor", value: (x) => x.specs.engine },
  { label: "Displacement", value: (x) => unit(x.specs.displacementCc, "cc") },
  { label: "Battery", value: (x) => unit(x.specs.batteryKwh, "kWh") },
  {
    label: "Max power",
    value: (x) => unit(x.specs.powerBhp, "bhp"),
    rank: (x) => x.specs.powerBhp,
  },
  {
    label: "Max torque",
    value: (x) => unit(x.specs.torqueNm, "Nm"),
    rank: (x) => x.specs.torqueNm,
  },
  { label: "Transmission", value: (x) => x.specs.transmission },
  { label: "Fuel", value: (x) => x.fuels.join(", ") },
  { label: "Mileage / range", value: (x) => x.specs.efficiency },
  {
    label: "Top speed",
    value: (x) => unit(x.specs.topSpeedKmph, "km/h"),
    rank: (x) => x.specs.topSpeedKmph,
  },
  { label: "Seating", value: (x) => unit(x.specs.seating, "seats"), rank: (x) => x.specs.seating },
  { label: "Fuel tank", value: (x) => unit(x.specs.fuelTankL, "litres") },
  { label: "Boot space", value: (x) => unit(x.specs.bootL, "litres"), rank: (x) => x.specs.bootL },
  {
    label: "Ground clearance",
    value: (x) => unit(x.specs.groundClearanceMm, "mm"),
    rank: (x) => x.specs.groundClearanceMm,
  },
  {
    label: "Kerb weight",
    value: (x) => unit(x.specs.kerbWeightKg, "kg"),
    rank: (x) => x.specs.kerbWeightKg,
    lowerIsBetter: true,
  },
  { label: "Seat height", value: (x) => unit(x.specs.seatHeightMm, "mm") },
  { label: "Safety rating", value: (x) => x.safety },
  { label: "Variants", value: (x) => String(x.variants.length) },
];
