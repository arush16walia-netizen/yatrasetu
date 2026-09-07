<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Yatra Setu Agent Capabilities & Design System Rules

## 1. Impeccable & Taste (UI/UX Quality Rules)
When generating or refactoring React/Next.js components, strictly adhere to these design directives:
- **Design Variance (High):** Avoid generic AI UI card layouts and boilerplate hero sections. Use asymmetric grids, staggered element reveals, and expressive visual hierarchy.
- **Motion Intensity (Medium):** Implement smooth transitions (GSAP, Framer Motion, Lenis) with spring physics on hover states.
- **Visual Density (Balanced):** Maintain clear white space and strict contrast ratios (no low-contrast gray-on-gray body text).
- **Component States:** Ensure active, hover, focus-visible, and disabled states are explicitly defined for every interactive element.
- **8px Grid Alignment:** Enforce consistent padding and margin scaling (8px, 16px, 24px, 32px, 48px).

## 2. Structural Design Reference (awesome-design-md)
- Refer to `DESIGN.md` in the project root for Yatra Setu's canonical color palette, typography scale, and brand assets.
- Use `DESIGN.md` purely for structure, component layout, and design system patterns.

## 3. Frontend Generation Rules (frontend-design)
- Prioritize responsive fluidity using Tailwind CSS utilities instead of rigid pixel breakpoints.
- Build fully accessible, semantic HTML/JSX components equipped with proper `aria-*` attributes.

## 4. End-to-End Testing (Playwright)
- When instructed to test components or pages, run Playwright test suites against `http://localhost:3000`.
- Verify interactive flows, check for console errors, and evaluate layout overflows across mobile (375px), tablet (768px), and desktop (1440px) viewports.

## 5. Project & Environment Learnings
- Prisma client outputs to `src/generated/prisma` (custom path, not default) — after any `schema.prisma` change run `npx prisma generate` or queries fail with misleading "Unknown argument" errors even after a successful migrate.
- PrismaClient is instantiated with the `PrismaBetterSqlite3` driver adapter (see `src/lib/prisma.ts`); standalone scripts must reuse that adapter, not default instantiation. `npx tsx -e "..."` prints nothing on this Windows setup — write a script file under `scripts/` instead.
- Attendance hangs off `EventRSVP.checkin` (1:1 `AttendanceRecord`, unique `rsvpId`) — there is no direct event→attendance relation; count verified attendance via `rsvps` where `checkin` is not null.
- `@/components/ui/image` exports `Img` (auto-unoptimizes Wikimedia URLs); Badge tones are `saffron | teal | verify | ink | paper | ember | neutral`.
- Scroll-driven MotionValues freeze in the backgrounded preview (rAF throttling) — verify such UI via static geometry/DOM attributes, not live scroll probes.
- `object-cover` of a landscape photo inside a portrait (4:5) frame shifts the image vertically (~-162px) — request matching crops from Unsplash (`fit=crop&w=..&h=..`) instead.
- Preview tools inject their own touch/input layer; synthetic driver events dispatched from `preview_evaluate` do not land on preview elements.
- Port 3000 is usually occupied on this machine — the dev server runs on 64010 (Turbopack auto-picks; read the port from the log, never assume).
- The reference repo (harshvsingh-io/YatraSetu) keeps rewards/impact as hardcoded client state — this project's DB-backed ledger is the source of truth; never port their fake stats.
- Repo branch is `main` (earlier work landed on `master`); check `git branch --show-current` before Git operations.
- Architecture: server pages → service libs in `src/lib` (one owner per policy: `weather`, `rewards`, `itineraries`, `decongestion`, `litter` taxonomy, `responsible-score`, `checkin` + `rotating-token`) → prisma; client components talk only to `/api` routes, never to services or prisma directly.
- Atomic mutations own their whole side effect in one `$transaction` inside the triggering API route: check-in = RSVP+attendance+points+`awardStamps(tx,…)`; litter report = ticket+50 pts. `checkin.ts` has no prisma import — it receives the tx client.
- `scripts/rc-check.ts` is the end-to-end behavior probe (login → RSVP → rotating QR check-in → litter → self-cleanup); run with `RC_BASE=http://127.0.0.1:<port> npx tsx scripts/rc-check.ts` after touching check-in, rewards or auth.
- Nav routes have one source: `NAV_ITEMS` in `navbar.tsx`; the mobile overlay derives from it (`mobileLabel` for short overlay labels).