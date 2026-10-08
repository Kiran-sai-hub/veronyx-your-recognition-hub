# Checklist coverage matrix

Every item in `docs/veronyx-recognise-ui-flow-checklist.md`, its status in the prototype, and
where to see it. Checked on 08/10/2026 against branch `claude/inspiring-mendel-qfkx1b`.

**How to look:** sign in at `/login` and pick a role under _Demo: explore as_, or switch role with
**As …** in the top bar. The profile menu (bottom-left) has demo controls: New organisation
(empty states), AI available, Simulate offline / API error / session timeout, Reset demo data.

| Status | Meaning                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------- |
| ✅     | Built and working in the prototype (with prototype data)                                       |
| 🧪     | UI flow complete; the external action is simulated (nothing is really sent, paid or connected) |
| 🟡     | Partly built — the gap is stated                                                               |
| ➖     | Not a screen/feature (a design-tool deliverable or a question) — see the note                  |

Figma wireframes/mock-ups were explicitly out of scope for this pass (agreed with the product
owner). Languages: Hindi and Tamil are translated; the other six fall back to English (agreed).

---

## 1. Global UI structure & navigation

### 1.1 Platform surfaces

| Item                                                    | Status | Where / how to see                                                                     |
| ------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| Web app (desktop) — Owner, HR, Manager                  | ✅     | Any admin route, ≥ 1024 px                                                             |
| Web app (mobile web) — all users                        | ✅     | Any route at < 768 px: hamburger + bottom nav                                          |
| PWA — employee, installable, offline shell              | ✅     | `/me` install banner; `public/manifest.webmanifest`, `public/sw.js` (production build) |
| WhatsApp bot — frontline, no install, regional language | 🧪     | `/whatsapp` simulator (JOIN, 1/2, BALANCE, REDEEM, THANKS, LANG, STOP, voice note)     |
| Kiosk mode (v1) — TV dashboard, auto-rotate             | ✅     | `/kiosk` (10 s rotation, pause, reduced-motion aware)                                  |

### 1.2 Global navigation (desktop left sidebar)

| Item                                                                                                 | Status | Where / how to see                                                                            |
| ---------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| Product name + org name/logo                                                                         | ✅     | Sidebar header: Veronyx Recognise + “Radha Krishna Mills”                                     |
| 🏠 Dashboard                                                                                         | ✅     | Sidebar → Dashboard (Organisation / Team view)                                                |
| 📊 Performance Boards (canvas)                                                                       | ✅     | Sidebar → Performance Boards (Boards, Native capture & entries)                               |
| ⚡ Workflows                                                                                         | ✅     | Sidebar → Workflows (All workflows, Template marketplace)                                     |
| ✅ Approvals with count badge                                                                        | ✅     | Sidebar → Approvals (red badge, updates as you decide)                                        |
| 🎁 Rewards & Catalogue                                                                               | ✅     | Catalogue & orders, Payroll export, Campaigns                                                 |
| 👥 People & Teams                                                                                    | ✅     | `/people`                                                                                     |
| 🔌 Connectors & Data                                                                                 | ✅     | Sources & data health, Mapping & identity                                                     |
| 📈 Analytics & Fairness                                                                              | ✅     | Analytics, Fairness & coverage                                                                |
| 💰 Budget & Ledger                                                                                   | ✅     | `/budget`                                                                                     |
| 🤖 AI Copilot                                                                                        | ✅     | `/copilot` and the ✨ button (sheet; docked panel ≥ 1440 px)                                  |
| ⚙️ Settings → Org Profile, Roles & Permissions, Privacy & DPDP, Notification Templates, Integrations | ✅     | Settings sub-items (`/settings?tab=…`, `/compliance`)                                         |
| 🔔 Notifications                                                                                     | ✅     | Bell at the sidebar bottom (top bar on mobile/tablet): panel with read state                  |
| 👤 Profile menu                                                                                      | ✅     | Name at the sidebar bottom: preferences, employee app, demo controls, design system, sign out |

### 1.3 Role-based navigation visibility

| Nav item                                                         | Status | How to verify                                                                           |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| Dashboard (Org): Owner ✅ HR ✅ Manager ❌ Employee ❌           | ✅     | Switch role; manager opening `/dashboard/owner` sees “You don't have permission”        |
| Dashboard (Team): Owner, HR, Manager                             | ✅     | Dashboard → Team view; manager lands on `/dashboard/manager`                            |
| Dashboard (Self): Employee (+ WhatsApp)                          | ✅     | Employee lands on `/me`; WhatsApp BALANCE                                               |
| Performance Boards: Manager view own team                        | ✅     | Manager → Boards shows “View only” banner, no edit                                      |
| Workflows: Manager view own team                                 | ✅     | Manager → Workflows view-only; builder read-only                                        |
| Approvals: Owner, HR, Manager                                    | ✅     | Manager sees only Sales A items (“My approvals”)                                        |
| Rewards & Catalogue: Manager team view; Employee ✅; WhatsApp ✅ | ✅     | Manager → Rewards · Sales A (read-only, team orders); employee `/me/redeem`; bot REDEEM |
| People & Teams: Manager own team                                 | ✅     | Manager → People shows Sales A only                                                     |
| Connectors & Data: Owner, HR only                                | ✅     | Hidden for manager/employee; direct URL shows permission screen                         |
| Analytics & Fairness: Manager own team                           | ✅     | Manager → Fairness · Sales A (team distribution, missed, private follow-ups)            |
| Budget & Ledger: Manager own wallet                              | ✅     | Manager → “My budget” (Sales A — Vikram pool only)                                      |
| AI Copilot: Owner, HR only                                       | ✅     | ✨ button and nav item hidden for manager/employee                                      |
| Settings: Owner, HR only                                         | ✅     | Hidden for manager/employee                                                             |

---

## 2. Screen inventory

### 2.1 Authentication & onboarding

| #    | Screen                                                       | Status | Where                                                        |
| ---- | ------------------------------------------------------------ | ------ | ------------------------------------------------------------ |
| A-01 | Landing / login: email + password, Google SSO, Microsoft SSO | 🧪     | `/login` (SSO buttons simulated; demo role tiles)            |
| A-02 | OTP verification (WhatsApp/SMS)                              | 🧪     | `/login/otp` — resend timer, 3-attempt lockout (code 246810) |
| A-03 | First-time org setup wizard (multi-step)                     | ✅     | `/onboarding` — create account, then 5 steps with progress   |
| A-04 | Industry & team size selection                               | ✅     | `/onboarding` → Org profile (8 industries, 5 size bands)     |
| A-05 | Invite team members (email/WhatsApp)                         | ✅     | `/onboarding` → Invite team; Settings → Roles → Invite       |

### 2.2 Owner dashboard

| #    | Screen                                                               | Status | Where                                                                               |
| ---- | -------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| D-01 | Owner dashboard: pulse cards, pending decisions, team comparison     | ✅     | Owner → `/dashboard/owner`                                                          |
| D-02 | Pending decisions queue: one-tap approve/modify/reject with evidence | ✅     | Owner dashboard → Pending decisions; `/approvals`                                   |
| D-03 | Fairness panel: by dept/location/manager, Gini                       | ✅     | Owner dashboard fairness card; `/fairness` (equity cuts, manager spread, Gini 0.27) |
| D-04 | Negative report                                                      | ✅     | Owner dashboard; `/fairness?tab=negative`                                           |
| D-05 | Retention signals: recognition frequency vs exits                    | ✅     | Owner dashboard; `/fairness?tab=retention` (chart)                                  |
| D-06 | AI ask box                                                           | ✅     | Owner dashboard “Ask AI” box → opens Copilot (manual links beside it)               |

### 2.3 HR / admin dashboard

| #    | Screen                                                                | Status | Where                                                               |
| ---- | --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| H-01 | HR dashboard: programme health, data health, compliance               | ✅     | HR → `/dashboard/hr`                                                |
| H-02 | Programme manager: list, versions, run history                        | ✅     | `/workflows`, `/workflows/wf-sales/runs`                            |
| H-03 | Data health monitor: status, last sync, unmatched, drift              | ✅     | `/connectors`                                                       |
| H-04 | Budget & wallets: org → dept → manager, expiries, top-ups             | ✅     | `/budget` (tree, Top up, Allocate, expiries, forecast)              |
| H-05 | Compliance centre: tax tracker, payroll exports, DPDP status, consent | ✅     | `/compliance` (DPDP status, Tax tracker, Payroll exports, Consent…) |
| H-06 | Campaign manager: Diwali, anniversaries, birthdays, long service      | ✅     | `/campaigns`                                                        |
| H-07 | Anti-gaming alerts: reciprocal loops, spikes, self-dealing            | ✅     | `/fairness?tab=gaming` (hold / looks fine, undo)                    |

