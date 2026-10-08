import { employees, rewards } from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Connectors & data health (C- screens)
// ---------------------------------------------------------------------------

export type ConnectorStatus = "connected" | "attention" | "failed" | "not-connected";

export type Connector = {
  id: string;
  name: string;
  kind: string;
  status: ConnectorStatus;
  lastSync: string;
  records: number;
  note?: string;
};

export const connectors: Connector[] = [
  {
    id: "csv-sales",
    name: "Monthly sales file",
    kind: "CSV / Excel upload",
    status: "attention",
    lastSync: "07/10/2026 18:30",
    records: 48,
    note: "Last file was missing the “Target” column.",
  },
  {
    id: "gsheet-attendance",
    name: "Attendance register",
    kind: "Google Sheets",
    status: "connected",
    lastSync: "08/10/2026 06:00",
    records: 200,
  },
  {
    id: "zoho-crm",
    name: "Zoho CRM — distributor orders",
    kind: "Zoho CRM",
    status: "failed",
    lastSync: "05/10/2026 09:12",
    records: 0,
    note: "Connection expired. Sign in to Zoho again to resume.",
  },
  {
    id: "freshdesk",
    name: "Freshdesk — support tickets",
    kind: "Freshdesk",
    status: "connected",
    lastSync: "08/10/2026 10:45",
    records: 3120,
  },
  {
    id: "email-suggestions",
    name: "Safety suggestions inbox",
    kind: "Email",
    status: "not-connected",
    lastSync: "Never",
    records: 0,
  },
  {
    id: "webhook-erp",
    name: "Production ERP webhook",
    kind: "Webhook",
    status: "connected",
    lastSync: "08/10/2026 11:00",
    records: 1842,
  },
];

export type ConnectorCategory =
  "CRM" | "Helpdesk" | "HRIS" | "Sheets" | "Email" | "Webhook" | "Custom";
export type AuthType =
  "OAuth" | "API key" | "Service account" | "File upload" | "Forwarding address" | "Signed URL";

export type GalleryConnector = {
  id: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  auth: AuthType;
  syncMode: "webhook" | "poll" | "upload" | "push";
  setupTime: string;
  objects: string[];
  fields: { name: string; type: string; sample: string; maps: string }[];
};

const salesFields = [
  { name: "Deal_Name", type: "text", sample: "Salem distributor", maps: "ignore" },
  { name: "Amount", type: "currency", sample: "₹ 2,10,000", maps: "amount_paise" },
  { name: "Owner.email", type: "email", sample: "pooja.kumar@rkmills.in", maps: "subject_ref" },
  { name: "Stage", type: "picklist", sample: "Closed Won", maps: "status" },
  { name: "Closing_Date", type: "date", sample: "18/09/2026", maps: "occurred_at" },
  { name: "id", type: "id", sample: "88213", maps: "source_record_id" },
];

