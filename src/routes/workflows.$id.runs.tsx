import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { WorkflowRunsPage } from "@/components/workflow-runs-page";

export const Route = createFileRoute("/workflows/$id/runs")({
  head: () => ({
    meta: [
      { title: "Workflow runs and versions — Veronyx Recognise" },
      { name: "description", content: "Run history, versions and step-by-step decision traces." },
      { property: "og:title", content: "Workflow runs and versions — Veronyx Recognise" },
      { property: "og:description", content: "Run history, versions and step-by-step decision traces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const { id } = Route.useParams();
  return <AdminRoutePage pathname={`/workflows/${id}/runs`}><WorkflowRunsPage workflowId={id} /></AdminRoutePage>;
}