### 2.4 Manager

| #    | Screen                                                 | Status | Where                                                         |
| ---- | ------------------------------------------------------ | ------ | ------------------------------------------------------------- |
| M-01 | Manager home: team leaderboard, wallet, recognitions   | ✅     | Manager → `/dashboard/manager`                                |
| M-02 | Team leaderboard per workflow, configurable visibility | ✅     | Manager dashboard → leaderboard selector with visibility note |
| M-03 | Manager wallet: balance, cap usage, “Recognise now”    | ✅     | Manager dashboard wallet card → member picker                 |
| M-04 | My approvals with SLA timer                            | ✅     | Manager → `/approvals`                                        |
| M-05 | “Who haven't I recognised?”                            | ✅     | Manager dashboard; `/fairness` (manager) → Who is missed      |
| M-06 | Team metric trends                                     | ✅     | Manager dashboard trends chart                                |

### 2.5 Employee (PWA / mobile web)

| #    | Screen                                                     | Status | Where                                                                                                            |
| ---- | ---------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| E-01 | Home: points, expiring points, recent recognitions         | ✅     | Employee → `/me`                                                                                                 |
| E-02 | Points & wallet: balance by currency, redemption history   | ✅     | `/me/wallet`                                                                                                     |
| E-03 | My recognitions: received/given, badges, milestones        | ✅     | `/me/recognitions`                                                                                               |
| E-04 | “How I'm tracking”: metric, rule, rank, time left          | ✅     | `/me/tracking`                                                                                                   |
| E-05 | Redeem / catalogue: vouchers, UPI/cash, experiences        | ✅     | `/me/redeem`                                                                                                     |
| E-06 | Redemption detail: code, OTP gate, expiry, terms           | ✅     | `/me/redeem` → item → Redeem (OTP 246810)                                                                        |
| E-07 | Language toggle: en, hi, ta, te, kn, mr, bn, gu, ml        | 🟡     | `/me/preferences` — all 9 selectable; hi/ta translated, others fall back to English with a notice (agreed scope) |
| E-08 | Peer shoutout (THANKS)                                     | ✅     | `/me/shoutout`; WhatsApp THANKS                                                                                  |
| E-09 | Notification preferences: WhatsApp opt-in/out, quiet hours | ✅     | `/me/preferences`                                                                                                |

### 2.6 Performance canvas

| #    | Screen                                                 | Status | Where                                                                         |
| ---- | ------------------------------------------------------ | ------ | ----------------------------------------------------------------------------- |
| P-01 | Boards list with status, source mode                   | ✅     | `/boards`                                                                     |
| P-02 | Create board: template or blank                        | ✅     | `/boards` → New board (industry/role templates, blank)                        |
| P-03 | Board configuration: source, scope, metrics, scorecard | ✅     | `/boards/board-sales`                                                         |
| P-04 | Tracking configuration                                 | ✅     | Board → Tracking tab (external/native/hybrid)                                 |
| P-05 | Native capture form builder                            | ✅     | `/capture`                                                                    |
| P-06 | Native entry approval queue                            | ✅     | `/capture` → Entries to review                                                |
| P-07 | Scorecard editor                                       | ✅     | Board → Scorecard (weights, circular 100% check)                              |
| P-08 | Target setting                                         | ✅     | Board → Targets                                                               |
| P-09 | Behaviour rules list                                   | ✅     | Board → Behaviour rules                                                       |
| P-10 | Create/edit behaviour rule                             | ✅     | Board → Behaviour rules → New rule (5 steps)                                  |
| P-11 | Comparison policy editor                               | ✅     | Board → Comparison policy (six modes with preview)                            |
| P-12 | Visibility settings                                    | ✅     | Board → Comparison policy toggles; workflow Policies → leaderboard visibility |

### 2.7 Workflow builder

| #    | Screen                                          | Status | Where                                                                                |
| ---- | ----------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| W-01 | Workflow list: status, version, last run        | ✅     | `/workflows` (list or Kanban pipeline)                                               |
| W-02 | Builder canvas (DAG)                            | ✅     | `/workflows/wf-sales` (palette drag-drop, drag to reorder, connectors, branch lanes) |
| W-03 | Step configuration panel                        | ✅     | Click a step → right panel                                                           |
| W-04 | Trigger configuration                           | ✅     | “Starts when” → Event / Schedule / Manual                                            |
| W-05 | Scope configuration                             | ✅     | Scope panel                                                                          |
| W-06 | Metric selection: metrics, windows, grain       | ✅     | Aggregate / rank / threshold steps (window, grain)                                   |
| W-07 | Approval step: approvers, timeout, escalation   | ✅     | Approval step (+ multi-level chain)                                                  |
| W-08 | Reward step: amount, currency, recognition type | ✅     | Reward step (fixed or formula)                                                       |
| W-09 | Budget binding: wallet, hard-stop, per-run cap  | ✅     | Budget panel                                                                         |
| W-10 | Policies: caps, cooldowns, tax guard, unmatched | ✅     | Policies panel                                                                       |
| W-11 | Validation report V1–V14                        | ✅     | Validate button                                                                      |
| W-12 | Dry-run results                                 | ✅     | Run dry-run                                                                          |
| W-13 | Version history                                 | ✅     | `/workflows/wf-sales/runs` → Versions (compare diff, restore)                        |
| W-14 | Run history with step logs                      | ✅     | Runs tab (expand a run); Run now (progress)                                          |
| W-15 | Run detail / decision trace                     | ✅     | Explain a decision                                                                   |

### 2.8 Connectors & data

| #    | Screen                             | Status | Where                                                         |
| ---- | ---------------------------------- | ------ | ------------------------------------------------------------- |
| C-01 | Connectors list with status        | ✅     | `/connectors`                                                 |
| C-02 | Add connector: type, authenticate  | 🧪     | `/connectors` → Add source (5-step wizard per auth type)      |
| C-03 | CSV/Excel upload with mapping      | 🧪     | Gallery → CSV / Excel upload                                  |
| C-04 | Google Sheets link                 | 🧪     | Gallery → Google Sheets (OAuth or service account, sheet/tab) |
| C-05 | Zoho CRM / Bigin                   | 🧪     | Gallery → Zoho CRM (OAuth, modules)                           |
| C-06 | Email ingestion setup              | 🧪     | Gallery → Email inbox (forwarding address)                    |
| C-07 | Webhook setup: URL, secret, events | 🧪     | Gallery → Webhook                                             |
| C-08 | Field mapping wizard               | ✅     | `/connectors/mapping` → Field mapping                         |
| C-09 | Identity resolution queue          | ✅     | `/connectors/mapping?tab=identity`                            |
| C-10 | Field registry                     | ✅     | `/connectors/mapping?tab=registry`                            |
| C-11 | Schema drift alerts                | ✅     | `/connectors/mapping?tab=drift`; data health card             |

### 2.9 Rewards & fulfilment

| #    | Screen                                                           | Status | Where                                                                   |
| ---- | ---------------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| R-01 | Catalogue by category, provider                                  | ✅     | `/rewards` (grouped by category; provider/category/search filters)      |
| R-02 | Add/edit item: provider, SKU, denomination, tax nature           | ✅     | `/rewards` → Add item / Edit                                            |
| R-03 | Redemption flow: pick → hold → fulfil                            | 🧪     | Employee `/me/redeem` (provider order simulated, incl. failure + retry) |
| R-04 | Redemption status: Requested → Hold → Ordered → Fulfilled/Failed | ✅     | `/rewards` → Redemption status; employee wallet history                 |
| R-05 | Offline reward record                                            | ✅     | `/rewards` → Offline rewards                                            |
| R-06 | Payroll export                                                   | ✅     | `/payroll` (5 steps, CSV download)                                      |

### 2.10 Analytics & fairness

