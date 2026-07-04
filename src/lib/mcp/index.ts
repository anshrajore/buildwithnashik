import { defineMcp } from "@lovable.dev/mcp-js";
import getEventInfo from "./tools/get-event-info";
import getSchedule from "./tools/get-schedule";
import getSponsorTiers from "./tools/get-sponsor-tiers";
import submitVolunteerSignup from "./tools/submit-volunteer-signup";

export default defineMcp({
  name: "build-with-nashik-mcp",
  title: "Build With Nashik MCP",
  version: "0.1.0",
  instructions:
    "Tools for Build With Nashik 2026 — Nashik's largest developer hackathon by Team Nest. Use these tools to fetch event info, schedule phases, sponsor tiers, and to submit volunteer signups.",
  tools: [getEventInfo, getSchedule, getSponsorTiers, submitVolunteerSignup],
});
