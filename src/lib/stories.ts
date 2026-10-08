/** Server functions for Garage Stories. */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { getSessionUser } from "@/server/auth";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, STORY_LIMITS } from "@/lib/story-rules";
import {
  flipVote,
  insertStory,
  queryStories,
  queryStory,
  removeStory,
  sniffImage,
  type StoryDetail,
  type StorySummary,
} from "@/server/stories";

export type { StoryDetail, StorySummary };

export const listStories = createServerFn({ method: "GET" })
  .inputValidator(
    (d: { sort?: "top" | "new" }) => ({ sort: d.sort === "new" ? "new" : "top" }) as const,
  )
  .handler(async ({ data }) => {
    const user = await getSessionUser(getRequest());
    return queryStories({ sort: data.sort, viewerId: user?.id ?? null });
  });

export const listMyStories = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSessionUser(getRequest());
  if (!user) return [];
  return queryStories({ sort: "new", viewerId: user.id, authorId: user.id });
});

export const getStory = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }) => {
    const user = await getSessionUser(getRequest());
    return queryStory(data.id, user?.id ?? null);
  });

type CreateResult = { ok: true; id: string } | { ok: false; error: string };

export const createStory = createServerFn({ method: "POST" })
  .inputValidator((d: FormData) => {
    if (!(d instanceof FormData)) throw new Error("Expected form data");
    return d;
  })
  .handler(async ({ data }): Promise<CreateResult> => {
    const user = await getSessionUser(getRequest());
    if (!user) return { ok: false, error: "Sign in to share a story." };
    if (!user.handle) return { ok: false, error: "Finish setting up your account first." };

    const title = String(data.get("title") ?? "").trim();
    const body = String(data.get("body") ?? "").trim();
    const vehicle = String(data.get("vehicle") ?? "").trim() || null;
    const [tMin, tMax] = STORY_LIMITS.title;
    const [bMin, bMax] = STORY_LIMITS.body;
    if (title.length < tMin || title.length > tMax) {
      return { ok: false, error: `Title must be ${tMin}–${tMax} characters.` };
    }
    if (body.length < bMin || body.length > bMax) {
      return { ok: false, error: `Story must be ${bMin}–${bMax} characters.` };
    }
    if (vehicle && vehicle.length > STORY_LIMITS.vehicle) {
      return { ok: false, error: `Vehicle must be under ${STORY_LIMITS.vehicle} characters.` };
    }

    const files = data.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_PHOTOS) return { ok: false, error: `Up to ${MAX_PHOTOS} photos.` };
    const photos = [];
    for (const f of files) {
      if (f.size > MAX_PHOTO_BYTES) return { ok: false, error: `${f.name} is over 5 MB.` };
      const bytes = await f.arrayBuffer();
      const kind = sniffImage(new Uint8Array(bytes, 0, Math.min(12, bytes.byteLength)));
      if (!kind) return { ok: false, error: `${f.name} isn't a JPEG, PNG or WebP image.` };
      photos.push({ bytes, ...kind });
    }

    const id = await insertStory({ userId: user.id, title, body, vehicle, photos });
    return { ok: true, id };
  });

export const toggleVote = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }) => {
    const user = await getSessionUser(getRequest());
    if (!user?.handle) return { ok: false as const, error: "Sign in to upvote." };
    return { ok: true as const, ...(await flipVote(data.id, user.id)) };
  });

export const deleteStory = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data }) => {
    const user = await getSessionUser(getRequest());
    if (!user) return { ok: false };
    return { ok: await removeStory(data.id, user.id) };
  });
