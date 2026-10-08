import { createFileRoute } from "@tanstack/react-router";
import { EmployeeRoutePage } from "@/components/employee-route-page";
export const Route = createFileRoute("/me/shoutout")({
  head: () => ({
    meta: [
      { title: "Send a shoutout — Radha Krishna Mills" },
      { name: "description", content: "Thank a colleague for work that made a difference." },
      { property: "og:title", content: "Send a shoutout — Radha Krishna Mills" },
      { property: "og:description", content: "Thank a colleague for work that made a difference." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <EmployeeRoutePage kind="shoutout" pathname="/me/shoutout" />,
});
