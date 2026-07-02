import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import anshAsset from "@/assets/ansh.png.asset.json";
import towerAsset from "@/assets/clock-tower.png.asset.json";
import mtwAsset from "@/assets/mtw.jpeg.asset.json";
import sunhacksAsset from "@/assets/sunhacks.png.asset.json";
import { RegisterDialog } from "@/components/RegisterDialog";
import { SponsorDialog } from "@/components/SponsorDialog";
import { VolunteerDialog } from "@/components/VolunteerDialog";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Build With Nashik 2026 — Nashik's Largest Developer Hackathon" },
      { name: "description", content: "36 hours. 500+ builders. One city. Build With Nashik is the community-driven developer hackathon by Team Nest. Date announce soon." },
    ],
  }),
  component: Home,
});

/* ===== state context (just two dialogs) ===== */

function Home() {
  const [openReg, setOpenReg] = useState(false);
  const [openSponsor, setOpenSponsor] = useState(false);
  const [openVol, setOpenVol] = useState(false);
  const [sponsorTier, setSponsorTier] = useState<string | undefined>();

  function openSponsorFor(tier?: string) {
    setSponsorTier(tier);
    setOpenSponsor(true);
  }

  return (
    <div className="min-h-screen overflow-x-hidden paper text-foreground antialiased">
      <CursorFollower />
      <Toaster position="top-center" theme="light" toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} />
      <Ticker />
      <Nav onRegister={() => setOpenReg(true)} />
      <Hero onRegister={() => setOpenReg(true)} onSponsor={() => openSponsorFor()} />
      <Legacy />
      <Stats />
      <About />
      <Mission />
      <Timeline3D />
      <Tracks />
      <Prizes />
      <Sponsors onSponsor={openSponsorFor} />
      <WhySponsor onSponsor={() => openSponsorFor("Title")} />
      <Community />
      <Team />
      <JoinTeam onVolunteer={() => setOpenVol(true)} onSponsor={() => openSponsorFor()} />
      <Venue onSponsor={() => openSponsorFor("Venue")} />
      <Faq />
      <FinalCta onRegister={() => setOpenReg(true)} onSponsor={() => openSponsorFor()} onVolunteer={() => setOpenVol(true)} />
      <Footer />

      <RegisterDialog open={openReg} onClose={() => setOpenReg(false)} />
      <SponsorDialog open={openSponsor} onClose={() => setOpenSponsor(false)} defaultTier={sponsorTier} />
      <VolunteerDialog open={openVol} onClose={() => setOpenVol(false)} />
    </div>
  );
}


/* ============= shared ============= */

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
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

function SectionTag({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em]">
      <span className="tag-orange px-2 py-0.5 text-cream">{n}</span>
      <span>{children}</span>
      <span className="h-0.5 flex-1 bg-ink" />
    </div>
  );
}

/* ============= ticker (yellow tape) ============= */

function Ticker() {
  const items = ["★ Build With Nashik 2026", "● Date · Announce Soon", "⚡ Registrations Opening Soon", "✦ 36 Hours / 500+ Builders", "→ Powered by Team Nest", "◆ Nashik · Maharashtra"];
  return (
    <div className="relative z-30 overflow-hidden border-y-2 border-ink bg-yellow">
      <div className="flex animate-marquee whitespace-nowrap py-2 font-chunk text-sm uppercase tracking-wide text-ink">
        {Array.from({ length: 2 }).flatMap((_, i) =>
          items.map((t, j) => (
            <span key={`${i}-${j}`} className="flex shrink-0 items-center gap-6 px-6">
              {t} <span className="opacity-40">✕</span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/* ============= nav ============= */

function Nav({ onRegister }: { onRegister: () => void }) {
  const links = [["About", "about"], ["Timeline", "timeline"], ["Tracks", "tracks"], ["Prizes", "prizes"], ["Sponsors", "sponsors"], ["Team", "team"], ["FAQ", "faq"]];
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink font-display text-xl text-cream">B</span>
          <span className="font-chunk text-xl uppercase tracking-tight">Build/Nashik</span>
          <span className="tag-yellow ml-1 px-1.5 py-0 font-mono text-[10px]">2026</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={`#${h}`} className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70 transition-colors hover:text-orange">{l}</a>
          ))}
        </nav>
        <button onClick={onRegister} className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5">
          Register <span>→</span>
        </button>
      </div>
    </header>
  );
}

/* ============= hero — unique BUILD/NASHIK logotype ============= */

function Hero({ onRegister, onSponsor }: { onRegister: () => void; onSponsor: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const towerRef = useRef<HTMLDivElement>(null);

  // parallax on mouse move (disabled on touch / reduced motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const wrap = wrapRef.current;
    const tower = towerRef.current;
    if (!wrap || !tower) return;
    let raf = 0;
    const handle = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        tower.style.transform = `translate3d(${x * -22}px, ${y * -16}px, 0)`;
      });
    };
    wrap.addEventListener("mousemove", handle);
    return () => { wrap.removeEventListener("mousemove", handle); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="top" ref={wrapRef} className="relative overflow-hidden">
      <Sticker className="left-[4%] top-24" rot={-12}>⚡</Sticker>
      <Sticker className="right-[6%] top-36" rot={14} color="cobalt">★</Sticker>
      <Sticker className="left-[10%] bottom-24" rot={6} color="rose">36h</Sticker>
      <Sticker className="right-[10%] bottom-32" rot={-8} color="yellow">◆</Sticker>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pt-12 pb-20 lg:grid-cols-[1.7fr,0.85fr] lg:gap-10 lg:pt-16">

        {/* LEFT — copy (primary) */}
        <div className="relative">
          <div className="flex flex-wrap gap-2">
            <span className="chip"><span className="h-2 w-2 rounded-full bg-orange animate-blink" /> Edition 01</span>
            <span className="chip bg-yellow">Date · Announce Soon</span>
            <span className="chip">By Team Nest</span>
          </div>

          <div className="relative mt-8 select-none">
            <div className="font-display text-[16vw] leading-[0.78] tracking-tight text-ink lg:text-[140px]">
              <span className="block">BUILD</span>
            </div>
            <div className="-mt-4 flex items-end gap-3">
              <span className="font-script text-[11vw] leading-none text-orange animate-wiggle inline-block lg:text-[90px]">with</span>
              <span className="mb-2 hidden h-1 flex-1 bg-ink md:block" />
              <span className="mb-3 hidden font-mono text-[10px] font-bold uppercase tracking-widest text-ink md:inline">/ Hackathon 2026</span>
            </div>
            <div className="-mt-3 inline-block ink-border bg-ink px-4 pb-2 pt-1 text-cream">
              <span className="font-display text-[16vw] leading-[0.85] tracking-tight lg:text-[140px]">NASHIK<span className="text-orange">.</span></span>
            </div>
          </div>

          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink/80 md:text-xl">
            Great communities aren't built by companies. They're built by people who decide to <span className="tag-yellow font-bold">create instead of wait</span>. Build With Nashik exists to prove that <span className="tag-orange font-bold">world-class innovation</span> can start from any city, with anyone willing to build.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={onRegister} className="ink-border-sm group inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5">
              Register Now <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button onClick={onSponsor} className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5">
              Become Sponsor
            </button>
            <a href="#community" className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-cream">
              Join Community
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs font-bold uppercase tracking-widest">
            {["36 Hours", "500+ Builders", "Mentors", "Prizes", "Open Source"].map((w, i) => (
              <span key={w} className="chip"><span className="text-orange">0{i + 1}</span> {w}</span>
            ))}
          </div>
        </div>

        {/* RIGHT — tower as small side accent */}
        <aside className="relative hidden lg:block" aria-hidden>
          <div className="relative mx-auto h-[420px] w-full max-w-[300px]">
            <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
              <div className="h-44 w-44 rounded-full bg-orange/40 blur-3xl animate-glow" />
            </div>
            <div ref={towerRef} className="relative h-full w-full will-change-transform">
              <img
                src={towerAsset.url}
                alt="Nashik Clock Tower"
                loading="eager"
                decoding="async"
                className="animate-tower mx-auto h-full w-auto object-contain drop-shadow-[6px_10px_0_rgba(24,18,14,0.18)]"
              />
            </div>
            <div className="absolute -right-2 top-4 ink-border-sm bg-cream px-2.5 py-1 font-script text-base text-ink" style={{ transform: "rotate(6deg)" }}>
              our clock tower <span className="text-orange">★</span>
            </div>
            <div className="absolute -bottom-2 -left-2 ink-border-sm tag-cobalt px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-cream" style={{ transform: "rotate(-4deg)" }}>
              Nashik · Maharashtra
            </div>
          </div>
        </aside>
      </div>

      {/* mobile-only small tower */}
      <div className="relative mx-auto -mt-6 mb-12 grid w-full max-w-xs place-items-center px-6 lg:hidden" aria-hidden>
        <img src={towerAsset.url} alt="" className="h-48 w-auto object-contain" loading="lazy" />
      </div>
    </section>
  );
}


