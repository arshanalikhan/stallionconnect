# Stallion Connect website: handover

This file is the single place to understand where the project stands. It is updated at the
end of every phase.

- **Repository:** https://github.com/arshanalikhan/stallionconnect
- **Working branch:** `claude/modest-euler-dz9n9e`
- **Live preview:** https://arshanalikhan.github.io/stallionconnect/ (GitHub Pages, static)
- **Production (final phase):** Cloudflare Workers on `stallionconnect.in` (domain purchased)
- **Last updated:** Phase 4 (full-site 3D update)

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
src/components/layout/   Header, Footer, Logo, WhatsAppButton, CustomCursor
src/components/ui/       Button, Container, Section, Heading, Icon, Reveal
src/components/sections/ homepage sections (Hero, Services, About, WhyUs, Process,
                         Industries, Careers, Faq, Contact, plus CallCard and CountUp)
src/content/home.ts      all homepage text, lists and numbers
src/components/forms/    quote form, application form, dialogs, field components
src/components/admin/    admin lead list
src/components/three/    3D: Scene3D.tsx (loader, device checks, scroll tracking),
                         SiteScene.tsx (scene), sceneState.ts, textures.ts
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

| Item                 | How it works                                                                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quote form           | On the Contact section and in a pop-up from every "Get a Quote" and "Enquire" button (service pre-selected)                                                                                                                      |
| Application form     | Pop-up from "Apply" buttons in Careers (role pre-selected). No CV upload; applicants email CVs to careers@                                                                                                                       |
| Validation           | Same rules in the browser and on the server (`src/lib/forms/schemas.ts`)                                                                                                                                                         |
| Spam                 | Hidden honeypot field now; Turnstile later                                                                                                                                                                                       |
| Storage              | Cloudflare D1 in production; in-memory while running `npm run dev` (resets on restart)                                                                                                                                           |
| Admin                | `/admin`: two tabs, filter by status, change status (new, contacted, closed), private notes, CSV download, quick email/call/WhatsApp links                                                                                       |
| Admin login          | Cloudflare Access in production. Open without login only in `npm run dev`. Locked everywhere else                                                                                                                                |
| GitHub Pages preview | No server or database there, so nothing is saved. After submitting, the visitor sees "One more step: send it by email" with their details, an "Open email app" button and a "Copy details" button. `/admin` does not exist there |

To try it locally: `npm run dev`, submit a form, then open http://localhost:3000/admin.

## 8. 3D scene

| Item                                      | How it works                                                                                                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where                                     | One fixed 3D scene behind the whole site. Sections are see-through and text sits on frosted-glass panels                                                                                                                        |
| Journey                                   | Scrolling the page flies the camera down a city avenue from the hero to Contact                                                                                                                                                 |
| Hero                                      | Glossy 3D "live call" card (desktop): rounded corners, curved polished rim, clear-coat reflections and a moving light streak. Tilts with the mouse; as the hero scrolls away it flips to the logo and flies off down the avenue |
| How we work                               | The camera passes through four glowing gates, one per step, while the section is on screen                                                                                                                                      |
| Why us                                    | The city turns to night: dark sky, glowing windows                                                                                                                                                                              |
| Mouse                                     | Gentle parallax on the camera and card                                                                                                                                                                                          |
| Loading                                   | The page text and buttons load first. The 3D code (about 245 KB compressed) downloads only after the page has loaded and the browser is idle, then fades in                                                                     |
| Desktop (1024px+, mouse, 4+ cores, 4+ GB) | Full scene with the 3D card, which replaces the flat card                                                                                                                                                                       |
| Phones and modest devices                 | Lighter scene (fewer buildings and particles, no 3D card, lower resolution); the flat card stays                                                                                                                                |
| No 3D at all                              | Reduced-motion setting, Data Saver, no WebGL, or very weak devices: normal solid sections (Phase 2 look)                                                                                                                        |
| How the page adapts                       | `<html data-scene="high                                                                                                                                                                                                         | low">`is set when the scene is showing. CSS classes in`globals.css`: `scene-clear`(see-through section),`scene-panel`(glass panel),`scene-night`, `scene-hide`, `scene-only`, `scene-hide-card` |
| Tuning                                    | Camera route (`PATH`), colours, building density and card behaviour are at the top of each component in `SiteScene.tsx`                                                                                                         |

## 9. Custom cursor

