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

| Topic             | Decision                                                                                                                                                                                                        | Reason                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router) + TypeScript                                                                                                                                                                            | SEO-friendly, API routes for forms, grows into more pages                                                  |
| Styling           | Tailwind CSS v4 with brand tokens                                                                                                                                                                               | Fast to build, consistent colours                                                                          |
| Fonts             | Times New Roman style everywhere (Tinos, a metric match, with real Times New Roman as fallback), loaded via `next/font` in `layout.tsx`. Highlighted heading words (`.accent-serif`) are the same font in green | Owner asked for Times Roman; the cursive and serif-italic accent fonts were removed at the owner's request |
| Production host   | Cloudflare (Workers, D1, Access), free tier                                                                                                                                                                     | Owner's first preference; one account for everything                                                       |
| Preview host      | GitHub Pages via Actions                                                                                                                                                                                        | Cloudflare deferred until the final phase                                                                  |
| Careers           | Listings + application details form, **no CV upload**; CVs go by email                                                                                                                                          | Owner's choice                                                                                             |
| WhatsApp          | Floating chat button on every page                                                                                                                                                                              | Owner asked for it                                                                                         |
| Admin panel       | Yes, protected by Cloudflare Access                                                                                                                                                                             | Owner asked for it                                                                                         |
| Deferred to later | Spam protection (Turnstile), email notifications, CMS                                                                                                                                                           | Owner's choice                                                                                             |
| Content           | Placeholder text and numbers for now                                                                                                                                                                            | Owner will edit text after the build                                                                       |
| `cacheComponents` | Off                                                                                                                                                                                                             | Hangs on the Cloudflare Workers runtime                                                                    |
| Images            | Pre-compressed WebP, imported statically, unoptimised                                                                                                                                                           | Free tier, and works under the Pages sub-path                                                              |

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
src/app/izharuddin/      admin pages at /izharuddin: dashboard, enquiries, applications
src/app/api/             API routes (route.server.ts): enquiries, applications, admin list/update/delete/export
src/components/layout/   Header (glossy pill navbar), Footer, Logo, WhatsAppButton, CustomCursor
src/components/ui/       Button, Container, Section, Heading, Icon, Reveal
src/components/sections/ homepage sections (Hero, Services, About, WhyUs, Process,
                         Industries, Careers, Faq, Contact, plus CallCard and CountUp)
src/content/home.ts      all homepage text, lists and numbers (including the CEO message)
src/assets/team/         CEO photo
src/components/forms/    quote form, application form, dialogs, field components
src/components/admin/    admin panel: AdminShell, AdminData, Dashboard, LeadsView
src/components/chat/     ChatBot.tsx (widget and guided flows)
src/content/chatbot.ts   chatbot questions, answers and keywords (edit here)
src/lib/admin/           admin client (API or preview demo) and demo store
src/components/three/    3D: Scene3D.tsx (loader, device checks, scroll tracking),
                         SiteScene.tsx (scene), sceneState.ts, textures.ts
