# Design Tokens — Apple / Linear Motion Reels

## Canvas

| Token | Value |
|-------|-------|
| Width | 1080 |
| Height | 1920 |
| FPS | 30 |
| Duration | Script-driven (30–45s) |

## Color Palette — Dark Mode (default)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#09090B` | Canvas background |
| `bg-grid` | `rgba(255,255,255,0.03)` | 40px grid overlay |
| `surface` | `rgba(14,20,36,0.92)` | Dark cards (terminal, code) |
| `surface-elevated` | `rgba(20,24,32,0.95)` | Elevated cards |
| `border` | `rgba(255,255,255,0.10)` | Card borders |
| `text-primary` | `#F4F4F5` | Main white text |
| `text-secondary` | `#A1A1AA` | Metadata, comments |
| `text-code` | `#E4E4E7` | Code editor text |
| `blue` | `#2563EB` | Selection boxes, focus, hub glow |
| `cyan` | `#38BDF8` | Pulses, status pills |
| `green` | `#10B981` | Check icons, success metrics |
| `coral` | `#EF4444` | Errors (only when topic data says so) |
| `amber` | `#F59E0B` | Warnings (only when topic data says so) |

## Color Palette — Light Mode (Theme Flip, 1 scene only)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-light` | `#F5F5F0` | Off-white grid canvas |
| `bg-grid-light` | `rgba(0,0,0,0.05)` | Subtle grid |
| `surface-light` | `#FFFFFF` | White cards |
| `border-light` | `rgba(0,0,0,0.08)` | Light card borders |
| `text-primary-light` | `#09090B` | Dark text |
| `green-chart` | `#10B981` | Solid chart line |
| `blue-chart` | `#2563EB` | Dashed chart line |

## Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| WordCaption (sans) | Inter | 54px | 500 / 700 |
| WordCaption (emphasis) | Instrument Serif Italic | 58px | 400 |
| Card title | Inter | 28–36px | 700–800 |
| StatCard number | Inter | 64px | 700 |
| Code | Fira Code / JetBrains Mono | 20–24px | 400 |
| Terminal | JetBrains Mono / monospace | 19px | 400 |
| Pill / badge | Inter | 12–14px | 700 |
| Footer meta | monospace | 13px | 400 |

## Motion Physics

| Token | Value |
|-------|-------|
| Spring config | `{ damping: 18, stiffness: 120, mass: 0.8 }` |
| Entrance blur | `blur(4px → 0px)` |
| Entrance Y | `translateY(6px → 0px)` |
| Word blur-in | `blur(8px → 0)`, `y: 12 → 0`, over 6 frames |
| Word blur-out | reverse, over 5 frames |
| Orbital rotation | `0.15 deg/frame` |
| StatCard count-up | `Easing.out(Easing.cubic)`, 24 frames |

## Camera Stages (CameraRig)

| Stage | Progress | Scale | Pan |
|-------|----------|-------|-----|
| Punch-in | 0–18% | 0.94 → 1.05 | — |
| Detail zoom | 18–60% | 1.05 → focusScale | X/Y to target |
| Micro-recoil | 60–72% | focusScale → (focusScale - 0.03) | — |
| Pull-back | 72–100% | → 1.02 | → 0,0 |

## Browser Window

- Background: `#FFFFFF`
- Border: `1px solid rgba(0,0,0,0.08)`
- Border radius: `18px`
- Shadow: `0 12px 40px rgba(0,0,0,0.12)`
- Traffic dots: `#FF5F56` / `#FFBD2E` / `#27C93F`
- URL bar: pill shape, centered, `#F4F4F5` bg, favicon + real domain

## Terminal Log

- Background: `#0E1424`
- Border: `1px solid rgba(56,189,248,0.25)`
- Header: tool name + meta pills right-aligned
- Each line: `#10B981` check icon + text + grey status right
- Active line: spinner `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` cycling
- Final metric line: `#10B981` large
