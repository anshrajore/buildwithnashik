import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Anonymous page-view capture. Public on purpose — no data is returned. */
export const recordVisit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        site: z.enum(["bwn", "nest", "events", "swag", "other"]).default("other"),
        path: z.string().trim().min(1).max(300),
        referrer: z.string().trim().max(500).optional().nullable(),
        user_agent: z.string().trim().max(400).optional().nullable(),
        session_id: z.string().trim().max(80).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { publicSupabase } = await import("@/lib/ops.server");
    await publicSupabase()
      .from("site_visits")
      .insert({
        site: data.site,
        path: data.path,
        referrer: data.referrer ?? null,
        user_agent: data.user_agent ?? null,
        session_id: data.session_id ?? null,
      } as never);
    return { ok: true as const };
  });

/** Called after any sign-in so every account lands in the audience database. */
export const syncMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        full_name: z.string().trim().max(120).optional().nullable(),
        avatar_url: z.string().trim().max(1000).optional().nullable(),
        phone: z.string().trim().max(20).optional().nullable(),
        city: z.string().trim().max(80).optional().nullable(),
        signup_source: z.string().trim().max(60).optional().nullable(),
        provider: z.string().trim().max(40).optional().nullable(),
      })
      .partial()
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const claims = context.claims as { email?: string };
    const { error } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        email: claims.email ?? null,
        full_name: data.full_name ?? null,
        avatar_url: data.avatar_url ?? null,
        phone: data.phone ?? null,
        city: data.city ?? null,
        signup_source: data.signup_source ?? null,
        provider: data.provider ?? null,
        last_seen_at: new Date().toISOString(),
      } as never,
      { onConflict: "id" },
    );
    if (error) return { ok: false as const, message: "Could not save your profile." };
    return { ok: true as const };
  });

/** Staff-only audience report: who signed up and where traffic came from. */
export const getAudience = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profiles, error }, { data: visits }] = await Promise.all([
      context.supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(1000),
      context.supabase.from("site_visits").select("*").order("created_at", { ascending: false }).limit(2000),
    ]);
    if (error) throw new Error("Forbidden: staff access required for the audience report");
    return { profiles: profiles ?? [], visits: visits ?? [] };
  });
