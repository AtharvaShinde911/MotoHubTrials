import { createFileRoute } from "@tanstack/react-router";

import { createSession, safeNext, upsertGoogleUser } from "@/server/auth";

/**
 * Local-only sign-in for `npm run dev`, so accounts and stories can be tried without a
 * Google OAuth client. `import.meta.env.DEV` is false in production builds, so this 404s there.
 */
export const Route = createFileRoute("/api/auth/dev")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!import.meta.env.DEV) return new Response("Not found", { status: 404 });
        const form = await request.formData();
        const email = String(form.get("email") ?? "")
          .trim()
          .toLowerCase();
        if (!/^[^@\s]+@[^@\s]+$/.test(email)) {
          return new Response("Enter an email", { status: 400 });
        }
        const user = await upsertGoogleUser({
          sub: `dev:${email}`,
          email,
          name: email.split("@")[0],
        });
        const next = safeNext(String(form.get("next") ?? "/"));
        const location = user.handle ? next : `/account?next=${encodeURIComponent(next)}`;
        return new Response(null, {
          status: 303,
          headers: { location, "set-cookie": await createSession(request, user.id) },
        });
      },
    },
  },
});