| #     | Screen                                             | Status | Where                                                                                 |
| ----- | -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| AN-01 | Recognition coverage 30/90 days                    | ✅     | `/analytics`                                                                          |
| AN-02 | Spend per FTE                                      | ✅     | `/analytics`                                                                          |
| AN-03 | Budget utilisation per pool                        | ✅     | `/analytics`; `/budget`                                                               |
| AN-04 | Redemption rate                                    | ✅     | `/analytics`                                                                          |
| AN-05 | Concentration / Gini, distribution charts          | ✅     | `/fairness?tab=distribution` (histogram, Lorenz curve)                                |
| AN-06 | Manager spread                                     | ✅     | `/fairness?tab=spread`                                                                |
| AN-07 | Equity cuts: dept, location, shift, tenure, gender | ✅     | `/fairness` → Equity cuts (gender only for consenting employees, small groups hidden) |
| AN-08 | Negative report                                    | ✅     | `/fairness?tab=negative`                                                              |
| AN-09 | Performance lift                                   | ✅     | `/analytics` → performance lift                                                       |

### 2.11 Settings & compliance

| #    | Screen                                                        | Status | Where                                             |
| ---- | ------------------------------------------------------------- | ------ | ------------------------------------------------- |
| S-01 | Org profile: legal name, GSTIN, Udyam, MSME, timezone         | ✅     | `/settings?tab=org` (format validation, autosave) |
| S-02 | Roles & permissions: list, matrix, assignments                | ✅     | `/settings?tab=roles`                             |
| S-03 | Privacy notice builder: multi-language, purposes, legal basis | ✅     | `/compliance?tab=notice`                          |
| S-04 | Consent records: per employee, per purpose, evidence          | ✅     | `/compliance?tab=consent`                         |
| S-05 | Data principal requests workflow                              | ✅     | `/compliance?tab=requests`                        |
| S-06 | Retention settings per data class                             | ✅     | `/compliance?tab=retention`                       |
| S-07 | Notification templates per locale                             | ✅     | `/settings?tab=notifications`                     |
| S-08 | WhatsApp template manager                                     | ✅     | `/settings?tab=whatsapp`                          |
| S-09 | Audit log viewer: hash-chained, filterable, exportable        | ✅     | `/compliance?tab=audit`                           |
| S-10 | Billing & plan                                                | ✅     | `/settings?tab=billing`                           |

---

## 3. User journeys

| Journey step                                                                                                     | Status | How to walk it                                                         |
| ---------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| **3.1 Owner** — Discover: sign up → industry & size                                                              | ✅     | `/onboarding` (create account → Org profile)                           |
| Setup: profile (GSTIN, Udyam, timezone), import, departments & teams, invite HR/managers, first source           | ✅     | `/onboarding` steps 1–5                                                |
| Configure: Copilot “Reward top 3 sales closers…”, review card (validation, dry-run 3 months), Confirm & Activate | ✅     | ✨ Copilot → type the request → proposal card                          |
| Configure: budget allocation per department                                                                      | ✅     | `/budget` → Allocate to departments                                    |
| Approve: pending decisions, evidence, one-tap approve / modify / reject                                          | ✅     | Owner dashboard → Pending decisions; `/approvals`                      |
| Monitor: pulse cards, team comparison, fairness, negative report                                                 | ✅     | `/dashboard/owner`                                                     |
| Optimise: analytics AN-01…09, adjust workflows, Copilot ideas                                                    | ✅     | `/analytics`, `/fairness`, `/workflows`, Copilot                       |
| **3.2 HR** — Onboard employees: upload, map, review errors, confirm                                              | ✅     | `/people` → Import employees                                           |
| Connect sources: add, authenticate, map, resolve identity                                                        | 🧪     | `/connectors` → Add source; `/connectors/mapping`                      |
| Manage programmes: activate/pause, run history, failures; data health, drift, unmatched                          | ✅     | `/workflows`, runs page, `/connectors`                                 |
| Export & comply: payroll, tax tracker, consent, privacy notice                                                   | ✅     | `/payroll`, `/compliance`                                              |
| **3.3 Manager** — Review: My approvals, SLA, evidence & trace                                                    | ✅     | Manager → `/approvals`                                                 |
| Approve / modify within limit / reject with note                                                                 | ✅     | Decision dialog (limit enforced with permission message)               |
| Recognise now: member, reason, amount within wallet                                                              | ✅     | Manager dashboard → Recognise now                                      |
| Monitor: leaderboard, who haven't I recognised, trends                                                           | ✅     | Manager dashboard                                                      |
| **3.4 Knowledge employee** — Track, receive, redeem (OTP, voucher), give                                         | ✅     | `/me/tracking`, notifications, `/me/redeem`, `/me/shoutout`            |
| **3.5 Frontline WhatsApp** — opt-in link/QR, JOIN, consent evidence                                              | 🧪     | `/whatsapp` → HR: send opt-in link → JOIN (log shows consent evidence) |
| Recognition push, reply 1 / 2                                                                                    | 🧪     | Send a recognition → 1, 2                                              |
| BALANCE → “Balance: 1,150 Coins. Expiring: 200 on 31 Mar.”                                                       | 🧪     | BALANCE                                                                |
| REDEEM → OTP-secured link → voucher via WhatsApp                                                                 | 🧪     | REDEEM; “Simulate: reward picked in app”                               |
| THANKS @Priya … → “Sent! Priya received your shoutout 🙌”                                                        | 🧪     | THANKS chip (or voice note)                                            |
| LANG hi → future messages in Hindi                                                                               | 🧪     | LANG hi                                                                |
| STOP → all messages suppressed                                                                                   | 🧪     | STOP, then Send a recognition → `suppressed_no_optin` in the log       |

---

## 4. Detailed UI workflows

### 4.1 Onboarding & org setup — `/onboarding`

| Step / items                                                                                                                                                                   | Status | Notes                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------- |
| 1 Sign up: email + password or Google/Microsoft SSO; optional email-domain check; redirect to wizard                                                                           | 🧪     | “Create your account” card; SSO simulated; personal domains blocked when the domain check is on |
| 2 Wizard with progress bar                                                                                                                                                     | ✅     | Stepper + progress, autosave indicator                                                          |
| 2a Org profile: legal name (required), display name, GSTIN (validated), Udyam, industry (8), size band (5), timezone (Asia/Kolkata), fiscal year start (April), default locale | ✅     | Inline validation                                                                               |
| 2b Departments (name, code), teams, managers (or skip), locations (office, plant, store, warehouse, field, remote)                                                             | ✅     | Add/remove inline                                                                               |
| 2c Import employees: CSV/Excel (template download → upload → map → validate → import), Google Sheet, manual entry                                                              | ✅     | Embedded import wizard (§4.2)                                                                   |
| 2d Invite HR (email), managers (email or WhatsApp), roles and scopes                                                                                                           | ✅     | Invite list                                                                                     |
| 2e First data source: CSV, Google Sheets, Zoho CRM, or skip                                                                                                                    | ✅     | Quick options + skip                                                                            |
| 3 Dashboard landing: empty-state owner dashboard with guided next steps                                                                                                        | ✅     | Finishing lands on the empty-state dashboard (“No workflows yet…”)                              |

### 4.2 Employee import — `/people` → Import employees

| Step / items                                                                                                                                                                 | Status | Notes                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------ |
| 1 Method: CSV/Excel, Google Sheet, manual                                                                                                                                    | ✅     |                                                  |
| 2 Upload: drag & drop / sheet URL; 50k rows / 20 MB validation; progress bar                                                                                                 | ✅     | Format and size errors shown with checklist copy |
| 3 Column mapping: header detect, 20-row preview, all canonical fields incl. whatsapp_e164 and custom; Indian parsing (DD/MM/YYYY, 1,00,000, ₹ stripping, +91); errors in red | ✅     |                                                  |
| 4 Identity: primary identifier, identity hint, dedup key                                                                                                                     | ✅     |                                                  |
| 5 Preview & validate: 20 rows, missing required / invalid email / duplicate code; “Fix in file” / “Map differently”                                                          | ✅     |                                                  |
| 6 Confirm: summary X / Y / Z, “Import valid rows”, progress                                                                                                                  | ✅     |                                                  |
| 7 Post-import: success count, link to identity queue, link to employee list                                                                                                  | ✅     | Toast “X employees imported successfully.”       |

### 4.3 Connector setup — `/connectors` → Add source

