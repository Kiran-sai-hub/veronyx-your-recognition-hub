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
  category: "Shopping" | "Food" | "Fuel" | "Experience" | "Donation";
  taxNature: "Non-cash gift" | "Cash equivalent" | "Meal voucher";
  accent: string;
};

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
    points: 300 + ((index * 137) % 2400),
    status: index === 199 ? "exited" : "active",
  };
});

export const currentEmployee = employees[8] ?? employees[0];

export const rewards: Reward[] = [
  {
    id: "amazon-500",
    brand: "Amazon",
    title: "Amazon shopping voucher",
    points: 500,
    value: 500,
    category: "Shopping",
    taxNature: "Non-cash gift",
    accent: "A",
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
  },
  {
    id: "akshaya-250",
    brand: "Akshaya Patra",
    title: "Sponsor school meals",
    points: 250,
    value: 250,
    category: "Donation",
    taxNature: "Non-cash gift",
    accent: "AP",
  },
  {
    id: "upi-1000",
    brand: "UPI",
    title: "UPI cash reward",
    points: 1100,
    value: 1000,
    category: "Shopping",
    taxNature: "Cash equivalent",
    accent: "₹",
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
