import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { CopilotPage } from "@/components/copilot-page";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI Copilot — Veronyx Recognise" },
      {
        name: "description",
        content:
          "Ask questions about recognition with sessions, charts, explanations and transcript export.",
      },
      { property: "og:title", content: "AI Copilot — Veronyx Recognise" },
      {
        property: "og:description",
        content:
          "Ask questions about recognition with sessions, charts, explanations and transcript export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const persona = useAppStore((s) => s.persona);
  const aiAvailable = useAppStore((s) => s.aiAvailable);
  return (
    <AdminRoutePage pathname="/copilot">
      <CopilotPage persona={persona} aiAvailable={aiAvailable} />
    </AdminRoutePage>
  );
}
