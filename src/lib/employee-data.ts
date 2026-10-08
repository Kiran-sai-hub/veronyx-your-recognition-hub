import { currentEmployee, employees } from "@/lib/mock-data";

/** Employee-side prototype data (checklist E-01…E-09). */
export const me = {
  name: currentEmployee?.name ?? "Priya Joshi",
  firstName: (currentEmployee?.name ?? "Priya").split(" ")[0] ?? "Priya",
  code: currentEmployee?.code ?? "RKM0009",
  team: currentEmployee?.team ?? "Manufacturing C",
  location: currentEmployee?.location ?? "Coimbatore",
  mobile: "+91 98431 22014",
  expiring: { points: 250, date: "31/12/2026" },
  earnedThisYear: 3425,
  cashViaPayroll: 1000,
  nonCashThisYear: 12100,
};

export const pointActivity = [
  { title: "Quality champion", date: "06/10/2026", value: 250, kind: "credit" as const },
  { title: "Swiggy meal voucher", date: "02/10/2026", value: -300, kind: "redeem" as const },
  { title: "Perfect attendance", date: "01/10/2026", value: 300, kind: "credit" as const },
  { title: "Team player — Meera Nair", date: "29/09/2026", value: 150, kind: "credit" as const },
  {
    title: "Expired points (FY25-26 balance)",
    date: "01/04/2026",
    value: -120,
    kind: "expire" as const,
  },
];

export const pastRedemptions = [
  {
    id: "ord-1031",
    title: "Swiggy meal voucher",
    points: 300,
    date: "02/10/2026",
    status: "fulfilled" as const,
    code: "SWG-7HQ2-91KD",
    expiry: "02/04/2027",
  },
  {
    id: "ord-0988",
    title: "Amazon Pay e-gift card",
    points: 500,
    date: "14/08/2026",
    status: "fulfilled" as const,
    code: "AMZ-PX2Q-77LM",
    expiry: "14/08/2027",
  },
];

export const recognitionsGiven = [
  {
    to: employees[12]?.name ?? "Imran Khan",
    message: "Helped me fix the loom tension on night shift.",
    date: "04/10/2026",
  },
  {
    to: employees[16]?.name ?? "Divya Nair",
    message: "Covered my shift during the Diwali order rush.",
    date: "21/09/2026",
  },
];

export const badges = [
  { name: "Quality Champion", earned: "06/10/2026", icon: "🏅" },
  { name: "Perfect Attendance", earned: "01/10/2026", icon: "📅" },
  { name: "Team Player", earned: "29/09/2026", icon: "🤝" },
  { name: "5 years at RKM", earned: "Next: 12/03/2027", icon: "⭐", locked: true },
];

export type Tracker = {
  workflow: string;
  metric: string;
  value: string;
  progress: number;
  rule: string;
  rank: { position: number; of: number } | null;
  rankNote: string;
  daysLeft: number;
};

export const trackers: Tracker[] = [
  {
    workflow: "Quality champion · October",
    metric: "Quality checks passed",
    value: "98.4%",
    progress: 98,
    rule: "Keep at least 97% of your quality checks passing this month, with 1,750 units or more.",
    rank: { position: 3, of: 18 },
    rankNote: "Top 5 get recognised. Ranks are visible to your team.",
    daysLeft: 23,
  },
  {
    workflow: "Weekly Line Star · this week",
    metric: "Units produced",
    value: "384",
    progress: 76,
    rule: "The person with the most units on each line wins — only if attendance is 95% or more.",
    rank: { position: 4, of: 12 },
    rankNote: "Only the top 3 are shown to everyone. Your own rank is private to you.",
    daysLeft: 3,
  },
  {
    workflow: "Perfect attendance bonus · October",
    metric: "Attendance",
    value: "100%",
    progress: 100,
    rule: "Be present every working day this month. No ranking — everyone who qualifies is rewarded.",
    rank: null,
    rankNote: "",
    daysLeft: 23,
  },
];

export const colleagues = employees
  .filter((e) => e.status === "active" && e.code !== me.code && e.location === me.location)
  .slice(0, 30);
