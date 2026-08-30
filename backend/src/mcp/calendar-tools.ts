import { AuthenticatedExtra, defineTool } from "@descope/mcp-express";
import { z } from "zod";
import { listUpcomingMeetings } from "../services/calendar.service.js";

function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function authUserIdFromToken(token: string): string {
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1] ?? "", "base64").toString("utf8"),
  ) as { sub?: string };

  if (!payload.sub) {
    throw new Error("MCP token has no user id");
  }

  return String(payload.sub);
}

const defineMcpTool = defineTool as (cfg: {
  name: string;
  description: string;
  input?: Record<string, unknown>;
  scopes?: string[];
  handler: (
    args: Record<string, unknown>,
    extra: AuthenticatedExtra,
  ) => ReturnType<typeof textResult> | Promise<ReturnType<typeof textResult>>;
}) => ReturnType<typeof defineTool>;

export const listUpcomingMeetingsTools = defineMcpTool({
  name: "listUpcomingMeetings",
  description:
    "List Google Calendar events. Set todayOnly=true for today's agenda only.",
  input: {
    maxResults: z.number().int().min(1).max(20).optional(),

    todayOnly: z
      .boolean()
      .optional()
      .describe("If true, only return events for today"),
  },
  scopes: ["profile"],
  handler: async (args, extra) => {
    try {
      const authUserId = authUserIdFromToken(extra.authInfo.token);

      const meetings = await listUpcomingMeetings({
        authUserId,
        maxResults:
          typeof args.maxResults === "number" ? args.maxResults : undefined,
        todayOnly:
          typeof args.todayOnly === "boolean" ? args.todayOnly : undefined,
      });

      return textResult({ meetings });
    } catch (error) {
      const message = error instanceof Error ? error.message : "List Failed";
      return textResult({ error: message });
    }
  },
});
