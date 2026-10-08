import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { DesignSystemPage } from "@/components/design-system-page";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "Design system — Veronyx Recognise" },
      {
        name: "description",
        content: "Veronyx Recognise components, tokens and interface states.",
      },
      { property: "og:title", content: "Design system — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Veronyx Recognise components, tokens and interface states.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignSystemRoute,
});
function DesignSystemRoute() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <AppShell pathname={pathname}>
      <DesignSystemPage />
    </AppShell>
  );
}