src/lib/forms/           shared validation (schemas.ts) and submit logic
src/lib/db/              data store: D1 (production) and in-memory (local dev)
src/lib/admin-auth.ts    Cloudflare Access check for the admin
migrations/              D1 database schema
src/config/site.ts       business details, WhatsApp number, navigation
src/assets/brand/        logo files
docs/                    Cloudflare deployment steps; chatbot-questions.md (+ .docx) lists every chatbot message
```

## 6. Editing content

- **Homepage text, services, stats, job openings, FAQ:** `src/content/home.ts`
- **Contact details, WhatsApp, nav:** `src/config/site.ts`
- **Icons:** add a path to `src/components/ui/Icon.tsx`, then use its name in the content file
- **Brand colours, fonts, shadows, radius:** top of `src/app/globals.css`; fonts are loaded in `src/app/layout.tsx`

## 7. Forms and admin

| Item                 | How it works                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quote form           | On the Contact section and in a pop-up from every "Get a Quote" and "Enquire" button (service pre-selected)                                                                                                                                                                                                                                                                                                                                                                                     |
| Application form     | Pop-up from "Apply" buttons in Careers (role pre-selected). No CV upload; applicants email CVs to careers@                                                                                                                                                                                                                                                                                                                                                                                      |
| Validation           | Same rules in the browser and on the server (`src/lib/forms/schemas.ts`)                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Spam                 | Hidden honeypot field now; Turnstile later                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Storage              | Cloudflare D1 in production; in-memory while running `npm run dev` (resets on restart)                                                                                                                                                                                                                                                                                                                                                                                                          |
| Admin                | `/izharuddin` (staff only; set by `ADMIN_PATH` in `src/config/site.ts` and the `src/app/izharuddin` folder) with a sidebar: **Dashboard** (new leads, this week, chatbot vs form, latest activity, pipeline by status, most requested services, roles applied for, quick CSV downloads), **Enquiries** and **Applications** (search, filter by status and source, sort, expand a lead for contact buttons and details, change status, private notes, delete, download the filtered list as CSV) |
| Admin login          | Email + password, then a 6-digit code emailed to that address (Resend). Session cookie lasts 12 hours. Codes expire in 10 minutes, 5 tries per code; 8 wrong passwords per email lock for 15 minutes; only emails in `ADMIN_EMAILS` can sign in. Cloudflare Access is still supported if configured later. Local `npm run dev` with no sign-in settings opens without login                                                                                                                     |
| GitHub Pages preview | No server or database. Forms show "One more step: send it by email". The admin panel runs as a **demo** with sample data stored only in that browser; forms and chatbot enquiries sent on the preview also appear there. "Reset demo data" restores the samples                                                                                                                                                                                                                                 |

To try it locally: `npm run dev`, submit a form, then open http://localhost:3000/izharuddin.

## 8. Chatbot

| Item             | How it works                                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where            | Round chat button at the bottom right on every public page (WhatsApp button sits above it). A small hello bubble appears once per visit after about 9 seconds; the chat never opens by itself                                                                                                         |
| Answers          | 13 drafted questions and answers in `src/content/chatbot.ts`: services, pricing, pilot, go-live time, international, languages, industries, data security, reporting, 24x7, hiring, CVs, contact. Visitors tap buttons or type; typed text is matched by keywords. No AI, so it never makes things up |
| Get a quote      | Asks one thing at a time: name, company (skippable), email, phone, service, team size, requirements, consent. Each answer is checked with the same rules as the website form. Shows a summary, then sends                                                                                             |
| Apply for a job  | Name, email, phone, role, experience, city and languages (skippable), consent, then reminds them to email their CV                                                                                                                                                                                    |
| Talk to a person | WhatsApp, call and email links                                                                                                                                                                                                                                                                        |
| Saving           | Same API and database as the forms, marked source = chatbot, so leads appear in the admin panel with a Chatbot badge                                                                                                                                                                                  |
| Editing          | Change wording, add questions or keywords in `src/content/chatbot.ts`; the flow questions are at the top of `ChatBot.tsx`                                                                                                                                                                             |

## 9. 3D scene

| Item                                      | How it works                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where                                     | One fixed 3D scene behind the whole site. Sections are see-through and text sits on frosted-glass panels                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Journey                                   | Scrolling the page flies the camera down a city avenue from the hero to Contact                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Card                                      | Glossy 3D "live call" card (desktop) that follows the scroll like the original prototype: each section has its own resting place (large on the right in the hero, small top right in Services, large on the left in About, and so on). Between sections it glides to the next place and turns, so the call side and the logo side take turns facing you. Resting places: `stops()` in `SiteScene.tsx`. Sections that host the large card leave that side free on desktop (`card-lane-left` / `card-lane-right` in `globals.css`) |
| How we work                               | The camera passes through four glowing gates, one per step, while the section is on screen                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Why us                                    | The city turns to night: dark sky, glowing windows                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Mouse                                     | Gentle parallax on the camera and card                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Loading                                   | The page text and buttons load first. The 3D code (about 245 KB compressed) downloads only after the page has loaded and the browser is idle, then fades in                                                                                                                                                                                                                                                                                                                                                                      |
| Desktop (1024px+, mouse, 4+ cores, 4+ GB) | Full scene with the 3D card, which replaces the flat card                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Phones and modest devices                 | Lighter scene (fewer buildings and particles, no 3D card, lower resolution); the flat card stays                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| No 3D at all                              | Reduced-motion setting, Data Saver, no WebGL, or very weak devices: normal solid sections (Phase 2 look)                                                                                                                                                                                                                                                                                                                                                                                                                         |
| How the page adapts                       | `<html data-scene="high                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | low">`is set when the scene is showing. CSS classes in`globals.css`: `scene-clear`(see-through section),`scene-panel`(glass panel),`scene-night`, `scene-hide`, `scene-only`, `scene-hide-card` |
| Tuning                                    | Camera route (`PATH`), colours, building density and card behaviour are at the top of each component in `SiteScene.tsx`                                                                                                                                                                                                                                                                                                                                                                                                          |

## 9a. Scroll video background (TESTING)

- Switch: `BACKGROUND` in `src/config/site.ts`. `"video"` = scroll-scrubbed video (current test), `"3d"` = original 3D city. Nothing from the 3D scene was deleted; to revert, set it back to `"3d"`.
- Component: `src/components/background/ScrollVideo.tsx`. Top of page = first frame, bottom = last frame. Reduced-motion visitors see the poster image.
- Files: `public/bg/journey(.mp4|.webm)`, `journey-mobile(.mp4|.webm)` (used at 767px and below), `journey-poster.jpg`. Encoded with a keyframe every 4 frames so seeking is smooth; cropped to remove the generator watermark.
- Seeking needs a server that supports byte-range requests (GitHub Pages and Cloudflare do; `python -m http.server` does not, so the video looks frozen there).

## 10. Custom cursor

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

## 11. Placeholders to replace before launch

| Item              | Where                              | Current value                                                          |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Phone number      | `src/config/site.ts`               | `+91 00000 00000`                                                      |
| WhatsApp number   | `src/config/site.ts`               | `910000000000`                                                         |
| Office address    | `src/config/site.ts`               | `India`                                                                |
| Office hours      | `src/config/site.ts`               | Mon to Sat, 9 AM to 7 PM IST (unconfirmed)                             |
| Logo              | `src/assets/brand/`                | Raster cut from the supplied JPEG; replace with SVG or transparent PNG |
| Privacy and Terms | `src/app/privacy`, `src/app/terms` | Placeholder text                                                       |

## 12. Known issues

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

## 13. Next up

Phase 5: content pages. Privacy Policy and Terms (with DPDP Act coverage for form and
recruitment data), and optionally one page per service for SEO.

## 14. Phase log

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

### Update: polish pass (fonts, layout, card follows the scroll)

- Fonts: Plus Jakarta Sans for headings and buttons, Inter for body text (replacing Syne).
- Layout polish: tighter type scale and balanced headline wrapping; eyebrow labels with a
  short rule; buttons with fixed heights, smaller radius and no bounce; cards with one
  consistent border, layered shadow and calm hover; refined header with pill hover states
  and a hairline border; hero badge and a stats strip (24x7 / 8 / 2) instead of the tick list.
- 3D scene calmer: finer building windows, muted colours, fewer particles.
- Card: softer reflections and light streak (the left half was washing out), orbiting dots
  always behind the card. After the hero the card shrinks into a floating widget at the
  bottom right and keeps turning with the scroll; clicking it opens the quote form.
- Verified: lint, typecheck, both builds; browser checks at 1440px and 390px, every section,
  widget hand-over and click, reduced-motion fallback, no horizontal scrolling.

### Update: glossy navbar, seamless sections, card follows the scroll

- Navbar: no border or background over the hero. Once the page scrolls it becomes a floating,
  glossy frosted pill (rounded, soft shadow, inner highlight). The current section is shown
  with a small green dot under the menu item. The mobile menu uses the same glass style.
- Removed the hard lines between sections: the hero's white fade and the dark "Why us" tint
  now fade out softly at their edges.
- Card motion now matches the prototype: per-section resting places with a glide and turn
  between them (replacing the bottom-right widget). About, Industries and FAQ leave room on
  one side for the large card on desktop.

### Update: smooth navbar, card placement, gloss, accent fonts

- Navbar is now fixed over the page (the band/line behind it at the top is gone). It glides
  between states with one smooth easing: wide and transparent over the hero, then a narrower
  glossy pill after scrolling; it tucks away when scrolling down through content and slides
  back on any scroll up. A glossy pill glides between menu items to show the current section.
  (The reference site linked by the owner could not be opened from the build environment, so
  this follows the common pattern; easy to tune in `Header.tsx` and `.nav-ease`.)
- Card: settles into each section's spot before the section starts, so every section opens
  with the card at rest: beside the heading (Services, Why us, How we work) or in a free lane
  (About on the left; Industries, Careers, FAQ on the right). At Contact it slides off so the
  form has the full width. Careers now leaves a right lane on desktop.
- Gloss: cards and panels have a bright inner top edge and a soft diagonal light reflection
  (`.gloss`), glass panels have a sheen, buttons have a glossy gradient.
- Accent fonts: highlighted words in headings use Instrument Serif italic; the tagline uses
  Dancing Script (cursive).

### Update: navbar always visible

- The navbar no longer hides when scrolling down; it stays at the top for the whole page.
  Its look and transitions are unchanged.

### Update: quote and apply card redesign

- The pop-up forms are now one glossy split card: a brand side (navy-to-green glass with a
  diagonal blade edge, logo, serif-italic accent headline, three points) and a form side.
- Get a Quote: brand side on the left, form slides in from the right. Apply: mirrored, form
  slides in from the left. A link at the bottom switches between them inside the card, and
  the brand side glides across to the other side.
- Phones: the brand side stacks on top as a compact header.
- Code: `src/components/forms/FormDialogs.tsx` (content in `brandCopy`), styles `.fd-*` in
  `globals.css`. The forms themselves, validation and saving are unchanged.

### Update: 3D on phones, form card scrolling

- Phones and tablets now get the 3D card too. Every section opens with an empty "window"
  at the top (`.scene-window`, `.scene-hero` in `globals.css`) where the card rests centred
  over the city, turning between the call and the logo from section to section; the content
  follows below. At Contact it slides away.
- Long lists become swipeable rows on phones (`.m-rail`: Services, Why us, Careers openings);
  How we work shows two steps per row. Sections are shorter and the scene stays visible.
- These rules only apply when the 3D scene is showing; without it the normal phone layout
  is used.
- Quote/Apply card: the browser's scrollbar no longer appears outside the card. Only the
  form side scrolls, with a slim rounded scrollbar inside the card; slightly tighter spacing.

### Update: Times New Roman, form card scrolling fixes

- Fonts: the sans-serif fonts (Plus Jakarta Sans, Inter) are replaced by a Times New Roman
  style (Tinos) for body text and headings. The serif-italic and cursive accents stay.
- Phones: the quote/apply card could not scroll (a later style reset its overflow), so swipes
  scrolled the page behind. Fixed, and the page behind is now locked while a form is open.
- Apply card on desktop: its scrollbar now sits on the card's outer left edge instead of
  against the blade.

### Fix: alignment of panels and cards

- Heading panels and text panels used negative margins and shrank to fit their text, so
  their edges stuck out past the cards below. Panels now have no negative margins and span
  the full content width, so the left and right edges line up with the cards and grids in
  every section (checked by measuring edges in Services, About, How we work, Industries,
  Careers and FAQ). Panels also look like cards without the 3D scene, so nothing shifts.

### Update: chatbot (option B) and full admin panel

- Chatbot with drafted FAQ, keyword matching for typed questions, and guided quote and job
  application flows that validate every answer and register the lead (source = chatbot).
- Admin panel rebuilt as Dashboard, Enquiries and Applications with search, filters, sort,
  status, notes, delete and CSV export of the filtered list.
- Data: leads now record their source (website or chatbot); new migration
  `migrations/0002_lead_source.sql`; new admin API routes for listing and deleting.
- Preview: admin runs in demo mode with sample data stored in the browser, so it can be tried
  on the GitHub Pages link. Production uses the real API behind Cloudflare Access.
- Verified: lint, typecheck, both builds; browser tests of FAQ buttons, typed questions,
  fallback, full quote and apply flows including invalid email and phone, demo admin and real
  dev-server admin (status change, search, source filter, delete), phone layouts.

### Update: CEO message, staff login link, tighter phone layout

- New "A message from the CEO" section after About: portrait with a glossy frame and name
  badge, the full message, four value tags and a signature in the script font. Text lives in
  `ceo` in `src/content/home.ts`; photo in `src/assets/team/ceo.webp`. On desktop the 3D card
  steps aside for this section.
- Admin access: a "Staff login" link with a lock icon in the footer opens `/admin`. In
  production Cloudflare Access asks for the company login there.
- Phones: the 3D card now appears only in the hero; sections no longer open with a large
  empty window. Sections are separated by a thin strip of the city.
- Chatbot script exported to `docs/chatbot-questions.md` and
  `docs/Stallion-Connect-Chatbot-Questions.docx` for review.

### Fix: card logo side and brightness

- The logo side repeated the tagline (the logo image already contains it). It now shows the
  logo on a bright face with soft blue and green glows, and a solid navy-to-green band flush
  with the bottom edge reading "Call centre · BPO · Back office" (no empty strip at the bottom).
  Change the band text in `SiteScene.tsx` (`logoCardTexture` call).
- The card looked faded because a white veil over the 3D scene was 40% strong and the clear
  coat added white reflections. Veil is now 15% (text sits on glass panels anyway) and the
  coat is softer.
- In Services and How we work the heading panel leaves room on the right on desktop
  (`.heading-lane`), so the card sits beside the glass instead of behind it.

### Fix: chat panel under the navbar

- On shorter screens the chat panel reached the top and the navbar's Get a Quote button showed
  over its header. The chat now sits above the navbar layer and its height is capped so it
  always opens below the navbar (checked at 1366x640, 1440x900 and 390x700).

### Cleanup: unused code removed, no visual or behaviour change

- Quote and application forms now share one submit hook (`src/components/forms/useFormSubmit.ts`)
  instead of two copies of the same logic; removed the unused `idPrefix` prop.
- Removed unused content (`hero.points`), unexported internal helpers and types, stale CSS
  comments, an obsolete iOS scroll property and a needlessly complex selector.
- Fonts: stopped loading three font files that were never used (Tinos italic, upright
  Instrument Serif, Dancing Script 600), so pages download less.
- Verified: TypeScript with unused-code checks, lint, both builds, a dead-code scan, and a
  pixel comparison of 14 screenshots (home, privacy, admin pages, quote card and chat on
  desktop and phone) before and after: all identical. 3D scene, form validation, submission
  and the admin panel re-tested.

### Fix: smooth switch between Get a quote and Apply in the form card

- Causes: switching re-ran the opening slide animation on top of the glide, the form side's
  right margin jumped instead of animating, text and fields swapped in one frame, and the card
  height jumped because the two forms differ in length.
- Now: the text and form fade out, the content swaps while the brand side glides across, the
  new form slides in from its own side and the brand text fades in after the glide. The card
  keeps one height on desktop (`min(800px, 94svh)`, form side scrolls inside) and scrolls back
  to the top on phones. Logic in `switchTo` in `FormDialogs.tsx`; styles under
  `data-phase` in `globals.css`.
- Verified by recording positions and opacity every 30-60 ms through the switch in both
  directions: continuous glide, constant height, no replayed animation.

### Cloudflare deployment set up (in progress)

- Added back the OpenNext adapter (`@opennextjs/cloudflare`), `wrangler`, `wrangler.jsonc`
  (Worker name `stallionconnect`), `open-next.config.ts`, `public/_headers` and scripts
  `cf:build`, `preview`, `deploy`. Bundle: 1.35 MB gzip (free plan limit 3 MB).
- Cloudflare Workers Builds settings: build command `npx opennextjs-cloudflare build`,
  deploy command `npx opennextjs-cloudflare deploy`, production branch
  `claude/modest-euler-dz9n9e` (or merge it into `main`).
- Still to do: create the D1 database and add its binding (forms and admin need it), apply
  `migrations/`, set up Cloudflare Access for `/admin*` and `/api/admin/*` plus the two
  Worker variables, attach `stallionconnect.in`.
- The GitHub Pages preview keeps working alongside.

### Cloudflare: D1 database connected

- D1 database `stallionconnect` (ID `58bc1a20-34d0-4110-89e0-3a92d0a41c17`) bound as `DB` in
  `wrangler.jsonc`. Tested in the local Workers runtime: enquiries and applications save.
- Tables are created once by pasting `docs/d1-setup.sql` into the D1 Console (same schema as
  `migrations/0001` + `0002` combined).

### Update: admin sign-in with password and emailed code

- `/admin` shows a Staff login screen: email and password, then a 6-digit code sent to that
  email. Sign out in the sidebar (desktop) and top bar (phones).
- Server: `src/app/api/admin/auth/{login,verify,logout}`, `src/lib/admin/{session,otp-store,crypto}.ts`,
  `src/lib/email.ts` (Resend). Tables in `migrations/0003_admin_auth.sql` (also appended to
  `docs/d1-setup.sql`).
- Worker settings needed (Settings > Variables and Secrets, type Secret):
  `ADMIN_EMAILS` (comma-separated), `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (40+ random
  characters), `RESEND_API_KEY`; optional `EMAIL_FROM` (defaults to Resend's test sender,
  which can only email the Resend account owner until stallionconnect.in is verified).
- Security: HttpOnly, Secure, SameSite=Strict signed cookie; generic error for wrong email or
  password; code hashed in the database; constant-time comparisons; rate limits as above.
- Verified: dev server browser test of the whole flow (wrong password, unknown email, code,
  wrong code countdown, lockout, sign out, tampered cookie) and the Workers runtime with a
  local D1 copy.

### Update: admin panel moved to /izharuddin

- The admin panel lives at `/izharuddin` (and `/izharuddin/enquiries`,
  `/izharuddin/applications`); `/admin` now shows page not found. The footer Staff login link,
  admin menu, dashboard links and chatbot demo link use `ADMIN_PATH` from `src/config/site.ts`.
  To change it again: rename the `src/app/izharuddin` folder and update `ADMIN_PATH`.
- The API stays at `/api/admin/*` (protected by sign-in either way). If Cloudflare Access is
  used later, protect `/izharuddin*` and `/api/admin/*`.

### Fix: Cloudflare deploy failing with error 10013

- Builds after PR #3 compiled fine but the final upload failed with Cloudflare API error 10013
  (also on retry). The only deploy setting that changed since the last successful deploy was
  `keep_vars: true`, so it was removed. Admin settings must be stored as **Secrets** (not Text
  variables); secrets are always kept when GitHub builds deploy.

### Update: cursive font removed

- The tagline "Where every connection counts" (hero) and the CEO name under the message now
  use the regular Times-style font in bold instead of the Dancing Script cursive. The cursive
  font is no longer loaded.

### Update: accent italic font removed

- Highlighted heading words ("grow business.", "under one roof" and the like) now use the same
  Times-style font as the rest of the heading, kept in green. Instrument Serif is no longer
  loaded; the site now loads a single font family.
