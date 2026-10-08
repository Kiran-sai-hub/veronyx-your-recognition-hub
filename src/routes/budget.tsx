import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { BudgetPage } from "@/components/budget-page";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget & ledger — Veronyx Recognise" },
      {
        name: "description",
        content: "Track reward budget from the company pool to each manager, with a full ledger.",
      },
      { property: "og:title", content: "Budget & ledger — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Track reward budget from the company pool to each manager, with a full ledger.",
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
    <AdminRoutePage pathname="/budget">
      <BudgetPage ownPoolId={persona === "manager" ? "pool-sales-a" : undefined} />
    </AdminRoutePage>
  );
}
