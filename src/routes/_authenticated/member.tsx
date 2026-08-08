import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyNestAccess } from "@/lib/nest-members.functions";

export const Route = createFileRoute("/_authenticated/member")({
  head: () => ({
    meta: [
      { title: "Member Dashboard · Team Nest" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MemberDashboard,
});

const TRACK_PANELS: Record<
  string,
  { label: string; tint: string; tasks: { title: string; body: string }[] }
> = {
  builder: {
    label: "Builder",
    tint: "bg-yellow",
    tasks: [
      { title: "Ship something monthly", body: "Post one project update in the builder circle each month." },
      { title: "Hack nights", body: "Join the Nashik hack nights — RSVP links land in your inbox." },
      { title: "BWN 2026", body: "Builders get priority review on Build With Nashik submissions." },
    ],
  },
  campus_lead: {
    label: "Campus Lead",
    tint: "bg-cobalt text-cream",
    tasks: [
      { title: "Run one campus event per term", body: "Use the Nest playbook: format, budget sheet, speaker list." },
      { title: "Report headcount", body: "Send attendance + photos after each event so we can credit your campus." },
      { title: "Recruit builders", body: "Bring at least 5 new builders into Nest each semester." },
    ],
  },
  volunteer: {
    label: "Volunteer Crew",
    tint: "bg-orange text-cream",
    tasks: [
      { title: "Shift roster", body: "Crew shifts for the next event are shared here before every event week." },
      { title: "On-ground ops", body: "Registration desk, stage, hospitality, and media runs." },
      { title: "Change your password", body: "Your login was issued by an admin — set your own password now." },
    ],
  },
  mentor: {
    label: "Mentor / Judge",
    tint: "bg-rose",
    tasks: [
      { title: "Review slots", body: "Pick review windows for hackathon rounds." },
      { title: "Judging rubric", body: "Scoring guide is shared 48 hours before demo day." },
      { title: "Office hours", body: "Optionally host a monthly office-hours slot for builders." },
    ],
  },
};

function MemberDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchAccess = useServerFn(getMyNestAccess);

  const { data, isLoading } = useQuery({
    queryKey: ["nest", "myAccess"],
    queryFn: () => fetchAccess(),
    retry: false,
  });

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/nest", replace: true });
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream paper font-mono text-xs uppercase tracking-widest">
        Loading…
      </div>
    );
  }

  const roles = data?.roles ?? [];
  const memberRoles = roles.filter((r) => r in TRACK_PANELS);
  const member = data?.member as any;
  const application = data?.application as any;

  return (
    <div className="min-h-screen bg-cream paper text-ink">
      <Toaster position="top-center" theme="light" />
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6">
          <Link to="/nest" className="font-chunk text-xl uppercase tracking-tight">
            Nest · Member
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/events"
              className="ink-border-sm hidden rounded-full bg-cream px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest sm:inline-flex"
            >
              Events
            </Link>
            <button
              onClick={handleSignOut}
              className="ink-border-sm rounded-full bg-ink px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Signed in as</div>
        <h1 className="mt-1 font-chunk text-4xl uppercase leading-none tracking-tight md:text-5xl">
          {member?.full_name ?? data?.email ?? "Nest member"}
        </h1>

        {memberRoles.length === 0 ? (
          <div className="ink-border-lg mt-8 rounded-2xl bg-white p-8">
            <div className="font-chunk text-2xl uppercase tracking-tight">No member access yet</div>
            {application ? (
              <p className="mt-2 max-w-xl text-sm text-ink/70">
                Your <strong className="uppercase">{String(application.track).replace("_", " ")}</strong> application is{" "}
                <strong className="uppercase">{application.status}</strong>
                {application.review_note ? ` — “${application.review_note}”` : ""}. We'll email you when the crew
                finishes reviewing.
              </p>
            ) : (
              <p className="mt-2 max-w-xl text-sm text-ink/70">
                You haven't applied yet. Pick a track on the Nest page and send an application — approved members get a
                dashboard tailored to their role.
              </p>
            )}
            <Link
              to="/nest"
              className="ink-border-sm mt-6 inline-flex rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream"
            >
              Apply to join Nest →
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {memberRoles.map((r) => (
                <span
                  key={r}
                  className={`ink-border-sm rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest ${TRACK_PANELS[r]!.tint}`}
                >
                  {TRACK_PANELS[r]!.label}
                </span>
              ))}
              {member?.status && member.status !== "active" && (
                <span className="ink-border-sm rounded-full bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest">
                  {member.status}
                </span>
              )}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {memberRoles.map((r) => (
                <section key={r} className="ink-border-lg rounded-2xl bg-white p-6">
                  <div
                    className={`ink-border-sm inline-flex rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${TRACK_PANELS[r]!.tint}`}
                  >
                    {TRACK_PANELS[r]!.label} desk
                  </div>
                  <ul className="mt-4 grid gap-3">
                    {TRACK_PANELS[r]!.tasks.map((t) => (
                      <li key={t.title} className="border-t-2 border-ink/10 pt-3 first:border-0 first:pt-0">
                        <div className="font-chunk text-lg uppercase tracking-tight">{t.title}</div>
                        <p className="mt-0.5 text-sm text-ink/70">{t.body}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="ink-border-lg mt-6 rounded-2xl bg-cream p-6">
              <div className="font-chunk text-xl uppercase tracking-tight">Account</div>
              <p className="mt-1 text-sm text-ink/70">
                If an admin issued this login with a temporary password, set your own now.
              </p>
              <Link
                to="/reset-password"
                className="ink-border-sm mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
              >
                Change password
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
