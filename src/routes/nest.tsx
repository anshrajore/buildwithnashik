import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { NestHeader } from "@/components/NestHeader";
import nestLogo from "@/assets/nest-logo.png";
import anshAsset from "@/assets/ansh.png.asset.json";
import sunhacksAsset from "@/assets/sunhacks.png.asset.json";
import mtwAsset from "@/assets/mtw.jpeg.asset.json";

const anshImg = anshAsset.url;
const sunhacksImg = sunhacksAsset.url;
const mtwImg = mtwAsset.url;

export const Route = createFileRoute("/nest")({
  head: () => ({
    meta: [
      { title: "Team Nest — Nashik Ecosystem for Startups & Technology" },
      {
        name: "description",
        content:
          "Team Nest (NEST) is Nashik's builder community — hackathons, workshops and student-led tech programmes. Connect, collaborate, create impact.",
      },
      { property: "og:title", content: "Team Nest — Nashik Ecosystem for Startups & Technology" },
      {
        property: "og:description",
        content: "Nashik's builder community: hackathons, workshops and student-led programmes. Connect. Collaborate. Create impact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NestPage,
});

/* ---------------- data ---------------- */

const STATS = [
  { k: "2023", l: "Founded in Nashik" },
  { k: "3,500+", l: "Builders reached" },
  { k: "20+", l: "Events & sprints" },
  { k: "15+", l: "Partner colleges" },
];

const PILLARS = [
  {
    n: "01",
    t: "Community",
    d: "A permanent home for Nashik's developers, designers and founders — open Discord, monthly meetups, and a crew that answers DMs.",
    color: "bg-yellow",
  },
  {
    n: "02",
    t: "Craft",
    d: "Hands-on workshops and build sprints where people ship something real instead of collecting certificates.",
    color: "bg-cobalt text-cream",
  },
  {
    n: "03",
    t: "Stage",
    d: "Hackathons and demo days that put student work in front of mentors, recruiters and founders who can act on it.",
    color: "bg-orange text-cream",
  },
  {
    n: "04",
    t: "Bridge",
    d: "Connecting colleges, startups and national programmes so opportunity stops stopping at Pune and Mumbai.",
    color: "bg-rose",
  },
];

const LEGACY = [
  {
    date: "08 / 2025",
    role: "Organizer",
    title: "SUNHACKS",
    body: "Ran one of Maharashtra's largest student hackathons — logistics, mentor pipeline, judging rubric and a 36-hour build floor.",
    img: sunhacksImg,
    tint: "bg-orange",
  },
  {
    date: "02 / 2025",
    role: "Participant",
    title: "NASA Space Apps",
    body: "Represented Nashik at the global NASA Space Apps Challenge, building on open earth-observation datasets.",
    img: null,
    tint: "bg-cobalt",
  },
  {
    date: "03 / 2026",
    role: "Community Contributor",
    title: "Mumbai Tech Week",
    body: "Contributed to India's biggest tech week — community programming, builder outreach and on-ground operations.",
    img: mtwImg,
    tint: "bg-yellow",
  },
];

const CREW = [
  { name: "Ansh Rajore", role: "Founder & Lead Organizer" },
  { name: "Prathman Tiwari", role: "Core Builder · Tech" },
  { name: "Nest Ops Crew", role: "Logistics & Volunteers" },
  { name: "Nest Design", role: "Brand & Content" },
];

const FAQ = [
  {
    q: "Who can join Team Nest?",
    a: "Anyone in or around Nashik who builds — students, self-taught developers, designers, founders. No entry test, no fee.",
  },
  {
    q: "How do I bring Nest to my college?",
    a: "Email us with your college, the audience size and what you want to run. We co-host workshops, hack nights and speaker sessions.",
  },
  {
    q: "Can I list my own event?",
    a: "Yes — the events board is open to every community in the region. Submit it and the crew reviews within a few working days.",
  },
  {
    q: "Can I use the NEST logo on my site?",
    a: "If we actually collaborated, yes — follow the brand policy. Anything else needs written permission first.",
  },
];

/* ---------------- helpers ---------------- */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setShown(true),
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.25em]">
      <span className="tag-orange px-2 py-0.5 text-cream">{n}</span>
      <span>{children}</span>
      <span className="h-0.5 flex-1 bg-ink/15" />
    </div>
  );
}

/** Image that degrades to a branded tile instead of a broken/blank box. */
function SafeImg({
  src,
  alt,
  label,
  tint = "bg-orange",
  className = "",
  style,
}: {
  src?: string | null;
  alt: string;
  label: string;
  tint?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(!src);
  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`grid h-full w-full place-items-center ${tint} font-chunk text-4xl uppercase text-cream ${className}`}
      >
        {label.slice(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        // eslint-disable-next-line no-console
        console.error(`[asset] failed to load "${src}" on route /nest (${alt})`);
        setFailed(true);
      }}
      className={className}
      style={style}
    />
  );
}

/* ---------------- page ---------------- */

function NestPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cover, setCover] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCover(true), 60);
    return () => clearTimeout(t);
  }, []);


  return (
    <div className="min-h-screen overflow-x-hidden paper text-foreground antialiased">
      <NestHeader active="nest" />

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden border-b-2 border-ink">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[-4%] select-none overflow-hidden">
          <div className="whitespace-nowrap text-center font-display text-[26vw] leading-[0.75] tracking-tight text-ink/[0.055]">NEST</div>
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.15fr,0.85fr]">
          <div>
            <span className="chip"><span className="h-2 w-2 animate-pulse rounded-full bg-orange" /> Nashik · est. 2023</span>
            <h1 className="mt-6 font-chunk text-5xl uppercase leading-[0.88] tracking-tight sm:text-6xl lg:text-7xl">
              Nashik’s builder <br />
              community, <span className="tag-orange text-cream">for real.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/75 md:text-lg">
              NEST — the <strong>Nashik Ecosystem for Startups &amp; Technology</strong> — is a student-led collective turning a tier-2 city into a place where builders don’t have to leave to be taken seriously.
            </p>
            <p className="mt-4 font-script text-3xl text-orange">Connect. Collaborate. Create impact.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5"
              >
                Build With Nashik 2026 →
              </Link>
              <Link
                to="/events"
                className="ink-border-sm rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5"
              >
                Events board
              </Link>
              <a
                href="mailto:teamnest.nashik@gmail.com"
                className="ink-border-sm rounded-full bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5"
              >
                Partner with us
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            {/* animated cover card */}
            <div
              className="ink-border-lg relative overflow-hidden rounded-3xl bg-white p-7 transition-all duration-[900ms] ease-out"
              style={{
                transform: cover ? "rotate(-1.4deg) translateY(0) scale(1)" : "rotate(-6deg) translateY(24px) scale(0.94)",
                opacity: cover ? 1 : 0,
              }}
            >
              {/* sweeping gloss */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-ink/[0.07] to-transparent transition-transform duration-[1600ms] ease-out"
                style={{ transform: cover ? "translateX(420%)" : "translateX(0)" }}
              />
              <SafeImg
                src={nestLogo}
                alt="NEST — Nashik Ecosystem for Startups & Technology"
                label="NEST"
                className="mx-auto h-auto w-full"
                style={{
                  transition: "opacity 900ms ease-out 200ms, transform 900ms cubic-bezier(.2,.8,.2,1) 200ms",
                  opacity: cover ? 1 : 0,
                  transform: cover ? "translateY(0) scale(1)" : "translateY(10px) scale(0.92)",
                }}
              />
              <div className="mt-6 grid grid-cols-2 gap-3">
                {STATS.map((s, i) => (
                  <div
                    key={s.k}
                    className="ink-border-sm rounded-xl bg-cream p-3 text-center transition-all duration-700 ease-out"
                    style={{
                      transitionDelay: `${360 + i * 90}ms`,
                      opacity: cover ? 1 : 0,
                      transform: cover ? "translateY(0)" : "translateY(10px)",
                    }}
                  >
                    <div className="font-chunk text-2xl leading-none">{s.k}</div>
                    <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-ink/60">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <span
              className="ink-border-sm absolute -bottom-4 -left-3 rounded-full bg-yellow px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest transition-all duration-700 ease-out"
              style={{
                transitionDelay: "760ms",
                opacity: cover ? 1 : 0,
                transform: cover ? "rotate(-6deg) scale(1)" : "rotate(-6deg) scale(0.7)",
              }}
            >
              Official community
            </span>
          </div>

        </div>
      </section>

      {/* ---------- WHAT WE DO ---------- */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionLabel n="01">What Nest does</SectionLabel>
        <h2 className="mt-6 max-w-3xl font-chunk text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl">
          Four pillars, one <span className="tag-orange text-cream">outcome.</span>
        </h2>
        <p className="mt-4 max-w-2xl font-mono text-sm text-ink/65">
          Everything we run rolls up into a single goal: a builder in Nashik should have the same shot as a builder in Bengaluru.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 90}>
              <article
                className={`ink-border-sm flex h-full flex-col rounded-2xl p-6 transition-transform hover:-translate-y-1.5 ${p.color}`}
                style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.5}deg)` }}
              >
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">{p.n}</div>
                <h3 className="mt-3 font-chunk text-3xl uppercase leading-none tracking-tight">{p.t}</h3>
                <p className="mt-3 text-sm leading-relaxed opacity-85">{p.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- LEGACY ---------- */}
      <section className="border-y-2 border-ink bg-ink py-20 text-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-cream/70">
            <span className="ink-border-sm rounded-md bg-orange px-2 py-0.5 text-cream">02</span>
            <span>Track record</span>
            <span className="h-0.5 flex-1 bg-cream/20" />
          </div>
          <h2 className="mt-6 max-w-3xl font-chunk text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl">
            We were building before <br className="hidden md:block" />
            <span className="tag-orange text-cream">anyone was watching.</span>
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {LEGACY.map((l, i) => (
              <Reveal key={l.title} delay={i * 110}>
                <article className="ink-border-sm flex h-full flex-col overflow-hidden rounded-2xl bg-cream text-ink">
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-ink bg-white">
                    <SafeImg
                      src={l.img}
                      alt={`${l.title} — Team Nest`}
                      label={l.title}
                      tint={l.tint}
                      className="h-full w-full object-cover"
                    />

                    <span className="ink-border-sm absolute left-3 top-3 rounded-full bg-cream px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest">
                      {l.date}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange">{l.role}</div>
                    <h3 className="mt-1.5 font-chunk text-2xl uppercase leading-tight tracking-tight">{l.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/75">{l.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FOUNDER ---------- */}
      <section className="relative overflow-hidden py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            color: "rgb(0 0 0 / 0.07)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <SectionLabel n="03">Founder</SectionLabel>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr,0.72fr]">
            {/* text left */}
            <div>
              <h2 className="font-chunk text-4xl uppercase leading-[0.92] tracking-tight md:text-5xl">
                Ansh Rajore
              </h2>
              <div className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-orange">
                Founder · Team Nest
              </div>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/80">
                Ansh started Nest in 2023 with a simple frustration: Nashik had talent but no stage. Since then he has organised
                one of Maharashtra’s largest student hackathons, represented the city at NASA Space Apps, and contributed to
                Mumbai Tech Week — while keeping Nest free and student-run.
              </p>
              <blockquote className="ink-border-sm mt-6 rounded-2xl bg-white p-5">
                <p className="font-script text-2xl leading-snug text-orange">
                  “You don’t wait for an ecosystem. You build the room, then invite the city in.”
                </p>
              </blockquote>

              <dl className="mt-6 grid gap-2 sm:grid-cols-2">
                {[
                  ["08 / 2025", "Organizer · SUNHACKS"],
                  ["02 / 2025", "NASA Space Apps"],
                  ["03 / 2026", "Mumbai Tech Week"],
                  ["2026", "Build With Nashik"],
                ].map(([d, t]) => (
                  <div key={t} className="ink-border-sm flex items-center gap-3 rounded-xl bg-cream px-3 py-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">{d}</span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest">{t}</span>
                  </div>
                ))}
              </dl>
            </div>

            {/* portrait right */}
            <Reveal delay={100}>
              <div className="relative mx-auto w-full max-w-[300px]">
                <div className="ink-border-lg overflow-hidden rounded-3xl bg-white p-3" style={{ transform: "rotate(1.6deg)" }}>
                  <div className="overflow-hidden rounded-2xl border-2 border-ink bg-cream">
                    <SafeImg
                      src={anshImg}
                      alt="Ansh Rajore, founder of Team Nest"
                      label="AR"
                      tint="bg-cobalt"
                      className="aspect-[4/5] w-full object-cover"
                      style={{ objectPosition: "50% 22%" }}
                    />

                  </div>
                  <div className="flex items-center justify-between px-1 pt-3 pb-1">
                    <span className="font-chunk text-lg uppercase leading-none">Ansh</span>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink/50">Nest · 001</span>
                  </div>
                </div>
                <span className="ink-border-sm absolute -bottom-3 -left-3 rotate-[-7deg] rounded-full bg-cobalt px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-cream">
                  Verified builder
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- CREW ---------- */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <SectionLabel n="04">The crew</SectionLabel>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CREW.map((c, i) => (
            <Reveal key={c.name} delay={i * 80}>
              <div className="ink-border-sm h-full rounded-2xl bg-white p-5 transition-transform hover:-translate-y-1">
                <div className="ink-border-sm grid h-11 w-11 place-items-center rounded-full bg-yellow font-chunk text-lg uppercase">
                  {c.name.slice(0, 1)}
                </div>
                <div className="mt-3 font-chunk text-xl uppercase leading-tight tracking-tight">{c.name}</div>
                <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/55">{c.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="border-y-2 border-ink bg-cream py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionLabel n="05">Questions</SectionLabel>
          <div className="mt-8 grid gap-3">
            {FAQ.map((f, i) => (
              <div key={f.q} className="ink-border-sm overflow-hidden rounded-2xl bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-chunk text-lg uppercase leading-tight tracking-tight">{f.q}</span>
                  <span className="font-mono text-lg font-bold text-orange">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p className="border-t-2 border-ink px-5 py-4 text-sm leading-relaxed text-ink/75">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-orange py-20 text-cream">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-chunk text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl">
            Come build with the city.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-cream/90 md:text-base">
            Whether you write code, design, organise or sponsor — there is a place for you inside Nest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="ink-border-sm rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink">
              Join BWN 2026 →
            </Link>
            <Link to="/events" className="ink-border-sm rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">
              Submit an event
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-ink py-12 text-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center">
          <img src={nestLogo} alt="Team Nest" className="h-12 w-auto rounded-md bg-cream p-1.5" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-cream/60">
            Team Nest · Nashik · Building the developer ecosystem since 2023
          </p>
          <div className="flex flex-wrap justify-center gap-4 font-mono text-[11px] font-bold uppercase tracking-widest">
            <Link to="/events" className="hover:text-yellow">Events</Link>
            <Link to="/terms" className="hover:text-yellow">Brand & Terms</Link>
            <Link to="/" className="hover:text-yellow">BWN 2026</Link>
            <a href="mailto:teamnest.nashik@gmail.com" className="hover:text-yellow">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
