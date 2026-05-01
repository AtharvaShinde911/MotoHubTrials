import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

/* ---------- tiny inline icons (no deps) ---------- */
const Icon = {
  Search: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Up: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 4l8 10H4z" /></svg>
  ),
  Arrow: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
    </svg>
  ),
  Pin: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  Bolt: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7z" /></svg>
  ),
};

/* ---------- mock data ---------- */
const news = [
  { tag: "REVIEW", source: "AutoWeek", title: "Tata Harrier EV first drive: silent torque, real range", meta: "2h ago · 4 min read", grad: "from-rose-500/40 via-orange-500/30 to-amber-400/20" },
  { tag: "LAUNCH", source: "BikeWale", title: "Royal Enfield Himalayan 450 gets a rally-spec edition", meta: "5h ago · 3 min read", grad: "from-emerald-500/40 via-teal-500/30 to-cyan-400/20" },
  { tag: "SCOOP", source: "Overdrive", title: "Hyundai Creta N Line spotted testing on the Nürburgring", meta: "1d ago · 2 min read", grad: "from-fuchsia-500/40 via-violet-500/30 to-indigo-400/20" },
];

const brands = ["Tata", "Hero", "Royal Enfield", "Hyundai"];

const stories = [
  { user: "RaviK", initials: "RK", title: "Restored my dad's '98 Maruti 800 — full build log", up: 1284 },
  { user: "MotoMaya", initials: "MM", title: "Cross-country on a Classic 350: 4,200 km diary", up: 932 },
];

const products = [
  { name: "Apex Racer Tee", price: "₹899", grad: "from-rose-600 to-rose-900" },
  { name: "Garage Crew Tee", price: "₹999", grad: "from-zinc-700 to-zinc-950" },
];

const events = [
  { d: "17", m: "MAY", name: "Sunday Cars & Coffee", city: "Bengaluru" },
  { d: "02", m: "JUN", name: "Monsoon Moto Rally", city: "Lonavala" },
];

/* ---------- shared bits ---------- */
const TileTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="block h-5 w-1.5 bg-primary rounded-full" />
    <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/90 uppercase">{children}</h2>
  </div>
);

const Tile = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <section
    className={
      "relative rounded-3xl border border-border bg-white/[0.03] backdrop-blur-sm " +
      "p-5 sm:p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] " +
      "flex flex-col overflow-hidden " +
      className
    }
  >
    {children}
  </section>
);

const PrimaryBtn = ({ children }: { children: React.ReactNode }) => (
  <button
    type="button"
    className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 hover:shadow-[0_8px_24px_-8px_oklch(0.628_0.236_25.5/0.7)] active:scale-[0.98]"
  >
    {children}
    <Icon.Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const OutlineBtn = ({ children }: { children: React.ReactNode }) => (
  <button
    type="button"
    className="group inline-flex items-center justify-center gap-2 rounded-full border border-primary/60 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
  >
    {children}
    <Icon.Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
  </button>
);

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* header */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Icon.Bolt className="h-5 w-5" />
          </span>
          <span className="text-lg font-black tracking-[0.2em]">
            MOTO<span className="text-primary">HUB</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-foreground/70">
          <a href="#" className="hover:text-foreground">News</a>
          <a href="#" className="hover:text-foreground">Prices</a>
          <a href="#" className="hover:text-foreground">Stories</a>
          <a href="#" className="hover:text-foreground">Merch</a>
          <a href="#" className="hover:text-foreground">Events</a>
        </nav>
        <button className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-white/5">
          Sign in
        </button>
      </header>

      {/* hero strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight">
          Everything that <span className="text-primary">moves you</span>.<br className="hidden sm:block" />
          One garage. One <span className="underline decoration-primary decoration-4 underline-offset-[6px]">hub</span>.
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
              <TileTitle>Auto News</TileTitle>
              <span className="text-[11px] text-foreground/40">Updated live</span>
            </div>

            <ul className="flex-1 flex flex-col gap-3">
              {news.map((n) => (
                <li
                  key={n.title}
                  className="group flex gap-4 rounded-2xl border border-border/60 bg-white/[0.02] p-3 transition-colors hover:border-primary/40 hover:bg-white/[0.04]"
                >
                  <div className={`relative h-20 w-28 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${n.grad}`}>
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
                </li>
              ))}
            </ul>

            <div className="mt-5 flex justify-end">
              <PrimaryBtn>View All News</PrimaryBtn>
            </div>
          </Tile>

          {/* TILE 2 — VEHICLE PRICES (medium) */}
          <Tile className="lg:col-span-2 lg:row-span-1">
            <TileTitle>Vehicle Prices</TileTitle>

            <label className="relative block">
              <Icon.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <input
                type="search"
                placeholder="Search car or bike..."
                className="w-full rounded-full border border-border bg-white/[0.04] py-3 pl-10 pr-4 text-sm placeholder:text-foreground/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {brands.map((b) => (
                <button
                  key={b}
                  className="group flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary/60 hover:bg-primary/10"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-[10px] font-black text-primary">
                    {b.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                  {b}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <PrimaryBtn>Compare Prices</PrimaryBtn>
            </div>
          </Tile>

          {/* TILE 3 — GARAGE STORIES (medium) */}
          <Tile className="lg:col-span-2 lg:row-span-1">
            <TileTitle>Garage Stories</TileTitle>

            <ul className="flex-1 flex flex-col gap-2.5">
              {stories.map((s) => (
                <li
                  key={s.title}
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
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <OutlineBtn>Share Your Story</OutlineBtn>
            </div>
          </Tile>

          {/* TILE 4 — MERCH STORE (small) */}
          <Tile className="lg:col-span-2 lg:row-span-1">
            <TileTitle>Merch Store</TileTitle>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {products.map((p) => (
                <div key={p.name} className="group rounded-2xl border border-border/60 bg-white/[0.02] p-2.5 transition-colors hover:border-accent/60">
                  <div className={`relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br ${p.grad}`}>
                    {/* tee silhouette */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full p-4 text-white/85" fill="currentColor">
                      <path d="M20 25 L35 15 Q50 25 65 15 L80 25 L72 38 L65 33 L65 85 L35 85 L35 33 L28 38 Z" />
                    </svg>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold truncate">{p.name}</p>
                    <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-black text-accent-foreground">
                      {p.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground transition-all hover:brightness-110 hover:shadow-[0_8px_24px_-8px_oklch(0.78_0.16_75/0.7)] active:scale-[0.98]"
              >
                Shop Now
                <Icon.Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </Tile>

          {/* TILE 5 — EVENTS (small) */}
          <Tile className="lg:col-span-2 lg:row-span-1">
            <TileTitle>Events</TileTitle>

            <ul className="flex-1 flex flex-col gap-2.5">
              {events.map((e) => (
                <li
                  key={e.name}
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
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-end">
              <PrimaryBtn>Find Events</PrimaryBtn>
            </div>
          </Tile>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 text-xs text-foreground/40 flex items-center justify-between">
        <span>© {new Date().getFullYear()} MOTOHUB</span>
        <span className="tracking-widest">DRIVE · RIDE · REPEAT</span>
      </footer>
    </main>
  );
}
