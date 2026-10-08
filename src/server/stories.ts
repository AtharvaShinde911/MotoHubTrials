/** Garage Stories storage: rows in D1, photos in R2. */
import { getEnv } from "./env";

export interface StorySummary {
  id: string;
  title: string;
  excerpt: string;
  vehicle: string | null;
  upvotes: number;
  createdAt: number;
  author: { handle: string; name: string | null; avatarUrl: string | null };
  coverUrl: string | null;
  voted: boolean;
}

export interface StoryDetail extends Omit<StorySummary, "excerpt" | "coverUrl"> {
  body: string;
  photos: string[];
  isOwner: boolean;
}

interface StoryRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  vehicle: string | null;
  upvotes: number;
  created_at: number;
  handle: string;
  name: string | null;
  avatar_url: string | null;
  cover_key: string | null;
  voted: number;
}

export const mediaUrl = (key: string) => `/api/media/${key}`;

const excerpt = (body: string) => {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > 180 ? flat.slice(0, 177).trimEnd() + "…" : flat;
};

const SELECT = `
  SELECT s.id, s.user_id, s.title, s.body, s.vehicle, s.upvotes, s.created_at,
         u.handle, u.name, u.avatar_url,
         (SELECT r2_key FROM story_photos p WHERE p.story_id = s.id ORDER BY position LIMIT 1) AS cover_key,
         EXISTS(SELECT 1 FROM story_votes v WHERE v.story_id = s.id AND v.user_id = ?) AS voted
    FROM stories s JOIN users u ON u.id = s.user_id`;

const toSummary = (r: StoryRow): StorySummary => ({
  id: r.id,
  title: r.title,
  excerpt: excerpt(r.body),
  vehicle: r.vehicle,
  upvotes: r.upvotes,
  createdAt: r.created_at,
  author: { handle: r.handle, name: r.name, avatarUrl: r.avatar_url },
  coverUrl: r.cover_key ? mediaUrl(r.cover_key) : null,
  voted: !!r.voted,
});

export async function queryStories(opts: {
  sort: "top" | "new";
  viewerId: string | null;
  authorId?: string;
  limit?: number;
}): Promise<StorySummary[]> {
  const { DB } = await getEnv();
  const where = opts.authorId ? "WHERE s.user_id = ?" : "";
  const order = opts.sort === "new" ? "s.created_at DESC" : "s.upvotes DESC, s.created_at DESC";
  const binds: unknown[] = [opts.viewerId ?? ""];
  if (opts.authorId) binds.push(opts.authorId);
  binds.push(opts.limit ?? 50);
  const { results } = await DB.prepare(`${SELECT} ${where} ORDER BY ${order} LIMIT ?`)
    .bind(...binds)
    .all<StoryRow>();
  return results.map(toSummary);
}

export async function queryStory(id: string, viewerId: string | null): Promise<StoryDetail | null> {
  const { DB } = await getEnv();
  const row = await DB.prepare(`${SELECT} WHERE s.id = ?`)
    .bind(viewerId ?? "", id)
    .first<StoryRow>();
  if (!row) return null;
  const { results } = await DB.prepare(
    "SELECT r2_key FROM story_photos WHERE story_id = ? ORDER BY position",
  )
    .bind(id)
    .all<{ r2_key: string }>();
  const { excerpt: _e, coverUrl: _c, ...summary } = toSummary(row);
  return {
    ...summary,
    body: row.body,
    photos: results.map((p) => mediaUrl(p.r2_key)),
    isOwner: viewerId === row.user_id,
  };
}

/** Detects the real image type from its first bytes rather than trusting the browser. */
export function sniffImage(
  bytes: Uint8Array,
): { ext: "jpg" | "png" | "webp"; type: string } | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return { ext: "png", type: "image/png" };
  }
  const ascii = (from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  return null;
}

export async function insertStory(input: {
  userId: string;
  title: string;
  body: string;
  vehicle: string | null;
  photos: { bytes: ArrayBuffer; ext: string; type: string }[];
}): Promise<string> {
  const { DB, MEDIA } = await getEnv();
  const id = crypto.randomUUID();
  const now = Date.now();
  const photoRows = input.photos.map((p, position) => {
    const photoId = crypto.randomUUID();
    return { photoId, key: `stories/${id}/${photoId}.${p.ext}`, position, ...p };
  });
  // Upload photos first so a story row never points at a missing file.
  await Promise.all(
    photoRows.map((p) => MEDIA.put(p.key, p.bytes, { httpMetadata: { contentType: p.type } })),
  );
  await DB.batch([
    DB.prepare(
      "INSERT INTO stories (id, user_id, title, body, vehicle, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(id, input.userId, input.title, input.body, input.vehicle, now),
    ...photoRows.map((p) =>
      DB.prepare(
        "INSERT INTO story_photos (id, story_id, r2_key, content_type, position) VALUES (?, ?, ?, ?, ?)",
      ).bind(p.photoId, id, p.key, p.type, p.position),
    ),
  ]);
  return id;
}

/** Deletes a story (and its photos) if it belongs to this user. */
export async function removeStory(id: string, userId: string): Promise<boolean> {
  const { DB, MEDIA } = await getEnv();
  const owned = await DB.prepare("SELECT id FROM stories WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .first();
  if (!owned) return false;
  const { results } = await DB.prepare("SELECT r2_key FROM story_photos WHERE story_id = ?")
    .bind(id)
    .all<{ r2_key: string }>();
  await DB.batch([
    DB.prepare("DELETE FROM story_votes WHERE story_id = ?").bind(id),
    DB.prepare("DELETE FROM story_photos WHERE story_id = ?").bind(id),
    DB.prepare("DELETE FROM stories WHERE id = ?").bind(id),
  ]);
  if (results.length) await MEDIA.delete(results.map((r) => r.r2_key));
  return true;
}

/** Adds or removes this user's upvote; returns the new count and state. */
export async function flipVote(storyId: string, userId: string) {
  const { DB } = await getEnv();
  const had = await DB.prepare("SELECT 1 FROM story_votes WHERE story_id = ? AND user_id = ?")
    .bind(storyId, userId)
    .first();
  // Recount instead of +1/-1 so double clicks or races can't drift the total.
  const recount = DB.prepare(
    "UPDATE stories SET upvotes = (SELECT COUNT(*) FROM story_votes WHERE story_id = ?) WHERE id = ?",
  ).bind(storyId, storyId);
  await DB.batch([
    had
      ? DB.prepare("DELETE FROM story_votes WHERE story_id = ? AND user_id = ?").bind(
          storyId,
          userId,
        )
      : DB.prepare(
          "INSERT OR IGNORE INTO story_votes (story_id, user_id, created_at) VALUES (?, ?, ?)",
        ).bind(storyId, userId, Date.now()),
    recount,
  ]);
  const row = await DB.prepare("SELECT upvotes FROM stories WHERE id = ?")
    .bind(storyId)
    .first<{ upvotes: number }>();
  return { upvotes: row?.upvotes ?? 0, voted: !had };
}