| Step / items                                                                                                                                          | Status | Notes                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| 1 Grid with icons; categories CRM, Helpdesk, HRIS, Sheets, Email, Webhook, Custom; auth type, sync mode, setup time                                   | ✅     | Category filter                                    |
| 2 Authenticate: OAuth redirect, API key validate, service account JSON / share sheet, file upload                                                     | 🧪     | Per-auth-type step, simulated                      |
| 3 Configure: objects/modules, polling interval, sync mode, advanced (rate limit, page size)                                                           | ✅     |                                                    |
| 4 Field mapping: discovered fields with type and samples, canonical mapping, identity hint, dedup expression, filter expression, save mapping version | ✅     |                                                    |
| 5 Test & preview: 5–10 sample records, mapped output, identity check, errors                                                                          | ✅     |                                                    |
| 6 Activate: first sync with progress → data health                                                                                                    | 🧪     | Toast “Connected to [source]. First sync started.” |

### 4.4 Field mapping wizard — `/connectors/mapping`

| Step / items                                                                                                            | Status | Notes                                  |
| ----------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------- |
| Layout: two panels, source fields ↔ canonical attributes                                                                | ✅     |                                        |
| 1 Auto-suggest with confidence (high/medium/low)                                                                        | ✅     |                                        |
| 2 Manual override: dropdown with search, sample values, transform expression, type validation, unmapped required in red | ✅     |                                        |
| 3 Identity field (email, phone, CRM user ID, code, name — name warns), match rate                                       | ✅     |                                        |
| 4 Dedup: suggested key or custom, preview                                                                               | ✅     |                                        |
| 5 Filter with condition builder                                                                                         | ✅     |                                        |
| 6 Preview 20 rows: resolved ✅ / unresolved ❌, type mismatches, error count                                            | ✅     | Scrollable, keyboard-focusable preview |
| 7 Save as version N, “Set as active”, audit entry                                                                       | ✅     |                                        |

### 4.5 Identity resolution — `/connectors/mapping?tab=identity`

| Step / items                                                                                            | Status | Notes                                                 |
| ------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| Entry from data health with badge count                                                                 | ✅     |                                                       |
| 1 Queue: identifier, source, time; sort blocking-first; filter by connector / identifier type           | ✅     |                                                       |
| 2 Detail: raw identifier, source record, fuzzy candidates with %, create-new option, blocking workflows | ✅     |                                                       |
| 3 Resolve: pick candidate, search manually, create new employee, ignore with reason                     | ✅     |                                                       |
| 4 Confirm: “Link X to Y?”, impact count, audit                                                          | ✅     | Conflict message “already linked to another employee” |
| 5 Re-run affected workflows prompt; toast “Linked successfully. N records updated.”                     | ✅     |                                                       |

### 4.6 Workflow builder — `/workflows/new`, `/workflows/wf-sales`

| Step / items                                                                                                                                                     | Status | Notes                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| Entry: New workflow, Copilot “Edit”, template library / marketplace “Use template”                                                                               | ✅     |                                                                  |
| Layout: palette · canvas (DAG) · config panel                                                                                                                    | ✅     | Read-only for managers                                           |
| 1 Start: blank, template, AI proposal                                                                                                                            | ✅     | `?template=`, `?from=ai`                                         |
| 2 Meta: name (required), description, owner, template ref, timezone, tags                                                                                        | ✅     |                                                                  |
| 3 Scope: departments, teams, locations (multi), employee filter, exclusions, statuses (active, notice), min tenure, ranking partition                            | ✅     |                                                                  |
| 4 Triggers: event (type, filter, debounce), schedule (cron, window, late-data grace), manual (roles, parameters); trigger nodes on top                           | ✅     |                                                                  |
| 5 Steps: filter, aggregate, rank, threshold, branch, approval, reward, recognise, badge, notify, wait, set_var, end; drag from palette; connectors; icon + label | ✅     | Existing nodes can be dragged to reorder                         |
| 6 Step config (rank, approval, reward, notify, branch) + “Next step”                                                                                             | ✅     | Approval adds multi-level chain; reward supports amount formulas |
| 7 Budget: wallet, currency, per-run max, per-period max, on insufficient (hard_stop / partial_by_rank / queue_for_approval), reserve on request                  | ✅     |                                                                  |
| 8 Policies: caps, cooldown, tax guard, unmatched handling, tie-break, leaderboard visibility, self-nomination, manager conflict                                  | ✅     |                                                                  |
| 9 Validate: V1–V14 with pass/warn/error, errors block save                                                                                                       | ✅     |                                                                  |
| 10 Dry-run: periods (default 3), progress                                                                                                                        | ✅     |                                                                  |
| 11 Save draft / Save & activate (needs validation + dry-run) / version++                                                                                         | ✅     |                                                                  |

### 4.7 Dry-run results — builder → Run dry-run

| Section                                                               | Status | Notes                                                                   |
| --------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| Summary bar: periods, total cost, budget OK, winners per period       | ✅     |                                                                         |
| Per-period table: period, winners (value), cost, notes                | ✅     |                                                                         |
| Fairness notes + distribution chart by team/location                  | ✅     |                                                                         |
| Unmatched records: count, list, link to identity queue                | ✅     |                                                                         |
| Cap hits                                                              | ✅     |                                                                         |
| Diff vs previous version with cost impact                             | ✅     |                                                                         |
| Actions: save draft, activate, edit, re-run with different parameters | ✅     | Failure state: “Dry-run failed for period X” + retry with fewer periods |

### 4.8 Approval queue — `/approvals`

| Step / items                                                                                                                                                                              | Status | Notes                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| Entry: dashboard queue, nav badge, notification deep link                                                                                                                                 | ✅     | Dashboard cards deep-link to `/approvals?id=…`; notifications open the queue |
| Layout: list → detail panel (sheet on mobile)                                                                                                                                             | ✅     |                                                                              |
| 1 List: workflow, employee + avatar, proposed action, SLA countdown, status (pending / escalated / auto_approved), elapsed; sort SLA / amount / workflow; filter workflow / team / status | ✅     | Swipe right/left on phones; pull to refresh                                  |
| 2 Detail: employee, amount, currency, reward kind, recognition type; evidence with source links; decision trace; source records; budget impact; tax impact with threshold warning         | ✅     | Multi-step chain timeline where applicable                                   |
| 3 Approve (note, confirm) · Modify (amount within limit, kind, note, confirm) · Reject (reason + note) · Escalate (target + note)                                                         | ✅     | Batch approve                                                                |
| 4 Toasts “Approved. Reward will be processed.”, “Approved 3 of 5. 2 pending.”; next item                                                                                                  | ✅     | Undo; exhausted pool → queued                                                |

### 4.9 Performance board creation — `/boards`

| Step / items                                                                                                              | Status | Notes                             |
| ------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------- |
| Entry: New board, Copilot, industry template                                                                              | ✅     |                                   |
| 1 Type: industry template (industry, role) pre-fills metrics/scorecard/targets/rules; blank; AI suggestion                | ✅     |                                   |
| 2 Config: name, type, source mode (external / native / hybrid), scope, status                                             | ✅     |                                   |
| 3 Tracking: external (connector, mapping, event type, identity policy), native (form, frequency, roles, approval), hybrid | ✅     |                                   |
| 4 Metrics & scorecard: catalogue or new, weight, target, min/max, direction; weighted preview; weights = 100 %            | ✅     | Circular progress shows the total |
| 5 Targets per employee/team/location/board; window; target + stretch; import from sheet                                   | ✅     |                                   |
| 6 Behaviour rules (see 4.11)                                                                                              | ✅     |                                   |
| 7 Comparison policy: six modes, names, photos, low performers (default no), team average, consent for public              | ✅     | Live preview per mode             |
| 8 Save draft, preview as employee/manager, activate                                                                       | ✅     |                                   |

### 4.10 Native capture form builder — `/capture`

| Step / items                                                                                                                                           | Status | Notes                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------ |
| 1 Basics: name, frequency (daily/weekly/monthly/event/shift), channel (web/mobile/WhatsApp/kiosk), linked board                                        | ✅     |                                            |
| 2 Fields: text, number, decimal, date, boolean, picklist, employee lookup, file/evidence; multi-language label, required, validation, default; reorder | ✅     | Hindi/Tamil labels                         |
| 3 Entry config: who can enter, approval required (default yes), evidence required, lock after window, edit history                                     | ✅     |                                            |
| 4 Preview: mobile, WhatsApp, test entry                                                                                                                | ✅     | Toast “Entry submitted. Pending approval.” |
| 5 Save, shareable link / WhatsApp number, notify supervisors                                                                                           | 🧪     | Link copy and notification simulated       |

### 4.11 Behaviour rules — board → Behaviour rules → New rule

