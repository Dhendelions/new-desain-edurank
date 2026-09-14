---
name: Modern Scholar
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an uplifting, structured, and high-trust educational workspace tailored for desktop-first experiences. Designed for ambitious learners, university students, and credentialed candidates, the aesthetic bridges playful academic momentum with collegiate authority. 

The aesthetic synthesizes modern software minimalism with delicate, layered depth. It leverages crisp typographic clarity, soft ambient atmospheric glows, generous white space, and approachable rounded surfaces. The interface communicates competence, clarity, and encouragement—dispelling the cold, bureaucratic anxiety often associated with academic administration, verification workflows, and student portals.

## Colors

The palette balances authoritative deep slates with high-energy indigo-sapphire accents and reassuring emerald verification tones.

- **Canvas & Surface Tinting**: Base application canvas rests on `#F8FAFC`, stepping into `#EEF2F6` for subtle grouping containers and sidebars. High-level focus containers use pure `#FFFFFF` to ensure stark contrast against the tinted backdrops.
- **Primary Indigo (`#4F46E5`) & Sapphire (`#3B82F6`)**: The primary indigo provides structural anchor points, active navigation states, and dominant calls-to-action. The secondary sapphire is deployed for informational status pills, progress tracking ribbons, and subtle gradient pairings (`linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)`).
- **Emerald Accent (`#10B981`)**: Dedicated to positive reinforcement, credential verification successes, earned grade indicators, and completed checklist nodes.
- **Neutral Deep Slate (`#0F172A`)**: Provides razor-sharp contrast for primary titles, deep headers, and high-emphasis interface elements, tapering to `#475569` for body copy and `#94A3B8` for secondary captions and structural borders.

## Typography

The type system is powered by Plus Jakarta Sans across all levels to maintain an inviting, modern geometric rhythm with humanist warmth. 

Headings feature tight tracking (`-0.02em` to `-0.03em`) and confident bold weights to create crisp visual anchors. Body text maintains comfortable reading line heights to support deep study sessions and document scanning. Microcopy, floating badge indicators, and verification stamps employ elevated weights (`600` and `700`) with subtle letter-spacing expansions to ensure immediate legibility against tinted containers.

## Layout & Spacing

This design system uses a desktop-centric 12-column fluid grid tailored specifically for 1440px displays, with a maximum layout container constraint of 1360px centered within the viewport.

- **Rhythm & Grid**: 12 columns with a fixed gutter of `1.5rem` (24px) and outer canvas margins of `2.5rem` (40px). Side navigation and meta-panels anchor consistently to 2 or 3-column bounds, while primary working canvases expand across 6 to 9 columns.
- **Vertical Hierarchy**: Spacing scales strictly across an 8pt system. Component-internal spacing utilizes `space-sm` (8px) and `space-md` (16px), whereas module separations and sectional stack rhythms deploy `space-lg` (24px) and `space-xl` (40px) to preserve cognitive breathing room.

## Elevation & Depth

Visual hierarchy uses a hybrid architecture of multi-stop ambient shadows, pure white structural layers, and tinted boundary borders.

- **Flat/Ground Tier (Elevation 0)**: The base page backdrop (`#F8FAFC`) hosts low-level segment divisions with translucent hairline borders (`1px solid #E2E8F0`).
- **Card Tier (Elevation 1)**: Elevated containers and content cards use pure `#FFFFFF` background fills framed by low-contrast outlines (`1px solid rgba(226, 232, 240, 0.8)`) paired with ultra-diffused, dual-layer shadows: `0 1px 3px rgba(15, 23, 42, 0.03), 0 10px 25px -5px rgba(15, 23, 42, 0.05)`.
- **Floating Badge & Dropdown Tier (Elevation 2)**: Floating status capsules, active filter pills, and flyout navigation menus cast soft primary-tinted drop shadows: `0 12px 32px -4px rgba(79, 70, 229, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.04)`.
- **Modal & Verification Dialog Tier (Elevation 3)**: High-priority modals and document inspection overlays sit above a soft blurred backdrop (`backdrop-filter: blur(8px); background: rgba(15, 23, 42, 0.4)`), using an expansive depth shadow: `0 24px 48px -12px rgba(15, 23, 42, 0.18)`.

## Shapes

The design system adopts an expressive, student-friendly geometry centered around standard container radii of `1rem` (16px, `rounded-2xl`).

- **Containers & Cards**: Main application cards, verification zones, and dash modules use `1rem` (16px) corners.
- **Form Controls & Interactive Inputs**: Inputs, fieldsets, and standard action buttons use `0.625rem` (10px) to balance modern softness with structural precision.
- **Micro-Badges & Floating Indicators**: Status badges, student ID pills, and verification tags utilize a complete capsule/pill treatment (`9999px`) to distinguish meta-information from clickable cards.

## Components

### Buttons
- **Primary**: Styled with a gentle vibrant gradient `linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)`, crisp white text, `0.625rem` radius, and an indigo-tinted shadow (`0 4px 14px rgba(79, 70, 229, 0.3)`). Hover triggers a subtle `translateY(-1px)` and enhanced luminescence.
- **Secondary / Ghost**: White or transparent background with a refined boundary `1px solid #E2E8F0`, deep slate text (`#0F172A`), and an ephemeral hover state tinting to `#F1F5F9`.

### Input Fields & Modern Form Styling
- Constructed with a `#FFFFFF` fill, `1px solid #CBD5E1`, and generous internal padding (`12px 16px`).
- Focused states feature a crisp `2px` ring in `#4F46E5` with an outer glowing ring offset (`box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1)`).
- Floating label support with helper microcopy positioned below in `#64748B`.

### Floating Badges
- Miniature informational capsules (`px-3 py-1`, full pill radius).
- **Verified / Success**: Emerald tint fill (`rgba(16, 185, 129, 0.1)`), vibrant emerald text (`#059669`), often accompanied by a pulsing `6px` circular status indicator.
- **In-Progress**: Sapphire tint fill (`rgba(59, 130, 246, 0.1)`), rich sapphire text (`#2563EB`).

### Verification Upload Cards
- Large interactive drop zones framed by a dashed stroke (`2px dashed #CBD5E1`) over an ultra-soft tinted background (`#F8FAFC`).
- Center features an illuminated upload glyph container (`48x48px`, background `rgba(79, 70, 229, 0.08)`, icon `#4F46E5`).
- Active drag-over states transition the border to solid `#4F46E5`, shifting the background to a gentle indigo glow (`rgba(79, 70, 229, 0.03)`).
- Completed document previews show an inline progress bar featuring the `#10B981` emerald fill and immediate cryptographic validation checkmarks.

### Cards & Container Panels
- Bound by `1rem` corner rounding, pure `#FFFFFF` background, and hairline border trims.
- Card headers feature clean title lockups with optional right-aligned status capsules or micro-action menus.

### Checkboxes & Radios
- Rounded `6px` boxes and complete circular radios. Unchecked states carry a `#CBD5E1` border; checked states immediately transition to solid `#4F46E5` with clean white SVG indicators.