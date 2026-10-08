import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { WorkflowBuilderPage } from "@/components/workflow-builder-page";

export const Route = createFileRoute("/workflows/$id/")({
  head: () => ({
    meta: [
      { title: "Workflow builder — Veronyx Recognise" },
      {
        name: "description",
        content: "Build, check and test a reward workflow before publishing.",
      },
      { property: "og:title", content: "Workflow builder — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Build, check and test a reward workflow before publishing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const { id } = Route.useParams();
  return (
    <AdminRoutePage pathname={`/workflows/${id}`}>
      <WorkflowBuilderPage key={id} workflowId={id} />
    </AdminRoutePage>
  );
}
