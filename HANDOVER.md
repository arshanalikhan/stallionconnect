# Stallion Connect website: handover

This file is the single place to understand where the project stands. It is updated at the
end of every phase.

- **Repository:** https://github.com/arshanalikhan/stallionconnect
- **Working branch:** `claude/modest-euler-dz9n9e`
- **Live preview:** https://arshanalikhan.github.io/stallionconnect/ (GitHub Pages, static)
- **Production (final phase):** Cloudflare Workers on `stallionconnect.in` (domain purchased)
- **Last updated:** Phase 4

---

## 1. Phase status

| #   | Phase                                                   | Status      |
| --- | ------------------------------------------------------- | ----------- |
| 1   | Foundation: setup, brand, layout shell, preview hosting | Done        |
| 2   | Static site: all homepage sections, responsive          | Not started |
| 3   | Quote form, careers enquiries, D1 storage, admin panel  | Not started |
| 4   | 3D scroll scene (lazy-loaded, with fallbacks)           | Not started |
| 5   | Content pages: Privacy, Terms, service pages            | Not started |
| 6   | SEO and performance                                     | Not started |
| 7   | Device testing and accessibility                        | Not started |
| 8   | Cloudflare setup and launch on stallionconnect.in       | Not started |

## 2. Decisions so far

| Topic             | Decision                                                               | Reason                                                    |
| ----------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| Framework         | Next.js 16 (App Router) + TypeScript                                   | SEO-friendly, API routes for forms, grows into more pages |
| Styling           | Tailwind CSS v4 with brand tokens                                      | Fast to build, consistent colours                         |
| Production host   | Cloudflare (Workers, D1, Access), free tier                            | Owner's first preference; one account for everything      |
| Preview host      | GitHub Pages via Actions                                               | Cloudflare deferred until the final phase                 |
| Careers           | Listings + application details form, **no CV upload**; CVs go by email | Owner's choice                                            |
| WhatsApp          | Floating chat button on every page                                     | Owner asked for it                                        |
| Admin panel       | Yes, protected by Cloudflare Access                                    | Owner asked for it                                        |
| Deferred to later | Spam protection (Turnstile), email notifications, CMS                  | Owner's choice                                            |
| Content           | Placeholder text and numbers for now                                   | Owner will edit text after the build                      |
| `cacheComponents` | Off                                                                    | Hangs on the Cloudflare Workers runtime                   |
| Images            | Pre-compressed WebP, imported statically, unoptimised                  | Free tier, and works under the Pages sub-path             |

## 3. How to run

