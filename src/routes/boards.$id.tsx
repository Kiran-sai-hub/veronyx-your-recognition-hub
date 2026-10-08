import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { BoardConfigPage } from "@/components/board-config-page";
import { useAppStore, useCopilotEnabled } from "@/store/app-store";

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
  validateSearch: (
    search: Record<string, unknown>,
  ): { industry?: string | undefined; role?: string | undefined; blank?: string | undefined } => ({
    industry: typeof search["industry"] === "string" ? search["industry"] : undefined,
    role: typeof search["role"] === "string" ? search["role"] : undefined,
    blank: typeof search["blank"] === "string" ? search["blank"] : undefined,
  }),
  component: RoutePage,
});

function RoutePage() {
  const { id } = Route.useParams();
  const { industry, role, blank } = Route.useSearch();
  const openCopilot = useAppStore((state) => state.openCopilot);
  const persona = useAppStore((state) => state.persona);
  const aiEnabled = useCopilotEnabled();
  return (
    <AdminRoutePage pathname={`/boards/${id}`}>
      <BoardConfigPage
        key={`${id}-${industry ?? ""}-${role ?? ""}-${blank ?? ""}`}
        boardId={id}
        industry={industry}
        role={role}
        readOnly={persona === "manager"}
        aiEnabled={aiEnabled}
        onAskAi={(prompt) => openCopilot(prompt)}
      />
    </AdminRoutePage>
  );
}
