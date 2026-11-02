# Cloudflare deployment (final phase)

Cloudflare is the production host, but it is **not wired up yet**. Until then, a static
preview is published to GitHub Pages. The code is written to stay Cloudflare-compatible:

- No `cacheComponents` / `partialPrefetching` (they hang on the Workers runtime).
- No Node-only APIs (`fs`, `child_process`) in server code; use Web APIs (`fetch`, `crypto.subtle`).
- Images are pre-compressed WebP and served unoptimised (no paid image transformations).
- Server-side data access will go through a small repository layer so D1 can be plugged in.

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
   Add the returned `d1_databases` block (binding `DB`) to `wrangler.jsonc`, then apply migrations.
4. Protect `/admin` with Cloudflare Access (Zero Trust, free up to 50 users).
5. `npm run deploy`, then attach the custom domain `stallionconnect.in` in the dashboard.
6. Add `public/_headers` with long cache for `/_next/static/*`.
