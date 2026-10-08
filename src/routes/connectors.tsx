import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/connectors")({
  component: ConnectorsLayout,
});

function ConnectorsLayout() {
  return <Outlet />;
}
