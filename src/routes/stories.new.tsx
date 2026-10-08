import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageBody, PageHero, SiteShell, Tile, inputCls } from "@/components/site";
import { createStory } from "@/lib/stories";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, STORY_LIMITS } from "@/lib/story-rules";

export const Route = createFileRoute("/stories/new")({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: "/signin", search: { next: "/stories/new" } });
    if (!context.user.handle) throw redirect({ to: "/account", search: { next: "/stories/new" } });
  },
  head: () => ({ meta: [{ title: "Share your story — MOTOHUB" }] }),
  component: NewStoryPage,
});

const ACCEPT = "image/jpeg,image/png,image/webp";

function NewStoryPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const picked = [...photos, ...Array.from(list)];
    const tooBig = picked.find((f) => f.size > MAX_PHOTO_BYTES);
    if (tooBig) return setError(`${tooBig.name} is over 5 MB.`);
    if (picked.length > MAX_PHOTOS)
      setError(`Up to ${MAX_PHOTOS} photos; kept the first ${MAX_PHOTOS}.`);
    else setError(null);
    setPhotos(picked.slice(0, MAX_PHOTOS));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.delete("photos");
    photos.forEach((f) => form.append("photos", f));
    setPosting(true);
    setError(null);
    try {
      const res = await createStory({ data: form });
      if (!res.ok) return setError(res.error);
      await navigate({ to: "/stories/$id", params: { id: res.id } });
    } catch {
      setError("Couldn't post your story. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Garage Stories"
        title={
          <>
            Share your <span className="text-primary">story</span>.
          </>
        }
        intro="A build log, a road trip, a first ride. Add up to four photos."
      />
      <PageBody>
        <Tile className="max-w-2xl">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              Title
              <input
                name="title"
                className={inputCls}
                minLength={STORY_LIMITS.title[0]}
                maxLength={STORY_LIMITS.title[1]}
                placeholder="Restored my dad's '98 Maruti 800"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Vehicle <span className="text-[11px] text-foreground/40">(optional)</span>
              <input
                name="vehicle"
                className={inputCls}
                maxLength={STORY_LIMITS.vehicle}
                placeholder="Royal Enfield Classic 350"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Your story
              <textarea
                name="body"
                className={inputCls + " min-h-56"}
                minLength={STORY_LIMITS.body[0]}
                maxLength={STORY_LIMITS.body[1]}
                placeholder="How it started, what went wrong, what you'd do again…"
                required
              />
            </label>
            <div className="flex flex-col gap-2 text-sm">
              Photos
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={src} className="relative">
                    <img src={src} alt="" className="h-24 w-24 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs"
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border border-dashed border-border text-center text-xs text-foreground/50 hover:border-primary">
                    + Add
                    <input
                      type="file"
                      accept={ACCEPT}
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        addPhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              <span className="text-[11px] text-foreground/40">
                JPEG, PNG or WebP, up to 5 MB each.
              </span>
            </div>
            {error && <p className="text-sm text-primary">{error}</p>}
            <button
              disabled={posting}
              className="self-start rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
            >
              {posting ? "Posting…" : "Post story"}
            </button>
          </form>
        </Tile>
      </PageBody>
    </SiteShell>
  );
}