export const connectorGallery: GalleryConnector[] = [
  {
    id: "csv",
    name: "CSV / Excel upload",
    description: "Upload a monthly file from your computer.",
    category: "Sheets",
    auth: "File upload",
    syncMode: "upload",
    setupTime: "2 min",
    objects: ["Rows in the first sheet"],
    fields: salesFields,
  },
  {
    id: "gsheet",
    name: "Google Sheets",
    description: "Keep a shared sheet in sync automatically.",
    category: "Sheets",
    auth: "Service account",
    syncMode: "poll",
    setupTime: "5 min",
    objects: ["Daily_Output tab", "Attendance tab"],
    fields: [
      { name: "Date", type: "date", sample: "07/10/2026", maps: "occurred_at" },
      { name: "Emp Code", type: "text", sample: "RKM0009", maps: "subject_ref" },
      { name: "Units", type: "number", sample: "412", maps: "value" },
      { name: "Line", type: "text", sample: "Line B", maps: "team" },
      { name: "Row", type: "id", sample: "R-2291", maps: "source_record_id" },
    ],
  },
  {
    id: "zoho-crm",
    name: "Zoho CRM",
    description: "Pull deals and targets from Zoho CRM.",
    category: "CRM",
    auth: "OAuth",
    syncMode: "webhook",
    setupTime: "5 min",
    objects: ["Deals", "Accounts", "Targets"],
    fields: salesFields,
  },
  {
    id: "zoho-bigin",
    name: "Zoho Bigin",
    description: "Use Bigin pipelines as a performance source.",
    category: "CRM",
    auth: "OAuth",
    syncMode: "poll",
    setupTime: "5 min",
    objects: ["Pipelines", "Contacts"],
    fields: salesFields,
  },
  {
    id: "freshdesk",
    name: "Freshdesk",
    description: "Tickets resolved and CSAT ratings.",
    category: "Helpdesk",
    auth: "API key",
    syncMode: "poll",
    setupTime: "4 min",
    objects: ["Tickets", "Satisfaction ratings", "Agents"],
    fields: [
      { name: "ticket_id", type: "id", sample: "51022", maps: "source_record_id" },
      { name: "responder_email", type: "email", sample: "agent.x@support", maps: "subject_ref" },
      { name: "rating", type: "number", sample: "5", maps: "value" },
      { name: "resolved_at", type: "datetime", sample: "07/10/2026 16:40", maps: "occurred_at" },
    ],
  },
  {
    id: "keka",
    name: "Keka HR",
    description: "Employee master and attendance from Keka.",
    category: "HRIS",
    auth: "API key",
    syncMode: "poll",
    setupTime: "5 min",
    objects: ["Employees", "Attendance"],
    fields: salesFields.slice(2),
  },
  {
    id: "email",
    name: "Email inbox",
    description: "Forward structured emails to a Veronyx address.",
    category: "Email",
    auth: "Forwarding address",
    syncMode: "push",
    setupTime: "3 min",
    objects: ["Emails with a CSV attachment"],
    fields: salesFields.slice(1, 4),
  },
  {
    id: "webhook",
    name: "Webhook",
    description: "Send events from your own software.",
    category: "Webhook",
    auth: "Signed URL",
    syncMode: "webhook",
    setupTime: "10 min",
    objects: ["production.output", "quality.inspection"],
    fields: [
      { name: "event_id", type: "id", sample: "evt_8812", maps: "source_record_id" },
      { name: "employee_code", type: "text", sample: "RKM0012", maps: "subject_ref" },
      { name: "units", type: "number", sample: "398", maps: "value" },
      { name: "ts", type: "datetime", sample: "08/10/2026 11:00", maps: "occurred_at" },
    ],
  },
  {
    id: "custom",
    name: "Custom REST API",
    description: "Poll any JSON API with a key.",
    category: "Custom",
    auth: "API key",
    syncMode: "poll",
    setupTime: "15 min",
    objects: ["Endpoint of your choice"],
    fields: salesFields.slice(1, 5),
  },
];

export const dataHealth = {
  matchedRecords: 1842,
  unmatchedRecords: 7,
  duplicateRecords: 3,
  failedSources: 1,
  lastImport: "08/10/2026 11:00",
};

// ---------------------------------------------------------------------------
// Field mapping, identity resolution, field registry (C- screens)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Budget & Ledger
// ---------------------------------------------------------------------------

export type BudgetPool = {
  id: string;
  name: string;
  level: "Organisation" | "Department" | "Manager";
  parent: string | null;
  allocated: number;
  spent: number;
  expires: string;
};

export const budgetPools: BudgetPool[] = [
  {
    id: "pool-org",
    name: "Radha Krishna Mills",
    level: "Organisation",
    parent: null,
    allocated: 500000,
    spent: 281400,
    expires: "31/03/2027",
  },
  {
    id: "pool-mfg",
    name: "Manufacturing",
    level: "Department",
    parent: "pool-org",
    allocated: 180000,
    spent: 112000,
    expires: "31/03/2027",
  },
  {
    id: "pool-quality",
    name: "Quality",
    level: "Department",
    parent: "pool-org",
    allocated: 90000,
    spent: 41200,
    expires: "31/03/2027",
  },
  {
    id: "pool-sales",
    name: "Sales",
    level: "Department",
    parent: "pool-org",
    allocated: 140000,
    spent: 86000,
    expires: "31/03/2027",
  },
  {
    id: "pool-ops",
    name: "Operations",
    level: "Department",
    parent: "pool-org",
    allocated: 90000,
    spent: 42200,
    expires: "31/03/2027",
  },
  {
    id: "pool-mfg-a",
    name: "Manufacturing A — Selvi",
    level: "Manager",
    parent: "pool-mfg",
    allocated: 60000,
    spent: 38500,
    expires: "31/12/2026",
  },
  {
    id: "pool-mfg-b",
    name: "Manufacturing B — Karthik",
    level: "Manager",
    parent: "pool-mfg",
    allocated: 40000,
    spent: 40000,
    expires: "31/12/2026",
  },
  {
    id: "pool-sales-a",
    name: "Sales A — Vikram",
    level: "Manager",
    parent: "pool-sales",
    allocated: 70000,
    spent: 51300,
    expires: "31/12/2026",
  },
];

