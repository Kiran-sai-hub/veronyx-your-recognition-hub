export type Employee = {
  id: string;
  name: string;
  code: string;
  department: string;
  team: string;
  location: string;
  points: number;
  status: "active" | "exited";
};

export type Reward = {
  id: string;
  brand: string;
  title: string;
  points: number;
  value: number;
  category: "Ecommerce" | "Food" | "Fuel" | "Experience" | "Donation" | "Merchandise";
  taxNature: "Non-cash gift" | "Cash equivalent" | "Meal voucher";
  accent: string;
  delivery: "Code" | "Link" | "Physical" | "UPI" | "Payroll";
  popularity: number;
  isNew?: boolean;
  validityMonths: number;
  terms: string[];
};

export const rewardCategories = [
  "Ecommerce",
  "Food",
  "Fuel",
  "Experience",
  "Donation",
  "Merchandise",
] as const;

const departments = ["Manufacturing", "Quality", "Sales", "Operations"] as const;
const firstNames = [
  "Aarav",
  "Ananya",
  "Arjun",
  "Deepa",
  "Ishaan",
  "Kavya",
  "Meera",
  "Nikhil",
  "Priya",
  "Rahul",
  "Sanjay",
  "Lakshmi",
  "Imran",
  "Fatima",
  "Gurpreet",
  "Anil",
  "Divya",
  "Karthik",
  "Pooja",
  "Joseph",
  "Suresh",
];
const lastNames = [
  "Sharma",
  "Iyer",
  "Kumar",
  "Patel",
  "Rao",
  "Singh",
  "Nair",
  "Das",
  "Joshi",
  "Reddy",
  "Khan",
  "Menon",
  "Pillai",
  "Banerjee",
  "Gowda",
  "Fernandes",
];

/**
 * 200 deterministic employees. Every first/last name pair is unique, and each department is
 * spread across teams A–D (e.g. Sales A is indices 2, 18, 34, …).
 */
export const employees: Employee[] = Array.from({ length: 200 }, (_, index) => {
  const department = departments[index % departments.length] ?? "Operations";
  const first = firstNames[index % firstNames.length];
  const last = lastNames[(index + 2 * Math.floor(index / firstNames.length)) % lastNames.length];
  return {
    id: `emp-${index + 1}`,
    name: `${first} ${last}`,
    code: `RKM${String(index + 1).padStart(4, "0")}`,
    department,
    team: `${department} ${String.fromCharCode(65 + (Math.floor(index / 4) % 4))}`,
    location:
      ["Coimbatore", "Chennai", "Erode", "Tiruppur"][Math.floor(index / 2) % 4] ?? "Chennai",
    // Index 8 is the demo employee; their wallet starts at 1,850 points.
    points: index === 8 ? 1850 : 300 + ((index * 137) % 2400),
    status: index === 199 ? "exited" : "active",
  };
});

export const currentEmployee = employees[8] ?? employees[0];

const standardTerms = [
  "Cannot be exchanged for cash or returned once the code is revealed.",
  "Use before the expiry date shown on the code.",
  "Lost codes can be re-sent from your redemption history.",
];

