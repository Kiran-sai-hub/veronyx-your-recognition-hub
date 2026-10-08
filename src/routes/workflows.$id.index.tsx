import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { WorkflowBuilderPage } from "@/components/workflow-builder-page";
import { useAppStore, useCopilotEnabled } from "@/store/app-store";

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
  validateSearch: (
    search: Record<string, unknown>,
  ): { template?: string | undefined; from?: string | undefined } => ({
    template: typeof search["template"] === "string" ? search["template"] : undefined,
    from: typeof search["from"] === "string" ? search["from"] : undefined,
  }),
  component: RoutePage,
});

function RoutePage() {
  const { id } = Route.useParams();
  const { template, from } = Route.useSearch();
  const persona = useAppStore((s) => s.persona);
  const openCopilot = useAppStore((s) => s.openCopilot);
  const aiEnabled = useCopilotEnabled();
  return (
    <AdminRoutePage pathname={`/workflows/${id}`}>
      <WorkflowBuilderPage
        key={`${id}-${template ?? ""}-${from ?? ""}`}
        workflowId={id}
        templateId={template}
        fromAi={from === "ai"}
        readOnly={persona === "manager"}
        aiEnabled={aiEnabled}
        onAskAi={(prompt) => openCopilot(prompt)}
      />
    </AdminRoutePage>
  );
}
