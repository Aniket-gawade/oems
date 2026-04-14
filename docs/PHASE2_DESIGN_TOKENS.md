# OEMS Phase 2 Design Tokens

Last updated: 2026-04-11  
Scope: `apps/oems-web` shell and base component primitives

## 1. Typography

### 1.1 Font families

| Token | Value | Usage |
| --- | --- | --- |
| `--font-family-base` | `"IBM Plex Sans", "Trebuchet MS", "Liberation Sans", sans-serif` | Body text, form controls, table content |
| `--font-family-heading` | `"Space Grotesk", "Avenir Next", "Trebuchet MS", sans-serif` | Page headers, section headings |
| `--font-family-mono` | `"JetBrains Mono", "Consolas", "Menlo", monospace` | Technical IDs, trace values, role chips |

### 1.2 Font sizes

| Token | Value | Usage |
| --- | --- | --- |
| `--font-size-100` | `0.875rem` | Hints, helper text, nav labels |
| `--font-size-200` | `1rem` | Default body text |
| `--font-size-300` | `1.25rem` | Section titles, app header title |
| `--font-size-400` | `1.5rem` | Page-level section headings |
| `--font-size-500` | `2rem` | Hero/login title emphasis |

### 1.3 Line-height

| Token | Value | Usage |
| --- | --- | --- |
| `--line-height-tight` | `1.2` | Headings |
| `--line-height-body` | `1.5` | Paragraphs and controls |

## 2. Spacing and Radius

### 2.1 Spacing scale

| Token | Value |
| --- | --- |
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-5` | `1.5rem` |
| `--space-6` | `2rem` |
| `--space-7` | `3rem` |

### 2.2 Border radius

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-sm` | `0.5rem` | Inputs, buttons |
| `--radius-md` | `0.75rem` | Card internals, state panels |
| `--radius-lg` | `1rem` | Main panels/cards |

## 3. Color System

### 3.1 Surfaces and text

| Token | Value | Usage |
| --- | --- | --- |
| `--color-bg-canvas` | `#f2f6fb` | Global canvas |
| `--color-bg-surface` | `#ffffff` | Cards and panels |
| `--color-bg-shell` | `#0f2537` | Header shell background |
| `--color-bg-shell-accent` | `#163852` | Header shell gradient end |
| `--color-text-default` | `#142230` | Primary text |
| `--color-text-soft` | `#4a5e70` | Secondary text |
| `--color-text-on-dark` | `#f2f7fc` | Text on dark shell surfaces |

### 3.2 Borders

| Token | Value | Usage |
| --- | --- | --- |
| `--color-border-muted` | `#d4deea` | Standard borders |
| `--color-border-strong` | `#8fa3b8` | Inputs and higher-contrast borders |

### 3.3 Semantic states

| Token | Value | Usage |
| --- | --- | --- |
| `--color-primary` | `#0c74c9` | Primary actions |
| `--color-primary-hover` | `#0b62aa` | Primary hover/focus |
| `--color-danger` | `#b6372d` | Error text/actions |
| `--color-danger-soft` | `#fce7e5` | Error backgrounds |
| `--color-warning` | `#b26d00` | Warning text |
| `--color-warning-soft` | `#fff3dd` | Warning backgrounds |
| `--color-success` | `#0f7a54` | Success text |
| `--color-success-soft` | `#e7f7f1` | Success backgrounds |

## 4. Elevation and Motion

| Token | Value | Usage |
| --- | --- | --- |
| `--shadow-sm` | `0 2px 8px rgb(15 37 55 / 12%)` | Cards and low-emphasis UI blocks |
| `--shadow-md` | `0 8px 24px rgb(15 37 55 / 16%)` | Toasts, elevated dialogs |
| `--transition-base` | `180ms ease` | Hover/focus transitions |

## 5. Responsive Breakpoints

| Token | Value | Target |
| --- | --- | --- |
| `--bp-mobile-max` | `47.99rem` (`767.84px`) | Mobile |
| `--bp-tablet-min` | `48rem` (`768px`) | Tablet start |
| `--bp-tablet-max` | `63.99rem` (`1023.84px`) | Tablet end |
| `--bp-desktop-min` | `64rem` (`1024px`) | Desktop |

## 6. Token Usage Rules

1. Use semantic color tokens in components (`primary`, `danger`, `success`) and avoid hard-coded colors in JSX.
2. Use spacing tokens for all margins/paddings; do not introduce ad-hoc pixel values unless tied to browser control constraints.
3. Form controls and button dimensions should stay within existing tokenized min-heights for accessibility consistency.
4. New components must be demonstrated in the Component Docs route (`/component-docs`) before broad reuse.
