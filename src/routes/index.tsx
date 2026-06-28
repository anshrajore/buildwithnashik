import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Build With Nashik 2026 — Nashik's Largest Developer Hackathon" },
      { name: "description", content: "36 hours. 500+ builders. One city. Build With Nashik is the community-driven developer hackathon by Team Nest. Date announce soon." },
      { property: "og:title", content: "Build With Nashik 2026" },
      { property: "og:description", content: "Nashik's largest community-driven hackathon. 36 hours of building, shipping, and winning. By Team Nest." },
    ],
  }),
  component: Home,
});

/* ---------- shared bits ---------- */

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
      <span className="text-neon">/{index}</span>
      <span>{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        const start = performance.now();
        const dur = 1400;
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ---------- page ---------- */

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <CursorGlow />
      <AnnouncementBar />
      <Nav />
      <Hero />
      <StatsTicker />
      <About />
      <Mission />
      <Timeline />
      <Tracks />
      <Prizes />
      <Sponsors />
      <WhySponsor />
      <Community />
      <Team />
      <Venue />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ---------- cursor ---------- */

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 h-[400px] w-[400px] rounded-full opacity-40 blur-3xl transition-transform duration-300 ease-out"
      style={{ background: "radial-gradient(circle, var(--neon), transparent 60%)" }}
    />
  );
}

/* ---------- announcement ---------- */

