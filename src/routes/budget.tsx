import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { BudgetPage } from "@/components/budget-page";

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
  return (
    <AdminRoutePage pathname="/budget">
      <BudgetPage />
    </AdminRoutePage>
  );
}
