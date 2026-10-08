import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { VehicleArt } from "@/components/catalog";
import { ArrowLink, Checker, Icon, SiteShell, Tile, TileTitle } from "@/components/site";
import { formatPriceRange, listBrands, listVehicles, type VehicleType } from "@/lib/catalog";
import { events, news, products, stories } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Index,
});

const typeTabs: { key: VehicleType | undefined; label: string }[] = [
  { key: undefined, label: "All" },
  { key: "car", label: "Cars" },
  { key: "bike", label: "Bikes" },
];

/** One car and one bike per pair, so the home tile shows both sides of the catalog. */
function pickFeatured(count: number) {
  const all = listVehicles();
  const cars = all.filter((x) => x.type === "car");
  const bikes = all.filter((x) => x.type === "bike");
  const out = [];
  for (let i = 0; out.length < count && (i < cars.length || i < bikes.length); i++) {
    if (bikes[i]) out.push(bikes[i]);
    if (cars[i] && out.length < count) out.push(cars[i]);
  }
  return out;
}

function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<VehicleType | undefined>(undefined);

  const all = listVehicles();
  const carCount = all.filter((x) => x.type === "car").length;
  const bikeCount = all.length - carCount;
  const topBrands = listBrands().slice(0, 6);
  const featured = pickFeatured(3);

  return (
    <SiteShell>
      {/* HERO: search first, it's what most visitors came for */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-10">
        <div className="flex items-center gap-2.5">
          <Checker className="h-3 w-3 text-primary" />
          <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Cars · Bikes · India
          </span>
        </div>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold uppercase leading-[0.88] tracking-tight">
          Find your next <span className="text-primary">machine</span>.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          <span className="figures text-foreground">{carCount}</span> cars and{" "}
          <span className="figures text-foreground">{bikeCount}</span> bikes with ex-showroom
          prices, variants and specs. Plus the news, rides and meets that go with them.
        </p>

        <form
          className="mt-7 max-w-3xl rounded-xl border border-border bg-card p-2 shadow-[0_20px_60px_-30px_oklch(0_0_0/0.8)]"
          onSubmit={(ev) => {
            ev.preventDefault();
            const q = query.trim();
            navigate({ to: "/prices", search: { ...(q ? { q } : {}), ...(type ? { type } : {}) } });
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div
              role="radiogroup"
              aria-label="Vehicle type"
              className="flex shrink-0 rounded-lg bg-secondary p-1"
            >
              {typeTabs.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  role="radio"
                  aria-checked={type === t.key}
                  onClick={() => setType(t.key)}
                  className={
                    "flex-1 rounded-md px-3.5 py-1.5 font-display text-sm font-bold uppercase tracking-wider transition-colors " +
                    (type === t.key
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/60 hover:text-foreground")
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
            <label className="relative block flex-1">
              <span className="sr-only">Search cars and bikes</span>
              <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <input
                type="search"
                placeholder="Try Himalayan 450, Creta or Nexon EV"
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
                className="w-full rounded-lg bg-transparent py-2.5 pl-9 pr-3 text-base placeholder:text-foreground/40 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 font-display text-base font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Popular
          </span>
          {topBrands.map((b) => (
            <Link
              key={b.name}
              to="/prices"
              search={{ brand: b.name }}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary/60 hover:text-primary"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* AUTO NEWS (large) */}
          <Tile className="lg:col-span-2 lg:row-span-2">
            <div className="flex items-start justify-between">
              <TileTitle to="/news">Auto News</TileTitle>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Live
              </span>
            </div>

            <ul className="flex-1 flex flex-col divide-y divide-border">
              {news.slice(0, 5).map((n) => (
                <li key={n.title}>
                  <Link to="/news" className="group flex gap-4 py-3 first:pt-0">
                    <div
                      className={`relative h-20 w-28 sm:w-32 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${n.grad}`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_60%)]" />
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[9px] font-bold tracking-wider">
                        {n.tag}
                      </span>
                    </div>
                    <div className="min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          {n.source}
                        </span>
                        <h3 className="mt-1 text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {n.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.meta}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex justify-end">
              <ArrowLink to="/news">All news</ArrowLink>
            </div>
          </Tile>

          {/* PRICE CHECK */}
          <Tile className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <TileTitle to="/prices">Price Check</TileTitle>
              <span className="text-[11px] text-muted-foreground">Ex-showroom, Delhi</span>
            </div>

            <ul className="flex flex-col gap-2">
              {featured.map((v) => (
                <li key={v.slug}>
                  <Link
                    to="/prices/$slug"
                    params={{ slug: v.slug }}
                    className="group flex items-center gap-3 rounded-lg border border-border p-2 transition-colors hover:border-primary/50 hover:bg-secondary/50"
                  >
                    <VehicleArt vehicle={v} className="h-12 w-16 shrink-0 !rounded-md" />
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {v.brand}
                        </p>
                        <p className="truncate font-semibold leading-tight group-hover:text-primary transition-colors">
                          {v.model}
                        </p>
                      </div>
                      <p className="figures mt-0.5 shrink-0 text-sm font-bold text-primary sm:mt-0 sm:text-right">
                        {formatPriceRange(v)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <ArrowLink to="/prices">Browse all prices</ArrowLink>
            </div>
          </Tile>

          {/* GARAGE STORIES */}
          <Tile className="lg:col-span-2">
            <TileTitle to="/stories">Garage Stories</TileTitle>

            <ul className="flex-1 flex flex-col gap-2">
              {stories.slice(0, 2).map((s) => (
                <li key={s.title}>
                  <Link
                    to="/stories"
                    className="group flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:border-primary/50"
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center rounded-md bg-secondary py-1 text-primary">
                      <Icon.Up className="h-3 w-3" />
                      <span className="figures text-xs font-bold">{s.up}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug truncate group-hover:text-primary transition-colors">
                        {s.title}
                      </p>
                      <p className="text-xs text-muted-foreground">u/{s.user}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <ArrowLink to="/stories" variant="outline">
                Share your story
              </ArrowLink>
            </div>
          </Tile>

          {/* MERCH */}
          <Tile className="lg:col-span-2">
            <TileTitle to="/merch">Merch Store</TileTitle>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {products.slice(0, 2).map((p) => (
                <Link
                  key={p.name}
                  to="/merch"
                  className="group block rounded-lg border border-border p-2 transition-colors hover:border-accent/60"
                >
                  <div
                    className={`relative aspect-[4/3] w-full overflow-hidden rounded-md bg-gradient-to-br ${p.grad}`}
                  >
                    {/* tee silhouette */}
                    <svg
                      viewBox="0 0 100 100"
                      className="absolute inset-0 h-full w-full p-4 text-white/85"
                      fill="currentColor"
                    >
                      <path d="M20 25 L35 15 Q50 25 65 15 L80 25 L72 38 L65 33 L65 85 L35 85 L35 33 L28 38 Z" />
                    </svg>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <span className="figures text-xs font-bold text-accent">{p.price}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <ArrowLink to="/merch" variant="accent">
                Shop now
              </ArrowLink>
            </div>
          </Tile>

          {/* EVENTS */}
          <Tile className="lg:col-span-2">
            <TileTitle to="/events">Events</TileTitle>

            <ul className="flex-1 flex flex-col gap-2">
              {events.slice(0, 2).map((e) => (
                <li key={e.name}>
                  <Link
                    to="/events"
                    className="group flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors hover:border-primary/50"
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center rounded-md bg-primary py-1 leading-none text-primary-foreground">
                      <span className="font-display text-2xl font-extrabold">{e.d}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{e.m}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {e.name}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon.Pin className="h-3 w-3" /> {e.city}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <ArrowLink to="/events">Find events</ArrowLink>
            </div>
          </Tile>
        </div>
      </section>
    </SiteShell>
  );
}
