import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";

import { VehicleArt } from "@/components/catalog";
import { PageBody, PageHero, SiteShell, Tile } from "@/components/site";
import { formatPriceRange, getVehicle, listVehicles, specRows, type Vehicle } from "@/lib/catalog";
import { MAX_COMPARE, useCompare } from "@/lib/compare";

type CompareSearch = { ids?: string };

export const Route = createFileRoute("/compare")({
  validateSearch: (search: Record<string, unknown>): CompareSearch =>
    typeof search.ids === "string" && search.ids ? { ids: search.ids } : {},
  head: () => ({ meta: [{ title: "Compare cars & bikes — MOTOHUB" }] }),
  component: ComparePage,
});

const selectCls =
  "w-full rounded-full border border-border bg-white/[0.04] px-3 py-2 text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 [&>option]:bg-background";

function ComparePage() {
  const { ids } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const compare = useCompare();

  const urlSlugs = (ids ?? "")
    .split(",")
    .filter((s) => getVehicle(s))
    .slice(0, MAX_COMPARE);

  // Opened without ids (e.g. from a nav link): fall back to whatever is in the tray.
  useEffect(() => {
    if (!ids && compare.slugs.length) {
      navigate({ search: { ids: compare.slugs.join(",") }, replace: true });
    }
  }, [ids, compare.slugs, navigate]);

  const setSlugs = (next: string[]) => {
    const clean = [...new Set(next.filter(Boolean))].slice(0, MAX_COMPARE);
    compare.replace(clean);
    navigate({ search: clean.length ? { ids: clean.join(",") } : {}, replace: true });
  };

  const picked = urlSlugs.map((s) => getVehicle(s)).filter((x): x is Vehicle => !!x);
  const slots: (Vehicle | undefined)[] = [...picked];
  while (slots.length < MAX_COMPARE) slots.push(undefined);

  const all = listVehicles();
  const mixed = new Set(picked.map((x) => x.type)).size > 1;

  return (
    <SiteShell>
      <PageHero
        eyebrow="Compare"
        title={
          <>
            Side by side, <span className="text-primary">spec for spec</span>.
          </>
        }
        intro="Pick up to three cars or bikes. The best figure in each row is highlighted."
      />
      <PageBody>
        <Tile>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed text-sm">
              <colgroup>
                <col className="w-40" />
                {slots.map((_, i) => (
                  <col key={i} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th />
                  {slots.map((x, i) => (
                    <th key={i} className="px-2 pb-4 align-top text-left font-normal">
                      {x ? (
                        <div>
                          <div className="relative">
                            <VehicleArt vehicle={x} className="aspect-[16/10] w-full" />
                            <button
                              type="button"
                              aria-label={`Remove ${x.name}`}
                              onClick={() => setSlugs(urlSlugs.filter((s) => s !== x.slug))}
                              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 hover:bg-background"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <Link
                            to="/prices/$slug"
                            params={{ slug: x.slug }}
                            className="mt-2 block font-bold hover:text-primary"
                          >
                            {x.name}
                          </Link>
                          <p className="text-xs font-semibold text-primary">
                            {formatPriceRange(x)}
                          </p>
                        </div>
                      ) : (
                        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-3">
                          <span className="text-xs text-foreground/50">Add a model</span>
                          <select
                            aria-label={`Model ${i + 1}`}
                            value=""
                            onChange={(ev) => setSlugs([...urlSlugs, ev.target.value])}
                            className={selectCls}
                          >
                            <option value="">Choose…</option>
                            {(["car", "bike"] as const).map((t) => (
                              <optgroup key={t} label={t === "car" ? "Cars" : "Bikes & scooters"}>
                                {all
                                  .filter((o) => o.type === t && !urlSlugs.includes(o.slug))
                                  .map((o) => (
                                    <option key={o.slug} value={o.slug}>
                                      {o.name}
                                    </option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {picked.length > 0 &&
                  specRows.map((r) => {
                    const vals = slots.map((x) => (x ? r.value(x) : undefined));
                    if (vals.every((v) => !v)) return null;
                    const best = bestIndex(slots, r.rank, r.lowerIsBetter);
                    return (
                      <tr key={r.label} className="border-t border-border/60">
                        <th className="py-2.5 pr-2 text-left text-xs font-semibold uppercase tracking-widest text-foreground/50">
                          {r.label}
                        </th>
                        {vals.map((val, i) => (
                          <td
                            key={i}
                            className={
                              "px-2 py-2.5 align-top " +
                              (i === best ? "font-bold text-primary" : "text-foreground/80")
                            }
                          >
                            {slots[i] ? (val ?? "—") : ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {picked.length === 0 && (
            <p className="py-6 text-center text-sm text-foreground/60">
              Choose a model above, or{" "}
              <Link to="/prices" className="font-semibold text-primary hover:underline">
                browse the catalog
              </Link>{" "}
              and tap Compare on any card.
            </p>
          )}
          {mixed && (
            <p className="mt-4 text-xs text-foreground/50">
              You're comparing a car with a bike, so some rows only apply to one of them.
            </p>
          )}
        </Tile>
      </PageBody>
    </SiteShell>
  );
}

/** Index of the single best value in a row, or -1 when there is nothing to rank or it's a tie. */
function bestIndex(
  slots: (Vehicle | undefined)[],
  rank: ((x: Vehicle) => number | undefined) | undefined,
  lowerIsBetter = false,
): number {
  if (!rank) return -1;
  const scored = slots
    .map((x, i) => ({ i, n: x ? rank(x) : undefined }))
    .filter((s): s is { i: number; n: number } => s.n !== undefined);
  if (scored.length < 2) return -1;
  scored.sort((a, b) => (lowerIsBetter ? a.n - b.n : b.n - a.n));
  return scored[0].n === scored[1].n ? -1 : scored[0].i;
}
