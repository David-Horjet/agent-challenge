import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const marketSentimentTool = createTool({
  id: "marketSentiment",
  description: "Fetches general market sentiment like Fear & Greed Index",
  inputSchema: z.object({
    tokenSymbol: z.string().describe("e.g., BTC, ETH, SOL"),
  }),
  outputSchema: z.object({
    sentimentScore: z.number(),
    sentimentLevel: z.string(),
    message: z.string(),
  }),
  execute: async () => {
    const res = await fetch("https://api.alternative.me/fng/?limit=1");
    const data = await res.json();
    const score = parseInt(data.data[0].value);
    const level = data.data[0].value_classification;

    return {
      sentimentScore: score,
      sentimentLevel: level,
      message: `The market is currently in a state of ${level} (${score}/100).`,
    };
  },
});