export function poolRemaining(pool: BudgetPool): number {
  return pool.allocated - pool.spent;
}

export type MoveBudgetCheck =
  { ok: true; fromAfter: number; toAfter: number } | { ok: false; reason: string };

/** Budget never moves on its own — the screen asks the user to confirm first. */
export function checkBudgetMove(from: BudgetPool, to: BudgetPool, amount: number): MoveBudgetCheck {
  if (from.id === to.id) return { ok: false, reason: "Choose two different pools." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { ok: false, reason: "Enter an amount greater than zero." };
  if (amount > poolRemaining(from))
    return {
      ok: false,
      reason: `Only ₹ ${poolRemaining(from).toLocaleString("en-IN")} is left in ${from.name}.`,
    };
  return { ok: true, fromAfter: poolRemaining(from) - amount, toAfter: poolRemaining(to) + amount };
}

export type LedgerEntry = {
  id: string;
  date: string;
  type: "Allocation" | "Top-up" | "Reward" | "Expiry" | "Move";
  pool: string;
  amount: number;
  by: string;
};

export const ledgerEntries: LedgerEntry[] = [
  {
    id: "le-1",
    date: "08/10/2026",
    type: "Reward",
    pool: "Sales A — Vikram",
    amount: -1200,
    by: "Sales target achievers",
  },
  {
    id: "le-2",
    date: "07/10/2026",
    type: "Reward",
    pool: "Manufacturing B — Karthik",
    amount: -250,
    by: "Perfect attendance bonus",
  },
  {
    id: "le-3",
    date: "05/10/2026",
    type: "Top-up",
    pool: "Manufacturing",
    amount: 20000,
    by: "Lakshmi Menon",
  },
  {
    id: "le-4",
    date: "01/10/2026",
    type: "Reward",
    pool: "Manufacturing A — Selvi",
    amount: -12600,
    by: "Perfect attendance bonus",
  },
  {
    id: "le-5",
    date: "30/09/2026",
    type: "Move",
    pool: "Quality → Sales",
    amount: 10000,
    by: "Lakshmi Menon",
  },
  {
    id: "le-6",
    date: "30/09/2026",
    type: "Expiry",
    pool: "Operations",
    amount: -4800,
    by: "Q2 pool expired",
  },
  {
    id: "le-7",
    date: "01/04/2026",
    type: "Allocation",
    pool: "Radha Krishna Mills",
    amount: 500000,
    by: "Yearly budget",
  },
];

export const burnForecast = [
  { month: "Oct", actual: 34600, forecast: 36000 },
  { month: "Nov", actual: 0, forecast: 38500 },
  { month: "Dec", actual: 0, forecast: 36000 },
  { month: "Jan", actual: 0, forecast: 35000 },
  { month: "Feb", actual: 0, forecast: 34500 },
  { month: "Mar", actual: 0, forecast: 36000 },
];

/** Average monthly spend over the last three months, per pool (drives forecasting). */
export const poolBurn: Record<string, number> = {
  "pool-org": 36000,
  "pool-mfg": 14200,
  "pool-quality": 5600,
  "pool-sales": 11800,
  "pool-ops": 4400,
  "pool-mfg-a": 6400,
  "pool-mfg-b": 6700,
  "pool-sales-a": 8500,
};

export const BUDGET_TODAY = new Date(2026, 9, 8);
const DAY = 86400000;

function parseDmy(value: string): Date {
  const [d = 1, m = 1, y = 2026] = value.split("/").map(Number);
  return new Date(y, m - 1, d);
}

export type PoolForecast = {
  /** Date the pool reaches zero at the current pace, or null if nothing is being spent. */
  runOut: Date | null;
  /** True when the money runs out before the pool's expiry date. */
  runsOutEarly: boolean;
  /** Money still unspent when the pool expires (0 if it runs out first). */
  unspentAtExpiry: number;
};

/** Straight-line forecast from the pool's recent monthly burn (checklist P3 budget forecasting). */
export function forecastPool(
  pool: BudgetPool,
  burnPerMonth: number,
  from: Date = BUDGET_TODAY,
): PoolForecast {
  const remaining = poolRemaining(pool);
  const expiry = parseDmy(pool.expires);
  const daysToExpiry = Math.max(0, (expiry.getTime() - from.getTime()) / DAY);
  if (burnPerMonth <= 0) return { runOut: null, runsOutEarly: false, unspentAtExpiry: remaining };
  if (remaining <= 0) return { runOut: from, runsOutEarly: true, unspentAtExpiry: 0 };
  const daysLeft = (remaining / burnPerMonth) * 30.4;
  const runOut = new Date(from.getTime() + daysLeft * DAY);
  const spendToExpiry = (burnPerMonth / 30.4) * daysToExpiry;
  return {
    runOut,
    runsOutEarly: daysLeft < daysToExpiry,
    unspentAtExpiry: Math.max(0, Math.round((remaining - spendToExpiry) / 100) * 100),
  };
}

/** Points that will lapse soon if employees don't redeem them. */
export const pointExpiries = [
  { label: "Welcome bonus points (FY 2025-26)", people: 38, points: 7600, date: "31/03/2027" },
  { label: "Diwali 2025 campaign points", people: 12, points: 2400, date: "15/11/2026" },
];

// ---------------------------------------------------------------------------
// People & Teams (P- screens)
// ---------------------------------------------------------------------------

export const departmentSummary = ["Manufacturing", "Quality", "Sales", "Operations"].map(
  (name) => ({
    name,
    headcount: employees.filter((e) => e.department === name && e.status === "active").length,
    teams: ["A", "B", "C", "D"].map((suffix) => `${name} ${suffix}`),
  }),
);

export const locations = [
  { name: "Coimbatore", headcount: employees.filter((e) => e.location === "Coimbatore").length },
  { name: "Chennai", headcount: employees.filter((e) => e.location === "Chennai").length },
  { name: "Erode", headcount: employees.filter((e) => e.location === "Erode").length },
  { name: "Tiruppur", headcount: employees.filter((e) => e.location === "Tiruppur").length },
];

// ---------------------------------------------------------------------------
// Admin rewards & redemption orders (R- screens)
// ---------------------------------------------------------------------------

export const rewardProviders = ["Xoxoday", "Pine Labs", "Amazon direct", "In-house"] as const;

export type CatalogueItem = {
  id: string;
  title: string;
  brand: string;
  provider: string;
  sku: string;
  /** Face values offered, in rupees. */
  denominations: number[];
  points: number;
  value: number;
  category: string;
  taxNature: TaxNature;
  delivery: string;
  stock: number | null;
  active: boolean;
};

const providerFor: Record<string, string> = {
  Amazon: "Amazon direct",
  Flipkart: "Xoxoday",
  Swiggy: "Xoxoday",
  "Indian Oil": "Pine Labs",
  BookMyShow: "Pine Labs",
  "Akshaya Patra": "Xoxoday",
  "Radha Krishna Mills": "In-house",
  UPI: "In-house",
};

const natureFor = (taxNature: string): TaxNature =>
  taxNature === "Meal voucher"
    ? "meal_voucher"
    : taxNature === "Cash equivalent"
      ? "cash_taxable"
      : "perquisite_noncash";

export const catalogueItems: CatalogueItem[] = rewards.map((reward, index) => ({
  id: reward.id,
  title: reward.title,
  brand: reward.brand,
  provider: providerFor[reward.brand] ?? "Xoxoday",
  sku: `${reward.brand.slice(0, 3).toUpperCase()}-${reward.value}-${String(index + 1).padStart(3, "0")}`,
  denominations: reward.value >= 1000 ? [500, 1000, 2000] : [reward.value],
  points: reward.points,
  value: reward.value,
  category: reward.category,
  taxNature: natureFor(reward.taxNature),
  delivery: reward.delivery,
  stock: index === 3 ? 0 : reward.delivery === "Physical" ? 46 : null,
  active: index !== 3,
}));

export type OrderStatus = "Requested" | "Hold" | "Ordered" | "Fulfilled" | "Failed";
export const orderStatuses: OrderStatus[] = ["Requested", "Hold", "Ordered", "Fulfilled", "Failed"];

export type RedemptionOrder = {
  id: string;
  employee: string;
  code: string;
  team: string;
  item: string;
  points: number;
  taxNature: TaxNature;
  status: OrderStatus;
  date: string;
  note?: string;
  refunded?: boolean;
};

const orderPerson = (index: number) => ({
  employee: employees[index]?.name ?? "",
  code: employees[index]?.code ?? "",
  team: employees[index]?.team ?? "",
});

export const redemptionOrders: RedemptionOrder[] = [
  {
    id: "ord-1047",
    ...orderPerson(18),
    item: "Amazon Pay e-gift card",
    points: 500,
    taxNature: "perquisite_noncash",
    status: "Requested",
    date: "08/10/2026",
  },
  {
    id: "ord-1043",
    ...orderPerson(1),
    item: "Swiggy meal voucher",
    points: 300,
    taxNature: "meal_voucher",
    status: "Hold",
    date: "07/10/2026",
    note: "Points held while the provider confirms the order.",
  },
  {
    id: "ord-1048",
    ...orderPerson(50),
    item: "Flipkart gift voucher",
    points: 1000,
    taxNature: "perquisite_noncash",
    status: "Ordered",
    date: "07/10/2026",
  },
  {
    id: "ord-1044",
    ...orderPerson(6),
    item: "Fuel gift card",
    points: 1000,
    taxNature: "perquisite_noncash",
    status: "Failed",
    date: "07/10/2026",
    note: "Provider timeout — safe to retry. Points are held until retry or refund.",
  },
  {
    id: "ord-1042",
    ...orderPerson(8),
    item: "Amazon Pay e-gift card",
    points: 500,
    taxNature: "perquisite_noncash",
    status: "Fulfilled",
    date: "06/10/2026",
  },
  {
    id: "ord-1045",
    ...orderPerson(13),
    item: "UPI cash reward",
    points: 1100,
    taxNature: "cash_taxable",
    status: "Failed",
    date: "05/10/2026",
    note: "UPI ID rejected by the bank. Points returned to the wallet.",
    refunded: true,
  },
  {
    id: "ord-1046",
    ...orderPerson(34),
    item: "Movies for two",
    points: 500,
    taxNature: "perquisite_noncash",
    status: "Fulfilled",
    date: "04/10/2026",
  },
];

export type OfflineReward = {
  id: string;
  employee: string;
  code: string;
  what: string;
  value: number;
  taxNature: TaxNature;
  date: string;
  reason: string;
  by: string;
};

export const offlineRewards: OfflineReward[] = [
  {
    id: "off-12",
    ...orderPerson(20),
    what: "Silver coin (10 g)",
    value: 950,
    taxNature: "perquisite_noncash",
    date: "15/09/2026",
    reason: "10 years of service — given at the plant meeting",
    by: "Ramesh Krishnan",
  },
  {
    id: "off-11",
    ...orderPerson(41),
    what: "Cash prize",
    value: 1000,
    taxNature: "cash_taxable",
    date: "28/08/2026",
    reason: "Safety suggestion adopted on Line B",
    by: "Lakshmi Menon",
  },
];

// ---------------------------------------------------------------------------
// Performance boards (B- screens)
// ---------------------------------------------------------------------------

export type CaptureField = {
  id: string;
  label: string;
  labelHi: string;
  labelTa: string;
  kind:
    | "Text"
    | "Number"
    | "Decimal"
    | "Date"
    | "Boolean"
    | "Picklist"
    | "Employee lookup"
    | "File/Evidence";
  required: boolean;
  validation: string;
  defaultValue: string;
};

/** Field types for native capture forms (checklist §4.10 step 2). */
export const captureFieldPalette: CaptureField["kind"][] = [
  "Text",
  "Number",
  "Decimal",
  "Date",
  "Boolean",
  "Picklist",
  "Employee lookup",
  "File/Evidence",
];

export const captureFields: CaptureField[] = [
  {
    id: "cf-1",
    label: "Employee",
    labelHi: "कर्मचारी",
    labelTa: "ஊழியர்",
    kind: "Employee lookup",
    required: true,
    validation: "Active employee in scope",
    defaultValue: "",
  },
  {
    id: "cf-2",
    label: "Shift date",
    labelHi: "शिफ्ट की तारीख",
    labelTa: "ஷிஃப்ட் தேதி",
    kind: "Date",
    required: true,
    validation: "Not in the future · DD/MM/YYYY",
    defaultValue: "Today",
  },
  {
    id: "cf-3",
    label: "Shift",
    labelHi: "शिफ्ट",
    labelTa: "ஷிஃப்ட்",
    kind: "Picklist",
    required: true,
    validation: "A, B or C",
    defaultValue: "A",
  },
  {
    id: "cf-4",
    label: "Units produced",
    labelHi: "उत्पादित इकाइयाँ",
    labelTa: "உற்பத்தி அலகுகள்",
    kind: "Number",
    required: true,
    validation: "0 – 1,000",
    defaultValue: "",
  },
  {
    id: "cf-5",
    label: "Reject rate (%)",
    labelHi: "अस्वीकृति दर (%)",
    labelTa: "நிராகரிப்பு விகிதம் (%)",
    kind: "Decimal",
    required: false,
    validation: "0 – 100, 1 decimal",
    defaultValue: "0",
  },
  {
    id: "cf-6",
    label: "Present",
    labelHi: "उपस्थित",
    labelTa: "வருகை",
    kind: "Boolean",
    required: true,
    validation: "Yes / No",
    defaultValue: "Yes",
  },
  {
    id: "cf-7",
    label: "Photo of output sheet",
    labelHi: "आउटपुट शीट की फोटो",
    labelTa: "உற்பத்தித் தாளின் படம்",
    kind: "File/Evidence",
    required: false,
    validation: "Image up to 5 MB",
    defaultValue: "",
  },
];

export type NativeEntry = {
  id: string;
  employee: string;
  form: string;
  summary: string;
  submitted: string;
  evidence: boolean;
};

export const nativeEntries: NativeEntry[] = [
  {
    id: "ne-1",
    employee: employees[10]?.name ?? "",
    form: "Shift quality log",
    summary: "0 defects · Line B · 08/10/2026",
    submitted: "08/10/2026 14:20",
    evidence: true,
  },
  {
    id: "ne-2",
    employee: employees[22]?.name ?? "",
    form: "Shift quality log",
    summary: "2 defects · Line A · 08/10/2026",
    submitted: "08/10/2026 13:05",
    evidence: false,
  },
  {
    id: "ne-3",
    employee: employees[31]?.name ?? "",
    form: "Safety suggestion",
    summary: "Guard rail near boiler exit",
    submitted: "07/10/2026 17:40",
    evidence: true,
  },
];

// ---------------------------------------------------------------------------
// Analytics (AN- screens)
// ---------------------------------------------------------------------------

export type AnalyticsMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  series: { label: string; value: number }[];
  table: { headers: string[]; rows: string[][] };
};

