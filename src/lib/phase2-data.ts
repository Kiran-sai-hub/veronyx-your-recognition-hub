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

export type GalleryConnector = {
  id: string;
  name: string;
  description: string;
  setupSteps: string[];
};

export const connectorGallery: GalleryConnector[] = [
  {
    id: "csv",
    name: "CSV / Excel upload",
    description: "Upload a monthly file from your computer.",
    setupSteps: ["Download the template", "Upload your file", "Match the columns", "Preview rows"],
  },
  {
    id: "gsheet",
    name: "Google Sheets",
    description: "Keep a shared sheet in sync automatically.",
    setupSteps: ["Sign in with Google", "Pick the sheet", "Match the columns", "Set sync time"],
  },
  {
    id: "zoho-crm",
    name: "Zoho CRM",
    description: "Pull orders and targets from Zoho CRM.",
    setupSteps: ["Sign in to Zoho", "Choose modules", "Match the fields", "Test the connection"],
  },
  {
    id: "zoho-bigin",
    name: "Zoho Bigin",
    description: "Use Bigin pipelines as a performance source.",
    setupSteps: ["Sign in to Zoho", "Choose pipelines", "Match the fields", "Test the connection"],
  },
  {
    id: "email",
    name: "Email inbox",
    description: "Turn a shared inbox into a data source.",
    setupSteps: ["Get your Veronyx inbox address", "Send a test email", "Confirm the format"],
  },
  {
    id: "webhook",
    name: "Webhook",
    description: "Send events from your own software.",
    setupSteps: ["Copy the webhook URL", "Send a test event", "Match the fields"],
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

export type FieldMapping = {
  source: string;
  target: string | null;
  sample: string;
};

export const targetFields = [
  "Employee code",
  "Employee name",
  "Metric value",
  "Target",
  "Date",
  "Department",
  "Ignore this column",
] as const;

export const fieldMappings: FieldMapping[] = [
  { source: "emp_code", target: "Employee code", sample: "RKM0007" },
  { source: "emp_name", target: "Employee name", sample: "Meera Joshi" },
  { source: "sales_rs", target: "Metric value", sample: "462000" },
  { source: "month", target: "Date", sample: "Sep 2026" },
  { source: "dept", target: "Department", sample: "Sales" },
  { source: "target_rs", target: null, sample: "500000" },
];

export type IdentityMatch = {
  id: string;
  sourceName: string;
  sourceDetail: string;
  candidateName: string | null;
  candidateCode: string | null;
  confidence: "High" | "Medium" | "No match";
  reason: string;
};

export const identityQueue: IdentityMatch[] = [
  {
    id: "id-1",
    sourceName: "R. Kumar",
    sourceDetail: "Sales file · row 12",
    candidateName: "Rahul Kumar",
    candidateCode: "RKM0005",
    confidence: "High",
    reason: "Name and phone ending match",
  },
  {
    id: "id-2",
    sourceName: "Meera J",
    sourceDetail: "Sales file · row 19",
    candidateName: "Meera Joshi",
    candidateCode: "RKM0027",
    confidence: "Medium",
    reason: "Name matches, department differs",
  },
  {
    id: "id-3",
    sourceName: "S. Velu",
    sourceDetail: "Attendance sheet · row 44",
    candidateName: null,
    candidateCode: null,
    confidence: "No match",
    reason: "No employee with a similar name",
  },
  {
    id: "id-4",
    sourceName: "Aarav Sharma",
    sourceDetail: "ERP webhook · event 981",
    candidateName: "Aarav Sharma",
    candidateCode: "RKM0001",
    confidence: "High",
    reason: "Exact employee code match",
  },
  {
    id: "id-5",
    sourceName: "Kavya Reddy (old)",
    sourceDetail: "Sales file · row 31",
    candidateName: "Kavya Reddy",
    candidateCode: "RKM0200",
    confidence: "Medium",
    reason: "This employee has exited — confirm before linking",
  },
];

export const fieldRegistry = [
  { field: "Employee code", type: "Text", usedBy: "All connectors", pii: false },
  { field: "Employee name", type: "Text", usedBy: "All connectors", pii: true },
  { field: "Metric value", type: "Number", usedBy: "Sales file, ERP webhook", pii: false },
  { field: "Target", type: "Number", usedBy: "Sales file", pii: false },
  { field: "Date", type: "Date", usedBy: "All connectors", pii: false },
  { field: "Phone number", type: "Text", usedBy: "Employee import", pii: true },
];

export const schemaDriftAlerts = [
  {
    id: "drift-1",
    source: "Monthly sales file",
    message:
      "The “Target” column disappeared on 07/10/2026. One workflow run failed because of this.",
    date: "07/10/2026",
  },
  {
    id: "drift-2",
    source: "Production ERP webhook",
    message: "A new field “shift_id” appeared. It is ignored until you map it.",
    date: "02/10/2026",
  },
];

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
  { month: "Oct", actual: 34600, forecast: 42000 },
  { month: "Nov", actual: 0, forecast: 44500 },
  { month: "Dec", actual: 0, forecast: 46000 },
  { month: "Jan", actual: 0, forecast: 43000 },
  { month: "Feb", actual: 0, forecast: 41500 },
  { month: "Mar", actual: 0, forecast: 44000 },
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

export type CatalogueItem = {
  id: string;
  title: string;
  brand: string;
  points: number;
  value: number;
  category: string;
  taxNature: string;
  stock: number | null;
  active: boolean;
};

export const catalogueItems: CatalogueItem[] = rewards.map((reward, index) => ({
  id: reward.id,
  title: reward.title,
  brand: reward.brand,
  points: reward.points,
  value: reward.value,
  category: reward.category,
  taxNature: reward.taxNature,
  stock: index === 3 ? 0 : null,
  active: index !== 3,
}));

export type RedemptionOrder = {
  id: string;
  employee: string;
  code: string;
  item: string;
  points: number;
  taxNature: string;
  status: "Delivered" | "Processing" | "Failed" | "Refunded";
  date: string;
  note?: string;
};

export const redemptionOrders: RedemptionOrder[] = [
  {
    id: "ord-1042",
    employee: employees[8]?.name ?? "",
    code: "RKM0009",
    item: "Amazon shopping voucher",
    points: 500,
    taxNature: "Non-cash gift",
    status: "Delivered",
    date: "06/10/2026",
  },
  {
    id: "ord-1043",
    employee: employees[1]?.name ?? "",
    code: "RKM0002",
    item: "Swiggy meal voucher",
    points: 300,
    taxNature: "Meal voucher",
    status: "Processing",
    date: "07/10/2026",
  },
  {
    id: "ord-1044",
    employee: employees[6]?.name ?? "",
    code: "RKM0007",
    item: "Fuel gift card",
    points: 1000,
    taxNature: "Non-cash gift",
    status: "Failed",
    date: "07/10/2026",
    note: "Vendor timeout — safe to retry, points are held.",
  },
  {
    id: "ord-1045",
    employee: employees[13]?.name ?? "",
    code: "RKM0014",
    item: "UPI cash reward",
    points: 1100,
    taxNature: "Cash equivalent",
    status: "Refunded",
    date: "05/10/2026",
    note: "Employee cancelled before the code was revealed.",
  },
  {
    id: "ord-1046",
    employee: employees[3]?.name ?? "",
    code: "RKM0004",
    item: "Movies for two",
    points: 500,
    taxNature: "Non-cash gift",
    status: "Delivered",
    date: "04/10/2026",
  },
];

// ---------------------------------------------------------------------------
// Performance boards (B- screens)
// ---------------------------------------------------------------------------

export type Board = {
  id: string;
  name: string;
  source: "Connector" | "Native form" | "Manual";
  metric: string;
  scope: string;
  period: string;
  status: "Live" | "Draft";
  members: number;
};

export const boards: Board[] = [
  {
    id: "board-sales",
    name: "September sales race",
    source: "Connector",
    metric: "Sales vs target",
    scope: "Sales department",
    period: "Monthly",
    status: "Live",
    members: 48,
  },
  {
    id: "board-quality",
    name: "Zero-defect shifts",
    source: "Connector",
    metric: "Defects per shift",
    scope: "Quality department",
    period: "Weekly",
    status: "Live",
    members: 50,
  },
  {
    id: "board-safety",
    name: "Safety suggestions",
    source: "Native form",
    metric: "Accepted suggestions",
    scope: "All locations",
    period: "Quarterly",
    status: "Draft",
    members: 200,
  },
];

export const boardTemplates = [
  {
    id: "tpl-sales",
    name: "Sales vs target",
    description: "Rank people by sales against their monthly target.",
  },
  {
    id: "tpl-attendance",
    name: "Perfect attendance",
    description: "Celebrate full attendance over a period.",
  },
  {
    id: "tpl-quality",
    name: "Quality streak",
    description: "Count consecutive defect-free shifts.",
  },
  { id: "tpl-custom", name: "Start blank", description: "Build a board from scratch." },
];

export const scorecardMetrics = [
  { id: "sm-1", metric: "Sales vs target", weight: 60, direction: "Higher is better" },
  { id: "sm-2", metric: "New distributors", weight: 25, direction: "Higher is better" },
  { id: "sm-3", metric: "Pending collections", weight: 15, direction: "Lower is better" },
];

export const boardTargets = [
  {
    id: "bt-1",
    metric: "Sales vs target",
    target: "100% of monthly target",
    appliesTo: "Every salesperson",
  },
  {
    id: "bt-2",
    metric: "New distributors",
    target: "2 per quarter",
    appliesTo: "Sales department",
  },
];

export const behaviourRules = [
  {
    id: "br-1",
    name: "One win per month",
    detail: "A person can top only one board per month.",
    active: true,
  },
  {
    id: "br-2",
    name: "New joiner grace",
    detail: "People in their first 30 days are shown but not ranked.",
    active: true,
  },
  {
    id: "br-3",
    name: "Manager exclusion",
    detail: "Managers do not appear on their own team board.",
    active: false,
  },
];

export const comparisonPolicies = [
  {
    id: "cp-1",
    name: "Same role only",
    detail: "Compare people only with others in the same role.",
    recommended: true,
  },
  { id: "cp-2", name: "Whole department", detail: "Compare everyone in the department together." },
  { id: "cp-3", name: "Location-wise", detail: "Compare within each location, then combine." },
];

export const boardLeaderboard = employees
  .filter((e) => e.department === "Sales" && e.status === "active")
  .slice(0, 6)
  .map((e, index) => ({
    rank: index + 1,
    name: e.name,
    code: e.code,
    score: [128, 121, 114, 108, 104, 99][index] ?? 90,
    points: [1200, 800, 600, 400, 300, 200][index] ?? 100,
  }));

// ---------------------------------------------------------------------------
// Native capture (form builder + native-entry approvals)
// ---------------------------------------------------------------------------

export type CaptureField = {
  id: string;
  label: string;
  kind: "Number" | "Text" | "Date" | "Choice" | "Photo";
  required: boolean;
};

export const captureFieldPalette: CaptureField["kind"][] = [
  "Number",
  "Text",
  "Date",
  "Choice",
  "Photo",
];

export const captureFields: CaptureField[] = [
  { id: "cf-1", label: "Shift date", kind: "Date", required: true },
  { id: "cf-2", label: "Defects found", kind: "Number", required: true },
  { id: "cf-3", label: "Line", kind: "Choice", required: true },
  { id: "cf-4", label: "Photo of defect", kind: "Photo", required: false },
  { id: "cf-5", label: "Notes", kind: "Text", required: false },
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
    value: "68%",
    detail: "Share of active employees recognised this month",
    series: [
      { label: "Manufacturing", value: 71 },
      { label: "Quality", value: 84 },
      { label: "Sales", value: 66 },
      { label: "Operations", value: 58 },
    ],
    table: {
      headers: ["Department", "Coverage"],
      rows: [
        ["Manufacturing", "71%"],
        ["Quality", "84%"],
        ["Sales", "66%"],
        ["Operations", "58%"],
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

export const payrollSystems = ["CSV (generic)", "Zoho Payroll", "greytHR", "Keka"] as const;

export const payrollPeriods = ["October 2026", "September 2026", "August 2026"] as const;

export type PayrollRow = {
  code: string;
  name: string;
  points: number;
  amount: number;
  taxable: boolean;
  issue?: string;
};

export const payrollPreview: PayrollRow[] = [
  {
    code: "RKM0007",
    name: employees[6]?.name ?? "",
    points: 1200,
    amount: 1200,
    taxable: true,
    issue: "Crosses the ₹15,000 yearly gift limit — taxable part must go to payroll.",
  },
  { code: "RKM0002", name: employees[1]?.name ?? "", points: 400, amount: 400, taxable: false },
  { code: "RKM0009", name: employees[8]?.name ?? "", points: 250, amount: 250, taxable: false },
  {
    code: "RKM0004",
    name: employees[3]?.name ?? "",
    points: 300,
    amount: 300,
    taxable: false,
    issue: "Bank account number is missing in the employee record.",
  },
  { code: "RKM0014", name: employees[13]?.name ?? "", points: 200, amount: 200, taxable: false },
];

export type PayrollIssue = { code: string; name: string; issue: string };

/** Rows with a known problem must be fixed or excluded before export. */
export function findPayrollIssues(rows: PayrollRow[]): PayrollIssue[] {
  return rows
    .filter((row) => row.issue)
    .map((row) => ({ code: row.code, name: row.name, issue: row.issue ?? "" }));
}

export const exportHistory = [
  {
    id: "exp-9",
    period: "September 2026",
    system: "CSV (generic)",
    rows: 42,
    date: "01/10/2026",
    by: "Lakshmi Menon",
  },
  {
    id: "exp-8",
    period: "August 2026",
    system: "CSV (generic)",
    rows: 38,
    date: "01/09/2026",
    by: "Lakshmi Menon",
  },
  {
    id: "exp-7",
    period: "July 2026",
    system: "greytHR",
    rows: 35,
    date: "01/08/2026",
    by: "Lakshmi Menon",
  },
];
