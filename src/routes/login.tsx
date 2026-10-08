import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/auth-page";

export const Route = createFileRoute("/login")({
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
  component: LoginPage,
});
