import { currentEmployee } from "@/lib/mock-data";
import type { Persona } from "@/store/app-store";

/**
 * Global navigation and role visibility, mirroring checklist §1.2 (sidebar) and §1.3
 * (role matrix). "view" means the role can open the screen but only for its own scope
 * (e.g. a manager sees their own team) and cannot change programme settings.
 */
export type Access = "full" | "view" | "none";

export type NavKey =
  | "dashboard"
  | "boards"
  | "workflows"
  | "approvals"
  | "rewards"
  | "people"
  | "connectors"
  | "analytics"
  | "budget"
  | "copilot"
  | "settings";

export type NavChild = { to: string; label: string; access?: Partial<Record<Persona, Access>> };

export type NavItem = {
  key: NavKey;
  label: string;
  to: string;
  /** Extra path prefixes that belong to this section (sub-screens). */
  matches: string[];
  access: Record<Persona, Access>;
  viewNote?: string;
  children?: NavChild[];
};

const ownerHr = { owner: "full", hr: "full" } as const;

export const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/dashboard",
    matches: ["/dashboard"],
    access: { ...ownerHr, manager: "full", employee: "none" },
  },
  {
    key: "boards",
    label: "Performance Boards",
    to: "/boards",
    matches: ["/boards", "/capture"],
    access: { ...ownerHr, manager: "view", employee: "none" },
    viewNote: "You can view your own team's boards. Ask HR to change a board.",
    children: [
      { to: "/boards", label: "Boards" },
      { to: "/capture", label: "Native capture & entries" },
    ],
  },
  {
    key: "workflows",
    label: "Workflows",
    to: "/workflows",
    matches: ["/workflows"],
    access: { ...ownerHr, manager: "view", employee: "none" },
    viewNote: "You can view workflows that cover your team. Ask HR to change one.",
    children: [
      { to: "/workflows", label: "All workflows" },
      { to: "/workflows/templates", label: "Template marketplace" },
    ],
  },
  {
    key: "approvals",
    label: "Approvals",
    to: "/approvals",
    matches: ["/approvals"],
    access: { ...ownerHr, manager: "full", employee: "none" },
  },
  {
    key: "rewards",
    label: "Rewards & Catalogue",
    to: "/rewards",
    matches: ["/rewards", "/payroll", "/campaigns"],
    access: { ...ownerHr, manager: "view", employee: "none" },
    viewNote: "Team view: you can see the catalogue and your team's redemptions.",
    children: [
      { to: "/rewards", label: "Catalogue & orders" },
      { to: "/payroll", label: "Payroll export", access: { manager: "none" } },
      { to: "/campaigns", label: "Campaigns", access: { manager: "none" } },
    ],
  },
  {
    key: "people",
    label: "People & Teams",
    to: "/people",
    matches: ["/people"],
    access: { ...ownerHr, manager: "view", employee: "none" },
    viewNote: "Showing your own team only.",
  },
  {
    key: "connectors",
    label: "Connectors & Data",
    to: "/connectors",
    matches: ["/connectors"],
    access: { ...ownerHr, manager: "none", employee: "none" },
    children: [
      { to: "/connectors", label: "Sources & data health" },
      { to: "/connectors/mapping", label: "Mapping & identity" },
    ],
  },
  {
    key: "analytics",
    label: "Analytics & Fairness",
    to: "/analytics",
    matches: ["/analytics", "/fairness"],
    access: { ...ownerHr, manager: "view", employee: "none" },
    viewNote: "Showing figures for your own team.",
    children: [
      { to: "/analytics", label: "Analytics" },
      { to: "/fairness", label: "Fairness & coverage" },
    ],
  },
  {
    key: "budget",
    label: "Budget & Ledger",
    to: "/budget",
    matches: ["/budget"],
    access: { ...ownerHr, manager: "view", employee: "none" },
    viewNote: "You can see your own wallet. Budget pools are managed by HR.",
  },
  {
    key: "copilot",
    label: "AI Copilot",
    to: "/copilot",
    matches: ["/copilot", "/insights"],
    access: { ...ownerHr, manager: "none", employee: "none" },
  },
  {
    key: "settings",
    label: "Settings",
    to: "/settings",
    matches: ["/settings", "/compliance"],
    access: { ...ownerHr, manager: "none", employee: "none" },
    children: [
      { to: "/settings?tab=org", label: "Org Profile" },
      { to: "/settings?tab=roles", label: "Roles & Permissions" },
      { to: "/compliance", label: "Privacy & DPDP" },
      { to: "/settings?tab=notifications", label: "Notification Templates" },
      { to: "/settings?tab=integrations", label: "Integrations" },
    ],
  },
];

/** Other surfaces from checklist §1.1, shown to admins so the demo can reach them. */
export const otherSurfaces = [
  { to: "/me", label: "Employee app (PWA)" },
  { to: "/whatsapp", label: "WhatsApp bot" },
  { to: "/kiosk", label: "Kiosk mode" },
] as const;

function stripQuery(path: string) {
  return path.split("?")[0] ?? path;
}

export function sectionFor(pathname: string): NavItem | undefined {
  const path = stripQuery(pathname);
  return navItems.find((item) =>
    item.matches.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
  );
}

/** Access for a path: section access, narrowed by a child entry if it restricts the role. */
export function accessFor(pathname: string, persona: Persona): Access {
  const path = stripQuery(pathname);
  if (path === "/whatsapp" || path === "/kiosk")
    return persona === "owner" || persona === "hr" ? "full" : "none";
  if (path.startsWith("/dashboard/")) {
    const target = path.slice("/dashboard/".length);
    if (persona === "owner" || persona === "hr") return "full";
    if (persona === "manager") return target === "manager" ? "full" : "none";
    return "none";
  }
  const section = sectionFor(path);
  if (!section) return "full";
  const child = section.children?.find((c) => stripQuery(c.to) === path);
  return child?.access?.[persona] ?? section.access[persona];
}

export function visibleNav(persona: Persona) {
  return navItems
    .filter((item) => item.access[persona] !== "none")
    .map((item) => ({
      ...item,
      children: item.children?.filter((c) => (c.access?.[persona] ?? "full") !== "none"),
    }));
}

export const roleLabel: Record<Persona, string> = {
  owner: "Owner / MD",
  hr: "HR Admin",
  manager: "Team Manager",
  employee: "Employee",
};

export const personaUser: Record<Persona, { name: string; initials: string; detail: string }> = {
  owner: { name: "Ramesh Krishnan", initials: "RK", detail: "Managing Director" },
  hr: { name: "Lakshmi Menon", initials: "LM", detail: "HR Admin" },
  manager: { name: "Vikram Rao", initials: "VR", detail: "Manager · Sales A" },
  employee: {
    name: currentEmployee?.name ?? "Priya Joshi",
    initials: "PJ",
    detail: `${currentEmployee?.team ?? "Manufacturing C"} · ${currentEmployee?.location ?? "Coimbatore"}`,
  },
};
