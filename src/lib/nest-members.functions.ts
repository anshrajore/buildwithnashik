import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TRACKS = ["builder", "campus_lead", "volunteer", "mentor"] as const;

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

/* ---------------- member side ---------------- */

/** What the signed-in user is inside Nest: roles + member record + own application. */
export const getMyNestAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: roles }, { data: member }, { data: application }] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase.from("nest_members").select("*").eq("user_id", context.userId).maybeSingle(),
      context.supabase
        .from("nest_membership_applications")
        .select("*")
        .eq("submitted_by", context.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    return {
      userId: context.userId,
      email: (context.claims as any)?.email ?? null,
      roles: (roles ?? []).map((r: any) => r.role as string),
      member: member ?? null,
      application: application ?? null,
    };
  });

/* ---------------- admin side ---------------- */

export const listMembershipApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("nest_membership_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const listNestMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("nest_members")
      .select("*")
      .order("joined_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const reviewMembershipApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected"]),
        review_note: z.string().max(1000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("nest_membership_applications")
      .update({
        status: data.status,
        review_note: data.review_note ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Admin creates a member login (email + temporary password), assigns the track
 * role and creates the member record. Used for volunteer crew dashboards.
 */
export const createMemberLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        full_name: z.string().min(2).max(80),
        track: z.enum(TRACKS),
        title: z.string().max(120).optional().nullable(),
        temp_password: z.string().min(10).max(72),
        application_id: z.string().uuid().optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let userId: string | null = null;

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.temp_password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, nest_track: data.track },
    });

    if (createErr) {
      const msg = createErr.message ?? "";
      if (!/already/i.test(msg)) return { ok: false, code: "create_failed", message: msg };
      // Existing account: find it and reset the password instead.
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users?.find((u) => (u.email ?? "").toLowerCase() === data.email.toLowerCase());
      if (!found) return { ok: false, code: "not_found", message: "Account exists but could not be located." };
      userId = found.id;
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: data.temp_password,
        email_confirm: true,
      });
      if (updErr) return { ok: false, code: "update_failed", message: updErr.message };
    } else {
      userId = created.user?.id ?? null;
    }

    if (!userId) return { ok: false, code: "no_user" };

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.track as any }, { onConflict: "user_id,role" });
    if (roleErr) return { ok: false, code: "role_failed", message: roleErr.message };

    const { error: memErr } = await supabaseAdmin.from("nest_members").upsert(
      {
        user_id: userId,
        full_name: data.full_name,
        email: data.email,
        track: data.track,
        title: data.title ?? null,
        status: "active",
      },
      { onConflict: "user_id" },
    );
    if (memErr) return { ok: false, code: "member_failed", message: memErr.message };

    if (data.application_id) {
      await supabaseAdmin
        .from("nest_membership_applications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", data.application_id);
    }

    return { ok: true, user_id: userId };
  });

export const setMemberStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid(), status: z.enum(["active", "paused", "removed"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("nest_members")
      .update({ status: data.status })
      .eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
