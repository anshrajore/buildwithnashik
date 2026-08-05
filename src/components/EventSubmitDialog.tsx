import { useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  "Hackathon",
  "Workshop",
  "Meetup",
  "Conference",
  "Bootcamp",
  "Ideathon",
  "Open Source Sprint",
  "Startup / Pitch Day",
  "Career / Hiring",
  "Other",
];

const urlish = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/.+\..+/.test(v), "Links must start with http:// or https://")
  .optional()
  .or(z.literal(""));

const schema = z.object({
  event_name: z.string().trim().min(2, "Event name is too short").max(120),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().min(20, "Tell us a bit more (20+ chars)").max(3000),
  category: z.string().min(2, "Pick a category"),
  mode: z.enum(["offline", "online", "hybrid"]),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  venue: z.string().trim().max(200).optional().or(z.literal("")),
  maps_url: urlish,
  team_min: z.coerce.number().int().min(1).max(50),
  team_max: z.coerce.number().int().min(1).max(50),
  organiser_name: z.string().trim().min(2).max(80),
  organiser_email: z.string().trim().email("Enter a valid email").max(255),
  organiser_phone: z.string().trim().min(5).max(20),
  organisation: z.string().trim().max(120).optional().or(z.literal("")),
  website_url: urlish,
  register_url: urlish,
});

type Social = { label: string; url: string };

