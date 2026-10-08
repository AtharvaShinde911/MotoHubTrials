import { useEffect, useState } from "react";
import { ChevronDown, LocateFixed, MapPin } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cities, nearestCity, useCity } from "@/lib/location";

/**
 * Asks for the visitor's city the first time they open a catalog page, and
 * renders a pill to change it later. Mount once per page.
 */
export function CityPicker() {
  const { city, needsOnboarding, setCity, skip } = useCity();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => setMounted(true), []);
  // Only after hydration, so returning visitors never see the prompt flash.
  useEffect(() => {
    if (mounted && needsOnboarding) setOpen(true);
  }, [mounted, needsOnboarding]);

  const choose = (id: string) => {
    setCity(id);
    setOpen(false);
  };

  const close = (next: boolean) => {
    if (!next && needsOnboarding) skip();
    setOpen(next);
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setError("Your browser can't share your location. Pick your city below.");
      return;
    }
    setLocating(true);
    setError(undefined);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        choose(nearestCity(pos.coords.latitude, pos.coords.longitude).id);
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Pick your city below.");
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.04] px-3 py-1.5 text-xs font-semibold hover:border-primary/60"
      >
        <MapPin className="h-3.5 w-3.5 text-primary" />
        {mounted && city ? city.name : "Choose city"}
        <ChevronDown className="h-3.5 w-3.5 text-foreground/50" />
      </button>

      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="max-w-md border-border bg-background">
          <DialogHeader>
            <DialogTitle>Where will you buy?</DialogTitle>
            <DialogDescription>
              We use your city to estimate on-road prices, including road tax, registration and
              insurance.
            </DialogDescription>
          </DialogHeader>

          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
          >
            <LocateFixed className="h-4 w-4" />
            {locating ? "Finding you…" : "Use my location"}
          </button>
          {error && <p className="text-xs text-foreground/60">{error}</p>}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cities.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => choose(c.id)}
                aria-pressed={city?.id === c.id}
                className={
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
                  (city?.id === c.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border hover:border-primary/60 hover:bg-primary/10")
                }
              >
                {c.name}
              </button>
            ))}
          </div>

          {needsOnboarding && (
            <button
              type="button"
              onClick={() => close(false)}
              className="text-xs text-foreground/50 hover:text-primary"
            >
              Skip for now
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
