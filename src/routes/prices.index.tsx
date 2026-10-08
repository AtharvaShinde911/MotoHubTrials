import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Chip, CompareTray, VehicleCard } from "@/components/catalog";
import { Icon, PageBody, PageHero, SiteShell, Tile } from "@/components/site";
import {
  budgets,
  filterVehicles,
  listBodies,
  listBrands,
  listFuels,
  sortOptions,
  type CatalogFilters,
  type Fuel,
  type SortKey,
} from "@/lib/catalog";

const str = (x: unknown) => (typeof x === "string" && x.trim() ? x : undefined);

export const Route = createFileRoute("/prices/")({
  validateSearch: (search: Record<string, unknown>): CatalogFilters => {
    const type = search.type === "car" || search.type === "bike" ? search.type : undefined;
    const sort = sortOptions.some((o) => o.key === search.sort)
      ? (search.sort as SortKey)
      : undefined;
    const out: CatalogFilters = {
      q: str(search.q),
      type,
      brand: str(search.brand),
      body: str(search.body),
      fuel: str(search.fuel) as Fuel | undefined,
      budget: type ? str(search.budget) : undefined,
      sort,
    };
    // Drop empty keys so URLs stay clean.
    return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined));
  },
  head: () => ({
    meta: [
      { title: "Car & Bike Prices in India — MOTOHUB" },
      {
        name: "description",
        content:
          "Browse ex-showroom prices, variants and specs for popular cars and bikes in India. Filter by brand, body type, fuel and budget.",
      },
    ],
  }),
  component: PricesPage,
});

const selectCls =
  "rounded-full border border-border bg-white/[0.04] px-3 py-2 text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 [&>option]:bg-background";

function PricesPage() {
  const filters = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const update = (patch: Partial<CatalogFilters>) =>
    navigate({
      search: (prev) =>
        Object.fromEntries(
          Object.entries({ ...prev, ...patch }).filter(([, v]) => v !== undefined && v !== ""),
        ),
      replace: true,
    });

  const { q = "", type, brand, body, fuel, budget, sort = "popular" } = filters;
  const results = filterVehicles(filters);
  const brands = listBrands(type);
  const bodies = listBodies(type);
  const fuels = listFuels(type);
  const hasFilters = Object.keys(filters).some((k) => k !== "sort");

  const setType = (next?: "car" | "bike") =>
    update({
      type: next,
      // Keep a filter only if it still exists for the new type.
      brand: brand && listBrands(next).some((b) => b.name === brand) ? brand : undefined,
      body: body && listBodies(next).includes(body) ? body : undefined,
      fuel: fuel && listFuels(next).includes(fuel) ? fuel : undefined,
      budget: undefined,
    });

  return (
    <SiteShell>
      <PageHero
        eyebrow="Vehicle Prices"
        title={
          <>
            Every <span className="text-primary">car</span> and{" "}
            <span className="text-primary">bike</span>, one place.
          </>
        }
        intro="Ex-showroom prices, variants and key specs for popular models on sale in India. Open any model for full details, or add up to three to compare."
      />
      <PageBody>
        <Tile>
          <label className="relative block">
            <Icon.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="search"
              placeholder="Search by brand, model, body type or fuel…"
              value={q}
              onChange={(ev) => update({ q: ev.target.value || undefined })}
              className="w-full rounded-full border border-border bg-white/[0.04] py-3 pl-10 pr-4 text-sm placeholder:text-foreground/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip active={!type} onClick={() => setType(undefined)}>
              All
            </Chip>
            <Chip active={type === "car"} onClick={() => setType("car")}>
              Cars
            </Chip>
            <Chip active={type === "bike"} onClick={() => setType("bike")}>
              Bikes &amp; scooters
            </Chip>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {brands.map((b) => (
              <Chip
                key={b.name}
                active={brand === b.name}
                onClick={() => update({ brand: brand === b.name ? undefined : b.name })}
              >
                {b.name} <span className="text-foreground/40">{b.count}</span>
              </Chip>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              aria-label="Body type"
              value={body ?? ""}
              onChange={(ev) => update({ body: ev.target.value || undefined })}
              className={selectCls}
            >
              <option value="">Any body type</option>
              {bodies.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <select
              aria-label="Fuel"
              value={fuel ?? ""}
              onChange={(ev) =>
                update({ fuel: (ev.target.value || undefined) as Fuel | undefined })
              }
              className={selectCls}
            >
              <option value="">Any fuel</option>
              {fuels.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            {type && (
              <select
                aria-label="Budget"
                value={budget ?? ""}
                onChange={(ev) => update({ budget: ev.target.value || undefined })}
                className={selectCls}
              >
                <option value="">Any budget</option>
                {budgets[type].map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
            )}
            <select
              aria-label="Sort"
              value={sort}
              onChange={(ev) =>
                update({
                  sort: ev.target.value === "popular" ? undefined : (ev.target.value as SortKey),
                })
              }
              className={selectCls}
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={() => navigate({ search: {}, replace: true })}
                className="ml-auto text-xs font-semibold text-foreground/60 hover:text-primary"
              >
                Clear all
              </button>
            )}
          </div>
        </Tile>

        <p className="mt-6 mb-3 text-xs text-foreground/50">
          {results.length} {results.length === 1 ? "model" : "models"}
          {!type && " · pick Cars or Bikes to filter by budget"}
        </p>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((x) => (
              <VehicleCard key={x.slug} vehicle={x} />
            ))}
          </div>
        ) : (
          <Tile className="items-center py-12 text-center">
            <p className="text-sm text-foreground/60">No models match these filters.</p>
            <button
              type="button"
              onClick={() => navigate({ search: {}, replace: true })}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          </Tile>
        )}

        <p className="mt-8 text-[11px] text-foreground/40">
          Prices are indicative ex-showroom (Delhi) and may differ by city and dealer. Specs are
          manufacturer-claimed.
        </p>
        <div className="h-16" />
      </PageBody>
      <CompareTray />
    </SiteShell>
  );
}
