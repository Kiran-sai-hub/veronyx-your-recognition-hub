import { createFileRoute } from "@tanstack/react-router";
import { EmployeeRoutePage } from "@/components/employee-route-page";
export const Route = createFileRoute("/me/recognitions")({
  head: () => ({
    meta: [
      { title: "My recognitions — Radha Krishna Mills" },
      { name: "description", content: "View the recognition you received and gave." },
      { property: "og:title", content: "My recognitions — Radha Krishna Mills" },
      { property: "og:description", content: "View the recognition you received and gave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <EmployeeRoutePage kind="recognitions" pathname="/me/recognitions" />,
});
