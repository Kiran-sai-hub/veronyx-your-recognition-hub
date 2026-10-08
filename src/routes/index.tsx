import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Veronyx Recognise — Performance, recognition and rewards" },
      {
        name: "description",
        content: "A multi-source performance, recognition and rewards platform for Indian SMEs.",
      },
      { property: "og:title", content: "Veronyx Recognise" },
      {
        property: "og:description",
        content: "Performance, recognition and rewards for Indian SMEs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return null;
}
