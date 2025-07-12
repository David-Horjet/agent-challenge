import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const strategyBuilderTool = createTool({
  id: "strategyBuilder",
  description: "Generate strategy from analysis inputs",
  inputSchema: z.object({
    symbol: z.string(),
    sentimentMessage: z.string(),
    priceMessage: z.string(),
    flowMessage: z.string(),
    techMessage: z.string(),
    whaleMessage: z.string(),
  }),
  outputSchema: z.object({
    strategy: z.string(),
  }),
  execute: async ({ context }) => {
    const { symbol, sentimentMessage, priceMessage, flowMessage, techMessage, whaleMessage } = context;

    const strategy = `
📈 ${symbol.toUpperCase()} Market Analysis
═══════════════════════════

🧠 MARKET SENTIMENT
${sentimentMessage}

💹 PRICE PERFORMANCE
${priceMessage}

💸 CAPITAL FLOW
${flowMessage}

📊 TECHNICAL INDICATORS
${techMessage}

🐋 WHALE ACCUMULATION
${whaleMessage}

💡 STRATEGY
Stay alert and consider these signals. Look out for confirmation patterns and manage risk accordingly.
    `.trim();

    return { strategy };
  },
});
