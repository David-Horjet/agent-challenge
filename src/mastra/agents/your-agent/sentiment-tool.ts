import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const sentimentTool = createTool({
  id: "getSentiment",
  description: "Analyze PnL and notes to determine trading sentiment",
  inputSchema: z.object({
    pnl: z.number().describe("User's profit or loss (e.g. 150)"),
    notes: z.string().describe("User's thoughts or feelings"),
  }),
  outputSchema: z.object({
    sentiment: z.enum(["Bullish", "Bearish", "Neutral"]),
    insight: z.string(),
  }),

  execute: async ({ context }) => {
    const { pnl, notes } = context;

    let sentiment: "Bullish" | "Bearish" | "Neutral" = "Neutral";
    let insight = "";

    if (pnl > 100) {
      sentiment = "Bullish";
      insight = "You're in profit — seems like your edge is working!";
    } else if (pnl < -100) {
      sentiment = "Bearish";
      insight = "Losses detected — maybe it's time to scale back or pause.";
    } else {
      sentiment = "Neutral";
      insight = "Choppy waters — no clear edge today.";
    }

    if (notes.toLowerCase().includes("scared") || notes.includes("😰")) {
      sentiment = "Bearish";
      insight += " You're emotionally reactive — don’t let fear trade for you.";
    }

    return {
      sentiment,
      insight,
    };
  },
});