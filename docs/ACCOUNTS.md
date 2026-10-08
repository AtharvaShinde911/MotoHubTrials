# Accounts and Garage Stories

Sign-in is Google only. The first Google sign-in creates the account, then the user picks a
username on `/account`. Signed-in users can post stories with up to 4 photos and upvote.
Reading stays public.

| Piece | Where |
| --- | --- |
| Google OAuth (PKCE) | `src/server/google.ts`, `src/routes/api.auth.*.ts` |
| Sessions (30 days, hashed in D1, `mh_session` cookie) | `src/server/auth.ts` |
| Stories, photos, votes | `src/server/stories.ts`, `src/lib/stories.ts` |
| Database schema | `migrations/0001_accounts_and_stories.sql` (D1, binding `DB`) |
| Photos | R2 bucket `motohub-media` (binding `MEDIA`), served from `/api/media/...` |

## Run it locally

```sh
npm install
npm run db:migrate:local      # creates the tables in .wrangler/state
npm run dev -- --host 127.0.0.1
```

Without Google keys, `/signin` shows a **Dev sign-in** box (development builds only) that
signs you in as any email. To try real Google sign-in locally, copy `.dev.vars.example` to
`.dev.vars`, fill in the client ID and secret, and add
`http://127.0.0.1:8080/api/auth/callback/google` as a redirect URI on the OAuth client.

## Set up production (one time)

You need a Cloudflare account and a Google Cloud account. Keep secrets out of chat and git.

1. **Google OAuth client.** In Google Cloud Console: APIs & Services → OAuth consent screen
   (External, app name MOTOHUB, scopes `openid`, `email`, `profile`). Then Credentials →
   Create credentials → OAuth client ID → Web application. Authorized redirect URI:
   `https://<your-domain>/api/auth/callback/google`. Copy the client ID and secret.
2. **D1 database.** `npx wrangler login`, then `npx wrangler d1 create motohub`. Paste the
   printed `database_id` into `wrangler.jsonc` in place of `REPLACE_WITH_D1_DATABASE_ID`.
3. **R2 bucket.** Enable R2 on the Cloudflare account, then
   `npx wrangler r2 bucket create motohub-media`.
4. **Tables.** `npm run db:migrate:remote`.
5. **Secrets.** `npx wrangler secret put GOOGLE_CLIENT_ID` and
   `npx wrangler secret put GOOGLE_CLIENT_SECRET` (each prompts for the value). Optionally
   `APP_URL` = `https://<your-domain>` if the site sits behind another domain or proxy.
6. **Deploy.** `npm run deploy`.

While the OAuth consent screen is in "Testing" mode, only the test users you list can sign
in. Publish it to open sign-up to everyone.
