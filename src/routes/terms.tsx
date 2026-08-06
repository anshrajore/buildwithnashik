import { createFileRoute, Link } from "@tanstack/react-router";
import { NestHeader } from "@/components/NestHeader";
import nestLogo from "@/assets/nest-logo.png";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Brand Policy — Team Nest Nashik" },
      {
        name: "description",
        content:
          "Terms of use for the Team Nest platform and the official NEST logo & brand usage policy for partners, colleges and community organisers in Nashik.",
      },
      { property: "og:title", content: "Terms & Brand Policy — Team Nest" },
      { property: "og:description", content: "Terms of use and the official NEST logo & brand usage policy for partners and community organisers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS = [
  {
    n: "01",
    t: "Using this platform",
    body: [
      "Team Nest operates this website to run Build With Nashik, publish the community events board and support builders in Nashik. By using it you agree to submit accurate information and to keep your contact details reachable.",
      "You must be 13 or older to submit a form. If you register on behalf of a college, company or community, you confirm you are authorised to do so.",
    ],
  },
  {
    n: "02",
    t: "Event submissions",
    body: [
      "Anyone can submit an event to the Nest events board. Every submission is reviewed manually by the Nest crew before it goes live — approval is at our discretion and typically takes 2–5 working days.",
      "We may reject or unpublish an event that is misleading, paid-promotion disguised as community work, discriminatory, unsafe, or unrelated to technology and entrepreneurship. Organisers stay fully responsible for their own event, venue, safety and refunds.",
    ],
  },
  {
    n: "03",
    t: "Registrations & submissions",
    body: [
      "Team registration details, project submissions, mentor/judge applications and volunteer signups are used only to run the event and contact you about it. Team members can be changed once through the official member-change flow.",
      "Judging decisions, prize allocation and disqualification for plagiarism or rule-breaking are final.",
    ],
  },
  {
    n: "04",
    t: "Your data",
    body: [
      "We collect the fields you type into our forms plus files you upload (banners, decks, badge photos). Badge photos used in the digital swag builder are processed in your browser and never uploaded unless you save a design to your account.",
      "We do not sell your data. Data is stored on our managed cloud backend with row-level access rules so only Nest organisers can read submissions. Email teamnest.nashik@gmail.com to request deletion of your data.",
    ],
  },
  {
    n: "05",
    t: "Content & IP",
    body: [
      "You keep full ownership of your project, code and pitch. By participating you grant Team Nest a non-exclusive licence to show your team name, project title, photos and demo footage in recaps, social posts and sponsor reports.",
      "Everything on this site that belongs to Team Nest — copy, layout, illustrations, the NEST mark — stays ours.",
    ],
  },
];

const LOGO_DO = [
  "Use the official NEST lockup exactly as supplied, with clear space of at least the height of the “N” on all sides.",
  "Use the mark to credit Nest as an organiser, community partner, venue partner or sponsor of a real collaboration.",
  "Link the mark back to this website when used online.",
  "Use the transparent PNG on light backgrounds; use the light/knockout version on dark backgrounds.",
];

const LOGO_DONT = [
  "Don’t stretch, rotate, recolour, outline, add shadows/gradients, or rebuild the mark in another typeface.",
  "Don’t imply endorsement, partnership or affiliation that has not been agreed in writing.",
  "Don’t use the mark in your own product name, app icon, domain, or merchandise for sale.",
  "Don’t place the mark on busy imagery where it becomes illegible, or smaller than 24px in height.",
];

function TermsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden paper text-foreground antialiased">
      <NestHeader active="terms" />

      <section className="relative overflow-hidden border-b-2 border-ink py-16 md:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden">
          <div className="whitespace-nowrap text-center font-display text-[18vw] leading-[0.8] tracking-tight text-ink/[0.05]">POLICY</div>
        </div>
        <div className="relative mx-auto max-w-4xl px-6">
          <span className="chip"><span className="h-2 w-2 rounded-full bg-cobalt" /> Legal · Updated August 2026</span>
          <h1 className="mt-5 font-chunk text-5xl uppercase leading-[0.9] tracking-tight md:text-7xl">
            Terms & <span className="tag-orange text-cream">brand policy.</span>
          </h1>
          <p className="mt-5 max-w-2xl font-mono text-sm text-ink/70">
            The plain-English rules for using the Team Nest platform, submitting events, and putting the NEST logo on your website or poster.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-6">
          {SECTIONS.map((s) => (
            <article key={s.n} className="ink-border-sm rounded-2xl bg-white p-6">
              <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
                <span className="tag-orange px-2 py-0.5 text-cream">{s.n}</span>
                <span>{s.t}</span>
                <span className="h-0.5 flex-1 bg-ink/15" />
              </div>
              <div className="mt-4 grid gap-3">
                {s.body.map((p) => (
                  <p key={p} className="text-sm leading-relaxed text-ink/75">{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* LOGO POLICY */}
      <section id="logo" className="border-y-2 border-ink bg-ink py-16 text-cream md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cream/70">
            <span className="ink-border-sm rounded-md bg-orange px-2 py-0.5 text-cream">06</span>
            <span>NEST logo usage</span>
            <span className="h-0.5 flex-1 bg-cream/20" />
          </div>
          <h2 className="mt-6 font-chunk text-4xl uppercase leading-[0.95] tracking-tight md:text-6xl">
            Putting our mark on <span className="tag-orange text-cream">your site.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-cream/75 md:text-base">
            Partners, colleges and community organisers may use the NEST mark to credit a real collaboration. Anything beyond that needs written permission — one email is usually enough.
          </p>

          <div className="ink-border-sm mt-10 grid gap-6 rounded-2xl bg-cream p-6 text-ink md:grid-cols-[280px,1fr] md:items-center">
            <div className="ink-border-sm grid place-items-center rounded-xl bg-white p-5">
              <img src={nestLogo} alt="Official NEST logo lockup" className="h-auto w-full max-w-[220px]" />
            </div>
            <div>
              <div className="font-chunk text-2xl uppercase leading-tight">The official lockup</div>
              <p className="mt-2 text-sm text-ink/70">
                Wordmark + descriptor + tagline pill. Keep them together as one asset. Minimum height 24px on screen, 12mm in print.
              </p>
              <a
                href={nestLogo}
                download="nest-logo.png"
                className="ink-border-sm mt-4 inline-flex rounded-full bg-orange px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-cream"
              >
                ↓ Download PNG
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="ink-border-sm rounded-2xl bg-cream/[0.06] p-6">
              <div className="ink-border-sm inline-flex rounded-full bg-yellow px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">✓ Do</div>
              <ul className="mt-4 grid gap-3">
                {LOGO_DO.map((d) => (
                  <li key={d} className="flex gap-3 text-sm text-cream/85"><span className="text-yellow">▪</span>{d}</li>
                ))}
              </ul>
            </div>
            <div className="ink-border-sm rounded-2xl bg-cream/[0.06] p-6">
              <div className="ink-border-sm inline-flex rounded-full bg-rose px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">✕ Don’t</div>
              <ul className="mt-4 grid gap-3">
                {LOGO_DONT.map((d) => (
                  <li key={d} className="flex gap-3 text-sm text-cream/85"><span className="text-rose">▪</span>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ink-border-sm mt-8 rounded-2xl bg-orange p-6 text-cream">
            <div className="font-chunk text-2xl uppercase leading-tight">Need written permission?</div>
            <p className="mt-2 max-w-2xl text-sm text-cream/90">
              Tell us where the mark will appear, for how long, and what the collaboration is. We reply to brand requests within a week.
            </p>
            <a
              href="mailto:teamnest.nashik@gmail.com?subject=NEST%20logo%20usage%20request"
              className="ink-border-sm mt-4 inline-flex rounded-full bg-cream px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink"
            >
              teamnest.nashik@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-cream py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center">
          <img src={nestLogo} alt="Team Nest" className="h-12 w-auto" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/60">
            Team Nest · Nashik · Building the developer ecosystem since 2023
          </p>
          <div className="flex flex-wrap justify-center gap-4 font-mono text-[11px] font-bold uppercase tracking-widest">
            <Link to="/nest" className="hover:text-orange">Nest</Link>
            <Link to="/events" className="hover:text-orange">Events</Link>
            <Link to="/" className="hover:text-orange">BWN 2026</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
