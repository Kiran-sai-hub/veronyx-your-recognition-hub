import { createFileRoute } from "@tanstack/react-router";
import { EmployeeRoutePage } from "@/components/employee-route-page";

export const Route = createFileRoute("/me/")({
  head: () => ({
    meta: [
      { title: "Home — Radha Krishna Mills" },
      {
        name: "description",
        content: "Your recognition, points and progress at Radha Krishna Mills.",
      },
      { property: "og:title", content: "Employee home — Radha Krishna Mills" },
      {
        property: "og:description",
        content: "Your recognition, points and progress at Radha Krishna Mills.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <EmployeeRoutePage kind="home" pathname="/me" />,
});
