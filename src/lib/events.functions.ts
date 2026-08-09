import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ============================ public reads ============================ */

const PUBLIC_EVENT_COLUMNS =
  "id,slug,code,name,tagline,description,banner_url,category,event_type,mode,city,venue,maps_url,online_url,start_at,end_at,registration_opens_at,registration_closes_at,website_url,register_url,links,faqs,contact_name,contact_email,contact_phone,participation_type,team_min,team_max,team_name_required,capacity,eligibility,college_restriction,required_participant_fields,required_documents,custom_questions,highlights,stats,status,published_at";

export const listPublishedEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { publicSupabase } = await import("@/lib/ops.server");
  const { data, error } = await publicSupabase()
    .from("events")
    .select(PUBLIC_EVENT_COLUMNS)
    .in("status", ["published", "registration_closed", "completed"])
    .order("start_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error("Could not load events");
  return { rows: data ?? [] };
});

export const getPublicEvent = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(90) }).parse(input))
  .handler(async ({ data }) => {
    const { publicSupabase } = await import("@/lib/ops.server");
    const client = publicSupabase();
    const { data: event, error } = await client
      .from("events")
      .select(PUBLIC_EVENT_COLUMNS)
      .eq("slug", data.slug)
      .in("status", ["published", "registration_closed", "completed"])
      .maybeSingle();
    if (error) throw new Error("Could not load this event");
    if (!event) return { event: null, rounds: [], registrationCount: 0 };

    const [{ data: rounds }, { count }] = await Promise.all([
      client
        .from("event_rounds")
        .select("id,position,name,round_type,description,starts_at,ends_at,submission_deadline,submission_requirements,is_enabled,submissions_open")
        .eq("event_id", event.id)
        .eq("is_enabled", true)
        .order("position", { ascending: true }),
      client.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", event.id),
    ]);
    return { event, rounds: rounds ?? [], registrationCount: count ?? 0 };
  });

/* ============================ participant ============================ */

const memberSchema = z.object({
  full_name: z.string().trim().min(1).max(80),
  email: z.string().trim().max(255).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  college: z.string().trim().max(120).optional().nullable(),
  role: z.string().trim().max(60).optional().nullable(),
});

