import { createFileRoute } from "@tanstack/react-router";

import { handleInsightsChat } from "@/lib/ai/insights-chat.server";

export const Route = createFileRoute("/api/insights")({
  server: { handlers: { POST: ({ request }) => handleInsightsChat(request) } },
});
