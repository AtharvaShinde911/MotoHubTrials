import { createFileRoute } from "@tanstack/react-router";

import { getEnv } from "@/server/env";

/** Serves uploaded photos from R2. Keys are random ids, so responses are cached for good. */
export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat ?? "";
        if (!/^stories\/[\w-]+\/[\w-]+\.(jpg|png|webp)$/.test(key)) {
          return new Response("Not found", { status: 404 });
        }
        const { MEDIA } = await getEnv();
        const obj = await MEDIA.get(key);
        if (!obj) return new Response("Not found", { status: 404 });
        return new Response(obj.body, {
          headers: {
            "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