| Step / items                                                                                                          | Status | Notes                            |
| --------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------- |
| 1 Name, 9 rule types, linked board/workflow                                                                           | ✅     |                                  |
| 2 Trigger (threshold, schedule, event, manual), condition builder, window                                             | ✅     |                                  |
| 3 Action (7 types), audience (employee private, manager, HR, team), template, cooldown                                | ✅     |                                  |
| 4 Privacy: private (default yes for poor performance), manager confirmation (default yes), improvement window, locale | ✅     |                                  |
| 5 Validate & test: syntax, dry-run, who/how many messages, no public exposure of low performers                       | ✅     | Public exposure is blocked       |
| 6 Save & activate                                                                                                     | ✅     | Toast “Rule created and active.” |

### 4.12 Reward redemption (employee) — `/me/redeem`

| Step / items                                                                                                                                       | Status | Notes                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------- |
| Entry: dashboard Redeem, WhatsApp REDEEM, notification                                                                                             | ✅     |                                              |
| 1 Balance by currency, expiring warning, history                                                                                                   | ✅     |                                              |
| 2 Catalogue: 6 categories; filters denomination/category/delivery; image, brand, points, face value, delivery; sort popular / points / new         | ✅     |                                              |
| 3 Item detail: terms, tax nature (non-cash / cash / meal), Redeem                                                                                  | ✅     |                                              |
| 4 Confirmation: “Redeem 300 points for …?”, tax impact, delivery method                                                                            | ✅     |                                              |
| 5 OTP: 6 digits, 3 attempts then lockout, resend                                                                                                   | ✅     | Demo OTP 246810                              |
| 6 Processing: “Processing your order…”, ledger hold visible, provider order                                                                        | 🧪     |                                              |
| 7 Delivery: code/link via WhatsApp/in-app/email, OTP-gated link, expiry; failure “Order failed. Points returned.”, support, retry; status tracking | 🧪     | Fuel gift card demonstrates the failure path |
| 8 Balance updated, history entry, rate your experience                                                                                             | ✅     |                                              |

### 4.13 Payroll export — `/payroll`

| Step / items                                                                                                                                                                                                     | Status | Notes                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------- |
| 1 Month & year, fiscal year context, target system (Keka, greytHR, RazorpayX, Zoho Payroll, Custom)                                                                                                              | ✅     | Column set per system                     |
| 2 Preview: employee code, component code, amount, tax nature (perquisite_noncash / cash_taxable / meal_voucher), reference run ID; totals (employees, non-cash, cash, breaches); filters department / tax nature | ✅     | Cards on phones                           |
| 3 Validate: missing codes, untagged rewards, threshold breaches, warnings                                                                                                                                        | ✅     | Inline fixes: tag tax nature, exclude row |
| 4 Generate CSV, processing indicator, download link, `payroll_export_YYYY_MM.csv`                                                                                                                                | ✅     | Real CSV download                         |
| 5 Audit entry, downloadable history, “Sent to payroll” toggle                                                                                                                                                    | ✅     | Audit visible in Compliance → Audit log   |

### 4.14 DPDP / privacy — `/compliance`

| Step / items                                                                                                                                                                                                               | Status | Notes                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------- |
| 1 Notice builder: create/edit, multi-language, five purposes with legal basis (legitimate_use_employment / consent), publish version, acknowledgements                                                                     | ✅     | Telugu shows the fallback warning; reminder action               |
| 2 Consent per employee & purpose: granted/withdrawn/acknowledged, channel (web, WhatsApp, paper), evidence (message ID, IP), captured at / withdrawn at; bulk WhatsApp opt-in campaign; withdrawal → immediate suppression | ✅     | Withdraw dialog; campaign dialog                                 |
| 3 Requests: access, correction, erasure, grievance, nomination; SLA timer; Received → Acknowledged → Processing → Responded → Closed, each step logged; data export for access; erasure confirmation                       | ✅     | Timeline per request; JSON export; type-the-code erasure confirm |
| 4 Retention per data class (raw 18 mo, canonical 3 y, ledger 8 y, audit 8 y), scheduled erasure with notice, manual override with reason                                                                                   | ✅     | Editable periods; override dialog                                |

---

## 5. AI agent UX

Copilot is one shell-level surface (sheet; docked right panel ≥ 1440 px; full page at `/copilot`)
for Owner and HR Admin. Turn AI off from the profile menu to see every manual path still working.
Try: “Reward top 2 support agents monthly by CSAT, min 50 tickets. ₹2,000 to #1, ₹1,000 to #2. My
approval needed.”

### 5.1 Interface and entry points

| Item                                                                        | Status | Where                                             |
| --------------------------------------------------------------------------- | ------ | ------------------------------------------------- |
| Header with close, chat area, proposal card, input with send, quick actions | ✅     | ✨ button in the top bar                          |
| Entry: global nav → full page                                               | ✅     | Sidebar → AI Copilot (`/copilot`)                 |
| Entry: owner dashboard “Ask” box (inline, contextual)                       | ✅     | `/dashboard/owner`                                |
| Entry: workflow builder “AI Assist” (pre-filled with workflow context)      | ✅     | `/workflows/wf-sales` → AI Assist                 |
| Entry: performance board “AI Setup”                                         | ✅     | `/boards` → AI Setup                              |
| Entry: empty state “Let AI help you set up”                                 | ✅     | Profile menu → New organisation → owner dashboard |

### 5.2 Proposal card

| Item                                                                   | Status | Where                                              |
| ---------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| Type label and unique ID                                               | ✅     | Card header “📋 Workflow Proposal · ID …”          |
| Summary, assumptions, questions with defaults                          | ✅     | Yes/No toggles with defaults                       |
| Definition preview (visual / collapsible JSON)                         | ✅     | “Definition preview” → Visual / JSON viewer        |
| Validation report (all V1–V14)                                         | ✅     | With Fix automatically, Ask AI to fix, Re-validate |
| Dry-run results per period with total and budget                       | ✅     | Period selector, progress, re-run                  |
| Fairness notes + distribution mini-chart                               | ✅     | In the dry-run section                             |
| Unmatched records + link to identity queue                             | ✅     | In the dry-run section                             |
| Actions: Confirm & Save Draft, Confirm & Activate, Edit, Reject        | ✅     | Reject asks for an optional reason                 |
| Required permission and “Audited as actor_type=user, ai_proposal_id=…” | ✅     | Card footer; entry appears in the audit log        |

### 5.3 AI UX checklist

