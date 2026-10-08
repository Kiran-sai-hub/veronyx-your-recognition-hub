import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { OwnerDashboard } from "@/components/dashboards";

export const Route = createFileRoute("/dashboard/owner")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — Veronyx Recognise" },
      {
        name: "description",
        content: "Company-wide recognition, budget and approvals at a glance.",
      },
      { property: "og:title", content: "Owner dashboard — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Company-wide recognition, budget and approvals at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/dashboard/owner">
      <OwnerDashboard />
    </AdminRoutePage>
  );
}
