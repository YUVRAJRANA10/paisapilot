---
name: PaisaPilot
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#0058be'
  on-tertiary: '#ffffff'
  tertiary-container: '#2170e4'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends **Corporate Modernism** with an **Aviation Navigation Cockpit** aesthetic—reinterpreted through a high-precision, executive fintech lens. The emotional tone is measured, authoritative, and empowering: users are not passive observers of their finances, but active commanders orchestrating their financial trajectory.

Key design attributes:
- **Instrument Precision:** Crisp 1px structural dividing lines, micro tabular alignments, and subtle waypoint-inspired indicators instead of illustrative aircraft metaphors.
- **Duality of Control & Clarity:** A high-contrast structural shell (deep charcoal/navy navigation bar and control dock) grounding clean, highly legible, daylight-toned data workbenches and analytical cards.
- **Calm Mastery:** Dense analytical data presented with balanced white space, purposeful contrast ratios, and deliberate color-coding to minimize cognitive fatigue during budget management and portfolio review.

## Colors

The palette establishes an immediate sense of financial security and cockpit instrumentation clarity:

- **Primary (`#059669` / `#10B981`):** Precision Emerald. Signals net worth growth, positive cash flows, executed savings goals, and confirmed allocations.
- **Secondary (`#0F172A` / `#1E293B`):** Deep Cockpit Slate. Forms the persistent lateral control rail, high-level navigation headers, and authoritative contrast surfaces.
- **Tertiary (`#3B82F6` / `#0284C7`):** Flightpath Cyan & Sky. Identifies automated transfers, recurring workflows, investments, and linked bank accounts.
- **Neutral (`#64748B`):** Technical Slate. Spans background tones (`#F8FAFC`), card surfaces (`#FFFFFF`), boundary strokes (`#E2E8F0`), and secondary labels.
- **Semantic Accents:**
  - Critical/Expense: `#EF4444` (Burn rate, over-budget warnings, outflows)
  - Caution/Threshold: `#F59E0B` (80%+ budget utilization, pending authentications)
  - Success/Target Reached: `#10B981`

## Typography

Typographic scale is anchored by **Plus Jakarta Sans**, chosen for its crisp geometric legibility, wide aperture, and modern architectural presence.

Critical rules for financial presentation:
- **Tabular Figures:** All numeric displays (balances, currency indicators, percentage tags, timestamps) must use CSS property `font-feature-settings: "tnum" 1` to prevent jitter during real-time balance calculations and aligned ledger sweeps.
- **Letter Spacing:** Apply `letter-spacing: -0.02em` on `headline-xl` and `headline-lg` for cohesive executive appeal. Micro-labels (`label-sm`, tracking tags) demand `letter-spacing: 0.05em` in uppercase for instrument-panel clarity.

## Layout & Spacing

The layout is structured around an executive cockpit desktop model:
- **Shell Structure:** A persistent 260px dark lateral navigation bar (`#0F172A`) fixed on the left for viewport sizes above 1200px, collapsing to an 80px iconography strip at 768px–1199px, and transforming into an off-canvas drawer on mobile (<768px).
- **Workbench Canvas:** Content lives within a fluid, responsive 12-column grid system capped at a maximum width of `1600px`.
- **Rhythm:** Spacing follows a modular 4px/8px incremental grid. Standard intra-card padding sits strictly at `space-lg` (24px) on desktop and `space-md` (16px) on mobile viewports.
- **Reflow Architecture:** Analytical metric panels transition from 4-column rows on wide screens (`≥1280px`), to 2-column cards on tablet (`768px–1024px`), and single-column full-bleed telemetry units on handheld screens.

## Elevation & Depth

Visual hierarchy employs a hybrid strategy of **Tonal Depth** and **Subtle Low-Contrast Outlines**:

- **Layer 0 (Canvas Base):** Grounded in neutral tint `#F8FAFC`.
- **Layer 1 (Cards & Data Modules):** Pure white (`#FFFFFF`) with a structural 1px outline of `#E2E8F0` and an ultra-diffused ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Layer 2 (Interactive Floating Elements, Dropdowns, Date-Pickers):** Pure white (`#FFFFFF`), bordered by `#CBD5E1`, with elevation: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Layer 3 (Modals, Overlays, Ledger Drawers):** High-level focus with backdrop blur: `backdrop-filter: blur(8px)`, semi-transparent backing `rgba(15, 23, 42, 0.5)`, framed with fine 1px slate boundaries.
- **Cockpit Contrast:** The dark navigation chrome does not rely on drop shadows; it relies on sharp structural edge definition using `border-r: 1px solid rgba(255, 255, 255, 0.08)`.

## Shapes

The design system uses deliberate, disciplined corner radii to evoke precision avionics software rather than informal consumer apps. 

- **Primary Radius:** `8px` (`0.5rem`) for cards, text fields, tables, and metric containers, ensuring structure and compact visual alignment.
- **Sub-Component Radius:** `6px` (`0.375rem`) for buttons, badges, status chips, and table row selections.
- **Micro-Indicators:** Strict circular geometry (`9999px`) reserved exclusively for user avatars, status pings (e.g., live sync radar indicator), and waypoint markers.

## Components

### Buttons
- **Primary Action (Command):** Solid `#059669` fill with pure white label, `8px` radius, medium weight (`600`). On hover: shifts to `#047857` with subtle elevation.
- **Secondary Action:** Transparent background, 1px solid `#CBD5E1`, text `#0F172A`. On hover: `#F1F5F9` background.
- **Cockpit Bar Action:** Semitransparent slate (`rgba(255, 255, 255, 0.08)`) with white text.

### Chips & Waypoint Badges
- **Status Indicators:** Pill shapes (`9999px`) with 10% opacity tints and high-contrast labels.
  - Positive/Safe: `#ECFDF5` background, `#059669` border and text.
  - Critical/Over-Budget: `#FEF2F2` background, `#DC2626` border and text.
  - Waypoint Category Tags: `#F1F5F9` background, `#475569` text, accompanied by an inner 4px geometric dot indicator.

### Input Fields & Controls
- **Inputs:** 40px height, background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F172A`. Active focus state triggers an Emerald highlight: border `#10B981` with a `0 0 0 3px rgba(16, 185, 129, 0.15)` focus ring.
- **Currency Entry:** Inputs dedicated to amounts (INR) prefix the static currency symbol (`₹`) in a shaded auxiliary block (`#F8FAFC`) with tabular numeric entry.

### Cards & Analytical Panels
- **Telemetry Card:** Top header contains categorical waypoint label and subtle trailing period toggle (e.g., "Last 30 Days"). 
- **Dividers:** Interior dividers within analytical cards use `#F1F5F9` hair-lines to isolate ledger line items without visual clutter.

### Tables & Data Grids
- **Header:** Sticky headers with `#F8FAFC` fill, uppercase micro typography (`label-sm`), and 1px bottom border (`#E2E8F0`).
- **Rows:** Minimum height 48px, subtle hover transition to `#F8FAFC`. All numeric columns (debits, credits, balances) align to the right edge with `tnum` font styling.