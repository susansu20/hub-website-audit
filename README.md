# Website Era Audit — Hub Solutions Digital

Public lead-gen tool. Visitor pastes a URL → gets an **Era Verdict**, a **UX Score (0–10)**, and a **90-Day Lead Forecast**. Funnels low-scorers to a strategy call CTA.

See [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) for the full spec — scope, eras, scoring framework, pipeline, lead capture, success criteria.

## Stack

Next.js 14 (App Router) · TypeScript (strict) · Tailwind · shadcn/ui · Bun · Vercel · Claude Sonnet 4 (vision) · ScreenshotOne · PageSpeed Insights · Upstash Redis · Google Sheets + Resend.

## Local dev

```bash
bun install
cp .env.example .env.local   # fill in keys
bun run dev
```

Open http://localhost:3000.

## Scripts

```bash
bun run dev       # dev server
bun run build     # production build
bun run start     # serve the production build
bun run lint      # next lint
```

Always run `bun run lint && bun run build` before pushing.

## Project structure

```
app/                Next.js App Router pages + API routes
  layout.tsx        Root layout (fonts, header, footer)
  page.tsx          Landing page (URL input)
  globals.css       Tailwind + brand CSS variables
components/
  layout/           SiteHeader, SiteFooter
  ui/               shadcn primitives (added as needed)
lib/                Server-side utilities (analysis, scoring, integrations)
public/             Static assets (logo, OG fallback)
```

## Brand tokens (Tailwind)

`hub-navy` `hub-orange` `hub-yellow` `hub-bg` `hub-white` `hub-ink`. Fonts: `font-serif` (Fraunces) for headings, `font-sans` (Inter) for body.

## Conventions

- **Bun only.** Don't use npm or pnpm — the lockfile is `bun.lock`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`.
- Every CTA uses a specific verb. No "Learn More" / "Contact Us" anywhere.
