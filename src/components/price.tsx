import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { CityPicker } from "@/components/location";
import { formatPrice, formatPriceRange, type Variant, type Vehicle } from "@/lib/catalog";
import { useCity } from "@/lib/location";
import { onRoadFor } from "@/lib/onroad";

const sortedVariants = (x: Vehicle) => [...x.variants].sort((a, b) => a.price - b.price);

/** Price tag for a model page: variant picker, ex-showroom price and the on-road estimate for the visitor's city. */
export function PriceBox({
  vehicle: x,
  variant,
  onVariant,
}: {
  vehicle: Vehicle;
  variant: Variant;
  onVariant: (v: Variant) => void;
}) {
  const { city } = useCity();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const variants = sortedVariants(x);
  const est = city ? onRoadFor(x, variant, city) : undefined;

  return (
    <div className="mt-5 rounded-2xl border border-border bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-foreground/50">Ex-showroom</p>
          <p className="text-2xl sm:text-3xl font-black text-primary">
            {formatPrice(variant.price)}
          </p>
        </div>
        <p className="text-[11px] text-foreground/40">
          {x.variants.length > 1
            ? `${formatPriceRange(x)} across ${x.variants.length} variants`
            : "Single variant"}
        </p>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Variant</span>
        <select
          value={variant.name}
          onChange={(ev) => onVariant(variants.find((v) => v.name === ev.target.value)!)}
          className="w-full rounded-full border border-border bg-white/[0.04] px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 [&>option]:bg-background"
        >
          {variants.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} · {v.fuel} · {v.transmission} · {formatPrice(v.price)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 border-t border-border/60 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-widest text-foreground/50">
            On-road price{city ? ` in ${city.name}` : ""}
          </p>
          <CityPicker />
        </div>
        {est ? (
          <>
            <p className="mt-1 text-xl font-black">
              {formatPrice(est.total)}{" "}
              <span className="text-xs font-semibold text-foreground/50">estimated</span>
            </p>
            <button
              type="button"
              onClick={() => setShowBreakdown((s) => !s)}
              aria-expanded={showBreakdown}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-foreground/60 hover:text-primary"
            >
              {showBreakdown ? "Hide" : "Show"} breakdown
              <ChevronDown
                className={
                  "h-3.5 w-3.5 transition-transform " + (showBreakdown ? "rotate-180" : "")
                }
              />
            </button>
            {showBreakdown && (
              <dl className="mt-2 text-sm">
                {est.lines.map((l) => (
                  <div key={l.label} className="flex justify-between gap-4 py-1">
                    <dt className="text-foreground/60">{l.label}</dt>
                    <dd className="font-semibold">{formatPrice(l.amount)}</dd>
                  </div>
                ))}
                <p className="mt-2 text-[11px] text-foreground/40">
                  Estimate from state tax rules and standard insurance premiums. Dealers may add
                  handling or accessory charges.
                </p>
              </dl>
            )}
          </>
        ) : (
          <p className="mt-1 text-sm text-foreground/60">
            Choose your city to see the on-road price.
          </p>
        )}
      </div>
    </div>
  );
}
