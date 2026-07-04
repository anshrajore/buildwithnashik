import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "submit_volunteer_signup",
  title: "Submit volunteer signup",
  description:
    "Register a new volunteer for Build With Nashik 2026. Stores the signup in the volunteer_signups table.",
  inputSchema: {
    full_name: z.string().min(1).describe("Volunteer's full name."),
    email: z.string().email().describe("Contact email."),
    phone: z.string().optional().describe("Phone number (optional)."),
    interest: z
      .string()
      .optional()
      .describe("Area of interest (operations, tech, design, content, etc.)."),
    experience: z.string().optional().describe("Short note on relevant experience."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input) => {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return {
        content: [{ type: "text", text: "Backend not configured." }],
        isError: true,
      };
    }
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("volunteer_signups")
      .insert(input)
      .select()
      .single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Volunteer signup recorded (id: ${data?.id}).` }],
      structuredContent: { signup: data },
    };
  },
});
