import { createFileRoute, redirect } from "@tanstack/react-router";

import { Icon, PageBody, PageHero, SiteShell, Tile } from "@/components/site";

const errors: Record<string, string> = {
  not_configured: "Google sign-in isn't set up on this server yet.",
  cancelled: "Sign-in was cancelled.",
  expired: "That sign-in link expired. Please try again.",
  unverified: "Your Google account's email isn't verified.",
  google: "Google couldn't complete the sign-in. Please try again.",
};

export const Route = createFileRoute("/signin")({
  validateSearch: (s: Record<string, unknown>): { next?: string; error?: string } => ({
    // Same-site paths only, so `next` can't bounce users to another site.
    next: typeof s.next === "string" && /^\/(?![/\\])/.test(s.next) ? s.next : undefined,
    error: typeof s.error === "string" ? s.error : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.user?.handle) throw redirect({ href: search.next ?? "/" });
  },
  head: () => ({ meta: [{ title: "Sign in — MOTOHUB" }] }),
  component: SignInPage,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function SignInPage() {
  const { next, error } = Route.useSearch();
  const { user } = Route.useRouteContext();
  const target = next ?? "/stories";
  return (
    <SiteShell>
      <PageHero
        eyebrow="Your account"
        title={
          <>
            Join the <span className="text-primary">garage</span>.
          </>
        }
        intro="MOTOHUB accounts are for car and bike people. Sign in with Google to share your builds and road trips, upvote stories and submit events."
      />
      <PageBody>
        <Tile className="max-w-md">
          {error && (
            <p className="mb-4 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
              {errors[error] ?? "Something went wrong. Please try again."}
            </p>
          )}
          {user && !user.handle ? (
            <p className="text-sm text-foreground/70">
              You're signed in as {user.email}.{" "}
              <a href={`/account?next=${encodeURIComponent(target)}`} className="text-primary">
                Pick a username
              </a>{" "}
              to finish creating your account.
            </p>
          ) : (
            <>
              {/* A plain link: this leaves the app for Google, so no client-side routing. */}
              <a
                href={`/api/auth/google?next=${encodeURIComponent(target)}`}
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:brightness-95 active:scale-[0.98]"
              >
                <GoogleMark />
                Continue with Google
                <Icon.Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <p className="mt-4 text-xs text-foreground/50">
                New here? Signing in creates your account; you'll pick a username next. We only use
                your Google name, email and profile photo.
              </p>
              {import.meta.env.DEV && <DevSignIn next={target} />}
            </>
          )}
        </Tile>
      </PageBody>
    </SiteShell>
  );
}

/** Local development only: sign in as any email without Google. */
function DevSignIn({ next }: { next: string }) {
  return (
    <form method="post" action="/api/auth/dev" className="mt-6 border-t border-border pt-4">
      <p className="text-[11px] uppercase tracking-widest text-foreground/40">Dev sign-in</p>
      <input type="hidden" name="next" value={next} />
      <div className="mt-2 flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-border bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button className="rounded-full border border-border px-4 text-sm hover:bg-white/5">
          Go
        </button>
      </div>
    </form>
  );
}
