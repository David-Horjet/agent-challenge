import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const whaleAccumulationTool = createTool({
  id: "whaleAccumulation",
  description: "Track whale activity (mocked)",
  inputSchema: z.object({
    tokenSymbol: z.string(),
  }),
  outputSchema: z.object({
    whaleActivity: z.string(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const activity = Math.random() > 0.5 ? "High" : "Low";

    return {
      whaleActivity: activity,
      message:
        activity === "High"
          ? `Whales are actively accumulating ${context.tokenSymbol}.`
          : `No significant whale activity on ${context.tokenSymbol}.`,
    };
  },
});
