import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { WhatsappSimulator } from "@/components/whatsapp-simulator";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp simulator — Veronyx Recognise" },
      {
        name: "description",
        content:
          "Preview the frontline WhatsApp journey: join, balance, redeem, thanks, language and stop.",
      },
      { property: "og:title", content: "WhatsApp simulator — Veronyx Recognise" },
      {
        property: "og:description",
        content:
          "Preview the frontline WhatsApp journey: join, balance, redeem, thanks, language and stop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/whatsapp">
      <WhatsappSimulator />
    </AdminRoutePage>
  );
}
