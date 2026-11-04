import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export type UserAccountRow = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  roles: string[];
};

/** Admin-only: all accounts with their roles, for the Users tab. */
export const listUserAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const users: Array<{
      id: string;
      email: string | null;
      created_at: string | null;
      last_sign_in_at: string | null;
    }> = [];
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const list = data?.users ?? [];
      users.push(
        ...list.map((u) => ({
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at ?? null,
          last_sign_in_at: u.last_sign_in_at ?? null,
        })),
      );
      if (list.length < 200) break;
    }

    const [{ data: roles }, { data: profiles }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id,role"),
      supabaseAdmin.from("profiles").select("id,email,full_name"),
    ]);
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r: { user_id: string; role: string }) => {
      const list = roleMap.get(r.user_id) ?? [];
      list.push(r.role);
      roleMap.set(r.user_id, list);
    });
    const profileMap = new Map((profiles ?? []).map((p: { id: string; full_name?: string | null }) => [p.id, p.full_name ?? null]));

    const rows: UserAccountRow[] = users
      .map((u) => ({
        id: u.id,
        email: u.email ?? "",
        full_name: (profileMap.get(u.id) as string | null) ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        roles: (roleMap.get(u.id) ?? []).sort(),
      }))
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));

    return { rows, userId: context.userId };
  });

/** Admin-only: grant or revoke the admin role on an account. Self-changes are blocked. */
export const setUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        user_id: z.string().uuid(),
        grant: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.user_id === context.userId) {
      return { ok: false, code: "self_change", message: "You cannot change your own admin access here." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve names/emails first so the audit entry records who did what to whom.
    const [{ data: target }, { data: actor }] = await Promise.all([
      supabaseAdmin.from("profiles").select("email,full_name").eq("id", data.user_id).maybeSingle(),
      supabaseAdmin.from("profiles").select("email,full_name").eq("id", context.userId).maybeSingle(),
    ]);
    let targetEmail = target?.email ?? null;
    let targetName = target?.full_name ?? null;
    if (!targetEmail) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
      targetEmail = authUser?.user?.email ?? null;
    }

    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: "admin" as any }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", "admin");
      if (error) throw new Error(error.message);
    }

    // Audit trail: who granted / revoked admin access, to whom, and when.
    const { writeAudit } = await import("@/lib/ops.server");
    await writeAudit({
      action: data.grant ? "admin_access_granted" : "admin_access_revoked",
      entity_type: "user_account",
      entity_id: data.user_id,
      actor_id: context.userId,
      actor_email: actor?.email ?? null,
      actor_role: "admin",
      previous_value: { role: "admin", granted: !data.grant },
      new_value: { role: "admin", granted: data.grant },
      metadata: {
        target_email: target?.email ?? null,
        target_name: target?.full_name ?? null,
      },
    });

    return { ok: true };
  });

export type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  previous_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
};

const AUDIT_PAGE_SIZE = 25;

/** Admin-only: audit trail, optionally narrowed to one action, newest first. */
export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        action: z.string().optional(),
        page: z.number().int().min(0).default(0),
      })
      .default({ page: 0 })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(data.page * AUDIT_PAGE_SIZE, data.page * AUDIT_PAGE_SIZE + AUDIT_PAGE_SIZE - 1);
    if (data.action) query = query.eq("action", data.action);

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as AuditRow[], total: count ?? 0, page: data.page, pageSize: AUDIT_PAGE_SIZE };
  });
