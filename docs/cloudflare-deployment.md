# Cloudflare deployment (final phase)

Cloudflare is the production host, but it is **not wired up yet**. Until then, a static
preview is published to GitHub Pages. The code is written to stay Cloudflare-compatible:

- No `cacheComponents` / `partialPrefetching` (they hang on the Workers runtime).
- No Node-only APIs (`fs`, `child_process`) in server code; use Web APIs (`fetch`, `crypto.subtle`).
- Images are pre-compressed WebP and served unoptimised (no paid image transformations).
- All data access goes through `getStore()` in `src/lib/db/index.ts`, which already uses a D1
  binding named `DB` when one is present (see `src/lib/db/d1.ts`).
- The schema is in `migrations/0001_init.sql`.
- API routes and the admin page are named `*.server.ts(x)`. They are built normally and only left
  out of the GitHub Pages static export.

## Steps when we go live

1. Install the adapter and CLI:
   ```bash
   npm i @opennextjs/cloudflare
   npm i -D wrangler
   ```
2. Run `npx opennextjs-cloudflare migrate` (creates `wrangler.jsonc`, `open-next.config.ts`).
   Set the worker name to `stallionconnect`.
3. Create the database and add the binding:
   ```bash
   npx wrangler d1 create stallionconnect
   ```
   Add the returned block to `wrangler.jsonc` with `"binding": "DB"` and
   `"migrations_dir": "migrations"`, then apply the schema:
   ```bash
   npx wrangler d1 migrations apply stallionconnect --remote
   ```
   This applies every file in `migrations/` in order (`0001_init.sql`, `0002_lead_source.sql`).
4. In `src/lib/db/index.ts`, optionally replace the global-symbol lookup with
   `getCloudflareContext().env.DB` from `@opennextjs/cloudflare`.
5. Protect the admin with Cloudflare Access (Zero Trust, free up to 50 users):
   - Create a self-hosted application for `stallionconnect.in/admin*` and
     `stallionconnect.in/api/admin/*`, with a policy allowing the team's emails.
   - Set two Worker variables: `CF_ACCESS_TEAM_DOMAIN` (for example
     `stallion.cloudflareaccess.com`) and `CF_ACCESS_AUD` (the application's audience tag).
     Without them the admin stays locked (fails closed).
6. `npm run deploy`, then attach the custom domain `stallionconnect.in` in the dashboard.
7. Add `public/_headers` with a long cache for `/_next/static/*`.
8. Later: add Turnstile to the forms and email notifications for new leads.