function Sticker({ children, className = "", rot = 0, color = "orange" }: { children: React.ReactNode; className?: string; rot?: number; color?: "orange" | "cobalt" | "rose" | "yellow" }) {
  const map: Record<string, string> = {
    orange: "bg-orange text-cream",
    cobalt: "bg-cobalt text-cream",
    rose: "bg-rose text-ink",
    yellow: "bg-yellow text-ink",
  };
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-10 hidden md:block ${className}`}
      style={{ ["--r" as never]: `${rot}deg`, animation: "float-y 6s ease-in-out infinite" }}
    >
      <div className={`ink-border grid h-16 w-16 place-items-center rounded-2xl font-display text-2xl ${map[color]}`} style={{ transform: `rotate(${rot}deg)` }}>
        {children}
      </div>
    </div>
  );
}

/* ============= stats ============= */

function Stats() {
  const items: Array<[number, string, string]> = [
    [500, "+", "Developers"], [50, "+", "Teams"], [36, "h", "Hours"],
    [20, "+", "Mentors"], [10, "+", "Workshops"], [1000, "+", "Community"],
  ];
  return (
    <section className="border-y-2 border-ink bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-6">
        {items.map(([v, s, l], i) => (
          <div key={l} className={`p-6 md:p-8 ${i < items.length - 1 ? "border-r-2 border-cream/15" : ""} ${i < items.length - (i % 2 === 0 ? 2 : 1) ? "border-b-2 border-cream/15 md:border-b-0" : ""}`}>
            <div className="font-display text-5xl text-orange md:text-6xl"><Counter to={v} suffix={s} /></div>
            <div className="mt-2 font-mono text-xs font-bold uppercase tracking-widest opacity-80">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= about ============= */

function About() {
  const values = ["Innovation", "Collaboration", "Community", "Open Source", "Learning", "Networking", "AI", "Startup"];
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-28">
      <SectionTag n="01">About</SectionTag>
      <h2 className="mt-6 max-w-5xl font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
        Not just another <span className="tag-orange text-cream">hackathon.</span>
      </h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <p className="text-lg leading-relaxed text-ink/75">
          Build With Nashik is a community-driven innovation festival uniting developers, designers, founders, AI enthusiasts and students under one roof to ship products in 36 hours.
        </p>
        <p className="text-lg leading-relaxed text-ink/75">
          Nashik has incredible talent waiting for the right platform. Our mission is simple — <span className="font-script text-3xl text-orange">build, collaborate, learn, grow.</span>
        </p>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        {values.map((v, i) => (
          <div key={v} className="group ink-border-sm rounded-2xl bg-cream p-5 transition-transform hover:-translate-y-1">
            <div className="font-mono text-xs font-bold text-orange">/{String(i + 1).padStart(2, "0")}</div>
            <div className="mt-6 font-chunk text-2xl uppercase tracking-tight">{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= mission ============= */

function Mission() {
  return (
    <section className="relative overflow-hidden border-y-2 border-ink bg-orange text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-28 md:grid-cols-2">
        <div>
          <div className="chip border-cream bg-orange text-cream">02 · Mission</div>
          <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-7xl">
            Why we started <br />
            <span className="font-script normal-case text-yellow">Build With Nashik.</span>
          </h2>
        </div>
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            The lack of high-quality developer events in Nashik pushed Team Nest to bridge students, startups, professionals and industry leaders in one weekend.
          </p>
          {[
            ["Vision", "Make Nashik India's next innovation hub."],
            ["Mission", "Empower builders. Create founders. Promote AI. Connect industries."],
          ].map(([k, v]) => (
            <div key={k} className="ink-border-sm rounded-2xl bg-cream p-5 text-ink">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-orange">{k}</div>
              <div className="mt-2 font-chunk text-2xl">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============= journey timeline (reliable scroll reveal) ============= */

function Timeline3D() {
  const steps = [
    { n: "01", y: "2023 — 2026", t: "Participated in National Hackathons", s: "India's biggest builder stages", c: "orange", icon: "▶", d: "Three years on India's biggest hackathon stages — shipping under pressure, winning, losing, and learning what really makes a build community work." },
    { n: "02", y: "2025", t: "Organized SUNHACKS", s: "Asia's Largest GenAI Hackathon", c: "cobalt", icon: "✦", d: "Ran operations end-to-end for Asia's largest GenAI hackathon in 2025 — thousands of builders, real outcomes, a playbook we now bring home to Nashik." },
    { n: "03", y: "2025", t: "Hosted Community Events", s: "Workshops · Meetups · Dev Jams", c: "yellow", icon: "✎", d: "Workshops, meetups and dev jams across the city — bringing Nashik's builders into one room, one Discord, one shipping culture." },
    { n: "04", y: "2026", t: "Expanded Team Nest", s: "Multi-city Volunteer Network", c: "rose", icon: "⚡", d: "From a small crew to a multi-city volunteer network — builders, designers and operators rallying around one mission." },
    { n: "05", y: "2026", t: "Launching Build With Nashik", s: "The flagship — applied", c: "cobalt", icon: "♛", d: "Everything we've learned, applied. A 36-hour flagship hackathon built for the next wave of Nashik builders. This is the level we've been training for." },
  ];

  const colorMap: Record<string, { chip: string; dot: string }> = {
    orange: { chip: "bg-orange text-cream", dot: "bg-orange" },
    yellow: { chip: "bg-yellow text-ink",   dot: "bg-yellow" },
    cobalt: { chip: "bg-cobalt text-cream", dot: "bg-cobalt" },
    rose:   { chip: "bg-rose text-ink",     dot: "bg-rose" },
  };

  const itemsRef = useRef<HTMLLIElement[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        setRevealed((prev) => {
          const next = new Set(prev);
          for (const e of entries) {
            if (e.isIntersecting) {
              const idx = Number((e.target as HTMLElement).dataset.idx);
              next.add(idx);
            }
          }
          return next;
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );
    itemsRef.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="timeline" className="relative mx-auto max-w-7xl px-6 py-28">
      {/* giant background wordmark — Build With Nashik */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-10 select-none overflow-hidden">
        <div className="font-display text-[18vw] leading-none tracking-tight text-ink/[0.05] whitespace-nowrap text-center">
          BUILD&nbsp;WITH&nbsp;NASHIK
        </div>
      </div>

      <SectionTag n="03">Timeline</SectionTag>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          The <span className="tag-cobalt text-cream">level path.</span>
        </h2>
        <p className="max-w-md text-ink/70">From 2023 to 2026 — every checkpoint that led to Build With Nashik. Scroll to unlock each level.</p>
      </div>

      <ol className="relative mt-16">
        {/* center rail */}
        <div className="pointer-events-none absolute left-6 top-0 h-full w-1 bg-ink/15 md:left-1/2 md:-translate-x-1/2" aria-hidden>
          <div className="w-full bg-orange transition-all duration-700" style={{ height: `${(revealed.size / steps.length) * 100}%` }} />
        </div>

        {steps.map((s, i) => {
          const left = i % 2 === 0;
          const cm = colorMap[s.c];
          const isOn = revealed.has(i);
          return (
            <li
              key={s.n}
              data-idx={i}
              ref={(el) => { if (el) itemsRef.current[i] = el; }}
              className="relative grid grid-cols-[3rem,1fr] gap-4 pb-14 md:grid-cols-2 md:gap-10"
            >
              {/* node */}
              <span
                className={`absolute left-6 top-3 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-2xl border-2 border-ink font-display text-lg shadow-[3px_3px_0_var(--ink)] md:left-1/2 ${cm.chip} transition-transform duration-500 ${isOn ? "scale-100 rotate-0" : "scale-50 rotate-45 opacity-0"}`}
                aria-hidden
              >
                {s.icon}
              </span>

              {/* spacer for opposite side on desktop */}
              <div className={`hidden md:block ${left ? "order-2" : "order-1"}`} />

              {/* card */}
              <article
                className={`ink-border-lg col-span-2 ml-14 rounded-3xl bg-cream p-6 md:col-span-1 md:ml-0 md:p-8 ${left ? "md:order-1 md:mr-12 md:text-right" : "md:order-2 md:ml-12"}`}
                style={{
                  transform: isOn ? "translateY(0) rotate(0)" : `translateY(28px) rotate(${left ? -1.2 : 1.2}deg)`,
                  opacity: isOn ? 1 : 0,
                  transition: "transform 700ms cubic-bezier(0.2,0.7,0.2,1), opacity 500ms ease",
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div className={`flex items-center gap-2 ${left ? "md:justify-end" : ""}`}>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">Checkpoint /{s.n}</span>
                  <span className="chip">{s.y}</span>
                </div>
                <h3 className="mt-3 font-chunk text-3xl uppercase leading-none tracking-tight md:text-4xl">{s.t}</h3>
                <div className={`mt-2 inline-block ${cm.chip} ink-border-sm px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest`}>{s.s}</div>
                <p className="mt-4 text-sm leading-relaxed text-ink/75">{s.d}</p>
                <div className={`mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/50 ${left ? "md:justify-end" : ""}`}>
                  <span>level {i + 1} / {steps.length}</span>
                  <span className="h-px w-10 bg-ink/30" />
                  <span>{isOn ? "unlocked ✓" : "locked"}</span>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      {/* ===== hackathon schedule sub-timeline ===== */}
      <div className="relative mt-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="chip bg-orange text-cream">Hackathon Schedule</div>
            <h3 className="mt-4 font-chunk text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl">
              The <span className="tag-yellow">36-hour</span> run.
            </h3>
            <p className="mt-3 max-w-xl text-ink/70">High-level phases for Build With Nashik 2026. Full 36-hour schedule will be shared soon.</p>
          </div>
          <div className="chip animate-blink bg-ink text-cream">● Dates locking in</div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { p: "Phase 01", t: "Team Registration Opens", d: "Lock your team of 2–4 and pick a track.", c: "bg-orange text-cream" },
            { p: "Phase 02", t: "Registration Closes", d: "Last call. After this, the gates lock.", c: "bg-yellow text-ink" },
            { p: "Phase 03", t: "Submission Window", d: "Ideas, scoping & shortlists begin.", c: "bg-cobalt text-cream" },
            { p: "Phase 04", t: "Final Shortlist", d: "Selected teams confirmed for on-ground.", c: "bg-rose text-ink" },
            { p: "Phase 05", t: "Hackathon Begins", d: "36 hours. The clock starts in Nashik.", c: "bg-ink text-cream" },
            { p: "Phase 06", t: "Conclusion & Awards", d: "Demos, judging, winners, after-party.", c: "bg-orange text-cream" },
          ].map((ph, i) => (
            <div
              key={ph.p}
              className="ink-border-sm relative rounded-2xl bg-cream p-4 transition-transform hover:-translate-y-1"
              style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.5}deg)` }}
            >
              <div className={`chip ${ph.c} border-ink`}>{ph.p}</div>
              <div className="mt-3 font-chunk text-lg uppercase leading-tight">{ph.t}</div>
              <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">Date · TBA</div>
              <p className="mt-2 text-xs leading-relaxed text-ink/75">{ph.d}</p>
            </div>
          ))}
        </div>

        <div className="ink-border-sm mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-cream">
          <span className="h-2 w-2 animate-blink rounded-full bg-orange" /> Full 36-hour schedule will share soon
        </div>
      </div>
    </section>
  );
}

