import { employees } from "@/lib/mock-data";

/**
 * Pending decisions (checklist §4.8, D-02, M-04). Every item carries the evidence a
 * decision-maker needs: metric values with their source, the decision trace, the raw
 * source records, the budget impact and the tax impact.
 */
export type ApprovalStatus = "pending" | "escalated" | "auto_approved";
export type RewardKind = "voucher_direct" | "points" | "payroll_cash" | "experience";

export const rewardKindLabel: Record<RewardKind, string> = {
  voucher_direct: "Voucher (direct)",
  points: "Points to wallet",
  payroll_cash: "Cash via payroll",
  experience: "Experience",
};

export type Approval = {
  id: string;
  workflow: string;
  workflowId: string | null;
  employee: string;
  code: string;
  initials: string;
  department: string;
  team: string;
  location: string;
  recognitionType: string;
  reason: string;
  source: string;
  points: number;
  rupees: number;
  currency: "COINS" | "INR";
  rewardKind: RewardKind;
  /** Upper limit a modifier may raise the amount to, in points. */
  maxPoints: number;
  hoursAgo: number;
  slaHours: number;
  status: ApprovalStatus;
  submitted: string;
  evidence: boolean;
  metrics: { label: string; value: string; source: string }[];
  trace: string;
  traceSteps: { title: string; detail: string; passed: boolean | null }[];
  sourceRecords: { id: string; source: string; summary: string }[];
  budget: { pool: string; remaining: number };
  tax: { cumulative: number; nature: "Non-cash gift" | "Cash equivalent" | "Meal voucher" };
  flags: string[];
};

const person = (index: number) => {
  const e = employees[index];
  const name = e?.name ?? "Employee";
  return {
    employee: name,
    code: e?.code ?? "RKM0000",
    initials: name
      .split(" ")
      .map((part) => part[0])
      .join(""),
    location: e?.location ?? "Coimbatore",
    department: e?.department ?? "Operations",
    team: e?.team ?? "Operations A",
  };
};

