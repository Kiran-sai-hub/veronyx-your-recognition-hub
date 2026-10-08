import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { ManagerDashboard } from "@/components/dashboards";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/dashboard/manager")({
  head: () => ({
    meta: [
      { title: "Manager dashboard — Veronyx Recognise" },
      { name: "description", content: "Team leaderboard, wallet and people to recognise next." },
      { property: "og:title", content: "Manager dashboard — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Team leaderboard, wallet and people to recognise next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const persona = useAppStore((s) => s.persona);
  return (
    <AdminRoutePage pathname="/dashboard/manager">
      <ManagerDashboard viewer={persona} />
    </AdminRoutePage>
  );
}
