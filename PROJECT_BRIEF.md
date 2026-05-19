# Hub Solutions — Website Era Audit

> Public-facing lead generation web app for Hub Solutions Digital. A visitor pastes a URL and gets three things: an **Era Verdict** (shareable), a **UX Score (0–10)** scored against the Hub Solutions Conversion-Optimized Website Framework, and a **90-Day Lead Forecast** that quantifies the cost of inaction.

This file is the canonical project brief. Keep it in sync if scope changes.

---

## 1. Tech stack (locked in)

- **Framework:** Next.js 14 (App Router) + TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Package manager:** Bun
- **Hosting:** Vercel
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`) with vision
- **Screenshots:** ScreenshotOne API
- **Performance:** Google PageSpeed Insights API
- **Cache:** Upstash Redis (Vercel KV-compatible) — 24h per URL hash
- **Lead capture:** Google Sheets API + Resend email to Susan (parallel; either can fail independently)

---

## 2. Brand tokens

```
--hub-navy:    #1B2A5E
--hub-orange:  #F7941D
--hub-yellow:  #FFC72C
--hub-bg:      #F5F2EC
--hub-white:   #FFFFFF
--hub-ink:     #0F1419
```

- **Headings:** Fraunces (serif, bold)
- **Body:** Inter
- **Numbers/Scores:** Fraunces at large size

Voice: confident, direct, slightly cheeky. Avoid setup/reveal, rule-of-three, contrast pivot, and negation reveal patterns. Write like Susan would say it on a sales call.

---

## 3. Three core metrics

### Era Verdict
| Era | Verdict | Markers |
|---|---|---|
| 1995–2002 | "Your website is from 1998. Geocities called." | Tables, Times/Comic Sans, no viewport meta, hit counters, animated GIFs, framesets |
| 2003–2008 | "Your website is from 2005. The Web 2.0 bubble called." | Glossy gradients, beveled edges, Flash remnants, sidebar-heavy |
| 2009–2014 | "Your website is from 2012. The skeuomorphism era." | Heavy shadows, faux textures, jQuery sliders, 960px fixed |
| 2015–2019 | "Your website is from 2017. Flat design era." | Flat colors, hamburger menus, full-width hero stock, parallax |
| 2020–2023 | "Your website is from 2021. Pandemic-era polish." | Soft shadows, rounded corners, Tailwind aesthetic, dark mode |
| 2024–2026 | "Your website is current. Now let's make it convert." | Modern type scales, generous whitespace, micro-interactions, fast LCP |

### UX Score (0–10) — Hub Solutions Pyramid
**Trust** (1–3) · **Experience** (4–6) · **Positioning** (7–10).
YES = 1 · MAYBE = 0.5 · NO = 0.

| Score | Mode | Verdict |
|---|---|---|
| <3 | Risk Mode | No clear direction. Urgent clarity needed. |
| 3–5 | Struggle Mode | Built, but not converting. Inconsistent enquiries. |
| 5–8 | Hustle Mode | Results come from effort, not from the website. |
| 8–10 | Scale Mode | Clear. Credible. Converting. |

### 90-Day Lead Forecast
| UX Score | Range | Framing |
|---|---|---|
| 0–3 | 0–4 leads | Leaking. Most visitors leave before forming an impression. |
| 3–5 | 4–12 leads | Inconsistent. Occasional enquiries, can't predict. |
| 5–8 | 12–30 leads | Decent baseline. Focused fixes can 2–3× this. |
| 8–10 | 30–80+ leads | Strong foundation. Refining, not rebuilding. |

Always show **current** vs **after revamp (8.5–9.5)** side-by-side with the delta highlighted.

Disclaimer: *"Forecast based on Hub Solutions' anonymized client data across 50+ Singapore SME websites. Actual results depend on traffic volume, industry, and offer."*

---

## 4. User flow

`Landing → /analyzing?url=… (progress) → /results/[hash] → CTA modal → /api/lead → confirmation`

Results page is one scroll: Era · Score · Forecast · Per-question breakdown · CTA · Share. Designed to be screenshot-friendly on LinkedIn.

---

## 5. Routes

```
/                    landing
/analyzing           loading state
/results/[hash]      shareable results
/api/analyze         POST — full pipeline
/api/lead            POST — Google Sheets + email
/api/og/[hash]       dynamic OG image
/about               Susan + Hub Solutions intro
/methodology         framework explainer
```

---

## 6. Analysis pipeline

`/api/analyze` does:
1. Normalize URL + cache lookup (24h)
2. Parallel: desktop screenshot, mobile screenshot, HTML fetch, PageSpeed
3. Single Claude API vision call returning strict JSON `{ era, questions[10] }`
4. Compute score + forecast
5. Cache + return

Cost target: ~$0.05–0.10 per audit. Rate limit: 5 req / IP / hour.

---

## 7. Lead capture

On CTA submit, fire both in parallel inside `/api/lead`:
1. Append row to Google Sheet `Hub Solutions Audit Leads`. Columns: Timestamp, Name, Email, Phone, URL, Score, Era, Bracket, Forecast (Current), Forecast (Potential), Top 3 Failed Questions.
2. Send Susan an HTML email via Resend from `audit@hubsolutions.one` with the full audit. Subject: `🔥 New Audit Lead: [Name] — Score [X.X]/10 ([Era])`.

Either can fail independently — log and continue. Confirmation screen shows Susan's Zoho Calendar booking link.

---

## 8. Env vars (`.env.local`)

```
ANTHROPIC_API_KEY=
PAGESPEED_API_KEY=
SCREENSHOTONE_ACCESS_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
RESEND_API_KEY=
EMAIL_FROM=audit@hubsolutions.one
SUSAN_NOTIFICATION_EMAIL=susan@hubsolutions.one
HUB_SOLUTIONS_BOOKING_URL=
```

---

## 9. Build order

1. ✅ Scaffold + brand (this step)
2. Landing page
3. `/api/analyze` mock
4. Screenshot capture (ScreenshotOne)
5. PageSpeed integration
6. Claude vision analysis + prompt tuning on 5–10 real sites
7. Results page
8. OG image generation
9. Lead capture (Sheets + Resend)
10. Caching, rate limiting, error states
11. Methodology page
12. Deploy to Vercel

---

## 10. Success criteria

- `hubsolutions.global` scores 7+
- A known-old reference site scores <4 and lands pre-2010
- Analyze → results < 90s avg
- Mobile results page survives the "screenshot to LinkedIn" test
- Lead submission appends to Sheet AND emails Susan
- This tool itself scores 85+ on mobile PageSpeed

---

## 11. Out of scope (MVP)

User accounts, multi-page crawl, competitor comparison, agency white-label, saved history per user, email drip, A/B copy, i18n. → see `BACKLOG.md`.

---

## 12. Conventions

- Bun only — `bun install`, `bun run dev`, `bun run build`. Never npm / pnpm.
- Conventional commits (`feat:`, `fix:`, `chore:`).
- `bun run lint && bun run build` clean before any push.
- All buttons use a specific verb — no "Learn More" / "Contact Us".
- Above-the-fold landing must have hero banner, one-line value statement, and social proof.
