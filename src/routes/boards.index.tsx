import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { BoardsPage } from "@/components/boards-page";
import { useAppStore } from "@/store/app-store";

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
  return (
    <AdminRoutePage pathname="/boards">
      <BoardsPage
        onOpenBoard={(id) => navigate({ to: "/boards/$id", params: { id } })}
        onAskAi={(prompt) => openCopilot(prompt)}
      />
    </AdminRoutePage>
  );
}
