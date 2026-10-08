import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { KioskDisplay } from "@/components/kiosk-display";

export const Route = createFileRoute("/kiosk")({
  head: () => ({
    meta: [
      { title: "Kiosk display — Veronyx Recognise" },
      {
        name: "description",
        content: "Auto-rotating recognition leaderboard for factory and store screens.",
      },
      { property: "og:title", content: "Kiosk display — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Auto-rotating recognition leaderboard for factory and store screens.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  const navigate = useNavigate();
  return <KioskDisplay onExit={() => void navigate({ to: "/dashboard/hr" })} />;
}
