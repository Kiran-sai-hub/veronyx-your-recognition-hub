# Appendix C — open questions: what the prototype assumes

The checklist lists questions to settle before implementation. None were answered in the
brief, so the prototype makes the assumptions below. Each is easy to change.

| #   | Question            | Assumption in the prototype                                                                                                                                                          | Where it shows                             |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| 1   | Brand identity      | Working brand: “Veronyx Recognise”, hexagon mark, blue `#2563EB` primary, DM Sans + Noto Sans. Customer branding (Radha Krishna Mills, RK) appears in the employee app and WhatsApp. | Sidebar, login, employee app, PWA icon     |
| 2   | Design tool         | Code-first: the design system lives in the app (`/design-system`) and `docs/design/`. Figma files were out of scope for this pass.                                                   | Design system page                         |
| 3   | Component library   | shadcn/ui on Radix + Tailwind tokens, extended with the §7 components in `src/components/library`.                                                                                   | Design system → Core components            |
| 4   | Dark mode           | Included now; all screens verified for contrast in dark mode.                                                                                                                        | Moon icon in the top bar                   |
| 5   | Native app          | Web-first PWA for employees (installable, offline shell); WhatsApp for frontline. Components stay router-agnostic for a later React Native / Next.js move.                           | Employee app, install prompt               |
| 6   | WhatsApp templates  | Content and template list designed (names, categories, languages, approval status); the bot journey is simulated.                                                                    | `/whatsapp`, Settings → WhatsApp templates |
| 7   | Kiosk mode          | Designed for v1: TV leaderboard with auto-rotate, pause, reduced-motion respect.                                                                                                     | `/kiosk`                                   |
| 8   | Illustration style  | Custom, lightweight inline SVG set using theme tokens (no stock cost, works offline and in dark mode).                                                                               | Empty states, Design system → Foundations  |
| 9   | User research       | Not done yet. Recommended next: 5 owner/HR sessions and 5 frontline sessions (WhatsApp + PWA on low-end Android), plus screen-reader testing.                                        | —                                          |
| 10  | Engineering handoff | This repository is the handoff: `docs/engineering-handoff.md`.                                                                                                                       | —                                          |
