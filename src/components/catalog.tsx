import { Link } from "@tanstack/react-router";
import { Car, Check, GitCompare, Motorbike, Plus, Scooter, X, Zap } from "lucide-react";

import { formatPriceRange, getVehicle, type Vehicle } from "@/lib/catalog";
import { MAX_COMPARE, useCompare } from "@/lib/compare";

const grads = [
  "from-rose-500/40 via-orange-500/25 to-amber-400/10",
  "from-emerald-500/40 via-teal-500/25 to-cyan-400/10",
  "from-fuchsia-500/40 via-violet-500/25 to-indigo-400/10",
  "from-sky-500/40 via-blue-500/25 to-indigo-400/10",
  "from-amber-500/40 via-orange-500/25 to-rose-400/10",
  "from-lime-500/40 via-emerald-500/25 to-teal-400/10",
];

const gradFor = (key: string) =>
  grads[[...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % grads.length];

/** Placeholder artwork until real photos are licensed: a brand-tinted gradient with a body-type icon. */
export function VehicleArt({ vehicle, className = "" }: { vehicle: Vehicle; className?: string }) {
  const Glyph = vehicle.type === "car" ? Car : /scooter/i.test(vehicle.body) ? Scooter : Motorbike;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradFor(vehicle.brand)} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_60%)]" />
      <Glyph className="absolute inset-0 m-auto h-1/2 w-1/2 text-white/80" strokeWidth={1.25} />
      {vehicle.fuels.includes("Electric") && (
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/70 px-1.5 py-0.5 text-[10px] font-bold tracking-wider">
          <Zap className="h-3 w-3 text-accent" /> EV
        </span>
      )}
    </div>
  );
}

export function CompareToggle({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const compare = useCompare();
  const on = compare.has(slug);
  const disabled = !on && compare.isFull;
  return (
    <button
      type="button"
      onClick={() => compare.toggle(slug)}
      disabled={disabled}
      title={disabled ? `You can compare up to ${MAX_COMPARE} at a time` : undefined}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 " +
        (on
          ? "border-primary bg-primary/15 text-primary"
          : "border-border hover:border-primary/60 hover:bg-primary/10")
      }
    >
      {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {compact ? "Compare" : on ? "Added to compare" : "Add to compare"}
    </button>
  );
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const s = vehicle.specs;
  return (
    <article className="group flex flex-col rounded-3xl border border-border bg-white/[0.03] p-3 transition-colors hover:border-primary/40">
      <Link to="/prices/$slug" params={{ slug: vehicle.slug }} className="block">
        <VehicleArt vehicle={vehicle} className="aspect-[16/10] w-full" />
        <div className="px-1 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
            {vehicle.brand} · {vehicle.body}
          </p>
          <h3 className="mt-0.5 text-base font-bold leading-snug group-hover:text-primary transition-colors">
            {vehicle.model}
          </h3>
          <p className="mt-1 text-sm font-semibold text-primary">{formatPriceRange(vehicle)}</p>
          <p className="mt-1.5 text-xs text-foreground/60">
            {[
              s.batteryKwh
                ? `${s.batteryKwh} kWh`
                : s.displacementCc
                  ? `${s.displacementCc} cc`
                  : null,
              `${s.powerBhp} bhp`,
              vehicle.fuels.join(" / "),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between px-1 pt-3">
        <span className="text-[11px] text-foreground/40">Ex-showroom</span>
        <CompareToggle slug={vehicle.slug} compact />
      </div>
    </article>
  );
}

/** Sticky bar that appears once something is in the compare tray. */
export function CompareTray() {
  const compare = useCompare();
  if (compare.slugs.length === 0) return null;
  const picked = compare.slugs.map(getVehicle).filter((x): x is Vehicle => !!x);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {picked.map((x) => (
            <span
              key={x.slug}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.04] py-1 pl-3 pr-1 text-xs font-semibold"
            >
              <span className="truncate max-w-[10rem]">{x.name}</span>
              <button
                type="button"
                aria-label={`Remove ${x.name}`}
                onClick={() => compare.toggle(x.slug)}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <Link
          to="/compare"
          search={{ ids: compare.slugs.join(",") }}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          <GitCompare className="h-4 w-4" />
          Compare {picked.length}
        </Link>
      </div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
        (active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-white/[0.03] hover:border-primary/60 hover:bg-primary/10")
      }
    >
      {children}
    </button>
  );
}
