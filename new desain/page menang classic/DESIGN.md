---
name: EduRank Academic Interface
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#434655'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#3755c3'
  on-secondary: '#ffffff'
  secondary-container: '#708cfd'
  on-secondary-container: '#00217a'
  tertiary: '#7f2500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a73400'
  on-tertiary-container: '#ffc9b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001453'
  on-secondary-fixed-variant: '#173bab'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  tabular-num:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system embodies intellectual rigor, analytical clarity, and focused competitive momentum. Targeted at ambitious students, academics, and competitive learners, the aesthetic prioritizes high-density data legibility over decorative excess. The emotional tone is disciplined, objective, and authoritative—reminiscent of premium institutional benchmarks and high-performance financial terminals rather than gamified consumer apps.

The visual direction follows structured modern minimalism combined with utilitarian data architecture. Visual clarity is achieved through precise typographic contrast, strict structural containment, hairline dividers, and deliberate whitespace rather than illustrative ornament or atmospheric effects. The interface remains flat, tangible, and human-crafted, rejecting speculative AI aesthetics, neon gradients, ambient blurs, and exaggerated physical metaphors.

## Colors

The color system operates on an uncompromising, high-legibility light mode palette designed for prolonged analytical study and data inspection:

- **Canvas & Surface Tier:**
  - Base canvas: `#FFFFFF` (Primary working cards and surface foregrounds)
  - Neutral canvas: `#F8F9FA` (Main app background, sidebars, secondary regions)
  - Subdued container: `#F1F3F5` (Table headers, track containers, inactive segments)
- **Border & Hairline Structure:**
  - Hairline default: `#E5E7EB` (Standard structural grid and panel edges)
  - Hairline strong: `#D1D5DB` (Input borders, high-contrast dividers, active tabs)
- **Text & Contrast Hierarchy:**
  - Primary text: `#111827` (Near-black, high-density editorial contrast)
  - Secondary text: `#4B5563` (Metadata, descriptive labels, secondary metrics)
  - Tertiary text: `#6B7280` (Disabled states, column captions, timestamps)
- **Accent & Functional Tones:**
  - Primary Action / Accent: `#1D4ED8` (Focused state indicators, primary actions, rank badges)
  - Primary Active / Hover: `#1E3A8A` (Deep royal blue interactive state)
  - Accent Muted: `#EFF6FF` (Selected row fills, active navigation backgrounds)
  - Semantic Status: Crisp non-neon tones: Success `#15803D`, Danger `#B91C1C`, Warning `#B45309`.

No gradients or multi-tone fades may be introduced; all surface state transitions occur strictly via discrete solid color shifts.

## Typography

Typography uses the neutral, utilitarian Neo-Grotesque family Inter across all functional tiers to maintain mechanical clarity and consistent vertical metrics.

- **Tabular Numerics:** All scores, percentile tiers, countdown timers, and leaderboard positions must explicitly enforce `font-feature-settings: "tnum" 1` to ensure vertical alignment across data grids.
- **Hierarchy & Case:** Section categorizers, table headers, and status flags use uppercase labels (`label-sm`) with tracking (`letter-spacing: 0.03em`) and medium/semibold weight.
- **Density Control:** Line heights remain compact (1.25 to 1.45) to support dense information panels without vertical bloat. Body copy never exceeds 14px in high-density management views.

## Layout & Spacing

The layout is built on a 12-column structured grid adhering to high-density desktop workflows and strict vertical alignment.

- **Desktop (>= 1280px):** Fixed-width containers maxing out at 1440px with a 12-column grid, 16px (`1rem`) gutters, and 24px (`1.5rem`) outer canvas margins. Multi-column structures stack primary analytical tools alongside fixed-width inspector rails (320px).
- **Tablet (768px - 1279px):** 8-column layout with 16px margins; panels collapse side-by-side data into sequential stacked blocks.
- **Mobile (< 768px):** 4-column flow with 12px horizontal canvas margin. Tables transform into compact row cards, preserving single-line horizontal alignment for key metrics.
- **Vertical Rhythm:** Spacing is disciplined around an 8px base increment (using 4px increments strictly for internal button and field padding). Element spacing defaults to tight bounds: `space-xs` (4px), `space-sm` (8px), `space-md` (12px), `space-lg` (16px), and `space-xl` (24px). Section dividers rely on solid hairlines rather than expansive whitespace.

