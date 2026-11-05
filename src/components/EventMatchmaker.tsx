import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { recommendEvents, type Recommendation } from "@/lib/recommend.functions";

const QUICK = ["AI/ML builder", "Beginner-friendly team hackathon", "Web & app dev", "In-person Nashik meetup", "Startup & pitching"];

export function EventMatchmaker() {
  const run = useServerFn(recommendEvents);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [picks, setPicks] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    if (text.trim().length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await run({ data: { interests: text } });
      setPicks(res.picks);
      setError(res.error);
    } catch {
      setError("The matchmaker couldn't respond. Please try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ink-border-sm mt-10 rounded-2xl bg-yellow p-6">
      <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/70">✦ AI event matchmaker</div>
      <h2 className="mt-1 font-chunk text-3xl uppercase tracking-tight">Tell us what you love building.</h2>
      <p className="mt-1 text-sm text-ink/75">Describe your skills and interests — we'll suggest the events that fit you best.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => setText((t) => (t ? `${t}, ${q}` : q))}
            className="ink-border-sm rounded-full bg-cream px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest"
          >
            + {q}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={600}
          rows={2}
          placeholder="e.g. 2nd-year student into React and AI, want a beginner-friendly team hackathon in Nashik"
          className="ink-border-sm w-full rounded-xl bg-white px-4 py-3 text-sm"
        />
        <button
          onClick={go}
          disabled={busy || text.trim().length < 3}
          className="ink-border-sm shrink-0 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-50"
        >
          {busy ? "Matching…" : "Find my events →"}
        </button>
      </div>
      {error && <p className="mt-4 font-mono text-xs font-bold text-ink">{error}</p>}
      {picks && picks.length > 0 && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {picks.map((p) => (
            <div key={p.id} className="ink-border-sm rounded-xl bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-chunk text-xl uppercase tracking-tight">{p.name}</h3>
                <span className="rounded-full bg-orange px-2.5 py-1 font-mono text-[10px] font-bold text-cream">{p.score}% fit</span>
              </div>
              <p className="mt-2 text-sm text-ink/75">{p.reason}</p>
              <div className="mt-3">
                {p.kind === "nest" && p.slug ? (
                  <Link to="/events/$slug" params={{ slug: p.slug }} className="font-mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                    View event →
                  </Link>
                ) : p.link ? (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] font-bold uppercase tracking-widest text-cobalt">
                    Open event ↗
                  </a>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">Listed on the community board below</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
