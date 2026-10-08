import { employees } from "@/lib/mock-data";

/* ---------- Pure rules ---------- */

/** Gini coefficient for a list of non-negative values (0 = perfectly even, 1 = all to one person). */
export function gini(values: number[]): number {
  const sorted = values.filter((v) => v >= 0).sort((a, b) => a - b);
  const n = sorted.length;
  const total = sorted.reduce((s, v) => s + v, 0);
  if (n === 0 || total === 0) return 0;
  const weighted = sorted.reduce((s, v, i) => s + (i + 1) * v, 0);
  return (2 * weighted) / (n * total) - (n + 1) / n;
}

/** Share of the total held by the top 10% of recipients (0–1). */
export function topTenShare(values: number[]): number {
  const sorted = [...values].sort((a, b) => b - a);
  const total = sorted.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  const count = Math.max(1, Math.ceil(sorted.length * 0.1));
  return sorted.slice(0, count).reduce((s, v) => s + v, 0) / total;
}

export const TAX_THRESHOLD = 15000;

export type TaxStatus = "clear" | "near" | "over";

/** Non-cash gifts above ₹15,000 in a financial year become taxable perquisites. Near = 80%+. */
export function taxStatus(cumulative: number): TaxStatus {
  if (cumulative > TAX_THRESHOLD) return "over";
  if (cumulative >= TAX_THRESHOLD * 0.8) return "near";
  return "clear";
}

/** DPDP requests: respond within the SLA window (days). Returns days left (negative = overdue). */
export function slaDaysLeft(receivedOn: Date, slaDays: number, today: Date): number {
  const ms = receivedOn.getTime() + slaDays * 86_400_000 - today.getTime();
  return Math.ceil(ms / 86_400_000);
}

/** Gender cuts may only be shown when consent for that analysis has been captured. */
export function canShowGenderCut(consentCaptured: boolean): boolean {
  return consentCaptured;
}

/* ---------- Fairness fixtures ---------- */

export const recognitionPoints = employees
  .filter((e) => e.status !== "exited")
  .map((e) => e.points);

export const departmentCoverage = [
  { group: "Manufacturing", coverage: 64, people: 80 },
  { group: "Quality", coverage: 78, people: 40 },
  { group: "Sales", coverage: 71, people: 45 },
  { group: "Operations", coverage: 49, people: 35 },
];
export const locationCoverage = [
  { group: "Coimbatore plant", coverage: 68, people: 120 },
  { group: "Tiruppur unit", coverage: 52, people: 50 },
  { group: "Chennai office", coverage: 74, people: 30 },
];
export const shiftCoverage = [
  { group: "Day shift", coverage: 72, people: 110 },
  { group: "Night shift", coverage: 41, people: 60 },
  { group: "General", coverage: 69, people: 30 },
];
export const tenureCoverage = [
  { group: "Under 1 year", coverage: 44, people: 38 },
  { group: "1–3 years", coverage: 66, people: 72 },
  { group: "3+ years", coverage: 73, people: 90 },
];

export const managerSpread = [
  { manager: "Priya Raman", team: 18, distinct: 15 },
  { manager: "Arjun Mehta", team: 22, distinct: 9 },
  { manager: "Kavitha Iyer", team: 14, distinct: 12 },
  { manager: "Suresh Babu", team: 20, distinct: 6 },
  { manager: "Meena Pillai", team: 16, distinct: 13 },
];

export const negativeReport = {
  zeroRecognition: [
    { name: "Ramesh Kumar", team: "Spinning – night", days: 94 },
    { name: "Lakshmi Devi", team: "Packing", days: 88 },
    { name: "Imran Shaikh", team: "Dyeing", days: 76 },
    { name: "Divya Nair", team: "Accounts", days: 71 },
  ],
  noWorkflowTeams: [
    { team: "Maintenance", people: 12 },
    { team: "Stores", people: 8 },
  ],
  noWinnerBoards: [{ board: "Night shift output", periods: 3 }],
};

export const retentionSignals = [
  { team: "Spinning – night", signal: "Recognition dropped from 11 to 2 per month", people: 14 },
  { team: "Packing", signal: "No recognition from manager in 60 days", people: 9 },
];