export const rewards: Reward[] = [
  {
    id: "amazon-500",
    brand: "Amazon",
    title: "Amazon Pay e-gift card",
    points: 500,
    value: 500,
    category: "Ecommerce",
    taxNature: "Non-cash gift",
    accent: "A",
    delivery: "Code",
    popularity: 98,
    validityMonths: 12,
    terms: standardTerms,
  },
  {
    id: "flipkart-1000",
    brand: "Flipkart",
    title: "Flipkart gift voucher",
    points: 1000,
    value: 1000,
    category: "Ecommerce",
    taxNature: "Non-cash gift",
    accent: "F",
    delivery: "Code",
    popularity: 90,
    validityMonths: 12,
    terms: standardTerms,
  },
  {
    id: "swiggy-300",
    brand: "Swiggy",
    title: "Swiggy meal voucher",
    points: 300,
    value: 300,
    category: "Food",
    taxNature: "Meal voucher",
    accent: "S",
    delivery: "Link",
    popularity: 95,
    validityMonths: 6,
    terms: ["Valid on food orders only.", ...standardTerms],
  },
  {
    id: "fuel-1000",
    brand: "IndianOil",
    title: "Fuel gift card",
    points: 1000,
    value: 1000,
    category: "Fuel",
    taxNature: "Non-cash gift",
    accent: "IO",
    delivery: "Code",
    popularity: 80,
    validityMonths: 12,
    terms: ["Valid at participating IndianOil outlets.", ...standardTerms],
  },
  {
    id: "bookmyshow-500",
    brand: "BookMyShow",
    title: "Movies for two",
    points: 500,
    value: 500,
    category: "Experience",
    taxNature: "Non-cash gift",
    accent: "B",
    delivery: "Link",
    popularity: 70,
    isNew: true,
    validityMonths: 3,
    terms: ["Two tickets, any show before the expiry date.", ...standardTerms],
  },
  {
    id: "akshaya-250",
    brand: "Akshaya Patra",
    title: "Donate 25 school meals",
    points: 250,
    value: 250,
    category: "Donation",
    taxNature: "Non-cash gift",
    accent: "AP",
    delivery: "Link",
    popularity: 55,
    validityMonths: 0,
    terms: [
      "A thank-you certificate is sent to you on WhatsApp.",
      "80G receipt available on request.",
    ],
  },
  {
    id: "rkm-tshirt",
    brand: "Radha Krishna Mills",
    title: "Company cotton T-shirt",
    points: 400,
    value: 400,
    category: "Merchandise",
    taxNature: "Non-cash gift",
    accent: "RK",
    delivery: "Physical",
    popularity: 60,
    isNew: true,
    validityMonths: 0,
    terms: ["Collect from HR at your location within 7 days.", "Sizes S to XXL."],
  },
  {
    id: "upi-1000",
    brand: "UPI cash-out",
    title: "₹ 1,000 to your UPI",
    points: 1100,
    value: 1000,
    category: "Ecommerce",
    taxNature: "Cash equivalent",
    accent: "₹",
    delivery: "UPI",
    popularity: 85,
    validityMonths: 0,
    terms: [
      "Cash rewards are fully taxable and shown in your payslip.",
      "Paid to your registered UPI ID within 2 working days.",
    ],
  },
];

export const recognitions = [
  {
    id: "rec-1",
    title: "Quality champion",
    message: "For catching a fabric defect before dispatch.",
    points: 250,
    from: "Arun Kumar",
    date: "06/10/2026",
  },
  {
    id: "rec-2",
    title: "Team player",
    message: "For helping Line B complete the festival order.",
    points: 150,
    from: "Meera Nair",
    date: "29/09/2026",
  },
  {
    id: "rec-3",
    title: "Perfect attendance",
    message: "For a complete September attendance record.",
    points: 300,
    from: "Radha Krishna Mills",
    date: "01/10/2026",
  },
];

export const trackingMetrics = [
  {
    label: "Quality checks passed",
    value: "98.4%",
    detail: "Target 97% · 12 days left",
    progress: 98,
  },
  { label: "Units completed", value: "1,842", detail: "92% of monthly target", progress: 92 },
  {
    label: "Attendance",
    value: "100%",
    detail: "Private · visible to you and your manager",
    progress: 100,
  },
];

export const languageOptions = [
  ["en", "English"],
  ["hi", "हिन्दी"],
  ["ta", "தமிழ்"],
  ["te", "తెలుగు"],
  ["kn", "ಕನ್ನಡ"],
  ["mr", "मराठी"],
  ["bn", "বাংলা"],
  ["gu", "ગુજરાતી"],
  ["ml", "മലയാളം"],
] as const;
