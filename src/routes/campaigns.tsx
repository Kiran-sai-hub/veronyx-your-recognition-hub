import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { CampaignsPage } from "@/components/campaigns-page";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaigns — Veronyx Recognise" },
      {
        name: "description",
        content: "Plan festival campaigns like Diwali, Pongal and Onam with their own budget.",
      },
      { property: "og:title", content: "Campaigns — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Plan festival campaigns like Diwali, Pongal and Onam with their own budget.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/campaigns">
      <CampaignsPage />
    </AdminRoutePage>
  );
}