export type GamingAlert = {
  id: string;
  kind: string;
  detail: string;
  evidence: string;
  status: "open" | "cleared" | "held";
};

export const gamingAlerts: GamingAlert[] = [
  {
    id: "ga-1",
    kind: "Reciprocal recognition",
    detail: "Two people recognised each other 9 times in 14 days",
    evidence: "18 shoutouts, 2 people, no other givers",
    status: "open",
  },
  {
    id: "ga-2",
    kind: "Same-minute bulk entries",
    detail: "Native capture entries submitted 40 at a time at 23:58",
    evidence: "Form: Daily output · 3 nights in a row",
    status: "open",
  },
  {
    id: "ga-3",
    kind: "Target edited after period",
    detail: "Quarterly target lowered 2 days after the quarter closed",
    evidence: "Board: Sales – South · changed by Arjun Mehta",
    status: "open",
  },
  {
    id: "ga-4",
    kind: "Self-approval attempt",
    detail: "Manager tried to approve a reward for themself",
    evidence: "Blocked automatically · logged",
    status: "cleared",
  },
];

/** Private, manager-only view. Neutral facts only — never reasons or speculation. */
export const privateFollowUps = [
  { name: "Ganesh Murthy", metric: "Output vs target", value: "71%", periods: 2 },
  { name: "Sangeetha R", metric: "Quality pass rate", value: "88%", periods: 1 },
];

/* ---------- Campaigns ---------- */

export type Campaign = {
  id: string;
  name: string;
  festival: string;
  start: string;
  end: string;
  budget: number;
  status: "draft" | "scheduled" | "live" | "ended";
  audience: string;
};

export const festivals = [
  { name: "Pongal", month: "January" },
  { name: "Republic Day", month: "January" },
  { name: "Holi", month: "March" },
  { name: "Ugadi", month: "March / April" },
  { name: "Vishu", month: "April" },
  { name: "Eid al-Fitr", month: "varies" },
  { name: "Independence Day", month: "August" },
  { name: "Onam", month: "August / September" },
  { name: "Ganesh Chaturthi", month: "September" },
  { name: "Durga Puja", month: "October" },
  { name: "Diwali", month: "October / November" },
  { name: "Christmas", month: "December" },
];

export const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Diwali thank-you week",
    festival: "Diwali",
    start: "20/10/2026",
    end: "27/10/2026",
    budget: 250000,
    status: "scheduled",
    audience: "Everyone",
  },
  {
    id: "c2",
    name: "Onam safety stars",
    festival: "Onam",
    start: "25/08/2026",
    end: "05/09/2026",
    budget: 80000,
    status: "ended",
    audience: "Manufacturing",
  },
  {
    id: "c3",
    name: "Pongal harvest bonus",
    festival: "Pongal",
    start: "13/01/2027",
    end: "16/01/2027",
    budget: 120000,
    status: "draft",
    audience: "Coimbatore plant",
  },
];

/* ---------- Compliance ---------- */

export type LegalBasis = "legitimate_use_employment" | "consent";

export const purposes: { purpose: string; basis: LegalBasis; plain: string }[] = [
  {
    purpose: "Performance recognition",
    basis: "legitimate_use_employment",
    plain: "Needed to run rewards at work",
  },
  { purpose: "Public leaderboard", basis: "consent", plain: "Only with your yes" },
  { purpose: "WhatsApp messages", basis: "consent", plain: "Only with your yes (Meta rule)" },
  { purpose: "Marketing offers", basis: "consent", plain: "Only with your yes" },
  { purpose: "Payroll export", basis: "legitimate_use_employment", plain: "Needed for salary tax" },
];

