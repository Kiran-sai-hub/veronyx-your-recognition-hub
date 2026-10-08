import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { WorkflowListPage } from "@/components/workflow-list-page";
import { useAppStore, useCopilotEnabled } from "@/store/app-store";

export const Route = createFileRoute("/workflows/")({
  head: () => ({
    meta: [
      { title: "Workflows — Veronyx Recognise" },
      { name: "description", content: "All reward workflows with their status and latest runs." },
      { property: "og:title", content: "Workflows — Veronyx Recognise" },
      {
        property: "og:description",
        content: "All reward workflows with their status and latest runs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const persona = useAppStore((s) => s.persona);
  const openCopilot = useAppStore((s) => s.openCopilot);
  const aiEnabled = useCopilotEnabled();
  return (
    <AdminRoutePage pathname="/workflows">
      <WorkflowListPage
        readOnly={persona === "manager"}
        aiEnabled={aiEnabled}
        onAskAi={(prompt) => openCopilot(prompt)}
      />
    </AdminRoutePage>
  );
}