export const analyticsMetrics: AnalyticsMetric[] = [
  {
    id: "coverage",
    label: "Recognition coverage",
    value: "71%",
    detail: "Recognised in the last 30 days. Chart: by department, last 90 days (64% overall)",
    series: [
      { label: "Manufacturing", value: 64 },
      { label: "Quality", value: 78 },
      { label: "Sales", value: 71 },
      { label: "Operations", value: 49 },
    ],
    table: {
      headers: ["Department", "Coverage"],
      rows: [
        ["Manufacturing", "64%"],
        ["Quality", "78%"],
        ["Sales", "71%"],
        ["Operations", "49%"],
      ],
    },
  },
  {
    id: "spend",
    label: "Spend per person",
    value: "₹ 1,407",
    detail: "Reward spend divided by active employees, this year",
    series: [
      { label: "May", value: 305 },
      { label: "Jun", value: 333 },
      { label: "Jul", value: 351 },
      { label: "Aug", value: 349 },
      { label: "Sep", value: 407 },
      { label: "Oct", value: 173 },
    ],
    table: {
      headers: ["Month", "Spend per person"],
      rows: [
        ["May", "₹ 305"],
        ["Jun", "₹ 333"],
        ["Jul", "₹ 351"],
        ["Aug", "₹ 349"],
        ["Sep", "₹ 407"],
        ["Oct", "₹ 173"],
      ],
    },
  },
  {
    id: "budget-use",
    label: "Budget used",
    value: "56%",
    detail: "₹ 2,81,400 of ₹ 5,00,000 yearly pool",
    series: [
      { label: "Manufacturing", value: 62 },
      { label: "Quality", value: 46 },
      { label: "Sales", value: 61 },
      { label: "Operations", value: 47 },
    ],
    table: {
      headers: ["Department", "Budget used"],
      rows: [
        ["Manufacturing", "62%"],
        ["Quality", "46%"],
        ["Sales", "61%"],
        ["Operations", "47%"],
      ],
    },
  },
  {
    id: "redemption",
    label: "Redemption rate",
    value: "74%",
    detail: "Points redeemed vs points given, last 90 days",
    series: [
      { label: "Aug", value: 69 },
      { label: "Sep", value: 76 },
      { label: "Oct", value: 74 },
    ],
    table: {
      headers: ["Month", "Redemption rate"],
      rows: [
        ["Aug", "69%"],
        ["Sep", "76%"],
        ["Oct", "74%"],
      ],
    },
  },
  {
    id: "spread",
    label: "Manager spread",
    value: "3 of 12",
    detail: "Managers who recognised fewer than half their team this month",
    series: [
      { label: "Recognised most", value: 9 },
      { label: "Recognised few", value: 3 },
    ],
    table: {
      headers: ["Group", "Managers"],
      rows: [
        ["Recognised most of their team", "9"],
        ["Recognised fewer than half", "3"],
      ],
    },
  },
  {
    id: "lift",
    label: "Performance lift",
    value: "+9%",
    detail: "Average metric change for recognised people vs others, this quarter",
    series: [
      { label: "Recognised", value: 9 },
      { label: "Not recognised", value: 2 },
    ],
    table: {
      headers: ["Group", "Average metric change"],
      rows: [
        ["Recognised this quarter", "+9%"],
        ["Not recognised", "+2%"],
      ],
    },
  },
];

