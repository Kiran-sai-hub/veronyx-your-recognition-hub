# Veronyx Recognise frontend implementation plan

## Goal
Build a complete, polished frontend prototype for every screen and workflow in the supplied Veronyx Recognise specification. The result will be a navigable, responsive product experience with realistic Indian SME data, simulated interactions, light and dark themes, and no live backend.

## Product shell and visual system
- Create the Veronyx Recognise typographic wordmark and a compact app symbol for collapsed navigation, favicons, and mobile headers.
- Apply the documented blue-led semantic palette, status colours, 4–64 px spacing scale, 4/8/12 px radii, and restrained shadows in light and dark themes.
- Use a professional sans-serif family with full support for the nine required Indian-language scripts; use monospace only for IDs, formulas, and structured definitions.
- Build the desktop sidebar, tablet collapsed navigation, mobile bottom navigation, notifications, profile controls, global search, theme control, language control, and persona switcher.
- Persona modes: Owner, HR/Admin, Manager, Employee, Frontline/WhatsApp, and Kiosk. Navigation and page content will visibly adapt to the selected persona.
- Use Lucide icons, accessible charts, consistent status labels, visible focus treatment, reduced-motion support, and minimum 44 px mobile targets.

## Reusable component library
Build shared primitives and domain patterns before assembling screens:
- Buttons, inputs, searchable selects, date/range pickers, tables, cards, dialogs, drawers, tabs, steppers, progress, skeletons, toasts, badges, tooltips, menus, avatars, timelines, charts, and empty/error/success states.
- Workflow nodes and connections, condition/form builders, formula and structured-data viewers, version diffs, metric cards, leaderboards, budget pools, tax rows, connector cards, identity matches, approval cards, decision traces, AI proposal cards, scorecards, comparison policies, and behaviour rules.
- Shared layouts for list/detail queues, builders, wizards, settings, analytics reports, and mobile cards.

## Screens and flows

### 1. Access and onboarding
- Login with email/password and visual Google/Microsoft options.
- Frontline OTP verification.
- First-time organisation setup covering profile, industry/team size, departments, teams, locations, employee import, invitations, and first connector.
- CSV/Excel, Google Sheet, and manual employee import states: upload, mapping, validation, preview, progress, success, and identity-resolution handoff.

### 2. Role dashboards
- Owner dashboard, pending decisions, fairness, negative report, retention signals, and contextual AI Ask box.
- HR dashboard, programme manager, data health, budget and wallets, compliance centre, campaigns, and anti-gaming alerts.
- Manager dashboard, team leaderboard, wallet and “Recognise now”, approvals, unrecognised team members, and metric trends.
- Employee home, points wallet, recognitions, tracking, reward catalogue, redemption detail, shoutout, notification preferences, and language selection.

### 3. Performance boards
- Board list and create-from-template/blank/AI entry.
- Board configuration for source mode, scope, tracking, metrics, scorecard, targets, rules, comparison policy, and visibility.
- Native capture form builder with field palette, configuration, reordering, and mobile/WhatsApp previews.
- Native-entry approval queue, scorecard editor, target setting, behaviour-rule list/editor, comparison policy preview, and employee/manager board previews.

### 4. Workflow automation
- Workflow list with filters, status, versions, and run summaries.
- Three-panel visual workflow builder with an interactive step palette, connected canvas, selectable nodes, and configuration panel.
- Trigger, scope, metric, approval, reward, budget, and policy configurations.
- Validation report with V1–V14 pass/warning/error states.
- Dry-run report with periods, winners, costs, budget status, fairness, unmatched records, cap hits, and version differences.
- Version history, run history, and per-employee decision trace.

### 5. Connectors and data
- Connector list, data-health overview, and add-connector gallery.
- Simulated setup paths for CSV/Excel, Google Sheets, Zoho CRM/Bigin, email ingestion, and webhook.
- Field-mapping workspace with suggestions, confidence, transforms, identity mapping, deduplication, filters, and preview.
- Identity-resolution queue with candidates and impact confirmation.
- Field registry and schema-drift alert screens.

### 6. Rewards, fulfilment, and payroll
- Admin reward catalogue, add/edit item, offline reward record, and redemption status tracker.
- Employee catalogue browsing, item details, confirmation, OTP, processing, success, failure, and history states.
- Payroll export flow with period/system selection, preview, validation, CSV-ready completion, and export history.

### 7. Analytics and fairness
- Recognition coverage, spend per FTE, budget utilisation, redemption rate, concentration/Gini, manager spread, equity cuts, negative report, and performance lift.
- Shared report filters, Indian-formatted values, chart/table switching, accessible chart summaries, comparison periods, and export affordances.

### 8. Compliance and settings
- Organisation profile; roles and permissions; privacy notice builder; consent records; data-principal request queue; retention settings; notification templates; WhatsApp templates; audit log; billing and plan.
- DPDP flows for multilingual notices, consent evidence, access/correction/erasure/grievance requests, SLA progress, and retention schedules.

### 9. AI Copilot
- Full-page desktop and mobile chat with sessions, new-session flow, transcript export, context/permission indicator, quick actions, timestamps, loading stages, and simulated responses.
- Complete proposal card including assumptions, questions, definition preview, V1–V14 validation, dry-run, fairness, unmatched records, budget/tax impact, permissions, and confirmation actions.
- Interactive examples for workflow creation, leaderboard explanation, analytics Q&A, and setup guidance.
- Clear refusal, permission, unsupported request, timeout, validation, and dry-run error states. AI will only propose; every state-changing action requires simulated human confirmation.

### 10. Frontline and kiosk
- Interactive WhatsApp phone simulator for JOIN, recognition notification, BALANCE, REDEEM handoff, THANKS, language switching, and STOP.
- Kiosk presentation mode using read-only, auto-rotating leaderboard and recognition views suitable for factory/store displays.

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
- Use Tailwind CSS v4 semantic tokens, shadcn/Radix primitives, React Query-compatible mock services, Zustand for prototype-only client state, Recharts for reports, and an established React flow/canvas library for the DAG editor.
- The implementation is frontend-only: authentication, connectors, AI, WhatsApp delivery, OTP, ledger, exports, and compliance operations will be realistic simulations rather than live services.
- The requested deliverable is the working web prototype. Figma files, a production backend, live integrations, and real message/payment delivery are outside this phase.
