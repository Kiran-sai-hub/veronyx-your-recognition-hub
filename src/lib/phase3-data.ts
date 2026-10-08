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

const activeIn = (key: "department" | "location", value: string) =>
  employees.filter((e) => e[key] === value && e.status === "active").length;

export const departmentCoverage = [
  { group: "Manufacturing", coverage: 64, people: activeIn("department", "Manufacturing") },
  { group: "Quality", coverage: 78, people: activeIn("department", "Quality") },
  { group: "Sales", coverage: 71, people: activeIn("department", "Sales") },
  { group: "Operations", coverage: 49, people: activeIn("department", "Operations") },
];
export const locationCoverage = [
  { group: "Coimbatore", coverage: 68, people: activeIn("location", "Coimbatore") },
  { group: "Chennai", coverage: 74, people: activeIn("location", "Chennai") },
  { group: "Erode", coverage: 61, people: activeIn("location", "Erode") },
  { group: "Tiruppur", coverage: 52, people: activeIn("location", "Tiruppur") },
];
export const shiftCoverage = [
  { group: "Day shift", coverage: 72, people: 109 },
  { group: "Night shift", coverage: 41, people: 60 },
  { group: "General", coverage: 69, people: 30 },
];
export const tenureCoverage = [
  { group: "Under 1 year", coverage: 44, people: 38 },
  { group: "1–3 years", coverage: 66, people: 72 },
  { group: "3+ years", coverage: 73, people: 89 },
];
/** Only employees who consented to gender-based analysis are counted (124 of 199). */
export const genderCoverage = [
  { group: "Women (consented)", coverage: 63, people: 52 },
  { group: "Men (consented)", coverage: 70, people: 68 },
  { group: "Other / prefer to self-describe", coverage: 0, people: 4 },
];
export const GENDER_CONSENTED = 124;
/** Groups smaller than this are suppressed so nobody can be identified. */
export const MIN_GROUP_SIZE = 10;

export const managerSpread = [
  { manager: "Vikram Rao", teamName: "Sales A", team: 8, distinct: 8 },
  { manager: "Selvi Murugan", teamName: "Manufacturing A", team: 13, distinct: 11 },
  { manager: "Karthik Iyer", teamName: "Manufacturing B", team: 12, distinct: 4 },
  { manager: "Anjali Desai", teamName: "Quality A", team: 13, distinct: 10 },
  { manager: "Farhan Qureshi", teamName: "Operations A", team: 12, distinct: 5 },
];

/** Points-per-person buckets for the distribution chart (AN-05). */
export function pointsHistogram(values: number[]) {
  const buckets = [
    { label: "0", min: 0, max: 0 },
    { label: "1–500", min: 1, max: 500 },
    { label: "501–1,000", min: 501, max: 1000 },
    { label: "1,001–1,500", min: 1001, max: 1500 },
    { label: "1,501–2,000", min: 1501, max: 2000 },
    { label: "2,000+", min: 2001, max: Infinity },
  ];
  return buckets.map((b) => ({
    bucket: b.label,
    people: values.filter((v) => v >= b.min && v <= b.max).length,
  }));
}

/** Lorenz curve points (share of people vs share of points) for the concentration chart. */
export function lorenzCurve(values: number[]) {
  const sorted = [...values].sort((x, y) => x - y);
  const total = sorted.reduce((sum, v) => sum + v, 0) || 1;
  const points = [{ people: 0, points: 0, even: 0 }];
  for (let decile = 1; decile <= 10; decile++) {
    const upto = Math.round((sorted.length * decile) / 10);
    const share = sorted.slice(0, upto).reduce((sum, v) => sum + v, 0) / total;
    points.push({ people: decile * 10, points: Math.round(share * 100), even: decile * 10 });
  }
  return points;
}

const person = (index: number) => employees[index] ?? employees[0];

export const negativeReport = {
  zeroRecognition: [
    { name: person(81)?.name ?? "", team: person(81)?.team ?? "", days: 94 },
    { name: person(147)?.name ?? "", team: person(147)?.team ?? "", days: 88 },
    { name: person(124)?.name ?? "", team: person(124)?.team ?? "", days: 76 },
    { name: person(171)?.name ?? "", team: person(171)?.team ?? "", days: 71 },
  ],
  noWorkflowTeams: [
    { team: "Operations D", people: 12 },
    { team: "Quality D", people: 12 },
  ],
  noWinnerBoards: [{ board: "Night shift output", periods: 3 }],
};

