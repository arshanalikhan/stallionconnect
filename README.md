# Stallion Connect website

Marketing and lead-generation site for **Stallion Connect Pvt Ltd**, a call centre, BPO and
back-office outsourcing company. Hosted entirely on the Cloudflare free tier.

## Tech stack

| Layer                | Choice                                                            |
| -------------------- | ----------------------------------------------------------------- |
| Framework            | Next.js 16 (App Router) + TypeScript                              |
| Styling              | Tailwind CSS v4, brand tokens in `src/app/globals.css`            |
| Hosting              | Cloudflare Workers via `@opennextjs/cloudflare`                   |
| Database (Phase 3)   | Cloudflare D1 for enquiries, job applications and the admin panel |
| Admin auth (Phase 3) | Cloudflare Access (Zero Trust, free up to 50 users)               |
| 3D (Phase 4)         | React Three Fiber + drei, GSAP ScrollTrigger + Lenis              |
| Later                | Turnstile spam protection, email notifications, CMS               |

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script              | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Next.js dev server                                             |
| `npm run lint`      | ESLint                                                         |
| `npm run typecheck` | Generate route types and run `tsc`                             |
| `npm run format`    | Prettier (with Tailwind class sorting)                         |
| `npm run preview`   | Build for Cloudflare and run it locally in the Workers runtime |
| `npm run deploy`    | Build and deploy to Cloudflare (needs `wrangler login` first)  |

## Project structure

```
src/
  app/                 routes, root layout, global styles, favicon
  components/
    layout/            Header, Footer, Logo, WhatsApp button
    sections/          homepage sections (Phase 2)
    ui/                Button, Container, Section primitives
  config/site.ts       business details: contacts, WhatsApp, nav (edit here)
  lib/                 small helpers
public/brand/          logo files
wrangler.jsonc         Cloudflare Worker config
open-next.config.ts    OpenNext adapter config
```

## Editing business details

All contact details, the WhatsApp number and navigation live in `src/config/site.ts`.
Values marked `TODO` are placeholders to replace before launch.

## Notes

- `cacheComponents` is disabled in `next.config.ts` because it hangs on the Workers runtime.
- Images are served unoptimised (pre-compressed WebP in `public/`) to stay within the free tier.
- The logo is currently a raster image cut from the supplied artwork. Replace with an SVG when available.

## Roadmap

1. **Foundation** (done): project setup, brand tokens, layout shell, Cloudflare deploy config
2. Static site: all homepage sections, responsive
3. Quote form and careers section, D1 storage, admin panel
4. 3D scroll scene (lazy-loaded, with fallbacks)
5. Content pages: Privacy, Terms, service pages
6. SEO and performance
7. Device testing and accessibility
8. Launch on stallionconnect.in
