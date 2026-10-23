import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Where should this signed-in user land? Admin → admin console, organizer → their events, else the hub. */
export const getMyWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: roles }, { data: events }, { data: coOrg }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("events").select("id,owner_id"),
      supabase.from("event_organizers").select("event_id").eq("user_id", userId),
    ]);
    const roleList = (roles ?? []).map((r) => r.role as string);
    if (roleList.includes("admin")) return { path: "/admin" };
    const coOrgIds = new Set((coOrg ?? []).map((o) => o.event_id as string));
    const isOrganizer = (events ?? []).some((e) => e.owner_id === userId || coOrgIds.has(e.id));
    if (isOrganizer) return { path: "/organizer" };
    return { path: "/dashboard" };
  });

/** Every event this organizer owns or co-organizes, with registration roll-ups. */
export const listMyEventSummaries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: events }, { data: coOrg }] = await Promise.all([
      supabase
        .from("events")
        .select(
          "id,name,code,slug,status,category,mode,city,start_at,end_at,registration_opens_at,registration_closes_at,participation_type,team_min,team_max,capacity,owner_id,created_at",
        )
        .order("created_at", { ascending: false }),
      supabase.from("event_organizers").select("event_id,permissions").eq("user_id", userId),
    ]);
    const coMap = new Map((coOrg ?? []).map((o) => [o.event_id as string, o.permissions ?? []]));
    const mine = (events ?? []).filter(
      (e: Record<string, any>) => e.owner_id === userId || coMap.has(e.id),
    );

    const summaries = await Promise.all(
      mine.map(async (e: Record<string, any>) => {
        const count = (extra?: { eq?: [string, string]; in?: [string, string[]] }) => {
          let q = supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", e.id);
          if (extra?.eq) q = q.eq(extra.eq[0], extra.eq[1]);
          if (extra?.in) q = q.in(extra.in[0], extra.in[1]);
          return q;
        };
        const [total, pending, shortlisted, rounds] = await Promise.all([
          count(),
          count({ eq: ["status", "submitted"] }),
          count({ in: ["status", ["shortlisted", "advanced", "finalist", "selected", "completed"]] }),
          supabase.from("event_rounds").select("id", { count: "exact", head: true }).eq("event_id", e.id),
        ]);
        const isOwner = e.owner_id === userId;
        return {
          ...e,
          is_owner: isOwner,
          permissions: isOwner ? ["full_access"] : (coMap.get(e.id) ?? []),
          total_registrations: total.count ?? 0,
          pending_registrations: pending.count ?? 0,
          shortlisted_registrations: shortlisted.count ?? 0,
          round_count: rounds.count ?? 0,
        };
      }),
    );

    return { rows: summaries, userId };
  });
