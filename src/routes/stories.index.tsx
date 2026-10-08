import { Link, createFileRoute } from "@tanstack/react-router";

import { ArrowLink, PageBody, PageHero, SiteShell, Tile } from "@/components/site";
import { Byline, StoryLink, VoteButton } from "@/components/stories";
import { listStories } from "@/lib/stories";

type Sort = "top" | "new";

export const Route = createFileRoute("/stories/")({
  validateSearch: (s: Record<string, unknown>): { sort?: Sort } =>
    s.sort === "new" ? { sort: "new" } : {},
  loaderDeps: ({ search }) => ({ sort: search.sort ?? "top" }),
  loader: ({ deps }) => listStories({ data: { sort: deps.sort } }),
  head: () => ({ meta: [{ title: "Garage Stories — MOTOHUB" }] }),
  component: StoriesPage,
});

function StoriesPage() {
  const stories = Route.useLoaderData();
  const { sort = "top" } = Route.useSearch();
  const { user } = Route.useRouteContext();
  return (
    <SiteShell>
      <PageHero
        eyebrow="Garage Stories"
        title={
          <>
            Builds, road trips and <span className="text-primary">late nights</span> in the garage.
          </>
        }
        intro="Stories from the community. Sign in with Google to post your own and upvote the ones you love."
      />
      <PageBody>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-2">
            <div className="mb-3 flex gap-2 text-xs">
              {(["top", "new"] as const).map((s) => (
                <Link
                  key={s}
                  to="/stories"
                  search={s === "top" ? {} : { sort: s }}
                  className={
                    "rounded-full border px-3 py-1.5 font-semibold " +
                    (sort === s
                      ? "border-primary text-primary"
                      : "border-border text-foreground/60")
                  }
                >
                  {s === "top" ? "Top" : "New"}
                </Link>
              ))}
            </div>
            {stories.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-foreground/50">
                No stories yet. Be the first to share a build or a ride.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {stories.map((s) => (
                  <li
                    key={s.id}
                    className="flex gap-4 rounded-2xl border border-border/60 bg-white/[0.02] p-4 hover:border-primary/50"
                  >
                    <VoteButton id={s.id} upvotes={s.upvotes} voted={s.voted} />
                    <StoryLink id={s.id} className="flex min-w-0 flex-1 gap-4">
                      <div className="min-w-0 flex-1">
                        <Byline author={s.author} createdAt={s.createdAt} />
                        <h2 className="mt-2 font-semibold leading-snug">{s.title}</h2>
                        {s.vehicle && (
                          <p className="mt-0.5 text-xs font-semibold text-primary/80">
                            {s.vehicle}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-foreground/60">{s.excerpt}</p>
                      </div>
                      {s.coverUrl && (
                        <img
                          src={s.coverUrl}
                          alt=""
                          loading="lazy"
                          className="hidden h-24 w-32 shrink-0 rounded-xl object-cover sm:block"
                        />
                      )}
                    </StoryLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Tile className="h-fit">
            <h2 className="text-lg font-bold">Got a story?</h2>
            <p className="mt-2 text-sm text-foreground/60">
              Restorations, road trips, track days, first rides. Share yours with the hub.
            </p>
            <div className="mt-5">
              <ArrowLink to="/stories/new" variant="outline">
                Share Your Story
              </ArrowLink>
            </div>
            {!user && (
              <p className="mt-3 text-[11px] text-foreground/40">
                You'll sign in with Google first.
              </p>
            )}
          </Tile>
        </div>
      </PageBody>
    </SiteShell>
  );
}