| Item                                                                                                                       | Status | Where / notes                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| **A** User/AI message bubbles                                                                                              | ✅     |                                                                                                  |
| A Typing indicator                                                                                                         | ✅     | Three dots + step list                                                                           |
| A Message timestamps                                                                                                       | ✅     | IST times under each message                                                                     |
| A Session persistence across refresh                                                                                       | ✅     | Sessions stored locally (`copilot-store`)                                                        |
| A Session export (transcript)                                                                                              | ✅     | Export button (.txt)                                                                             |
| A Session start indicator                                                                                                  | ✅     | “Session started …”                                                                              |
| A New session                                                                                                              | ✅     | New session button; session list on `/copilot`                                                   |
| A Context scope indicator (RBAC)                                                                                           | ✅     | “Can see: Whole company (HR) · read-only”                                                        |
| **B** Multi-line free text                                                                                                 | ✅     | Shift+Enter for a new line                                                                       |
| B Quick actions: Explain this leaderboard, Why didn't X win?, Create a workflow for…, Show analytics for…, Help me set up… | ✅     | Chips under the input                                                                            |
| B Context-aware suggestions per screen                                                                                     | ✅     | “Suggested for this screen” changes per page                                                     |
| B Voice input (mobile, future)                                                                                             | ✅     | Mic button (browser speech recognition; demo transcription fallback)                             |
| B Multi-language input (en, hi, ta, te, kn, mr, bn, gu, ml)                                                                | 🟡     | Hindi and Tamil questions understood; other scripts detected with a helpful reply (agreed scope) |
| B Character limit indicator                                                                                                | ✅     | “n/500”                                                                                          |
| B Error for unsupported queries                                                                                            | ✅     | “I'm not sure I can answer that…” with suggestions                                               |
| **C** Plain-language summary first                                                                                         | ✅     |                                                                                                  |
| C Structured data in tables/cards                                                                                          | ✅     | Tables, charts and number cards                                                                  |
| C Expandable technical details                                                                                             | ✅     | “Show me the data”, definition preview                                                           |
| C Metric values with source attribution                                                                                    | ✅     | Metric + window + source on every number                                                         |
| C Links to underlying data                                                                                                 | ✅     | Source chips link to the screen holding the records                                              |
| C Confidence indicators                                                                                                    | ✅     | Shown when confidence is not high                                                                |
| C “I don't know” handling                                                                                                  | ✅     | e.g. ask about Chennai collections                                                               |
| C “I can't do that” with explanation and alternative                                                                       | ✅     | Refusals offer alternatives                                                                      |
| **D** All proposal card requirements                                                                                       | ✅     | See 5.2 above                                                                                    |
| D Budget impact, tax impact                                                                                                | ✅     | Card sections                                                                                    |
| **E** V1–V14 with ✅ / ⚠️ / ❌                                                                                             | ✅     |                                                                                                  |
| E Click for explanation, suggested fix                                                                                     | ✅     | Expandable rows                                                                                  |
| E Fix automatically, Re-validate                                                                                           | ✅     |                                                                                                  |
| **F** Period selector (default last 3)                                                                                     | ✅     | Builder dialog and proposal card                                                                 |
| F Per-period table (winners with value and rank, cost, notes)                                                              | ✅     |                                                                                                  |
| F Total cost, budget status                                                                                                | ✅     |                                                                                                  |
| F Fairness distribution chart                                                                                              | ✅     |                                                                                                  |
| F Cap hits                                                                                                                 | ✅     |                                                                                                  |
| F Unmatched count + link                                                                                                   | ✅     |                                                                                                  |
| F Diff vs previous version                                                                                                 | ✅     | When editing an existing workflow                                                                |
| F Re-run with different parameters                                                                                         | ✅     |                                                                                                  |
| **G** Employee selector, workflow/run selector                                                                             | ✅     | Runs page → Explain a decision                                                                   |
| G Decision trace: step pass/fail, values, failing condition, what was needed                                               | ✅     |                                                                                                  |
| G Plain-language explanation, source record links, “Show me the data”                                                      | ✅     |                                                                                                  |
| **H** Natural-language query                                                                                               | ✅     |                                                                                                  |
| H Formats: table, chart, number card, text                                                                                 | ✅     | e.g. “What is our redemption rate?” → number card                                                |
| H Metric attribution                                                                                                       | ✅     |                                                                                                  |
| H Show as chart / Show as table                                                                                            | ✅     |                                                                                                  |
| H Export CSV                                                                                                               | ✅     |                                                                                                  |
| H Ask follow-up suggestions                                                                                                | ✅     |                                                                                                  |
| **I** Protected attribute refusal with why and alternative                                                                 | ✅     | “compare recognition by gender”                                                                  |
| I Free-text judgement refusal                                                                                              | ✅     | “Is Ravi a lazy worker?”                                                                         |
| I Permission denied with needed permission and contact                                                                     | ✅     | As HR Admin ask “Show me the private follow-ups”                                                 |
| I Rate limit with reset time                                                                                               | ✅     | After 20 questions in a session                                                                  |
| I Prompt injection: connector content as data, silent, logged for admin                                                    | ✅     | Try “ignore previous instructions…”; see Compliance → Audit log → AI interactions                |
| **J** AI timeout: wait message, retry after 30 s, cancel                                                                   | ✅     | Include “slow” in a question                                                                     |
| J AI error: message, error code, retry                                                                                     | ✅     | Include “error” in a question                                                                    |
| J Validation failure: errors, fixes, Ask AI to fix                                                                         | ✅     |                                                                                                  |
| J Dry-run failure: failing period, details, retry with fewer periods                                                       | ✅     | Choose 6 periods on the proposal card                                                            |
| J Permission error: what is missing, who grants it                                                                         | ✅     |                                                                                                  |
| **K** Skeleton chat on load                                                                                                | ✅     |                                                                                                  |
| K Typing indicator                                                                                                         | ✅     |                                                                                                  |
| K Tool-call progress (“Checking connectors…”, “Running validation…”)                                                       | ✅     |                                                                                                  |
| K Dry-run progress bar with period count                                                                                   | ✅     |                                                                                                  |
| K Proposal steps: parsing intent → grounding → composing → validating → dry-run                                            | ✅     |                                                                                                  |
| K “This may take 30–60 seconds”                                                                                            | ✅     |                                                                                                  |
| **L** Keyboard navigation through the card                                                                                 | ✅     |                                                                                                  |
| L Screen-reader labels                                                                                                     | ✅     | axe: 0 violations                                                                                |
| L High contrast support                                                                                                    | ✅     | Preferences → High contrast                                                                      |
| L Focus moves to new content                                                                                               | ✅     | Newest answer receives focus                                                                     |
| L Loading announced                                                                                                        | ✅     | `aria-live`, `aria-busy`                                                                         |
| L Alt text for charts                                                                                                      | ✅     | Hidden text lists every value                                                                    |

### 5.4 Interaction patterns

| Pattern                                                                                                         | Status | How to try                                                                  |
| --------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| 1 Workflow creation (parse → ground → template → compose → validate → dry-run → card → confirm → toast + audit) | ✅     | The CSAT request above; missing metric: “Create a workflow for collections” |
| 2 Explain leaderboard / “Why didn't X win?” with trace and source link                                          | ✅     | Quick action “Why didn't X win?”                                            |
| 3 Analytics query with table, chart toggle, CSV                                                                 | ✅     | “Show coverage by department”                                               |
| 4 Setup guidance for a garment factory with start buttons                                                       | ✅     | “I run a garment factory. How do I start?”                                  |

### 5.5 Design principles

| Principle                       | Status | How it shows                                                               |
| ------------------------------- | ------ | -------------------------------------------------------------------------- |
| Reactive only (never initiates) | ✅     | Opens only when the user asks                                              |
| Propose, don't act              | ✅     | Every change needs Confirm                                                 |
| Never pays / approves / sends   | ✅     | Refuses “approve all” style requests                                       |
| Permission-scoped               | ✅     | Scope line; Owner/HR only                                                  |
| Cites evidence                  | ✅     | Metric, window, source on numeric answers; live Q&A cites evidence ids     |
| Transparent about limits        | ✅     | Refusals with alternatives                                                 |
| No hallucination (grounded)     | ✅     | Scripted on prototype data; live Q&A limited to `insights-evidence.ts`     |
| Repair loop visible             | ✅     | “🔁 Repair loop” line on the card                                          |
| Audit trail, exportable         | ✅     | Every question/proposal/refusal logged; audit log CSV export               |
| Cost awareness for admins       | ✅     | `/copilot` → “Usage (admins only)” tokens                                  |
| Graceful degradation            | ✅     | Profile menu → AI available off: AI buttons disappear, manual paths remain |

---

## 6. State design

### 6.1 Empty states (profile menu → New organisation)

| Screen                | Copy                                                                 | Status | Where                                                                   |
| --------------------- | -------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| Dashboard (Owner)     | “No workflows yet. Create your first workflow or let AI help.” + CTA | ✅     | `/dashboard/owner`                                                      |
| Workflow list         | “No workflows. Start from a template or use AI Copilot.” + CTA       | ✅     | `/workflows`                                                            |
| Performance boards    | “No boards yet. Create a board to start tracking.” + CTA             | ✅     | `/boards`                                                               |
| Approvals queue       | “No pending approvals. You're all caught up! 🎉”                     | ✅     | `/approvals`                                                            |
| Connector list        | “No sources connected. Connect your first data source.” + CTA        | ✅     | `/connectors`                                                           |
| Identity queue        | “No unmatched records. Great job! ✅”                                | ✅     | `/connectors/mapping?tab=identity` (after resolving all)                |
| Employee list         | “No employees yet. Import your team.” + CTA                          | ✅     | `/people`                                                               |
| Reward catalogue      | “No rewards configured. Add items or connect an aggregator.” + CTA   | ✅     | `/rewards`                                                              |
| Analytics             | “Not enough data yet. Activate a workflow to start collecting.”      | ✅     | `/analytics`                                                            |
| Notifications         | “No notifications yet.”                                              | ✅     | Bell panel                                                              |
| AI chat (new session) | “Hi! I can help you create workflows…” + quick actions               | ✅     | New Copilot session (Hindi/Tamil greeting when that language is chosen) |

### 6.2 Loading states

