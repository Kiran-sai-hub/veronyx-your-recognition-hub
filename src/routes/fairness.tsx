import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { FairnessPage } from "@/components/fairness-page";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/fairness")({
  head: () => ({
    meta: [
      { title: "Fairness & coverage — Veronyx Recognise" },
      { name: "description", content: "Equity cuts, manager spread, who is missed and unusual activity alerts." },
      { property: "og:title", content: "Fairness & coverage — Veronyx Recognise" },
      { property: "og:description", content: "Equity cuts, manager spread, who is missed and unusual activity alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const persona = useAppStore((s) => s.persona);
  return (
    <AdminRoutePage pathname="/fairness">
      <FairnessPage canSeePrivate={persona !== "hr"} />
    </AdminRoutePage>
  );
}