export function toCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

// ---------------------------------------------------------------------------
// Payroll export
// ---------------------------------------------------------------------------

export const payrollSystems = [
  "Keka",
  "greytHR",
  "RazorpayX Payroll",
  "Zoho Payroll",
  "Custom CSV",
] as const;

export const payrollPeriods = ["October 2026", "September 2026", "August 2026"] as const;

/** Indian fiscal year (April–March) that a "Month YYYY" period falls in. */
export function fiscalYearFor(period: string): string {
  const [month = "", yearText = ""] = period.split(" ");
  const year = Number(yearText);
  const index = new Date(`${month} 1, 2000`).getMonth();
  const start = index >= 3 ? year : year - 1;
  return `FY ${start}-${String(start + 1).slice(2)}`;
}

/** payroll_export_YYYY_MM.csv (checklist §4.13 step 4). */
export function payrollFileName(period: string): string {
  const [month = "", year = ""] = period.split(" ");
  const index = new Date(`${month} 1, 2000`).getMonth() + 1;
  return `payroll_export_${year}_${String(index).padStart(2, "0")}.csv`;
}

export type TaxNature = "perquisite_noncash" | "cash_taxable" | "meal_voucher";
export const taxNatures: TaxNature[] = ["perquisite_noncash", "cash_taxable", "meal_voucher"];
export const taxNatureLabel: Record<TaxNature, string> = {
  perquisite_noncash: "Non-cash perquisite",
  cash_taxable: "Cash (taxable)",
  meal_voucher: "Meal voucher",
};

