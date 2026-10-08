import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { useInsightsStore } from "@/store/insights-store";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: [
      { title: "Recognition insights — Veronyx Recognise" },
      {
        name: "description",
        content: "Ask questions about recognition and fairness with evidence-linked answers.",
      },
      { property: "og:title", content: "Recognition insights — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Ask questions about recognition and fairness with evidence-linked answers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsIndex,
});

function InsightsIndex() {
  const navigate = useNavigate();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const { threads, createThread } = useInsightsStore.getState();
    const threadId = threads[0]?.id ?? createThread();
    void navigate({ to: "/insights/$threadId", params: { threadId }, replace: true });
  }, [navigate]);
  return null;
}
