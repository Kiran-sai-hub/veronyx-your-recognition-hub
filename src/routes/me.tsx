import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout only: the employee home lives in me.index.tsx so child routes can render.
export const Route = createFileRoute("/me")({
  component: Outlet,
});
