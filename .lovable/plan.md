# Veronyx Recognise frontend implementation plan

## Goal
Build a complete, polished frontend prototype for every screen and workflow in the supplied Veronyx Recognise specification. The result will be a navigable, responsive product experience with realistic Indian SME data, simulated interactions, light and dark themes, and no live backend.

Work will be delivered in four reviewable phases. Each phase ends with browser verification and a review stop; the next phase begins only after approval.

## Product shell and visual system
- Create the Veronyx Recognise typographic wordmark and a compact app symbol for collapsed navigation, favicons, and mobile headers.
- Apply the documented blue-led semantic palette, status colours, 4–64 px spacing scale, 4/8/12 px radii, and restrained shadows in light and dark themes.
- Use a professional sans-serif family with full support for the nine required Indian-language scripts; use monospace only for IDs, formulas, and structured definitions.
- Build the desktop sidebar, tablet collapsed navigation, mobile bottom navigation, notifications, profile controls, global search, theme control, language control, and persona switcher.
- Persona modes: Owner, HR/Admin, Manager, Employee, Frontline/WhatsApp, and Kiosk. Navigation and page content will visibly adapt to the selected persona.
- Use Lucide icons, accessible charts, consistent status labels, visible focus treatment, reduced-motion support, and minimum 44 px mobile targets.
- Employer-facing experiences will lead with the employer identity, using the fictional “Radha Krishna Mills” brand in demo data and a small “Powered by Veronyx” signature. Veronyx may lead only in the admin shell.

## Reusable component library
Build shared primitives and domain patterns before assembling screens:
- Buttons, inputs, searchable selects, date/range pickers, tables, cards, dialogs, drawers, tabs, steppers, progress, skeletons, toasts, badges, tooltips, menus, avatars, timelines, charts, and empty/error/success states.
- Workflow nodes and connections, condition/form builders, formula and structured-data viewers, version diffs, metric cards, leaderboards, budget pools, tax rows, connector cards, identity matches, approval cards, decision traces, AI proposal cards, scorecards, comparison policies, and behaviour rules.
- Shared layouts for list/detail queues, builders, wizards, settings, analytics reports, and mobile cards.
- Add `/design-system` as the working replacement for a Figma library. It will display colour, typography, spacing, radius and motion tokens plus every core and domain component in its meaningful default, loading, empty, disabled, error, success, light, dark and responsive states.

## Delivery phases

### Phase 1 — P0 foundation and core loops
- Product shell, employer/admin branding hierarchy, persona switcher, themes, responsive navigation, and the complete `/design-system` reference.
- Login with email/password and visual Google/Microsoft options.
- Frontline OTP verification.
- First-time organisation setup covering profile, industry/team size, departments, teams, locations, employee import, invitations, and first connector.
- CSV/Excel, Google Sheet, and manual employee import states: upload, mapping, validation, preview, progress, success, and identity-resolution handoff.
- Owner dashboard, pending decisions, fairness, negative report, retention signals, and contextual AI Ask box.
- Manager dashboard, team leaderboard, wallet and “Recognise now”, approvals, unrecognised team members, and metric trends.
- Employee home, points wallet, recognitions, tracking, reward catalogue, redemption detail, shoutout, notification preferences, and language selection.
- Workflow list, three-panel workflow builder, step configuration, validation V1–V14, dry-run report, version/run views, and decision traces.
- Approval queue on desktop and mobile, with Approve, Modify, Reject, and Escalate. Decision controls remain sticky; Modify/Reject/Escalate require notes, Reject also requires a reason, and every action uses confirmation. Exhausted budgets move approvals to a queued state.
- Complete employee redemption flow: tax-nature tags, confirmation, six-digit OTP, three-attempt lockout, processing, success/failure, status history, and cancellation only before the reward code is revealed.
- Basic AI Copilot with sidebar entry, owner Ask box, workflow-builder AI Assist, contextual empty-state actions, screen-aware suggestions, basic proposal/validation/dry-run cards, unavailable state, and “Ask AI to fix” on validation errors.
- **Review gate:** verify P0 desktop and mobile journeys, both themes, all personas, accessibility, and key edge states; stop for review.

### Phase 2 — P1 data and performance tools
- Connector list, data health, add-connector gallery, and simulated CSV/Excel, Google Sheets, Zoho CRM/Bigin, email, and webhook setup.
- Field-mapping workspace, identity mapping/dedup/filter preview, identity-resolution queue, field registry, and schema-drift alerts. Every identity link requires explicit human confirmation.
- Board list and create-from-template/blank/AI entry.
- Board configuration for source mode, scope, tracking, metrics, scorecard, targets, rules, comparison policy, and visibility.
- Native capture form builder with field palette, configuration, reordering, and mobile/WhatsApp previews.
- Native-entry approval queue, scorecard editor, target setting, behaviour-rule list/editor, comparison policy preview, and employee/manager board previews.
- Basic analytics for recognition coverage, spend per FTE, budget use, redemption rate, manager spread, and performance lift, with chart/table toggle and CSV export.
- Payroll export flow with period/system selection, preview, validation, CSV-ready completion, and export history.
- AI “Board setup” entry point and screen-aware suggestions for Phase 2 surfaces.
- **Review gate:** verify connector, mapping, identity, board, native capture, rule, analytics, and payroll journeys; stop for review.

