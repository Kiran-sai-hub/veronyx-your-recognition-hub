import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { AnalyticsPage } from "@/components/analytics-page";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Veronyx Recognise" },
      {
        name: "description",
        content:
          "Recognition coverage, spend, budget use, redemption, manager spread and performance lift.",
      },
      { property: "og:title", content: "Analytics — Veronyx Recognise" },
      {
        property: "og:description",
        content:
          "Recognition coverage, spend, budget use, redemption, manager spread and performance lift.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/analytics">
      <AnalyticsPage />
    </AdminRoutePage>
  );
}