/* ============= tracks ============= */

function Tracks() {
  const tracks = [
    { n: "AI / GenAI",      d: "Agents, LLMs, multimodal copilots",      c: "orange", icon: "✦", diff: "Open",         eg: "RAG bots · voice agents · LLM tools" },
    { n: "Healthcare",      d: "Diagnostics, access, mental wellness",   c: "cobalt", icon: "✚", diff: "Intermediate", eg: "tele-care · health records · triage" },
    { n: "Education",       d: "Learning at scale, ed-tech for Bharat",  c: "rose",   icon: "✎", diff: "Beginner OK",  eg: "tutor bots · skill maps · libraries" },
    { n: "Climate",         d: "Sustainability + green-tech",            c: "yellow", icon: "❀", diff: "Open",         eg: "carbon · waste · clean energy" },
    { n: "Agriculture",     d: "Farm-to-fork modern stack",              c: "orange", icon: "✿", diff: "Open",         eg: "crop intel · supply chain · markets" },
    { n: "FinTech",         d: "Money rails, access, inclusion",         c: "cobalt", icon: "₹", diff: "Intermediate", eg: "UPI hacks · credit · wealth" },
    { n: "Cyber Security",  d: "Defense, trust, identity",               c: "rose",   icon: "⛨", diff: "Advanced",     eg: "auth · threat · privacy tools" },
    { n: "Web3 / Open",     d: "Open protocols, public goods",           c: "yellow", icon: "◈", diff: "Open",         eg: "ID · DAOs · onchain tooling" },
    { n: "Open Innovation", d: "Build literally anything",               c: "orange", icon: "★", diff: "All Levels",   eg: "your wild card track" },
  ];
  return (
    <section id="tracks" className="border-y-2 border-ink bg-cream py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTag n="04">Tracks</SectionTag>
        <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          Build the <span className="tag-orange text-cream">future.</span>
        </h2>
        <p className="mt-4 max-w-xl text-ink/70">Nine problem spaces. Pick yours. Final themes reveal soon.</p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t, i) => {
            const map: Record<string, { chip: string; glow: string; ring: string }> = {
              orange: { chip: "bg-orange text-cream", glow: "from-orange/40", ring: "group-hover:shadow-[0_0_0_2px_var(--orange)]" },
              cobalt: { chip: "bg-cobalt text-cream", glow: "from-cobalt/40", ring: "group-hover:shadow-[0_0_0_2px_var(--cobalt)]" },
              rose:   { chip: "bg-rose text-ink",    glow: "from-rose/50",   ring: "group-hover:shadow-[0_0_0_2px_var(--rose)]" },
              yellow: { chip: "bg-yellow text-ink",  glow: "from-yellow/60", ring: "group-hover:shadow-[0_0_0_2px_var(--yellow)]" },
            };
            const m = map[t.c];
            return (
              <article
                key={t.n}
                className={`ink-border group relative overflow-hidden rounded-3xl bg-cream p-6 transition-all duration-300 hover:-translate-y-1.5 hover:rotate-[-0.6deg] ${m.ring}`}
              >
                {/* number watermark */}
                <div className="pointer-events-none absolute -right-3 -top-6 font-display text-[110px] leading-none text-ink/[0.06] select-none">
                  {String(i + 1).padStart(2, "0")}
                </div>
                {/* hover gradient wash */}
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${m.glow} via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                <div className="relative flex items-start justify-between">
                  <div className={`ink-border-sm grid h-12 w-12 place-items-center rounded-2xl font-display text-2xl ${m.chip}`}>{t.icon}</div>
                  <span className="chip">{t.diff}</span>
                </div>

                <div className={`relative mt-8 inline-block px-3 py-1 font-chunk text-3xl uppercase tracking-tight ${m.chip}`} style={{ transform: "rotate(-1.5deg)" }}>
                  {t.n}
                </div>
                <p className="relative mt-4 text-ink/75">{t.d}</p>

                <div className="relative mt-5 ink-border-sm rounded-xl bg-cream/60 p-3 font-mono text-[11px] uppercase tracking-widest text-ink/60">
                  examples → <span className="text-ink">{t.eg}</span>
                </div>

                <div className="relative mt-5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
                  <span className="text-ink/60">Prize · TBA</span>
                  <span className="text-orange transition-transform group-hover:translate-x-1">explore →</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ============= prizes ============= */

function Prizes() {
  const podium = [
    { p: "2nd", h: "h-44", c: "bg-cream text-ink", label: "Silver" },
    { p: "1st", h: "h-60", c: "bg-orange text-cream", label: "Gold" },
    { p: "3rd", h: "h-36", c: "bg-rose text-ink", label: "Bronze" },
  ];
  const special = ["Best AI Project", "Best UI", "Best Beginner Team", "Best Innovation", "Women in Tech", "Community Choice"];
  return (
    <section id="prizes" className="mx-auto max-w-7xl px-6 py-28">
      <SectionTag n="05">Prize Pool</SectionTag>
      <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
        Compete. <span className="font-script normal-case text-orange">Win big.</span>
      </h2>

      <div className="mt-16 grid items-end gap-5 md:grid-cols-3">
        {podium.map((p) => (
          <div key={p.p} className="text-center">
            <div className="mb-3 font-chunk text-3xl uppercase">{p.p}</div>
            <div className={`${p.h} ink-border-lg flex items-center justify-center rounded-t-3xl font-chunk text-3xl uppercase tracking-tight transition-transform hover:-translate-y-2 ${p.c}`}>
              {p.label}
            </div>
            <div className="ink-border-sm rounded-b-2xl border-t-0 bg-cream p-4 font-mono text-xs font-bold uppercase tracking-widest text-ink/70">
              Coming Soon
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <div className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">Special Awards</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {special.map((s) => (
            <div key={s} className="ink-border-sm flex items-center justify-between rounded-xl bg-cream p-4">
              <span className="font-chunk uppercase">{s}</span>
              <span className="chip">TBA</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============= sponsors ============= */

function Sponsors({ onSponsor }: { onSponsor: (tier?: string) => void }) {
  return (
    <section id="sponsors" className="border-y-2 border-ink bg-yellow py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTag n="06">Sponsors</SectionTag>
        <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          Powered by <span className="tag-cobalt text-cream">industry leaders.</span>
        </h2>
        <p className="mt-4 max-w-xl text-ink/80">Different tiers, different stages. Pick the level that fits your brand — every inquiry reaches Team Nest directly.</p>

        {/* TITLE — single hero card */}
        <button
          onClick={() => onSponsor("Title")}
          className="ink-border-lg group relative mt-12 block w-full overflow-hidden rounded-3xl bg-ink p-1 text-cream"
        >
          <div className="relative grid min-h-[220px] place-items-center rounded-[20px] bg-gradient-to-br from-[#2a1d0a] via-ink to-[#2a1d0a] px-8 py-12">
            <div className="absolute -inset-1 -z-0 opacity-40 blur-3xl"
              style={{ background: "radial-gradient(circle at 30% 50%, #f5d76e, transparent 60%), radial-gradient(circle at 70% 50%, #b8860b, transparent 60%)" }} />
            <div className="relative text-center">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-yellow/80">— Tier 01 · Headline —</div>
              <div className="mt-3 font-display text-5xl uppercase tracking-tight text-gold-shimmer md:text-7xl">Title Sponsor</div>
              <div className="mt-4 font-script text-3xl text-cream">your brand · everywhere.</div>
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-yellow/60 bg-ink/40 px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-yellow transition-transform group-hover:-translate-y-0.5">
                Inquire for headline tier →
              </div>
            </div>
          </div>
        </button>

        {/* POWERED BY + PLATINUM */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <SponsorCard onClick={() => onSponsor("Powered By")} tier="Powered By" tone="orange" size="lg" tagline="brand alongside the wordmark" />
          <SponsorCard onClick={() => onSponsor("Platinum")} tier="Platinum" tone="cobalt" size="lg" tagline="stage · keynote · prize sponsor" />
        </div>

        {/* GOLD x3 */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["Gold", "Cloud", "AI"].map((t) => (
            <SponsorCard key={t} onClick={() => onSponsor(t)} tier={t} tone="yellow" size="md" tagline="track sponsor" />
          ))}
        </div>

        {/* SILVER x4 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {["Silver", "Hiring", "Education", "Developer Tools"].map((t) => (
            <SponsorCard key={t} onClick={() => onSponsor(t)} tier={t} tone="rose" size="sm" />
          ))}
        </div>

        {/* COMMUNITY pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">Community Partners →</span>
          {["GDG", "Microsoft Learn", "AWS Cloud", "GitHub", "Devfolio", "Postman", "Vercel", "MLH"].map((p) => (
            <button key={p} onClick={() => onSponsor("Community")} className="ink-border-sm rounded-full bg-cream px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-ink transition-all hover:-translate-y-0.5 hover:bg-orange hover:text-cream">
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-16 overflow-hidden border-y-2 border-ink bg-ink py-5 text-cream">
        <div className="flex animate-marquee-fast gap-12 whitespace-nowrap font-chunk text-2xl uppercase">
          {Array.from({ length: 2 }).flatMap((_, i) =>
            ["Build/Nashik", "★", "Team Nest", "✦", "Open Source", "◆", "AI India", "▲", "Startup Nashik", "✕"].map((t, j) => (
              <span key={`${i}-${j}`} className="shrink-0">{t}</span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function SponsorCard({ tier, tone, size, tagline, onClick }: { tier: string; tone: "orange" | "cobalt" | "yellow" | "rose"; size: "lg" | "md" | "sm"; tagline?: string; onClick: () => void }) {
  const tones = {
    orange: { bg: "bg-orange", text: "text-cream", chip: "bg-cream text-ink" },
    cobalt: { bg: "bg-cobalt", text: "text-cream", chip: "bg-cream text-ink" },
    yellow: { bg: "bg-cream", text: "text-ink", chip: "tag-yellow" },
    rose:   { bg: "bg-cream", text: "text-ink", chip: "bg-rose text-ink" },
  } as const;
  const h = size === "lg" ? "min-h-[170px]" : size === "md" ? "min-h-[130px]" : "min-h-[100px]";
  const label = size === "lg" ? "text-3xl md:text-4xl" : size === "md" ? "text-2xl" : "text-xl";
  const t = tones[tone];
  return (
    <button
      onClick={onClick}
      className={`ink-border group relative flex w-full ${h} flex-col items-start justify-between gap-3 overflow-hidden rounded-3xl ${t.bg} ${t.text} p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:rotate-[-0.6deg] hover:shadow-[10px_10px_0_0_var(--ink)]`}
    >
      <span className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${t.chip}`}>{tier} Partner</span>
      <div>
        <div className={`font-chunk uppercase leading-none ${label}`}>your brand</div>
        {tagline && <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest opacity-70">{tagline}</div>}
      </div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-80 transition-transform group-hover:translate-x-1">inquire →</div>
    </button>
  );
}


/* ============= why sponsor ============= */

function WhySponsor({ onSponsor }: { onSponsor: () => void }) {
  const benefits = ["Direct hiring access", "Brand visibility", "Developer engagement", "Product showcase", "Campus outreach", "Social media reach", "Community trust", "Startup ecosystem", "Speaking opportunities"];
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <SectionTag n="07">Why Sponsor</SectionTag>
      <div className="mt-6 grid gap-12 md:grid-cols-[1fr,1.2fr]">
        <h2 className="font-chunk text-5xl uppercase leading-[0.95] tracking-tight md:text-7xl">
          Partner with Nashik's next generation of <span className="tag-orange text-cream">builders.</span>
        </h2>
        <div>
          <p className="text-lg text-ink/75">
            Get unmatched visibility, recruit top talent and back the next wave of founders out of Nashik. Custom packages available.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <li key={b} className="ink-border-sm flex items-center gap-3 rounded-xl bg-cream p-4 text-sm">
                <span className="font-mono text-xs font-bold text-orange">0{i + 1}</span> {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={onSponsor} className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-orange px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">
              Become Sponsor →
            </button>
            <a href="mailto:team@buildwithnashik.in" className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink">
              Email Team Nest
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============= community ============= */

function Community() {
  const partners = ["Developer Community", "Student Chapters", "Tech Clubs", "AI Clubs", "GDG", "Microsoft Learn", "AWS Community", "GitHub Community"];
  return (
    <section id="community" className="border-y-2 border-ink bg-cobalt py-28 text-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="chip border-cream bg-cobalt text-cream">08 · Community</div>
        <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          Built by <span className="font-script normal-case text-yellow">community.</span>
        </h2>
        <p className="mt-6 max-w-2xl">
          Team Nest runs workshops, meetups, hackathons and open-source projects across Nashik. This is what we do every weekend — now scaled up.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {partners.map((p) => (
            <div key={p} className="ink-border-sm rounded-2xl bg-cream p-5 text-ink">
              <div className="font-chunk text-lg uppercase">{p}</div>
              <div className="mt-2 inline-block tag-orange px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest">Partner Soon</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============= team — featuring Ansh ============= */

function Team() {
  const core = [
    { n: "Prathman Tiwari", r: "Engineering · Builder" },
    { n: "Vedant Lokhande", r: "Operations" },
    { n: "Aaryan Singh", r: "Tech Lead" },
    { n: "Rupali Patil", r: "Community" },
    { n: "Nikhil Patil", r: "Partnerships" },
    { n: "Anurag Darshan", r: "Design" },
  ];

  return (
    <section id="team" className="mx-auto max-w-7xl px-6 py-28">
      <SectionTag n="09">Organizing Team</SectionTag>
      <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
        Meet the <span className="tag-orange text-cream">builders.</span>
      </h2>

      <div className="mt-16">
        {/* founder spotlight — Ansh (only main card) */}
        <div className="ink-border-lg relative overflow-hidden rounded-3xl bg-ink p-8 text-cream md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[auto,1fr]">
            <div className="relative shrink-0">
              <img
                src={anshAsset.url}
                alt="Ansh Rajore — Founder of Team Nest"
                className="ink-border-sm h-44 w-44 rounded-2xl border-2 border-cream object-cover md:h-56 md:w-56"
                loading="lazy"
              />
              <div className="absolute -left-3 -top-3 ink-border-sm tag-orange px-2 py-0.5 font-chunk text-[11px] uppercase tracking-tight" style={{ transform: "rotate(-6deg)" }}>
                5× winner
              </div>
            </div>
            <div className="min-w-0">
              <div className="chip bg-orange text-cream border-cream">Founder & Organizer</div>
              <h3 className="mt-3 font-chunk text-4xl uppercase leading-none tracking-tight md:text-6xl">Ansh Rajore</h3>
              <p className="font-script text-3xl text-orange">leading the charge</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="chip bg-cobalt text-cream border-cream">Team Nest</span>
                <span className="chip bg-yellow text-ink">SUNHACKS</span>
                <span className="chip bg-rose text-ink">Nashik</span>
              </div>
              <p className="mt-4 max-w-2xl text-sm text-cream/80 md:text-base">Organizer of SUNHACKS and the driving force behind Team Nest's community work in Nashik. Now bringing everything we've learned to Build With Nashik 2026.</p>
              <a href="#" className="ink-border-sm mt-5 inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">LinkedIn →</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-3">
        <span className="chip">Core Team</span>
        <span className="h-0.5 flex-1 bg-ink/15" />
      </div>

      {/* core crew */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {core.map((m, i) => (
          <div key={m.n} className="ink-border-sm group rounded-2xl bg-cream p-4 transition-transform hover:-translate-y-1" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.6}deg)` }}>
            <div className="ink-border-sm grid aspect-square w-full place-items-center rounded-xl bg-yellow font-display text-2xl uppercase text-ink transition-colors group-hover:bg-orange group-hover:text-cream">
              {m.n.split(" ").map((s) => s[0]).join("").slice(0, 2)}
            </div>
            <div className="mt-3 font-chunk text-base uppercase leading-tight">{m.n}</div>
            <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">{m.r}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============= venue ============= */

function Venue({ onSponsor }: { onSponsor: () => void }) {
  const items: Array<{ icon: string; t: string; sub: string; body: string; bullets?: string[]; cta?: { label: string; onClick?: () => void; href?: string } }> = [
    {
      icon: "📍", t: "Venue Partner", sub: "Announcement soon",
      body: "We're collaborating with leading universities, innovation hubs and premium venues across Nashik to host the best possible hackathon experience.",
      bullets: ["High-speed internet", "24×7 power backup", "Mentor & networking zones", "Stage & demo area"],
      cta: { label: "Become Venue Partner →", onClick: onSponsor },
    },
    {
      icon: "🏙", t: "Why Nashik?", sub: "Maharashtra's next tech hub",
      body: "Nashik is one of Maharashtra's fastest-growing tech and startup ecosystems — home to thousands of engineering students, manufacturing industries, and innovation-driven institutions.",
    },
    {
      icon: "🚆", t: "Travel Information", sub: "Easily reachable from all of India",
      body: "Designed to be accessible for participants travelling from across Maharashtra and India.",
      bullets: ["Nashik Road Railway Station", "Mumbai–Nashik Expressway", "State transport connectivity", "Nearby airport access"],
    },
    {
      icon: "🍽", t: "Participant Experience", sub: "Comfortable 36-hour stay",
      body: "Expect a thoughtfully planned experience throughout the hackathon.",
      bullets: ["Meals & midnight refreshments", "Coffee & beverages", "Networking lounge", "Quiet zones & first-aid"],
    },
    {
      icon: "🏨", t: "Stay & Accommodation", sub: "Help for outstation builders",
      body: "Accommodation support is currently being planned for participants travelling from outside Nashik.",
      bullets: ["Partner hotels", "Student accommodations", "Budget stays", "Shuttle (if available)"],
    },
    {
      icon: "🤝", t: "Partnership Opportunities", sub: "Build the ecosystem with us",
      body: "We're actively collaborating with organisations that want to support Nashik's growing developer ecosystem.",
      bullets: ["Venue · Tech · Cloud", "Community · Startup · Hiring", "Food · Media"],
      cta: { label: "Become a Partner →", onClick: onSponsor },
    },
    {
      icon: "📢", t: "Event Updates", sub: "Full guide drops with registrations",
      body: "Upcoming announcements: official venue, dates, registrations, prize pool, speakers, mentors, sponsors and community partners.",
      cta: { label: "Get Notified →", href: "#register" },
    },
  ];

  return (
    <section className="border-y-2 border-ink bg-rose py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTag n="10">Hosted in Nashik</SectionTag>
        <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          A city <span className="tag-cobalt text-cream">ready to build.</span>
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr,1fr]">
          {/* LEFT — sticky map / venue card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="ink-border-lg relative overflow-hidden rounded-3xl bg-cream">
              <div className="relative aspect-[5/4] w-full overflow-hidden bg-cream">
                <iframe
                  title="Nashik map"
                  className="absolute inset-0 h-full w-full grayscale"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=73.66%2C19.93%2C73.92%2C20.07&layer=mapnik&marker=20.0,73.78"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent" />
                <div className="pointer-events-none absolute left-4 top-4 ink-border-sm tag-orange px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">
                  Coordinates · 20.0°N 73.78°E
                </div>
              </div>
              <div className="p-6">
                <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">Event Location</div>
                <div className="mt-2 font-chunk text-4xl uppercase leading-none md:text-5xl">Nashik, Maharashtra</div>
                <p className="mt-2 font-script text-2xl text-orange">the future home of Build With Nashik</p>
                <p className="mt-3 text-ink/75">Our official venue will be revealed soon. We're finalising a location that can deliver an exceptional experience for builders, mentors, sponsors and the community.</p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {["High-speed Wi-Fi", "36-Hour Workspace", "Mentor Zones", "Networking Area", "Startup Booths", "Demo Stage", "Sponsor Zone", "Food Court"].map((f) => (
                    <div key={f} className="ink-border-sm rounded-lg bg-cream/70 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest">{f}</div>
                  ))}
                </div>

                <div className="mt-5 chip bg-yellow">Venue Reveal · Coming Soon</div>
              </div>
            </div>
          </div>

          {/* RIGHT — info stack */}
          <div className="space-y-4">
            {items.map((it) => (
              <article key={it.t} className="ink-border-sm group rounded-2xl bg-cream p-5 transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="ink-border-sm grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow text-2xl">{it.icon}</div>
                    <div>
                      <div className="font-chunk text-xl uppercase leading-none">{it.t}</div>
                      <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">{it.sub}</div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-ink/80">{it.body}</p>
                {it.bullets && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {it.bullets.map((b) => (
                      <li key={b} className="rounded-full border-2 border-ink/15 bg-cream px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/70">{b}</li>
                    ))}
                  </ul>
                )}
                {it.cta && (
                  it.cta.href ? (
                    <a href={it.cta.href} className="ink-border-sm mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">{it.cta.label}</a>
                  ) : (
                    <button onClick={it.cta.onClick} className="ink-border-sm mt-4 inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">{it.cta.label}</button>
                  )
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


/* ============= faq ============= */

function Faq() {
  const faqs: Array<[string, string]> = [
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
      <SectionTag n="11">FAQ</SectionTag>
      <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
        Asked & <span className="tag-orange text-cream">answered.</span>
      </h2>
      <div className="ink-border-sm mt-12 divide-y-2 divide-ink/10 overflow-hidden rounded-3xl bg-cream">
        {faqs.map(([q, a], i) => (
          <details key={q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-orange">/{String(i + 1).padStart(2, "0")}</span>
                <span className="font-chunk text-xl uppercase md:text-2xl">{q}</span>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink font-mono text-lg transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 max-w-2xl pl-10 text-ink/75">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ============= final cta ============= */

function FinalCta({ onRegister, onSponsor }: { onRegister: () => void; onSponsor: () => void }) {
  return (
    <section id="register" className="relative overflow-hidden border-t-2 border-ink bg-ink text-cream">
      <div className="relative mx-auto max-w-7xl px-6 py-32 text-center">
        <div className="chip bg-ink text-cream border-cream">Date · Announce Soon</div>
        <h2 className="mt-8 font-display text-7xl leading-[0.85] md:text-[15vw] lg:text-[200px]">
          READY TO <br /><span className="text-orange">BUILD?</span>
        </h2>
        <p className="font-script text-5xl text-yellow">one weekend in nashik.</p>
        <p className="mx-auto mt-6 max-w-xl text-lg opacity-80">
          36 hours of building. A community for life.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button onClick={onRegister} className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">
            Register →
          </button>
          <button onClick={onSponsor} className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-yellow px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink">
            Become Sponsor →
          </button>
          {[["Join Discord", "#"], ["Join WhatsApp", "#"], ["Become Volunteer", "#"]].map(([l, h]) => (
            <a key={l} href={h} className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink">
              {l} →
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============= footer ============= */

function Footer() {
  const cols = [
    { h: "Event", l: ["About", "Timeline", "Tracks", "Prizes", "FAQ"] },
    { h: "Partners", l: ["Sponsors", "Community", "Volunteer", "Mentors"] },
    { h: "Connect", l: ["Instagram", "LinkedIn", "GitHub", "Discord"] },
    { h: "Legal", l: ["Privacy", "Terms", "Code of Conduct"] },
  ];
  return (
    <footer className="bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr,2fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-ink font-display text-xl text-cream">B</span>
              <span className="font-chunk text-xl uppercase">Build/Nashik</span>
            </div>
            <p className="mt-4 max-w-sm text-ink/70">Nashik's largest community-driven developer hackathon. Built with care by Team Nest.</p>
            <div className="mt-6 chip">Nashik · Maharashtra · India</div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {cols.map((c) => (
              <div key={c.h}>
                <div className="font-mono text-xs font-bold uppercase tracking-widest text-orange">{c.h}</div>
                <ul className="mt-4 space-y-2">
                  {c.l.map((it) => (
                    <li key={it}><a href="#" className="text-sm text-ink/70 hover:text-ink">{it}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-8 font-mono text-xs font-bold uppercase tracking-widest text-ink/70">
          <span>© 2026 Team Nest</span>
          <span>Build · Ship · Win</span>
        </div>

        <div className="mt-16 overflow-hidden">
          <div className="font-display text-[26vw] leading-none tracking-tighter text-ink/5 select-none">BUILD/NASHIK</div>
        </div>
      </div>
    </footer>
  );
}

/* ============= cursor follower ============= */

function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = -100, y = -100, rx = -100, ry = -100;
    let raf = 0;

    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY; };
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x - 7}px, ${y - 7}px, 0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx - 24}px, ${ry - 24}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [role=button], summary, input, select, textarea, label");
      if (!dotRef.current || !ringRef.current) return;
      if (interactive) {
        dotRef.current.style.width = "8px";
        dotRef.current.style.height = "8px";
        ringRef.current.style.width = "64px";
        ringRef.current.style.height = "64px";
        ringRef.current.style.borderColor = "var(--orange)";
      } else {
        dotRef.current.style.width = "14px";
        dotRef.current.style.height = "14px";
        ringRef.current.style.width = "48px";
        ringRef.current.style.height = "48px";
        ringRef.current.style.borderColor = "var(--ink)";
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}

/* ============= legacy / community proof ============= */

function Legacy() {
  const events = [
    {
      title: "SUNHACKS",
      sub: "Asia's Largest GenAI Hackathon",
      role: "Organizer",
      year: "2024",
      tone: "orange",
      icon: "✦",
      image: sunhacksAsset.url,
      body: "Successfully organized one of Asia's largest GenAI hackathons — bringing developers, founders, students, mentors and industry experts together to build AI-powered solutions while creating one of the largest innovation communities of the year.",
      tags: ["Large-scale GenAI", "Industry Mentors", "Startup Ecosystem", "AI Builders", "National Reach"],
    },
    {
      title: "NASA Space Apps Challenge",
      sub: "Global Innovation Hackathon",
      role: "Participant",
      year: "2024",
      tone: "cobalt",
      icon: "★",
      image: null as string | null,
      body: "Participated in one of the world's largest global hackathons, collaborating with innovators across continents to solve real-world challenges inspired by space and Earth data.",
      tags: ["Global Innovation", "Team Collaboration", "Problem Solving", "International"],
    },
    {
      title: "Mumbai Tech Week",
      sub: "Job Fair · Founder Connect",
      role: "Community Contributor",
      year: "2025",
      tone: "yellow",
      icon: "◆",
      image: mtwAsset.url,
      body: "Connected with founders, startups, recruiters and developers while expanding opportunities for students through one of Maharashtra's leading technology events.",
      tags: ["Startup Networking", "Career Opportunities", "Founder Connections", "Developer Community"],
    },
  ];

  const stats: Array<[number, string, string]> = [
    [25, "+", "Community Events"],
    [12, "+", "Hackathons Organized & Joined"],
    [3000, "+", "Developers Connected"],
    [5000, "+", "Students Reached"],
    [40, "+", "Industry Mentors"],
    [20, "+", "Startup Collaborations"],
    [15, "+", "Workshops Conducted"],
    [10, "+", "Community Partners"],
  ];

  const milestones = [
    { y: "2023", t: "Participated in National Hackathons", d: "Cut our teeth across India's biggest builder stages." },
    { y: "2024", t: "Organized SUNHACKS", d: "Asia's largest GenAI hackathon — operations end-to-end." },
    { y: "2024", t: "Hosted Community Events", d: "Workshops, meetups and dev jams across Nashik." },
    { y: "2025", t: "Connected Students & Startups", d: "Mumbai Tech Week + founder office hours." },
    { y: "2025", t: "Expanded Team Nest", d: "From a small crew to a multi-city volunteer network." },
    { y: "2026", t: "Launching Build With Nashik", d: "The flagship — everything we've learned, applied." },
  ];

  const tones: Record<string, string> = {
    orange: "bg-orange text-cream",
    cobalt: "bg-cobalt text-cream",
    yellow: "bg-yellow text-ink",
  };

  return (
    <section id="legacy" className="border-y-2 border-ink bg-cream py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTag n="00">Community Legacy</SectionTag>
        <h2 className="mt-6 max-w-5xl font-chunk text-5xl uppercase leading-[0.95] tracking-tight md:text-7xl">
          We've been building the developer ecosystem <span className="tag-orange text-cream">before</span> Build With Nashik.
        </h2>
        <p className="mt-6 max-w-3xl text-lg text-ink/75">
          Build With Nashik is the result of years of organizing, collaborating and participating in some of India's most exciting technology communities. Every event shaped the vision behind creating Nashik's own flagship hackathon.
        </p>

        {/* event cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {events.map((e, i) => (
            <article key={e.title} className="ink-border-lg group relative flex flex-col overflow-hidden rounded-3xl bg-cream transition-transform hover:-translate-y-1.5">
              <div className={`relative h-48 ${tones[e.tone]} overflow-hidden`}>
                {e.image ? (
                  <>
                    <img src={e.image} alt={`${e.title} — Team Nest`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 opacity-20 mix-blend-multiply"
                    style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
                )}
                <div className="relative flex h-full items-end justify-between p-6 text-cream">
                  <div className={`font-display text-6xl leading-none ${e.image ? "drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]" : ""}`}>{e.icon}</div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-90">/0{i + 1}</div>
                    <div className="mt-1 font-chunk text-2xl uppercase">{e.year}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2">
                  <span className="chip">{e.role}</span>
                </div>
                <h3 className="mt-3 font-chunk text-3xl uppercase leading-none tracking-tight">{e.title}</h3>
                <div className="mt-1 font-script text-2xl text-orange">{e.sub}</div>
                <p className="mt-3 text-sm text-ink/75">{e.body}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <span key={t} className="rounded-full border-2 border-ink/15 bg-cream px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/70">{t}</span>
                  ))}
                </div>
                <button className="ink-border-sm mt-6 inline-flex items-center justify-between gap-2 self-start rounded-full bg-ink px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream transition-transform group-hover:-translate-y-0.5">
                  View Highlights <span>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* community impact stats */}
        <div className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-chunk text-3xl uppercase tracking-tight md:text-5xl">Community impact <span className="text-orange">/ so far.</span></h3>
            <p className="max-w-md text-sm text-ink/60">Numbers from events Team Nest has organized, joined or contributed to.</p>
          </div>
          <div className="ink-border-lg mt-6 grid grid-cols-2 overflow-hidden rounded-3xl bg-ink text-cream md:grid-cols-4">
            {stats.map(([v, s, l], i) => (
              <div key={l} className={`p-6 ${i < stats.length - 1 ? "border-r-2 border-cream/10" : ""} ${i < stats.length - (i % 4 === 3 ? 1 : (i >= stats.length - 4 ? 1 : 4)) ? "border-b-2 border-cream/10 md:border-b-0" : ""}`}>
                <div className="font-display text-4xl text-orange md:text-5xl"><Counter to={v} suffix={s} /></div>
                <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest opacity-80">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* community journey timeline */}
        <div className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-chunk text-3xl uppercase tracking-tight md:text-5xl">The journey <span className="font-script normal-case text-orange">so far.</span></h3>
            <p className="max-w-md text-sm text-ink/60">From small meetups to Asia's largest GenAI hackathon → and now, Build With Nashik.</p>
          </div>

          <div className="relative mt-8 overflow-x-auto pb-4">
            <div className="absolute left-0 right-0 top-[58px] h-1 bg-ink/15" />
            <div className="absolute left-0 top-[58px] h-1 bg-orange" style={{ width: "82%" }} />
            <ol className="flex min-w-max gap-4">
              {milestones.map((m, i) => (
                <li key={m.t} className="ink-border-sm relative w-64 shrink-0 rounded-2xl bg-cream p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">/{String(i + 1).padStart(2, "0")}</span>
                    <span className="chip">{m.y}</span>
                  </div>
                  <div className="mt-3 grid h-4 w-4 place-items-center rounded-full bg-orange ring-4 ring-cream" />
                  <div className="mt-3 font-chunk text-lg uppercase leading-tight">{m.t}</div>
                  <p className="mt-1 text-xs text-ink/70">{m.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="mx-auto mt-16 max-w-3xl text-center font-script text-3xl text-ink md:text-4xl">
          "Every event, every collaboration, and every builder we've met has led us here. Build With Nashik isn't where our journey starts — <span className="text-orange">it's where everything we've learned comes together.</span>"
        </p>
      </div>
    </section>
  );
}

/* ============= join team CTA ============= */

function JoinTeam() {
  return (
    <section className="relative overflow-hidden border-y-2 border-ink bg-yellow py-24">
      {/* sticker decorations */}
      <Sticker className="left-[6%] top-10" rot={-10}>♥</Sticker>
      <Sticker className="right-[8%] bottom-10" rot={8} color="cobalt">→</Sticker>

      <div
        className="absolute inset-0 -z-0 opacity-50"
        style={{ backgroundImage: "radial-gradient(var(--ink) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionTag n="09b">Join the Crew</SectionTag>
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.4fr,1fr]">
          <div>
            <h2 className="font-chunk text-5xl uppercase leading-[0.95] tracking-tight md:text-7xl">
              Want to build Nashik <span className="tag-orange text-cream">with us?</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-ink/80">
              Help organize one of Maharashtra's fastest-growing developer communities. Whether you're a designer, developer, marketer, photographer, content creator or community builder — there's a place for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#register" className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">Join Team →</a>
              <a href="#register" className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-orange px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">Become Volunteer →</a>
              <a href="#sponsors" className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink">Partner With Us →</a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { v: 50, s: "+", l: "Volunteers" },
              { v: 20, s: "+", l: "Partners" },
              { v: 500, s: "+", l: "Builders" },
            ].map((x) => (
              <div key={x.l} className="ink-border rounded-2xl bg-cream p-5 text-center">
                <div className="font-display text-4xl text-orange md:text-5xl"><Counter to={x.v} suffix={x.s} /></div>
                <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/70">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