### Phase 3 — P2 governance and depth
- Fairness and concentration/Gini views, equity cuts, negative report, anti-gaming alerts, and private poor-performance views.
- Scorecard editor, target setting, comparison policies, advanced visibility, and campaign manager with Diwali, Pongal, Onam and other relevant festivals.
- Organisation profile; roles and permissions; privacy notice builder; consent records; data-principal request queue; retention settings; notification templates; WhatsApp templates; audit log; billing and plan.
- DPDP flows for multilingual notices, consent evidence, access/correction/erasure/grievance requests, SLA progress, and retention schedules.
- Gender-based cuts remain hidden until consent is recorded.
- **Review gate:** verify fairness/privacy safeguards, campaigns, compliance and settings; stop for review.

### Phase 4 — P3 kiosk
- Interactive WhatsApp phone simulator for JOIN, recognition notification, BALANCE, REDEEM handoff, THANKS, language switching, and STOP.
- Kiosk presentation mode using read-only, auto-rotating leaderboard and recognition views suitable for factory/store displays.
- **Review gate:** verify kiosk legibility, rotation, reduced motion and employer branding; stop for final review.

## Global UX rules
- Use plain language without internal jargon. Summary cards show one key number and one supporting line; each screen has one visually dominant primary action.
- Keep approval/decision actions sticky and visible without covering content.
- Show poor performance only in private views, in neutral slate styling with a lock icon—never red and never with health or personal-reason speculation.
- Never simulate automatic payout, identity linking, or budget movement; each requires a visible human review and confirmation.
- AI suggestions must cite only the deterministic mock data available in the prototype. Do not invent testimonials, customer counts, ROI claims, or unsupported facts.
- The product remains fully usable when AI is unavailable; every AI-assisted journey has a manual route.
- Support undo where safe, auto-save long forms, session-timeout warnings, concurrent-edit warnings, run-in-progress banners, and missing-translation fallback to English.
- Validate GSTIN and Udyam formats in onboarding and settings.

## Mobile and PWA behaviour
- Build dedicated manager and owner mobile compositions rather than shrinking desktop layouts.
- Use bottom navigation for Dashboard, Approvals, Rewards and Profile.
- Prototype swipe-right approval and swipe-left rejection with accessible button equivalents, pull-to-refresh, PWA install prompt, offline banner, and camera evidence upload.

## Prototype behaviour and data
- Use a typed in-memory service layer with deterministic mock data; no direct data fetching from screens.
- Seed a coherent fictional Indian SME organisation, employees, teams, connectors, workflows, budgets, approvals, rewards, compliance records, and analytics so cross-screen details remain consistent.
- Simulate filtering, sorting, pagination, tabs, drawers, confirmations, uploads, validation, dry-runs, approvals, canvas editing, redemption, exports, and success/error/loading states.
- Persist only prototype preferences and temporary demo state in the browser: persona, theme, language, and completed simulated actions.
- Render all nine language choices and demonstrate translated content in representative employee/frontline views; the full prototype remains navigable in English.
- Use DD/MM/YYYY, IST, April–March fiscal-year context, Indian number grouping, and ₹ formatting throughout.

## Route structure
Use dedicated shareable routes for the major areas: access/onboarding, dashboards, boards, workflows, approvals, people, connectors, rewards, analytics, budget, AI Copilot, compliance/settings, employee experience, WhatsApp simulator, and kiosk. Detail and editing experiences will use nested routes where they need direct links; contextual configuration will use panels or dialogs.

## Validation and quality
- Add route metadata for every content route with unique Veronyx titles and descriptions.
- Verify TypeScript strictness, linting, existing tests, and focused unit tests for formatting/state utilities.
- Browser-test all primary journeys: onboarding, workflow builder, approval actions, AI conversation, employee redemption, WhatsApp commands, persona switching, theme switching, and mobile navigation.
- Check representative screens at mobile, tablet, desktop, and large-desktop sizes, including both themes.
- Check keyboard flow, focus visibility, labels, dynamic announcements, contrast, 200% text zoom, reduced motion, empty/loading/error/success states, and content overflow.

## Technical notes
- Keep the existing TanStack Start architecture and use file-based routes.
- Keep all feature and design-system components as plain React with shadcn/Radix primitives. They receive data and callbacks through props, contain no router imports, and remain portable to a future Next.js App Router codebase. TanStack routing stays only in page-level route files.
- Use Tailwind CSS v4 semantic tokens, React Query-compatible mock services, Zustand for prototype-only client state, Recharts for reports, and an established React flow/canvas library for the DAG editor.
- The implementation is frontend-only: authentication, connectors, AI, WhatsApp delivery, OTP, ledger, exports, and compliance operations will be realistic simulations rather than live services.
- The requested deliverable is the working web prototype. Figma files, a production backend, live integrations, and real message/payment delivery are outside this phase.