## Elevation & Depth

This design system rejects physical elevation metaphors, floating drop shadows, and multi-tier ambient shadow blurs. Depth is achieved exclusively through planar contrast and crisp border containment:

- **Surface Layering:** The foundational background canvas (`#F8F9FA`) supports foreground structural cards (`#FFFFFF`). Higher tiers—such as modal sheets or dropdown overlays—remain solid white (`#FFFFFF`) framed with a reinforced 1px border (`#D1D5DB`).
- **Low-Contrast Hairlines:** Spatial separation is established using 1px crisp, solid hairlines (`#E5E7EB`). Inactive containers, table cells, and panel perimeters use single-line division instead of dimensional depth.
- **Floating Overlays:** Contextual popovers and dropdowns use a single ultra-restrained boundary shadow to separate identical whites without simulating physical height: `0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px #E5E7EB`. Heavy blur spreads and multi-colored ambient glows are strictly prohibited.

## Shapes

Shapes emphasize functional discipline with strict, moderate, and crisp geometry:

- **Border Radius Standards:**
  - Base components (buttons, text inputs, segmented pills, chip controls): `6px` (`rounded-md`).
  - Structural panels (cards, tables, modal dialogs): `8px` max.
  - Sub-elements (inner tags, status dots, inline markers): `4px`.
- **Constraint:** Full circular / pill geometry (`border-radius: 9999px`) is strictly forbidden for standard buttons, inputs, and card containers. The UI maintains a crisp, architectural profile that conveys technical precision.

## Components

### Buttons
- **Primary:** Background `#1D4ED8`, text `#FFFFFF`, border none, radius 6px. Padding 8px 16px for standard; 6px 12px for compact. Hover `#1E3A8A`. Focus ring 2px offset with `#1D4ED8`.
- **Secondary / Neutral:** Background `#FFFFFF`, text `#111827`, border 1px solid `#D1D5DB`, radius 6px. Hover background `#F8F9FA`, border `#9CA3AF`.
- **Destructive:** Background `#FFFFFF`, text `#B91C1C`, border 1px solid `#FCA5A5`. Hover background `#FEF2F2`.

### Inputs & Segmented Controls
- **Text Inputs:** Solid `#FFFFFF` fill, 1px solid `#D1D5DB`, 6px radius, font 14px, height 36px (compact) or 40px (default). Text color `#111827`, placeholder `#9CA3AF`. Active/Focus: Border `#1D4ED8` with zero shadow.
- **Segmented Controls:** Container background `#F1F3F5`, 1px solid `#E5E7EB`, 6px radius, 2px interior padding. Selected item has `#FFFFFF` background, `#111827` semibold text, and hairline border `#E5E7EB`. Unselected items have `#4B5563` text.

### Cards & Structured Panels
- **Container Standard:** Background `#FFFFFF`, border 1px solid `#E5E7EB`, radius 8px, padding 16px or 20px. No box shadow. Headers inside cards use an internal bottom divider of 1px solid `#E5E7EB` with 12px padding.

### High-Density Data Tables
- **Table Container:** Full-width, framed with outer border 1px solid `#E5E7EB`, 8px radius.
- **Header Cells:** Background `#F8F9FA`, text `#4B5563`, font size 12px, weight 600, uppercase with 0.03em tracking. 10px vertical padding, 12px horizontal padding. Border bottom 1px solid `#E5E7EB`.
- **Body Rows:** Height 44px, alternating hover background `#F8F9FA`. Text `#111827`, tabular-num metrics right-aligned. Row borders 1px solid `#F1F3F5`.

### Chips & Rank Tags
- **Rank Indicator:** Square or 4px radius label, mono-spaced or tabular digits, background `#EFF6FF`, text `#1D4ED8`, border 1px solid `#BFDBFE`.
- **Status Badges:** Solid minimal tags without blur or glow: Neutral (`#F1F3F5` / `#374151`), Active (`#EFF6FF` / `#1E40AF`), Warning (`#FEF3C7` / `#92400E`).

### Checkboxes & Radios
- **Checkbox:** 16px square, 4px radius, 1px solid `#D1D5DB`. Checked state: background `#1D4ED8`, border `#1D4ED8`, white crisp checkmark icon.
- **Radio Button:** 16px circle, 1px solid `#D1D5DB`. Selected state: 5px solid `#1D4ED8` center dot with white inset.