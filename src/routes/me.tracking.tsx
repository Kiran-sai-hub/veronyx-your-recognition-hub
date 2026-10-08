import { createFileRoute } from "@tanstack/react-router";
import { EmployeeRoutePage } from "@/components/employee-route-page";
export const Route = createFileRoute("/me/tracking")({
  head: () => ({
    meta: [
      { title: "How I’m tracking — Radha Krishna Mills" },
      { name: "description", content: "See your private progress against current goals." },
      { property: "og:title", content: "How I’m tracking — Radha Krishna Mills" },
      { property: "og:description", content: "See your private progress against current goals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <EmployeeRoutePage kind="tracking" pathname="/me/tracking" />,
});