/** Privacy notice text per language; Telugu is intentionally missing to show the fallback. */
export const noticeText: Record<string, string> = {
  English:
    "Radha Krishna Mills uses your work data (attendance, output, sales) to recognise and reward you. We share only what each purpose below needs. You can see, correct or delete your data, or withdraw consent, from Profile → Privacy or by messaging HR.",
  தமிழ்:
    "உங்களை அங்கீகரித்து வெகுமதி வழங்க ராதா கிருஷ்ணா மில்ஸ் உங்கள் பணித் தரவை (வருகை, உற்பத்தி, விற்பனை) பயன்படுத்துகிறது. ஒவ்வொரு நோக்கத்திற்கும் தேவையானதை மட்டுமே பகிர்கிறோம். உங்கள் தரவைப் பார்க்க, திருத்த, நீக்க அல்லது ஒப்புதலைத் திரும்பப் பெற சுயவிவரம் → தனியுரிமை.",
  हिन्दी:
    "राधा कृष्णा मिल्स आपको पहचान और इनाम देने के लिए आपके काम का डेटा (हाज़िरी, उत्पादन, बिक्री) इस्तेमाल करती है। हर उद्देश्य के लिए उतना ही डेटा साझा होता है जितना ज़रूरी है। प्रोफ़ाइल → गोपनीयता से आप अपना डेटा देख, सुधार, मिटा या सहमति वापस ले सकते हैं।",
};

export const noticeVersions = [
  { version: 3, status: "draft" as const, published: "—", acknowledged: 0 },
  { version: 2, status: "published" as const, published: "01/07/2026", acknowledged: 162 },
  { version: 1, status: "retired" as const, published: "15/01/2026", acknowledged: 140 },
];
export const NOTICE_AUDIENCE = 199;

export type ConsentRecord = {
  id: string;
  employee: string;
  code: string;
  purpose: string;
  state: "granted" | "withdrawn" | "acknowledged";
  channel: "web" | "WhatsApp" | "paper";
  /** Message ID or IP address. */
  evidence: string;
  capturedAt: string;
  withdrawnAt?: string;
};

