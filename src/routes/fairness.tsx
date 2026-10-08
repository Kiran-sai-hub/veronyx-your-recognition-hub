import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { FairnessPage } from "@/components/fairness-page";
import { MANAGER_TEAM } from "@/lib/approvals-data";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/fairness")({
  head: () => ({
    meta: [
      { title: "Fairness & coverage — Veronyx Recognise" },
      {
        name: "description",
        content: "Equity cuts, manager spread, who is missed and unusual activity alerts.",
      },
      { property: "og:title", content: "Fairness & coverage — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Equity cuts, manager spread, who is missed and unusual activity alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: string | undefined } => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : undefined,
  }),
  component: RoutePage,
});

function RoutePage() {
  const persona = useAppStore((s) => s.persona);
  const { tab } = Route.useSearch();
  return (
    <AdminRoutePage pathname="/fairness">
      <FairnessPage
        canSeePrivate={persona !== "hr"}
        tab={tab}
        team={persona === "manager" ? MANAGER_TEAM : undefined}
      />
    </AdminRoutePage>
  );
}
