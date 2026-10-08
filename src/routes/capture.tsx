import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { CapturePage } from "@/components/capture-page";

export const Route = createFileRoute("/capture")({
  head: () => ({
    meta: [
      { title: "Native capture — Veronyx Recognise" },
      {
        name: "description",
        content: "Build phone and WhatsApp forms for your team and review their entries.",
      },
      { property: "og:title", content: "Native capture — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Build phone and WhatsApp forms for your team and review their entries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/capture">
      <CapturePage />
    </AdminRoutePage>
  );
}
