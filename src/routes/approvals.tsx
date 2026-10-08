import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { ApprovalsPage } from "@/components/approvals-page";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — Veronyx Recognise" },
      { name: "description", content: "Approve, modify, reject or escalate pending rewards." },
      { property: "og:title", content: "Approvals — Veronyx Recognise" },
      { property: "og:description", content: "Approve, modify, reject or escalate pending rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return <AdminRoutePage pathname="/approvals"><ApprovalsPage /></AdminRoutePage>;
}
