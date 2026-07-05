import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  team_name: z.string().trim().min(2).max(80),
  lead_email: z.string().trim().email().max(255),
  lead_phone: z.string().trim().min(5).max(20),
  member_count: z.number().int().min(2).max(4),
  members: z.array(z.object({ name: z.string().trim().min(1).max(80) })).min(1).max(4),
});

export type ChangeMembersResult =
  | { ok: true; team_id: string }
  | { ok: false; code: string; message: string };

const normalizeDigits = (s: string) => s.replace(/\D/g, "");

export const requestMemberChange = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ChangeMembersResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: team, error } = await supabaseAdmin
      .from("teams")
      .select("id, lead_email, lead_phone, members_changed_at")
      .ilike("team_name", data.team_name)
      .maybeSingle();

    if (error) {
      return { ok: false, code: "server_error", message: "Could not process request." };
    }
    if (!team) {
      return { ok: false, code: "not_found", message: "No team with that name." };
    }
    if (
      team.lead_email.toLowerCase() !== data.lead_email.toLowerCase() ||
      normalizeDigits(team.lead_phone) !== normalizeDigits(data.lead_phone)
    ) {
      return { ok: false, code: "verify_failed", message: "Lead email or phone did not match." };
    }
    if (team.members_changed_at) {
      return { ok: false, code: "already_changed", message: "Members already updated once." };
    }

    const { error: updateError } = await supabaseAdmin
      .from("teams")
      .update({
        members: data.members,
        member_count: data.member_count,
        members_changed_at: new Date().toISOString(),
      })
      .eq("id", team.id)
      .is("members_changed_at", null);

    if (updateError) {
      return { ok: false, code: "server_error", message: "Update failed." };
    }
    return { ok: true, team_id: team.id };
  });