export function EventSubmitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [mapsUrl, setMapsUrl] = useState("");
  const [venueQuery, setVenueQuery] = useState("");
  const [socials, setSocials] = useState<Social[]>([{ label: "Website", url: "" }]);
  const fileRef = useRef<HTMLInputElement>(null);

  const mapEmbed = useMemo(() => {
    const q = venueQuery.trim();
    if (!q) return null;
    return `https://www.openstreetmap.org/export/embed.html?bbox=73.55,19.90,73.95,20.10&layer=mapnik&marker=20.0,73.78&query=${encodeURIComponent(q)}`;
  }, [venueQuery]);

  if (!open) return null;

  function pickBanner(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Banner must be an image"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Banner too large (max 5MB)"); return; }
    setBanner(f);
    setBannerPreview(URL.createObjectURL(f));
  }

  async function uploadBanner(): Promise<string | null> {
    if (!banner) return null;
    const ext = banner.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `submissions/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("event-banners").upload(path, banner, {
      cacheControl: "3600",
      upsert: false,
      contentType: banner.type,
    });
    if (error) {
      toast.error("Banner upload failed — submitting without it.");
      return null;
    }
    const { data } = await supabase.storage.from("event-banners").createSignedUrl(path, 60 * 60 * 24 * 365);
    return data?.signedUrl ?? null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    const d = parsed.data;
    if (d.team_max < d.team_min) {
      toast.error("Max team size must be greater than min");
      return;
    }
    setSubmitting(true);
    const banner_url = await uploadBanner();
    const cleanSocials = socials
      .filter((s) => s.url.trim() && /^https?:\/\/.+\..+/.test(s.url.trim()))
      .slice(0, 6)
      .map((s) => ({ label: s.label.trim().slice(0, 40) || "Link", url: s.url.trim().slice(0, 500) }));

    const { error } = await supabase.from("community_events").insert({
      event_name: d.event_name,
      tagline: d.tagline || null,
      description: d.description,
      category: d.category,
      mode: d.mode,
      banner_url,
      start_date: d.start_date || null,
      end_date: d.end_date || null,
      city: d.city || null,
      venue: d.venue || null,
      maps_url: d.maps_url || null,
      team_min: d.team_min,
      team_max: d.team_max,
      organiser_name: d.organiser_name,
      organiser_email: d.organiser_email,
      organiser_phone: d.organiser_phone,
      organisation: d.organisation || null,
      website_url: d.website_url || null,
      register_url: d.register_url || null,
      socials: cleanSocials,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit your event. Try again in a moment.");
      return;
    }
    setDone(true);
    toast.success("Event submitted — Team Nest will review it.");
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-start justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg relative my-6 w-full max-w-3xl overflow-hidden rounded-2xl bg-cream">
        <div className="flex items-center justify-between gap-4 border-b-2 border-ink bg-cobalt px-6 py-4 text-cream">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest opacity-80">Nest Events Board</div>
            <div className="font-chunk text-3xl uppercase tracking-tight">Submit your event</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-cream font-bold">✕</button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="font-script text-6xl text-orange">Submitted!</div>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
              Team Nest reviews every submission before it goes live on the events board. We'll email the organiser once it's published.
            </p>
            <button onClick={onClose} className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">
              Back to events
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-5 p-6">
            {/* banner */}
            <section className="ink-border-sm rounded-2xl bg-white p-4">
              <Legend n="01">Event banner</Legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-[220px,1fr] sm:items-center">
                <div className="ink-border-sm grid aspect-[16/9] w-full place-items-center overflow-hidden rounded-xl bg-cream">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Event banner preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-3 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40">16:9 banner</span>
                  )}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="ink-border-sm rounded-full bg-ink px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-cream">
                    ↑ Upload banner
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickBanner(e.target.files?.[0] || null)} />
                  <p className="mt-2 font-mono text-[10px] text-ink/50">PNG / JPG · up to 5MB · 1600×900 recommended</p>
                </div>
              </div>
            </section>

            {/* basics */}
            <section className="ink-border-sm rounded-2xl bg-white p-4">
              <Legend n="02">The basics</Legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <EField label="Event name" name="event_name" required placeholder="Build With Nashik 2026" />
                <EField label="Tagline" name="tagline" placeholder="36 hours. One city. Infinite builds." />
                <div>
                  <Label>Category <Req /></Label>
                  <select name="category" required defaultValue="" className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans">
                    <option value="">Pick one…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Mode <Req /></Label>
                  <select name="mode" required defaultValue="offline" className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans">
                    <option value="offline">Offline / in-person</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <EField label="Start date" name="start_date" type="date" />
                <EField label="End date" name="end_date" type="date" />
                <div className="sm:col-span-2">
                  <Label>About the event <Req /></Label>
                  <textarea name="description" rows={4} maxLength={3000} required placeholder="What's happening, who it's for, what builders walk away with…" className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans" />
                </div>
              </div>
            </section>

            {/* team size */}
            <section className="ink-border-sm rounded-2xl bg-white p-4">
              <Legend n="03">Team size</Legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <EField label="Min team size" name="team_min" type="number" defaultValue="1" required />
                <EField label="Max team size" name="team_max" type="number" defaultValue="4" required />
              </div>
            </section>

            {/* location */}
            <section className="ink-border-sm rounded-2xl bg-white p-4">
              <Legend n="04">Location</Legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <EField label="City" name="city" placeholder="Nashik" onValue={setVenueQuery} />
                <EField label="Venue" name="venue" placeholder="Kalidas Kala Mandir" />
                <div className="sm:col-span-2">
                  <Label>Google Maps link</Label>
                  <input
                    name="maps_url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/…"
                    className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans"
                  />
                  <p className="mt-1 font-mono text-[10px] text-ink/50">Paste the share link from Google Maps — attendees get one-tap directions.</p>
                </div>
                {mapEmbed && (
                  <div className="ink-border-sm sm:col-span-2 overflow-hidden rounded-xl">
                    <iframe title="Map preview" src={mapEmbed} className="h-52 w-full" loading="lazy" />
                  </div>
                )}
              </div>
            </section>

            {/* organiser */}
            <section className="ink-border-sm rounded-2xl bg-white p-4">
              <Legend n="05">Organiser contact</Legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <EField label="Organiser name" name="organiser_name" required />
                <EField label="Organisation / community" name="organisation" placeholder="Team Nest" />
                <EField label="Email" name="organiser_email" type="email" required />
                <EField label="Phone" name="organiser_phone" required placeholder="+91…" />
              </div>
            </section>

            {/* links */}
            <section className="ink-border-sm rounded-2xl bg-white p-4">
              <Legend n="06">Links & socials</Legend>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <EField label="Event website" name="website_url" placeholder="https://yourevent.com" />
                <EField label="Registration link" name="register_url" placeholder="https://forms.gle/…" />
              </div>
              <div className="mt-4 grid gap-2">
                {socials.map((s, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[160px,1fr,auto]">
                    <input
                      value={s.label}
                      onChange={(e) => setSocials((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value.slice(0, 40) } : x)))}
                      placeholder="Instagram"
                      className="ink-border-sm rounded-lg bg-cream px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest"
                    />
                    <input
                      value={s.url}
                      onChange={(e) => setSocials((p) => p.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                      placeholder="https://instagram.com/…"
                      className="ink-border-sm rounded-lg bg-cream px-3 py-2 font-sans text-sm"
                    />
                    <button type="button" onClick={() => setSocials((p) => p.filter((_, j) => j !== i))} className="ink-border-sm rounded-lg bg-cream px-3 py-2 font-mono text-[11px] font-bold">✕</button>
                  </div>
                ))}
                {socials.length < 6 && (
                  <button type="button" onClick={() => setSocials((p) => [...p, { label: "", url: "" }])} className="ink-border-sm w-fit rounded-full bg-yellow px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
                    + Add another link
                  </button>
                )}
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-sm text-xs text-muted-foreground">Every event is reviewed by Team Nest before it appears on the board.</p>
              <button disabled={submitting} className="ink-border-sm rounded-full bg-orange px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit event →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Legend({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
      <span className="tag-orange px-2 py-0.5 text-cream">{n}</span>
      <span>{children}</span>
      <span className="h-0.5 flex-1 bg-ink/15" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-widest">{children}</label>;
}

function Req() {
  return <span className="text-orange"> *</span>;
}

function EField({ label, name, type = "text", required, placeholder, defaultValue, onValue }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string;
  onValue?: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}{required && <Req />}</Label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={onValue ? (e) => onValue(e.target.value) : undefined}
        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-orange"
      />
    </div>
  );
}