Requires Node.js 20.9 or newer (22 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000. On Windows PowerShell 5, run commands one per line (no `&&`).

| Script                | What it does                                |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Development server                          |
| `npm run lint`        | ESLint                                      |
| `npm run typecheck`   | Route types + TypeScript                    |
| `npm run format`      | Prettier with Tailwind class sorting        |
| `npm run build`       | Production build (used by Cloudflare later) |
| `npm run build:pages` | Static export for GitHub Pages into `out/`  |

## 4. Deployment (preview)

`.github/workflows/pages.yml` runs on every push to `main` or the working branch:
lint, typecheck, static build, then publishes `out/` to the `gh-pages` branch.

One-time setting (done by the owner): repository **Settings > Pages > Deploy from a branch >
`gh-pages` / root**.

## 5. Where things live

```
src/app/layout.tsx       root html, fonts, metadata
src/app/(site)/          public pages with header, footer and form dialogs
src/app/admin/           admin panel (page.server.tsx)
src/app/api/             API routes (route.server.ts): enquiries, applications, admin
src/components/layout/   Header, Footer, Logo, WhatsAppButton
src/components/ui/       Button, Container, Section, Heading, Icon, Reveal
src/components/sections/ homepage sections (Hero, Services, About, WhyUs, Process,
                         Industries, Careers, Faq, Contact, plus CallCard and CountUp)
src/content/home.ts      all homepage text, lists and numbers
src/components/forms/    quote form, application form, dialogs, field components
src/components/admin/    admin lead list
src/components/three/    3D hero: Hero3D.tsx (loader and device checks), HeroScene.tsx
                         (scene), textures.ts (card faces, building windows)
src/lib/forms/           shared validation (schemas.ts) and submit logic
src/lib/db/              data store: D1 (production) and in-memory (local dev)
src/lib/admin-auth.ts    Cloudflare Access check for the admin
migrations/              D1 database schema
src/config/site.ts       business details, WhatsApp number, navigation
src/assets/brand/        logo files
docs/                    Cloudflare deployment steps
```

## 6. Editing content

- **Homepage text, services, stats, job openings, FAQ:** `src/content/home.ts`
- **Contact details, WhatsApp, nav:** `src/config/site.ts`
- **Icons:** add a path to `src/components/ui/Icon.tsx`, then use its name in the content file
- **Brand colours and fonts:** top of `src/app/globals.css`

## 7. Forms and admin

| Item                 | How it works                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Quote form           | On the Contact section and in a pop-up from every "Get a Quote" and "Enquire" button (service pre-selected)                                |
| Application form     | Pop-up from "Apply" buttons in Careers (role pre-selected). No CV upload; applicants email CVs to careers@                                 |
| Validation           | Same rules in the browser and on the server (`src/lib/forms/schemas.ts`)                                                                   |
| Spam                 | Hidden honeypot field now; Turnstile later                                                                                                 |
| Storage              | Cloudflare D1 in production; in-memory while running `npm run dev` (resets on restart)                                                     |
| Admin                | `/admin`: two tabs, filter by status, change status (new, contacted, closed), private notes, CSV download, quick email/call/WhatsApp links |
| Admin login          | Cloudflare Access in production. Open without login only in `npm run dev`. Locked everywhere else                                          |
| GitHub Pages preview | No server there, so the forms open a pre-filled email to info@ or careers@ instead, and `/admin` does not exist                            |

To try it locally: `npm run dev`, submit a form, then open http://localhost:3000/admin.

## 8. 3D hero

| Item                                      | How it works                                                                                                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What it shows                             | Light-blue city avenue, four green gates (the four process steps), floating particles, and on desktops a 3D "live call" card with orbiting connection nodes |
| Scroll                                    | The camera glides down the avenue and the card flips to show the logo and tagline                                                                           |
| Mouse                                     | Gentle parallax on the camera and card                                                                                                                      |
| Loading                                   | The page text and buttons load first. The 3D code (about 245 KB compressed) downloads only after the page has loaded and the browser is idle, then fades in |
| Desktop (1024px+, mouse, 4+ cores, 4+ GB) | Full scene with the 3D card, which replaces the flat card                                                                                                   |
| Phones and modest devices                 | Lighter scene (fewer buildings and particles, no 3D card, lower resolution); the flat card stays                                                            |
| No 3D at all                              | Reduced-motion setting, Data Saver, no WebGL, or very weak devices: the plain hero from Phase 2                                                             |
| Battery and CPU                           | Rendering stops while the hero is off screen or the tab is hidden                                                                                           |
| Tuning                                    | Colours, building density, card size and scroll behaviour are at the top of each component in `HeroScene.tsx`                                               |

## 9. Placeholders to replace before launch

| Item              | Where                              | Current value                                                          |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Phone number      | `src/config/site.ts`               | `+91 00000 00000`                                                      |
| WhatsApp number   | `src/config/site.ts`               | `910000000000`                                                         |
| Office address    | `src/config/site.ts`               | `India`                                                                |
| Office hours      | `src/config/site.ts`               | Mon to Sat, 9 AM to 7 PM IST (unconfirmed)                             |
| Logo              | `src/assets/brand/`                | Raster cut from the supplied JPEG; replace with SVG or transparent PNG |
| Privacy and Terms | `src/app/privacy`, `src/app/terms` | Placeholder text                                                       |

## 10. Known issues

- The logo only works on light backgrounds (its navy text disappears on dark). A white or
  single-colour version is needed if we ever place it on a dark section.
- GitHub Pages deploys occasionally hang on GitHub's side ("Deploying" for a long time). Fix:
  push again, or cancel the stuck "pages build and deployment" run in Actions and re-run it.
- On the GitHub Pages preview the forms fall back to a pre-filled email, and there is no admin.
  Saving to the database and the admin panel start working once deployed to Cloudflare.
- No email notification for new leads yet (deferred). Until then, check the admin panel.
- The browser console shows a harmless `THREE.Clock` deprecation warning from React Three
  Fiber. It goes away when the library updates.

## 11. Next up

Phase 5: content pages. Privacy Policy and Terms (with DPDP Act coverage for form and
recruitment data), and optionally one page per service for SEO.

## 12. Phase log

### Phase 1: Foundation (done)

- Next.js 16, TypeScript, Tailwind v4, ESLint, Prettier set up.
- Brand tokens sampled from the logo: navy `#012b75`, royal `#1a56c4`, green `#139528`.
- Logo, favicon and Apple touch icon generated from the supplied artwork.
- Layout shell: sticky header with mobile menu, footer, floating WhatsApp button, skip link.
- Homepage hero plus placeholder sections with working anchors; placeholder Privacy and Terms.
- Cloudflare adapter tried, then removed at the owner's request; notes kept in
  `docs/cloudflare-deployment.md`.
- GitHub Pages preview workflow added.
- Verified: lint, typecheck and static build pass; no browser errors on desktop or mobile.

### Phase 2: Static site (done)

- All homepage sections built: Hero (with animated "live call" card), Services (8 cards),
  About (mission, vision, animated stats), Why us (6 points, dark section), How we work
  (4 steps), Industries (8 sectors), Careers (6 openings, apply by email), FAQ (5 questions),
  Contact (email, phone, WhatsApp, hours, office).
- All text moved into `src/content/home.ts` so copy can be changed without touching layout.
- Scroll reveal and count-up animations; both respect "reduce motion" and work without JS.
- Careers: each opening has an "Apply by email" button that opens a pre-filled email to
  careers@ (no CV upload, as decided).
- FAQ link added to the navigation. The full menu shows from 1280px wide; smaller screens use
  the menu button.
- Verified: lint, typecheck and static build pass; no console errors and no horizontal
  scrolling at 1366px, 1024px and 390px wide.
- Follow-up: logo replaced with the owner's file, background made transparent, shown larger
  in the header and footer. Tagline "Where every connection counts" added to the hero, the
  footer and the browser tab title.

### Phase 3: Forms and admin (done)

- Quote form on the Contact section and in a pop-up opened by every "Get a Quote" and
  "Enquire" button; the chosen service is pre-selected.
- Job application form in a pop-up from the Careers "Apply" buttons; the role is
  pre-selected. CVs go by email to careers@.
- Shared validation for browser and server, clear per-field messages, consent checkbox,
  honeypot against bots, 20 KB request limit.
- API routes: `POST /api/enquiries`, `POST /api/applications`,
  `PATCH /api/admin/{type}/{id}`, `GET /api/admin/{type}/export` (CSV).
- Data store with a Cloudflare D1 implementation and schema, plus an in-memory store
  for local development.
- Admin panel at `/admin`: tabs, status filters with counts, status changes, private notes,
  CSV download, email/phone/WhatsApp links. Hidden from search engines.
- Admin security: Cloudflare Access JWT verification; locked unless configured (except
  local dev).
- Public pages moved into a `(site)` route group so the admin has its own layout.
- GitHub Pages preview: forms open a pre-filled email, `/admin` and the API are left out.
- Verified: lint, typecheck, production and static builds; browser tests for both forms,
  dialogs, validation, admin status/note updates, filters, CSV; production build returns 401
  for the admin and API without login; preview fallback tested.

### Phase 4: 3D hero (done)

- Three.js scene behind the hero, built with React Three Fiber: city skyline (instanced, so
  it is cheap to draw), four glowing process gates, particles, and a 3D "live call" card with
  orbiting nodes on desktop.
- Scroll moves the camera down the avenue and flips the card to the logo and tagline; the
  mouse adds parallax.
- Headline, text and buttons stay as real HTML on top (good for SEO and accessibility),
  with a soft white overlay for readability.
- Loads after the page and only on capable devices; lighter mode for phones; plain hero for
  reduced motion, Data Saver, no WebGL or weak hardware; pauses when off screen.
- Hero now fills the first screen on desktops.
- Verified: lint, typecheck, static build; rendered in a browser at desktop and phone sizes;
  reduced-motion users get no canvas; the 3D code is not in the initial page load.
