# Colaberry — AI Systems Architect Accelerator (Open House)

A standalone **Next.js** landing page for the **AI Systems Architect Accelerator — Free
Open House** (a live online event by [Colaberry](https://colaberry.com)). It's a single,
animation-rich marketing page built to convert visitors into event registrations.

**Learn with Claude. Build through Colaberry. Deploy in the real world.**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Static Export](https://img.shields.io/badge/deploy-static%20export-77BB4A)

**🔗 Live demo:** https://aleemcolaberry.github.io/colaberry-school-ai/

> Auto-deployed to GitHub Pages on every push to `main` via
> [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

---

## ✨ What it is

A self-contained, editorial-style landing page with:

- **Animated hero** — a generative node-network canvas ("AI systems" motif) behind a
  staggered, masked headline reveal.
- **Scroll storytelling** — a marquee, animated stat counters, a horizontally-pinned
  "framework" section, and a dark program timeline with a sticky progress rail and
  stacked cards (all powered by GSAP + ScrollTrigger).
- **Custom blueprint SVG schematics** illustrating Prompt → Model → Skill, agent teams,
  and shipping to production.
- **A registration card** with inline email validation and a confirmation state.
- **Design-system foundation** — every color, type ramp, spacing step, radius, and shadow
  comes from the Colaberry Design System tokens, bundled into one stylesheet so the page
  renders consistently and independently of any host theme.
- **Accessible + responsive** — skip link, `prefers-reduced-motion`-friendly fallbacks,
  `<noscript>` content, semantic landmarks, and a mobile layout that gracefully degrades
  the pinned/animated sections.

The page is the site homepage (`/`). GSAP + ScrollTrigger and Lucide icons load from CDN
via `next/script`; all CTAs route to `https://learn.colaberry.com/`.

---

## 🛠️ How I built this

I built this site **with Claude (Claude Code)** as an AI pair-programmer, working from a
"Claude Design" handoff for the *AI Accelerator Open House v2* concept. The workflow:

1. **Design system first.** I started from the Colaberry brand style guide (Cherry Red,
   Leaf Green, Berry Blue + neutrals) and codified it into design tokens — color ramps,
   semantic aliases, a type scale (Roboto / Roboto Mono / Quicksand), a 4px spacing grid,
   radii, shadows, and motion easings. Everything downstream references those tokens
   instead of hard-coded values.

2. **Component layer.** I rebuilt the design-system primitives (`Button`, `Input`/`Field`,
   `Icon`, `Avatar`) as small, token-driven React components so the page composes from a
   consistent kit rather than one-off markup.

3. **Editorial page in Next.js.** The whole experience lives in a single page component
   (`src/pages/index.tsx`), broken into focused sub-components per section (hero, marquee,
   why, stats, who, framework, program, final CTA, footer). The CSS is a single bundled
   stylesheet (`public/ai-accelerator/styles.css`) that layers DS tokens → DS components →
   page styles.

4. **Motion & interactivity.** GSAP + ScrollTrigger drive the headline reveal, scroll
   reveals, animated counters, the pinned horizontal framework, and the sticky program
   rail. A hand-written `<canvas>` renders the animated node-network background, pausing
   itself off-screen via an `IntersectionObserver` to save battery.

5. **Polish & QA.** I drove a headless browser to screenshot the page at multiple
   viewport widths, hunted down dead space / inconsistent whitespace, and retuned the
   spacing to fluid `clamp()` values so the layout breathes evenly from mobile to large
   desktops.

6. **Deploy-ready.** I configured Next.js as a **static export** so a single
   `npm run build` produces a portable `out/` folder that drops onto any static host.

**Stack:** Next.js 15 (Pages Router) · React 19 · TypeScript · GSAP/ScrollTrigger ·
Lucide icons · plain CSS with custom-property design tokens · HTML `<canvas>`.

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build → static export into `out/`
- `npm run start` — serve the production build
- `npm run typecheck` — `tsc --noEmit`

## 📦 Deploy

The site is configured as a **static export** (`output: "export"` in
[`next.config.ts`](next.config.ts)), so `npm run build` emits a fully static
`out/` folder that runs on any static web host — no Node server required.

```bash
npm install
npm run build      # generates ./out
```

Then upload the **contents of `out/`** to your host:

- **Vercel** — zero-config (see below); the `output: "export"` is detected and served statically.
- **Netlify** — publish directory `out` (build command `npm run build`).
- **GitHub Pages / S3 + CloudFront / nginx / Apache** — serve `out/` as the web root.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aleemcolaberry/colaberry-school-ai)

Vercel auto-detects Next.js and the static export ([`vercel.json`](vercel.json) pins
the framework + build command). To connect this repo:

1. Go to **https://vercel.com/new** and sign in with GitHub.
2. **Import** `aleemcolaberry/colaberry-school-ai` (authorize Vercel for the repo if asked).
3. Leave the defaults — Framework **Next.js**, build `next build`, install `npm ci`.
   Do **not** set `NEXT_PUBLIC_BASE_PATH` (Vercel serves at the domain root).
4. Click **Deploy**. Every push to `main` then redeploys automatically.

`trailingSlash: true` is enabled so routes resolve as `/path/index.html`
without server rewrites, and images are emitted unoptimized (the page uses
plain `<img>` tags), so nothing in `out/` depends on a runtime.

> Note: GSAP/Lucide and the Google Fonts used by the stylesheet load from their
> CDNs at runtime. For a fully self-contained, offline bundle, self-host those
> assets (see the hosting note at the top of `public/ai-accelerator/styles.css`).

## 🗂️ Structure

```
src/pages/index.tsx                    # the landing page (all sections + GSAP/canvas effects)
public/ai-accelerator/styles.css       # bundled DS tokens + component CSS + page CSS
public/ai-accelerator/logo/*           # logo + OG assets
next.config.ts                         # static-export config
```

## 📝 Notes

- The hero email form is currently front-end only (validates + shows a confirmation
  state). Wire it to a real endpoint before using for live lead capture.
- Animations require the CDN scripts (GSAP/Lucide) to load; the pinned horizontal
  Framework section engages at viewport widths ≥ 1100px and falls back to a vertical
  stack below that.

---

<sub>Built for Colaberry · "Learn with Claude. Build through Colaberry. Deploy in the real world."</sub>
