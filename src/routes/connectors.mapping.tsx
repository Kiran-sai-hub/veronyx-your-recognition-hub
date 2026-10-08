import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { MappingPage } from "@/components/mapping-page";

export const Route = createFileRoute("/connectors/mapping")({
  head: () => ({
    meta: [
      { title: "Field mapping & identity — Veronyx Recognise" },
      {
        name: "description",
        content: "Match source columns to Veronyx fields and confirm who each record belongs to.",
      },
      { property: "og:title", content: "Field mapping & identity — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Match source columns to Veronyx fields and confirm who each record belongs to.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/connectors/mapping">
      <MappingPage />
    </AdminRoutePage>
  );
}
