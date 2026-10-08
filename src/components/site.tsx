import { Link } from "@tanstack/react-router";

/* ---------- tiny inline icons (no deps) ---------- */
export const Icon = {
  Search: (p: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Up: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 4l8 10H4z" />
    </svg>
  ),
  Arrow: (p: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  ),
  Pin: (p: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  Bolt: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
    </svg>
  ),
};

export const sections = [
  { to: "/news", label: "News" },
  { to: "/prices", label: "Prices" },
  { to: "/stories", label: "Stories" },
  { to: "/merch", label: "Merch" },
  { to: "/events", label: "Events" },
] as const;

export type SectionPath = (typeof sections)[number]["to"];

/* ---------- shared bits ---------- */
/** Checkered-flag square, the brand mark. */
export const Checker = ({ className = "" }: { className?: string }) => (
  <span aria-hidden className={`inline-block checker rounded-[2px] ${className}`} />
);

export const TileTitle = ({ children, to }: { children: React.ReactNode; to?: SectionPath }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <Checker className="h-3 w-3 text-primary" />
    <h2 className="font-display text-lg font-bold uppercase leading-none tracking-wide text-foreground">
      {to ? (
        <Link to={to} className="hover:text-primary transition-colors">
          {children}
        </Link>
      ) : (
        children
      )}
    </h2>
  </div>
);

export const Tile = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={
      "relative rounded-xl border border-border bg-card " +
      "p-5 sm:p-6 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)] " +
      "flex flex-col overflow-hidden " +
      className
    }
  >
    {children}
  </section>
);

const btnBase =
  "group inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const btnVariants = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-110 hover:shadow-[0_8px_24px_-10px_var(--color-primary)]",
  outline: "border border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground",
  accent:
    "bg-accent text-accent-foreground hover:brightness-110 hover:shadow-[0_8px_24px_-10px_var(--color-accent)]",
};

type BtnVariant = keyof typeof btnVariants;

export const ArrowLink = ({
  to,
  variant = "primary",
  children,
}: {
  to: SectionPath;
  variant?: BtnVariant;
  children: React.ReactNode;
}) => (
  <Link to={to} className={`${btnBase} ${btnVariants[variant]}`}>
    {children}
    <Icon.Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
  </Link>
);

export const ArrowButton = ({
  variant = "primary",
  onClick,
  children,
}: {
  variant?: BtnVariant;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <button type="button" onClick={onClick} className={`${btnBase} ${btnVariants[variant]}`}>
    {children}
    <Icon.Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
  </button>
);

/* ---------- page chrome ---------- */
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="MOTOHUB home">
      <Checker className="h-5 w-5 text-primary" />
      <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-wider">
        Moto<span className="text-primary">hub</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 font-display text-[15px] font-semibold uppercase tracking-wider">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="relative rounded-md px-3 py-2 text-foreground/65 transition-colors hover:text-foreground"
              activeProps={{
                className:
                  "!text-foreground after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:bg-primary",
              }}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <button className="rounded-md border border-border px-4 py-1.5 text-sm font-semibold transition-colors hover:border-primary/60 hover:text-primary">
          Sign in
        </button>
      </div>
      <MobileNav />
    </header>
  );
}

/** Scrollable section links for small screens, where the header nav is hidden. */
function MobileNav() {
  return (
    <nav className="md:hidden mx-auto max-w-7xl px-4 sm:px-6 pb-2.5 flex gap-1.5 overflow-x-auto font-display text-sm font-semibold uppercase tracking-wider">
      {sections.map((s) => (
        <Link
          key={s.to}
          to={s.to}
          className="shrink-0 rounded-md border border-border px-3 py-1 text-foreground/70"
          activeProps={{ className: "!border-primary bg-primary !text-primary-foreground" }}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Prices, specs, news and stories for people who love cars and bikes on Indian roads.
          </p>
        </div>
        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="rev-rule h-1" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} MOTOHUB</span>
        <span className="font-display text-sm font-semibold uppercase tracking-[0.25em]">
          Drive · Ride · Repeat
        </span>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* faint sodium-lamp wash at the top of the page */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,color-mix(in_oklch,var(--color-primary)_14%,transparent),transparent)]"
      />
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

/** Title block used at the top of every section page. */
export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-8">
      <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-primary">
        ← Back to hub
      </Link>
      <div className="mt-5 flex items-center gap-2.5">
        <Checker className="h-3 w-3 text-primary" />
        <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </span>
      </div>
      <h1 className="mt-2 font-display text-4xl sm:text-6xl font-extrabold uppercase leading-[0.92] tracking-tight">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">{intro}</p>
      <div className="rev-rule mt-6 h-1 max-w-48 rounded-full" aria-hidden />
    </section>
  );
}

export const PageBody = ({ children }: { children: React.ReactNode }) => (
  <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">{children}</section>
);
