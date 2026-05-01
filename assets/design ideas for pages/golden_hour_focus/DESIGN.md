---
name: Golden Hour Focus
colors:
  surface: '#f3faff'
  surface-dim: '#c7dde9'
  surface-bright: '#f3faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f6ff'
  surface-container: '#dbf1fe'
  surface-container-high: '#d5ecf8'
  surface-container-highest: '#cfe6f2'
  on-surface: '#071e27'
  on-surface-variant: '#514536'
  inverse-surface: '#1e333c'
  inverse-on-surface: '#dff4ff'
  outline: '#837564'
  outline-variant: '#d6c4b0'
  surface-tint: '#835500'
  primary: '#835500'
  on-primary: '#ffffff'
  primary-container: '#ffb74d'
  on-primary-container: '#714900'
  inverse-primary: '#ffb954'
  secondary: '#625f4d'
  on-secondary: '#ffffff'
  secondary-container: '#e6e0c9'
  on-secondary-container: '#676351'
  tertiary: '#536067'
  on-tertiary: '#ffffff'
  tertiary-container: '#b9c7ce'
  on-tertiary-container: '#465359'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#ffb954'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#e9e2cc'
  secondary-fixed-dim: '#ccc6b1'
  on-secondary-fixed: '#1e1c0e'
  on-secondary-fixed-variant: '#4a4737'
  tertiary-fixed: '#d7e5ec'
  tertiary-fixed-dim: '#bbc9d0'
  on-tertiary-fixed: '#101d23'
  on-tertiary-fixed-variant: '#3c494f'
  background: '#f3faff'
  on-background: '#071e27'
  surface-variant: '#cfe6f2'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is built on the philosophy of **Organic Minimalism**. It aims to reduce cognitive load by simulating the calming transition of the late afternoon. The target audience consists of professionals and students seeking a high-focus environment that feels restorative rather than clinical.

The visual language rejects the harshness of traditional productivity tools in favor of a "sun-drenched" aesthetic. It utilizes soft, stone-like shapes and diffused lighting to create a sense of physical presence and serenity. The emotional goal is to evoke a state of "flow" through warmth, breathability, and gentle tactile feedback.

## Colors

The palette mimics the natural spectrum of a setting sun. The primary amber serves as the "active" energy—used for highlights and focus indicators. The creamy vanilla provides a low-contrast, easy-on-the-eyes background that prevents eye strain during long sessions.

- **Primary (Soft Amber):** Used for primary actions, progress bars, and active states.
- **Secondary (Creamy Vanilla):** The main surface color. It should replace pure white to maintain the warm atmosphere.
- **Neutral (Warm Charcoal):** Used for maximum legibility in body text and deep contrast in icons.
- **Accent (Muted Slate):** A desaturated secondary neutral used for borders and disabled states to maintain the organic feel without introducing cool blues.

## Typography

This design system utilizes **Plus Jakarta Sans** for its friendly, open counters and modern geometric build. The typographic scale is generous, prioritizing breathability and ease of reading. 

Headlines use tighter letter spacing and heavier weights to anchor the page, while body text maintains a tall line-height to ensure the interface feels spacious and unhurried. Use "Warm Charcoal" for all primary text; avoid pure black to keep the "sun-drenched" softness intact.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with intentional "islands" of content. High amounts of whitespace (negative space) are mandatory to reflect the minimalist brand values.

- **Rhythm:** Use an 8px base unit. 
- **Margins:** Large outer margins (32px+) ensure the content feels centered and protected from edge-distractions.
- **Hierarchy:** Group related focus tasks using `spacing.md`, while separating major sections with `spacing.xl` to signal a shift in intent.

## Elevation & Depth

Depth in this design system is created through **Ambient Shadows** and **Tonal Layering**. Instead of harsh shadows, use ultra-diffused dropshadows tinted with a hint of the primary amber or charcoal (#455A64 at 5-10% opacity).

- **Surface Tiers:** Backgrounds use "Creamy Vanilla." Floating cards use a slightly lighter version or pure white to "lift" off the page.
- **The Stone Effect:** Elements should feel like smooth, weathered stones. Use multiple shadow layers—one very soft, large-spread shadow for "glow" and one tighter, subtle shadow for definition.
- **Interactive Depth:** When a button is pressed, it should "sink" into the surface by reducing shadow spread and slightly darkening the background color.

## Shapes

The shape language is strictly **Rounded**. Sharp corners are avoided to maintain the organic, natural feel of the design system.

- **Base Radius:** 0.5rem (8px) for small components like checkboxes or inputs.
- **Large Radius (Stone Shape):** 1rem (16px) for cards and main containers to give them a soft, pebble-like appearance.
- **Pill Shapes:** Full rounding is reserved for buttons and chips to emphasize their touch-friendly, interactive nature.

## Components

### Buttons
Primary buttons are pill-shaped, filled with "Soft Amber," and use "Warm Charcoal" for text. Secondary buttons should have a soft, low-opacity amber border or a subtle cream-on-cream tonal difference.

### Cards & Containers
Cards must feature a `rounded-lg` or `rounded-xl` corner radius. They should have a very soft ambient shadow. Avoid heavy borders; use subtle shifts in background color (Vanilla to White) to define boundaries.

### Input Fields
Inputs are rounded rectangles with a soft background fill. The focus state shouldn't use a harsh blue ring; instead, use a 2px "Soft Amber" border and a subtle inner glow.

### Chips & Tags
Used for categorization (e.g., "Deep Work," "Break"). These should be small, pill-shaped, and use desaturated versions of the primary color to remain secondary to the main task.

### Focus Timer
The central component of the app. It should be a large, circular organic shape with a thick, "Soft Amber" stroke that depletes as time passes, acting as a visual metaphor for the sun setting.

### Lists
List items are separated by generous spacing rather than dividers. If dividers are necessary, use a very faint version of the "Warm Charcoal" at 10% opacity.