# Stallion Connect website: handover

This file is the single place to understand where the project stands. It is updated at the
end of every phase.

- **Repository:** https://github.com/arshanalikhan/stallionconnect
- **Working branch:** `claude/modest-euler-dz9n9e`
- **Live preview:** https://arshanalikhan.github.io/stallionconnect/ (GitHub Pages, static)
- **Production (final phase):** Cloudflare Workers on `stallionconnect.in` (domain purchased)
- **Last updated:** Phase 2

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
src/app/                 routes, root layout, global styles (brand tokens), favicon
src/components/layout/   Header, Footer, Logo, WhatsAppButton
src/components/ui/       Button, Container, Section, Heading, Icon, Reveal
src/components/sections/ homepage sections (Hero, Services, About, WhyUs, Process,
                         Industries, Careers, Faq, Contact, plus CallCard and CountUp)
src/content/home.ts      all homepage text, lists and numbers
src/config/site.ts       business details, WhatsApp number, navigation
src/assets/brand/        logo files
docs/                    Cloudflare deployment steps
```

## 6. Editing content

- **Homepage text, services, stats, job openings, FAQ:** `src/content/home.ts`
- **Contact details, WhatsApp, nav:** `src/config/site.ts`
- **Icons:** add a path to `src/components/ui/Icon.tsx`, then use its name in the content file
- **Brand colours and fonts:** top of `src/app/globals.css`

## 7. Placeholders to replace before launch

| Item              | Where                              | Current value                                                          |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Phone number      | `src/config/site.ts`               | `+91 00000 00000`                                                      |
| WhatsApp number   | `src/config/site.ts`               | `910000000000`                                                         |
| Office address    | `src/config/site.ts`               | `India`                                                                |
| Office hours      | `src/config/site.ts`               | Mon to Sat, 9 AM to 7 PM IST (unconfirmed)                             |
| Logo              | `src/assets/brand/`                | Raster cut from the supplied JPEG; replace with SVG or transparent PNG |
| Privacy and Terms | `src/app/privacy`, `src/app/terms` | Placeholder text                                                       |

## 8. Known issues

- The logo has a white background, so it shows as a white box on the light-grey footer.
  Fix: supply an SVG or transparent PNG.
- "Get a Quote" buttons currently open an email to info@. Phase 3 replaces this with the
  quote form.
- Forms and the admin panel (Phase 3) cannot work on GitHub Pages, which only serves static
  files. They will work once deployed to Cloudflare.

## 9. Next up

Phase 3: quote form (on the page and in a dialog from every "Get a Quote" button), careers
enquiry form, API routes written for Cloudflare D1, and an admin panel to view leads.

## 10. Phase log

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
