import { Link, useRouteContext } from "@tanstack/react-router";

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
export const TileTitle = ({ children, to }: { children: React.ReactNode; to?: SectionPath }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="block h-5 w-1.5 bg-primary rounded-full" />
    <h2 className="text-xs font-bold tracking-[0.2em] text-foreground/90 uppercase">
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
      "relative rounded-3xl border border-border bg-white/[0.03] backdrop-blur-sm " +
      "p-5 sm:p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] " +
      "flex flex-col overflow-hidden " +
      className
    }
  >
    {children}
  </section>
);

const btnBase =
  "group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm transition-all active:scale-[0.98]";

const btnVariants = {
  primary:
    "bg-primary font-semibold text-primary-foreground hover:brightness-110 hover:shadow-[0_8px_24px_-8px_oklch(0.628_0.236_25.5/0.7)]",
  outline:
    "border border-primary/60 font-semibold text-primary hover:bg-primary hover:text-primary-foreground",
  accent:
    "bg-accent font-bold text-accent-foreground hover:brightness-110 hover:shadow-[0_8px_24px_-8px_oklch(0.78_0.16_75/0.7)]",
};

export const inputCls =
  "w-full rounded-xl border border-border bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

type BtnVariant = keyof typeof btnVariants;

export const ArrowLink = ({
  to,
  variant = "primary",
  children,
}: {
  to: SectionPath | "/stories/new";
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
export function SiteHeader() {
  return (
    <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Icon.Bolt className="h-5 w-5" />
        </span>
        <span className="text-lg font-black tracking-[0.2em]">
          MOTO<span className="text-primary">HUB</span>
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-7 text-sm text-foreground/70">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="hover:text-foreground"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            {s.label}
          </Link>
        ))}
      </nav>
      <AccountButton />
    </header>
  );
}

/** Round profile picture, falling back to initials. */
export function Avatar({
  name,
  src,
  className = "h-8 w-8 text-[11px]",
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials =
    name
      .split(/[\s_]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?";
  return src ? (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      className={`${className} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <span
      className={`${className} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/40 font-black`}
    >
      {initials}
    </span>
  );
}

function AccountButton() {
  const { user } = useRouteContext({ from: "__root__" });
  if (!user) {
    return (
      <Link
        to="/signin"
        className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-white/5"
      >
        Sign in
      </Link>
    );
  }
  const label = user.handle ? `u/${user.handle}` : "Finish sign-up";
  return (
    <Link
      to="/account"
      className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm hover:bg-white/5"
    >
      <Avatar name={user.name ?? user.email} src={user.avatarUrl} className="h-7 w-7 text-[10px]" />
      <span className="max-w-[9rem] truncate">{label}</span>
    </Link>
  );
}

/** Scrollable section links for small screens, where the header nav is hidden. */
function MobileNav() {
  return (
    <nav className="md:hidden mx-auto max-w-7xl px-4 sm:px-6 pb-2 flex gap-2 overflow-x-auto text-xs">
      {sections.map((s) => (
        <Link
          key={s.to}
          to={s.to}
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-foreground/70"
          activeProps={{ className: "border-primary text-primary" }}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 text-xs text-foreground/40 flex items-center justify-between">
      <span>© {new Date().getFullYear()} MOTOHUB</span>
      <span className="tracking-widest">DRIVE · RIDE · REPEAT</span>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <SiteHeader />
      <MobileNav />
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <Link to="/" className="text-xs text-foreground/50 hover:text-primary">
        ← Back to hub
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <span className="block h-5 w-1.5 bg-primary rounded-full" />
        <span className="text-xs font-bold tracking-[0.2em] text-foreground/90 uppercase">
          {eyebrow}
        </span>
      </div>
      <h1 className="mt-3 text-3xl sm:text-5xl font-black leading-[1.02] tracking-tight">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm sm:text-base text-foreground/60">{intro}</p>
    </section>
  );
}

export const PageBody = ({ children }: { children: React.ReactNode }) => (
  <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">{children}</section>
);