export const retentionSignals = [
  { team: "Manufacturing B", signal: "Recognition dropped from 11 to 2 per month", people: 12 },
  { team: "Operations A", signal: "No recognition from the manager in 60 days", people: 12 },
];

/** D-05: recognitions per person (last 6 months) against exits in the same period, per team. */
export const retentionByTeam = [
  { team: "Sales A", recognitions: 6.1, exits: 0 },
  { team: "Manufacturing A", recognitions: 5.4, exits: 1 },
  { team: "Quality A", recognitions: 4.9, exits: 0 },
  { team: "Operations B", recognitions: 3.2, exits: 1 },
  { team: "Operations A", recognitions: 1.4, exits: 3 },
  { team: "Manufacturing B", recognitions: 1.1, exits: 4 },
];

export type GamingAlert = {
  id: string;
  kind:
    | "Reciprocal loop"
    | "Spike"
    | "Self-dealing"
    | "Bulk entries"
    | "Late target change"
    | "Self-approval";
  detail: string;
  evidence: string;
  status: "open" | "cleared" | "held";
};

export const gamingAlerts: GamingAlert[] = [
  {
    id: "ga-1",
    kind: "Reciprocal loop",
    detail: `${person(66)?.name} and ${person(98)?.name} recognised each other 9 times in 14 days`,
    evidence: "18 shoutouts, 2 people, no other givers · Sales A",
    status: "open",
  },
  {
    id: "ga-2",
    kind: "Spike",
    detail: "Quality B recognitions jumped from 6 to 41 in one week",
    evidence: "35 extra shoutouts on 05/10/2026 · 3 givers · normal week is 4–8",
    status: "open",
  },
  {
    id: "ga-3",
    kind: "Self-dealing",
    detail:
      "Karthik Iyer submitted capture entries that made him eligible for a reward he approves",
    evidence: "Form: Daily output · 4 entries · approver = submitter's manager chain",
    status: "open",
  },
  {
    id: "ga-4",
    kind: "Bulk entries",
    detail: "Native capture entries submitted 40 at a time at 23:58",
    evidence: "Form: Daily output · 3 nights in a row",
    status: "open",
  },
  {
    id: "ga-5",
    kind: "Late target change",
    detail: "Quarterly target lowered 2 days after the quarter closed",
    evidence: "Board: Sales A · changed by Vikram Rao",
    status: "open",
  },
  {
    id: "ga-6",
    kind: "Self-approval",
    detail: "A manager tried to approve a reward for themselves",
    evidence: "Blocked automatically · logged AU-9087",
    status: "cleared",
  },
];

/** Private, manager-only view. Neutral facts only — never reasons or speculation. */
export const privateFollowUps = [
  { name: person(82)?.name ?? "", metric: "Sales vs target", value: "71%", periods: 2 },
  { name: person(114)?.name ?? "", metric: "Calls logged", value: "62%", periods: 1 },
];

/* ---------- Campaigns ---------- */

export type CampaignType = "festival" | "birthday" | "anniversary" | "long_service";

export const campaignTypeLabel: Record<CampaignType, string> = {
  festival: "Festival",
  birthday: "Birthdays",
  anniversary: "Work anniversaries",
  long_service: "Long service",
};

export type Campaign = {
  id: string;
  type: CampaignType;
  name: string;
  festival: string;
  /** DD/MM/YYYY; "Always on" campaigns run on each person's own date. */
  start: string;
  end: string;
  rewardPerPerson: number;
  recipients: number;
  budget: number;
  status: "draft" | "scheduled" | "live" | "ended";
  audience: string;
  template: string;
};

/** Audiences a campaign can target, with active headcount. */
export const campaignAudiences = [
  { id: "everyone", label: "Everyone", people: 199 },
  { id: "manufacturing", label: "Manufacturing", people: 50 },
  { id: "quality", label: "Quality", people: 50 },
  { id: "sales", label: "Sales", people: 50 },
  { id: "operations", label: "Operations", people: 49 },
  { id: "coimbatore", label: "Coimbatore", people: 50 },
];

