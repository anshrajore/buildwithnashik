import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { NestHeader } from "@/components/NestHeader";
import { getMyParticipation, submitRound } from "@/lib/events.functions";
import { deadlineUrgency, fmtDateTime, humanStatus, statusTone, urgencyTone } from "@/lib/event-utils";
import { EmptyState, LoadingRows, Pill, Stat } from "@/components/ui-states";
import { useVisitTracking } from "@/hooks/use-visit-tracking";

export const Route = createFileRoute("/_authenticated/my-events")({
  head: () => ({
    meta: [
      { title: "My Events · Team Nest Participant Dashboard" },
      { name: "description", content: "Track your registrations, rounds, deadlines and submissions for every Nest event." },
      { property: "og:title", content: "My Events · Team Nest Participant Dashboard" },
      { property: "og:description", content: "Your registrations, round status and pending submissions in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyEvents,
});

type Reg = { id: string; event_id: string; registration_code: string; status: string; team_name: string | null; current_round_id: string | null; participation_type: string };
type Ev = { id: string; slug: string; name: string; tagline: string | null; start_at: string | null; end_at: string | null; status: string; city: string | null; venue: string | null };
type Rnd = { id: string; event_id: string; name: string; position: number; round_type: string; description: string | null; submission_deadline: string | null; submissions_open: boolean; allow_file: boolean; allow_link: boolean; allow_text: boolean };
type Sub = { id: string; round_id: string; registration_id: string; status: string; score: number | null; reviewer_notes: string | null; text_response: string | null; link_url: string | null };

function MyEvents() {
  useVisitTracking("events");
  const load = useServerFn(getMyParticipation);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["my-participation"], queryFn: () => load() });

  const regs = (data?.registrations ?? []) as Reg[];
  const events = (data?.events ?? []) as Ev[];
  const rounds = (data?.rounds ?? []) as Rnd[];
  const subs = (data?.submissions ?? []) as Sub[];

  const pending = rounds.filter((r) => {
    const reg = regs.find((x) => x.event_id === r.event_id);
    if (!reg || !r.submissions_open) return false;
    return !subs.some((s) => s.round_id === r.id && s.registration_id === reg.id);
  });

  return (
    <div className="paper min-h-screen text-foreground">
      <Toaster position="top-center" theme="light" />
      <NestHeader active="events" />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="chip">
              <span className="h-2 w-2 rounded-full bg-cobalt" /> Participant dashboard
            </span>
            <h1 className="mt-3 font-chunk text-4xl uppercase tracking-tight md:text-5xl">My events</h1>
          </div>
          <Link to="/events" className="ink-border-sm rounded-full bg-cream px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest">
            Browse events →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Registrations" value={regs.length} />
          <Stat label="Pending submissions" value={pending.length} tone={pending.length ? "warning" : "success"} />
          <Stat label="Shortlisted" value={regs.filter((r) => ["shortlisted", "finalist", "selected"].includes(r.status)).length} tone="success" />
        </div>

        <div className="mt-10 grid gap-6">
          {isLoading ? (
            <LoadingRows rows={2} height="h-40" />
          ) : regs.length === 0 ? (
            <EmptyState
              title="No registrations yet"
              body="Register for an event and your rounds, deadlines and submissions will appear here."
              action={
                <Link to="/events" className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">
                  Find an event →
                </Link>
              }
            />
          ) : (
            regs.map((reg) => {
              const ev = events.find((e) => e.id === reg.event_id);
              const evRounds = rounds.filter((r) => r.event_id === reg.event_id).sort((a, b) => a.position - b.position);
              return (
                <article key={reg.id} className="ink-border-sm overflow-hidden rounded-2xl bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-cream px-5 py-4">
                    <div>
                      <div className="font-chunk text-2xl uppercase tracking-tight">{ev?.name ?? "Event"}</div>
                      <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
                        {reg.registration_code} · {reg.team_name ?? humanStatus(reg.participation_type)} · {fmtDateTime(ev?.start_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill tone={statusTone(reg.status)}>{humanStatus(reg.status)}</Pill>
                      {ev && (
                        <Link
                          to="/events/$slug"
                          params={{ slug: ev.slug }}
                          className="ink-border-sm rounded-full bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest"
                        >
                          Event page →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 p-5">
                    {evRounds.length === 0 && <p className="text-sm text-ink/60">Rounds will be published soon.</p>}
                    {evRounds.map((r) => (
                      <RoundCard
                        key={r.id}
                        round={r}
                        submission={subs.find((s) => s.round_id === r.id && s.registration_id === reg.id) ?? null}
                        registrationId={reg.id}
                        onSaved={() => void refetch()}
                      />
                    ))}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function RoundCard({
  round,
  submission,
  registrationId,
  onSaved,
}: {
  round: Rnd;
  submission: Sub | null;
  registrationId: string;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(submission?.text_response ?? "");
  const [link, setLink] = useState(submission?.link_url ?? "");
  const [busy, setBusy] = useState(false);
  const save = useServerFn(submitRound);
  const urgency = deadlineUrgency(round.submission_deadline);

  async function send() {
    setBusy(true);
    const res = await save({ data: { registration_id: registrationId, round_id: round.id, text_response: text || null, link_url: link || null, files: [] } });
    setBusy(false);
    if (!res.ok) return toast.error(res.message);
    toast.success("Submission saved");
    setOpen(false);
    onSaved();
  }

  return (
    <div className="ink-border-sm rounded-xl bg-cream p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-chunk text-lg uppercase tracking-tight">
            {String(round.position).padStart(2, "0")} · {round.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
            <Pill tone={statusTone(submission?.status ?? "not_started")}>{humanStatus(submission?.status ?? "not_started")}</Pill>
            {round.submission_deadline && <Pill tone={urgencyTone(urgency)}>Due {fmtDateTime(round.submission_deadline)}</Pill>}
            {submission?.score !== null && submission?.score !== undefined && <Pill tone="info">Score {submission.score}</Pill>}
          </div>
        </div>
        {(round.allow_text || round.allow_link) && round.submissions_open && (
          <button
            onClick={() => setOpen((s) => !s)}
            className="ink-border-sm rounded-full bg-orange px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
          >
            {submission ? "Update submission" : "Submit"}
          </button>
        )}
      </div>
      {round.description && <p className="mt-2 text-sm text-ink/70">{round.description}</p>}
      {submission?.reviewer_notes && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink/60">Reviewer: {submission.reviewer_notes}</p>
      )}
      {open && (
        <div className="mt-4 grid gap-3">
          {round.allow_text && (
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Your response…"
              className="ink-border-sm w-full rounded-lg bg-white px-4 py-3 font-sans"
            />
          )}
          {round.allow_link && (
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Link (deck, repo, video)"
              className="ink-border-sm w-full rounded-lg bg-white px-4 py-3 font-sans"
            />
          )}
          <button
            onClick={send}
            disabled={busy}
            className="ink-border-sm justify-self-start rounded-full bg-ink px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-cream disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save submission"}
          </button>
        </div>
      )}
    </div>
  );
}