/** Yearly tax-free limit for non-cash gifts used across the prototype. */
export const GIFT_LIMIT = 15000;

export type PayrollRow = {
  /** Empty when the employee record has no payroll code yet. */
  code: string;
  name: string;
  department: string;
  componentCode: string;
  amount: number;
  /** null = the reward was never tagged with a tax nature. */
  taxNature: TaxNature | null;
  /** Workflow run that produced the reward. */
  reference: string;
  /** Non-cash gifts already given this fiscal year, before this period. */
  yearToDate: number;
  /** Problem recorded on the employee record itself. */
  issue?: string;
};

const person = (index: number) => employees[index];

export const payrollPreview: PayrollRow[] = [
  {
    code: "RKM0007",
    name: person(6)?.name ?? "",
    department: person(6)?.department ?? "Sales",
    componentCode: "RNR_GIFT",
    amount: 1200,
    taxNature: "perquisite_noncash",
    reference: "run_sales_monthly_2610_7f3a",
    yearToDate: 14300,
    issue: "Crosses the ₹15,000 yearly gift limit — taxable part must go to payroll.",
  },
  {
    code: "RKM0002",
    name: person(1)?.name ?? "",
    department: person(1)?.department ?? "Manufacturing",
    componentCode: "RNR_GIFT",
    amount: 400,
    taxNature: "perquisite_noncash",
    reference: "run_line_star_2610_a91c",
    yearToDate: 3200,
  },
  {
    code: "RKM0009",
    name: person(8)?.name ?? "",
    department: person(8)?.department ?? "Quality",
    componentCode: "RNR_MEAL",
    amount: 250,
    taxNature: "meal_voucher",
    reference: "run_zero_defect_2610_c204",
    yearToDate: 1500,
  },
  {
    code: "RKM0004",
    name: person(3)?.name ?? "",
    department: person(3)?.department ?? "Operations",
    componentCode: "RNR_CASH",
    amount: 300,
    taxNature: "cash_taxable",
    reference: "run_attendance_2610_11e8",
    yearToDate: 900,
    issue: "Bank account number is missing in the employee record.",
  },
  {
    code: "RKM0014",
    name: person(13)?.name ?? "",
    department: person(13)?.department ?? "Sales",
    componentCode: "RNR_GIFT",
    amount: 200,
    taxNature: "perquisite_noncash",
    reference: "run_sales_monthly_2610_7f3a",
    yearToDate: 2400,
  },
  {
    code: "RKM0021",
    name: person(20)?.name ?? "",
    department: person(20)?.department ?? "Manufacturing",
    componentCode: "RNR_CASH",
    amount: 2000,
    taxNature: "cash_taxable",
    reference: "run_line_star_2610_a91c",
    yearToDate: 0,
  },
  {
    code: "RKM0033",
    name: person(32)?.name ?? "",
    department: person(32)?.department ?? "Quality",
    componentCode: "RNR_MEAL",
    amount: 500,
    taxNature: "meal_voucher",
    reference: "run_zero_defect_2610_c204",
    yearToDate: 2000,
  },
  {
    code: "",
    name: person(41)?.name ?? "",
    department: person(41)?.department ?? "Operations",
    componentCode: "RNR_GIFT",
    amount: 500,
    taxNature: "perquisite_noncash",
    reference: "run_anniversary_2610_5d70",
    yearToDate: 0,
  },
  {
    code: "RKM0058",
    name: person(57)?.name ?? "",
    department: person(57)?.department ?? "Sales",
    componentCode: "RNR_GIFT",
    amount: 750,
    taxNature: null,
    reference: "manual_award_2610_0042",
    yearToDate: 4100,
  },
];

