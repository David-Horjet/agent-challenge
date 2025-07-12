import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const capitalFlowTool = createTool({
  id: "capitalFlow",
  description: "Estimates net capital flow into token (mocked)",
  inputSchema: z.object({
    tokenSymbol: z.string().describe("e.g., ETH, BTC, SOL"),
  }),
  outputSchema: z.object({
    netFlow: z.number(),
    inflow: z.number(),
    outflow: z.number(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    // Placeholder values — replace with onchain data provider if needed
    const inflow = Math.random() * 10000000;
    const outflow = Math.random() * 10000000;
    const netFlow = inflow - outflow;

    return {
      inflow,
      outflow,
      netFlow,
      message:
        netFlow > 0
          ? `Strong interest in ${context.tokenSymbol} with $${netFlow.toFixed(0)} net inflow.`
          : `More capital leaving ${context.tokenSymbol} than entering. Net outflow: $${Math.abs(netFlow).toFixed(0)}.`,
    };
  },
});
