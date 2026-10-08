import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { CompliancePage } from "@/components/compliance-page";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance centre — Veronyx Recognise" },
      {
        name: "description",
        content: "Privacy notices, consent, data requests, retention, tax tracker and audit log.",
      },
      { property: "og:title", content: "Compliance centre — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Privacy notices, consent, data requests, retention, tax tracker and audit log.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: string | undefined } => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : undefined,
  }),
  component: RoutePage,
});

function RoutePage() {
  const { tab } = Route.useSearch();
  return (
    <AdminRoutePage pathname="/compliance">
      <CompliancePage tab={tab} />
    </AdminRoutePage>
  );
}
