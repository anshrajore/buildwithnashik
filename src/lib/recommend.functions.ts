import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Recommendation = {
  kind: "nest" | "community";
  id: string;
  name: string;
  slug: string | null;
  link: string | null;
  score: number;
  reason: string;
};

const OutputSchema = z.object({
  picks: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
      reason: z.string(),
    }),
  ),
});

export const recommendEvents = createServerFn({ method: "POST" })
  .inputValidator((input: { interests: string }) =>
    z.object({ interests: z.string().trim().min(3).max(600) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ picks: Recommendation[]; error: string | null }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { picks: [], error: "AI matchmaker isn't configured yet." };

    const { publicSupabase } = await import("@/lib/ops.server");
    const sb = publicSupabase();
    const today = new Date().toISOString().slice(0, 10);
    const [nestRes, commRes] = await Promise.all([
      sb
        .from("events")
        .select("id,slug,name,tagline,description,category,event_type,mode,city,start_at,end_at,participation_type")
        .in("status", ["published", "registration_closed"]),
      sb
        .from("community_events")
        .select("id,event_name,tagline,description,category,mode,city,start_date,end_date,register_url,website_url")
        .eq("status", "approved"),
    ]);

    type Item = { kind: "nest" | "community"; id: string; name: string; slug: string | null; link: string | null; text: string };
    const items: Item[] = [];
    for (const e of (nestRes.data ?? []) as Record<string, any>[]) {
      if (e.end_at && String(e.end_at).slice(0, 10) < today) continue;
      items.push({
        kind: "nest", id: e.id, name: e.name, slug: e.slug, link: null,
        text: `${e.name} | ${e.tagline ?? ""} | ${e.category ?? ""} ${e.event_type ?? ""} | ${e.mode ?? ""} ${e.city ?? ""} | ${e.start_at ?? ""} | ${e.participation_type ?? ""} | ${(e.description ?? "").slice(0, 300)}`,
      });
    }
    for (const e of (commRes.data ?? []) as Record<string, any>[]) {
      if ((e.end_date ?? e.start_date) && (e.end_date ?? e.start_date) < today) continue;
      items.push({
        kind: "community", id: e.id, name: e.event_name, slug: null, link: e.register_url || e.website_url || null,
        text: `${e.event_name} | ${e.tagline ?? ""} | ${e.category ?? ""} | ${e.mode ?? ""} ${e.city ?? ""} | ${e.start_date ?? ""} | ${(e.description ?? "").slice(0, 300)}`,
      });
    }
    if (items.length === 0) return { picks: [], error: "No upcoming events to match right now — check back soon." };

    const catalog = items.map((i) => `id=${i.id} :: ${i.text}`).join("\n");

    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        system:
          "You match student builders in Nashik, India to upcoming hackathons and community events. Only pick ids from the catalog. Return up to 4 picks, best first, score 0-100, and a one-sentence friendly reason addressed to the visitor (\"you\").",
        messages: [{ role: "user", content: `My interests: ${data.interests}\n\nCatalog:\n${catalog}` }],
        output: Output.object({ schema: OutputSchema }),
        maxRetries: 0,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const out = await result.output;
      const byId = new Map(items.map((i) => [i.id, i]));
      const picks: Recommendation[] = out.picks
        .filter((p) => byId.has(p.id))
        .map((p) => {
          const i = byId.get(p.id)!;
          return { kind: i.kind, id: i.id, name: i.name, slug: i.slug, link: i.link, score: Math.round(p.score), reason: p.reason };
        });
      return { picks, error: picks.length ? null : "Nothing matched closely — try describing different interests." };
    } catch (err: any) {
      const status = err?.statusCode ?? err?.status;
      console.error("[recommendEvents] gateway error", status, err?.message);
      if (status === 429) return { picks: [], error: "Too many requests right now — try again in a minute." };
      if (status === 402) return { picks: [], error: "AI credits have run out for this site. Please try later." };
      return { picks: [], error: "The matchmaker couldn't respond. Please try again shortly." };
    }
  });
