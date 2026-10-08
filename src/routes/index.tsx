import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { ArrowLink, Icon, SiteShell, Tile, TileTitle } from "@/components/site";
import { brands, events, news, products, stories } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <SiteShell>
      {/* hero strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight">
          Everything that <span className="text-primary">moves you</span>.
          <br className="hidden sm:block" />
          One garage. One{" "}
          <span className="underline decoration-primary decoration-4 underline-offset-[6px]">
            hub
          </span>
          .
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-foreground/60">
          News, prices, stories, merch and events — built for car and bike obsessives.
        </p>
      </section>

      {/* BENTO GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-3 gap-4 sm:gap-5 lg:auto-rows-fr">
          {/* TILE 1 — AUTO NEWS (large, spans 2 cols × 2 rows) */}
          <Tile className="lg:col-span-2 lg:row-span-2">
            <div className="flex items-start justify-between">
              <TileTitle to="/news">Auto News</TileTitle>
              <span className="text-[11px] text-foreground/40">Updated live</span>
            </div>

            <ul className="flex-1 flex flex-col gap-3">
              {news.slice(0, 3).map((n) => (
                <li key={n.title}>
                  <Link
                    to="/news"
                    className="group flex gap-4 rounded-2xl border border-border/60 bg-white/[0.02] p-3 transition-colors hover:border-primary/40 hover:bg-white/[0.04]"
                  >
                    <div
                      className={`relative h-20 w-28 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${n.grad}`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
                      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-background/70 px-1.5 py-0.5 text-[9px] font-bold tracking-wider">
                        {n.tag}
                      </span>
                    </div>
                    <div className="min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <span className="inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {n.source}
                        </span>
                        <h3 className="mt-1.5 text-sm sm:text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {n.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-foreground/50">{n.meta}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex justify-end">
              <ArrowLink to="/news">View All News</ArrowLink>
            </div>
          </Tile>

          {/* TILE 2 — VEHICLE PRICES (medium) */}
          <Tile className="lg:col-span-2 lg:row-span-1">
            <TileTitle to="/prices">Vehicle Prices</TileTitle>

            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                navigate({ to: "/prices", search: query.trim() ? { q: query.trim() } : {} });
              }}
            >
              <label className="relative block">
                <Icon.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                <input
                  type="search"
                  placeholder="Search car or bike..."
                  value={query}
                  onChange={(ev) => setQuery(ev.target.value)}
                  className="w-full rounded-full border border-border bg-white/[0.04] py-3 pl-10 pr-4 text-sm placeholder:text-foreground/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {brands.map((b) => (
                <Link
                  key={b}
                  to="/prices"
                  search={{ q: b }}
                  className="group flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/60 hover:bg-primary/10"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-[10px] font-black text-primary">
                    {b
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  {b}
                </Link>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <ArrowLink to="/prices">Compare Prices</ArrowLink>
            </div>
          </Tile>

          {/* TILE 3 — GARAGE STORIES (medium) */}
          <Tile className="lg:col-span-2 lg:row-span-1">
            <TileTitle to="/stories">Garage Stories</TileTitle>

            <ul className="flex-1 flex flex-col gap-2.5">
              {stories.slice(0, 2).map((s) => (
                <li key={s.title}>
                  <Link
                    to="/stories"
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white/[0.02] p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-primary/10 px-2 py-1.5 text-primary">
                      <Icon.Up className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold leading-none">{s.up}</span>
                    </div>
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/40 text-xs font-black">
                      {s.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug truncate">{s.title}</p>
                      <p className="text-[11px] text-foreground/50">u/{s.user}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <ArrowLink to="/stories" variant="outline">
                Share Your Story
              </ArrowLink>
            </div>
          </Tile>

          {/* TILE 4 — MERCH STORE (small) */}
          <Tile className="lg:col-span-2 lg:row-span-1">
            <TileTitle to="/merch">Merch Store</TileTitle>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {products.slice(0, 2).map((p) => (
                <Link
                  key={p.name}
                  to="/merch"
                  className="group block rounded-2xl border border-border/60 bg-white/[0.02] p-2.5 transition-colors hover:border-accent/60"
                >
                  <div
                    className={`relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br ${p.grad}`}
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
                    <p className="text-xs font-semibold truncate">{p.name}</p>
                    <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-black text-accent-foreground">
                      {p.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <ArrowLink to="/merch" variant="accent">
                Shop Now
              </ArrowLink>
            </div>
          </Tile>

          {/* TILE 5 — EVENTS (small) */}
          <Tile className="lg:col-span-2 lg:row-span-1">
            <TileTitle to="/events">Events</TileTitle>

            <ul className="flex-1 flex flex-col gap-2.5">
              {events.slice(0, 2).map((e) => (
                <li key={e.name}>
                  <Link
                    to="/events"
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white/[0.02] p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-3 py-1.5 text-primary-foreground leading-tight">
                      <span className="text-lg font-black">{e.d}</span>
                      <span className="text-[10px] font-bold tracking-widest">{e.m}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{e.name}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-foreground/60">
                        <Icon.Pin className="h-3 w-3" /> {e.city}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <ArrowLink to="/events">Find Events</ArrowLink>
            </div>
          </Tile>
        </div>
      </section>
    </SiteShell>
  );
}