export const registerForEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        event_id: z.string().uuid(),
        participation_type: z.enum(["individual", "team"]),
        team_name: z.string().trim().min(1).max(80).optional().nullable(),
        lead_name: z.string().trim().min(2).max(80),
        lead_email: z.string().trim().email().max(255),
        lead_phone: z.string().trim().min(5).max(20),
        college: z.string().trim().max(120).optional().nullable(),
        city: z.string().trim().max(80).optional().nullable(),
        members: z.array(memberSchema).max(50).default([]),
        answers: z.record(z.string(), z.string().max(2000)).default({}),
        documents: z
          .array(z.object({ label: z.string().max(120), path: z.string().max(400), url: z.string().max(1000).optional() }))
          .max(10)
          .default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: event, error: evErr } = await supabase
      .from("events")
      .select("id,name,code,status,participation_type,team_min,team_max,team_name_required,registration_opens_at,registration_closes_at,capacity,contact_email")
      .eq("id", data.event_id)
      .maybeSingle();
    if (evErr) throw new Error("Could not load this event");
    if (!event) return { ok: false as const, code: "not_found", message: "Event not found." };
    if (event.status !== "published")
      return { ok: false as const, code: "closed", message: "Registration is not open for this event." };

    const now = Date.now();
    if (event.registration_opens_at && new Date(event.registration_opens_at).getTime() > now)
      return { ok: false as const, code: "not_open", message: "Registration hasn't opened yet." };
    if (event.registration_closes_at && new Date(event.registration_closes_at).getTime() < now)
      return { ok: false as const, code: "closed", message: "The registration deadline has passed." };

    const isTeam = data.participation_type === "team";
    const memberCount = isTeam ? data.members.length + 1 : 1;
    if (isTeam && (memberCount < event.team_min || memberCount > event.team_max))
      return {
        ok: false as const,
        code: "team_size",
        message: `Team size must be between ${event.team_min} and ${event.team_max}.`,
      };
    if (isTeam && event.team_name_required && !data.team_name)
      return { ok: false as const, code: "team_name_required", message: "Team name is required." };

    const { data: existing } = await supabase
      .from("event_registrations")
      .select("id,registration_code")
      .eq("event_id", data.event_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing)
      return {
        ok: false as const,
        code: "already_registered",
        message: `You already registered (${existing.registration_code}).`,
      };

    const { data: inserted, error } = await supabase
      .from("event_registrations")
      .insert({
        event_id: data.event_id,
        user_id: userId,
        participation_type: data.participation_type,
        team_name: data.team_name ?? null,
        lead_name: data.lead_name,
        lead_email: data.lead_email,
        lead_phone: data.lead_phone,
        college: data.college ?? null,
        city: data.city ?? null,
        member_count: memberCount,
        answers: data.answers as never,
        documents: data.documents as never,
        status: "submitted",
        registration_code: "",
      } as never)
      .select("id,registration_code")
      .maybeSingle();

    if (error) {
      if (/duplicate key|unique/i.test(error.message))
        return { ok: false as const, code: "team_name_taken", message: "That team name is already taken for this event." };
      return { ok: false as const, code: "insert_failed", message: "Could not save your registration." };
    }
    if (!inserted) return { ok: false as const, code: "insert_failed", message: "Could not save your registration." };

    const rows = [
      {
        registration_id: inserted.id,
        full_name: data.lead_name,
        email: data.lead_email,
        phone: data.lead_phone,
        college: data.college ?? null,
        role: "Team lead",
        is_lead: true,
      },
      ...data.members.map((m) => ({
        registration_id: inserted.id,
        full_name: m.full_name,
        email: m.email ?? null,
        phone: m.phone ?? null,
        college: m.college ?? null,
        role: m.role ?? null,
        is_lead: false,
      })),
    ];
    if (isTeam || rows.length) await supabase.from("registration_members").insert(rows as never);

    const { queueEmails, writeAudit } = await import("@/lib/ops.server");
    await queueEmails([
      {
        event_id: data.event_id,
        registration_id: inserted.id,
        template: "registration_confirmation",
        subject: `Your registration for ${event.name} is confirmed`,
        body: `Hi ${data.lead_name},\n\nYour registration for ${event.name} has been successfully received.\nRegistration ID: ${inserted.registration_code}\n\n— Team Nest`,
        recipient_email: data.lead_email,
      },
    ]);
    await writeAudit({
      action: "registration.created",
      entity_type: "event_registration",
      entity_id: inserted.id,
      actor_id: userId,
      actor_email: data.lead_email,
      actor_role: "participant",
      new_value: { event_id: data.event_id, code: inserted.registration_code },
    });

    return { ok: true as const, registration_code: inserted.registration_code, registration_id: inserted.id };
  });

/** Everything the participant dashboard needs. */
export const getMyParticipation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: registrations, error } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load your registrations");

    const regIds = (registrations ?? []).map((r) => r.id);
    const eventIds = [...new Set((registrations ?? []).map((r) => r.event_id))];

    const [{ data: events }, { data: rounds }, { data: submissions }, { data: members }] = await Promise.all([
      eventIds.length
        ? supabase.from("events").select(PUBLIC_EVENT_COLUMNS).in("id", eventIds)
        : Promise.resolve({ data: [] as never[] }),
      eventIds.length
        ? supabase.from("event_rounds").select("*").in("event_id", eventIds).eq("is_enabled", true).order("position")
        : Promise.resolve({ data: [] as never[] }),
      regIds.length
        ? supabase.from("round_submissions").select("*").in("registration_id", regIds)
        : Promise.resolve({ data: [] as never[] }),
      regIds.length
        ? supabase.from("registration_members").select("*").in("registration_id", regIds)
        : Promise.resolve({ data: [] as never[] }),
    ]);

    return {
      registrations: registrations ?? [],
      events: events ?? [],
      rounds: rounds ?? [],
      submissions: submissions ?? [],
      members: members ?? [],
    };
  });

