import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { AdminRewardsPage } from "@/components/admin-rewards-page";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards & catalogue — Veronyx Recognise" },
      { name: "description", content: "Manage the reward catalogue and track redemption orders." },
      { property: "og:title", content: "Rewards & catalogue — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Manage the reward catalogue and track redemption orders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/rewards">
      <AdminRewardsPage />
    </AdminRoutePage>
  );
}
