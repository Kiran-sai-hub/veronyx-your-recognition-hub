import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { HrDashboard } from "@/components/dashboards";

export const Route = createFileRoute("/dashboard/hr")({
  head: () => ({
    meta: [
      { title: "HR dashboard — Veronyx Recognise" },
      { name: "description", content: "Programme health, data health and compliance alerts for HR." },
      { property: "og:title", content: "HR dashboard — Veronyx Recognise" },
      { property: "og:description", content: "Programme health, data health and compliance alerts for HR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return <AdminRoutePage pathname="/dashboard/hr"><HrDashboard /></AdminRoutePage>;
}