export const submitRound = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        registration_id: z.string().uuid(),
        round_id: z.string().uuid(),
        text_response: z.string().max(5000).optional().nullable(),
        link_url: z.string().max(1000).optional().nullable(),
        files: z
          .array(z.object({ label: z.string().max(160), path: z.string().max(400), url: z.string().max(1000).optional() }))
          .max(10)
          .default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: reg } = await supabase
      .from("event_registrations")
      .select("id,event_id,user_id")
      .eq("id", data.registration_id)
      .maybeSingle();
    if (!reg || reg.user_id !== userId) return { ok: false as const, message: "Registration not found." };

    const { data: round } = await supabase
      .from("event_rounds")
      .select("id,event_id,submission_deadline,submissions_open,is_enabled")
      .eq("id", data.round_id)
      .maybeSingle();
    if (!round || round.event_id !== reg.event_id) return { ok: false as const, message: "Round not found." };
    if (!round.is_enabled || !round.submissions_open)
      return { ok: false as const, message: "Submissions are closed for this round." };
    if (round.submission_deadline && new Date(round.submission_deadline).getTime() < Date.now())
      return { ok: false as const, message: "The submission deadline has passed." };

    const { error } = await supabase.from("round_submissions").upsert(
      {
        event_id: reg.event_id,
        round_id: data.round_id,
        registration_id: data.registration_id,
        text_response: data.text_response ?? null,
        link_url: data.link_url ?? null,
        files: data.files as never,
        status: "submitted",
      } as never,
      { onConflict: "round_id,registration_id" },
    );
    if (error) return { ok: false as const, message: "Could not save your submission." };
    return { ok: true as const };
  });

/* ============================ organizer ============================ */

const eventInput = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().regex(/^[a-z0-9-]{3,80}$/, "Use lowercase letters, numbers and dashes"),
  tagline: z.string().trim().max(160).optional().nullable(),
  description: z.string().trim().max(6000).default(""),
  banner_url: z.string().trim().max(1000).optional().nullable(),
  category: z.string().trim().min(2).max(60),
  event_type: z.string().trim().min(2).max(40),
  mode: z.enum(["offline", "online", "hybrid"]),
  city: z.string().trim().max(80).optional().nullable(),
  venue: z.string().trim().max(200).optional().nullable(),
  maps_url: z.string().trim().max(600).optional().nullable(),
  online_url: z.string().trim().max(600).optional().nullable(),
  start_at: z.string().optional().nullable(),
  end_at: z.string().optional().nullable(),
  registration_opens_at: z.string().optional().nullable(),
  registration_closes_at: z.string().optional().nullable(),
  website_url: z.string().trim().max(600).optional().nullable(),
  register_url: z.string().trim().max(600).optional().nullable(),
  links: z.array(z.object({ label: z.string().max(60), url: z.string().max(600) })).max(10).default([]),
  faqs: z.array(z.object({ q: z.string().max(200), a: z.string().max(1500) })).max(20).default([]),
  contact_name: z.string().trim().max(80).optional().nullable(),
  contact_email: z.string().trim().max(255).optional().nullable(),
  contact_phone: z.string().trim().max(20).optional().nullable(),
  participation_type: z.enum(["individual", "team", "both"]),
  team_min: z.number().int().min(1).max(50),
  team_max: z.number().int().min(1).max(50),
  team_name_required: z.boolean(),
  capacity: z.number().int().min(1).max(100000).optional().nullable(),
  eligibility: z.string().trim().max(2000).optional().nullable(),
  college_restriction: z.string().trim().max(600).optional().nullable(),
  required_participant_fields: z.array(z.string().max(60)).max(20).default([]),
  required_documents: z
    .array(z.object({ label: z.string().max(120), required: z.boolean().default(true) }))
    .max(10)
    .default([]),
  custom_questions: z
    .array(
      z.object({
        id: z.string().max(60),
        label: z.string().max(200),
        type: z.enum(["text", "textarea", "select"]).default("text"),
        options: z.array(z.string().max(80)).max(20).default([]),
        required: z.boolean().default(false),
      }),
    )
    .max(20)
    .default([]),
});

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => eventInput.extend({ code: z.string().trim().min(2).max(12) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    if (data.team_max < data.team_min) return { ok: false as const, message: "Max team size must be ≥ min." };

    const { data: row, error } = await supabase
      .from("events")
      .insert({ ...data, code: data.code.toUpperCase(), owner_id: userId, status: "draft" } as never)
      .select("id,slug")
      .maybeSingle();
    if (error) {
      if (/duplicate key|unique/i.test(error.message))
        return { ok: false as const, message: "That URL slug or event code is already taken." };
      return { ok: false as const, message: "Could not create the event." };
    }
    const { writeAudit } = await import("@/lib/ops.server");
    await writeAudit({
      action: "event.created",
      entity_type: "event",
      entity_id: row?.id ?? null,
      actor_id: userId,
      actor_email: (claims as { email?: string }).email ?? null,
      actor_role: "organizer",
      new_value: { name: data.name, slug: data.slug },
    });
    return { ok: true as const, id: row?.id, slug: row?.slug };
  });

