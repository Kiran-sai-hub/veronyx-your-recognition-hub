import { employees } from "@/lib/mock-data";

/** Employee import (checklist §4.2): canonical fields, a sample file and its validation. */
export const canonicalFields = [
  { key: "employee_code", label: "Employee code", required: true },
  { key: "full_name", label: "Full name", required: true },
  { key: "work_email", label: "Work email", required: false },
  { key: "mobile_e164", label: "Mobile", required: false },
  { key: "whatsapp_e164", label: "WhatsApp number", required: false },
  { key: "department", label: "Department", required: false },
  { key: "team", label: "Team", required: false },
  { key: "location", label: "Location", required: false },
  { key: "manager", label: "Manager", required: false },
  { key: "date_of_joining", label: "Date of joining", required: false },
  { key: "custom", label: "Custom field", required: false },
  { key: "ignore", label: "Don't import", required: false },
] as const;

export type CanonicalKey = (typeof canonicalFields)[number]["key"];

export type SourceColumn = {
  name: string;
  samples: string[];
  suggested: CanonicalKey;
  confidence: "high" | "medium" | "low";
};

export const sampleFile = {
  name: "employee_master_october.xlsx",
  sizeKb: 46,
  rows: 200,
  headerRow: 1,
};

export const sourceColumns: SourceColumn[] = [
  {
    name: "Emp ID",
    samples: ["RKM0001", "RKM0002"],
    suggested: "employee_code",
    confidence: "high",
  },
  {
    name: "Name",
    samples: ["Aarav Sharma", "Ananya Iyer"],
    suggested: "full_name",
    confidence: "high",
  },
  {
    name: "Email",
    samples: ["aarav@rkmills.in", "—"],
    suggested: "work_email",
    confidence: "high",
  },
  {
    name: "Mobile No",
    samples: ["98431 22014", "+91 94430 11872"],
    suggested: "mobile_e164",
    confidence: "medium",
  },
  {
    name: "Dept",
    samples: ["Manufacturing", "Quality"],
    suggested: "department",
    confidence: "medium",
  },
  {
    name: "Line / Team",
    samples: ["Manufacturing A", "Quality B"],
    suggested: "team",
    confidence: "low",
  },
  { name: "Unit", samples: ["Coimbatore", "Chennai"], suggested: "location", confidence: "medium" },
  {
    name: "Reporting To",
    samples: ["Suresh Babu", "Meena Pillai"],
    suggested: "manager",
    confidence: "medium",
  },
  {
    name: "DOJ",
    samples: ["04/06/2019", "17/11/2022"],
    suggested: "date_of_joining",
    confidence: "high",
  },
  {
    name: "Monthly CTC",
    samples: ["₹ 28,500", "₹ 1,05,000"],
    suggested: "ignore",
    confidence: "low",
  },
];

export type PreviewRow = {
  row: number;
  code: string;
  name: string;
  email: string;
  mobile: string;
  department: string;
  joined: string;
  error?: { field: "code" | "name" | "email"; message: string };
  warning?: string;
};

export const previewRows: PreviewRow[] = employees.slice(0, 20).map((e, i) => {
  const row: PreviewRow = {
    row: i + 2,
    code: e.code,
    name: e.name,
    email: `${e.name.split(" ")[0]?.toLowerCase()}.${i + 1}@rkmills.in`,
    mobile: `+91 9${String(8431000000 + i * 7919).slice(0, 9)}`,
    department: e.department,
    joined: `${String((i % 27) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/20${18 + (i % 7)}`,
  };
  if (i === 4)
    return {
      ...row,
      email: `${e.name.split(" ")[0]?.toLowerCase()}.rkmills.in`,
      error: { field: "email", message: "Invalid email" },
    };
  if (i === 9)
    return { ...row, code: "RKM0003", error: { field: "code", message: "Duplicate code (row 4)" } };
  if (i === 13) return { ...row, name: "", error: { field: "name", message: "Missing full name" } };
  if (i === 16) return { ...row, mobile: "", warning: "No mobile — WhatsApp won't work" };
  return row;
});

/** Totals for the full 200-row file (the preview shows the first 20). */
export const importSummary = {
  total: 200,
  errors: 3,
  warnings: 4,
  duplicatesSkipped: 1,
  exitedKept: 1,
};

export function templateCsv(): string {
  return [
    "employee_code,full_name,work_email,mobile_e164,whatsapp_e164,department,team,location,manager,date_of_joining",
    "RKM0001,Aarav Sharma,aarav@rkmills.in,+919843122014,+919843122014,Manufacturing,Manufacturing A,Coimbatore,Suresh Babu,04/06/2019",
  ].join("\n");
}
