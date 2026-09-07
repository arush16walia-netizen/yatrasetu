# Yatra Setu — Design System v2

**"Yatra bane seva" — Let the journey become service.**

Design direction generated through the UI/UX Pro Max reasoning pass: brand analysis →
audience → emotional targets → system decisions → component language → QA gates.

---

## 1. Design intelligence summary

**Product:** Indian responsible-tourism platform — destination discovery + community
restoration + verified contribution + rewards.

**Audience:** Indian and international travellers, 22–45, design-literate, mobile-first,
sceptical of greenwashing. They trust *evidence* (QR check-ins, timestamps, geo-verification)
over promises.

**Emotional targets:** Cinematic, human, trustworthy, adventurous, editorial. The feeling of
a premium travel journal crossed with a field ledger — not a booking funnel, not a SaaS dashboard.

**Positioning line for the visual language:** *A field journal for India* — printed-paper
clarity by day, ink-black night pages for the cinematic moments, one vivid marigold accent
that always means "act here", one deep emerald that always means "verified / nature".

**Targets:** Design variance 8/10 · Motion 6/10 · Density 5–6/10 · Premium but approachable ·
Editorial, never SaaS.

---

## 2. Design principles

1. **Evidence over ornament.** Every visual device either tells a place's story or proves an
   action. No decoration without a job.
2. **Two accents, strict jobs.** Saffron = action/attention. Emerald = nature/verification.
   Never mixed in one component.
3. **Day and night pages.** Light paper pages for reading and utility; full-bleed ink pages
   for cinematic hero and storytelling moments. Sections alternate deliberately.
4. **Sharp, printed edges.** Small radii (2–10px), hairline borders, tight neutral shadows.
   The product should feel printed and precise, not bubbly.
5. **Asymmetry with intent.** Editorial grids: offset columns, numbered ledger rows, layered
   imagery. One centered moment per page maximum.
6. **Motion is punctuation.** Entrance reveals, one parallax hero, spring micro-interactions.
   Nothing loops forever except the live "pulse" dot.
7. **Honesty.** Real data from the database only. No fake stats, reviews, or claims.

---

## 3. Color system

| Token | Value | Role | Contrast notes |
|---|---|---|---|
| `saffron` | `#E65100` | Heritage Amber. Primary action, active states, accents on dark. Large text only on light. | vs ink 4.9:1 ✓ fills; vs paper 3.8:1 (large text/fills only) |
| `saffron-deep` | `#C44400` | Small saffron text on light (eyebrows, links) | vs paper 4.8:1 ✓ |
| `teal` | `#004D40` | Deep Emerald. Verification, nature, "give back" identity | vs paper 9.4:1 ✓; white on it 9.4:1 ✓ |
| `verify` | `#2E7D32` | Success/verified states | ≥4.5:1 on light ✓ |
| `ink` | `#0B0F17` | Dark surface, primary text | — |
| `ink-soft` / `ink-raised` | `#10161F` / `#161D29` | Dark section layering | — |
| `paper` | `#FAFAFA` | Default page ground | — |
| `paper-soft` | `#F1F3F5` | Alternate light sections | — |
| `paper-raised` | `#FFFFFF` | Cards, sheets, inputs | — |
| `stone` | `#5B6472` | Muted text on light | vs paper 5.7:1 ✓ |
| `mist` | `#9BA6B5` | Muted text on dark | vs ink 7.6:1 ✓ |
| `fog` | `#232B38` | Hairlines on dark | — |
| `border` | `#E5E7EB` | Hairlines on light (via `ink/8`) | — |

Neutrals are cool slate — the warmth lives *only* in saffron and photography. This keeps the
identity modern (marigold + peacock + monsoon slate) without decorative "Indian" patterns.

---

## 4. Typography

- **Display:** Fraunces (already loaded) — high-contrast editorial serif, `SOFT/WONK` axes at
  defaults; headlines are set tight (`tracking-tight`, leading ≤ 1.05), with italic serif for
  the emotional half-line.