export const updateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => eventInput.partial().extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { data: before } = await context.supabase.from("events").select("*").eq("id", id).maybeSingle();
    const { error } = await context.supabase.from("events").update(patch as never).eq("id", id);
    if (error) return { ok: false as const, message: "Could not save changes (check your permissions)." };
    const { writeAudit } = await import("@/lib/ops.server");
    await writeAudit({
      action: "event.updated",
      entity_type: "event",
      entity_id: id,
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string }).email ?? null,
      previous_value: before ? { status: before.status, name: before.name } : null,
      new_value: patch,
    });
    return { ok: true as const };
  });

export const setEventStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["draft", "published", "registration_closed", "completed", "archived"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: before } = await context.supabase.from("events").select("status").eq("id", data.id).maybeSingle();
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "published") patch["published_at"] = new Date().toISOString();
    const { error } = await context.supabase.from("events").update(patch as never).eq("id", data.id);
    if (error) return { ok: false as const, message: "Could not change the event status." };
    const { writeAudit } = await import("@/lib/ops.server");
    await writeAudit({
      action: "event.status_changed",
      entity_type: "event",
      entity_id: data.id,
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string }).email ?? null,
      previous_value: before?.status ?? null,
      new_value: data.status,
    });
    return { ok: true as const };
  });

export const listMyEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: owned }, { data: coOrg }, { data: roles }] = await Promise.all([
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("event_organizers").select("event_id,permissions").eq("user_id", userId),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      rows: owned ?? [],
      myPermissions: Object.fromEntries((coOrg ?? []).map((o) => [o.event_id, o.permissions ?? []])),
      roles: (roles ?? []).map((r) => r.role as string),
      userId,
    };
  });

/** One event's complete operating data for the organizer dashboard. */
export const getEventOps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ event_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: event, error } = await supabase.from("events").select("*").eq("id", data.event_id).maybeSingle();
    if (error) throw new Error("Could not load this event");
    if (!event) throw new Error("Forbidden: you don't have access to this event dashboard");

    const [{ data: rounds }, { data: registrations }, { data: organizers }, { data: emails }] = await Promise.all([
      supabase.from("event_rounds").select("*").eq("event_id", data.event_id).order("position"),
      supabase.from("event_registrations").select("*").eq("event_id", data.event_id).order("created_at", { ascending: false }),
      supabase.from("event_organizers").select("*").eq("event_id", data.event_id),
      supabase.from("event_email_log").select("*").eq("event_id", data.event_id).order("created_at", { ascending: false }).limit(300),
    ]);

    const regIds = (registrations ?? []).map((r) => r.id);
    const [{ data: members }, { data: submissions }] = await Promise.all([
      regIds.length
        ? supabase.from("registration_members").select("*").in("registration_id", regIds)
        : Promise.resolve({ data: [] as never[] }),
      regIds.length
        ? supabase.from("round_submissions").select("*").in("registration_id", regIds)
        : Promise.resolve({ data: [] as never[] }),
    ]);

    return {
      event,
      rounds: rounds ?? [],
      registrations: registrations ?? [],
      members: members ?? [],
      submissions: submissions ?? [],
      organizers: organizers ?? [],
      emails: emails ?? [],
    };
  });

