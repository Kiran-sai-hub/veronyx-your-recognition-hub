# Veronyx Recognise — Complete UI Flow, Workflows & AI UX Checklist

**Veronyx Internal Doc**
**Version:** 1.0
**Product:** Veronyx Recognise — Multi-Source Performance, Recognition & Rewards Platform for Indian SMEs

---

## TABLE OF CONTENTS

1. [Global UI Structure & Navigation](#1-global-ui-structure--navigation)
2. [Complete Screen Inventory](#2-complete-screen-inventory)
3. [User Journey Maps by Persona](#3-user-journey-maps-by-persona)
4. [Detailed UI Workflows](#4-detailed-ui-workflows)
5. [AI Agent UX — Full Workflow & Checklist](#5-ai-agent-ux--full-workflow--checklist)
6. [State Design Checklist](#6-state-design-checklist)
7. [Component Library Requirements](#7-component-library-requirements)
8. [Responsive & Language Requirements](#8-responsive--language-requirements)
9. [Accessibility & Inclusion Checklist](#9-accessibility--inclusion-checklist)
10. [Design Tokens & Theming](#10-design-tokens--theming)

---

## 1. GLOBAL UI STRUCTURE & NAVIGATION

### 1.1 Platform Surfaces

| Surface                  | User                  | Access                             |
| ------------------------ | --------------------- | ---------------------------------- |
| **Web App (Desktop)**    | Owner, HR, Manager    | Browser (Next.js)                  |
| **Web App (Mobile Web)** | All users             | Responsive browser                 |
| **PWA**                  | Employee              | Installable, offline-capable shell |
| **WhatsApp Bot**         | Frontline employee    | No app install, regional language  |
| **Kiosk Mode** _(v1)_    | Factory floor / store | TV dashboard, auto-rotate          |

### 1.2 Global Navigation (Desktop — Left Sidebar)

```
┌─────────────────────────────────────────────────┐
│  VERONYX RECOGNISE                              │
│  [Org Name / Logo]                              │
│                                                 │
│  🏠 Dashboard                                   │
│  📊 Performance Boards          ← NEW (Canvas)  │
│  ⚡ Workflows                                   │
│  ✅ Approvals                    [Badge: count]  │
│  🎁 Rewards & Catalogue                        │
│  👥 People & Teams                             │
│  🔌 Connectors & Data                          │
│  📈 Analytics & Fairness                       │
│  💰 Budget & Ledger                            │
│  🤖 AI Copilot                                 │
│  ⚙️ Settings                                   │
│     ├─ Org Profile                            │
│     ├─ Roles & Permissions                    │
│     ├─ Privacy & DPDP                         │
│     ├─ Notification Templates                 │
│     └─ Integrations                           │
│                                                 │
│  ─────────────────────────                      │
│  [🔔 Notifications]  [👤 Profile ▼]             │
└─────────────────────────────────────────────────┘
```

### 1.3 Role-Based Navigation Visibility

| Nav Item             | Owner | HR Admin |      Manager       | Employee | Frontline (WhatsApp) |
| -------------------- | :---: | :------: | :----------------: | :------: | :------------------: |
| Dashboard (Org)      |  ✅   |    ✅    |         ❌         |    ❌    |          ❌          |
| Dashboard (Team)     |  ✅   |    ✅    |         ✅         |    ❌    |          ❌          |
| Dashboard (Self)     |  ❌   |    ❌    |         ❌         |    ✅    |    ✅ (WhatsApp)     |
| Performance Boards   |  ✅   |    ✅    | 👁️ (view own team) |    ❌    |          ❌          |
| Workflows            |  ✅   |    ✅    | 👁️ (view own team) |    ❌    |          ❌          |
| Approvals            |  ✅   |    ✅    |         ✅         |    ❌    |          ❌          |
| Rewards & Catalogue  |  ✅   |    ✅    |   👁️ (team view)   |    ✅    |    ✅ (WhatsApp)     |
| People & Teams       |  ✅   |    ✅    |   👁️ (own team)    |    ❌    |          ❌          |
| Connectors & Data    |  ✅   |    ✅    |         ❌         |    ❌    |          ❌          |
| Analytics & Fairness |  ✅   |    ✅    |   👁️ (own team)    |    ❌    |          ❌          |
| Budget & Ledger      |  ✅   |    ✅    |  👁️ (own wallet)   |    ❌    |          ❌          |
| AI Copilot           |  ✅   |    ✅    |         ❌         |    ❌    |          ❌          |
| Settings             |  ✅   |    ✅    |         ❌         |    ❌    |          ❌          |

---

## 2. COMPLETE SCREEN INVENTORY

### 2.1 Authentication & Onboarding Screens

| #    | Screen                          | Purpose                                     |
| ---- | ------------------------------- | ------------------------------------------- |
| A-01 | Landing / Login                 | Email + password, Google SSO, Microsoft SSO |
| A-02 | OTP Verification (WhatsApp/SMS) | Frontline staff login without email         |
| A-03 | First-Time Org Setup Wizard     | Multi-step guided setup                     |
| A-04 | Industry & Team Size Selection  | Personalises templates and suggestions      |
| A-05 | Invite Team Members             | Email/WhatsApp invite for HR, Managers      |

### 2.2 Owner / Org Dashboard Screens

| #    | Screen                  | Purpose                                                 |
| ---- | ----------------------- | ------------------------------------------------------- |
| D-01 | Owner Dashboard (Home)  | Pulse cards, pending decisions, team comparison         |
| D-02 | Pending Decisions Queue | One-tap approve/modify/reject with evidence             |
| D-03 | Fairness Panel          | Distribution by dept/location/manager, Gini coefficient |
| D-04 | Negative Report         | Zero-recognition employees, teams without workflows     |
| D-05 | Retention Signals       | Recognition frequency vs exits                          |
| D-06 | AI Ask Box              | Natural language query interface                        |

### 2.3 HR / Admin Dashboard Screens

| #    | Screen              | Purpose                                                    |
| ---- | ------------------- | ---------------------------------------------------------- |
| H-01 | HR Dashboard (Home) | Programme health, data health, compliance                  |
| H-02 | Programme Manager   | Workflow list (draft/active/paused), versions, run history |
| H-03 | Data Health Monitor | Connector status, last sync, unmatched count, schema drift |
| H-04 | Budget & Wallets    | Org → dept → manager allocations, expiries, top-ups        |
| H-05 | Compliance Centre   | Tax tracker, payroll exports, DPDP status, consent records |
| H-06 | Campaign Manager    | Diwali, anniversaries, birthdays, long service             |
| H-07 | Anti-Gaming Alerts  | Reciprocal loops, spikes, self-dealing flags               |

### 2.4 Manager Dashboard Screens

| #    | Screen                      | Purpose                                    |
| ---- | --------------------------- | ------------------------------------------ |
| M-01 | Manager Dashboard (Home)    | Team leaderboard, wallet, recognitions     |
| M-02 | Team Leaderboard            | Per workflow, configurable visibility      |
| M-03 | Manager Wallet              | Balance, cap usage, "Recognise Now" button |
| M-04 | My Approvals                | Assigned approvals with SLA timer          |
| M-05 | "Who Haven't I Recognised?" | List of team members with zero recognition |
| M-06 | Team Metric Trends          | Charts from metrics layer                  |

### 2.5 Employee Screens (PWA / Mobile Web)

| #    | Screen                   | Purpose                                           |
| ---- | ------------------------ | ------------------------------------------------- |
| E-01 | Employee Home            | Points, expiring points, recent recognitions      |
| E-02 | My Points & Wallet       | Balance by currency, redemption history           |
| E-03 | My Recognitions          | Received and given, badges, milestones            |
| E-04 | "How I'm Tracking"       | Per workflow: metric value, rule, rank, time left |
| E-05 | Redeem / Catalogue       | Voucher catalogue, UPI/cash option, experiences   |
| E-06 | Redemption Detail        | Voucher code, OTP gate, expiry, terms             |
| E-07 | Language Toggle          | en, hi, ta, te, kn, mr, bn, gu, ml                |
| E-08 | Peer Shoutout (THANKS)   | Send recognition to colleague                     |
| E-09 | Notification Preferences | WhatsApp opt-in/out, quiet hours                  |

### 2.6 Performance Canvas Screens _(NEW — Bigin-like Builder)_

| #    | Screen                      | Purpose                                         |
| ---- | --------------------------- | ----------------------------------------------- |
| P-01 | Performance Boards List     | All boards with status, source mode             |
| P-02 | Create Performance Board    | Choose template or blank canvas                 |
| P-03 | Board Configuration         | Source, scope, metrics, scorecard               |
| P-04 | Tracking Configuration      | What to track, from which source, field mapping |
| P-05 | Native Capture Form Builder | Mobile/WhatsApp/supervisor entry forms          |
| P-06 | Native Entry Approval Queue | Review and approve manual entries               |
| P-07 | Scorecard Editor            | Weighted metrics per role/team                  |
| P-08 | Target Setting              | Employee/team/location goals per window         |
| P-09 | Behaviour Rules List        | All automation rules with status                |
| P-10 | Create/Edit Behaviour Rule  | Trigger → condition → action configuration      |
| P-11 | Comparison Policy Editor    | Leaderboard visibility, ranking modes           |
| P-12 | Visibility Settings         | Per workflow, per metric, per leaderboard       |

### 2.7 Workflow Builder Screens

| #    | Screen                      | Purpose                                         |
| ---- | --------------------------- | ----------------------------------------------- |
| W-01 | Workflow List               | All workflows with status, version, last run    |
| W-02 | Workflow Builder (Canvas)   | Visual DAG editor — Bigin-like                  |
| W-03 | Step Configuration Panel    | Side panel for selected step                    |
| W-04 | Trigger Configuration       | Event / Schedule / Manual trigger setup         |
| W-05 | Scope Configuration         | Departments, teams, locations, employee filters |
| W-06 | Metric Selection            | Pick metrics, windows, grain                    |
| W-07 | Approval Step Config        | Approvers, timeout, escalation                  |
| W-08 | Reward Step Config          | Amount, currency, recognition type              |
| W-09 | Budget Binding              | Wallet, hard-stop, per-run cap                  |
| W-10 | Policy Configuration        | Caps, cooldowns, tax guard, unmatched handling  |
| W-11 | Validation Report           | V1–V14 results with warnings/errors             |
| W-12 | Dry-Run Results             | Winners, cost, fairness, unmatched, diff        |
| W-13 | Version History             | All versions, activated/deactivated timestamps  |
| W-14 | Run History                 | All runs with status, summary, step logs        |
| W-15 | Run Detail / Decision Trace | Per-employee explanation of pass/fail           |

### 2.8 Connector & Data Screens

| #    | Screen                    | Purpose                                       |
| ---- | ------------------------- | --------------------------------------------- |
| C-01 | Connectors List           | All connected sources with status             |
| C-02 | Add Connector             | Choose type, authenticate                     |
| C-03 | CSV/Excel Upload          | File upload with mapping wizard               |
| C-04 | Google Sheets Link        | OAuth or service account, sheet/tab selection |
| C-05 | Zoho CRM / Bigin Connect  | OAuth, module selection                       |
| C-06 | Email Ingestion Setup     | Structured forwarding address                 |
| C-07 | Webhook Setup             | URL, secret, event types                      |
| C-08 | Field Mapping Wizard      | Map source fields → canonical schema          |
| C-09 | Identity Resolution Queue | Unmatched records, fuzzy candidates, confirm  |
| C-10 | Field Registry            | Discovered fields, types, samples             |
| C-11 | Schema Drift Alerts       | Renamed/moved columns, paused ingestion       |

### 2.9 Rewards & Fulfilment Screens

| #    | Screen                  | Purpose                                       |
| ---- | ----------------------- | --------------------------------------------- |
| R-01 | Reward Catalogue        | All items by category, provider               |
| R-02 | Add/Edit Catalogue Item | Provider, SKU, denomination, tax nature       |
| R-03 | Redemption Flow         | Employee picks item → hold → fulfil           |
| R-04 | Redemption Status       | Requested → Hold → Ordered → Fulfilled/Failed |
| R-05 | Offline Reward Record   | Manual entry for cash/gift given outside      |
| R-06 | Payroll Export          | Monthly CSV generation, download, history     |

### 2.10 Analytics & Fairness Screens

| #     | Screen               | Purpose                                       |
| ----- | -------------------- | --------------------------------------------- |
| AN-01 | Recognition Coverage | % recognised in 30/90 days                    |
| AN-02 | Spend per FTE        | ₹ fulfilled ÷ avg headcount                   |
| AN-03 | Budget Utilisation   | Used ÷ allocated per pool                     |
| AN-04 | Redemption Rate      | Points redeemed ÷ awarded                     |
| AN-05 | Concentration / Gini | Top-10% share, distribution charts            |
| AN-06 | Manager Spread       | Distinct recipients ÷ team size               |
| AN-07 | Equity Cuts          | By dept, location, shift, tenure, gender      |
| AN-08 | Negative Report      | Zero recognition, no workflows, no winners    |
| AN-09 | Performance Lift     | Metric trend before/after workflow activation |

### 2.11 Settings & Compliance Screens

| #    | Screen                    | Purpose                                                |
| ---- | ------------------------- | ------------------------------------------------------ |
| S-01 | Org Profile               | Legal name, GSTIN, Udyam, MSME category, timezone      |
| S-02 | Roles & Permissions       | Role list, permission matrix, assignments              |
| S-03 | Privacy Notice Builder    | Multi-language, purpose list, legal basis              |
| S-04 | Consent Records           | Per employee, per purpose, evidence                    |
| S-05 | Data Principal Requests   | Access/correction/erasure/grievance workflow           |
| S-06 | Retention Settings        | Per data class, configurable defaults                  |
| S-07 | Notification Templates    | WhatsApp, email, in-app; per locale                    |
| S-08 | WhatsApp Template Manager | Utility/Marketing/Auth categorisation, approval status |
| S-09 | Audit Log Viewer          | Hash-chained, filterable, exportable                   |
| S-10 | Billing & Plan            | Subscription, usage, invoices                          |

---

## 3. USER JOURNEY MAPS BY PERSONA

### 3.1 Owner / MD — Primary Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│  DISCOVER → SETUP → CONFIGURE → APPROVE → MONITOR → OPTIMISE       │
└─────────────────────────────────────────────────────────────────────┘

1. DISCOVER
   └─ Lands on marketing page / referred by peer
   └─ Signs up → Industry & team size selection (A-04)

2. SETUP (First 30 minutes)
   └─ Org Setup Wizard (A-03)
       ├─ Org profile (GSTIN, Udyam, timezone)
       ├─ Import employees (CSV / Sheet / manual)
       ├─ Create departments & teams
       ├─ Invite HR Admin and Managers
       └─ Connect first data source

3. CONFIGURE
   └─ Opens AI Copilot (🤖)
       └─ "Reward top 3 sales closers monthly from Zoho CRM"
   └─ Reviews AI proposal card
       ├─ Validation report
       ├─ Dry-run results (last 3 months)
       └─ Clicks "Confirm & Activate"
   └─ Sets budget allocation per department

4. APPROVE (Weekly / Monthly)
   └─ Opens Pending Decisions Queue (D-02)
   └─ Reviews evidence per candidate
   └─ One-tap Approve / Modify amount / Reject

5. MONITOR (Daily / Weekly)
   └─ Owner Dashboard (D-01)
       ├─ Pulse cards: rewards, budget, % recognised
       ├─ Team comparison
       └─ Fairness panel
   └─ Negative Report (D-04) → spots gaps

6. OPTIMISE (Monthly / Quarterly)
   └─ Analytics (AN-01 to AN-09)
   └─ Adjusts workflows based on data
   └─ AI Copilot for new workflow ideas
```

### 3.2 HR / Admin — Primary Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│  ONBOARD → CONNECT → MAP → MANAGE → EXPORT → COMPLY                │
└─────────────────────────────────────────────────────────────────────┘

1. ONBOARD EMPLOYEES
   └─ Upload employee master (CSV / Sheet)
   └─ Map columns via wizard
   └─ Review validation errors
   └─ Confirm import

2. CONNECT SOURCES
   └─ Connectors → Add (C-02)
   └─ Authenticate (OAuth / API key / file upload)
   └─ Field mapping wizard (C-08)
   └─ Resolve identity queue (C-09)

3. MANAGE PROGRAMMES
   └─ Programme Manager (H-02)
       ├─ Activate / pause workflows
       ├─ Review run history
       └─ Handle failures
   └─ Data Health (H-03)
       └─ Fix schema drift, unmatched records

4. EXPORT & COMPLY
   └─ Payroll export (R-06)
   └─ Tax tracker review (H-05)
   └─ DPDP consent management (S-04)
   └─ Privacy notice publishing (S-03)
```

### 3.3 Team Manager — Primary Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│  REVIEW → APPROVE → RECOGNISE → MONITOR                            │
└─────────────────────────────────────────────────────────────────────┘

1. REVIEW (Triggered by notification)
   └─ Opens "My Approvals" (M-04)
   └─ Sees SLA timer
   └─ Reviews evidence and decision trace

2. APPROVE / MODIFY / REJECT
   └─ One-tap approve
   └─ Or modify amount within limit
   └─ Or reject with note

3. RECOGNISE (Proactive)
   └─ "Recognise Now" button (M-03)
   └─ Picks team member, reason, amount
   └─ Within wallet balance

4. MONITOR
   └─ Team Leaderboard (M-02)
   └─ "Who Haven't I Recognised?" (M-05)
   └─ Team Metric Trends (M-06)
```

### 3.4 Knowledge Employee — Primary Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│  TRACK → RECEIVE → REDEEM → GIVE                                   │
└─────────────────────────────────────────────────────────────────────┘

1. TRACK
   └─ "How I'm Tracking" (E-04)
       ├─ My metric value
       ├─ Rule in plain language
       ├─ Current rank (if visible)
       └─ Time left in window

2. RECEIVE
   └─ WhatsApp / Email / In-app notification
   └─ "🎉 You were ranked #2... 250 points credited"

3. REDEEM
   └─ Opens Redeem (E-05)
   └─ Browses catalogue
   └─ Picks item → OTP → Voucher code delivered

4. GIVE
   └─ Peer Shoutout (E-08)
   └─ THANKS @name reason
```

### 3.5 Frontline / Deskless Employee — WhatsApp Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│  NO APP INSTALL — PURE WHATSAPP                                     │
└─────────────────────────────────────────────────────────────────────┘

1. OPT-IN
   └─ HR sends WhatsApp opt-in link or QR
   └─ Employee taps "JOIN"
   └─ Consent captured with evidence

2. RECEIVE RECOGNITION
   └─ Push: "🎉 Ravi, you were ranked #2 on Line B..."
   └─ Reply "1" to redeem, "2" for details

3. CHECK BALANCE
   └─ Sends "BALANCE"
   └─ Bot replies: "Balance: 1,150 Coins. Expiring: 200 on 31 Mar"

4. REDEEM
   └─ Sends "REDEEM"
   └─ Bot sends OTP-secured link to catalogue (PWA)
   └─ Employee picks item
   └─ Voucher delivered via WhatsApp

5. PEER SHOUTOUT
   └─ Sends "THANKS @Priya for Diwali rush help"
   └─ Bot confirms: "Sent! Priya received your shoutout 🙌"

6. LANGUAGE
   └─ Sends "LANG hi"
   └─ All future messages in Hindi

7. OPT-OUT
   └─ Sends "STOP"
   └─ All messages suppressed immediately suppressed
```

---

## 4. DETAILED UI WORKFLOWS

### 4.1 Onboarding & Org Setup Workflow

```
STEP 1: Sign Up
  ├─ Email + password OR Google/Microsoft SSO
  ├─ Validate email domain (optional)
  └─ → Redirect to Org Setup Wizard

STEP 2: Org Setup Wizard (Multi-step, progress bar)
  ├─ Step 2a: Org Profile
  │   ├─ Legal name (required)
  │   ├─ Display name
  │   ├─ GSTIN (optional, validated format)
  │   ├─ Udyam number (optional)
  │   ├─ Industry (dropdown: Manufacturing, IT Services, Retail, BFSI, Healthcare, Logistics, Hospitality, Other)
  │   ├─ Employee count band (1-24, 25-99, 100-249, 250-499, 500+)
  │   ├─ Timezone (default: Asia/Kolkata)
  │   ├─ Fiscal year start (default: April)
  │   └─ Default locale (en-IN, hi-IN, etc.)
  │
  ├─ Step 2b: Create Departments & Teams
  │   ├─ Add department (name, code)
  │   ├─ Add team under department
  │   ├─ Assign manager (from employee list or skip)
  │   └─ Add locations (office, plant, store, warehouse, field, remote)
  │
  ├─ Step 2c: Import Employees
  │   ├─ Option A: Upload CSV/Excel
  │   │   └─ Download template → Fill → Upload → Map columns → Validate → Import
  │   ├─ Option B: Google Sheet link
  │   │   └─ Connect → Select sheet → Map columns → Validate → Import
  │   └─ Option C: Manual entry (one by one)
  │
  ├─ Step 2d: Invite Team
  │   ├─ Invite HR Admin (email)
  │   ├─ Invite Managers (email or WhatsApp)
  │   └─ Assign roles and scopes
  │
  └─ Step 2e: Connect First Data Source
      ├─ Quick options: CSV Upload, Google Sheets, Zoho CRM
      └─ Or skip → do later

STEP 3: Dashboard Landing
  └─ Owner sees empty-state dashboard with guided next steps
```

### 4.2 Employee Import Workflow

```
STEP 1: Choose Import Method
  ├─ Upload CSV/Excel
  ├─ Google Sheet link
  └─ Manual entry

STEP 2: Upload / Connect
  ├─ Drag & drop file OR paste sheet URL
  ├─ File validation (max 50k rows, 20 MB)
  └─ Show progress bar for large files

STEP 3: Column Mapping Wizard
  ├─ Auto-detect header row
  ├─ Show preview (first 20 rows)
  ├─ Map each column to canonical field:
  │   ├─ employee_code (required)
  │   ├─ full_name (required)
  │   ├─ work_email
  │   ├─ mobile_e164
  │   ├─ whatsapp_e164
  │   ├─ department
  │   ├─ team
  │   ├─ location
  │   ├─ manager
  │   ├─ date_of_joining
  │   └─ custom fields
  ├─ Indian-specific parsing:
  │   ├─ Date: DD/MM/YYYY first
  │   ├─ Number: 1,00,000 format
  │   ├─ Currency: ₹ symbol stripping
  │   └─ Phone: +91 default
  └─ Highlight validation errors in red

STEP 4: Identity Column Selection
  ├─ Choose primary identifier (email, phone, employee code)
  ├─ Choose identity hint
  └─ Choose dedup key

STEP 5: Preview & Validate
  ├─ Show 20 rows with errors highlighted
  ├─ Error types: missing required, invalid email, duplicate code
  └─ "Fix in file" or "Map differently" options

STEP 6: Confirm Import
  ├─ Summary: X employees, Y warnings, Z errors
  ├─ "Import valid rows" button
  └─ Progress indicator

STEP 7: Post-Import
  ├─ Success screen with count
  ├─ Link to Identity Resolution Queue (if unmatched)
  └─ Link to Employee List
```

### 4.3 Connector Setup Workflow (Generic)

```
STEP 1: Choose Connector Type
  ├─ Grid of available connectors with icons
  ├─ Categories: CRM, Helpdesk, HRIS, Sheets, Email, Webhook, Custom
  └─ Each shows: auth type, sync mode, setup time estimate

STEP 2: Authenticate
  ├─ OAuth: Redirect to provider → Authorise → Callback
  ├─ API Key: Paste key → Validate → Save
  ├─ Service Account: Upload JSON / share sheet
  └─ File Upload: Drag & drop

STEP 3: Configure
  ├─ Select objects/modules to sync (e.g., Deals, Tickets)
  ├─ Set polling interval (if applicable)
  ├─ Set sync mode: webhook / poll / upload / push
  └─ Advanced: rate limits, page size

STEP 4: Field Mapping
  ├─ Auto-discover fields from source
  ├─ Show field registry: name, type, sample values
  ├─ Map source field → canonical attribute
  ├─ Set identity hint (email, phone, CRM user ID, employee code)
  ├─ Set dedup key expression
  ├─ Set filter expression (e.g., Stage == "Closed Won")
  └─ Save mapping version

STEP 5: Test & Preview
  ├─ Fetch sample records (5-10)
  ├─ Show mapped output
  ├─ Validate identity resolution
  └─ Show any errors

STEP 6: Activate
  ├─ Start first sync
  ├─ Show progress
  └─ Redirect to Data Health monitor
```

### 4.4 Field Mapping Wizard (Detailed)

```
CONTEXT: User is mapping source fields to canonical schema

LAYOUT: Two-panel
  LEFT: Source fields (from connector)
  RIGHT: Canonical attributes (dropdown)

STEP 1: Auto-Detect
  ├─ System auto-suggests mappings based on field names
  ├─ e.g., "Amount" → "amount_paise", "Owner.email" → "subject_ref"
  └─ Confidence indicator (high/medium/low)

STEP 2: Manual Override
  ├─ Drag & drop OR dropdown selection
  ├─ For each mapping:
  │   ├─ Source field (read-only, shows sample values)
  │   ├─ Canonical attribute (dropdown with search)
  │   ├─ Transform expression (optional, e.g., Amount * 100)
  │   └─ Data type validation
  └─ Highlight unmapped required fields in red

STEP 3: Identity Mapping
  ├─ "Which field identifies the employee?"
  ├─ Options: email, phone, CRM user ID, employee code, name
  ├─ If name: warn about ambiguity
  └─ Show match rate from sample

STEP 4: Dedup Configuration
  ├─ "How do we detect duplicate records?"
  ├─ Suggest: source_record_id + object_name
  ├─ Or custom expression
  └─ Preview dedup on sample

STEP 5: Filter (Optional)
  ├─ "Only sync records where..."
  ├─ Condition builder (field, operator, value)
  └─ e.g., Stage == "Closed Won"

STEP 6: Preview
  ├─ Show 20 mapped records
  ├─ Highlight: identity resolved ✅, unresolved ❌
  ├─ Show any type mismatches
  └─ Error count

STEP 7: Save & Version
  ├─ Save as version N
  ├─ "Set as active" toggle
  └─ Audit log entry
```

### 4.5 Identity Resolution Workflow

```
CONTEXT: Records couldn't be matched to existing employees

ENTRY POINT: Data Health → Unmatched Queue (badge count)

LAYOUT: Queue list → Detail panel

STEP 1: Review Queue
  ├─ List of unmatched records
  ├─ Each shows: identifier value, source, timestamp
  ├─ Sort by: blocking workflows first, then recency
  └─ Filter by: connector, identifier type

STEP 2: Open Record Detail
  ├─ Shows: raw identifier, source record, connector
  ├─ Shows: fuzzy candidates with confidence scores
  │   ├─ Candidate 1: "Ramesh K" — 86% match (name + team)
  │   ├─ Candidate 2: "Ramesh Kumar" — 72% match (name only)
  │   └─ "Create new employee" option
  └─ Shows: blocking workflows (if any)

STEP 3: Resolve
  ├─ Option A: Select candidate → Confirm
  ├─ Option B: Search employee manually → Select → Confirm
  ├─ Option C: Create new employee → Fill form → Confirm
  └─ Option D: Ignore (with reason)

STEP 4: Confirmation
  ├─ "Link [identifier] to [employee name]?"
  ├─ Show impact: X historical records will be re-mapped
  ├─ "Confirm" → Creates identity_map entry
  └─ Audit log: who linked what, when

STEP 5: Post-Resolution
  ├─ If blocking workflows: "Re-run affected workflows?" prompt
  ├─ Toast: "Linked successfully. 12 records updated."
  └─ Return to queue
```

### 4.6 Workflow Builder Workflow (Bigin-like Canvas)

```
CONTEXT: Creating or editing a workflow

ENTRY POINTS:
  ├─ Workflows → "New Workflow"
  ├─ AI Copilot proposal → "Edit"
  └─ Template Library → "Use Template"

LAYOUT: Three-panel
  LEFT: Step palette (drag & drop)
  CENTER: Visual canvas (DAG)
  RIGHT: Configuration panel (for selected step)

STEP 1: Start
  ├─ Option A: Blank canvas
  ├─ Option B: From template (pre-filled)
  └─ Option C: From AI proposal (pre-filled)

STEP 2: Configure Meta
  ├─ Name (required)
  ├─ Description
  ├─ Owner (auto: current user)
  ├─ Template reference (if from template)
  ├─ Timezone (default: Asia/Kolkata)
  └─ Tags

STEP 3: Configure Scope
  ├─ Departments (multi-select)
  ├─ Teams (multi-select)
  ├─ Locations (multi-select)
  ├─ Employee filter (condition builder)
  ├─ Exclude specific employees
  ├─ Include statuses (active, notice)
  ├─ Min tenure days
  └─ Ranking partition (none, team, department, location)

STEP 4: Configure Triggers
  ├─ Add trigger (one or more):
  │   ├─ Event: event type, filter, debounce
  │   ├─ Schedule: cron, window, late_data_grace_hours
  │   └─ Manual: allowed roles, parameters
  └─ Visual: trigger nodes at top of canvas

STEP 5: Add Steps (Drag & Drop)
  ├─ Available steps:
  │   ├─ filter
  │   ├─ aggregate
  │   ├─ rank
  │   ├─ threshold
  │   ├─ branch (if/else)
  │   ├─ approval
  │   ├─ reward
  │   ├─ recognise
  │   ├─ badge
  │   ├─ notify
  │   ├─ wait
  │   ├─ set_var
  │   └─ end
  ├─ Drag from palette → Drop on canvas
  ├─ Connect steps with arrows
  └─ Each step shows icon + label

STEP 6: Configure Each Step
  ├─ Click step → Right panel opens
  ├─ Step-specific configuration:
  │   ├─ RANK: by metric, order, top_n, partition, min_value
  │   ├─ APPROVAL: approvers, timeout, on_timeout, allow_modify
  │   ├─ REWARD: recipients, amount, currency, reward_kind
  │   ├─ NOTIFY: to, template_key, channels, quiet_hours
  │   └─ BRANCH: cases (condition → next), else
  └─ "Next step" selector

STEP 7: Configure Budget
  ├─ Wallet account ref (dropdown of budget pools)
  ├─ Currency
  ├─ Per-run max
  ├─ Per-period max (month/quarter/fiscal_year)
  ├─ On insufficient: hard_stop / partial_by_rank / queue_for_approval
  └─ Reserve on approval request (default: true)

STEP 8: Configure Policies
  ├─ Per-employee caps (add multiple)
  ├─ Cooldown (days, applies_to)
  ├─ Tax guard (track threshold, on_threshold_cross)
  ├─ Unmatched records (block_run / exclude_and_warn / proceed)
  ├─ Tie-break (secondary_metric, earliest_to_reach, etc.)
  ├─ Leaderboard visibility (public_full, public_top_n, team_only, private)
  ├─ Self-nomination allowed
  └─ Manager conflict rule

STEP 9: Validate
  ├─ "Validate" button
  ├─ Runs V1–V14 checks
  ├─ Shows results:
  │   ├─ ✅ Passed (green)
  │   ├─ ⚠️ Warning (yellow)
  │   └─ ❌ Error (red, blocks save)
  └─ Fix errors before proceeding

STEP 10: Dry-Run
  ├─ "Run Dry-Run" button
  ├─ Select periods (default: last 3)
  ├─ Shows progress
  └─ Results screen (see 4.7)

STEP 11: Save
  ├─ Save as Draft
  ├─ Save & Activate (requires validation pass + dry-run)
  └─ Version incremented
```

### 4.7 Dry-Run Results Workflow

```
CONTEXT: Viewing dry-run output after running simulation

LAYOUT: Full-page report

SECTIONS:

1. SUMMARY BAR
   ├─ Periods simulated: 3
   ├─ Total cost: ₹9,000
   ├─ Budget OK: ✅ / ❌
   └─ Winners per period: 2, 2, 1

2. PER-PERIOD RESULTS (Table)
   ├─ Period | Winners | Cost | Notes
   ├─ 2026-06 | A. Sharma (4.82), R. Iyer (4.79) | ₹3,000 | —
   ├─ 2026-05 | A. Sharma (4.91), P. Kumar (4.75) | ₹3,000 | —
   └─ 2026-04 | A. Sharma (4.88) | ₹3,000 | Only 1 qualified

3. FAIRNESS NOTES
   ├─ "Winners came from 2 of 3 shifts"
   ├─ "Night shift never qualified (fewer ratings)"
   └─ Distribution chart by team/location

4. UNMATCHED RECORDS
   ├─ Count: 2
   ├─ List: "Freshdesk agent X not mapped"
   └─ Link to Identity Resolution Queue

5. CAP HITS
   ├─ "A. Sharma hit monthly cap in June"
   └─ "Would have received ₹5,000, capped at ₹5,000"

6. DIFF vs PREVIOUS VERSION
   ├─ Added: min_sample_size = 25
   ├─ Changed: reward amount ₹2,000 → ₹3,000
   └─ Impact: +₹1,000/month cost

7. ACTIONS
   ├─ "Save as Draft"
   ├─ "Activate" (if validation passed)
   └─ "Edit Workflow"
```

### 4.8 Approval Queue Workflow

```
CONTEXT: Manager/Owner reviewing pending approvals

ENTRY POINTS:
  ├─ Dashboard → Pending Decisions Queue
  ├─ Approvals nav item (badge count)
  └─ Email/WhatsApp notification → deep link

LAYOUT: List → Detail panel (or full page)

STEP 1: View Queue
  ├─ List of pending approvals
  ├─ Each shows:
  │   ├─ Workflow name
  │   ├─ Employee name + photo
  │   ├─ Proposed action (points, voucher, amount)
  │   ├─ SLA timer (countdown)
  │   ├─ Status badge: pending / escalated / auto_approved
  │   └─ Time elapsed
  ├─ Sort by: SLA urgency, amount, workflow
  └─ Filter by: workflow, team, status

STEP 2: Open Approval Detail
  ├─ Employee info (name, team, department)
  ├─ Proposed action:
  │   ├─ Amount: ₹3,000 (or points)
  │   ├─ Currency: COINS
  │   ├─ Reward kind: voucher_direct
  │   └─ Recognition type: "CSAT Champion"
  ├─ EVIDENCE SECTION (critical):
  │   ├─ Metric values with source links
  │   │   ├─ CSAT: 4.82 (from Freshdesk, 131 tickets)
  │   │   └─ FRT: 92% (from Freshdesk)
  │   ├─ Decision trace:
  │   │   └─ "Ranked #1 by csat_avg, min 25 tickets passed"
  │   └─ Source records (expandable)
  ├─ Budget impact:
  │   ├─ Pool: Support FY26-27
  │   ├─ Remaining: ₹1,20,000
  │   └─ After this: ₹1,17,000
  └─ Tax impact:
      ├─ Employee cumulative non-cash: ₹12,500
      └─ After this: ₹15,500 ⚠️ (crosses threshold)

STEP 3: Take Action
  ├─ APPROVE:
  │   ├─ One-tap approve
  │   ├─ Optional note
  │   └─ Confirm modal
  ├─ MODIFY:
  │   ├─ Change amount (within limit)
  │   ├─ Change reward kind
  │   ├─ Note required
  │   └─ Confirm modal
  ├─ REJECT:
  │   ├─ Note required
  │   ├─ Select reason (dropdown + free text)
  │   └─ Confirm modal
  └─ ESCALATE:
      ├─ Select escalation target
      ├─ Note required
      └─ Confirm modal

STEP 4: Post-Action
  ├─ Toast: "Approved. Reward will be processed."
  ├─ If batch: "Approved 3 of 5. 2 pending."
  └─ Return to queue or next item
```

### 4.9 Performance Board Creation Workflow _(NEW)_

```
CONTEXT: Creating a Bigin-like performance tracking board

ENTRY POINTS:
  ├─ Performance Boards → "New Board"
  ├─ AI Copilot: "Create a performance board for my factory team"
  └─ Template Library → Industry template

STEP 1: Choose Board Type
  ├─ Option A: From Industry Template
  │   ├─ Select industry (Manufacturing, Retail, Support, etc.)
  │   ├─ Select role/team type
  │   └─ Pre-fills: metrics, scorecard, targets, behaviour rules
  ├─ Option B: Blank Canvas
  │   └─ Start from scratch
  └─ Option C: From AI Suggestion
      └─ AI has drafted a board based on conversation

STEP 2: Board Configuration
  ├─ Board name (e.g., "Factory Line Output Board")
  ├─ Board type (sales, support, manufacturing, retail, logistics, custom)
  ├─ Source mode:
  │   ├─ External (ingest from existing tool)
  │   ├─ Native (capture inside Veronyx)
  │   └─ Hybrid (both)
  ├─ Scope: departments, teams, locations
  └─ Status: draft / active

STEP 3: Tracking Configuration
  ├─ If External:
  │   ├─ Select connector
  │   ├─ Map fields (reuse mapping wizard)
  │   ├─ Set event type
  │   └─ Set identity resolution policy
  ├─ If Native:
  │   ├─ Create native capture form (see 4.10)
  │   ├─ Set entry frequency (daily, weekly, monthly, event)
  │   ├─ Set allowed roles
  │   └─ Set approval requirement
  └─ If Hybrid:
      └─ Configure both

STEP 4: Metrics & Scorecard
  ├─ Add metrics:
  │   ├─ Select from metric catalogue OR create new
  │   ├─ Set weight percentage
  │   ├─ Set target value
  │   ├─ Set min/max threshold
  │   └─ Set direction (higher/lower is better)
  ├─ Scorecard preview:
  │   └─ Weighted combination visual
  └─ Validate weights sum to 100%

STEP 5: Targets
  ├─ Set targets per:
  │   ├─ Employee
  │   ├─ Team
  │   ├─ Location
  │   └─ Board
  ├─ Window: daily, weekly, monthly, quarterly
  ├─ Target value and stretch value
  └─ Import from sheet (optional)

STEP 6: Behaviour Rules (Optional)
  ├─ Add rules for automated actions
  ├─ See 4.11 for behaviour rule workflow

STEP 7: Comparison Policy
  ├─ Select visibility mode:
  │   ├─ private_self_only
  │   ├─ manager_only
  │   ├─ team_only
  │   ├─ public_top_n (set N)
  │   ├─ public_full
  │   └─ anonymous_benchmark
  ├─ Show names: yes/no
  ├─ Show photos: yes/no
  ├─ Show low performers: yes/no (default: no)
  ├─ Show team average: yes/no
  └─ Consent required for public: yes/no

STEP 8: Save & Activate
  ├─ Save as Draft
  ├─ Preview board (how it looks to employees/managers)
  └─ Activate
```

### 4.10 Native Capture Form Builder Workflow

```
CONTEXT: Creating a form for SMEs without existing tracking tools

STEP 1: Form Basics
  ├─ Form name (e.g., "Daily Factory Output")
  ├─ Entry frequency: daily / weekly / monthly / event / shift
  ├─ Entry channel: web / mobile / WhatsApp / kiosk
  └─ Linked performance board

STEP 2: Field Builder
  ├─ Add fields (drag & drop or click):
  │   ├─ Text (e.g., Employee Code)
  │   ├─ Number (e.g., Units Produced)
  │   ├─ Decimal (e.g., Reject Rate)
  │   ├─ Date (e.g., Shift Date)
  │   ├─ Boolean (e.g., Present Y/N)
  │   ├─ Picklist (e.g., Shift: A/B/C)
  │   ├─ Employee lookup (e.g., Employee)
  │   └─ File/Evidence upload
  ├─ For each field:
  │   ├─ Label (multi-language)
  │   ├─ Required: yes/no
  │   ├─ Validation rules
  │   └─ Default value
  └─ Reorder fields (drag & drop)

STEP 3: Entry Configuration
  ├─ Who can enter:
  │   ├─ Employee self
  │   ├─ Supervisor/Manager
  │   ├─ HR Admin
  │   └─ Specific roles
  ├─ Approval required: yes/no (default: yes)
  ├─ Evidence required: yes/no
  ├─ Lock after window close: yes/no
  └─ Edit history: yes/no

STEP 4: Preview
  ├─ Mobile preview (how it looks on phone)
  ├─ WhatsApp preview (how entry works via WhatsApp)
  └─ Test entry

STEP 5: Save & Activate
  ├─ Save form
  ├─ Generate shareable link / WhatsApp number
  └─ Notify relevant supervisors
```

### 4.11 Behaviour Rule Configuration Workflow

```
CONTEXT: Creating automated actions based on performance

STEP 1: Rule Basics
  ├─ Rule name (e.g., "Low Attendance Alert")
  ├─ Rule type:
  │   ├─ appreciation
  │   ├─ reward_nomination
  │   ├─ missing_data_reminder
  │   ├─ manager_alert
  │   ├─ private_employee_nudge
  │   ├─ coaching_task
  │   ├─ escalation
  │   ├─ visibility_update
  │   └─ team_celebration
  └─ Linked board / workflow (optional)

STEP 2: Trigger Configuration
  ├─ Trigger type:
  │   ├─ Metric threshold (e.g., attendance < 90%)
  │   ├─ Schedule (e.g., every Monday 9 AM)
  │   ├─ Event (e.g., CRM not updated for 3 days)
  │   └─ Manual
  ├─ Condition builder:
  │   ├─ Field / metric
  │   ├─ Operator (eq, neq, gt, lt, between, etc.)
  │   └─ Value
  └─ Window (if metric-based)

STEP 3: Action Configuration
  ├─ Action type:
  │   ├─ Send message (select template)
  │   ├─ Create coaching task
  │   ├─ Alert manager
  │   ├─ Send private nudge
  │   ├─ Request data entry
  │   ├─ Schedule follow-up
  │   └─ Escalate
  ├─ Audience:
  │   ├─ Employee (private)
  │   ├─ Manager
  │   ├─ HR
  │   └─ Team
  ├─ Message template (select or create)
  └─ Cooldown (prevent spam)

STEP 4: Privacy & Safety Settings
  ├─ Is private: yes/no (default: yes for poor performance)
  ├─ Requires manager confirmation: yes/no (default: yes)
  ├─ Improvement window before escalation (days)
  └─ Language / locale

STEP 5: Validate & Test
  ├─ Validate rule syntax
  ├─ Dry-run against historical data
  ├─ Show: who would be affected, how many messages
  └─ Confirm no public exposure of low performers

STEP 6: Save & Activate
```

### 4.12 Reward Redemption Workflow (Employee)

```
CONTEXT: Employee redeeming points for a reward

ENTRY POINTS:
  ├─ Employee Dashboard → Redeem
  ├─ WhatsApp: "REDEEM" command
  └─ Notification: "You have 1,150 points. Redeem now?"

STEP 1: View Balance
  ├─ Current balance by currency
  ├─ Expiring soon warning
  └─ Redemption history

STEP 2: Browse Catalogue
  ├─ Categories: Ecommerce, Food, Fuel, Experience, Donation, Merchandise
  ├─ Filter by: denomination, category, delivery type
  ├─ Each item shows:
  │   ├─ Image
  │   ├─ Brand
  │   ├─ Points price
  │   ├─ Face value (₹)
  │   └─ Delivery method (code, link, physical, UPI, payroll)
  └─ Sort by: popular, points low-high, new

STEP 3: Select Item
  ├─ Item detail page
  ├─ Terms & conditions
  ├─ Tax nature indicator:
  │   ├─ Non-cash gift (tracks ₹15,000 threshold)
  │   ├─ Cash equivalent (taxable)
  │   └─ Meal voucher (separate exemption)
  └─ "Redeem" button

STEP 4: Confirmation
  ├─ "Redeem 300 points for Amazon ₹300 voucher?"
  ├─ Tax impact warning (if applicable)
  ├─ Delivery method confirmation
  └─ "Confirm" button

STEP 5: OTP Verification
  ├─ OTP sent to registered WhatsApp/mobile
  ├─ 6-digit code entry
  ├─ 3 attempts, then lockout
  └─ Resend option

STEP 6: Processing
  ├─ Status: "Processing your order..."
  ├─ Ledger hold placed (visible in balance)
  └─ Provider order placed

STEP 7: Delivery
  ├─ Success:
  │   ├─ Voucher code / link delivered
  │   ├─ Via: WhatsApp message / in-app / email
  │   ├─ OTP-gated link for security
  │   └─ Expiry date shown
  ├─ Failure:
  │   ├─ "Order failed. Points returned."
  │   ├─ Support contact
  │   └─ Retry option
  └─ Status tracking in redemption history

STEP 8: Post-Redemption
  ├─ Balance updated
  ├─ Redemption history entry
  └─ "Rate your experience" (optional)
```

### 4.13 Payroll Export Workflow

```
CONTEXT: HR generating monthly payroll CSV

STEP 1: Select Period
  ├─ Month and year
  ├─ Fiscal year context
  └─ Payroll system target (Keka, greytHR, RazorpayX, Zoho Payroll, Custom)

STEP 2: Preview Data
  ├─ Table of all rewards for the period:
  │   ├─ Employee code
  │   ├─ Component code
  │   ├─ Amount (₹)
  │   ├─ Tax nature:
  │   │   ├─ perquisite_noncash
  │   │   ├─ cash_taxable
  │   │   └─ meal_voucher
  │   └─ Reference (workflow run ID)
  ├─ Summary:
  │   ├─ Total employees: X
  │   ├─ Total non-cash: ₹Y
  │   ├─ Total cash: ₹Z
  │   └─ Threshold breaches: N
  └─ Filter: by department, by tax nature

STEP 3: Validate
  ├─ Check for missing employee codes
  ├─ Check for untagged rewards
  ├─ Check threshold breaches
  └─ Warnings displayed

STEP 4: Generate & Download
  ├─ "Generate CSV" button
  ├─ Processing indicator
  ├─ Download link
  └─ File name: payroll_export_YYYY_MM.csv

STEP 5: Audit & History
  ├─ Export logged in audit trail
  ├─ Downloadable from history
  └─ "Sent to payroll" status toggle
```

### 4.14 DPDP / Privacy Workflow

```
CONTEXT: Managing data privacy compliance

STEP 1: Privacy Notice Builder
  ├─ Create/edit notice
  ├─ Multi-language support
  ├─ Purpose list with legal basis:
  │   ├─ Performance recognition → legitimate_use_employment
  │   ├─ Public leaderboard → consent
  │   ├─ WhatsApp messages → consent (Meta requirement)
  │   ├─ Marketing offers → consent
  │   └─ Payroll export → legitimate_use_employment
  ├─ Publish version
  └─ Track employee acknowledgements

STEP 2: Consent Management
  ├─ Per employee, per purpose:
  │   ├─ Granted / Withdrawn / Acknowledged
  │   ├─ Channel: web, WhatsApp, paper
  │   ├─ Evidence: message ID, IP, timestamp
  │   └─ Captured at / Withdrawn at
  ├─ Bulk consent collection (WhatsApp opt-in campaign)
  └─ Consent withdrawal → immediate suppression

STEP 3: Data Principal Requests
  ├─ Request types: access, correction, erasure, grievance, nomination
  ├─ SLA timer
  ├─ Workflow:
  │   ├─ Receive → Acknowledge → Process → Respond → Close
  │   └─ Each step logged
  ├─ Data export (for access requests)
  └─ Erasure confirmation

STEP 4: Retention Management
  ├─ Configure per data class:
  │   ├─ Raw ingest: 18 months
  │   ├─ Canonical events: 3 years
  │   ├─ Ledger: 8 years
  │   └─ Audit: 8 years
  ├─ Scheduled erasure with advance notice
  └─ Manual override with reason
```

---

## 5. AI AGENT UX — FULL WORKFLOW & CHECKLIST

### 5.1 AI Copilot Interface Design

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  🤖 AI Copilot                                          [✕ Close]   │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  [Chat Area]                                                        │
│                                                                     │
│  User: "Reward top 2 support agents monthly by CSAT..."             │
│                                                                     │
│  AI: [Proposal Card]                                                │
│      ┌─────────────────────────────────────────────────────────┐    │
│      │ 📋 Workflow Proposal                                     │    │
│      │                                                          │    │
│      │ Summary: Monthly, previous calendar month. Scope:        │    │
│      │ Support dept. Rank by avg CSAT (Freshdesk), min 50       │    │
│      │ tickets. #1: ₹2,000, #2: ₹1,000. Owner approval.        │    │
│      │                                                          │    │
│      │ Assumptions:                                             │    │
│      │ • Using metric support.csat_avg (exists)                 │    │
│      │ • Ticket count uses support.ticket_resolved              │    │
│      │ • Budget: Support FY26-27 pool (₹1,20,000 remaining)    │    │
│      │                                                          │    │
│      │ Questions:                                               │    │
│      │ • Tie-break: use tickets resolved as secondary? (yes)    │    │
│      │                                                          │    │
│      │ ✅ Validation: Passed (2 warnings)                       │    │
│      │ 📊 Dry-Run: 3 periods, ₹9,000 total, budget OK          │    │
│      │ ⚖️ Fairness: Winners from 2 of 3 shifts                  │    │
│      │                                                          │    │
│      │ [Confirm & Save Draft]  [Confirm & Activate]  [Edit]    │    │
│      └─────────────────────────────────────────────────────────┘    │
│                                                                     │
│  [Input Area]                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Type your request...                              [Send ➤]  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  [Quick Actions]                                                    │
│  [📊 Explain Leaderboard] [🔍 Why didn't X win?] [📈 Analytics]    │
└─────────────────────────────────────────────────────────────────────┘
```

#### AI Copilot Entry Points

| Entry Point                            | Context                                  |
| -------------------------------------- | ---------------------------------------- |
| Global nav (🤖 AI Copilot)             | Full-page chat interface                 |
| Owner Dashboard → "Ask" box            | Inline, contextual                       |
| Workflow Builder → "AI Assist" button  | Pre-filled with current workflow context |
| Performance Board → "AI Setup"         | Guided board creation                    |
| Empty state → "Let AI help you set up" | First-time guidance                      |

---

### 5.2 AI Proposal Card — Detailed Specification

Every AI-generated proposal must display:

```
┌─────────────────────────────────────────────────────────────────────┐
│  📋 [PROPOSAL TYPE] Proposal                              [ID: p-789]│
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  SUMMARY                                                            │
│  [Plain language description of what will be created/changed]       │
│                                                                     │
│  ASSUMPTIONS                                                        │
│  • [Assumption 1]                                                   │
│  • [Assumption 2]                                                   │
│  • [Assumption 3]                                                   │
│                                                                     │
│  QUESTIONS (if any)                                                 │
│  • [Question with default answer]                                   │
│                                                                     │
│  DEFINITION PREVIEW                                                 │
│  [Collapsible JSON / visual preview of the workflow/config]         │
│                                                                     │
│  VALIDATION REPORT                                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ✅ V1: Schema valid                                         │    │
│  │ ✅ V2: Step graph acyclic                                   │    │
│  │ ✅ V3: All metrics exist                                    │    │
│  │ ⚠️ V14: min_sample_size unset for csat_avg (recommend 25)   │    │
│  │ ✅ V5: Approval step present                                │    │
│  │ ... (all V1-V14)                                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  DRY-RUN RESULTS                                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Periods: 3                                                   │    │
│  │ Period 1 (Jun 2026):                                         │    │
│  │   Winners: A. Sharma (4.82), R. Iyer (4.79)                 │    │
│  │   Cost: ₹3,000                                               │    │
│  │ Period 2 (May 2026):                                         │    │
│  │   Winners: A. Sharma (4.91), P. Kumar (4.75)                │    │
│  │   Cost: ₹3,000                                               │    │
│  │ Period 3 (Apr 2026):                                         │    │
│  │   Winners: A. Sharma (4.88)                                  │    │
│  │   Cost: ₹3,000                                               │    │
│  │ Total: ₹9,000 | Budget: ✅ OK                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  FAIRNESS NOTES                                                     │
│  • Winners came from 2 of 3 shifts                                  │
│  • Night shift never qualified (fewer ratings)                      │
│  • [Distribution mini-chart]                                        │
│                                                                     │
│  UNMATCHED RECORDS                                                  │
│  ⚠️ 2 unmatched Freshdesk agents in last 90 days                    │
│  [Link to Identity Resolution Queue]                                │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  ACTIONS                                                            │
│  [Confirm & Save Draft]  [Confirm & Activate]  [Edit]  [Reject]    │
│                                                                     │
│  Requires permission: workflow.create / workflow.activate           │
│  Audited as: actor_type=user, ai_proposal_id=p-789                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 5.3 AI UX Workflow Checklist

#### A. Conversation Design

- [ ] Chat interface with clear user/AI message bubbles
- [ ] Typing indicator while AI processes
- [ ] Message timestamps
- [ ] Session persistence (refresh doesn't lose history)
- [ ] Session export (download transcript)
- [ ] Clear session indicator (when did this session start)
- [ ] "New Session" button to reset context
- [ ] Context scope indicator (what data the AI can see based on user's RBAC)

#### B. Input Handling

- [ ] Free-text input with multi-line support
- [ ] Quick action buttons for common queries:
  - [ ] "Explain this leaderboard"
  - [ ] "Why didn't [employee] win?"
  - [ ] "Create a workflow for..."
  - [ ] "Show analytics for..."
  - [ ] "Help me set up..."
- [ ] Context-aware suggestions based on current screen
- [ ] Voice input (mobile, future)
- [ ] Multi-language input support (en, hi, ta, te, kn, mr, bn, gu, ml)
- [ ] Character/token limit indicator
- [ ] Error message for unsupported queries

#### C. Response Display

- [ ] Plain language summary always first
- [ ] Structured data in tables/cards, not raw JSON
- [ ] Expandable/collapsible sections for technical details
- [ ] Metric values with source attribution
- [ ] Links to underlying data (snapshots, records)
- [ ] Confidence indicators where applicable
- [ ] "I don't know" graceful handling
- [ ] "I can't do that" with explanation and alternative

#### D. Proposal Card Requirements

- [ ] Proposal type clearly labelled
- [ ] Unique proposal ID visible
- [ ] Summary in plain language
- [ ] Assumptions listed explicitly
- [ ] Questions for user (with defaults)
- [ ] Definition preview (collapsible)
- [ ] Validation report (all V1-V14 with pass/warn/fail)
- [ ] Dry-run results (if applicable)
- [ ] Fairness notes (if applicable)
- [ ] Unmatched records warning (if applicable)
- [ ] Budget impact
- [ ] Tax impact
- [ ] Required permissions displayed
- [ ] Action buttons:
  - [ ] Confirm & Save Draft
  - [ ] Confirm & Activate (if validation passed)
  - [ ] Edit (opens relevant builder)
  - [ ] Reject (with optional reason)
- [ ] Audit trail note: "Will be logged as AI proposal"

#### E. Validation Report Display

- [ ] Each rule (V1-V14) listed with status icon:
  - ✅ Passed
  - ⚠️ Warning (non-blocking)
  - ❌ Error (blocking)
- [ ] Click on warning/error for explanation
- [ ] Suggested fix for each error
- [ ] "Fix automatically" button where applicable
- [ ] "Re-validate" button after fixes

#### F. Dry-Run Visualization

- [ ] Period selector (default: last 3)
- [ ] Per-period results table:
  - Period
  - Winners (name, metric value, rank)
  - Cost
  - Notes
- [ ] Total cost summary
- [ ] Budget status: ✅ OK / ❌ Insufficient
- [ ] Fairness distribution chart (by team/location/shift)
- [ ] Cap hits list
- [ ] Unmatched records count + link
- [ ] Diff vs previous version (if editing)
- [ ] "Re-run with different parameters" option

#### G. Explain Function ("Why didn't X win?")

- [ ] Employee selector (search / dropdown)
- [ ] Workflow/run selector
- [ ] Decision trace display:
  - Step-by-step pass/fail
  - Metric values at each step
  - Which condition failed
  - What would have been needed
- [ ] Plain language explanation
- [ ] Source record links
- [ ] "Show me the data" expandable section

#### H. Analytics Q&A

- [ ] Natural language query input
- [ ] Response formats:
  - Table (for lists)
  - Chart (for trends)
  - Number card (for single metrics)
  - Text (for explanations)
- [ ] Metric attribution (which metric, which window)
- [ ] "Show as chart" / "Show as table" toggle
- [ ] Export result (CSV)
- [ ] "Ask follow-up" suggestion

#### I. Guardrails UX

- [ ] Protected attribute refusal:
  - Clear message: "I can't create workflows based on [attribute]"
  - Explanation of why
  - Alternative suggestion
- [ ] Free-text judgement refusal:
  - "I can only answer with metrics, not opinions"
  - Redirect to available data
- [ ] Permission denied:
  - "You don't have permission to view [X]"
  - What permission is needed
  - Who to contact
- [ ] Rate limit reached:
  - "You've reached the query limit for this session"
  - When it resets
- [ ] Prompt injection protection:
  - Connector content treated as data
  - No visible indication to user (silent protection)
  - Log suspicious patterns for admin review

#### J. Error States

- [ ] AI timeout:
  - "Taking longer than usual. Please wait..."
  - Retry button after 30s
  - Cancel option
- [ ] AI error:
  - "Something went wrong. Please try again."
  - Error code for support
  - Retry button
- [ ] Validation failure:
  - Show specific errors
  - Suggested fixes
  - "Ask AI to fix" button
- [ ] Dry-run failure:
  - Show which period failed
  - Show error details
  - "Retry with fewer periods" option
- [ ] Permission error:
  - Clear message about missing permission
  - Who can grant it

#### K. Loading States

- [ ] Initial load: skeleton chat interface
- [ ] Message processing: typing indicator (3 dots)
- [ ] Tool call in progress: "Checking connectors..." / "Running validation..."
- [ ] Dry-run in progress: progress bar with period count
- [ ] Proposal generation: step-by-step progress
  - "Parsing intent..."
  - "Grounding to metrics..."
  - "Composing workflow..."
  - "Validating..."
  - "Running dry-run..."
- [ ] Long operations: "This may take 30-60 seconds"

#### L. Accessibility

- [ ] Keyboard navigation through proposal card
- [ ] Screen reader labels for all elements
- [ ] High contrast mode support
- [ ] Focus management (focus moves to new content)
- [ ] Announce loading states to screen readers
- [ ] Alt text for charts in analytics responses

---

### 5.4 AI Agent Interaction Patterns

#### Pattern 1: Workflow Creation

```
User: "Reward top 2 support agents monthly by CSAT, min 50 tickets.
       ₹2,000 to #1, ₹1,000 to #2. My approval needed."

AI Response Flow:
1. Parse intent (2-3 seconds)
   → Show: "I understand. Creating a monthly CSAT reward workflow..."

2. Ground to metrics (3-5 seconds)
   → Show: "Found metrics: support.csat_avg, support.ticket_resolved"
   → If missing: "I couldn't find a CSAT metric. Connect Freshdesk first?"

3. Retrieve template (1-2 seconds)
   → Show: "Using template: CSAT Champion (quarterly)"
   → "Adapting to monthly cadence..."

4. Compose definition (2-3 seconds)
   → Show: "Workflow draft ready. Validating..."

5. Validate (2-3 seconds)
   → Show: Validation results inline

6. Dry-run (5-10 seconds)
   → Show: Progress, then results

7. Present proposal card
   → Full card with all sections
   → Action buttons

8. User confirms
   → Toast: "Workflow saved as draft" or "Workflow activated"
   → Audit log entry
```

#### Pattern 2: Explain Leaderboard

```
User: "Why didn't Suresh get the Line Star award last week?"

AI Response Flow:
1. Identify employee and workflow
   → "Found: Suresh, Factory Line Weekly workflow, last week's run"

2. Fetch decision trace
   → "Retrieving decision trace..."

3. Present explanation:
   ┌─────────────────────────────────────────────────────────┐
   │ 📊 Why Suresh didn't win Line Star (Week of 10 Nov)     │
   │                                                         │
   │ Suresh was ranked #1 on output (412 units).             │
   │                                                         │
   │ However, he did not pass the attendance filter:         │
   │ • Rule: attendance_pct ≥ 95%                            │
   │ • Suresh's attendance: 91% (missed 1 day)               │
   │                                                         │
   │ He was filtered out at Step 1 (filter).                 │
   │                                                         │
   │ Source: Daily_Output sheet, row dated 12 Nov            │
   │ [View source record]                                    │
   │                                                         │
   │ 💡 If this seems incorrect, check the attendance entry  │
   │ or contact your supervisor to correct the sheet.        │
   └─────────────────────────────────────────────────────────┘
```

#### Pattern 3: Analytics Query

```
User: "Who were the top 5 in Chennai branch on collections last quarter?"

AI Response Flow:
1. Parse query
   → Scope: Chennai branch
   → Metric: collections.collection_efficiency
   → Window: last quarter
   → Top N: 5

2. Query metric snapshots
   → "Querying collections data for Chennai..."

3. Present results:
   ┌─────────────────────────────────────────────────────────┐
   │ 📊 Top 5 Collections — Chennai, Q3 2026                 │
   │                                                         │
   │ Rank | Name          | Efficiency | Amount Collected    │
   │ 1    | R. Kumar      | 94.2%      | ₹12,40,000         │
   │ 2    | S. Priya      | 91.8%      | ₹11,20,000         │
   │ 3    | M. Raj        | 89.5%      | ₹10,80,000         │
   │ 4    | K. Anitha     | 87.3%      | ₹9,60,000          │
   │ 5    | V. Suresh     | 85.1%      | ₹8,90,000          │
   │                                                         │
   │ Source: Collection Efficiency metric, Jul-Sep 2026      │
   │ [View as chart] [Export CSV]                            │
   └─────────────────────────────────────────────────────────┘
```

#### Pattern 4: Setup Guidance

```
User: "I run a garment factory. How do I start?"

AI Response Flow:
1. Identify industry
   → "Great! For garment manufacturing, I recommend..."

2. Suggest industry blueprint
   ┌─────────────────────────────────────────────────────────┐
   │ 🏭 Garment Factory Setup Guide                          │
   │                                                         │
   │ Recommended tracking:                                   │
   │ • Units produced (per worker, per shift)                │
   │ • Reject/defect rate                                    │
   │ • Attendance                                            │
   │ • Machine downtime (optional)                           │
   │                                                         │
   │ Recommended workflows:                                  │
   │ 1. Weekly Line Star (top output + attendance filter)    │
   │ 2. Quality Champion (zero defects)                      │
   │ 3. Perfect Attendance (monthly bonus)                   │
   │                                                         │
   │ Data source options:                                    │
   │ • Google Sheet (supervisor enters daily)                │
   │ • WhatsApp entry (supervisor sends daily)               │
   │ • CSV upload (weekly)                                   │
   │                                                         │
   │ [Start with Google Sheet] [Start with WhatsApp]         │
   │ [Show me the templates]                                 │
   └─────────────────────────────────────────────────────────┘

3. Guide through setup step by step
```

---

### 5.5 AI UX Design Principles Checklist

- [ ] **Reactive only**: AI never initiates conversation, never sends unsolicited messages
- [ ] **Propose, don't act**: Every state change requires human confirmation
- [ ] **Never pays**: No tool writes to ledger, approves, or sends notifications
- [ ] **Permission-scoped**: AI only sees what the user can see
- [ ] **Cites evidence**: Every numeric answer includes metric, window, source link
- [ ] **Transparent about limitations**: "I can't do X, but I can do Y"
- [ ] **No hallucination**: Grounded in templates, metrics, field registry
- [ ] **Repair loop visible**: If validation fails, show the fix attempt
- [ ] **Audit trail**: Every AI interaction logged, exportable
- [ ] **Cost awareness**: Token usage visible to admin (not to end user)
- [ ] **Graceful degradation**: If AI is down, all manual flows still work

---

## 6. STATE DESIGN CHECKLIST

### 6.1 Empty States

| Screen                | Empty State Design                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Dashboard (Owner)     | "No workflows yet. Create your first workflow or let AI help." + CTA                                                          |
| Workflow List         | "No workflows. Start from a template or use AI Copilot." + CTA                                                                |
| Performance Boards    | "No boards yet. Create a board to start tracking." + CTA                                                                      |
| Approvals Queue       | "No pending approvals. You're all caught up! 🎉"                                                                              |
| Connector List        | "No sources connected. Connect your first data source." + CTA                                                                 |
| Identity Queue        | "No unmatched records. Great job! ✅"                                                                                         |
| Employee List         | "No employees yet. Import your team." + CTA                                                                                   |
| Reward Catalogue      | "No rewards configured. Add items or connect an aggregator." + CTA                                                            |
| Analytics             | "Not enough data yet. Activate a workflow to start collecting."                                                               |
| Notifications         | "No notifications yet."                                                                                                       |
| AI Chat (new session) | "Hi! I can help you create workflows, explain leaderboards, and answer questions. What would you like to do?" + Quick actions |

### 6.2 Loading States

| Component             | Loading Design                            |
| --------------------- | ----------------------------------------- |
| Page load             | Skeleton screens (match content layout)   |
| Table data            | Skeleton rows (5-10 rows)                 |
| Chart                 | Skeleton chart shape                      |
| Dashboard cards       | Skeleton cards                            |
| AI response           | Typing indicator (3 animated dots)        |
| Dry-run               | Progress bar with step labels             |
| File upload           | Progress bar with percentage              |
| Connector sync        | Spinner + "Syncing..." + last sync time   |
| Workflow run          | Progress indicator with current step      |
| Redemption processing | "Processing your order..." with animation |

### 6.3 Error States

| Scenario                    | Error Design                                                      |
| --------------------------- | ----------------------------------------------------------------- |
| API error                   | Toast + retry button. "Something went wrong. Please try again."   |
| Validation error            | Inline error on field. Red border + error message below.          |
| File upload error           | "File too large (max 20MB)" or "Invalid format. Use CSV or XLSX." |
| Connector auth failure      | "Authentication failed. Please reconnect." + reconnect button     |
| Identity conflict           | "This identifier is already linked to another employee."          |
| Budget insufficient         | "Insufficient budget. Remaining: ₹X. Required: ₹Y."               |
| Permission denied           | "You don't have permission to perform this action."               |
| AI timeout                  | "Taking longer than usual. Please wait or try again."             |
| Workflow validation failure | List of errors with fix suggestions                               |
| Dry-run failure             | "Dry-run failed for period X. Check data quality."                |
| Network offline             | "You're offline. Changes will sync when you reconnect."           |
| Session expired             | "Your session expired. Please log in again."                      |

### 6.4 Success States

| Action                 | Success Design                                                               |
| ---------------------- | ---------------------------------------------------------------------------- |
| Workflow activated     | Toast: "Workflow activated. First run scheduled for [date]."                 |
| Approval submitted     | Toast: "Approved. Reward will be processed."                                 |
| Employee imported      | Toast: "X employees imported successfully."                                  |
| Connector connected    | Toast: "Connected to [source]. First sync started."                          |
| Identity resolved      | Toast: "Linked successfully. X records updated."                             |
| Reward redeemed        | Full-screen success: "🎉 Redemption successful! Your voucher is on the way." |
| AI proposal confirmed  | Toast: "Workflow saved as draft." or "Workflow activated."                   |
| Native entry submitted | Toast: "Entry submitted. Pending approval."                                  |
| Behaviour rule created | Toast: "Rule created and active."                                            |

### 6.5 Edge Cases

| Scenario                                              | Handling                                                                    |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Concurrent editing (two admins editing same workflow) | Optimistic locking. "This workflow was modified by [user]. Please refresh." |
| Workflow run in progress while editing                | "A run is in progress. Edits will apply to next version."                   |
| Employee exits mid-workflow                           | Excluded automatically. Show in run summary.                                |
| Budget exhausted mid-approval                         | "Budget exhausted. This approval will be queued."                           |
| Connector schema change                               | Pause ingestion. Alert HR. Show drift details.                              |
| Duplicate import                                      | Detect by dedup key. Skip duplicates. Show count.                           |
| WhatsApp message to non-opted-in user                 | Suppress. Show "suppressed_no_optin" in log.                                |
| AI proposal for metric that doesn't exist             | "Metric not found. Connect [source] first or create metric."                |
| Dry-run with no historical data                       | "No historical data for dry-run. Connect a source first."                   |
| Multi-language template missing                       | Fall back to English. Warn admin.                                           |

---

## 7. COMPONENT LIBRARY REQUIREMENTS

### 7.1 Core Components

| Component             | Variants                                         | Notes                               |
| --------------------- | ------------------------------------------------ | ----------------------------------- |
| **Button**            | Primary, Secondary, Ghost, Danger, Link          | Sizes: SM, MD, LG                   |
| **Input**             | Text, Number, Email, Phone, Password, Textarea   | With label, helper, error           |
| **Select**            | Single, Multi, Searchable, Grouped               | For dropdowns                       |
| **Date Picker**       | Single, Range                                    | DD/MM/YYYY default for India        |
| **Table**             | Sortable, Filterable, Paginated, Expandable rows | For lists                           |
| **Card**              | Info, Stat, Action, Proposal                     | For dashboard cards                 |
| **Modal**             | Confirm, Form, Info, Error                       | With backdrop                       |
| **Toast**             | Success, Error, Warning, Info                    | Auto-dismiss                        |
| **Badge**             | Status, Count, Label                             | For workflow status, approval count |
| **Tabs**              | Horizontal, Vertical                             | For settings, detail views          |
| **Stepper**           | Horizontal, Vertical                             | For wizards, onboarding             |
| **Progress**          | Bar, Circular, Step                              | For uploads, dry-runs               |
| **Skeleton**          | Text, Card, Table, Chart                         | For loading states                  |
| **Empty State**       | Illustration + CTA                               | Per screen                          |
| **Tooltip**           | Info, Help                                       | For field explanations              |
| **Dropdown Menu**     | Action, Navigation                               | For row actions, profile            |
| **Avatar**            | User, Team, Org                                  | With initials fallback              |
| **Chart**             | Line, Bar, Pie, Distribution, Gini               | For analytics                       |
| **Timeline**          | Vertical                                         | For run history, audit log          |
| **Kanban**            | Columns, Cards                                   | For workflow pipeline (v1)          |
| **DAG Canvas**        | Nodes, Edges, Drag-drop                          | For workflow builder                |
| **Condition Builder** | Field + Operator + Value                         | For filters, rules                  |
| **Formula Editor**    | Syntax highlight, validation                     | For amount formulas                 |
| **JSON Viewer**       | Collapsible, syntax highlight                    | For workflow definitions            |
| **Diff Viewer**       | Side-by-side, inline                             | For version comparison              |

### 7.2 Domain-Specific Components

| Component                      | Purpose                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| **Workflow Step Node**         | Visual node in DAG canvas. Icon + label + status.                    |
| **Approval Card**              | Employee info, proposed action, evidence, SLA timer, action buttons. |
| **Proposal Card**              | AI-generated proposal with summary, validation, dry-run, actions.    |
| **Decision Trace**             | Per-employee pass/fail explanation. Expandable.                      |
| **Metric Card**                | Metric name, value, window, source, trend.                           |
| **Leaderboard Row**            | Rank, employee, metric value, badge. Visibility-aware.               |
| **Budget Pool Card**           | Pool name, allocated, used, remaining, progress bar.                 |
| **Tax Tracker Row**            | Employee, cumulative value, threshold, status.                       |
| **Connector Status Card**      | Connector name, status, last sync, error, reconnect.                 |
| **Identity Match Card**        | Identifier, candidates with confidence, confirm/ignore.              |
| **Native Entry Form**          | Dynamic form based on field definitions. Mobile-optimised.           |
| **Scorecard Editor**           | Weighted metrics with drag-to-reorder.                               |
| **Comparison Policy Selector** | Radio buttons with preview of each mode.                             |
| **Behaviour Rule Card**        | Trigger, condition, action, status, privacy indicator.               |

---

## 8. RESPONSIVE & LANGUAGE REQUIREMENTS

### 8.1 Breakpoints

| Breakpoint    | Width           | Layout                                   |
| ------------- | --------------- | ---------------------------------------- |
| Mobile        | < 768px         | Single column, bottom nav, hamburger     |
| Tablet        | 768px - 1024px  | Two column, collapsible sidebar          |
| Desktop       | 1024px - 1440px | Sidebar + content                        |
| Large Desktop | > 1440px        | Sidebar + content + optional right panel |

### 8.2 Mobile-Specific Requirements

- [ ] Bottom navigation bar (Dashboard, Approvals, Rewards, Profile)
- [ ] Swipe actions for approval (swipe right = approve, swipe left = reject)
- [ ] Pull-to-refresh on lists
- [ ] Touch-friendly tap targets (min 44x44px)
- [ ] Simplified tables (card layouts instead of tables)
- [ ] WhatsApp deep links for employee notifications
- [ ] PWA install prompt
- [ ] Offline-capable shell (cached static assets)
- [ ] Camera access for evidence upload (native entry)

### 8.3 Multi-Language Requirements

| Requirement          | Details                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| Supported languages  | en, hi, ta, te, kn, mr, bn, gu, ml                                       |
| Language toggle      | Per user, persisted in profile                                           |
| RTL support          | Not required (all LTR)                                                   |
| Font support         | Devanagari, Tamil, Telugu, Kannada, Bengali, Gujarati, Malayalam scripts |
| Number formatting    | Indian numbering (1,00,000)                                              |
| Date formatting      | DD/MM/YYYY                                                               |
| Currency formatting  | ₹ symbol, Indian grouping                                                |
| WhatsApp templates   | Separate template per language (Meta requirement)                        |
| Email templates      | Separate per language                                                    |
| In-app notifications | Localised                                                                |
| AI responses         | Respond in user's preferred language                                     |
| Error messages       | Localised                                                                |
| Validation messages  | Localised                                                                |
| Empty states         | Localised                                                                |
| Tooltips             | Localised                                                                |

### 8.4 Indian-Specific UX Considerations

- [ ] Indian number formatting everywhere (1,00,000 not 100,000)
- [ ] ₹ symbol with proper spacing (₹ 1,00,000)
- [ ] DD/MM/YYYY date format as default
- [ ] IST timezone display (Asia/Kolkata)
- [ ] Regional language names in dropdowns (not just codes)
- [ ] WhatsApp as primary communication channel for frontline
- [ ] OTP-based authentication for users without email
- [ ] Low-bandwidth optimisation (compress images, lazy load)
- [ ] Festival awareness (Diwali, Pongal, Onam, etc. in campaign builder)
- [ ] Fiscal year awareness (April-March)
- [ ] GSTIN and Udyam number fields in org setup

---

## 9. ACCESSIBILITY & INCLUSION CHECKLIST

### 9.1 WCAG 2.1 AA Compliance

- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible on all focusable elements
- [ ] Logical tab order
- [ ] Skip navigation links
- [ ] Alt text for all images
- [ ] ARIA labels for icon-only buttons
- [ ] Form labels associated with inputs
- [ ] Error messages linked to fields (aria-describedby)
- [ ] Heading hierarchy (h1 → h2 → h3, no skipping)
- [ ] Screen reader announcements for dynamic content (aria-live)
- [ ] No information conveyed by color alone
- [ ] Resizable text up to 200% without loss of content
- [ ] No keyboard traps

### 9.2 Low-Vision & Mobility

- [ ] Minimum touch target size: 44x44px
- [ ] Sufficient spacing between interactive elements
- [ ] High contrast mode support
- [ ] Reduced motion preference respected (prefers-reduced-motion)
- [ ] Text size adjustable without breaking layout
- [ ] VoiceOver / NVDA tested

### 9.3 Cognitive Accessibility

- [ ] Plain language (avoid jargon)
- [ ] Clear error messages with suggested fixes
- [ ] Consistent navigation patterns
- [ ] Progress indicators for multi-step flows
- [ ] Confirmation before destructive actions
- [ ] Undo option where possible
- [ ] Auto-save for long forms
- [ ] Timeout warning before session expiry

### 9.4 Frontline Worker Accessibility

- [ ] Large tap targets for WhatsApp interactions
- [ ] Voice message support for input (future)
- [ ] Simple language (avoid corporate jargon)
- [ ] Visual confirmation (icons + text, not text only)
- [ ] Regional language support
- [ ] Low-data mode (minimal images)
- [ ] Works on basic Android devices (Android 8+)

---

## 10. DESIGN TOKENS & THEMING

### 10.1 Color Palette (Suggested)

| Token            | Light Mode      | Dark Mode | Usage                    |
| ---------------- | --------------- | --------- | ------------------------ |
| `primary`        | #2563EB (Blue)  | #3B82F6   | Primary actions, links   |
| `primary-hover`  | #1D4ED8         | #2563EB   | Hover state              |
| `success`        | #16A34A (Green) | #22C55E   | Success states, approved |
| `warning`        | #D97706 (Amber) | #F59E0B   | Warnings, pending        |
| `error`          | #DC2626 (Red)   | #EF4444   | Errors, rejected         |
| `info`           | #0891B2 (Cyan)  | #06B6D4   | Info states              |
| `background`     | #FFFFFF         | #0F172A   | Page background          |
| `surface`        | #F8FAFC         | #1E293B   | Card background          |
| `border`         | #E2E8F0         | #334155   | Borders                  |
| `text-primary`   | #0F172A         | #F8FAFC   | Primary text             |
| `text-secondary` | #64748B         | #94A3B8   | Secondary text           |
| `text-disabled`  | #94A3B8         | #475569   | Disabled text            |

### 10.2 Typography

| Token   | Size | Weight   | Usage            |
| ------- | ---- | -------- | ---------------- |
| `h1`    | 30px | Bold     | Page titles      |
| `h2`    | 24px | Bold     | Section titles   |
| `h3`    | 20px | Semibold | Card titles      |
| `h4`    | 16px | Semibold | Sub-sections     |
| `body`  | 14px | Regular  | Body text        |
| `small` | 12px | Regular  | Captions, labels |
| `mono`  | 13px | Regular  | Code, IDs, JSON  |

### 10.3 Spacing Scale

```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
```

### 10.4 Border Radius

| Token  | Value  | Usage                  |
| ------ | ------ | ---------------------- |
| `sm`   | 4px    | Inputs, small buttons  |
| `md`   | 8px    | Cards, buttons         |
| `lg`   | 12px   | Modals, large cards    |
| `full` | 9999px | Pills, avatars, badges |

### 10.5 Shadows

| Token | Usage                     |
| ----- | ------------------------- |
| `sm`  | Cards at rest             |
| `md`  | Cards on hover, dropdowns |
| `lg`  | Modals, popovers          |
| `xl`  | Toasts, floating elements |

### 10.6 Iconography

- [ ] Consistent icon set (e.g., Lucide, Heroicons, or custom)
- [ ] 24px default, 20px small, 32px large
- [ ] Outline style for inactive, filled for active
- [ ] Domain-specific icons:
  - Workflow (⚡)
  - Approval (✅)
  - Reward (🎁)
  - Performance (📊)
  - Connector (🔌)
  - AI (🤖)
  - Fairness (⚖️)
  - Budget (💰)
  - WhatsApp (WhatsApp brand icon)

### 10.7 Illustration Style

- [ ] Consistent illustration style for empty states
- [ ] Inclusive representations (diverse Indian workforce)
- [ ] Factory, retail, office, field settings represented
- [ ] Regional diversity in illustrations
- [ ] Avoid gender/caste/religious stereotypes
- [ ] Neutral, professional tone

---

## APPENDIX A: SCREEN PRIORITY MATRIX

| Priority     | Screens                                                                                                                                                                 | Rationale         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **P0 (MVP)** | Login, Org Setup, Employee Import, Dashboard (Owner/Manager/Employee), Workflow Builder, Approval Queue, Reward Catalogue, Redemption, WhatsApp Bot, AI Copilot (basic) | Core value loop   |
| **P1 (MVP)** | Connector Setup, Field Mapping, Identity Resolution, Performance Boards (basic), Native Capture, Behaviour Rules (basic), Analytics (basic)                             | Data pipeline     |
| **P2 (v1)**  | Fairness Panel, Negative Report, Anti-Gaming Alerts, Comparison Policies, Scorecard Editor, Target Setting, Campaign Manager, DPDP Centre                               | Depth features    |
| **P3 (v1+)** | Kiosk Mode, Peer Shoutout UI, Multi-step Approvals, Budget Forecasting, Template Marketplace                                                                            | Enhanced features |

---

## APPENDIX B: DELIVERABLES CHECKLIST

### General UI/UX

- [ ] Wireframes for all P0 screens (desktop + mobile)
- [ ] Wireframes for all P1 screens (desktop + mobile)
- [ ] High-fidelity mockups for all P0 screens
- [ ] High-fidelity mockups for all P1 screens
- [ ] Interactive prototype for:
  - [ ] Onboarding flow
  - [ ] Workflow builder
  - [ ] Approval queue
  - [ ] AI Copilot conversation
  - [ ] Employee redemption flow
  - [ ] WhatsApp bot interactions
- [ ] Design system / component library (Figma)
- [ ] Design tokens document
- [ ] Icon set
- [ ] Illustration set (empty states, errors)
- [ ] Multi-language layout specs
- [ ] Accessibility audit report
- [ ] Responsive breakpoint specs
- [ ] Dark mode specs (if applicable)
- [ ] Motion/animation specs
- [ ] Handoff documentation for engineering

### AI UX Specifically

- [ ] AI Copilot chat interface (desktop + mobile)
- [ ] Proposal card component (all states)
- [ ] Validation report display
- [ ] Dry-run results visualization
- [ ] Decision trace display
- [ ] Explain function UI
- [ ] Analytics Q&A response formats
- [ ] Loading states for AI operations
- [ ] Error states for AI operations
- [ ] Guardrails messaging (refusals, permissions)
- [ ] Quick action buttons
- [ ] Session management UI
- [ ] Transcript export UI

---

## APPENDIX C: OPEN QUESTIONS

Before starting implementation, clarify:

1. **Brand identity**: Do we have brand guidelines? Logo, colors, fonts?
2. **Design tool**: Figma? Sketch? Adobe XD?
3. **Component library**: Build custom or use existing (shadcn/ui, Ant Design, Material)?
4. **Dark mode**: Required for MVP or later?
5. **Native mobile app**: React Native later — design for native or web-first?
6. **WhatsApp bot design**: Do we design the WhatsApp message templates or just the content?
7. **Kiosk mode**: Design for v1 or later?
8. **Illustration style**: Custom or stock? Budget?
9. **User research**: Do we have access to target users for testing?
10. **Timeline**: When do engineering need handoff?

---

**Document:** Veronyx Internal Doc
**Version:** 1.0
**Date:** [Current Date]

---

_End of UI Flow, Workflows & AI UX Checklist Document_
