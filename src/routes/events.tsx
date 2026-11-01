// Passthrough layout for /events/* routes.
// The events listing lives in events.index.tsx; the public event detail page
// (events.$slug.tsx) renders through this Outlet.
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/events")({
  component: () => <Outlet />,
});
