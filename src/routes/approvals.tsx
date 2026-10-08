import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { ApprovalsPage } from "@/components/approvals-page";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — Veronyx Recognise" },
      { name: "description", content: "Approve, modify, reject or escalate pending rewards." },
      { property: "og:title", content: "Approvals — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Approve, modify, reject or escalate pending rewards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { id?: string | undefined } => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  component: RoutePage,
});

function RoutePage() {
  const { id } = Route.useSearch();
  const persona = useAppStore((s) => s.persona);
  return (
    <AdminRoutePage pathname="/approvals">
      <ApprovalsPage persona={persona} initialId={id} />
    </AdminRoutePage>
  );
}
