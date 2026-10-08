# Responsive, dark mode and motion specs

Checklist §8.1–§8.2, §10.1 and Appendix B. Live reference: **Design system → Specs**.

## Breakpoints

| Breakpoint    | Width        | Layout in the build                                                                                                                                                                                                                            |
| ------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile        | < 768 px     | Single column. Top bar with hamburger (full menu in a sheet) and role switch. Bottom nav: Dashboard, Approvals (badge), Rewards, Profile — employees get Home, Wallet, Rewards, Profile. Wide tables become cards or scroll inside their card. |
| Tablet        | 768–1023 px  | 64 px **icon rail** (collapsed sidebar with tooltips and badges) + content; “Expand menu” opens the full sidebar. Two-column grids where content allows. No bottom nav.                                                                        |
| Desktop       | 1024–1440 px | 256 px sidebar with section sub-items, notifications and profile at the bottom; content max 1440 px.                                                                                                                                           |
| Large desktop | > 1440 px    | Sidebar + content + **optional right panel**: the AI Copilot docks as a 420 px panel beside the page instead of covering it.                                                                                                                   |

### Mobile specifics

- Swipe on an approval card: right = approve, left = reject (each opens the confirm step).
- Pull to refresh on the approvals queue and recognitions.
- Tap targets ≥ 44 × 44 px.
- WhatsApp deep link (`wa.me`) on the employee home.
- PWA: `manifest.webmanifest`, icons (192/512/maskable/Apple), install prompt on the employee
  home (Android install event; iPhone “Share → Add to Home Screen” hint).
- Offline-capable shell: `public/sw.js` caches the app shell and static assets (production builds
  only), navigation falls back to the last good page; an offline banner appears app-wide.
- Camera capture for evidence (`capture="environment"`) in native entry forms and preferences.

## Dark mode

- Every colour is a token with a dark value (`.dark` in `styles.css`); charts use chart tokens;
  illustrations use theme tokens; the WhatsApp phone keeps WhatsApp colours only in light mode.
- Toggle: moon/sun in the top bar (remembered). Kiosk and WhatsApp pages follow the same setting.
- Contrast verified with axe in dark mode (0 violations).

## Motion

| Use                          | Duration       | Easing             | Where                                                  |
| ---------------------------- | -------------- | ------------------ | ------------------------------------------------------ |
| Micro (hover, press, toggle) | 150 ms         | ease-out           | Buttons, switches, checkboxes                          |
| Overlay in/out               | 200 ms         | ease-out / ease-in | Dialogs, sheets, dropdowns, toasts                     |
| Content change               | 250 ms         | ease-in-out        | Tabs, accordions, chart transitions                    |
| Page skeleton                | ≤ 300 ms       | —                  | Skeleton shown until a screen's data is ready          |
| Progress / typing            | continuous     | linear             | Dry-run bar, AI typing dots, spinners, pull to refresh |
| Kiosk rotation               | 10 s per slide | —                  | Kiosk mode (pausable)                                  |

Reduced motion: OS `prefers-reduced-motion` or **Preferences → Reduce motion** turns off
animations and transitions, and the kiosk starts paused.
