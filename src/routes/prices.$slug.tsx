import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { CompareToggle, CompareTray, VehicleArt, VehicleCard } from "@/components/catalog";
import { PriceBox } from "@/components/price";
import { PageBody, SiteShell, Tile, TileTitle } from "@/components/site";
import {
  cheapestVariant,
  formatPrice,
  formatPriceRange,
  getVehicle,
  similarVehicles,
  specRows,
  type Variant,
} from "@/lib/catalog";

export const Route = createFileRoute("/prices/$slug")({
  loader: ({ params }) => {
    const vehicle = getVehicle(params.slug);
    if (!vehicle) throw notFound();
    return { vehicle };
  },
  head: ({ loaderData }) => {
    const x = loaderData?.vehicle;
    if (!x) return { meta: [{ title: "Model not found — MOTOHUB" }] };
    return {
      meta: [
        { title: `${x.name} price, variants & specs — MOTOHUB` },
        {
          name: "description",
          content: `${x.name} ex-showroom price ${formatPriceRange(x)}. ${x.summary}`,
        },
      ],
    };
  },
  component: VehiclePage,
});

function VehiclePage() {
  const { vehicle: x } = Route.useLoaderData();
  const [picked, setPicked] = useState<string>();
  // Falls back to the base variant, including after navigating to another model.
  const variant = x.variants.find((v) => v.name === picked) ?? cheapestVariant(x);
  const setVariant = (v: Variant) => setPicked(v.name);
  const s = x.specs;
  const keySpecs = [
    s.batteryKwh
      ? { label: "Battery", value: `${s.batteryKwh} kWh` }
      : s.displacementCc
        ? { label: "Engine", value: `${s.displacementCc} cc` }
        : undefined,
    { label: "Power", value: `${s.powerBhp} bhp` },
    s.torqueNm ? { label: "Torque", value: `${s.torqueNm} Nm` } : undefined,
    { label: x.fuels.includes("Electric") ? "Range" : "Mileage", value: s.efficiency },
    s.seating ? { label: "Seating", value: `${s.seating}` } : undefined,
    s.kerbWeightKg ? { label: "Kerb weight", value: `${s.kerbWeightKg} kg` } : undefined,
  ].filter((k): k is { label: string; value: string } => !!k);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <nav className="text-xs text-foreground/50">
          <Link to="/prices" className="hover:text-primary">
            Prices
          </Link>
          {" / "}
          <Link to="/prices" search={{ type: x.type }} className="hover:text-primary">
            {x.type === "car" ? "Cars" : "Bikes"}
          </Link>
          {" / "}
          <Link
            to="/prices"
            search={{ type: x.type, brand: x.brand }}
            className="hover:text-primary"
          >
            {x.brand}
          </Link>
        </nav>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <figure>
            <VehicleArt vehicle={x} className="aspect-[16/10] w-full" />
            {x.photo && (
              <figcaption className="mt-1.5 text-[11px] text-foreground/40">
                Photo:{" "}
                <a
                  href={x.photo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  {x.photo.credit}
                </a>
                , {x.photo.license}
              </figcaption>
            )}
          </figure>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
              {x.brand} · {x.body}
            </p>
            <h1 className="mt-2 text-3xl sm:text-5xl font-black leading-[1.02] tracking-tight">
              {x.model}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-foreground/60">{x.summary}</p>
            <PriceBox vehicle={x} variant={variant} onVariant={setVariant} />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <CompareToggle slug={x.slug} />
              {x.safety && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> {x.safety}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <PageBody>
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
          <Tile className="lg:col-span-3">
            <TileTitle>Key specs</TileTitle>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {keySpecs.map((k) => (
                <div
                  key={k.label}
                  className="rounded-2xl border border-border/60 bg-white/[0.02] p-3"
                >
                  <dt className="text-[11px] uppercase tracking-widest text-foreground/50">
                    {k.label}
                  </dt>
                  <dd className="mt-1 text-sm font-bold">{k.value}</dd>
                </div>
              ))}
            </dl>
          </Tile>

          <Tile className="lg:col-span-2">
            <TileTitle>Variants &amp; prices</TileTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-foreground/50">
                    <th className="pb-3 font-semibold">Variant</th>
                    <th className="pb-3 font-semibold">Fuel</th>
                    <th className="pb-3 font-semibold">Transmission</th>
                    <th className="pb-3 font-semibold text-right">Ex-showroom</th>
                  </tr>
                </thead>
                <tbody>
                  {[...x.variants]
                    .sort((a, b) => a.price - b.price)
                    .map((vr) => (
                      <tr
                        key={vr.name}
                        onClick={() => setVariant(vr)}
                        aria-selected={vr.name === variant.name}
                        className={
                          "cursor-pointer border-t border-border/60 hover:bg-white/[0.03] " +
                          (vr.name === variant.name ? "bg-primary/10" : "")
                        }
                      >
                        <td className="py-3 font-semibold">{vr.name}</td>
                        <td className="py-3 text-foreground/70">{vr.fuel}</td>
                        <td className="py-3 text-foreground/70">{vr.transmission}</td>
                        <td className="py-3 text-right font-semibold text-primary whitespace-nowrap">
                          {formatPrice(vr.price)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Tile>

          <Tile>
            <TileTitle>Highlights</TileTitle>
            <ul className="flex flex-col gap-2.5">
              {x.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-white/[0.02] p-3 text-sm"
                >
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {h}
                </li>
              ))}
            </ul>
          </Tile>

          <Tile className="lg:col-span-3">
            <TileTitle>Full specifications</TileTitle>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {specRows.map((r) => {
                const val = r.value(x);
                if (!val) return null;
                return (
                  <div
                    key={r.label}
                    className="flex justify-between gap-4 border-t border-border/60 py-2.5 text-sm"
                  >
                    <dt className="text-foreground/60">{r.label}</dt>
                    <dd className="text-right font-semibold">{val}</dd>
                  </div>
                );
              })}
            </dl>
          </Tile>
        </div>

        <div className="mt-10">
          <TileTitle>Similar {x.type === "car" ? "cars" : "bikes"}</TileTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarVehicles(x).map((o) => (
              <VehicleCard key={o.slug} vehicle={o} />
            ))}
          </div>
        </div>

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
