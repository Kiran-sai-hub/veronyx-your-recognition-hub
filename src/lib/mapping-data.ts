import { employees } from "@/lib/mock-data";

/** Field mapping (§4.4), identity resolution (§4.5), field registry (C-10) and drift (C-11). */

export const canonicalAttributes = [
  { key: "subject_ref", label: "Employee (identity)", type: "text", required: true },
  { key: "value", label: "Metric value", type: "number", required: true },
  { key: "target", label: "Target", type: "number", required: true },
  { key: "occurred_at", label: "Date", type: "date", required: true },
  { key: "amount_paise", label: "Amount (paise)", type: "number", required: false },
  { key: "department", label: "Department", type: "text", required: false },
  { key: "source_record_id", label: "Source record ID", type: "text", required: false },
  { key: "ignore", label: "Don't import", type: "any", required: false },
] as const;

export type SourceField = {
  name: string;
  type: string;
  samples: string[];
  suggested: string;
  confidence: "high" | "medium" | "low";
  transform?: string;
};

export const salesFileFields: SourceField[] = [
  {
    name: "emp_code",
    type: "text",
    samples: ["RKM0019", "RKM0035"],
    suggested: "subject_ref",
    confidence: "high",
  },
  {
    name: "emp_name",
    type: "text",
    samples: ["Pooja Kumar", "Fatima Rao"],
    suggested: "ignore",
    confidence: "medium",
  },
  {
    name: "sales_rs",
    type: "currency",
    samples: ["₹ 6,40,000", "₹ 5,20,000"],
    suggested: "value",
    confidence: "high",
    transform: "strip ₹ · Indian digits",
  },
  {
    name: "Amount",
    type: "number",
    samples: ["640000", "520000"],
    suggested: "amount_paise",
    confidence: "medium",
    transform: "Amount * 100",
  },
  {
    name: "month",
    type: "date",
    samples: ["09/2026", "09/2026"],
    suggested: "occurred_at",
    confidence: "high",
    transform: "last day of month",
  },
  {
    name: "dept",
    type: "text",
    samples: ["Sales", "Sales"],
    suggested: "department",
    confidence: "high",
  },
  {
    name: "row_id",
    type: "text",
    samples: ["S-0912", "S-0913"],
    suggested: "source_record_id",
    confidence: "medium",
  },
  {
    name: "target_rs",
    type: "currency",
    samples: ["₹ 5,00,000", "₹ 5,00,000"],
    suggested: "",
    confidence: "low",
  },
];

export const mappedPreview = employees
  .filter((e) => e.department === "Sales")
  .slice(0, 20)
  .map((e, i) => ({
    row: i + 2,
    code: i === 7 ? "S.KUMAR" : e.code,
    name: e.name,
    value: 380000 + ((i * 47000) % 300000),
    resolved: i !== 7 && i !== 15,
    mismatch: i === 11 ? "sales_rs “NA” is not a number" : undefined,
  }));

export type Candidate = {
  code: string;
  name: string;
  team: string;
  confidence: number;
  why: string;
};

export type IdentityItem = {
  id: string;
  identifier: string;
  identifierType: "email" | "phone" | "employee code" | "CRM user ID" | "name";
  source: string;
  connector: string;
  at: string;
  records: number;
  blocking: string[];
  candidates: Candidate[];
};

const cand = (index: number, confidence: number, why: string): Candidate => {
  const e = employees[index]!;
  return { code: e.code, name: e.name, team: e.team, confidence, why };
};

