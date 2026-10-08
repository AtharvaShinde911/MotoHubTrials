import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import {
  ArrowLink,
  Avatar,
  PageBody,
  inputCls,
  PageHero,
  SiteShell,
  Tile,
} from "@/components/site";
import { handleRules, saveProfile } from "@/lib/account";
import { listMyStories } from "@/lib/stories";

export const Route = createFileRoute("/account")({
  validateSearch: (s: Record<string, unknown>): { next?: string } =>
    typeof s.next === "string" && /^\/(?![/\\])/.test(s.next) ? { next: s.next } : {},
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({ to: "/signin", search: { next: location.href } });
    }
    return { user: context.user };
  },
  loader: async ({ context }) => (context.user.handle ? listMyStories() : []),
  head: () => ({ meta: [{ title: "Your account — MOTOHUB" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = Route.useRouteContext();
  const stories = Route.useLoaderData();
  const isNew = !user.handle;
  return (
    <SiteShell>
      <PageHero
        eyebrow="Your account"
        title={
          isNew ? (
            <>
              One last step: pick your <span className="text-primary">username</span>.
            </>
          ) : (
            <>
              Hey, <span className="text-primary">{user.name ?? user.handle}</span>.
            </>
          )
        }
        intro={
          isNew
            ? "Your username shows on every story you post. You can change it later."
            : `Signed in with Google as ${user.email}.`
        }
      />
      <PageBody>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <Tile className="h-fit">
            <ProfileForm />
            {!isNew && (
              <form
                method="post"
                action="/api/auth/signout"
                className="mt-6 border-t border-border pt-4"
              >
                <button className="text-sm text-foreground/60 hover:text-primary">Sign out</button>
              </form>
            )}
          </Tile>
          {!isNew && (
            <div className="lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Your stories</h2>
                <ArrowLink to="/stories/new" variant="outline">
                  New story
                </ArrowLink>
              </div>
              {stories.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-foreground/50">
                  You haven't posted yet. Your first build log or road trip goes here.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {stories.map((s) => (
                    <li key={s.id}>
                      <Link
                        to="/stories/$id"
                        params={{ id: s.id }}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-white/[0.02] p-4 hover:border-primary/60"
                      >
                        <span className="font-semibold">{s.title}</span>
                        <span className="shrink-0 text-xs text-foreground/50">▲ {s.upvotes}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </PageBody>
    </SiteShell>
  );
}

function ProfileForm() {
  const { user } = Route.useRouteContext();
  const { next } = Route.useSearch();
  const router = useRouter();
  const [handle, setHandle] = useState(user.handle ?? suggestHandle(user.name ?? user.email));
  const [name, setName] = useState(user.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isNew = !user.handle;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await saveProfile({ data: { handle, name } });
      if (!res.ok) return setError(res.error);
      await router.invalidate();
      if (isNew) await router.navigate({ href: next ?? "/stories" });
      else setSaved(true);
    } catch {
      setError(`Check your username: ${handleRules}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={name || handle} src={user.avatarUrl} className="h-12 w-12 text-sm" />
        <div className="min-w-0 text-sm">
          <div className="font-semibold">{handle ? `u/${handle}` : "u/…"}</div>
          <div className="truncate text-foreground/50">{user.email}</div>
        </div>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        Username
        <input
          className={inputCls}
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase())}
          pattern="[a-z0-9_]{3,20}"
          required
          autoFocus={isNew}
        />
        <span className="text-[11px] text-foreground/40">{handleRules}</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Display name
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
        />
      </label>
      {error && <p className="text-sm text-primary">{error}</p>}
      {saved && <p className="text-sm text-foreground/60">Saved.</p>}
      <button
        disabled={saving}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
      >
        {saving ? "Saving…" : isNew ? "Create my account" : "Save profile"}
      </button>
    </form>
  );
}

function suggestHandle(from: string) {
  return from
    .split("@")[0]!
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
}
