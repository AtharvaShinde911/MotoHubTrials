import { createFileRoute } from "@tanstack/react-router";

import { destroySession } from "@/server/auth";

export const Route = createFileRoute("/api/auth/signout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookie = await destroySession(request);
        return new Response(null, {
          status: 303,
          headers: { location: "/", "set-cookie": cookie },
        });
      },
    },
  },
});