| Component                                       | Status | Where                                            |
| ----------------------------------------------- | ------ | ------------------------------------------------ |
| Page load skeleton                              | ✅     | Every app page shows a matching skeleton briefly |
| Table rows skeleton                             | ✅     | Approvals → Refresh                              |
| Chart skeleton                                  | ✅     | `/analytics` on load                             |
| Dashboard cards skeleton                        | ✅     | Page skeleton includes card blocks               |
| AI typing indicator                             | ✅     | Copilot                                          |
| Dry-run progress with step labels               | ✅     | Builder dry-run; proposal card                   |
| File upload progress %                          | ✅     | Employee import upload                           |
| Connector sync spinner + “Syncing…” + last sync | ✅     | `/connectors` → Sync now                         |
| Workflow run progress with current step         | ✅     | Runs page → Run now (test period)                |
| Redemption “Processing your order…”             | ✅     | Employee redemption                              |

### 6.3 Error states

| Scenario                                                            | Status | How to see                                                        |
| ------------------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| API error: toast + retry, “Something went wrong. Please try again.” | ✅     | Profile menu → Simulate an API error                              |
| Validation error: red border + message                              | ✅     | Any form (e.g. Settings → GSTIN)                                  |
| File upload error: size / format                                    | ✅     | Import → upload a wrong file                                      |
| Connector auth failure + reconnect                                  | ✅     | `/connectors` → Zoho CRM card                                     |
| Identity conflict                                                   | ✅     | Identity queue → link an already-linked identifier                |
| Budget insufficient “Remaining ₹X. Required ₹Y.”                    | ✅     | `/budget` → Top up a manager pool beyond its parent; `/campaigns` |
| Permission denied                                                   | ✅     | Direct URL to a restricted screen; manager modifying above limit  |
| AI timeout                                                          | ✅     | Copilot question containing “slow”                                |
| Workflow validation failure with fixes                              | ✅     | Builder → Validate                                                |
| Dry-run failure for period X                                        | ✅     | Proposal card → 6 periods                                         |
| Network offline banner                                              | ✅     | Profile menu → Simulate offline (or disconnect)                   |
| Session expired                                                     | ✅     | Profile menu → Simulate session timeout → wait 60 s or sign out   |

### 6.4 Success states

| Action                                                           | Status | Where                   |
| ---------------------------------------------------------------- | ------ | ----------------------- |
| Workflow activated — “First run scheduled for [date]”            | ✅     | Builder / list / Kanban |
| Approval — “Approved. Reward will be processed.”                 | ✅     | `/approvals`            |
| Employees imported — “X employees imported successfully.”        | ✅     | Import wizard           |
| Connector — “Connected to [source]. First sync started.”         | ✅     | Connector wizard        |
| Identity — “Linked successfully. X records updated.”             | ✅     | Identity queue          |
| Redemption full-screen “🎉 Redemption successful!…”              | ✅     | Employee redemption     |
| AI proposal — “Workflow saved as draft.” / “Workflow activated.” | ✅     | Proposal card           |
| Native entry — “Entry submitted. Pending approval.”              | ✅     | `/capture` → test entry |
| Behaviour rule — “Rule created and active.”                      | ✅     | Board → Behaviour rules |

### 6.5 Edge cases

| Scenario                                                   | Status | Where                                                                   |
| ---------------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| Concurrent editing — “modified by [user]. Please refresh.” | ✅     | Builder (simulated conflict banner)                                     |
| Run in progress while editing                              | ✅     | Builder banner for live workflows                                       |
| Employee exits mid-workflow — excluded, shown in summary   | ✅     | Runs page step log                                                      |
| Budget exhausted mid-approval — queued                     | ✅     | Approve a Manufacturing B item                                          |
| Schema change — pause, alert, drift details                | ✅     | `/connectors` sales file card; Mapping → Schema drift                   |
| Duplicate import — skip, show count                        | ✅     | Import wizard                                                           |
| WhatsApp to non-opted-in — `suppressed_no_optin`           | ✅     | `/whatsapp` → Send a recognition before JOIN                            |
| AI proposal for missing metric                             | ✅     | Copilot “Create a workflow for collections”                             |
| Dry-run with no history                                    | ✅     | Builder with an unconnected metric                                      |
| Multi-language template missing — English + admin warning  | ✅     | Settings → Notification Templates; Compliance → Privacy notice (Telugu) |

---

## 7. Component library

All components are live on `/design-system` (Core components, Domain components).

| Component                  | Variants required                                                     | Status | Used in                                         |
| -------------------------- | --------------------------------------------------------------------- | ------ | ----------------------------------------------- |
| Button                     | Primary, Secondary, Ghost, Danger, Link · SM, MD, LG                  | ✅     | Everywhere                                      |
| Input                      | Text, Number, Email, Phone, Password, Textarea · label, helper, error | ✅     | Forms                                           |
| Select                     | Single, Multi, Searchable, Grouped                                    | ✅     | Campaign audience (multi, grouped), filters     |
| Date picker                | Single, Range · DD/MM/YYYY                                            | ✅     | Offline rewards, campaigns, audit log           |
| Table                      | Sortable, Filterable, Paginated, Expandable                           | ✅     | Audit log (`DataTable`), people                 |
| Card                       | Info, Stat, Action, Proposal                                          | ✅     | Dashboards, Copilot                             |
| Modal                      | Confirm, Form, Info, Error                                            | ✅     | Approvals, compliance, rewards                  |
| Toast                      | Success, Error, Warning, Info                                         | ✅     | Everywhere                                      |
| Badge                      | Status, Count, Label                                                  | ✅     | Everywhere                                      |
| Tabs                       | Horizontal, Vertical                                                  | ✅     | Settings, compliance; vertical on design system |
| Stepper                    | Horizontal, Vertical                                                  | ✅     | Payroll, onboarding, import                     |
| Progress                   | Bar, Circular, Step                                                   | ✅     | Uploads, dry-runs, scorecard weights            |
| Skeleton                   | Text, Card, Table, Chart                                              | ✅     | Page loads                                      |
| Empty state                | Illustration + CTA                                                    | ✅     | Per screen (§6.1)                               |
| Tooltip                    | Info, Help                                                            | ✅     | Top bar, rail, fields                           |
| Dropdown menu              | Action, Navigation                                                    | ✅     | Row actions, profile                            |
| Avatar                     | User, Team, Org                                                       | ✅     | Approvals, people, brand                        |
| Chart                      | Line, Bar, Pie, Distribution, Gini                                    | ✅     | Dashboards, analytics, fairness                 |
| Timeline                   | Vertical                                                              | ✅     | Data requests, approval chains                  |
| Kanban                     | Columns, Cards                                                        | ✅     | `/workflows` → Pipeline (Kanban)                |
| DAG canvas                 | Nodes, Edges, Drag-drop                                               | ✅     | Workflow builder                                |
| Condition builder          | Field + operator + value                                              | ✅     | Workflow scope, mapping filter, behaviour rules |
| Formula editor             | Syntax highlight, validation                                          | ✅     | Reward step → Amount type: formula              |
| JSON viewer                | Collapsible, highlighted                                              | ✅     | Proposal definition, live workflow definition   |
| Diff viewer                | Side-by-side, inline                                                  | ✅     | Runs page → Versions → Compare with live        |
| Workflow step node         | Icon + label + status                                                 | ✅     | Builder                                         |
| Approval card              | Info, action, evidence, SLA, buttons                                  | ✅     | `/approvals`                                    |
| Proposal card              | Summary, validation, dry-run, actions                                 | ✅     | Copilot                                         |
| Decision trace             | Expandable pass/fail                                                  | ✅     | Approvals, runs, Copilot                        |
| Metric card                | Name, value, window, source, trend                                    | ✅     | Analytics, Copilot number card                  |
| Leaderboard row            | Rank, person, value, badge, visibility-aware                          | ✅     | Manager dashboard, kiosk, employee tracking     |
| Budget pool card           | Allocated, used, remaining, bar                                       | ✅     | `/budget`                                       |
| Tax tracker row            | Employee, cumulative, threshold, status                               | ✅     | Compliance → Tax tracker                        |
| Connector status card      | Status, last sync, error, reconnect                                   | ✅     | `/connectors`                                   |
| Identity match card        | Identifier, candidates with confidence, confirm/ignore                | ✅     | Identity queue                                  |
| Native entry form          | Dynamic, mobile-optimised                                             | ✅     | Capture preview / test entry                    |
| Scorecard editor           | Weighted metrics, drag to reorder                                     | ✅     | Board → Scorecard                               |
| Comparison policy selector | Radio with preview                                                    | ✅     | Board → Comparison policy                       |
| Behaviour rule card        | Trigger, condition, action, status, privacy                           | ✅     | Board → Behaviour rules                         |