export const campaignTemplates: Record<CampaignType, string[]> = {
  festival: ["festival_greeting_v2 (Utility)", "festival_bonus_credited (Utility)"],
  birthday: ["birthday_wish (Utility)"],
  anniversary: ["work_anniversary_thanks (Utility)"],
  long_service: ["long_service_award (Utility)"],
};

/** Milestones for long-service awards and the reward for each. */
export const longServiceMilestones = [
  { years: 5, reward: 2000 },
  { years: 10, reward: 5000 },
  { years: 15, reward: 7500 },
  { years: 20, reward: 10000 },
];

/** People with a birthday, anniversary or milestone in the next 30 days. */
export const upcomingMoments = [
  { name: employees[44]?.name ?? "", kind: "Birthday", date: "12/10/2026" },
  { name: employees[57]?.name ?? "", kind: "3-year work anniversary", date: "15/10/2026" },
  { name: employees[120]?.name ?? "", kind: "10 years of service", date: "21/10/2026" },
  { name: employees[133]?.name ?? "", kind: "Birthday", date: "24/10/2026" },
  { name: employees[162]?.name ?? "", kind: "1-year work anniversary", date: "02/11/2026" },
];

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
    type: "festival",
    name: "Diwali thank-you week",
    festival: "Diwali",
    start: "20/10/2026",
    end: "27/10/2026",
    rewardPerPerson: 300,
    recipients: 199,
    budget: 59700,
    status: "scheduled",
    audience: "Everyone",
    template: "festival_greeting_v2 (Utility)",
  },
  {
    id: "c2",
    type: "anniversary",
    name: "Work anniversaries",
    festival: "—",
    start: "Always on",
    end: "",
    rewardPerPerson: 500,
    recipients: 9,
    budget: 4500,
    status: "live",
    audience: "Everyone",
    template: "work_anniversary_thanks (Utility)",
  },
  {
    id: "c3",
    type: "birthday",
    name: "Birthday wishes",
    festival: "—",
    start: "Always on",
    end: "",
    rewardPerPerson: 250,
    recipients: 14,
    budget: 3500,
    status: "live",
    audience: "Everyone who shared their birthday",
    template: "birthday_wish (Utility)",
  },
  {
    id: "c4",
    type: "long_service",
    name: "Long service awards",
    festival: "—",
    start: "Always on",
    end: "",
    rewardPerPerson: 5000,
    recipients: 2,
    budget: 10000,
    status: "live",
    audience: "5 / 10 / 15 / 20 years",
    template: "long_service_award (Utility)",
  },
  {
    id: "c5",
    type: "festival",
    name: "Onam safety stars",
    festival: "Onam",
    start: "25/08/2026",
    end: "05/09/2026",
    rewardPerPerson: 400,
    recipients: 50,
    budget: 20000,
    status: "ended",
    audience: "Manufacturing",
    template: "festival_bonus_credited (Utility)",
  },
  {
    id: "c6",
    type: "festival",
    name: "Pongal harvest bonus",
    festival: "Pongal",
    start: "13/01/2027",
    end: "16/01/2027",
    rewardPerPerson: 500,
    recipients: 50,
    budget: 25000,
    status: "draft",
    audience: "Coimbatore",
    template: "festival_greeting_v2 (Utility)",
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
  { purpose: "Gender-based fairness analysis", basis: "consent", plain: "Only with your yes" },
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

export const roleDescriptions: Record<(typeof roles)[number], string> = {
  Owner: "Everything, including billing. Cannot be removed.",
  "HR admin": "Runs programmes, people, data, privacy and payroll.",
  Manager: "Approves and recognises their own team; sees team figures only.",
  Employee: "Own wallet, rewards, recognitions and boards they are allowed to see.",
  Finance: "Budget, ledger and payroll exports. No access to performance data.",
};

export const roleAssignments: {
  name: string;
  email: string;
  role: (typeof roles)[number];
  scope: string;
}[] = [
  {
    name: "Ramesh Krishnan",
    email: "ramesh@rkmills.in",
    role: "Owner",
    scope: "Whole organisation",
  },
  {
    name: "Lakshmi Menon",
    email: "lakshmi.hr@rkmills.in",
    role: "HR admin",
    scope: "Whole organisation",
  },
  { name: "Vikram Rao", email: "vikram@rkmills.in", role: "Manager", scope: "Sales A" },
  { name: "Selvi Murugan", email: "selvi@rkmills.in", role: "Manager", scope: "Manufacturing A" },
  { name: "Karthik Iyer", email: "karthik@rkmills.in", role: "Manager", scope: "Manufacturing B" },
  { name: "Anjali Desai", email: "anjali@rkmills.in", role: "Manager", scope: "Quality A" },
  { name: "Farhan Qureshi", email: "farhan@rkmills.in", role: "Manager", scope: "Operations A" },
  {
    name: "Suresh Babu",
    email: "accounts@rkmills.in",
    role: "Finance",
    scope: "Whole organisation",
  },
];

export const templateLocales = ["en", "ta", "hi", "te"] as const;
export const localeName: Record<string, string> = {
  en: "English",
  ta: "தமிழ்",
  hi: "हिन्दी",
  te: "తెలుగు",
};

export type NotificationTemplate = {
  name: string;
  channel: "WhatsApp" | "Email" | "In-app";
  body: Partial<Record<(typeof templateLocales)[number], string>>;
};

export const notificationTemplates: NotificationTemplate[] = [
  {
    name: "Recognition received",
    channel: "WhatsApp",
    body: {
      en: "🎉 {{name}}, you were ranked #{{rank}} on {{board}}! {{points}} points credited. Reply 1 to redeem, 2 for details.",
      ta: "🎉 {{name}}, {{board}}-ல் நீங்கள் #{{rank}}! {{points}} புள்ளிகள் வரவு. பெற 1, விவரங்களுக்கு 2.",
      hi: "🎉 {{name}}, {{board}} पर आप #{{rank}} रहे! {{points}} पॉइंट जमा। भुनाने के लिए 1, विवरण के लिए 2।",
    },
  },
  {
    name: "Reward approved",
    channel: "In-app",
    body: {
      en: "Your reward of {{amount}} was approved by {{approver}}.",
      ta: "உங்கள் {{amount}} வெகுமதி {{approver}} அவர்களால் அங்கீகரிக்கப்பட்டது.",
      hi: "आपका {{amount}} का इनाम {{approver}} ने मंज़ूर किया।",
      te: "మీ {{amount}} బహుమతిని {{approver}} ఆమోదించారు.",
    },
  },
  {
    name: "Redemption OTP",
    channel: "WhatsApp",
    body: {
      en: "{{otp}} is your code to confirm the redemption. Valid for 10 minutes. Do not share it.",
      ta: "{{otp}} உங்கள் உறுதிப்படுத்தல் குறியீடு. 10 நிமிடம் செல்லும். பகிர வேண்டாம்.",
    },
  },
  {
    name: "Weekly summary",
    channel: "Email",
    body: {
      en: "This week: {{recognitions}} recognitions, {{rewards}} rewards, {{pending}} approvals waiting.",
    },
  },
];

export type WhatsappTemplate = {
  name: string;
  category: "Utility" | "Marketing" | "Authentication";
  languages: string[];
  status: "Approved" | "Pending" | "Rejected";
  note?: string;
};

export const whatsappTemplates: WhatsappTemplate[] = [
  {
    name: "ranked_on_board",
    category: "Utility",
    languages: ["en", "ta", "hi"],
    status: "Approved",
  },
  {
    name: "redeem_otp",
    category: "Authentication",
    languages: ["en", "ta", "hi"],
    status: "Approved",
  },
  {
    name: "voucher_delivered",
    category: "Utility",
    languages: ["en", "ta", "hi"],
    status: "Approved",
  },
  { name: "optin_invite", category: "Utility", languages: ["en", "ta", "hi"], status: "Approved" },
  {
    name: "festival_greeting_v2",
    category: "Utility",
    languages: ["en", "ta", "hi"],
    status: "Pending",
  },
  {
    name: "diwali_offers",
    category: "Marketing",
    languages: ["en"],
    status: "Pending",
    note: "Marketing — only sent to people who consented to offers.",
  },
  {
    name: "balance_reply",
    category: "Utility",
    languages: ["en"],
    status: "Rejected",
    note: "Meta: variable at the start of the message. Move {{balance}} after the greeting and resubmit.",
  },
];

export const invoices = [
  { id: "INV-2026-09", date: "01/09/2026", amount: 18880 },
  { id: "INV-2026-08", date: "01/08/2026", amount: 18880 },
  { id: "INV-2026-07", date: "01/07/2026", amount: 15340 },
];