- **Body/UI:** Instrument Sans — clean, slightly warm grotesque.
- **Devanagari:** Noto Serif Devanagari — taglines (यात्रा बने सेवा) always in serif Devanagari,
  never decorative accents: they are content, not pattern.
- **Data (new):** system mono (`ui-monospace`) for timestamps, codes, ledger numbers, coordinates —
  the "field evidence" voice.

Scale (fluid): display `clamp(3rem, 8vw, 7.5rem)` → h2 `3.75rem` → h3 `1.875rem` → body `1rem/1.7`
→ eyebrow `0.6875rem/0.22em caps` → mono meta `0.75rem`.

---

## 5. Shape, border, shadow

- **Radius:** `sm 2px` (tags, badges) · `md 6px` (buttons, inputs) · `lg 10px` (cards) ·
  `xl 16px` (large media panels). **No pill CTAs.** Small pill chips survive only as
  non-interactive meta tags.
- **Borders:** 1px hairlines everywhere (`ink/8` on light, `fog` on dark). Borders carry the
  structure; shadows are whisper-quiet support.
- **Shadows:** neutral, tight, low — `card: 0 1px 2px 6% / 0 8px 24px −16px 18%`,
  `lift: 0 2px 4px 8% / 0 16px 40px −20px 28%`. **No colored glow shadows.**

---

## 6. Layout

- Container 1280px, gutters 20/32/48px (mobile/tablet/desktop). 8px spacing grid.
- Hero and storytelling bands: full-bleed, content bottom-anchored over imagery.
- Utility content: asymmetric two-column (7/5, 8/4), numbered ledger rows, offset images.
- Progressive disclosure: chips → cards → detail pages. Destination imagery always full-bleed
  or edge-bleed, never floating in white gutters on both sides.

---

## 7. Motion (6/10)

| Use | Spec |
|---|---|
| Entrance reveals | `opacity 0→1, y 28→0`, 0.8s, `cubic-bezier(0.16,1,0.3,1)`, staggered ≤ 0.08s |
| Hero parallax | scroll-linked, image y ≤ 240px, content −90px, fades by 600px |
| Hover micro-interactions | spring (`stiffness 180, damping 16`), −2px lift max, 300ms color shifts |
| Nav state | 500ms ease-expo; solid bar + hairline after 32px scroll |
| Live pulse | single `pulse-dot` 2.4s loop — the only infinite animation |
| Reduced motion | all transforms/loops disabled; opacity-only where necessary |

**Never:** continuous floating cards by default, staggered-everything entrances, animated
gradients, scroll-hijacking beyond Lenis smoothing.

---

## 8. Component states (mandatory matrix)

Every interactive element defines: default · hover (color/1–2px shift, never scale-heavy) ·
focus-visible (2px saffron outline, 3px offset) · active · disabled (50% opacity, no pointer).
Forms: labelled, `aria-describedby` errors, keyboard-reachable custom controls, error text in
`#B4231F` (AA on paper).

---

## 9. Responsive strategy

- **375px:** single column, full-bleed imagery, sticky-feel nav, 20px gutters, tap targets ≥44px,
  horizontal meta-chip rows become swipe rows.
- **768px:** two-column asymmetry begins; map + spotlight stack with map first.
- **1024px:** full nav bar, three-column catalogs acceptable (catalog is a deliberate ledger,
  not filler cards).
- **1440px:** max-width holds at 1280; imagery gets taller (more cinematic, not wider margins).
- Mobile is designed first for: hero type scales via `clamp`, bottom-anchored content, floating
  desktop-only cards are hidden (not shrunk).

---

## 10. Do / Don't

**Do:** alternate day/night sections · use mono for evidence · keep one accent per component ·
edge-bleed photography · numbered editorial lists · real DB numbers with as-of labels.

**Don't:** pill CTAs · bubbly 24px+ cards · glassmorphism beyond the single frosted nav ·
colored glow shadows · random gradients · decorative mandala/pattern filler · fake data ·
hover-only interactions · giant text without content behind it.
