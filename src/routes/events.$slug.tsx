import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Toaster } from "sonner";
import { NestHeader } from "@/components/NestHeader";
import { AuthGate } from "@/components/AuthGate";
import { EventRegisterDialog } from "@/components/EventRegisterDialog";
import { getPublicEvent } from "@/lib/events.functions";
import { eventLifecycle, fmtDateTime, humanStatus, countdown } from "@/lib/event-utils";
import { EmptyState, LoadingRows, Pill } from "@/components/ui-states";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useVisitTracking } from "@/hooks/use-visit-tracking";

export const Route = createFileRoute("/events/$slug")({
  loader: ({ params }) => getPublicEvent({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const ev = loaderData?.event;
    const title = ev ? `${ev.name} · Register with Team Nest` : "Event · Team Nest";
    const description = ev
      ? (ev.tagline ?? ev.description ?? "").slice(0, 155) || `Register for ${ev.name}, hosted on the Team Nest events board.`
      : "Event details and registration on the Team Nest events board.";
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (ev?.banner_url?.startsWith("https://")) {
      meta.push({ property: "og:image", content: ev.banner_url });
      meta.push({ name: "twitter:image", content: ev.banner_url });
    }
    return { meta };
  },
  component: EventPage,
  errorComponent: () => (
    <div className="paper min-h-screen bg-cream p-10">
      <EmptyState title="This event didn't load" body="Refresh the page or head back to the events board." />
    </div>
  ),
  notFoundComponent: () => (
    <div className="paper min-h-screen bg-cream p-10">
      <EmptyState title="Event not found" body="It may have been unpublished." />
    </div>
  ),
});

function EventPage() {
  useVisitTracking("events");
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const load = useServerFn(getPublicEvent);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => load({ data: { slug } }),
    initialData: Route.useLoaderData(),
  });
  const { user } = useAuthUser();
  const [gate, setGate] = useState(false);
  const [reg, setReg] = useState(false);

  if (isLoading) {
    return (
      <div className="paper min-h-screen bg-cream">
        <NestHeader active="events" />
        <div className="mx-auto max-w-5xl px-6 py-16">
          <LoadingRows rows={3} height="h-40" />
        </div>
      </div>
    );
  }

  const event = data?.event;
  if (!event) {
    return (
      <div className="paper min-h-screen bg-cream">
        <NestHeader active="events" />
        <div className="mx-auto max-w-3xl px-6 py-20">
          <EmptyState
            title="Event not found"
            body="This event isn't published right now."
            action={
              <Link to="/events" className="ink-border-sm rounded-full bg-ink px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">
                ← Events board
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const life = eventLifecycle(event);
  const left = countdown(event.registration_closes_at);
  const links = (Array.isArray(event.links) ? event.links : []) as { label: string; url: string }[];
  const faqs = (Array.isArray(event.faqs) ? event.faqs : []) as { q: string; a: string }[];
  const highlights = (Array.isArray(event.highlights) ? event.highlights : []) as string[];
  type RoundRow = {
    id: string;
    name: string;
    round_type: string;
    description: string | null;
    starts_at: string | null;
    submission_deadline: string | null;
  };
  const rounds = (data?.rounds ?? []) as RoundRow[];

  function onRegisterClick() {
    if (!user) return setGate(true);
    setReg(true);
  }

  return (
    <div className="paper min-h-screen overflow-x-hidden text-foreground">
      <Toaster position="top-center" theme="light" />
      <NestHeader active="events" />

      <section className="border-b-2 border-ink bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div>
            <Link to="/events" className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
              ← Events board
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill tone={life.tone}>{life.label}</Pill>
              <Pill>{event.category}</Pill>
              <Pill>{event.mode}</Pill>
              <Pill>{event.participation_type === "individual" ? "Individual" : `Team ${event.team_min}–${event.team_max}`}</Pill>
            </div>
            <h1 className="mt-4 font-chunk text-4xl uppercase leading-[0.92] tracking-tight md:text-6xl">{event.name}</h1>
            {event.tagline && <p className="mt-2 font-script text-3xl text-orange">{event.tagline}</p>}
            <p className="mt-5 max-w-2xl whitespace-pre-line text-ink/80">{event.description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={onRegisterClick}
                disabled={!life.canRegister}
                className={`ink-border-sm rounded-full px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 ${
                  life.canRegister ? "bg-orange text-cream" : "cursor-not-allowed bg-cream text-ink/50"
                }`}
              >
                {life.canRegister ? "Register now →" : life.label}
              </button>
              <Link
                to="/my-events"
                className="ink-border-sm rounded-full bg-cream px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest"
              >
                My registrations
              </Link>
              {links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ink-border-sm rounded-full bg-cream px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
            {left && life.canRegister && (
              <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-widest text-rose">
                Closes in {left.days}d {left.hours}h {left.minutes}m
              </p>
            )}
          </div>

          <aside className="ink-border-sm overflow-hidden rounded-2xl bg-cream">
            {event.banner_url ? (
              <img src={event.banner_url} alt={`${event.name} banner`} className="aspect-[4/3] w-full border-b-2 border-ink object-cover" />
            ) : (
              <div className="grid aspect-[4/3] w-full place-items-center border-b-2 border-ink bg-yellow font-chunk text-5xl uppercase">
                {event.code}
              </div>
            )}
            <dl className="grid gap-3 p-5 font-mono text-[11px] uppercase tracking-widest text-ink/70">
              <Row k="Event code" v={event.code} />
              <Row k="Starts" v={fmtDateTime(event.start_at)} />
              <Row k="Ends" v={fmtDateTime(event.end_at)} />
              <Row k="Reg. opens" v={fmtDateTime(event.registration_opens_at)} />
              <Row k="Reg. closes" v={fmtDateTime(event.registration_closes_at)} />
              <Row k="Where" v={[event.venue, event.city].filter(Boolean).join(", ") || event.online_url || "—"} />
              <Row k="Registered" v={String(data?.registrationCount ?? 0)} />
              {event.capacity && <Row k="Capacity" v={String(event.capacity)} />}
              {event.contact_email && <Row k="Contact" v={event.contact_email} />}
            </dl>
            {event.maps_url && (
              <a
                href={event.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-t-2 border-ink bg-cobalt px-5 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
              >
                Open in Maps ↗
              </a>
            )}
          </aside>
        </div>
      </section>

      {highlights.length > 0 && (
        <section className="border-b-2 border-ink bg-cream py-10">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h) => (
              <div key={h} className="ink-border-sm rounded-xl bg-white p-5 font-mono text-[11px] font-bold uppercase tracking-widest">
                ✦ {h}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="font-chunk text-3xl uppercase tracking-tight">Rounds & format</h2>
        <div className="mt-6 grid gap-4">
          {rounds.length === 0 ? (
            <EmptyState title="Rounds coming soon" body="Organisers will publish the round structure shortly." />
          ) : (
            rounds.map((r, i) => (
              <div key={r.id} className="ink-border-sm grid gap-2 rounded-2xl bg-white p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="font-chunk text-3xl uppercase text-orange">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="font-chunk text-xl uppercase tracking-tight">{r.name}</div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">{humanStatus(r.round_type)}</div>
                  {r.description && <p className="mt-1 text-sm text-ink/70">{r.description}</p>}
                </div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60 md:text-right">
                  {r.submission_deadline ? `Due ${fmtDateTime(r.submission_deadline)}` : r.starts_at ? fmtDateTime(r.starts_at) : "TBA"}
                </div>
              </div>
            ))
          )}
        </div>

        {event.eligibility && (
          <>
            <h2 className="mt-14 font-chunk text-3xl uppercase tracking-tight">Eligibility</h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-ink/80">{event.eligibility}</p>
            {event.college_restriction && (
              <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
                Restricted to: {event.college_restriction}
              </p>
            )}
          </>
        )}

        {faqs.length > 0 && (
          <>
            <h2 className="mt-14 font-chunk text-3xl uppercase tracking-tight">FAQs</h2>
            <div className="mt-5 grid gap-3">
              {faqs.map((f) => (
                <details key={f.q} className="ink-border-sm rounded-xl bg-white p-5">
                  <summary className="cursor-pointer font-chunk text-lg uppercase tracking-tight">{f.q}</summary>
                  <p className="mt-2 whitespace-pre-line text-sm text-ink/75">{f.a}</p>
                </details>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="border-t-2 border-ink bg-ink py-10 text-center text-cream">
        <div className="font-chunk text-2xl uppercase tracking-tight">Team Nest · Nashik</div>
      </footer>

      <AuthGate
        open={gate}
        onClose={() => setGate(false)}
        reason="Sign in to register"
        onSignedIn={() => {
          setReg(true);
          void navigate({ to: "/events/$slug", params: { slug } });
        }}
      />
      <EventRegisterDialog
        open={reg}
        onClose={() => {
          setReg(false);
          void refetch();
        }}
        event={event}
        defaults={{ name: (user?.user_metadata?.["full_name"] as string) ?? null, email: user?.email ?? null }}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-2 last:border-0">
      <dt className="text-ink/40">{k}</dt>
      <dd className="text-right font-bold text-ink">{v}</dd>
    </div>
  );
}
