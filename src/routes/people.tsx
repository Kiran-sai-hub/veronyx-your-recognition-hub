import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { PeoplePage } from "@/components/people-page";
import { useAppStore } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";

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
  const persona = useAppStore((s) => s.persona);
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  return (
    <AdminRoutePage pathname="/people">
      <PeoplePage teamOnly={persona === "manager"} emptyOrg={emptyOrg} />
    </AdminRoutePage>
  );
}
