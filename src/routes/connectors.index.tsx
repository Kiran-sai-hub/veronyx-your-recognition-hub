import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { ConnectorsPage } from "@/components/connectors-page";

export const Route = createFileRoute("/connectors/")({
  head: () => ({
    meta: [
      { title: "Connectors & data — Veronyx Recognise" },
      {
        name: "description",
        content: "Bring performance data in from files, sheets and other software.",
      },
      { property: "og:title", content: "Connectors & data — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Bring performance data in from files, sheets and other software.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const navigate = useNavigate();
  return (
    <AdminRoutePage pathname="/connectors">
      <ConnectorsPage onOpenMapping={() => navigate({ to: "/connectors/mapping" })} />
    </AdminRoutePage>
  );
}
