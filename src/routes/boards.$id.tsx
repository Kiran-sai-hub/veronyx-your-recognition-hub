import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { BoardConfigPage } from "@/components/board-config-page";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/boards/$id")({
  head: () => ({
    meta: [
      { title: "Board setup — Veronyx Recognise" },
      {
        name: "description",
        content:
          "Configure a performance board: source, scope, scorecard, targets, rules and visibility.",
      },
      { property: "og:title", content: "Board setup — Veronyx Recognise" },
      {
        property: "og:description",
        content:
          "Configure a performance board: source, scope, scorecard, targets, rules and visibility.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const { id } = Route.useParams();
  const openCopilot = useAppStore((state) => state.openCopilot);
  return (
    <AdminRoutePage pathname={`/boards/${id}`}>
      <BoardConfigPage boardId={id} onAskAi={(prompt) => openCopilot(prompt)} />
    </AdminRoutePage>
  );
}