function AnnouncementBar() {
  return (
    <div className="relative z-30 overflow-hidden border-b border-border bg-neon text-primary-foreground">
      <div className="flex animate-marquee whitespace-nowrap py-2 font-mono text-xs font-semibold uppercase tracking-widest">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-8 px-4">
            {["🚀 Registrations Opening Soon", "★ Date Announce Soon", "⚡ 36 Hours of Building", "✦ Powered by Team Nest", "→ Nashik 2026", "● Stay Tuned", "▲ 500+ Builders", "◆ ₹XX+ Prize Pool"].map((t) => (
              <span key={t} className="flex items-center gap-8">
                {t}
                <span className="opacity-50">✕</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- nav ---------- */

function Nav() {
  const links = ["About", "Timeline", "Tracks", "Prizes", "Sponsors", "Team", "FAQ"];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 font-display text-lg tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-neon text-primary-foreground">B</span>
          <span>BUILD/NASHIK</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
              {l}
            </a>
          ))}
        </nav>
        <a href="#register" className="group inline-flex items-center gap-2 rounded-full bg-neon px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:gap-3 glow-neon">
          Register <span>→</span>
        </a>
      </div>
    </header>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-electric/30 blur-3xl animate-float" aria-hidden />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-neon/30 blur-3xl animate-float" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24">
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip"><span className="h-2 w-2 rounded-full bg-neon animate-pulse-dot" /> Edition 01 · Nashik</span>
          <span className="chip text-neon">Date · Announce Soon</span>
          <span className="chip">By Team Nest</span>
        </div>

        <h1 className="mt-10 font-display text-[18vw] leading-[0.85] tracking-tight md:text-[14vw] lg:text-[180px]">
          <span className="block">BUILD</span>
          <span className="block text-stroke">WITH</span>
          <span className="block">
            NASHIK
            <span className="ml-3 inline-block -translate-y-6 rounded-2xl bg-neon px-4 py-1 align-top font-sans text-2xl font-bold text-primary-foreground md:text-3xl">2026</span>
          </span>
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr,1fr] md:items-end">
          <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
            Nashik's largest community-driven hackathon. <span className="text-foreground">36 hours</span> to build, ship and win — alongside 500+ developers, mentors and founders.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#register" className="inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:gap-3 glow-neon">
              Register Now →
            </a>
            <a href="#sponsors" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-foreground transition-colors hover:border-neon hover:text-neon">
              Become Sponsor
            </a>
            <a href="#community" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-foreground transition-colors hover:border-foreground">
              Join Community
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {["36 Hours", "Innovation", "Networking", "Building", "Learning", "Winning"].map((w, i) => (
            <span key={w} className="flex items-center gap-2">
              <span className="text-neon">0{i + 1}</span> {w}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- stats ticker ---------- */

function StatsTicker() {
  const stats = [
    { v: 500, s: "+", l: "Developers" },
    { v: 50, s: "+", l: "Teams" },
    { v: 36, s: "h", l: "Hours" },
    { v: 20, s: "+", l: "Mentors" },
    { v: 10, s: "+", l: "Workshops" },
  ];
  return (
    <section className="border-y border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-border md:grid-cols-5 md:divide-x">
        {stats.map((s) => (
          <div key={s.l} className="border-border p-6 md:p-8 [&:not(:last-child)]:border-b md:[&:not(:last-child)]:border-b-0">
            <div className="font-display text-5xl text-neon md:text-6xl">
              <Counter to={s.v} suffix={s.s} />
            </div>
            <div className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- about ---------- */

function About() {
  const values = ["Innovation", "Collaboration", "Community", "Open Source", "Learning", "Networking", "AI", "Startup"];
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-28">
      <SectionLabel index="01">About</SectionLabel>
      <h2 className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">
        Not just another <span className="text-neon">hackathon.</span>
      </h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <p className="text-lg leading-relaxed text-muted-foreground">
          Build With Nashik is a community-driven innovation festival uniting developers, designers, founders, AI enthusiasts and students under one roof to ship impactful products in 36 hours.
        </p>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Nashik has incredible talent waiting for the right platform. Our mission is simple — <span className="text-foreground">build, collaborate, learn, grow.</span> Make friendships, launch careers, start companies.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        {values.map((v, i) => (
          <div key={v} className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-neon">
            <div className="font-mono text-xs text-muted-foreground">/{String(i + 1).padStart(2, "0")}</div>
            <div className="mt-6 font-display text-2xl tracking-tight">{v}</div>
            <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-neon/0 blur-2xl transition-all group-hover:bg-neon/30" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- mission ---------- */

function Mission() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-28 md:grid-cols-2">
        <div>
          <SectionLabel index="02">Mission</SectionLabel>
          <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-6xl">
            Why we started <br /> Build With Nashik.
          </h2>
        </div>
        <div className="space-y-8">
          <p className="text-lg text-muted-foreground">
            The lack of high-quality developer events in Nashik inspired Team Nest to bridge students, startups, professionals and industry leaders in one weekend.
          </p>
          <div className="space-y-4">
            {[
              ["Vision", "Make Nashik India's next innovation hub."],
              ["Mission", "Empower builders. Create founders. Promote AI. Connect industries."],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-border bg-background p-5">
                <div className="font-mono text-xs uppercase tracking-widest text-neon">{k}</div>
                <div className="mt-2 text-lg">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- timeline (gamified) ---------- */

function Timeline() {
  const steps = [
    { t: "Registration Opens", s: "Coming Soon", icon: "▶" },
    { t: "Idea Submission", s: "Coming Soon", icon: "✎" },
    { t: "Shortlisting", s: "Coming Soon", icon: "★" },
    { t: "Hackathon Begins", s: "36 Hours", icon: "⚡" },
    { t: "Mentoring", s: "Live", icon: "◆" },
    { t: "Judging", s: "Panel", icon: "⚖" },
    { t: "Winners", s: "Reveal", icon: "♛" },
    { t: "Networking", s: "Meetups", icon: "✦" },
    { t: "Aftermovie", s: "Coming Soon", icon: "▷" },
  ];
  return (
    <section id="timeline" className="mx-auto max-w-7xl px-6 py-28">
      <SectionLabel index="03">Timeline</SectionLabel>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">The <span className="text-neon">level path.</span></h2>
        <p className="max-w-md text-muted-foreground">A 9-checkpoint journey. Hit start, ship a product, claim the trophy.</p>
      </div>

      <div className="relative mt-16">
        {/* path */}
        <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-neon via-electric to-hot md:left-1/2 md:block" aria-hidden />
        <ol className="space-y-6">
          {steps.map((step, i) => (
            <li key={step.t} className={`grid items-center gap-4 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className={`${i % 2 ? "md:pl-12 md:text-left" : "md:pr-12 md:text-right"}`}>
                <div className="group inline-block w-full max-w-md rounded-2xl border border-border bg-surface p-6 transition-all hover:border-neon hover:-translate-y-1">
                  <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-neon text-primary-foreground">{String(i + 1).padStart(2, "0")}</span>
                    Checkpoint
                  </div>
                  <div className="mt-4 font-display text-2xl">{step.t}</div>
                  <div className="mt-1 text-sm text-neon">{step.s}</div>
                  <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full w-0 bg-neon transition-all duration-500 group-hover:w-full" />
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-neon bg-background font-display text-xl text-neon">
                  {step.icon}
                  <span className="absolute -inset-2 rounded-full bg-neon/20 blur-md" />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- tracks ---------- */

function Tracks() {
  const tracks = [
    { n: "AI", d: "Agents, LLMs, copilots", c: "neon" },
    { n: "Healthcare", d: "Diagnostics, access, wellness", c: "electric" },
    { n: "Education", d: "Learning at scale", c: "hot" },
    { n: "Climate", d: "Sustainability tech", c: "neon" },
    { n: "Agriculture", d: "Farm-to-fork stack", c: "electric" },
    { n: "FinTech", d: "Money, rails, access", c: "hot" },
    { n: "Cyber Security", d: "Defense & trust", c: "neon" },
    { n: "Web3", d: "Open protocols", c: "electric" },
    { n: "Open Innovation", d: "Build anything", c: "hot" },
  ];
  return (
    <section id="tracks" className="border-y border-border bg-surface/40 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel index="04">Tracks</SectionLabel>
        <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">Build the <span className="text-neon">future.</span></h2>
        <p className="mt-4 max-w-xl text-muted-foreground">Nine problem spaces. Pick yours. Final themes reveal soon.</p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t, i) => (
            <div key={t.n} className="group relative overflow-hidden rounded-3xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-neon">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-muted-foreground">/0{i + 1}</span>
                <span className="chip">Reveal Soon</span>
              </div>
              <div className="mt-10 font-display text-3xl leading-tight">{t.n}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t.d}</p>
              <div className={`mt-6 h-px w-full bg-gradient-to-r from-transparent via-${t.c} to-transparent opacity-50`} />
              <div className="mt-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest">
                <span className="text-muted-foreground">Difficulty · Open</span>
                <span className="text-neon transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- prizes ---------- */

function Prizes() {
  const podium = [
    { p: "2nd", h: "h-40", c: "bg-surface-2", label: "Silver", amt: "Coming Soon" },
    { p: "1st", h: "h-56", c: "bg-neon text-primary-foreground", label: "Gold", amt: "Coming Soon" },
    { p: "3rd", h: "h-32", c: "bg-surface-2", label: "Bronze", amt: "Coming Soon" },
  ];
  const special = ["Best AI Project", "Best UI", "Best Beginner Team", "Best Innovation", "Women in Tech", "Community Choice"];
  return (
    <section id="prizes" className="mx-auto max-w-7xl px-6 py-28">
      <SectionLabel index="05">Prize Pool</SectionLabel>
      <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">Compete. <span className="text-neon">Win big.</span></h2>

      <div className="mt-16 grid items-end gap-4 md:grid-cols-3">
        {podium.map((p) => (
          <div key={p.p} className="text-center">
            <div className="mb-3 font-display text-4xl">{p.p}</div>
            <div className={`${p.h} ${p.c} flex items-center justify-center rounded-t-2xl border border-border font-display text-2xl transition-transform hover:-translate-y-2`}>
              {p.label}
            </div>
            <div className="rounded-b-2xl border-x border-b border-border bg-surface p-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {p.amt}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Special Awards</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {special.map((s) => (
            <div key={s} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
              <span>{s}</span>
              <span className="chip">TBA</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- sponsors ---------- */

function Sponsors() {
  const tiers = ["Title", "Gold", "Silver", "Community", "Education", "Hiring", "Cloud", "AI", "Dev Tools"];
  return (
    <section id="sponsors" className="border-y border-border bg-surface/40 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel index="06">Sponsors</SectionLabel>
        <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">Powered by <span className="text-neon">industry leaders.</span></h2>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t} className="flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background transition-colors hover:border-neon">
              <div className="font-display text-xl text-muted-foreground">Your Brand Here</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-widest text-neon">{t} Partner</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 overflow-hidden border-y border-border py-6">
        <div className="flex animate-marquee gap-12 whitespace-nowrap font-display text-2xl text-muted-foreground">
          {Array.from({ length: 2 }).flatMap((_, i) =>
            ["BUILD/NASHIK", "★", "TEAM NEST", "✦", "OPEN SOURCE", "◆", "AI INDIA", "▲", "STARTUP NASHIK", "✕"].map((t, j) => (
              <span key={`${i}-${j}`} className="shrink-0">{t}</span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- why sponsor ---------- */

function WhySponsor() {
  const benefits = [
    "Direct hiring access", "Brand visibility", "Developer engagement",
    "Product showcase", "Campus outreach", "Social media reach",
    "Community trust", "Startup ecosystem", "Speaking opportunities",
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <SectionLabel index="07">Why Sponsor</SectionLabel>
      <div className="mt-6 grid gap-12 md:grid-cols-[1fr,1.2fr]">
        <h2 className="font-display text-5xl leading-[0.95] md:text-6xl">
          Partner with Nashik's next generation of <span className="text-neon">builders.</span>
        </h2>
        <div>
          <p className="text-lg text-muted-foreground">
            Get unmatched visibility, recruit top talent and back the next wave of founders out of Nashik. Custom packages available.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <li key={b} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm">
                <span className="font-mono text-xs text-neon">0{i + 1}</span> {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-neon px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground glow-neon">
              Download Deck →
            </a>
            <a href="mailto:team@buildwithnashik.in" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:border-neon hover:text-neon">
              Book a Meeting
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- community ---------- */

function Community() {
  const partners = ["Developer Community", "Student Chapters", "Tech Clubs", "AI Clubs", "GDG", "Microsoft Learn", "AWS Community", "GitHub Community"];
  return (
    <section id="community" className="border-y border-border bg-surface/40 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel index="08">Community</SectionLabel>
        <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">Built by <span className="text-neon">community.</span></h2>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Team Nest runs workshops, meetups, hackathons and open-source projects across Nashik. This is what we do every weekend — now scaled up.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {partners.map((p) => (
            <div key={p} className="rounded-2xl border border-border bg-background p-5">
              <div className="font-display text-lg">{p}</div>
              <div className="mt-2 font-mono text-xs uppercase tracking-widest text-neon">Partner Soon</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- team ---------- */

function Team() {
  const core = [
    { n: "Vedant Lokhande", r: "Core Team" },
    { n: "Aaryan Singh", r: "Core Team" },
    { n: "Rupali Patil", r: "Core Team" },
    { n: "Nikhil Patil", r: "Core Team" },
    { n: "Anurag (Darshan)", r: "Core Team" },
    { n: "More Soon", r: "Joining" },
  ];
  return (
    <section id="team" className="mx-auto max-w-7xl px-6 py-28">
      <SectionLabel index="09">Organizing Team</SectionLabel>
      <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">Meet the <span className="text-neon">builders.</span></h2>

      <div className="mt-16 grid gap-6 md:grid-cols-[1.2fr,2fr]">
        <div className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-neon/20 via-electric/10 to-background p-8">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-neon/30 blur-3xl" />
          <div className="chip">Founder & Organizer</div>
          <div className="mt-6 aspect-square w-40 rounded-2xl border border-border bg-surface grid place-items-center font-display text-6xl text-neon">AR</div>
          <h3 className="mt-6 font-display text-4xl">Ansh Rajore</h3>
          <p className="mt-2 max-w-md text-muted-foreground">Founder of Team Nest & NayaMarg. 5× hackathon winner. AI / full-stack builder.</p>
          <a href="#" className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neon">LinkedIn →</a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {core.map((m) => (
            <div key={m.n} className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-neon">
              <div className="aspect-square w-full rounded-xl border border-border bg-background grid place-items-center font-display text-3xl text-muted-foreground transition-colors group-hover:text-neon">
                {m.n.split(" ").map((s) => s[0]).join("").slice(0, 2)}
              </div>
              <div className="mt-4 font-display text-lg leading-tight">{m.n}</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{m.r}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- venue ---------- */

function Venue() {
  const items = ["Hotels", "Railway", "Airport", "Parking", "Food", "Accommodation", "Directions", "Weather"];
  return (
    <section className="border-y border-border bg-surface/40 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel index="10">Venue</SectionLabel>
        <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">Hosted in <span className="text-neon">Nashik.</span></h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-background grid-bg">
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-display text-6xl text-neon">📍</div>
                <div className="mt-4 font-display text-3xl">Nashik, MH</div>
                <div className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Venue · Announce Soon</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {items.map((it) => (
              <div key={it} className="rounded-2xl border border-border bg-background p-5">
                <div className="font-display text-lg">{it}</div>
                <div className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">Coming Soon</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- faq ---------- */

function Faq() {
  const faqs = [
    ["Who can participate?", "Anyone passionate about technology — students, developers, designers, founders."],
    ["What's the team size?", "2 to 4 members per team."],
    ["How long is the hackathon?", "36 hours of continuous building."],
    ["Is there a registration fee?", "Coming soon — likely free or a nominal fee."],
    ["Is accommodation provided?", "Details coming soon. Nearby options will be listed."],
    ["Will there be food?", "Yes — meals and snacks throughout the event."],
    ["Do participants get certificates?", "Yes, every participant receives a certificate."],
    ["What about mentorship?", "20+ mentors across AI, full-stack, design and startup ops."],
    ["When are themes revealed?", "Final themes will be announced soon."],
  ];
  return (
    <section id="faq" className="mx-auto max-w-7xl px-6 py-28">
      <SectionLabel index="11">FAQ</SectionLabel>
      <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">Asked & <span className="text-neon">answered.</span></h2>
      <div className="mt-12 divide-y divide-border rounded-3xl border border-border bg-surface">
        {faqs.map(([q, a], i) => (
          <details key={q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-neon">/{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-lg md:text-xl">{q}</span>
              </div>
              <span className="grid h-8 w-8 place-items-center rounded-full border border-border font-mono text-sm transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 max-w-2xl pl-12 text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------- final cta ---------- */

function FinalCta() {
  return (
    <section id="register" className="relative overflow-hidden border-t border-border bg-neon text-primary-foreground">
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 py-32 text-center">
        <div className="chip border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">Date · Announce Soon</div>
        <h2 className="mt-8 font-display text-6xl leading-[0.9] md:text-[10vw] lg:text-[160px]">
          READY TO <br /> BUILD?
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg opacity-80">
          One weekend in Nashik. 36 hours of building. A community for life.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            ["Register", "#"],
            ["Join Discord", "#"],
            ["Join WhatsApp", "#"],
            ["Become Sponsor", "#"],
            ["Become Volunteer", "#"],
          ].map(([l, h]) => (
            <a key={l} href={h} className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-foreground transition-transform hover:-translate-y-0.5">
              {l} →
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  const cols = [
    { h: "Event", l: ["About", "Timeline", "Tracks", "Prizes", "FAQ"] },
    { h: "Partners", l: ["Sponsors", "Community", "Volunteer", "Mentors"] },
    { h: "Connect", l: ["Instagram", "LinkedIn", "GitHub", "Discord", "Mail"] },
    { h: "Legal", l: ["Privacy", "Terms", "Code of Conduct"] },
  ];
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr,2fr]">
          <div>
            <div className="flex items-center gap-2 font-display text-xl">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-neon text-primary-foreground">B</span>
              BUILD/NASHIK
            </div>
            <p className="mt-4 max-w-sm text-muted-foreground">Nashik's largest community-driven developer hackathon. Built with love by Team Nest.</p>
            <div className="mt-6 chip">Nashik · Maharashtra · India</div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {cols.map((c) => (
              <div key={c.h}>
                <div className="font-mono text-xs uppercase tracking-widest text-neon">{c.h}</div>
                <ul className="mt-4 space-y-2">
                  {c.l.map((it) => (
                    <li key={it}><a href="#" className="text-sm text-muted-foreground hover:text-foreground">{it}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span>© 2026 Team Nest</span>
          <span>Build · Ship · Win</span>
        </div>

        <div className="mt-16 overflow-hidden">
          <div className="font-display text-[28vw] leading-none tracking-tighter text-foreground/5 select-none">BUILD/NASHIK</div>
        </div>
      </div>
    </footer>
  );
}
