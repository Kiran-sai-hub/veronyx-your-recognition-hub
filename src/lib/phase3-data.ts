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
  { group: "Production", coverage: 64, people: 80 },
  { group: "Quality", coverage: 78, people: 40 },
  { group: "Sales", coverage: 71, people: 45 },
  { group: "Office & HR", coverage: 49, people: 35 },
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
    audience: "Production",
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

export const purposes = [
  { purpose: "Performance recognition", basis: "Employment (legitimate use)" },
  { purpose: "Public leaderboard", basis: "Consent" },
  { purpose: "WhatsApp messages", basis: "Consent" },
  { purpose: "Marketing offers", basis: "Consent" },
  { purpose: "Payroll export", basis: "Employment (legitimate use)" },
  { purpose: "Gender-based fairness analysis", basis: "Consent" },
];

export type ConsentRecord = {
  employee: string;
  purpose: string;
  state: "granted" | "withdrawn" | "acknowledged";
  channel: "web" | "WhatsApp" | "paper";
  evidence: string;
  at: string;
};

export const consentRecords: ConsentRecord[] = employees.slice(0, 24).map((e, i) => ({
  employee: e.name,
  purpose: purposes[i % purposes.length].purpose,
  state: i % 7 === 3 ? "withdrawn" : i % 3 === 0 ? "acknowledged" : "granted",
  channel: i % 3 === 0 ? "paper" : i % 2 === 0 ? "WhatsApp" : "web",
  evidence: i % 2 === 0 ? `wamid.HBg${1000 + i}` : `IP 10.0.4.${i + 10}`,
  at: `${String((i % 27) + 1).padStart(2, "0")}/09/2026`,
}));

export type DprRequest = {
  id: string;
  employee: string;
  type: "access" | "correction" | "erasure" | "grievance" | "nomination";
  received: string;
  receivedOn: Date;
  stage: "Received" | "Acknowledged" | "Processing" | "Responded" | "Closed";
};

export const DPR_SLA_DAYS = 30;
export const today = new Date(2026, 9, 8);

export const dprRequests: DprRequest[] = [
  {
    id: "DPR-0142",
    employee: "Lakshmi Devi",
    type: "access",
    received: "01/10/2026",
    receivedOn: new Date(2026, 9, 1),
    stage: "Processing",
  },
  {
    id: "DPR-0139",
    employee: "Imran Shaikh",
    type: "correction",
    received: "15/09/2026",
    receivedOn: new Date(2026, 8, 15),
    stage: "Acknowledged",
  },
  {
    id: "DPR-0131",
    employee: "Former employee (EMP-0198)",
    type: "erasure",
    received: "05/09/2026",
    receivedOn: new Date(2026, 8, 5),
    stage: "Received",
  },
  {
    id: "DPR-0127",
    employee: "Divya Nair",
    type: "grievance",
    received: "20/08/2026",
    receivedOn: new Date(2026, 7, 20),
    stage: "Closed",
  },
];

export const retentionClasses = [
  { dataClass: "Raw ingest", months: 18, next: "12/11/2026", items: "4,210 rows" },
  { dataClass: "Canonical events", months: 36, next: "—", items: "0 due" },
  { dataClass: "Ledger", months: 96, next: "—", items: "0 due" },
  { dataClass: "Audit", months: 96, next: "—", items: "0 due" },
];

export const taxRows = employees.slice(0, 40).map((e, i) => ({
  name: e.name,
  code: e.code,
  cumulative: i === 0 ? 16200 : i === 1 ? 14100 : i === 2 ? 12500 : 1800 + ((i * 937) % 9000),
}));

export const auditLog = Array.from({ length: 18 }, (_, i) => {
  const actions = [
    ["Priya Raman", "Approved reward", "RW-2291 · ₹2,000"],
    ["System", "Workflow run finished", "Monthly top performer · 3 winners"],
    ["Arjun Mehta", "Changed target", "Sales – South · Q3"],
    ["HR Admin", "Linked identity", "zoho:8812 → EMP-0044"],
    ["HR Admin", "Moved budget", "₹20,000 Quality → Sales"],
    ["System", "Consent withdrawn", "WhatsApp messages · EMP-0031"],
  ] as const;
  const [actor, action, target] = actions[i % actions.length] ?? (["System", "Event", ""] as const);
  return {
    id: `AU-${9100 - i}`,
    at: `${String(8 - Math.floor(i / 6)).padStart(2, "0")}/10/2026 ${String(17 - (i % 6)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    actor,
    action,
    target,
    hash: `${(0x9a3f1c + i * 7919).toString(16)}…${(0x41b2 + i * 31).toString(16)}`,
  };
});

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