export type PayrollIssue = { code: string; name: string; issue: string };

/** Rows with a known problem on the employee record must be fixed or excluded before export. */
export function findPayrollIssues(rows: PayrollRow[]): PayrollIssue[] {
  return rows
    .filter((row) => row.issue)
    .map((row) => ({ code: row.code, name: row.name, issue: row.issue ?? "" }));
}

/** Non-cash value this row pushes over the yearly limit (0 when within it). */
export function overLimit(row: PayrollRow): number {
  if (row.taxNature !== "perquisite_noncash") return 0;
  return Math.max(0, row.yearToDate + row.amount - GIFT_LIMIT);
}

export type PayrollCheck = {
  kind: "missing_code" | "untagged" | "threshold" | "record";
  severity: "error" | "warning";
  name: string;
  reference: string;
  message: string;
};

/** Step 3 checks: missing employee codes, untagged rewards, threshold breaches (§4.13). */
export function validatePayroll(rows: PayrollRow[]): PayrollCheck[] {
  const checks: PayrollCheck[] = [];
  for (const row of rows) {
    if (!row.code)
      checks.push({
        kind: "missing_code",
        severity: "error",
        name: row.name,
        reference: row.reference,
        message: "No employee code — payroll cannot match this row. Add the code in People.",
      });
    if (!row.taxNature)
      checks.push({
        kind: "untagged",
        severity: "error",
        name: row.name,
        reference: row.reference,
        message: "Reward has no tax nature. Tag it before exporting.",
      });
    const over = overLimit(row);
    if (over > 0)
      checks.push({
        kind: "threshold",
        severity: "warning",
        name: row.name,
        reference: row.reference,
        message: `Crosses the ₹15,000 yearly gift limit by ₹${over.toLocaleString("en-IN")} — that part is taxed as salary.`,
      });
    if (row.issue && over === 0)
      checks.push({
        kind: "record",
        severity: "warning",
        name: row.name,
        reference: row.reference,
        message: row.issue,
      });
  }
  return checks;
}

