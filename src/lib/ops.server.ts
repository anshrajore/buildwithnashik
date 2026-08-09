import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Server-only Supabase client using the publishable key (anon RLS). */
export function publicSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export function correlationId(prefix = "AUD") {
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

type AuditInput = {
  action: string;
  entity_type: string;
  entity_id?: string | null;
  actor_id?: string | null;
  actor_email?: string | null;
  actor_role?: string | null;
  previous_value?: unknown;
  new_value?: unknown;
  metadata?: Record<string, unknown>;
};

/** Immutable audit trail. Never throws into the caller's flow. */
export async function writeAudit(input: AuditInput): Promise<string> {
  const id = correlationId();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      correlation_id: id,
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,
      actor_id: input.actor_id ?? null,
      actor_email: input.actor_email ?? null,
      actor_role: input.actor_role ?? null,
      previous_value: (input.previous_value ?? null) as never,
      new_value: (input.new_value ?? null) as never,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch (error) {
    console.error(`[audit ${id}] failed to record ${input.action}`, error);
  }
  return id;
}

export type QueuedEmail = {
  event_id: string;
  registration_id?: string | null;
  template: string;
  subject: string;
  body: string;
  recipient_email: string;
  sent_by?: string | null;
};

/**
 * Records outbound participant emails. Delivery is handled by the project's
 * email infrastructure once a sender domain is verified; until then rows stay
 * queued and are visible in the organiser's communication history.
 */
export async function queueEmails(rows: QueuedEmail[]) {
  if (!rows.length) return { queued: 0 };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("event_email_log")
    .insert(rows.map((r) => ({ ...r, status: "queued" as const })));
  if (error) {
    console.error("[email] queue failed", error);
    return { queued: 0, error: "Could not queue emails" };
  }
  return { queued: rows.length };
}
