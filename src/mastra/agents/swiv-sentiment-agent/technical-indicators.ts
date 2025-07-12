import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const technicalIndicatorsTool = createTool({
  id: "technicalIndicators",
  description: "Analyze token patterns (simulated)",
  inputSchema: z.object({
    tokenSymbol: z.string(),
  }),
  outputSchema: z.object({
    indicator: z.string(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    // Simulated output
    return {
      indicator: "Cup and Handle",
      message: `${context.tokenSymbol} has formed a Cup and Handle — potential breakout soon.`,
    };
  },
});
