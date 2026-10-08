import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { SettingsPage } from "@/components/settings-page";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Organisation settings — Veronyx Recognise" },
      { name: "description", content: "Company details, roles and permissions, message templates and billing." },
      { property: "og:title", content: "Organisation settings — Veronyx Recognise" },
      { property: "og:description", content: "Company details, roles and permissions, message templates and billing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  
  return (
    <AdminRoutePage pathname="/settings">
      <SettingsPage />
    </AdminRoutePage>
  );
}