| Item                  | How it works                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Style                 | Glossy, chunky 3D "toy" arrow in brand colours (original artwork, drawn in SVG in code)                                    |
| Default               | Green 3D arrow with a darker thickness edge, shine highlight and a soft green glow                                         |
| Clickable things      | The same arrow turns bright blue with a strong blue glow and grows slightly                                                |
| Trail                 | Nine small glowing dots (green to blue, getting smaller) follow behind while the mouse moves, and fade out when it stops   |
| Click                 | Green and lime spark lines burst from the tip                                                                              |
| Movement              | Follows the mouse exactly (no lag) and tilts slightly in the direction of movement                                         |
| Normal cursor instead | Over text fields (so typing works as usual) and while a pop-up form is open                                                |
| Off completely        | Phones, tablets, touch screens and reduced-motion users                                                                    |
| Code                  | `src/components/layout/CustomCursor.tsx` (artwork and behaviour); styles at the end of `src/app/globals.css` (`.cursor-*`) |

## 10. Placeholders to replace before launch

| Item              | Where                              | Current value                                                          |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Phone number      | `src/config/site.ts`               | `+91 00000 00000`                                                      |
| WhatsApp number   | `src/config/site.ts`               | `910000000000`                                                         |
| Office address    | `src/config/site.ts`               | `India`                                                                |
| Office hours      | `src/config/site.ts`               | Mon to Sat, 9 AM to 7 PM IST (unconfirmed)                             |
| Logo              | `src/assets/brand/`                | Raster cut from the supplied JPEG; replace with SVG or transparent PNG |
| Privacy and Terms | `src/app/privacy`, `src/app/terms` | Placeholder text                                                       |

## 11. Known issues

- The logo only works on light backgrounds (its navy text disappears on dark). A white or
  single-colour version is needed if we ever place it on a dark section.
- GitHub Pages deploys occasionally hang on GitHub's side ("Deploying" for a long time). Fix:
  push again, or cancel the stuck "pages build and deployment" run in Actions and re-run it.
- On the GitHub Pages preview nothing is saved: the forms ask the visitor to send their details
  by email (Open email app or Copy details), and there is no admin.
  Saving to the database and the admin panel start working once deployed to Cloudflare.
- No email notification for new leads yet (deferred). Until then, check the admin panel.
- The browser console shows a harmless `THREE.Clock` deprecation warning from React Three
  Fiber. It goes away when the library updates.

## 12. Next up

Phase 5: content pages. Privacy Policy and Terms (with DPDP Act coverage for form and
recruitment data), and optionally one page per service for SEO.

## 13. Phase log

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

### Fix after Phase 4: clearer form message on the preview

- On GitHub Pages the form used to say "Thank you, we have your enquiry" and try to open the
  email app automatically. That was misleading (nothing is saved there) and did nothing on
  computers without an email app. It now says the details have not been sent yet and offers
  "Open email app" and "Copy details". On the real server the normal thank-you message shows.

### Phase 4 update: 3D across the whole site, glossy card

- Owner feedback: 3D on the whole site, not only the hero; the card looked flat and had
  square corners.
- The scene is now one fixed background for every section. Scroll flies the camera down the
  avenue; gates sit at "How we work"; night falls at "Why us".
- Sections became see-through with frosted-glass panels for text. Without 3D they keep their
  solid backgrounds, and nothing shifts when the scene fades in.
- New card: rounded faces (not just the body), curved polished rim, clear-coat reflections
  from a studio environment, a light streak that sweeps across and follows the tilt.
- Card size now follows the page layout, so it fits on wide screens (it was oversized and
  cut off at 1892px).
- Mouse parallax now works (it was not receiving mouse events before).
- Verified: lint, typecheck, static build; browser checks at 1600px, 1892px and 390px, every
  section scrolled; reduced motion falls back to solid sections; no horizontal scrolling.

### Update: brand cursor

- Custom cursor on desktop: green dot, trailing ring that grows over clickable things, click
  ripple, light colours on dark sections. Normal cursor kept for text fields, pop-up forms,
  touch devices and reduced motion.
- Buttons now show the hand pointer everywhere (Tailwind resets it to an arrow).
- Verified in a browser: plain area, button hover, click ripple cleanup, dark section, text
  field, pop-up open and closed, touch device and reduced motion.

### Update: 3D-style cursor

- Owner asked for a glossy 3D cartoon-style cursor (arrow and pointing hand with click
  sparks). Replaced the dot-and-ring cursor with original SVG artwork in brand colours:
  green arrow, blue pointing hand, spark burst on click, slight tilt with movement.
- Verified in a browser: arrow, hand over buttons, spark burst, tilt, text field and pop-up
  fall back to the normal cursor.

### Update: simpler hover and a dot trail

- Owner asked to replace the pointing hand with a simple colour change and more glow, and to
  add dots following the cursor. Hover now turns the arrow glowing blue; a trail of nine
  glowing dots follows the cursor and fades out when it stops.

### Fix: hero intro text readability

- The hero intro paragraph was grey text directly over the 3D buildings and hard to read. It
  is now darker and medium weight, sits on a frosted-glass backdrop when the 3D scene is
  showing (`.scene-glass-text` in `globals.css`), and the white fade on the left of the hero
  is stronger. Without 3D the text is unchanged in position.