const roundInput = z.object({
  id: z.string().uuid().optional().nullable(),
  position: z.number().int().min(1).max(50),
  name: z.string().trim().min(1).max(80),
  round_type: z.enum(["registration", "submission", "evaluation", "offline", "final", "custom"]),
  description: z.string().trim().max(2000).optional().nullable(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  submission_deadline: z.string().optional().nullable(),
  submission_requirements: z.array(z.string().max(160)).max(15).default([]),
  allow_file: z.boolean().default(true),
  allow_link: z.boolean().default(true),
  allow_text: z.boolean().default(true),
  is_enabled: z.boolean().default(true),
  submissions_open: z.boolean().default(true),
});

export const saveRounds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ event_id: z.string().uuid(), rounds: z.array(roundInput).max(30) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: existing } = await supabase.from("event_rounds").select("id").eq("event_id", data.event_id);
    const keep = new Set(data.rounds.map((r) => r.id).filter(Boolean) as string[]);
    const remove = (existing ?? []).map((r) => r.id).filter((id) => !keep.has(id));

    for (const r of data.rounds) {
      const payload = { ...r, event_id: data.event_id } as Record<string, unknown>;
      if (!r.id) delete payload["id"];
      const { error } = r.id
        ? await supabase.from("event_rounds").update(payload as never).eq("id", r.id)
        : await supabase.from("event_rounds").insert(payload as never);
      if (error) return { ok: false as const, message: `Could not save round "${r.name}".` };
    }
    if (remove.length) await supabase.from("event_rounds").delete().in("id", remove);

    const { writeAudit } = await import("@/lib/ops.server");
    await writeAudit({
      action: "event.rounds_updated",
      entity_type: "event",
      entity_id: data.event_id,
      actor_id: context.userId,
      new_value: { count: data.rounds.length },
    });
    return { ok: true as const };
  });

export const setRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        event_id: z.string().uuid(),
        registration_ids: z.array(z.string().uuid()).min(1).max(500),
        status: z.enum([
          "submitted",
          "under_review",
          "shortlisted",
          "on_hold",
          "rejected",
          "advanced",
          "finalist",
          "selected",
          "completed",
        ]),
        current_round_id: z.string().uuid().optional().nullable(),
        organizer_notes: z.string().max(2000).optional().nullable(),
        notify: z.boolean().default(false),
        email_template: z.string().max(60).optional().nullable(),
        email_subject: z.string().max(200).optional().nullable(),
        email_body: z.string().max(8000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: before } = await supabase
      .from("event_registrations")
      .select("id,status,lead_name,lead_email,registration_code")
      .in("id", data.registration_ids);

    const patch: Record<string, unknown> = { status: data.status };
    if (data.current_round_id !== undefined) patch["current_round_id"] = data.current_round_id ?? null;
    if (data.organizer_notes) patch["organizer_notes"] = data.organizer_notes;

    const { error } = await supabase
      .from("event_registrations")
      .update(patch as never)
      .in("id", data.registration_ids)
      .eq("event_id", data.event_id);
    if (error) return { ok: false as const, message: "Could not update those participants." };

    const { writeAudit, queueEmails } = await import("@/lib/ops.server");
    const correlation = await writeAudit({
      action: "registration.status_changed",
      entity_type: "event_registration",
      entity_id: data.registration_ids.join(","),
      actor_id: userId,
      actor_email: (context.claims as { email?: string }).email ?? null,
      previous_value: (before ?? []).map((b) => ({ id: b.id, status: b.status })),
      new_value: { status: data.status, count: data.registration_ids.length },
      metadata: { event_id: data.event_id },
    });

    let queued = 0;
    if (data.notify && data.email_subject && data.email_body) {
      const { data: ev } = await supabase.from("events").select("name").eq("id", data.event_id).maybeSingle();
      const rows = (before ?? []).map((b) => {
        const vars: Record<string, string> = {
          name: b.lead_name,
          code: b.registration_code,
          event: ev?.name ?? "the event",
        };
        const fill = (t: string) => t.replace(/\{\{(\w+)\}\}/g, (_m, k) => vars[k] ?? "");
        return {
          event_id: data.event_id,
          registration_id: b.id,
          template: data.email_template ?? "custom",
          subject: fill(data.email_subject!),
          body: fill(data.email_body!),
          recipient_email: b.lead_email,
          sent_by: userId,
        };
      });
      const res = await queueEmails(rows);
      queued = res.queued;
    }
    return { ok: true as const, correlation, queued };
  });

