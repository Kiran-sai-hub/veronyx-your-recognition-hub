import { createFileRoute } from "@tanstack/react-router";
import { EmployeeRoutePage } from "@/components/employee-route-page";
export const Route = createFileRoute("/me/preferences")({
  head: () => ({
    meta: [
      { title: "Preferences — Radha Krishna Mills" },
      { name: "description", content: "Choose your language and notification preferences." },
      { property: "og:title", content: "Preferences — Radha Krishna Mills" },
      { property: "og:description", content: "Choose your language and notification preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <EmployeeRoutePage kind="preferences" pathname="/me/preferences" />,
});
