---
name: 2048 Game Design System
colors:
  surface: '#fff8f5'
  surface-dim: '#dfd9d6'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ef'
  surface-container: '#f3ede9'
  surface-container-high: '#ede7e4'
  surface-container-highest: '#e7e1de'
  on-surface: '#1d1b1a'
  on-surface-variant: '#4e453e'
  inverse-surface: '#33302e'
  inverse-on-surface: '#f6efec'
  outline: '#7f756d'
  outline-variant: '#d1c4ba'
  surface-tint: '#6e5b48'
  primary: '#6b5946'
  on-primary: '#ffffff'
  primary-container: '#85715d'
  on-primary-container: '#fffbff'
  inverse-primary: '#dbc2ab'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#ffd33f'
  on-secondary-container: '#725b00'
  tertiary: '#525d67'
  on-tertiary: '#ffffff'
  tertiary-container: '#6a7680'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f8dec6'
  primary-fixed-dim: '#dbc2ab'
  on-primary-fixed: '#26190a'
  on-primary-fixed-variant: '#554432'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#edc22e'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#d8e4ef'
  tertiary-fixed-dim: '#bcc8d3'
  on-tertiary-fixed: '#111d25'
  on-tertiary-fixed-variant: '#3d4851'
  background: '#fff8f5'
  on-background: '#1d1b1a'
  surface-variant: '#e7e1de'
  page-bg: '#faf8ef'
  text-primary: '#776E65'
  text-bright: '#f9f6f2'
  container-bg: '#bbada0'
  tile-base: '#eee4da'
  tile-8: '#f78e48'
  tile-16: '#fc5e2e'
  tile-32: '#ff3333'
  tile-64: '#ff0000'
  tile-gold: '#edc22e'
  tile-super: '#333333'
typography:
  game-title:
    fontFamily: Plus Jakarta Sans
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.1'
  game-title-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 27px
    fontWeight: '700'
    lineHeight: '1.1'
  score-value:
    fontFamily: Plus Jakarta Sans
    fontSize: 25px
    fontWeight: '700'
    lineHeight: '1.2'
  score-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: '1.2'
  body-base:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.65'
  body-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.65'
  tile-default:
    fontFamily: Plus Jakarta Sans
    fontSize: 55px
    fontWeight: '700'
    lineHeight: '1'
  tile-3-digit:
    fontFamily: Plus Jakarta Sans
    fontSize: 45px
    fontWeight: '700'
    lineHeight: '1'
  tile-4-digit:
    fontFamily: Plus Jakarta Sans
    fontSize: 35px
    fontWeight: '700'
    lineHeight: '1'
  tile-super:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  grid-gap-desktop: 15px
  grid-gap-mobile: 10px
  container-padding-desktop: 15px
  container-padding-mobile: 10px
  margin-body-desktop: 80px
  margin-body-mobile: 20px
---

# 2048 Design System

This document outlines the core design language, components, and variables used in the 2048 game, based on the original `main.scss` styles.

## 🎨 1. Color Palette

The color scheme is designed to be warm, clean, and highly readable, relying heavily on subtle earth tones and progressive warm colors for the tiles.

### Base Colors
- **Page Background:** `#faf8ef`
- **Text Color (Primary):** `#776E65`
- **Text Color (Bright/Contrast):** `#f9f6f2`
- **Game Container Background:** `#bbada0`
- **Base Tile Color:** `#eee4da`
- **Gold Tile Target Color:** `#edc22e`

### Tile Colors
The tiles change color progressively as their value increases, starting from a neutral tone to bright oranges and reds, and eventually reaching a glowing gold.

| Tile Value | Background Color | Text Color Category |
|------------|------------------|---------------------|
| `2`, `4`   | `#eee4da` (Base) | Primary             |
| `8`        | `#f78e48`        | Bright              |
| `16`       | `#fc5e2e`        | Bright              |
| `32`       | `#ff3333`        | Bright              |
| `64`       | `#ff0000`        | Bright              |
| `128+`     | Progressing towards `#edc22e` (Gold) | Bright |
| `Super`    | Mix of `#333333` & Gold | Bright       |

---

## 🔤 2. Typography

The game uses a clean, modern sans-serif font stack.

- **Primary Font Family:** `"Clear Sans", "Helvetica Neue", Arial, sans-serif`
- **Base Font Size:** `18px` (Desktop) / `15px` (Mobile)
- **Line Height:** `1.65` (for paragraphs)

### Typography Hierarchy
- **Game Title (`h1`):** `80px` bold (Desktop) / `27px` bold (Mobile)
- **Score Values:** `25px` bold
- **Score Labels:** `13px` uppercase
- **Game Over/Win Message:** `60px` bold (Desktop) / `30px` bold (Mobile)

### Tile Typography
Tile text size scales down dynamically as the numbers get larger to fit within the boundaries:
- **Default:** `55px` (Desktop) / `35px` (Mobile)
- **3 Digits (`128`, `256`, `512`):** `45px` (Desktop) / `25px` (Mobile)
- **4 Digits (`1024`, `2048`):** `35px` (Desktop) / `15px` (Mobile)
- **Super Tiles (`> 2048`):** `30px` (Desktop) / `10px` (Mobile)

---

## 📐 3. Layout & Spacing

The layout is fully responsive, breaking down from a centered desktop view to a full-width mobile view.

### Grid System
- **Grid Row Cells:** `4`
- **Field Width:** `500px` (Desktop) / `280px` (Mobile)
- **Grid Spacing:** `15px` (Desktop) / `10px` (Mobile)
- **Tile Size:** Calculated dynamically based on field width and spacing.
  - *Formula:* `($field-width - $grid-spacing * ($grid-row-cells + 1)) / $grid-row-cells`
- **Tile Border Radius:** `3px`
- **Game Container Border Radius:** `6px` (`$tile-border-radius * 2`)

### Layout Metrics
- **Body Margin:** `80px 0` (Desktop) / `20px 0` (Mobile)
- **Game Container Margin Top:** `40px` (Desktop) / `17px` (Mobile)

---

## 🪄 4. UI Components

### Buttons (`.restart-button`, etc.)
- **Background:** `#8f7a66` (Darkened Game Container Background)
- **Text Color:** `#f9f6f2` (Bright Text)
- **Border Radius:** `3px`
- **Height/Line-height:** `40px` / `42px`
- **Padding:** `0 20px`

### Score Containers (`.score-container`, `.best-container`)
- **Background:** `#bbada0`
- **Text Color:** White
- **Padding:** `15px 25px` (Desktop) / `15px 10px` (Mobile)
- **Border Radius:** `3px`

---

## 🎬 5. Animations & Transitions

Smooth CSS3 animations and transitions are crucial to the "feel" of 2048. 

- **Base Transition Speed:** `100ms` (Applied to tile movements)

### Keyframes
1. **`appear` (Tile Spawning):** 
   - Scales from `0` to `1` and fades in (`opacity: 0` to `1`).
   - Duration: `200ms ease 100ms`
2. **`pop` (Tile Merging):** 
   - Scales normally to `1.2` (50%), then back to `1` (100%).
   - Duration: `200ms ease 100ms`
3. **`move-up` (Score Addition Animation):** 
   - Floats up from `top: 25px` to `-50px` while fading out.
   - Duration: `600ms ease-in`
4. **`fade-in` (Game Over/Win Overlay):**
   - Simple opacity fade.
   - Duration: `800ms ease 1200ms`