export function payrollSummary(rows: PayrollRow[]) {
  return {
    employees: new Set(rows.map((row) => row.name)).size,
    nonCash: rows
      .filter((row) => row.taxNature === "perquisite_noncash" || row.taxNature === "meal_voucher")
      .reduce((sum, row) => sum + row.amount, 0),
    cash: rows
      .filter((row) => row.taxNature === "cash_taxable")
      .reduce((sum, row) => sum + row.amount, 0),
    breaches: rows.filter((row) => overLimit(row) > 0).length,
  };
}

export type PayrollExport = {
  id: string;
  period: string;
  system: string;
  rows: number;
  date: string;
  by: string;
  file: string;
  sent: boolean;
};

export const exportHistory: PayrollExport[] = [
  {
    id: "exp-9",
    period: "September 2026",
    system: "Keka",
    rows: 42,
    date: "01/10/2026",
    by: "Lakshmi Menon",
    file: "payroll_export_2026_09.csv",
    sent: true,
  },
  {
    id: "exp-8",
    period: "August 2026",
    system: "Keka",
    rows: 38,
    date: "01/09/2026",
    by: "Lakshmi Menon",
    file: "payroll_export_2026_08.csv",
    sent: true,
  },
  {
    id: "exp-7",
    period: "July 2026",
    system: "greytHR",
    rows: 35,
    date: "01/08/2026",
    by: "Lakshmi Menon",
    file: "payroll_export_2026_07.csv",
    sent: true,
  },
];
