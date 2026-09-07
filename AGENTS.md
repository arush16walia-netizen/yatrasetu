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