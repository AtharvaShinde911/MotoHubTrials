import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";

import { PageBody, SiteShell, Tile } from "@/components/site";
import { Byline, VoteButton } from "@/components/stories";
import { deleteStory, getStory } from "@/lib/stories";

export const Route = createFileRoute("/stories/$id")({
  loader: async ({ params }) => {
    const story = await getStory({ data: { id: params.id } });
    if (!story) throw notFound();
    return story;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} — MOTOHUB` : "Story — MOTOHUB" }],
  }),
  component: StoryPage,
});

function StoryPage() {
  const s = Route.useLoaderData();
  const navigate = useNavigate();

  async function onDelete() {
    if (!confirm("Delete this story and its photos? This can't be undone.")) return;
    const res = await deleteStory({ data: { id: s.id } });
    if (res.ok) await navigate({ to: "/account" });
  }

  return (
    <SiteShell>
      <PageBody>
        <Link to="/stories" className="text-xs text-foreground/50 hover:text-primary">
          ← All stories
        </Link>
        <article className="mt-4 max-w-3xl">
          <div className="flex gap-4">
            <VoteButton id={s.id} upvotes={s.upvotes} voted={s.voted} />
            <div className="min-w-0">
              <Byline author={s.author} createdAt={s.createdAt} />
              <h1 className="mt-3 text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                {s.title}
              </h1>
              {s.vehicle && <p className="mt-1 text-sm font-semibold text-primary">{s.vehicle}</p>}
            </div>
          </div>
          {s.photos.length > 0 && (
            <div className={`mt-6 grid gap-2 ${s.photos.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {s.photos.map((src) => (
                <img key={src} src={src} alt="" className="w-full rounded-2xl object-cover" />
              ))}
            </div>
          )}
          <Tile className="mt-6">
            <p className="whitespace-pre-line leading-relaxed text-foreground/85">{s.body}</p>
          </Tile>
          {s.isOwner && (
            <button
              onClick={onDelete}
              className="mt-4 text-sm text-foreground/50 hover:text-primary"
            >
              Delete story
            </button>
          )}
        </article>
      </PageBody>
    </SiteShell>
  );
}