export const consentRecords: ConsentRecord[] = employees.slice(0, 24).map((e, i) => {
  const withdrawn = i % 7 === 3;
  const channel = i % 3 === 0 ? "paper" : i % 2 === 0 ? "WhatsApp" : "web";
  return {
    id: `CN-${4100 + i}`,
    employee: e.name,
    code: e.code,
    purpose: purposes[i % purposes.length]?.purpose ?? "Performance recognition",
    state: withdrawn ? "withdrawn" : i % 3 === 0 ? "acknowledged" : "granted",
    channel,
    evidence:
      channel === "WhatsApp"
        ? `wamid.HBgM${91000 + i * 37}`
        : channel === "web"
          ? `IP 10.0.4.${i + 10}`
          : `Scan PAPER-${200 + i}.pdf`,
    capturedAt: `${String((i % 27) + 1).padStart(2, "0")}/09/2026 ${String(9 + (i % 8)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
    ...(withdrawn ? { withdrawnAt: `0${(i % 6) + 1}/10/2026 18:2${i % 10}` } : {}),
  };
});

export type DprStage = "Received" | "Acknowledged" | "Processing" | "Responded" | "Closed";

export type DprRequest = {
  id: string;
  employee: string;
  code: string;
  type: "access" | "correction" | "erasure" | "grievance" | "nomination";
  detail: string;
  received: string;
  receivedOn: Date;
  stage: DprStage;
  /** Each step is logged with who did it and when (§4.14 step 3). */
  log: { stage: DprStage; at: string; by: string }[];
};

export const DPR_SLA_DAYS = 30;
export const today = new Date(2026, 9, 8);

const dprPerson = (index: number) => employees[index] ?? employees[0];

export const dprRequests: DprRequest[] = [
  {
    id: "DPR-0142",
    employee: dprPerson(4)?.name ?? "",
    code: dprPerson(4)?.code ?? "",
    type: "access",
    detail: "Wants a copy of all recognition and reward data held about them.",
    received: "01/10/2026",
    receivedOn: new Date(2026, 9, 1),
    stage: "Processing",
    log: [
      { stage: "Received", at: "01/10/2026 10:12", by: "WhatsApp bot" },
      { stage: "Acknowledged", at: "01/10/2026 11:40", by: "Lakshmi Menon" },
      { stage: "Processing", at: "03/10/2026 09:05", by: "Lakshmi Menon" },
    ],
  },
  {
    id: "DPR-0139",
    employee: dprPerson(15)?.name ?? "",
    code: dprPerson(15)?.code ?? "",
    type: "correction",
    detail: "Joining date shows 2021; should be 2019 (affects long-service award).",
    received: "15/09/2026",
    receivedOn: new Date(2026, 8, 15),
    stage: "Acknowledged",
    log: [
      { stage: "Received", at: "15/09/2026 16:22", by: "Employee app" },
      { stage: "Acknowledged", at: "16/09/2026 10:01", by: "Lakshmi Menon" },
    ],
  },
  {
    id: "DPR-0131",
    employee: "Former employee",
    code: "RKM0198",
    type: "erasure",
    detail: "Left in June 2026. Asks for personal data to be deleted.",
    received: "05/09/2026",
    receivedOn: new Date(2026, 8, 5),
    stage: "Received",
    log: [{ stage: "Received", at: "05/09/2026 12:30", by: "Email to privacy@rkmills.in" }],
  },
  {
    id: "DPR-0136",
    employee: dprPerson(27)?.name ?? "",
    code: dprPerson(27)?.code ?? "",
    type: "nomination",
    detail: "Nominates spouse to act on their data if they are unable to.",
    received: "12/09/2026",
    receivedOn: new Date(2026, 8, 12),
    stage: "Responded",
    log: [
      { stage: "Received", at: "12/09/2026 09:15", by: "Employee app" },
      { stage: "Acknowledged", at: "12/09/2026 12:00", by: "Lakshmi Menon" },
      { stage: "Processing", at: "14/09/2026 10:30", by: "Lakshmi Menon" },
      { stage: "Responded", at: "18/09/2026 15:45", by: "Lakshmi Menon" },
    ],
  },
  {
    id: "DPR-0127",
    employee: dprPerson(19)?.name ?? "",
    code: dprPerson(19)?.code ?? "",
    type: "grievance",
    detail: "Felt the line leaderboard showed their name without asking.",
    received: "20/08/2026",
    receivedOn: new Date(2026, 7, 20),
    stage: "Closed",
    log: [
      { stage: "Received", at: "20/08/2026 08:50", by: "Kiosk feedback" },
      { stage: "Acknowledged", at: "20/08/2026 11:10", by: "Lakshmi Menon" },
      { stage: "Processing", at: "21/08/2026 09:00", by: "Lakshmi Menon" },
      { stage: "Responded", at: "25/08/2026 17:20", by: "Lakshmi Menon" },
      { stage: "Closed", at: "28/08/2026 10:00", by: "Lakshmi Menon" },
    ],
  },
];

export type RetentionClass = {
  dataClass: string;
  months: number;
  defaultMonths: number;
  next: string;
  items: string;
  noticeSent: boolean;
};

export const retentionClasses: RetentionClass[] = [
  {
    dataClass: "Raw ingest",
    months: 18,
    defaultMonths: 18,
    next: "12/11/2026",
    items: "4,210 rows",
    noticeSent: true,
  },
  {
    dataClass: "Canonical events",
    months: 36,
    defaultMonths: 36,
    next: "—",
    items: "0 due",
    noticeSent: false,
  },
  {
    dataClass: "Ledger",
    months: 96,
    defaultMonths: 96,
    next: "—",
    items: "0 due",
    noticeSent: false,
  },
  {
    dataClass: "Audit",
    months: 96,
    defaultMonths: 96,
    next: "—",
    items: "0 due",
    noticeSent: false,
  },
];

export const taxRows = employees.slice(0, 40).map((e, i) => ({
  name: e.name,
  code: e.code,
  cumulative: i === 0 ? 16200 : i === 1 ? 14100 : i === 2 ? 12500 : 1800 + ((i * 937) % 9000),
}));

export const auditTypeLabel: Record<string, string> = {
  reward: "Rewards & approvals",
  workflow: "Workflows",
  budget: "Budget",
  identity: "Identity & data",
  consent: "Consent",
  ai: "AI interactions",
  payroll: "Payroll",
  privacy: "Privacy requests",
  settings: "Settings",
};

const seededAudit: [string, string, string, string, string][] = [
  [
    "07/10/2026 18:05",
    "System",
    "Workflow run finished",
    "Line star weekly · 3 winners · run_line_star_2610_a91c",
    "workflow",
  ],
  [
    "07/10/2026 17:42",
    "Lakshmi Menon",
    "AI Copilot proposal saved as draft",
    "“Top 2 support agents by CSAT” · cites ev-csat-2609, ev-tickets-2609",
    "ai",
  ],
  [
    "07/10/2026 16:10",
    "Ramesh Krishnan",
    "Approved reward",
    "AP-1042 · Meera Nair · ₹2,000",
    "reward",
  ],
  ["07/10/2026 11:26", "Vikram Rao", "Rejected reward", "AP-1039 · reason: data error", "reward"],
  [
    "06/10/2026 19:02",
    "System",
    "Consent withdrawn",
    "WhatsApp messages · RKM0031 · suppressed immediately",
    "consent",
  ],
  [
    "06/10/2026 15:38",
    "Lakshmi Menon",
    "AI Copilot answered a question",
    "“Who has not been recognised in 60 days?” · 2 evidence ids",
    "ai",
  ],
  ["06/10/2026 12:15", "Lakshmi Menon", "Linked identity", "zoho:8812 → RKM0044", "identity"],
  [
    "05/10/2026 17:20",
    "Lakshmi Menon",
    "Moved budget",
    "₹20,000 Quality → Sales A — Vikram",
    "budget",
  ],
  ["05/10/2026 10:48", "Vikram Rao", "Changed target", "Sales A · Q3 · ₹42L → ₹45L", "workflow"],
  [
    "04/10/2026 09:30",
    "System",
    "AI suspicious input blocked",
    "Prompt tried to change approval rules · logged for admin",
    "ai",
  ],
  [
    "03/10/2026 16:44",
    "Lakshmi Menon",
    "Activated workflow",
    "Perfect attendance monthly · v2",
    "workflow",
  ],
  [
    "03/10/2026 09:05",
    "Lakshmi Menon",
    "Data request moved to Processing",
    "DPR-0142 · access",
    "privacy",
  ],
  [
    "02/10/2026 14:12",
    "Ramesh Krishnan",
    "Changed role",
    "Karthik Iyer · Manager → Manager + Approver",
    "settings",
  ],
  [
    "01/10/2026 11:40",
    "Lakshmi Menon",
    "Data request moved to Acknowledged",
    "DPR-0142 · access",
    "privacy",
  ],
  [
    "01/10/2026 10:02",
    "Lakshmi Menon",
    "Exported payroll file",
    "payroll_export_2026_09.csv · Keka · 42 rows",
    "payroll",
  ],
  [
    "01/10/2026 09:00",
    "System",
    "Budget top-up",
    "Organisation pool +₹1,00,000 (Q3 release)",
    "budget",
  ],
];

export const auditLog = seededAudit.map(([at, actor, action, target, type], i) => ({
  id: `AU-${9100 - i}`,
  at,
  actor,
  action,
  target,
  type,
  hash: `${(0x9a3f1c + i * 7919).toString(16)}…${(0x41b2 + i * 31).toString(16)}`,
}));

/* ---------- Settings ---------- */

export const roles = ["Owner", "HR admin", "Manager", "Employee", "Finance"] as const;
export const permissions = [
  { name: "Approve rewards", grants: [true, true, true, false, false] },
  { name: "Move budget", grants: [true, true, false, false, true] },
  { name: "Edit workflows", grants: [true, true, false, false, false] },
  { name: "See private follow-ups", grants: [true, false, true, false, false] },
  { name: "Export payroll", grants: [true, true, false, false, true] },
  { name: "Manage privacy", grants: [true, true, false, false, false] },
];

export const notificationTemplates = [
  { name: "Recognition received", channel: "WhatsApp", locales: ["en", "ta", "hi"] },
  { name: "Reward approved", channel: "In-app", locales: ["en", "ta", "hi", "te"] },
  { name: "Redemption OTP", channel: "WhatsApp", locales: ["en", "ta"] },
  { name: "Weekly summary", channel: "Email", locales: ["en"] },
];

export const whatsappTemplates = [
  { name: "recognition_alert_v2", category: "Utility", status: "Approved" },
  { name: "redeem_otp", category: "Authentication", status: "Approved" },
  { name: "diwali_campaign", category: "Marketing", status: "Pending" },
  { name: "balance_reply", category: "Utility", status: "Rejected" },
];

export const invoices = [
  { id: "INV-2026-09", date: "01/09/2026", amount: 18880 },
  { id: "INV-2026-08", date: "01/08/2026", amount: 18880 },
  { id: "INV-2026-07", date: "01/07/2026", amount: 15340 },
];
