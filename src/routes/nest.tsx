import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { NestHeader } from "@/components/NestHeader";
import anshAsset from "@/assets/ansh.png.asset.json";
import sunhacksAsset from "@/assets/sunhacks.png.asset.json";
import mtwAsset from "@/assets/mtw.jpeg.asset.json";

export const Route = createFileRoute("/nest")({
  head: () => ({
    meta: [
      { title: "Team Nest — Nashik's Developer Community" },
      { name: "description", content: "Team Nest is a builder-led developer community from Nashik, Maharashtra. Hackathons, workshops, meetups and the team behind Build With Nashik 2026." },
      { property: "og:title", content: "Team Nest — Nashik's Developer Community" },
      { property: "og:description", content: "Builder-led developer community from Nashik. Hackathons, workshops, meetups and the team behind Build With Nashik 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NestPage,
});

function NestPage() {
  const pillars = [
    { t: "Hackathons", d: "Multi-day builds where students ship real products under real pressure.", icon: "⚡", bg: "bg-orange text-cream" },
    { t: "Workshops", d: "Hands-on sessions on AI, web, systems and design — no slide-only theory.", icon: "🛠", bg: "bg-yellow text-ink" },
    { t: "Meetups", d: "Small rooms, honest conversations, builders meeting builders in person.", icon: "◎", bg: "bg-cobalt text-cream" },
    { t: "Open Source", d: "Sprints that push first pull requests from Nashik into real repos.", icon: "⌥", bg: "bg-rose text-ink" },
  ];

  const legacy = [
    { y: "08 / 2025", r: "Organizer", t: "SUNHACKS", d: "Flagship regional hackathon run end to end by the Nest crew.", img: sunhacksAsset.url },
    { y: "02 / 2025", r: "Participant", t: "NASA Space Apps", d: "Represented Nashik at the world's largest space hackathon.", img: null },
    { y: "03 / 2026", r: "Community Contributor", t: "Mumbai Tech Week", d: "On-ground community contribution at India's biggest tech week.", img: mtwAsset.url },
  ];

  const stats = [
    { k: "2023", v: "Founded in Nashik" },
    { k: "3000+", v: "Developers reached" },
    { k: "12+", v: "Events shipped" },
    { k: "1", v: "City we're rebuilding" },
  ];

  const core = [
    { n: "Ansh Rajore", r: "Founder · Organizer" },
    { n: "Prathman Tiwari", r: "Engineering · Builder" },
    { n: "Vedant Lokhande", r: "Operations" },
    { n: "Aaryan Singh", r: "Tech Lead" },
    { n: "Rupali Patil", r: "Community" },
    { n: "Nikhil Patil", r: "Partnerships" },
    { n: "Anurag Darshan", r: "Design" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden paper text-foreground antialiased">
      <Toaster position="top-center" theme="light" toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} />
      <NestHeader active="nest" />

      {/* HERO */}
      <section className="relative overflow-hidden border-b-2 border-ink py-24">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden">
          <div className="whitespace-nowrap text-center font-display text-[22vw] leading-[0.8] tracking-tight text-ink/[0.05]">NEST</div>
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="chip"><span className="h-2 w-2 rounded-full bg-orange" /> Nashik · Maharashtra · Since 2023</span>
          <h1 className="mt-6 font-chunk text-6xl uppercase leading-[0.88] tracking-tight md:text-8xl">
            We are <span className="tag-orange text-cream">Team Nest.</span>
          </h1>
          <p className="mt-4 font-script text-4xl text-orange md:text-5xl">a home for builders</p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-ink/75 md:text-lg">
            Team Nest is a student-and-builder-led developer community from Nashik. We run hackathons, workshops, meetups and open-source sprints — and we build the stage that Nashik's talent deserves.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5">
              Build With Nashik 2026 →
            </Link>
            <Link to="/events" className="ink-border-sm rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5">
              Events board
            </Link>
            <a href="mailto:teamnest.nashik@gmail.com" className="ink-border-sm rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream transition-transform hover:-translate-y-0.5">
              Work with us
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b-2 border-ink bg-ink py-12 text-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.v}>
              <div className="font-display text-4xl leading-none md:text-5xl">{s.k}</div>
              <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-cream/60">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em]">
          <span className="tag-orange px-2 py-0.5 text-cream">01</span><span>What we do</span><span className="h-0.5 flex-1 bg-ink" />
        </div>
        <h2 className="mt-6 font-chunk text-5xl uppercase leading-[0.95] tracking-tight md:text-7xl">
          Four ways we <span className="tag-orange text-cream">show up.</span>
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <div key={p.t} className="ink-border-sm rounded-2xl bg-white p-6 transition-transform hover:-translate-y-1" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.4}deg)` }}>
              <div className={`ink-border-sm grid h-14 w-14 place-items-center rounded-xl text-2xl ${p.bg}`}>{p.icon}</div>
              <div className="mt-4 font-chunk text-2xl uppercase leading-tight">{p.t}</div>
              <p className="mt-2 text-sm text-ink/70">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEGACY */}
      <section className="border-y-2 border-ink bg-cream py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em]">
            <span className="tag-orange px-2 py-0.5 text-cream">02</span><span>Track record</span><span className="h-0.5 flex-1 bg-ink" />
          </div>
          <h2 className="mt-6 font-chunk text-5xl uppercase leading-[0.95] tracking-tight md:text-7xl">
            Shipped, not <span className="tag-orange text-cream">promised.</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {legacy.map((l) => (
              <article key={l.t} className="ink-border-sm overflow-hidden rounded-2xl bg-white">
                <div className="relative aspect-[16/10] border-b-2 border-ink bg-cream">
                  {l.img ? (
                    <img src={l.img} alt={`${l.t} — Team Nest`} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-cobalt font-chunk text-3xl uppercase text-cream">NASA</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
                    <span className="ink-border-sm rounded-md bg-yellow px-2 py-0.5 text-ink">{l.y}</span>
                    <span className="text-ink/60">{l.r}</span>
                  </div>
                  <div className="mt-3 font-chunk text-2xl uppercase leading-tight">{l.t}</div>
                  <p className="mt-2 text-sm text-ink/70">{l.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em]">
          <span className="tag-orange px-2 py-0.5 text-cream">03</span><span>Founder</span><span className="h-0.5 flex-1 bg-ink" />
        </div>
        <div className="ink-border-lg mt-8 grid gap-6 overflow-hidden rounded-3xl bg-ink p-6 text-cream md:grid-cols-[1fr,260px] md:items-center md:p-8">
          <div>
            <span className="ink-border-sm rounded-full bg-orange px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-cream">Founder · Organizer</span>
            <h3 className="mt-4 font-chunk text-4xl uppercase leading-[0.9] tracking-tight md:text-5xl">Ansh Rajore.</h3>
            <p className="mt-3 max-w-xl text-sm text-cream/80 md:text-base">
              Organizer of SUNHACKS · 08/2025 and the driving force behind Team Nest's work in Nashik. Building in public, one event at a time.
            </p>
            <a href="https://www.linkedin.com/in/ansh-rajore/" target="_blank" rel="noopener noreferrer" className="ink-border-sm mt-5 inline-flex rounded-full bg-cream px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
              LinkedIn ↗
            </a>
          </div>
          <div className="ink-border-sm mx-auto w-full max-w-[260px] overflow-hidden rounded-2xl bg-cream">
            <div className="aspect-[4/5] w-full overflow-hidden bg-ink">
              <img src={anshAsset.url} alt="Portrait of Ansh Rajore, founder of Team Nest" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: "50% 20%" }} />
            </div>
          </div>
        </div>
      </section>

      {/* CREW */}
      <section className="border-t-2 border-ink bg-cream py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em]">
            <span className="tag-orange px-2 py-0.5 text-cream">04</span><span>The crew</span><span className="h-0.5 flex-1 bg-ink" />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {core.map((m, i) => (
              <div key={m.n} className="ink-border-sm rounded-2xl bg-white p-3" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.4}deg)` }}>
                <div className="ink-border-sm grid aspect-square place-items-center rounded-xl bg-yellow font-display text-2xl uppercase text-ink">
                  {m.n.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                <div className="mt-2 font-chunk text-sm uppercase leading-tight">{m.n}</div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink/60">{m.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y-2 border-ink bg-orange py-20 text-cream">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-chunk text-5xl uppercase leading-[0.9] tracking-tight md:text-6xl">Run something with us.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-cream/90 md:text-base">
            Colleges, communities, companies — if you want to put a builder event on the map in Nashik, Nest is your co-pilot.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/events" className="ink-border-sm rounded-full bg-cream px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink">
              Submit an event →
            </Link>
            <a href="mailto:teamnest.nashik@gmail.com" className="ink-border-sm rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">
              teamnest.nashik@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-ink py-10 text-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 text-center">
          <div className="font-chunk text-2xl uppercase tracking-tight">Team Nest · Nashik</div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-cream/60">Building the developer ecosystem since 2023</p>
        </div>
      </footer>
    </div>
  );
}
