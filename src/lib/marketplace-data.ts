/**
 * Template marketplace (checklist Appendix A, P3). Each listing opens one of the builder's base
 * templates, adapted by name and description, so installing always lands in a real, editable draft.
 */
export type MarketplaceTemplate = {
  id: string;
  name: string;
  /** Builder template the listing installs. */
  base:
    | "sales-achievers"
    | "csat-champion"
    | "line-star"
    | "perfect-attendance"
    | "zero-defect"
    | "anniversary";
  industry: string;
  category: "Sales" | "Service" | "Production" | "Quality" | "Attendance" | "Tenure" | "Peer";
  publisher: "Veronyx" | "Partner" | "Community";
  publisherName: string;
  rating: number;
  installs: number;
  summary: string;
  metrics: { key: string; label: string; connected: boolean }[];
  steps: string[];
  fairness: string;
  languages: string[];
};

export const marketplaceIndustries = [
  "All industries",
  "Textile & garments",
  "Manufacturing",
  "Retail",
  "BFSI & collections",
  "IT services",
  "Healthcare",
  "Logistics",
  "Hospitality",
] as const;

export const marketplaceTemplates: MarketplaceTemplate[] = [
  {
    id: "mk-line-star",
    name: "Weekly Line Star",
    base: "line-star",
    industry: "Textile & garments",
    category: "Production",
    publisher: "Veronyx",
    publisherName: "Veronyx",
    rating: 4.8,
    installs: 1240,
    summary: "Top output per line each week, only for people with 95%+ attendance.",
    metrics: [
      { key: "production.units", label: "Units produced", connected: true },
      { key: "attendance.pct", label: "Attendance %", connected: true },
    ],
    steps: [
      "Weekly schedule (Monday 06:00)",
      "Filter: attendance ≥ 95%",
      "Rank by units per line",
      "Manager approval",
      "250 points to #1–#3",
    ],
    fairness: "Ranks within each line, so small lines are not compared with big ones.",
    languages: ["en", "ta", "hi"],
  },
  {
    id: "mk-zero-defect",
    name: "Zero-defect shift",
    base: "zero-defect",
    industry: "Manufacturing",
    category: "Quality",
    publisher: "Veronyx",
    publisherName: "Veronyx",
    rating: 4.6,
    installs: 860,
    summary: "Rewards every operator whose shift ships with zero defects.",
    metrics: [{ key: "quality.defects", label: "Defects per shift", connected: true }],
    steps: ["Event: shift closed", "Rule: defects = 0", "Supervisor approval", "100 points each"],
    fairness: "Everyone who qualifies is rewarded — no ranking, no losers.",
    languages: ["en", "ta", "hi", "te"],
  },
  {
    id: "mk-perfect-attendance",
    name: "Perfect attendance month",
    base: "perfect-attendance",
    industry: "Manufacturing",
    category: "Attendance",
    publisher: "Veronyx",
    publisherName: "Veronyx",
    rating: 4.4,
    installs: 2110,
    summary: "A small monthly thank-you for full attendance, excluding approved leave.",
    metrics: [{ key: "attendance.pct", label: "Attendance %", connected: true }],
    steps: [
      "Monthly schedule",
      "Rule: attendance = 100% (approved leave excluded)",
      "Auto-approve under ₹250",
      "200 points",
    ],
    fairness: "Approved leave and medical leave never count against anyone.",
    languages: ["en", "ta", "hi", "te", "kn"],
  },
  {
    id: "mk-sales",
    name: "Monthly target achievers",
    base: "sales-achievers",
    industry: "Retail",
    category: "Sales",
    publisher: "Veronyx",
    publisherName: "Veronyx",
    rating: 4.7,
    installs: 1530,
    summary: "Everyone at or above 100% of their own sales target, with manager approval.",
    metrics: [
      { key: "sales.sales_vs_target", label: "Sales vs target", connected: true },
      { key: "sales.deals_closed", label: "Deals closed", connected: true },
    ],
    steps: [
      "Event: monthly sales file",
      "Rule: sales ≥ 100% of target",
      "Manager approval",
      "500 points each",
    ],
    fairness: "Uses each person's own target, so territory size doesn't decide winners.",
    languages: ["en", "hi"],
  },
  {
    id: "mk-collections",
    name: "Collection efficiency champions",
    base: "sales-achievers",
    industry: "BFSI & collections",
    category: "Sales",
    publisher: "Partner",
    publisherName: "LendWell Advisory",
    rating: 4.3,
    installs: 310,
    summary: "Top collectors by efficiency in each branch, minimum 40 accounts.",
    metrics: [
      { key: "collections.efficiency", label: "Collection efficiency", connected: false },
      { key: "collections.accounts", label: "Accounts handled", connected: false },
    ],
    steps: [
      "Monthly schedule",
      "Filter: ≥ 40 accounts",
      "Rank by efficiency per branch",
      "Branch head approval",
      "₹1,000 / ₹500 vouchers",
    ],
    fairness: "Per-branch ranking with a minimum case load avoids rewarding tiny books.",
    languages: ["en", "hi", "mr"],
  },
  {
    id: "mk-csat",
    name: "CSAT champion",
    base: "csat-champion",
    industry: "IT services",
    category: "Service",
    publisher: "Veronyx",
    publisherName: "Veronyx",
    rating: 4.5,
    installs: 940,
    summary: "Top support agents by average CSAT, with a minimum number of tickets.",
    metrics: [
      { key: "support.csat_avg", label: "Average CSAT", connected: true },
      { key: "support.ticket_resolved", label: "Tickets resolved", connected: true },
    ],
    steps: [
      "Monthly schedule",
      "Filter: ≥ 50 tickets",
      "Rank by CSAT",
      "Owner approval",
      "₹2,000 / ₹1,000",
    ],
    fairness: "Minimum ticket count stops a handful of happy customers deciding the winner.",
    languages: ["en", "hi", "ta"],
  },
  {
    id: "mk-patient",
    name: "Patient feedback stars",
    base: "csat-champion",
    industry: "Healthcare",
    category: "Service",
    publisher: "Community",
    publisherName: "Shared by Arogya Clinics",
    rating: 4.2,
    installs: 120,
    summary: "Nurses and front-desk staff with the best patient feedback each month.",
    metrics: [{ key: "feedback.score", label: "Patient feedback score", connected: false }],
    steps: [
      "Monthly schedule",
      "Filter: ≥ 30 responses",
      "Rank by score per ward",
      "Nursing head approval",
      "500 points",
    ],
    fairness: "Ranks within each ward so night wards are not compared with OPD.",
    languages: ["en", "ml", "ta"],
  },
  {
    id: "mk-on-time",
    name: "On-time delivery heroes",
    base: "line-star",
    industry: "Logistics",
    category: "Production",
    publisher: "Partner",
    publisherName: "RouteMax",
    rating: 4.1,
    installs: 205,
    summary: "Drivers with 98%+ on-time deliveries and no damage claims in the week.",
    metrics: [{ key: "delivery.on_time", label: "On-time %", connected: false }],
    steps: [
      "Weekly schedule",
      "Rule: on-time ≥ 98% and claims = 0",
      "Hub manager approval",
      "300 points",
    ],
    fairness: "Route difficulty is shown next to each driver so long routes are not penalised.",
    languages: ["en", "hi", "kn", "te"],
  },
  {
    id: "mk-anniversary",
    name: "Work anniversaries",
    base: "anniversary",
    industry: "Hospitality",
    category: "Tenure",
    publisher: "Veronyx",
    publisherName: "Veronyx",
    rating: 4.9,
    installs: 3020,
    summary: "Celebrate every joining anniversary with a message and a milestone reward.",
    metrics: [{ key: "employee.joining_date", label: "Joining date", connected: true }],
    steps: [
      "Daily schedule",
      "Event: joining anniversary today",
      "Auto-approve under ₹1,000",
      "Message + 500 points",
    ],
    fairness: "Everyone is celebrated — tenure is about loyalty, not performance.",
    languages: ["en", "hi", "ta", "te", "kn", "mr", "bn", "gu", "ml"],
  },
  {
    id: "mk-peer",
    name: "Peer thank-you boost",
    base: "anniversary",
    industry: "IT services",
    category: "Peer",
    publisher: "Community",
    publisherName: "Shared by Kovai Software",
    rating: 4.0,
    installs: 410,
    summary: "Three THANKS shoutouts from different colleagues in a week earn a small boost.",
    metrics: [{ key: "peer.shoutouts", label: "Peer shoutouts", connected: true }],
    steps: [
      "Event: shoutout received",
      "Rule: 3 different givers in 7 days",
      "Anti-gaming check",
      "Auto-approve 100 points",
    ],
    fairness: "Reciprocal pairs don't count, so friends can't farm points.",
    languages: ["en", "hi", "ta"],
  },
];

export function filterMarketplace(
  list: MarketplaceTemplate[],
  {
    query = "",
    industry = "All industries",
    category = "All",
  }: { query?: string; industry?: string; category?: string },
) {
  const q = query.trim().toLowerCase();
  return list.filter(
    (t) =>
      (industry === "All industries" || t.industry === industry) &&
      (category === "All" || t.category === category) &&
      (!q || `${t.name} ${t.summary} ${t.industry} ${t.publisherName}`.toLowerCase().includes(q)),
  );
}