export const identityItems: IdentityItem[] = [
  {
    id: "idq-1",
    identifier: "s.kumar@rkmills.in",
    identifierType: "email",
    source: "Deal 88241 · owner",
    connector: "Zoho CRM",
    at: "08/10/2026 09:12",
    records: 12,
    blocking: ["Sales target achievers"],
    candidates: [cand(62, 86, "name + team"), cand(90, 41, "surname only")],
  },
  {
    id: "idq-2",
    identifier: "agent.x@support",
    identifierType: "email",
    source: "Ticket 51022 · responder",
    connector: "Freshdesk",
    at: "08/10/2026 10:45",
    records: 31,
    blocking: ["CSAT Champion (draft)"],
    candidates: [cand(5, 72, "name only")],
  },
  {
    id: "idq-3",
    identifier: "RKM13",
    identifierType: "employee code",
    source: "Event evt_8812",
    connector: "Production ERP webhook",
    at: "08/10/2026 11:00",
    records: 46,
    blocking: ["Weekly Line Star"],
    candidates: [cand(12, 94, "code without leading zeros")],
  },
  {
    id: "idq-4",
    identifier: "+91 94430 11872",
    identifierType: "phone",
    source: "Daily_Output row 412",
    connector: "Google Sheets",
    at: "07/10/2026 20:10",
    records: 9,
    blocking: [],
    candidates: [cand(58, 88, "phone matches WhatsApp number")],
  },
  {
    id: "idq-5",
    identifier: "Rahul J",
    identifierType: "name",
    source: "Sales file row 31",
    connector: "Monthly sales file",
    at: "07/10/2026 18:30",
    records: 1,
    blocking: [],
    candidates: [cand(198, 70, "name only — ambiguous")],
  },
  {
    id: "idq-6",
    identifier: "S. Velu",
    identifierType: "name",
    source: "Attendance row 44",
    connector: "Attendance register",
    at: "06/10/2026 06:00",
    records: 3,
    blocking: [],
    candidates: [],
  },
  {
    id: "idq-7",
    identifier: "night.desk2",
    identifierType: "CRM user ID",
    source: "Ticket 50877 · responder",
    connector: "Freshdesk",
    at: "05/10/2026 23:40",
    records: 14,
    blocking: [],
    candidates: [],
  },
];

/** An identifier already linked elsewhere — picking this person manually shows the conflict (§6.3). */
export const alreadyLinkedCodes = ["RKM0019"];

export const fieldRegistry = [
  {
    field: "sales.sales_vs_target",
    type: "Number (%)",
    source: "Monthly sales file, Zoho CRM",
    samples: "128, 112, 104",
    pii: false,
  },
  {
    field: "sales.deals_closed",
    type: "Integer",
    source: "Zoho CRM",
    samples: "14, 9, 8",
    pii: false,
  },
  {
    field: "support.csat_avg",
    type: "Decimal",
    source: "Freshdesk",
    samples: "4.82, 4.79",
    pii: false,
  },
  {
    field: "support.ticket_resolved",
    type: "Integer",
    source: "Freshdesk",
    samples: "131, 88",
    pii: false,
  },
  {
    field: "attendance.attendance_pct",
    type: "Number (%)",
    source: "Attendance register",
    samples: "100, 96.2",
    pii: false,
  },
  {
    field: "production.units",
    type: "Integer",
    source: "Production ERP webhook",
    samples: "412, 398",
    pii: false,
  },
  {
    field: "employee.full_name",
    type: "Text",
    source: "Employee import",
    samples: "Pooja Kumar",
    pii: true,
  },
  {
    field: "employee.mobile_e164",
    type: "Phone",
    source: "Employee import",
    samples: "+91 98431 22014",
    pii: true,
  },
  {
    field: "erp.shift_id",
    type: "Text (new)",
    source: "Production ERP webhook",
    samples: "A, B, C",
    pii: false,
  },
];

export const driftAlerts = [
  {
    id: "drift-1",
    source: "Monthly sales file",
    kind: "Column removed",
    detail: "“Target” (target_rs) is missing from the file uploaded 07/10/2026.",
    impact: "Ingestion paused. Run 118 of “Sales target achievers” failed.",
    paused: true,
    suggestion: "A new column “Monthly Goal” appeared — map it to Target?",
  },
  {
    id: "drift-2",
    source: "Production ERP webhook",
    kind: "New field",
    detail: "A new field “shift_id” appeared on 02/10/2026.",
    impact: "Ignored until you map it. Nothing is paused.",
    paused: false,
    suggestion: "Map shift_id to Team to compare shifts fairly?",
  },
];
