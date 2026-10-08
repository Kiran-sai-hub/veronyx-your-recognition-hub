import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/auth-page";

export const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [
      { title: "Sign in — Veronyx Recognise" },
      { name: "description", content: "Sign in to manage recognition and rewards." },
      { property: "og:title", content: "Sign in — Veronyx Recognise" },
      { property: "og:description", content: "Sign in to manage recognition and rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { expired?: string | undefined } => ({
    expired: search["expired"] === undefined ? undefined : String(search["expired"]),
  }),
  component: RoutePage,
});

function RoutePage() {
  const { expired } = Route.useSearch();
  return <LoginPage expired={expired === "1"} />;
}
