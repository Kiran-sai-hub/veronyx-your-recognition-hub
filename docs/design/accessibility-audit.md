# Accessibility audit report

Date: 08/10/2026 · Standard: WCAG 2.1 AA (checklist §9) · Build: branch
`claude/inspiring-mendel-qfkx1b`.

## Method

1. **Automated** — axe-core 4.10 (rules `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`)
   run by Playwright/Chromium at 1280 × 900 on **36 routes** across every role (Owner, HR Admin,
   Manager, Employee, signed-out), in **light and dark** themes.
2. **Layout** — every route × role at 390 px (phone) and 768 px (tablet) checked for horizontal
   overflow and console errors.
3. **Manual** — keyboard-only walkthrough of the demo script (sign-in, approvals, workflow
   builder, AI Copilot, redemption, WhatsApp simulator, preferences); focus order, visible focus,
   dialogs returning focus, live-region announcements.

## Results

| Run                   | Before fixes                                                                                                                                                                                                                                                                           | After fixes                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| axe, light theme      | 36 routes with violations: colour contrast on every route; 3 invalid `aria-controls` (filter tabs); 1 unlabelled input; 6 nested interactive controls (workflow canvas); 2 heading-order; 1 empty table header; 1 non-focusable scroll region; landmark and `region` issues on sign-in | **0 violations on all 36 routes** |
| axe, dark theme       | Contrast failures on 35 routes (primary text on dark, warning badge text)                                                                                                                                                                                                              | **0 violations on all 36 routes** |
| Overflow 390 / 768 px | 2 routes overflowed at 390 px                                                                                                                                                                                                                                                          | **0**                             |
| Console errors        | 0                                                                                                                                                                                                                                                                                      | 0                                 |

## Fixes made

- **Contrast**: light-mode `primary`, `success`, `warning`, `error`, `info`, `reward`,
  `muted-foreground` darkened; dark `primary` lightened with a dark foreground; warning badges use
  the warning colour as text in dark mode; dimmed (`opacity`) cards replaced with dashed borders.
- **Semantics**: filter tabs that did not switch panels became pressed-button groups
  (`SegmentedControl`); workflow canvas nodes no longer nest buttons inside a `role="button"`;
  alert titles no longer use `h5` (heading order); sign-in pages have `main`, `aside` and one `h1`.
- **Labels**: every input has a visible label tied by `htmlFor`/`id`; icon-only buttons have
  `aria-label`; table headers without text have screen-reader text.
- **Scrollable regions** are focusable and named.

## Checklist §9 status

| Item                                                                     | Status     | Evidence                                                                                |
| ------------------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------- |
| Contrast ≥ 4.5:1 / 3:1                                                   | ✅         | axe light + dark: 0 violations                                                          |
| Keyboard access, logical tab order, no traps                             | ✅         | Manual walkthrough; Radix dialogs/menus trap and restore focus                          |
| Visible focus                                                            | ✅         | Global `:focus-visible` 2 px ring (3 px in high contrast)                               |
| Skip link                                                                | ✅         | “Skip to content” on every app page                                                     |
| Alt text                                                                 | ✅         | Illustrations `aria-hidden`; charts have text alternatives (`sr-only` captions)         |
| ARIA labels for icon buttons                                             | ✅         | axe `button-name` passes                                                                |
| Labels associated, errors via `aria-describedby`                         | ✅         | axe `label` passes; forms use `aria-invalid` + `aria-describedby`                       |
| Heading hierarchy                                                        | ✅         | axe `heading-order` passes                                                              |
| Live regions                                                             | ✅         | Copilot, dry-run progress, sync, offline banner, toasts                                 |
| Not by colour alone                                                      | ✅         | Status badges = icon + word                                                             |
| Text to 200 %                                                            | ✅         | rem-based; Preferences text size up to 125 % plus browser zoom; no overflow at 390 px   |
| Touch targets ≥ 44 px                                                    | ✅         | Navigation, bottom bar, WhatsApp chips, primary mobile actions use `min-h-11`/`size-11` |
| High contrast mode                                                       | ✅         | Preferences → High contrast (`.hc`)                                                     |
| Reduced motion                                                           | ✅         | OS `prefers-reduced-motion` + Preferences → Reduce motion; kiosk stops auto-rotating    |
| Text size adjustable                                                     | ✅         | Preferences → Text size                                                                 |
| VoiceOver / NVDA tested                                                  | ⚠️ Not yet | Needs a session on real devices with screen readers (recommended before pilot)          |
| Plain language, clear errors with fixes                                  | ✅         | Error copy from §6.3; validation lists fixes                                            |
| Progress for multi-step flows                                            | ✅         | Steppers in onboarding, employee import, connector setup and payroll export             |
| Confirm destructive actions, undo                                        | ✅         | Dialogs for withdraw/erase/reject; undo toasts on approvals and alerts                  |
| Auto-save long forms                                                     | ✅         | Workflow builder and org setup autosave indicators                                      |
| Timeout warning                                                          | ✅         | 30-minute inactivity → 60-second warning → session-expired login                        |
| Frontline: large targets, icons + text, regional language, low-data mode | ✅         | WhatsApp simulator, Preferences → Low-data mode                                         |
| Voice input                                                              | ✅         | Copilot mic and WhatsApp voice note (browser speech recognition, demo fallback)         |
| Works on Android 8+                                                      | ⚠️ Not yet | Needs testing on a real low-end device                                                  |

## How to re-run

```bash
npm install --no-save --no-package-lock axe-core@4.10.2
# start the dev server, then run a Playwright script that injects node_modules/axe-core/axe.min.js
# into each route and calls axe.run(document, { runOnly: ["wcag2a","wcag2aa","wcag21a","wcag21aa","best-practice"] })
```
