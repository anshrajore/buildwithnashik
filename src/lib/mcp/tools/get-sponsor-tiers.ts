import { defineTool } from "@lovable.dev/mcp-js";

const tiers = [
  { tier: "Title", description: "Presenting partner — top billing across all surfaces." },
  { tier: "Platinum", description: "Premium visibility, stage time, and recruiting access." },
  { tier: "Gold", description: "Strong on-site presence and branding." },
  { tier: "Silver", description: "Community-tier partner with logo placement." },
  { tier: "Venue", description: "Host the hackathon at your space." },
  { tier: "Media", description: "Cover the event and amplify reach." },
  { tier: "Swag", description: "Provide branded merch for builders." },
  { tier: "Food & Beverage", description: "Fuel 500+ builders for 36 hours." },
];

export default defineTool({
  name: "get_sponsor_tiers",
  title: "Get sponsor tiers",
  description: "List sponsorship tiers available for Build With Nashik 2026.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(tiers, null, 2) }],
    structuredContent: { tiers },
  }),
});
