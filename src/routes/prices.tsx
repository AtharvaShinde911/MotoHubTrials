import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Icon, PageBody, PageHero, SiteShell, Tile } from "@/components/site";
import { brands, vehicles } from "@/lib/mock-data";

type PricesSearch = { q?: string };

export const Route = createFileRoute("/prices")({
  validateSearch: (search: Record<string, unknown>): PricesSearch =>
    typeof search.q === "string" && search.q ? { q: search.q } : {},
  head: () => ({ meta: [{ title: "Vehicle Prices — MOTOHUB" }] }),
  component: PricesPage,
});

function PricesPage() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setQuery = (value: string) =>
    navigate({ search: value ? { q: value } : {}, replace: true });

  const needle = q.trim().toLowerCase();
  const results = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.type}`.toLowerCase().includes(needle),
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="Vehicle Prices"
        title={
          <>
            Know the <span className="text-primary">price</span> before the showroom.
          </>
        }
        intro="Ex-showroom price ranges for popular cars and bikes. Figures are placeholders until a pricing source is connected."
      />
      <PageBody>
        <Tile>
          <label className="relative block">
            <Icon.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="search"
              placeholder="Search car or bike..."
              value={q}
              onChange={(ev) => setQuery(ev.target.value)}
              className="w-full rounded-full border border-border bg-white/[0.04] py-3 pl-10 pr-4 text-sm placeholder:text-foreground/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setQuery(q === b ? "" : b)}
                className={
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
                  (q === b
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-white/[0.03] hover:border-primary/60 hover:bg-primary/10")
                }
              >
                {b}
              </button>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-foreground/50">
                  <th className="pb-3 font-semibold">Model</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold text-right">Ex-showroom</th>
                </tr>
              </thead>
              <tbody>
                {results.map((v) => (
                  <tr key={v.brand + v.model} className="border-t border-border/60">
                    <td className="py-3">
                      <span className="text-foreground/50">{v.brand}</span>{" "}
                      <span className="font-semibold">{v.model}</span>
                    </td>
                    <td className="py-3 text-foreground/70">{v.type}</td>
                    <td className="py-3 text-right font-semibold text-primary">{v.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 && (
              <p className="py-6 text-center text-sm text-foreground/50">
                No vehicles match "{q}".
              </p>
            )}
          </div>
        </Tile>
      </PageBody>
    </SiteShell>
  );
}
