import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { TemplateMarketplacePage } from "@/components/template-marketplace-page";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/workflows/templates")({
  head: () => ({
    meta: [
      { title: "Template marketplace — Veronyx Recognise" },
      {
        name: "description",
        content: "Ready-made recognition workflows by industry, from Veronyx and partners.",
      },
      { property: "og:title", content: "Template marketplace — Veronyx Recognise" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const persona = useAppStore((s) => s.persona);
  return (
    <AdminRoutePage pathname="/workflows/templates">
      <TemplateMarketplacePage readOnly={persona === "manager"} />
    </AdminRoutePage>
  );
}
