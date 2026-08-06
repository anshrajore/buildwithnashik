import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NestHeader } from "@/components/NestHeader";
import { EventSubmitDialog } from "@/components/EventSubmitDialog";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events Board — Team Nest Nashik" },
      { name: "description", content: "Discover developer events across Nashik and Maharashtra, or submit your own hackathon, workshop or meetup to the Team Nest events board." },
      { property: "og:title", content: "Events Board — Team Nest Nashik" },
      { property: "og:description", content: "Discover developer events in Nashik or submit your own hackathon, workshop or meetup to Team Nest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});

type EventRow = {
  id: string;
  event_name: string;
  tagline: string | null;
  description: string;
  category: string;
  mode: string;
  banner_url: string | null;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  venue: string | null;
  maps_url: string | null;
  team_min: number;
  team_max: number;
  organiser_name: string;
  organisation: string | null;
  website_url: string | null;
  register_url: string | null;
  socials: unknown;
};

const FILTERS = ["All", "Hackathon", "Workshop", "Meetup", "Conference", "Bootcamp", "Other"];

function EventsPage() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    supabase
      .from("community_events")
      .select("id,event_name,tagline,description,category,mode,banner_url,start_date,end_date,city,venue,maps_url,team_min,team_max,organiser_name,organisation,website_url,register_url,socials")
      .eq("status", "approved")
      .order("start_date", { ascending: true })
      .then(({ data }) => { if (alive) setRows((data as EventRow[]) ?? []); });
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => {
    const list = rows ?? [];
    return list.filter((e) => {
      const okCat = filter === "All" || e.category === filter || (filter === "Other" && !FILTERS.includes(e.category));
      const needle = q.trim().toLowerCase();
      const okQ = !needle || [e.event_name, e.city, e.venue, e.organisation, e.category].some((v) => (v ?? "").toLowerCase().includes(needle));
      return okCat && okQ;
    });
  }, [rows, filter, q]);

  return (
    <div className="min-h-screen overflow-x-hidden paper text-foreground antialiased">
      <Toaster position="top-center" theme="light" toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} />
      <NestHeader active="events" />

      {/* hero */}
      <section className="relative overflow-hidden border-b-2 border-ink py-20">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 select-none overflow-hidden">
          <div className="whitespace-nowrap text-center font-display text-[20vw] leading-none tracking-tight text-ink/[0.05]">EVENTS</div>
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="chip"><span className="h-2 w-2 rounded-full bg-cobalt" /> Nest Events Board</span>
          <h1 className="mt-5 font-chunk text-5xl uppercase leading-[0.9] tracking-tight md:text-7xl">
            Every builder event <br className="hidden sm:block" /> in <span className="tag-orange text-cream">one place.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-mono text-sm text-ink/70">
            Hackathons, workshops, meetups and sprints from communities across Nashik and Maharashtra. Running something? Put it on the board — free, forever.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setOpen(true)} className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5">
              + Submit your event
            </button>
            <Link to="/nest" className="ink-border-sm rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5">
              About Team Nest →
            </Link>
          </div>
        </div>
      </section>

      {/* controls */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`ink-border-sm rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 ${filter === f ? "bg-ink text-cream" : "bg-cream text-ink"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, cities, organisers…"
            className="ink-border-sm w-full rounded-full bg-cream px-4 py-2.5 font-sans text-sm md:w-72"
          />
        </div>

        {/* list */}
        <div className="mt-10">
          {rows === null ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="ink-border-sm h-72 animate-pulse rounded-2xl bg-white/60" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="ink-border-lg rounded-3xl bg-white p-10 text-center">
              <div className="font-script text-5xl text-orange">Board's empty… for now.</div>
              <p className="mx-auto mt-4 max-w-md font-mono text-sm text-ink/60">
                Approved events show up here. Be the first — submit yours and Team Nest will publish it after review.
              </p>
              <button onClick={() => setOpen(true)} className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">
                + Submit your event
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((e, i) => <EventCard key={e.id} e={e} i={i} />)}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-ink py-10 text-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 text-center">
          <div className="font-chunk text-2xl uppercase tracking-tight">Team Nest · Nashik</div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-cream/60">Building the developer ecosystem since 2023</p>
        </div>
      </footer>

      <EventSubmitDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function fmt(d: string | null) {
  if (!d) return null;
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function EventCard({ e, i }: { e: EventRow; i: number }) {
  const socials = Array.isArray(e.socials) ? (e.socials as { label: string; url: string }[]) : [];
  const when = [fmt(e.start_date), fmt(e.end_date)].filter(Boolean).join(" → ");
  return (
    <article
      className="ink-border-sm group flex flex-col overflow-hidden rounded-2xl bg-white transition-transform hover:-translate-y-1"
      style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.3}deg)` }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-ink bg-cream">
        {e.banner_url ? (
          <img src={e.banner_url} alt={`${e.event_name} banner`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-yellow font-chunk text-3xl uppercase text-ink">{e.event_name.slice(0, 2)}</div>
        )}
        <span className="ink-border-sm absolute left-3 top-3 rounded-full bg-cobalt px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-cream">
          {e.category}
        </span>
        <span className="ink-border-sm absolute right-3 top-3 rounded-full bg-cream px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-ink">
          {e.mode}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h2 className="font-chunk text-2xl uppercase leading-tight tracking-tight">{e.event_name}</h2>
          {e.tagline && <p className="mt-1 font-script text-xl text-orange">{e.tagline}</p>}
        </div>
        <p className="line-clamp-3 text-sm text-ink/75">{e.description}</p>

        <dl className="grid gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
          {when && <div>◷ {when}</div>}
          {(e.venue || e.city) && <div>⌖ {[e.venue, e.city].filter(Boolean).join(" · ")}</div>}
          <div>◇ Team {e.team_min}–{e.team_max}</div>
          <div>✦ {e.organisation || e.organiser_name}</div>
        </dl>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {e.register_url && (
            <a href={e.register_url} target="_blank" rel="noopener noreferrer" className="ink-border-sm rounded-full bg-orange px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">
              Register ↗
            </a>
          )}
          {gcal && (
            <a href={gcal} target="_blank" rel="noopener noreferrer" className="ink-border-sm rounded-full bg-cobalt px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">
              + Google Calendar
            </a>
          )}
          {ics && (
            <a href={ics} download={`${e.event_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`} className="ink-border-sm rounded-full bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
              .ics
            </a>
          )}
          {e.website_url && (
            <a href={e.website_url} target="_blank" rel="noopener noreferrer" className="ink-border-sm rounded-full bg-cream px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
              Website ↗
            </a>
          )}
          {e.maps_url && (
            <a href={e.maps_url} target="_blank" rel="noopener noreferrer" className="ink-border-sm rounded-full bg-yellow px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
              Directions ↗
            </a>
          )}
          {socials.slice(0, 3).map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-full px-2 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60 underline underline-offset-4 hover:text-ink">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
