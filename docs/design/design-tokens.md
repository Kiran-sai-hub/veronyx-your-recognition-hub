# Design tokens

Source of truth in code: `src/styles.css` (CSS custom properties, oklch) exposed to Tailwind through
`@theme inline`. Live reference: **Design system → Foundations** (`/design-system`).
Checklist: §10.1–§10.5.

## Colour

Values follow the checklist palette. Where a checklist value failed WCAG AA contrast in real use
(text on white, on 10 % tints, or white text on the colour), it was adjusted and the change is noted.

| Token                                 | Checklist light | Implemented light                                        | Checklist dark | Implemented dark                   | Usage                  |
| ------------------------------------- | --------------- | -------------------------------------------------------- | -------------- | ---------------------------------- | ---------------------- |
| `primary`                             | #2563EB         | ≈ #1F5AE6 (`oklch(0.525 0.235 263)`)                     | #3B82F6        | ≈ #6CA0FF (`oklch(0.71 0.15 255)`) | Primary actions, links |
| `primary-hover`                       | #1D4ED8         | primary at 90 %                                          | #2563EB        | primary at 90 %                    | Hover state            |
| `primary-foreground`                  | —               | near-white                                               | —              | navy `oklch(0.2 0.04 265)`         | Text on primary        |
| `success`                             | #16A34A         | ≈ #00722E                                                | #22C55E        | `oklch(0.723 0.191 149.6)`         | Success, approved      |
| `warning`                             | #D97706         | ≈ #A84A00                                                | #F59E0B        | `oklch(0.769 0.188 70.1)`          | Warnings, pending      |
| `error` (`destructive`)               | #DC2626         | ≈ #C50003                                                | #EF4444        | `oklch(0.704 0.191 22.2)`          | Errors, rejected       |
| `info`                                | #0891B2         | ≈ #007696                                                | #06B6D4        | `oklch(0.715 0.143 215.2)`         | Info states            |
| `background`                          | #FFFFFF         | #FFFFFF                                                  | #0F172A        | `oklch(0.129 0.042 264.7)`         | Page background        |
| `surface` (`card`)                    | #F8FAFC         | #FFFFFF cards on #FFFFFF page, `muted` #F1F5F9 for fills | #1E293B        | `oklch(0.208 0.042 265.8)`         | Card background        |
| `border`                              | #E2E8F0         | `oklch(0.929 0.013 255.5)`                               | #334155        | white at 10 %                      | Borders                |
| `text-primary` (`foreground`)         | #0F172A         | `oklch(0.208 0.042 265.8)`                               | #F8FAFC        | `oklch(0.984 0.003 247.9)`         | Primary text           |
| `text-secondary` (`muted-foreground`) | #64748B         | ≈ #53647E                                                | #94A3B8        | `oklch(0.704 0.04 256.8)`          | Secondary text         |
| `text-disabled`                       | #94A3B8         | muted-foreground at 50 %                                 | #475569        | muted-foreground at 50 %           | Disabled text          |
| `reward` _(product)_                  | —               | ≈ #8A5600                                                | —              | `oklch(0.795 0.184 86)`            | Points, rewards        |
| `private` _(product)_                 | —               | = text-secondary                                         | —              | = text-secondary                   | Private-only content   |

Rule: never convey status by colour alone — every status badge also has an icon and a word.

### High contrast (accessibility preference)

`html.hc` darkens secondary text and borders, strengthens the focus ring (3 px) and link underlines.
Turned on in **Preferences → Display & accessibility**.

## Typography (§10.2)

Font stack: DM Sans, then Noto Sans Devanagari / Tamil / Telugu / Kannada / Bengali / Gujarati /
Malayalam, so every supported script renders with a matching sans. Mono: JetBrains Mono.

| Token | Size  | Weight   | Tailwind                  | Usage                       |
| ----- | ----- | -------- | ------------------------- | --------------------------- |
| h1    | 30 px | Bold     | `text-3xl font-bold`      | Page titles (`PageHeading`) |
| h2    | 24 px | Bold     | `text-2xl font-bold`      | Section titles              |
| h3    | 20 px | Semibold | `text-xl font-semibold`   | Card titles                 |
| h4    | 16 px | Semibold | `text-base font-semibold` | Sub-sections                |
| body  | 14 px | Regular  | `text-sm`                 | Body text                   |
| small | 12 px | Regular  | `text-xs`                 | Captions, labels            |
| mono  | 13 px | Regular  | `font-mono text-[13px]`   | Codes, IDs, JSON            |

Text size preference: Normal / Large (112.5 %) / Extra large (125 %) via `html[data-text-size]`.
All sizes are rem-based so the whole UI scales.

## Spacing (§10.3)

4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 px — Tailwind `1, 2, 3, 4, 5, 6, 8, 10, 12, 16`.
Page gutters: 16 px mobile, 24 px tablet, 32 px desktop. Card padding 16–20 px.

## Radius (§10.4)

| Token | Value   | Tailwind       | Usage                  |
| ----- | ------- | -------------- | ---------------------- |
| sm    | 4 px    | `rounded-sm`   | Inputs, small buttons  |
| md    | 8 px    | `rounded-md`   | Cards, buttons         |
| lg    | 12 px   | `rounded-lg`   | Modals, large cards    |
| full  | 9999 px | `rounded-full` | Pills, avatars, badges |

## Shadows (§10.5)

| Token       | Usage                            |
| ----------- | -------------------------------- |
| `shadow-sm` | Cards at rest                    |
| `shadow-md` | Cards on hover, dropdowns        |
| `shadow-lg` | Modals, popovers, docked Copilot |
| `shadow-xl` | Toasts, floating elements        |

## Adding a token

1. Add the light value under `:root` and the dark value under `.dark` in `src/styles.css` (oklch).
2. Register it in `@theme inline` as `--color-<name>: var(--<name>)`.
3. Check contrast (text ≥ 4.5:1, large text and UI ≥ 3:1) in both themes and with `.hc`.
4. Show it on the Design system page.
