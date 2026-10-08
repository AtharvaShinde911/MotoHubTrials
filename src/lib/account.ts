/** Server functions for the signed-in account, callable from routes and components. */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { getSessionUser, type SessionUser } from "@/server/auth";
import { getEnv } from "@/server/env";

export type { SessionUser };

export const fetchCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => getSessionUser(getRequest()),
);

export const handleRules = "3–20 characters: lowercase letters, numbers and underscores.";

const profileInput = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, handleRules),
  name: z.string().trim().min(1, "Enter a display name.").max(50, "Keep it under 50 characters."),
});

/** Finishes account creation (or edits the profile): username + display name. */
export const saveProfile = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof profileInput>) => profileInput.parse(data))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const user = await getSessionUser(getRequest());
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };
    const { DB } = await getEnv();
    const taken = await DB.prepare("SELECT id FROM users WHERE handle = ? AND id != ?")
      .bind(data.handle, user.id)
      .first();
    if (taken) return { ok: false, error: `u/${data.handle} is taken. Try another.` };
    await DB.prepare("UPDATE users SET handle = ?, name = ? WHERE id = ?")
      .bind(data.handle, data.name, user.id)
      .run();
    return { ok: true };
  });
