---
name: TeeStudio Administrative Suite
colors:
  surface: '#ffffff'
  surface-dim: '#d6dade'
  surface-bright: '#f6fafe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f8'
  surface-container: '#eaeef2'
  surface-container-high: '#e4e9ed'
  surface-container-highest: '#dfe3e7'
  on-surface: '#171c1f'
  on-surface-variant: '#3e4850'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#edf1f5'
  outline: '#6e7881'
  outline-variant: '#bec8d2'
  surface-tint: '#006591'
  primary: '#006591'
  on-primary: '#ffffff'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#89ceff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#396477'
  on-tertiary: '#ffffff'
  tertiary-container: '#76a1b6'
  on-tertiary-container: '#01384a'
  error: '#ea580c'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#bee9ff'
  tertiary-fixed-dim: '#a1cde3'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#1e4c5f'
  background: '#f6fafe'
  on-background: '#171c1f'
  surface-variant: '#dfe3e7'
  surface-alt: '#f8fafc'
  text-main: '#0f172a'
  text-secondary: '#475569'
  text-muted: '#94a3b8'
  border: '#e2e8f0'
  success: '#10b981'
  warning: '#f59e0b'
  accent: '#6366f1'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 32px
  card-title:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '700'
    lineHeight: 24px
  sidebar-item:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 24px
  gutter: 16px
  sidebar-w: 260px
  header-h: 64px
  control-h: 40px
  pill-padding: 6px 16px
  badge-padding: 2px 10px
---

## Brand & Style

The design system is engineered for the high-precision environment of a print-on-demand e-commerce platform. It embodies a **Minimalist Modern** aesthetic, prioritizing information density without sacrificing visual breathing room. The interface is professional, utilitarian, and clean, designed to reduce cognitive load for administrators managing complex production workflows.

The visual language focuses on:
- **Clarity:** A "card-on-surface" model that clearly separates functional modules.
- **Precision:** Thin 1px borders and refined stroke iconography.
- **Focus:** A restricted palette of Sky Blue and Slate Grays to emphasize action and status.
- **Vietnamese Localization:** Typography is optimized for Vietnamese diacritics, ensuring vertical rhythm is maintained despite the complexity of the characters.

## Colors

The palette is centered around **Sky Blue (#0ea5e9)**, which serves as the primary driver for interaction and branding. The system utilizes a "Cool Slate" neutral scale to maintain a professional, calm environment.

- **Primary Actions:** Use the Primary Sky Blue for main buttons and active states. Use Primary Dark (#0284c7) specifically for hover interactions.
- **Surface Strategy:** The main application background uses `neutral-color` (#f1f5f9). Use `surface` (#ffffff) for all floating cards and main panels to create a clear layer of separation.
- **Semantic Status:** 
    - **Success:** Green for "Ready to Print" or positive KPIs.
    - **Warning:** Amber for "Pending Review."
    - **Error/Alert:** Orange for stock alerts or corrections.
- **Contrast:** High contrast is maintained for text (Text Main) against white surfaces to ensure maximum legibility for data-heavy tables.

## Typography

This design system uses **Inter** exclusively to ensure a systematic and utilitarian feel across the dashboard. Hierarchy is established through aggressive weight scaling (from 400 to 800).

- **Headlines:** Large titles use an Extra Bold (800) weight with tight letter spacing for a modern, impactful look.
- **Data Display:** Table data and general body content should utilize the `body-md` or `body-sm` levels.
- **Vietnamese Considerations:** Inter handles Vietnamese characters exceptionally well. Ensure line heights are never lower than 1.4x the font size to prevent overlapping diacritics in dense paragraphs.
- **Labels:** Use `label-bold` in uppercase for status badges or small metadata to distinguish them from interactive body text.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid** model. The sidebar remains fixed at 260px, while the main content area occupies the remaining width with a max-width constraint for ultra-wide monitors to maintain readability.

- **Grid:** Use a 12-column grid system for large dashboard panels.
- **Rhythm:** A base 8px spacing system guides the margins and padding. 24px is the standard margin for page containers.
- **Responsive Behavior:** 
  - **Desktop:** 12 columns, 24px margins.
  - **Tablet:** 6 columns, 16px margins, sidebar collapses to icons.
  - **Mobile:** 4 columns, 16px margins, sidebar becomes a hidden drawer.
- **Verticality:** Standardize input and button heights to 40px to create a consistent horizontal rhythm across forms and filters.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layers** and **Subtle Shadows** rather than heavy shadows or gradients. This maintains the minimalist aesthetic while providing necessary visual hierarchy.

- **Primary Surface:** The background layer is `neutral-color` (#f1f5f9).
- **Secondary Surface:** Functional cards and panels sit on top of the background, using `#ffffff` and a very soft ambient shadow: `0px 1px 4px rgba(0, 0, 0, 0.05)`.
- **Interaction Depth:** Elements should not "pop" off the screen. On hover, a card may shift its border color to `tertiary-color` (#bae6fd) or lift slightly with a `translateY(-2px)` transition.
- **Flat Borders:** Use `border` (#e2e8f0) for all container outlines. Inputs use `surface-alt` (#f8fafc) to appear slightly inset/embedded within the white cards.

## Shapes

The shape language is "Rounded-Soft," providing a friendly, modern contrast to the data-heavy nature of an admin panel.

- **Containers:** Dashboard cards and main panels use `rounded-xl` (20px) or `rounded-lg` (16px) to define distinct workspace areas.
- **Controls:** Buttons and input fields use a consistent 8px-10px radius, balancing modern softness with professional structure.
- **Status Indicators:** Use full pill shapes (20px+) for status badges (e.g., "Ready to Print") and filter tags to distinguish them from interactive buttons.
- **Icon Containers:** Sized at 40x40px with an 8px radius.

## Components

### Buttons & Inputs
- **Primary Button:** Solid Sky Blue (#0ea5e9) with White text. Hover state shifts to #0284c7. 10px corner radius.
- **Secondary Button:** Surface-colored background with Text Secondary (#475569) labels and a thin border (#e2e8f0).
- **Inputs:** Height 40px, background Surface Alt (#f8fafc), border 1px solid (#e2e8f0). Focus state uses a 2px Sky Blue glow.

### Cards & Panels
- **Standard Card:** White background, 16px-20px radius, subtle 1px border, 4px blur shadow. Padding should be a consistent 24px.
- **Table Card:** Use Surface Alt (#f8fafc) for table headers and alternating row stripes to enhance scanability of print order data.

### Status & Feedback
- **Status Badges:** Use a light tint of the semantic color for the background (e.g., #dcfce7 for Success) and the full-saturation color for text (e.g., #10b981).
- **Timeline:** Use Connector (#cbd5e1) for vertical or horizontal lines linking production steps.

### Navigation
- **Sidebar:** Active items use Primary Light (#e0f2fe) background with Primary Blue text. Inactive items use Text Secondary for both icon and label.
- **Search:** Topbar search should use Surface Alt background to differentiate it from the header's primary white surface.