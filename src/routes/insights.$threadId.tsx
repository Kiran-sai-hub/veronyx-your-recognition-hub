import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { useEffect } from "react";

import { AdminRoutePage } from "@/components/admin-route-page";
import { InsightsChat, InsightsThreadList } from "@/components/insights-chat";
import { CopilotTabs } from "@/components/copilot-tabs";
import { PageHeading } from "@/components/page-heading";
import { useAppStore } from "@/store/app-store";
import { useInsightsStore } from "@/store/insights-store";

export const Route = createFileRoute("/insights/$threadId")({
  head: () => ({
    meta: [
      { title: "Recognition insights — Veronyx Recognise" },
      {
        name: "description",
        content: "Ask why someone did or didn't win and see the evidence behind every answer.",
      },
      { property: "og:title", content: "Recognition insights — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Ask why someone did or didn't win and see the evidence behind every answer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InsightsThreadPage,
});

function InsightsThreadPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const persona = useAppStore((s) => s.persona);
  const { threads, createThread, saveMessages, deleteThread } = useInsightsStore();
  const thread = threads.find((t) => t.id === threadId);
  const allowed = persona === "owner" || persona === "hr";

  // Conversations are not saved, so an unknown id (e.g. after reload) starts fresh at the same URL.
  useEffect(() => {
    if (!thread) {
      useInsightsStore.setState((s) => ({
        threads: [
          { id: threadId, title: "New question", updatedAt: Date.now(), messages: [] },
          ...s.threads,
        ],
      }));
    }
  }, [thread, threadId]);

  const go = (id: string) => void navigate({ to: "/insights/$threadId", params: { threadId: id } });

  return (
    <AdminRoutePage pathname="/insights">
      <div className="space-y-6">
        <PageHeading
          eyebrow="AI Copilot"
          title="Evidence Q&A"
          description="Live AI answers about outcomes and fairness. Every answer cites the records it used."
          action={<CopilotTabs active="insights" />}
        />
        {!allowed ? (
          <div className="flex items-start gap-3 rounded-lg border border-private/30 bg-private-surface p-5 text-sm">
            <LockKeyhole className="mt-0.5 size-4 text-private" />
            <p>Evidence Q&A is part of AI Copilot, which is available to the Owner and HR Admin.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <aside>
              <InsightsThreadList
                threads={threads}
                activeId={threadId}
                onNew={() => go(createThread())}
                onSelect={go}
                onDelete={(id) => {
                  deleteThread(id);
                  if (id === threadId) {
                    const next = useInsightsStore.getState().threads[0]?.id ?? createThread();
                    go(next);
                  }
                }}
              />
            </aside>
            <section className="h-[70vh] min-h-[480px] rounded-lg border border-border">
              {thread && (
                <InsightsChat
                  key={threadId}
                  threadId={threadId}
                  persona={persona}
                  initialMessages={thread.messages}
                  onMessagesChange={(m) => saveMessages(threadId, m)}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </AdminRoutePage>
  );
}
