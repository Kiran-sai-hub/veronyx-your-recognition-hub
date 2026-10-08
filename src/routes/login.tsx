import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout only: the sign-in page lives in login.index.tsx so /login/otp can render.
export const Route = createFileRoute("/login")({
  component: Outlet,
});
