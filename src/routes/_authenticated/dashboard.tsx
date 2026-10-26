import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { NestHeader } from "@/components/NestHeader";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useVisitTracking } from "@/hooks/use-visit-tracking";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Team Nest" },
      { name: "description", content: "Your Team Nest hub — registrations, rounds, member tasks and organiser tools." },
      { property: "og:title", content: "Dashboard · Team Nest" },
      { property: "og:description", content: "One hub for participants, members and organisers at Team Nest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardHub,
});

const CARDS = [
  { to: "/my-events" as const, label: "My events", body: "Registrations, rounds, deadlines and submissions." },
  { to: "/organizer" as const, label: "Organizer console", body: "Per-event operations — registrations, rounds, emails and exports." },
  { to: "/member" as const, label: "Member workspace", body: "Tasks and updates for Nest members and volunteers." },
  { to: "/events" as const, label: "Events board", body: "Discover and register for upcoming events." },
  { to: "/admin" as const, label: "Staff & organiser tools", body: "Event operations, applications and moderation." },
];

function DashboardHub() {
  useVisitTracking("nest");
  const { user } = useAuthUser();

  return (
    <div className="paper min-h-screen text-foreground">
      <Toaster position="top-center" theme="light" />
      <NestHeader active="nest" />
      <div className="mx-auto max-w-6xl px-6 py-14">
        <span className="chip">
          <span className="h-2 w-2 rounded-full bg-orange" /> Signed in{user?.email ? ` · ${user.email}` : ""}
        </span>
        <h1 className="mt-4 font-chunk text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl">Your Nest hub</h1>
        <p className="mt-3 max-w-2xl font-mono text-sm text-ink/70">
          Everything you're part of, in one place. Pick a workspace below.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="ink-border-sm rounded-2xl bg-white p-6 transition-transform hover:-translate-y-1"
            >
              <div className="font-chunk text-2xl uppercase tracking-tight">{c.label}</div>
              <p className="mt-2 text-sm text-ink/70">{c.body}</p>
              <div className="mt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-orange">Open →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
