import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_event_info",
  title: "Get event info",
  description:
    "Return high-level info about Build With Nashik 2026: what it is, who runs it, format, and current status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            name: "Build With Nashik 2026",
            organizer: "Team Nest",
            city: "Nashik, India",
            format: "36-hour in-person developer hackathon",
            expected_builders: "500+",
            date: "TBA — full 36-hour schedule will be shared soon",
            website: "https://buildwithnashik.com",
          },
          null,
          2,
        ),
      },
    ],
  }),
});
