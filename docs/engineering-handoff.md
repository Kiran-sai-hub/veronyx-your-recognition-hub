# Engineering handoff

What the prototype is, how it is built, and what a production team replaces. Product source of
truth: `docs/veronyx-recognise-ui-flow-checklist.md`; coverage: `docs/checklist-coverage-matrix.md`.

## Run it

```bash
npm install            # or bun install
npm run dev            # Vite dev server (TanStack Start)
npx tsc --noEmit -p .  # type-check (strict, exactOptionalPropertyTypes)
npx eslint src         # lint (prettier enforced)
npx vitest run         # unit tests for the pure rules (validation, payroll, budget, copilot…)
npx vite build         # production build (service worker is registered only in production)
```

## Stack

TanStack Start + Router (file routes in `src/routes`), React 19, Tailwind v4 tokens
(`src/styles.css`), shadcn/ui on Radix (`src/components/ui`), lucide icons, Recharts, Sonner toasts,
Zustand stores. The live “Evidence Q&A” uses the AI SDK through `/api/insights` (Lovable AI
gateway); everything else is deterministic prototype logic.

## Structure

| Path                                                            | What lives there                                                                                                                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/routes/*`                                                  | Route files only: URL, `head`, `validateSearch`, reading stores, passing props. The only place TanStack Router APIs are used.                                            |
| `src/components/*-page.tsx`                                     | Screens. Router-agnostic, prop-driven; navigate with `<a href>` or `go()` (`src/lib/navigate.ts`).                                                                       |
| `src/components/library/*`                                      | Checklist §7 components (date pickers, data table, timeline, kanban, JSON/diff viewers, formula editor, stepper, circular progress, segmented control, pull to refresh). |
| `src/components/ui/*`                                           | shadcn primitives.                                                                                                                                                       |
| `src/lib/*-data.ts`                                             | Typed prototype data — the seam for real APIs.                                                                                                                           |
| `src/lib/workflow-model.ts`                                     | Workflow definition types, step catalogue, V1–V14 validation, auto-fixes, dry-run simulator.                                                                             |
| `src/lib/copilot-engine.ts`                                     | Scripted Copilot intents, guardrails, language detection, injection detection.                                                                                           |
| `src/lib/insights-evidence.ts`                                  | Deterministic tool results that the live AI must cite.                                                                                                                   |
| `src/store/app-store.ts`                                        | Persona, theme, language, accessibility preferences, Copilot open state.                                                                                                 |
| `src/store/demo-store.ts`                                       | Demo state that survives navigation (decisions, workflows, redemptions, audit events, payroll exports). Reset from the profile menu.                                     |
| `src/store/status-store.ts`                                     | Transient offline / session-timeout state.                                                                                                                               |
| `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*` | PWA.                                                                                                                                                                     |

### Rules the codebase follows (from `AGENTS.md`)

- Components stay router-agnostic and prop-driven so they can move to Next.js.
- Prototype data stays in typed modules so live integrations can replace it without touching screens.
- One AI Copilot, opened from the shell with `openCopilot(prompt)`; every AI entry point has a
  manual path; Copilot is only for Owner and HR Admin.
- A route that gains a child route becomes a pure `<Outlet />` layout; its page moves to `*.index.tsx`.
- Insights AI answers only from `insights-evidence.ts` tool results and must cite evidence ids.

## Roles and permissions

`src/lib/navigation.ts` holds the checklist §1.3 matrix: `accessFor(path, persona)` returns
`full`, `view` or `none`; `AppShell` shows a permission screen or a “View only” banner. Managers get
team-scoped props (e.g. `team="Sales A"`, `ownPoolId`). Replace persona switching with real auth
claims; keep the same matrix.

## Replacing mocks with services

| Prototype module                                                  | Becomes                                                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `approvals-data.ts`                                               | Approvals API (queue, evidence, decision trace, chain state, decide/undo)                                     |
| `workflow-model.ts` (`simulateDryRun`)                            | Workflow engine dry-run endpoint; keep validation client-side for instant feedback                            |
| `phase2-data.ts` (connectors, budget, payroll, catalogue, orders) | Connector service, ledger service, payroll export job, catalogue/fulfilment provider                          |
| `phase3-data.ts` (fairness, compliance, campaigns, settings)      | Analytics service, DPDP service, audit log (hash-chained), campaign service, settings                         |
| `mapping-data.ts`, `import-data.ts`                               | Field registry, mapping versions, identity resolution service, import jobs                                    |
| `employee-data.ts`, `mock-data.ts`                                | People directory, wallet, redemption, catalogue                                                               |
| `whatsapp-bot.ts`                                                 | WhatsApp Business webhook handler + template sender                                                           |
| `copilot-engine.ts`                                               | Agent with tools (validate, dry-run, explain, query metrics) — keep guardrails and the proposal-card contract |
| `demo-store.ts`                                                   | Server state (React Query) + optimistic updates                                                               |

## Accessibility and quality gates

- axe-core: 0 violations on all routes, light and dark (`docs/design/accessibility-audit.md`).
- No horizontal overflow at 390 px and 768 px on any route; no console errors.
- Unit tests cover validation, payroll checks and file names, budget moves and forecasts,
  copilot guardrails, language detection and injection detection, WhatsApp bot commands.

## Design references

`/design-system` (live), `docs/design/design-tokens.md`, `docs/design/iconography-and-illustrations.md`,
`docs/design/responsive-dark-motion.md`, `docs/design/multi-language-layout.md`.
