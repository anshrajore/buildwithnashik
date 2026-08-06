/** Builds an "Add to Google Calendar" URL for a community event. */
export function googleCalendarUrl(e: {
  event_name: string;
  description?: string | null;
  tagline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
  city?: string | null;
  register_url?: string | null;
  website_url?: string | null;
}): string | null {
  if (!e.start_date) return null;
  const start = e.start_date.replace(/-/g, "");
  // Google's all-day range end is exclusive → add a day to the last date.
  const last = e.end_date || e.start_date;
  const endDate = new Date(`${last}T00:00:00`);
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, "");

  const details = [
    e.tagline ?? "",
    e.description ?? "",
    e.register_url ? `Register: ${e.register_url}` : "",
    e.website_url ? `Website: ${e.website_url}` : "",
    "Listed on the Team Nest events board.",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 900);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.event_name,
    dates: `${start}/${end}`,
    details,
    location: [e.venue, e.city].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Downloadable .ics for Apple/Outlook calendars. */
export function icsDataUrl(e: {
  id: string;
  event_name: string;
  tagline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
  city?: string | null;
}): string | null {
  if (!e.start_date) return null;
  const start = e.start_date.replace(/-/g, "");
  const last = e.end_date || e.start_date;
  const endDate = new Date(`${last}T00:00:00`);
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, "");
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Team Nest//Events Board//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@teamnest`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${esc(e.event_name)}`,
    `DESCRIPTION:${esc(e.tagline ?? "Team Nest events board")}`,
    `LOCATION:${esc([e.venue, e.city].filter(Boolean).join(", "))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
