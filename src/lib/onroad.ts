/*
 * On-road price estimate: ex-showroom + road tax + registration + insurance
 * (+ FASTag and TCS for cars). Rates are simplified approximations of each
 * state's rules and published third-party insurance premiums, good for a
 * ballpark only. Dealers add handling and accessory charges on top.
 */
import type { Fuel, Variant, Vehicle, VehicleType } from "@/lib/catalog";
import type { City, StateCode } from "@/lib/location";

/** [upper ex-showroom limit in rupees, road tax %] brackets, last one open-ended. */
type Slabs = [number, number][];

type StateRule = {
  name: string;
  car: Slabs;
  bike: Slabs;
  /** Extra percentage points of road tax on diesel cars. */
  dieselExtra: number;
  /** Road tax % on electric vehicles (many states waive it). */
  ev: number;
};

const L = 100000;

const states: Record<StateCode, StateRule> = {
  DL: {
    name: "Delhi",
    car: [
      [6 * L, 4],
      [10 * L, 7],
      [Infinity, 10],
    ],
    bike: [
      [25000, 2],
      [40000, 3],
      [60000, 4],
      [Infinity, 5],
    ],
    dieselExtra: 2,
    ev: 0,
  },
  MH: {
    name: "Maharashtra",
    car: [
      [10 * L, 11],
      [20 * L, 12],
      [Infinity, 13],
    ],
    bike: [[Infinity, 11]],
    dieselExtra: 2,
    ev: 0,
  },
  KA: {
    name: "Karnataka",
    car: [
      [5 * L, 13],
      [10 * L, 14],
      [20 * L, 17],
      [Infinity, 18],
    ],
    bike: [
      [50000, 10],
      [Infinity, 12],
    ],
    dieselExtra: 0,
    ev: 0,
  },
  TN: {
    name: "Tamil Nadu",
    car: [
      [10 * L, 12],
      [Infinity, 15],
    ],
    bike: [
      [L, 10],
      [Infinity, 12],
    ],
    dieselExtra: 0,
    ev: 0,
  },
  TG: {
    name: "Telangana",
    car: [
      [5 * L, 13],
      [10 * L, 14],
      [20 * L, 17],
      [Infinity, 18],
    ],
    bike: [
      [50000, 12],
      [Infinity, 14],
    ],
    dieselExtra: 0,
    ev: 0,
  },
  GJ: {
    name: "Gujarat",
    car: [[Infinity, 6]],
    bike: [[Infinity, 6]],
    dieselExtra: 0,
    ev: 1,
  },
  UP: {
    name: "Uttar Pradesh",
    car: [
      [10 * L, 8],
      [Infinity, 10],
    ],
    bike: [
      [L, 7],
      [Infinity, 10],
    ],
    dieselExtra: 0,
    ev: 0,
  },
  RJ: {
    name: "Rajasthan",
    car: [
      [8 * L, 8],
      [Infinity, 10],
    ],
    bike: [[Infinity, 8]],
    dieselExtra: 0,
    ev: 0,
  },
  KL: {
    name: "Kerala",
    car: [
      [5 * L, 9],
      [10 * L, 11],
      [15 * L, 13],
      [20 * L, 16],
      [Infinity, 21],
    ],
    bike: [
      [L, 10],
      [2 * L, 12],
      [Infinity, 18],
    ],
    dieselExtra: 0,
    ev: 5,
  },
  HR: {
    name: "Haryana",
    car: [
      [6 * L, 5],
      [10 * L, 8],
      [Infinity, 10],
    ],
    bike: [
      [60000, 4],
      [Infinity, 6],
    ],
    dieselExtra: 0,
    ev: 0,
  },
};

export const stateName = (code: StateCode) => states[code].name;

/** Three-year (car) / five-year (bike) third-party premium by engine size, per IRDAI tariff. */
function thirdParty(type: VehicleType, cc: number | undefined) {
  if (type === "car") {
    if (!cc) return 5543; // EVs: small-motor slab
    return cc <= 1000 ? 6521 : cc <= 1500 ? 11416 : 24596;
  }
  if (!cc) return 2466; // e-scooters
  return cc <= 75 ? 2901 : cc <= 150 ? 3851 : cc <= 350 ? 7365 : 15117;
}

export type OnRoadLine = { label: string; amount: number };
export type OnRoadEstimate = { total: number; lines: OnRoadLine[] };

export function estimateOnRoad(
  input: {
    type: VehicleType;
    exShowroom: number;
    fuel: Fuel;
    displacementCc?: number;
  },
  city: City,
): OnRoadEstimate {
  const rule = states[city.state];
  const { type, exShowroom, fuel } = input;
  const cc = fuel === "Electric" ? undefined : input.displacementCc;

  let taxPct: number;
  if (fuel === "Electric") taxPct = rule.ev;
  else {
    const slabs = type === "car" ? rule.car : rule.bike;
    taxPct = slabs.find(([max]) => exShowroom <= max)![1];
    if (type === "car" && fuel === "Diesel") taxPct += rule.dieselExtra;
  }

  // Comprehensive policy: own-damage cover for year one plus long-term third party.
  const ownDamage = exShowroom * (type === "car" ? 0.022 : 0.016);

  const lines: OnRoadLine[] = [
    { label: "Ex-showroom price", amount: exShowroom },
    { label: `Road tax (${taxPct}%, ${rule.name})`, amount: (exShowroom * taxPct) / 100 },
    { label: "Registration & number plates", amount: type === "car" ? 2500 : 1000 },
    { label: "Insurance (estimated)", amount: ownDamage + thirdParty(type, cc) },
  ];
  if (type === "car") lines.push({ label: "FASTag", amount: 500 });
  if (type === "car" && exShowroom > 10 * L)
    lines.push({ label: "TCS (1%, claimable)", amount: exShowroom / 100 });

  const rounded = lines.map((l) => ({ ...l, amount: Math.round(l.amount) }));
  return { total: rounded.reduce((s, l) => s + l.amount, 0), lines: rounded };
}

/** On-road estimate for one variant of a model. */
export const onRoadFor = (x: Vehicle, v: Variant, city: City) =>
  estimateOnRoad(
    { type: x.type, exShowroom: v.price, fuel: v.fuel, displacementCc: x.specs.displacementCc },
    city,
  );
