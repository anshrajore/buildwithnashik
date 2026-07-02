import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TIERS = ["Title", "Powered By", "Platinum", "Gold", "Silver", "Cloud", "AI", "Education", "Hiring", "Developer Tools", "Community", "Venue", "Food & Beverage", "Travel", "Media", "Swag"];

const schema = z.object({
  company_name: z.string().trim().min(2).max(120),
  contact_name: z.string().trim().min(2).max(80),
  contact_email: z.string().trim().email().max(255),
  contact_phone: z.string().trim().max(20).optional().or(z.literal("")),
  tier: z.string().min(1),
  website: z.string().trim().max(255).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export function SponsorDialog({ open, onClose, defaultTier }: { open: boolean; onClose: () => void; defaultTier?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("sponsor_inquiries").insert({
      company_name: parsed.data.company_name,
      contact_name: parsed.data.contact_name,
      contact_email: parsed.data.contact_email,
      contact_phone: parsed.data.contact_phone || null,
      tier: parsed.data.tier,
      website: parsed.data.website || null,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Try again in a moment.");
      return;
    }
    setDone(true);
    toast.success("Inquiry sent. Team Nest will reach out.");
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="ink-border-lg relative w-full max-w-xl overflow-hidden rounded-2xl bg-cream">
        <div className="flex items-center justify-between border-b-2 border-ink bg-cobalt px-6 py-4 text-cream">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest opacity-80">Partner with Build/Nashik</div>
            <div className="font-chunk text-3xl uppercase tracking-tight">Sponsor inquiry</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border-2 border-cream font-bold">✕</button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="font-script text-7xl text-cobalt">Thank you!</div>
            <p className="mt-4 text-muted-foreground">Your inquiry just landed with Team Nest. Expect a reply with our full deck within 48 hours.</p>
            <button onClick={onClose} className="ink-border-sm mt-8 rounded-full bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream">Back to site</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <SField className="sm:col-span-2" label="Company / brand" name="company_name" required />
            <SField label="Contact name" name="contact_name" required />
            <SField label="Contact email" name="contact_email" type="email" required />
            <SField label="Contact phone" name="contact_phone" />
            <SField label="Website" name="website" placeholder="https://" />

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">Tier of interest <span className="text-orange">*</span></label>
              <select name="tier" required defaultValue={defaultTier ?? ""} className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans">
                <option value="">Choose tier…</option>
                {TIERS.map((t) => <option key={t} value={t}>{t} Partner</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">Message (optional)</label>
              <textarea name="message" rows={3} maxLength={1000} className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans" placeholder="Tell us what you're hoping to get from the partnership." />
            </div>

            <div className="sm:col-span-2 mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">We'll reply within 48 hours with a deck and call link.</p>
              <button disabled={submitting} className="ink-border-sm rounded-full bg-cobalt px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-cream disabled:opacity-60">
                {submitting ? "Sending…" : "Send inquiry →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SField({ label, name, type = "text", required, placeholder, className = "" }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest">{label}{required && <span className="text-orange"> *</span>}</label>
      <input name={name} type={type} required={required} placeholder={placeholder}
        className="ink-border-sm w-full rounded-lg bg-cream px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-cobalt" />
    </div>
  );
}
