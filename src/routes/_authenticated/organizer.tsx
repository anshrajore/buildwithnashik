// Passthrough layout for /organizer/* routes.
// The organizer console lives in organizer.index.tsx; the per-event
// operations dashboard in organizer.$eventId.tsx renders through this Outlet.
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/organizer")({
  component: () => <Outlet />,
});