export const approvals: Approval[] = [
  {
    id: "ap-1",
    ...person(1),
    workflow: "Zero-defect shift",
    workflowId: "wf-quality",
    recognitionType: "Quality Champion",
    reason: "Zero defects across 4 Friday shifts",
    source: "Zero-defect shift",
    points: 400,
    rupees: 400,
    currency: "COINS",
    rewardKind: "points",
    maxPoints: 600,
    hoursAgo: 6,
    slaHours: 48,
    status: "pending",
    submitted: "08/10/2026",
    evidence: true,
    metrics: [
      { label: "Defects found", value: "0 in 4 shifts", source: "Google Sheets · Quality log" },
      { label: "Pieces inspected", value: "3,240", source: "Google Sheets · Quality log" },
    ],
    trace: "Passed all 4 Friday shift checks with 0 defects; minimum 500 pieces per shift met.",
    traceSteps: [
      { title: "Filter", detail: "Quality department · active · tenure ≥ 30 days", passed: true },
      { title: "Threshold", detail: "Defects = 0 for every Friday shift", passed: true },
      { title: "Threshold", detail: "Pieces inspected ≥ 500 per shift (min 780)", passed: true },
      { title: "Approval", detail: "Waiting for you", passed: null },
    ],
    sourceRecords: [
      {
        id: "QL-2026-10-04-B",
        source: "Quality log",
        summary: "04/10 · Shift B · 820 pcs · 0 defects",
      },
      {
        id: "QL-2026-09-27-B",
        source: "Quality log",
        summary: "27/09 · Shift B · 780 pcs · 0 defects",
      },
    ],
    budget: { pool: "Quality FY26-27", remaining: 42000 },
    tax: { cumulative: 3200, nature: "Non-cash gift" },
    flags: [],
  },
  {
    id: "ap-2",
    ...person(18),
    workflow: "Sales target achievers",
    workflowId: "wf-sales",
    recognitionType: "Sales Star",
    reason: "Sales 128% of September target",
    source: "Sales target achievers",
    points: 3000,
    rupees: 3000,
    currency: "COINS",
    rewardKind: "voucher_direct",
    maxPoints: 4000,
    hoursAgo: 40,
    slaHours: 48,
    status: "pending",
    submitted: "07/10/2026",
    evidence: true,
    metrics: [
      {
        label: "Sales vs target",
        value: "128% (₹ 6,40,000 of ₹ 5,00,000)",
        source: "Zoho CRM · Deals",
      },
      { label: "Deals closed", value: "14", source: "Zoho CRM · Deals" },
    ],
    trace: "Ranked #1 by sales_vs_target in Sales A; minimum 5 closed deals passed.",
    traceSteps: [
      { title: "Filter", detail: "Sales department · active", passed: true },
      { title: "Aggregate", detail: "Sum of Closed Won deals, September 2026", passed: true },
      { title: "Rank", detail: "#1 of 8 by sales_vs_target (128%)", passed: true },
      { title: "Approval", detail: "Waiting for you", passed: null },
    ],
    sourceRecords: [
      {
        id: "ZOHO-DEAL-88213",
        source: "Zoho CRM",
        summary: "Salem distributor · ₹ 2,10,000 · Closed Won 18/09",
      },
      {
        id: "ZOHO-DEAL-88190",
        source: "Zoho CRM",
        summary: "Erode retail chain · ₹ 1,45,000 · Closed Won 11/09",
      },
      {
        id: "ZOHO-DEAL-88102",
        source: "Zoho CRM",
        summary: "Tiruppur exporter · ₹ 98,000 · Closed Won 04/09",
      },
    ],
    budget: { pool: "Sales FY26-27", remaining: 120000 },
    tax: { cumulative: 12500, nature: "Non-cash gift" },
    flags: ["Crosses ₹15,000 yearly gift limit — tax will apply"],
  },
  {
    id: "ap-3",
    ...person(3),
    workflow: "Manager nomination",
    workflowId: null,
    recognitionType: "Above & Beyond",
    reason: "Handled the boiler shutdown on night shift",
    source: "Manager nomination",
    points: 300,
    rupees: 300,
    currency: "COINS",
    rewardKind: "points",
    maxPoints: 500,
    hoursAgo: 52,
    slaHours: 48,
    status: "escalated",
    submitted: "06/10/2026",
    evidence: false,
    metrics: [
      {
        label: "Nominated by",
        value: "Suresh Babu (Shift supervisor)",
        source: "Manual nomination",
      },
    ],
    trace: "Manual nomination — no metric rule. Escalated to HR because the 48-hour SLA passed.",
    traceSteps: [
      { title: "Manual trigger", detail: "Nominated by shift supervisor on 06/10", passed: true },
      { title: "Approval", detail: "SLA of 48 hours passed → escalated to HR", passed: null },
    ],
    sourceRecords: [
      {
        id: "NOM-0412",
        source: "Nomination form",
        summary: "Night shift 05/10 · boiler trip handled",
      },
    ],
    budget: { pool: "Operations FY26-27", remaining: 18500 },
    tax: { cumulative: 1500, nature: "Non-cash gift" },
    flags: [],
  },
  {
    id: "ap-4",
    ...person(4),
    workflow: "Perfect attendance bonus",
    workflowId: "wf-attendance",
    recognitionType: "Perfect Attendance",
    reason: "Perfect attendance in September",
    source: "Perfect attendance bonus",
    points: 250,
    rupees: 250,
    currency: "COINS",
    rewardKind: "points",
    maxPoints: 250,
    hoursAgo: 30,
    slaHours: 72,
    status: "pending",
    submitted: "07/10/2026",
    evidence: true,
    metrics: [
      { label: "Attendance", value: "26 of 26 days (100%)", source: "Biometric CSV · September" },
    ],
    trace: "Attendance 100% ≥ rule of 100%; no late marks.",
    traceSteps: [
      { title: "Filter", detail: "Manufacturing · active · not on notice", passed: true },
      { title: "Threshold", detail: "attendance_pct = 100%", passed: true },
      { title: "Approval", detail: "Waiting for you", passed: null },
    ],
    sourceRecords: [
      {
        id: "BIO-SEP-RKM0009",
        source: "Biometric CSV",
        summary: "September · 26 present · 0 late",
      },
    ],
    budget: { pool: "Manufacturing B", remaining: 0 },
    tax: { cumulative: 4100, nature: "Non-cash gift" },
    flags: ["Manufacturing B pool is used up"],
  },
  {
    id: "ap-5",
    ...person(34),
    workflow: "Manager nomination",
    workflowId: null,
    recognitionType: "New Business",
    reason: "Brought in a new distributor in Salem",
    source: "Manager nomination",
    points: 500,
    rupees: 500,
    currency: "COINS",
    rewardKind: "voucher_direct",
    maxPoints: 1000,
    hoursAgo: 20,
    slaHours: 48,
    status: "pending",
    submitted: "07/10/2026",
    evidence: true,
    metrics: [
      {
        label: "New distributor",
        value: "Salem · first order ₹ 1,20,000",
        source: "Zoho CRM · Accounts",
      },
    ],
    trace: "Manual nomination by Vikram Rao, with CRM evidence attached.",
    traceSteps: [
      { title: "Manual trigger", detail: "Nominated by Vikram Rao", passed: true },
      { title: "Approval", detail: "Waiting for you", passed: null },
    ],
    sourceRecords: [
      {
        id: "ZOHO-ACC-2291",
        source: "Zoho CRM",
        summary: "Sri Murugan Traders, Salem · created 02/10",
      },
    ],
    budget: { pool: "Sales FY26-27", remaining: 120000 },
    tax: { cumulative: 6800, nature: "Non-cash gift" },
    flags: [],
  },
  {
    id: "ap-6",
    ...person(13),
    workflow: "Peer shout-out boost",
    workflowId: null,
    recognitionType: "Problem Solver",
    reason: "Found the root cause for yarn breakage",
    source: "Peer shout-out",
    points: 200,
    rupees: 200,
    currency: "COINS",
    rewardKind: "points",
    maxPoints: 300,
    hoursAgo: 2,
    slaHours: 72,
    status: "auto_approved",
    submitted: "08/10/2026",
    evidence: false,
    metrics: [{ label: "Shout-outs received", value: "3 this week", source: "Peer shout-outs" }],
    trace: "Peer boosts under ₹250 are auto-approved by policy; shown here for review only.",
    traceSteps: [
      { title: "Event", detail: "3rd peer shout-out in 7 days", passed: true },
      { title: "Policy", detail: "Amount below ₹250 auto-approval limit", passed: true },
    ],
    sourceRecords: [
      {
        id: "SHOUT-7781",
        source: "WhatsApp THANKS",
        summary: "From Deepa Iyer · 'Found the yarn breakage cause'",
      },
    ],
    budget: { pool: "Quality FY26-27", remaining: 42000 },
    tax: { cumulative: 900, nature: "Non-cash gift" },
    flags: [],
  },
  {
    id: "ap-7",
    ...person(50),
    workflow: "Sales target achievers",
    workflowId: "wf-sales",
    recognitionType: "Sales Star",
    reason: "Sales 112% of September target",
    source: "Sales target achievers",
    points: 1500,
    rupees: 1500,
    currency: "COINS",
    rewardKind: "voucher_direct",
    maxPoints: 2000,
    hoursAgo: 44,
    slaHours: 48,
    status: "pending",
    submitted: "07/10/2026",
    evidence: true,
    metrics: [
      {
        label: "Sales vs target",
        value: "112% (₹ 5,60,000 of ₹ 5,00,000)",
        source: "Zoho CRM · Deals",
      },
      { label: "Deals closed", value: "9", source: "Zoho CRM · Deals" },
    ],
    trace: "Ranked #2 by sales_vs_target in Sales A; minimum 5 closed deals passed.",
    traceSteps: [
      { title: "Filter", detail: "Sales department · active", passed: true },
      { title: "Rank", detail: "#2 of 8 by sales_vs_target (112%)", passed: true },
      { title: "Approval", detail: "Waiting for you", passed: null },
    ],
    sourceRecords: [
      {
        id: "ZOHO-DEAL-88177",
        source: "Zoho CRM",
        summary: "Coimbatore hospital · ₹ 2,40,000 · Closed Won 22/09",
      },
    ],
    budget: { pool: "Sales FY26-27", remaining: 120000 },
    tax: { cumulative: 5400, nature: "Non-cash gift" },
    flags: [],
  },
];

export const TAX_LIMIT = 15000;

export const rejectReasons = [
  "Does not meet the rule",
  "Duplicate request",
  "Evidence missing or unclear",
  "Already rewarded for this",
  "Other",
];

export const escalationTargets = [
  "Lakshmi Menon (HR Admin)",
  "Ramesh Krishnan (Owner)",
  "Finance team",
];

/** Manager scope (checklist §1.3): a manager decides only for their own team. */
export const MANAGER_TEAM = "Sales A";

export function approvalsFor(persona: string): Approval[] {
  return persona === "manager" ? approvals.filter((a) => a.team === MANAGER_TEAM) : approvals;
}

/** A pool is exhausted when its remaining budget is zero; approving then queues instead of paying. */
export function isBudgetExhausted(approval: Approval): boolean {
  return approval.budget.remaining <= 0 || approval.flags.some((flag) => flag.includes("used up"));
}

/** Hours left before the SLA passes, relative to when the prototype data was loaded. */
export function slaHoursLeft(approval: Approval, nowOffsetHours = 0): number {
  return approval.slaHours - approval.hoursAgo - nowOffsetHours;
}