---

## 8. Responsive & language

### 8.1 Breakpoints

| Breakpoint                                             | Status | How to see                                 |
| ------------------------------------------------------ | ------ | ------------------------------------------ |
| Mobile < 768: single column, bottom nav, hamburger     | ✅     | Narrow the window                          |
| Tablet 768–1024: two columns, collapsible sidebar      | ✅     | Icon rail with “Expand menu”               |
| Desktop 1024–1440: sidebar + content                   | ✅     |                                            |
| Large > 1440: sidebar + content + optional right panel | ✅     | Open Copilot ≥ 1440 px: docks on the right |

### 8.2 Mobile

| Item                                                | Status | Where                                                   |
| --------------------------------------------------- | ------ | ------------------------------------------------------- |
| Bottom nav (Dashboard, Approvals, Rewards, Profile) | ✅     | Phones                                                  |
| Swipe right = approve, left = reject                | ✅     | `/approvals` on a touch screen                          |
| Pull to refresh                                     | ✅     | Approvals, recognitions                                 |
| Tap targets ≥ 44 px                                 | ✅     |                                                         |
| Card layouts instead of tables                      | ✅     | Payroll preview, approvals, workflows (cards on phones) |
| WhatsApp deep links                                 | ✅     | Employee home “Get updates on WhatsApp” (`wa.me`)       |
| PWA install prompt                                  | ✅     | Employee home on a phone                                |
| Offline-capable shell                               | ✅     | Service worker (production build) + offline banner      |
| Camera for evidence                                 | ✅     | Capture forms, Preferences → Open camera                |

### 8.3 Multi-language

| Item                                                 | Status | Notes                                                                       |
| ---------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| Supported: en, hi, ta, te, kn, mr, bn, gu, ml        | 🟡     | All selectable; hi + ta translated; others fall back with a notice (agreed) |
| Per-user toggle, remembered                          | ✅     | Preferences                                                                 |
| RTL not required                                     | ➖     | All LTR                                                                     |
| Fonts for all scripts                                | ✅     | Noto Sans families loaded                                                   |
| Indian numbers, DD/MM/YYYY, ₹                        | ✅     | Format helpers used across screens                                          |
| WhatsApp templates per language                      | ✅     | Settings → WhatsApp templates                                               |
| Email templates per language                         | ✅     | Settings → Notification Templates (per locale editor)                       |
| In-app notifications localised                       | 🟡     | Employee app strings in hi/ta; admin notifications English                  |
| AI responds in preferred language                    | 🟡     | Greeting localised; understands hi/ta; answers in English with a note       |
| Errors, validation, empty states, tooltips localised | 🟡     | Employee-facing copy in hi/ta; admin copy English                           |

### 8.4 Indian UX

| Item                                                 | Status                                    |
| ---------------------------------------------------- | ----------------------------------------- |
| Indian number formatting everywhere                  | ✅                                        |
| ₹ with spacing                                       | ✅                                        |
| DD/MM/YYYY default                                   | ✅                                        |
| IST display                                          | ✅                                        |
| Language names in their own script                   | ✅                                        |
| WhatsApp as primary frontline channel                | ✅                                        |
| OTP login without email                              | ✅                                        |
| Low-bandwidth: compressed/lazy images, low-data mode | ✅ (inline SVG, no photos; low-data mode) |
| Festival awareness in campaigns                      | ✅                                        |
| Fiscal year April–March                              | ✅                                        |
| GSTIN and Udyam in org setup                         | ✅                                        |

---

## 9. Accessibility & inclusion

Full report: `docs/design/accessibility-audit.md` (axe-core: 0 violations on 36 routes, light and dark).

| Item                                                                                                                                                                   | Status                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 9.1 Contrast, keyboard, focus, tab order, skip link, alt text, icon labels, form labels, error linking, headings, live regions, not colour alone, 200 % text, no traps | ✅                                  |
| 9.2 44 px targets, spacing, high contrast, reduced motion, adjustable text size                                                                                        | ✅                                  |
| 9.2 VoiceOver / NVDA tested                                                                                                                                            | 🟡 Needs real screen-reader testing |
| 9.3 Plain language, clear errors with fixes, consistent nav, progress indicators, confirm destructive actions, undo, auto-save, timeout warning                        | ✅                                  |
| 9.4 Large WhatsApp targets, voice messages, simple language, icons + text, regional language, low-data mode                                                            | ✅                                  |
| 9.4 Works on Android 8+                                                                                                                                                | 🟡 Needs device testing             |

---

## 10. Design tokens & theming

Documented in `docs/design/design-tokens.md` and `docs/design/iconography-and-illustrations.md`.

| Item                                                                                               | Status | Notes                                    |
| -------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------- |
| 10.1 Colour palette light + dark                                                                   | ✅     | Some values adjusted for AA (documented) |
| 10.2 Typography h1–mono                                                                            | ✅     |                                          |
| 10.3 Spacing scale                                                                                 | ✅     |                                          |
| 10.4 Radius sm/md/lg/full                                                                          | ✅     | 4 / 8 / 12 / 9999 px                     |
| 10.5 Shadows sm–xl                                                                                 | ✅     |                                          |
| 10.6 Consistent icon set; 20/24/32 px; outline vs filled active; domain icons; WhatsApp brand icon | ✅     |                                          |
| 10.7 Consistent, inclusive illustration set (factory, retail, office, field)                       | ✅     |                                          |

---

## Appendix A — priority matrix

| Priority | Screens                                                                                                                         | Status                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P0       | Login, org setup, import, dashboards (owner/manager/employee), builder, approvals, catalogue, redemption, WhatsApp bot, Copilot | ✅ (bot and SSO simulated)                                                                 |
| P1       | Connector setup, field mapping, identity, boards, native capture, behaviour rules, analytics                                    | ✅ (connections simulated)                                                                 |
| P2       | Fairness, negative report, anti-gaming, comparison policies, scorecard, targets, campaigns, DPDP centre                         | ✅                                                                                         |
| P3       | Kiosk, peer shoutout, multi-step approvals, budget forecasting, template marketplace                                            | ✅ (`/kiosk`, `/me/shoutout`, approval chains, `/budget` forecast, `/workflows/templates`) |

## Appendix B — deliverables

| Deliverable                                                                                                                                                                     | Status | Where                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Wireframes / hi-fi mock-ups (P0, P1; desktop + mobile)                                                                                                                          | ➖     | Out of scope for this pass (Figma); the working prototype covers every screen at desktop and mobile widths |
| Interactive prototype: onboarding, builder, approvals, Copilot, redemption, WhatsApp                                                                                            | ✅     | This app — see `docs/ui-audit-and-demo-guide.md`                                                           |
| Design system / component library                                                                                                                                               | ✅     | `/design-system` (code); Figma library out of scope                                                        |
| Design tokens document                                                                                                                                                          | ✅     | `docs/design/design-tokens.md`                                                                             |
| Icon set                                                                                                                                                                        | ✅     | `docs/design/iconography-and-illustrations.md`, `src/components/domain-icons.tsx`                          |
| Illustration set                                                                                                                                                                | ✅     | Same doc; `src/components/illustrations.tsx`                                                               |
| Multi-language layout specs                                                                                                                                                     | ✅     | `docs/design/multi-language-layout.md`                                                                     |
| Accessibility audit report                                                                                                                                                      | ✅     | `docs/design/accessibility-audit.md`                                                                       |
| Responsive breakpoint specs                                                                                                                                                     | ✅     | `docs/design/responsive-dark-motion.md`                                                                    |
| Dark mode specs                                                                                                                                                                 | ✅     | Same doc                                                                                                   |
| Motion / animation specs                                                                                                                                                        | ✅     | Same doc                                                                                                   |
| Handoff documentation                                                                                                                                                           | ✅     | `docs/engineering-handoff.md`                                                                              |
| AI UX: chat (desktop + mobile), proposal card states, validation, dry-run, trace, explain, Q&A formats, loading, errors, guardrails, quick actions, sessions, transcript export | ✅     | Copilot (sheet, docked panel, full page)                                                                   |

## Appendix C — open questions

Answered with stated assumptions in `docs/open-questions.md`.
