import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { BoardsPage } from "@/components/boards-page";
import { useAppStore, useCopilotEnabled } from "@/store/app-store";

export const Route = createFileRoute("/boards/")({
  head: () => ({
    meta: [
      { title: "Performance boards — Veronyx Recognise" },
      {
        name: "description",
        content: "Track the numbers that matter and turn them into recognition.",
      },
      { property: "og:title", content: "Performance boards — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Track the numbers that matter and turn them into recognition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const navigate = useNavigate();
  const openCopilot = useAppStore((state) => state.openCopilot);
  const persona = useAppStore((state) => state.persona);
  const aiEnabled = useCopilotEnabled();
  return (
    <AdminRoutePage pathname="/boards">
      <BoardsPage
        onOpenBoard={(id, search) =>
          navigate({ to: "/boards/$id", params: { id }, search: search ?? {} })
        }
        onAskAi={(prompt) => openCopilot(prompt)}
        aiEnabled={aiEnabled}
        readOnly={persona === "manager"}
      />
    </AdminRoutePage>
  );
}