export const reviewSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["submitted", "under_review", "approved", "rejected", "changes_requested"]),
        score: z.number().min(0).max(100).optional().nullable(),
        reviewer_notes: z.string().max(2000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("round_submissions")
      .update({
        status: data.status,
        score: data.score ?? null,
        reviewer_notes: data.reviewer_notes ?? null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq("id", data.id);
    if (error) return { ok: false as const, message: "Could not save your review." };
    return { ok: true as const };
  });

export const sendEventEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        event_id: z.string().uuid(),
        registration_ids: z.array(z.string().uuid()).min(1).max(1000),
        template: z.string().max(60),
        subject: z.string().min(2).max(200),
        body: z.string().min(2).max(8000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: regs }, { data: ev }] = await Promise.all([
      supabase
        .from("event_registrations")
        .select("id,lead_name,lead_email,registration_code")
        .eq("event_id", data.event_id)
        .in("id", data.registration_ids),
      supabase.from("events").select("name").eq("id", data.event_id).maybeSingle(),
    ]);
    if (!regs?.length) return { ok: false as const, message: "No matching participants." };

    const { queueEmails, writeAudit } = await import("@/lib/ops.server");
    const rows = regs.map((r) => {
      const vars: Record<string, string> = { name: r.lead_name, code: r.registration_code, event: ev?.name ?? "the event" };
      const fill = (t: string) => t.replace(/\{\{(\w+)\}\}/g, (_m, k) => vars[k] ?? "");
      return {
        event_id: data.event_id,
        registration_id: r.id,
        template: data.template,
        subject: fill(data.subject),
        body: fill(data.body),
        recipient_email: r.lead_email,
        sent_by: userId,
      };
    });
    const res = await queueEmails(rows);
    await writeAudit({
      action: "event.emails_queued",
      entity_type: "event",
      entity_id: data.event_id,
      actor_id: userId,
      new_value: { template: data.template, recipients: rows.length },
    });
    return { ok: true as const, queued: res.queued };
  });

export const upsertEventOrganizer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        event_id: z.string().uuid(),
        email: z.string().email().max(255),
        display_name: z.string().max(80).optional().nullable(),
        permissions: z.array(z.string().max(40)).min(1).max(12),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Only someone who can edit the event may grant access; verified via RLS below.
    const { data: canEdit } = await context.supabase.from("events").select("id").eq("id", data.event_id).maybeSingle();
    if (!canEdit) return { ok: false as const, message: "You don't have access to this event." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const found = list?.users?.find((u) => (u.email ?? "").toLowerCase() === data.email.toLowerCase());
    if (!found)
      return { ok: false as const, message: "No NEST account with that email yet — ask them to sign in once first." };

    const { error } = await context.supabase.from("event_organizers").upsert(
      {
        event_id: data.event_id,
        user_id: found.id,
        email: data.email,
        display_name: data.display_name ?? null,
        permissions: data.permissions,
      } as never,
      { onConflict: "event_id,user_id" },
    );
    if (error) return { ok: false as const, message: "Could not save those permissions." };

    const { writeAudit } = await import("@/lib/ops.server");
    await writeAudit({
      action: "event.organizer_permissions_changed",
      entity_type: "event_organizer",
      entity_id: `${data.event_id}:${found.id}`,
      actor_id: context.userId,
      new_value: { email: data.email, permissions: data.permissions },
    });
    return { ok: true as const };
  });

export const removeEventOrganizer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("event_organizers").delete().eq("id", data.id);
    if (error) return { ok: false as const, message: "Could not remove that organizer." };
    return { ok: true as const };
  });

/** Recorded for the audit trail whenever an organizer exports data. */
export const logDataExport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ event_id: z.string().uuid(), dataset: z.string().max(60), rows: z.number().int().min(0) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { writeAudit } = await import("@/lib/ops.server");
    const correlation = await writeAudit({
      action: "event.data_exported",
      entity_type: "event",
      entity_id: data.event_id,
      actor_id: context.userId,
      actor_email: (context.claims as { email?: string }).email ?? null,
      new_value: { dataset: data.dataset, rows: data.rows },
    });
    return { ok: true as const, correlation };
  });
