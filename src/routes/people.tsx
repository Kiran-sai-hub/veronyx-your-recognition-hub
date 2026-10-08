import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { PeoplePage } from "@/components/people-page";

export const Route = createFileRoute("/people")({
  head: () => ({
    meta: [
      { title: "People & teams — Veronyx Recognise" },
      {
        name: "description",
        content: "Employees, departments, teams and locations at Radha Krishna Mills.",
      },
      { property: "og:title", content: "People & teams — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Employees, departments, teams and locations at Radha Krishna Mills.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/people">
      <PeoplePage />
    </AdminRoutePage>
  );
}
