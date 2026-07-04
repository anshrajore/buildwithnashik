import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const phases = [
  { phase: "01", title: "Team Registration Opens", date: "TBA", detail: "Lock your team of 2–4 and pick a track." },
  { phase: "02", title: "Registration Closes", date: "TBA", detail: "Last call. After this, the gates lock." },
  { phase: "03", title: "Submission Window", date: "TBA", detail: "Ideas, scoping & shortlists begin." },
  { phase: "04", title: "Final Shortlist", date: "TBA", detail: "Selected teams announced." },
  { phase: "05", title: "Hackathon Begins", date: "TBA", detail: "36 hours on the clock." },
  { phase: "06", title: "Conclusion & Awards", date: "TBA", detail: "Demos, judging, and trophies." },
];

export default defineTool({
  name: "get_schedule",
  title: "Get hackathon schedule",
  description: "Return the 6 high-level phases of the Build With Nashik 2026 36-hour run.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(phases, null, 2) }],
    structuredContent: { phases },
  }),
});
