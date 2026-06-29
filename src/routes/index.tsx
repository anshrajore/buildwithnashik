import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import anshAsset from "@/assets/ansh.png.asset.json";
import towerAsset from "@/assets/clock-tower.png.asset.json";
import { RegisterDialog } from "@/components/RegisterDialog";
import { SponsorDialog } from "@/components/SponsorDialog";


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
      <JoinTeam />
      <Venue onSponsor={() => openSponsorFor("Venue")} />
      <Faq />
      <FinalCta onRegister={() => setOpenReg(true)} onSponsor={() => openSponsorFor()} />
      <Footer />

      <RegisterDialog open={openReg} onClose={() => setOpenReg(false)} />
      <SponsorDialog open={openSponsor} onClose={() => setOpenSponsor(false)} defaultTier={sponsorTier} />
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
  return (
    <section id="top" className="relative">
      {/* floating stickers */}
      <Sticker className="left-[6%] top-24" rot={-12}>⚡</Sticker>
      <Sticker className="right-[8%] top-36" rot={14} color="cobalt">★</Sticker>
      <Sticker className="left-[14%] bottom-40" rot={6} color="rose">36h</Sticker>
      <Sticker className="right-[12%] bottom-24" rot={-8} color="yellow">◆</Sticker>

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-24">
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip"><span className="h-2 w-2 rounded-full bg-orange animate-blink" /> Edition 01</span>
          <span className="chip bg-yellow">Date · Announce Soon</span>
          <span className="chip">By Team Nest · Nashik</span>
        </div>

        {/* Sticker-style wordmark */}
        <div className="relative mt-12 select-none">
          <div className="font-display text-[18vw] leading-[0.78] tracking-tight text-ink md:text-[15vw] lg:text-[210px]">
            <span className="block">BUILD</span>
          </div>
          <div className="-mt-6 flex items-end gap-4">
            <span className="font-script text-[14vw] leading-none text-orange md:text-[10vw] lg:text-[140px] animate-wiggle inline-block" style={{ transformOrigin: "center" }}>
              with
            </span>
            <span className="mb-2 hidden h-1 flex-1 bg-ink md:block" />
            <span className="mb-3 hidden font-mono text-xs font-bold uppercase tracking-widest text-ink md:inline">/ Hackathon 2026</span>
          </div>
          <div className="-mt-4 inline-block ink-border bg-ink px-4 pb-2 pt-1 text-cream">
            <span className="font-display text-[18vw] leading-[0.85] tracking-tight md:text-[15vw] lg:text-[210px]">NASHIK<span className="text-orange">.</span></span>
          </div>
        </div>

        <div className="mt-12 grid items-end gap-10 md:grid-cols-[1.4fr,1fr]">
          <p className="max-w-2xl font-sans text-xl text-ink/80 md:text-2xl">
            Nashik's largest community-driven hackathon. <span className="tag-yellow font-bold">36 hours</span> to build, ship and win — alongside <span className="tag-orange font-bold">500+ developers</span>, mentors and founders.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={onRegister} className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5">
              Register Now →
            </button>
            <button onClick={onSponsor} className="ink-border-sm inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5">
              Become Sponsor
            </button>
            <a href="#community" className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-cream">
              Join Community
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs font-bold uppercase tracking-widest">
          {["36 Hours", "Innovation", "Networking", "Building", "Learning", "Winning"].map((w, i) => (
            <span key={w} className="chip"><span className="text-orange">0{i + 1}</span> {w}</span>
          ))}
        </div>
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

/* ============= 3D scrolling timeline ============= */

function Timeline3D() {
  const steps = [
    { n: "01", t: "Registration Opens", s: "Coming Soon", c: "orange", icon: "▶" },
    { n: "02", t: "Idea Submission", s: "Coming Soon", c: "yellow", icon: "✎" },
    { n: "03", t: "Shortlisting", s: "Coming Soon", c: "cobalt", icon: "★" },
    { n: "04", t: "Hackathon Begins", s: "36 Hours · Live", c: "orange", icon: "⚡" },
    { n: "05", t: "Mentoring", s: "Expert Sessions", c: "rose", icon: "◆" },
    { n: "06", t: "Judging", s: "Panel Reviews", c: "cobalt", icon: "⚖" },
    { n: "07", t: "Winners Announced", s: "Reveal Stage", c: "orange", icon: "♛" },
    { n: "08", t: "Networking", s: "Founders Mixer", c: "yellow", icon: "✦" },
    { n: "09", t: "Aftermovie", s: "Coming Soon", c: "rose", icon: "▷" },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setActive(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [steps.length]);

  return (
    <section id="timeline" className="mx-auto max-w-7xl px-6 py-28">
      <SectionTag n="03">Timeline</SectionTag>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          The <span className="tag-cobalt text-cream">level path.</span>
        </h2>
        <p className="max-w-md text-ink/70">Scroll through 9 checkpoints. Hit start, ship a product, claim the trophy.</p>
      </div>

      {/* sticky stage with scroll-driven card stack */}
      <div ref={ref} className="relative mt-16" style={{ height: `${steps.length * 80}vh` }}>
        <div className="sticky top-20 perspective-stage">
          <div className="relative mx-auto h-[70vh] max-h-[640px] w-full max-w-3xl">
            {/* progress rail */}
            <div className="absolute -left-2 top-0 hidden h-full w-1 bg-ink md:block">
              <div className="w-full bg-orange transition-all duration-500" style={{ height: `${((active + 1) / steps.length) * 100}%` }} />
            </div>

            {steps.map((s, i) => {
              const offset = i - active;
              const visible = offset >= 0 && offset < 4;
              const colorMap: Record<string, string> = {
                orange: "bg-orange text-cream",
                yellow: "bg-yellow text-ink",
                cobalt: "bg-cobalt text-cream",
                rose: "bg-rose text-ink",
              };
              return (
                <article
                  key={s.n}
                  className="ink-border-lg tilt-card absolute inset-0 rounded-3xl bg-cream p-8 md:p-12"
                  style={{
                    transform: visible
                      ? `translate3d(0, ${offset * 18}px, ${-offset * 80}px) rotateX(${offset * -3}deg) scale(${1 - offset * 0.04})`
                      : offset < 0
                        ? `translate3d(-30%, -40%, 400px) rotate(-8deg)`
                        : `translate3d(0, 100%, -400px)`,
                    opacity: visible ? 1 : 0,
                    zIndex: 100 - i,
                    pointerEvents: offset === 0 ? "auto" : "none",
                    transition: "transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1), opacity 400ms ease",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">Checkpoint /{s.n}</div>
                    <div className={`ink-border-sm grid h-14 w-14 place-items-center rounded-2xl font-display text-2xl ${colorMap[s.c]}`}>{s.icon}</div>
                  </div>
                  <h3 className="mt-10 font-chunk text-5xl uppercase leading-none tracking-tight md:text-7xl">{s.t}</h3>
                  <div className="mt-4 inline-block tag-orange px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest">{s.s}</div>
                  <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                    <div className="h-full bg-ink transition-all duration-700" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-ink/60">
                    <span>{i + 1} of {steps.length}</span>
                    <span>Keep scrolling →</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============= tracks ============= */

function Tracks() {
  const tracks = [
    ["AI", "Agents, LLMs, copilots", "orange"],
    ["Healthcare", "Diagnostics, access, wellness", "cobalt"],
    ["Education", "Learning at scale", "rose"],
    ["Climate", "Sustainability tech", "yellow"],
    ["Agriculture", "Farm-to-fork stack", "orange"],
    ["FinTech", "Money, rails, access", "cobalt"],
    ["Cyber Security", "Defense & trust", "rose"],
    ["Web3", "Open protocols", "yellow"],
    ["Open Innovation", "Build anything", "orange"],
  ] as const;
  return (
    <section id="tracks" className="border-y-2 border-ink bg-cream py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTag n="04">Tracks</SectionTag>
        <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          Build the <span className="tag-orange text-cream">future.</span>
        </h2>
        <p className="mt-4 max-w-xl text-ink/70">Nine problem spaces. Pick yours. Final themes reveal soon.</p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map(([n, d, c], i) => {
            const map: Record<string, string> = {
              orange: "bg-orange text-cream",
              cobalt: "bg-cobalt text-cream",
              rose: "bg-rose text-ink",
              yellow: "bg-yellow text-ink",
            };
            return (
              <div key={n} className="ink-border group relative overflow-hidden rounded-3xl bg-cream p-6 transition-transform hover:-translate-y-1 hover:rotate-[-1deg]">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-ink/60">/0{i + 1}</span>
                  <span className="chip">Reveal Soon</span>
                </div>
                <div className={`mt-10 inline-block px-3 py-1 font-chunk text-3xl uppercase tracking-tight ${map[c]}`} style={{ transform: "rotate(-2deg)" }}>
                  {n}
                </div>
                <p className="mt-4 text-ink/70">{d}</p>
                <div className="mt-6 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
                  <span className="text-ink/60">Difficulty · Open</span>
                  <span className="text-orange transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
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
  const tiers = ["Title", "Gold", "Silver", "Community", "Education", "Hiring", "Cloud", "AI", "Developer Tools"];
  return (
    <section id="sponsors" className="border-y-2 border-ink bg-yellow py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTag n="06">Sponsors</SectionTag>
        <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          Powered by <span className="tag-cobalt text-cream">industry leaders.</span>
        </h2>
        <p className="mt-4 max-w-xl text-ink/80">Pick a tier and start a conversation. Every inquiry reaches Team Nest directly.</p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {tiers.map((t, i) => (
            <button
              key={t}
              onClick={() => onSponsor(t)}
              className="ink-border group flex h-36 flex-col items-center justify-center rounded-3xl bg-cream text-center transition-transform hover:-translate-y-1 hover:rotate-[-1deg]"
              style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}
            >
              <div className="font-chunk text-2xl uppercase">Your brand</div>
              <div className="mt-2 inline-block tag-orange px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest">{t} Partner</div>
              <div className="mt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">click to inquire →</div>
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
    { n: "Vedant Lokhande", r: "Core Team" },
    { n: "Aaryan Singh", r: "Core Team" },
    { n: "Rupali Patil", r: "Core Team" },
    { n: "Nikhil Patil", r: "Core Team" },
    { n: "Anurag Darshan", r: "Core Team" },
    { n: "More Soon", r: "Joining" },
  ];
  return (
    <section id="team" className="mx-auto max-w-7xl px-6 py-28">
      <SectionTag n="09">Organizing Team</SectionTag>
      <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
        Meet the <span className="tag-orange text-cream">builders.</span>
      </h2>

      <div className="mt-16 grid gap-6 md:grid-cols-[1.1fr,1.6fr]">
        {/* founder spotlight */}
        <div className="ink-border-lg relative overflow-hidden rounded-3xl bg-ink p-6 text-cream">
          <div className="chip bg-orange text-cream border-cream">Founder & Organizer</div>

          <div className="relative mt-6 overflow-hidden rounded-2xl border-2 border-cream bg-ink">
            <img
              src={anshAsset.url}
              alt="Ansh Rajore — Founder of Team Nest"
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
            />
            {/* sticker decorations on top of photo */}
            <div className="absolute -left-3 top-4 ink-border-sm tag-orange px-3 py-1 font-chunk text-lg uppercase tracking-tight" style={{ transform: "rotate(-6deg)" }}>
              5× hackathon winner
            </div>
            <div className="absolute -right-3 bottom-6 ink-border-sm bg-yellow px-3 py-1 font-chunk text-lg uppercase tracking-tight text-ink" style={{ transform: "rotate(4deg)" }}>
              builds in public
            </div>
            <div className="absolute left-4 bottom-4 ink-border-sm bg-cobalt px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream" style={{ transform: "rotate(-2deg)" }}>
              Founder · Team Nest
            </div>
          </div>

          <h3 className="mt-6 font-chunk text-5xl uppercase leading-none tracking-tight">Ansh Rajore</h3>
          <p className="font-script text-3xl text-orange">the one behind it all</p>
          <p className="mt-3 text-cream/80">Founder of Team Nest & NayaMarg. AI / full-stack builder shipping in Nashik. Believes a city is one good hackathon away from becoming an ecosystem.</p>
          <a href="#" className="ink-border-sm mt-6 inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-cream">
            LinkedIn →
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {core.map((m, i) => (
            <div key={m.n} className="ink-border-sm group rounded-2xl bg-cream p-5 transition-transform hover:-translate-y-1" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.6}deg)` }}>
              <div className="ink-border-sm aspect-square w-full place-items-center rounded-xl bg-yellow grid font-display text-3xl uppercase text-ink transition-colors group-hover:bg-orange group-hover:text-cream">
                {m.n.split(" ").map((s) => s[0]).join("").slice(0, 2)}
              </div>
              <div className="mt-4 font-chunk text-lg uppercase leading-tight">{m.n}</div>
              <div className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-ink/60">{m.r}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============= venue ============= */

function Venue() {
  const items = ["Hotels", "Railway", "Airport", "Parking", "Food", "Accommodation", "Directions", "Weather"];
  return (
    <section className="border-y-2 border-ink bg-rose py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTag n="10">Venue</SectionTag>
        <h2 className="mt-6 font-chunk text-6xl uppercase leading-[0.95] tracking-tight md:text-8xl">
          Hosted in <span className="tag-cobalt text-cream">Nashik.</span>
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="ink-border relative aspect-video overflow-hidden rounded-3xl bg-cream">
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-display text-7xl text-orange">📍</div>
                <div className="mt-2 font-chunk text-4xl uppercase">Nashik · MH</div>
                <div className="mt-2 chip">Venue · Announce Soon</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {items.map((it) => (
              <div key={it} className="ink-border-sm rounded-2xl bg-cream p-5">
                <div className="font-chunk text-lg uppercase">{it}</div>
                <div className="mt-1 font-mono text-xs font-bold uppercase tracking-widest text-ink/60">Coming Soon</div>
              </div>
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
