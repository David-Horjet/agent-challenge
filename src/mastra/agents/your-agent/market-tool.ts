// src/mastra/agents/sentiment-agent/market-tool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const TrendEnum = z.enum(["Uptrend", "Downtrend", "Sideways"]);

export const marketTool = createTool({
  id: "analyzeMarket",
  description: "Get price and market trend for a token",
  inputSchema: z.object({
    tokenSymbol: z.string().describe("e.g., ETH, BTC, SOL"),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    price: z.number(),
    trend: TrendEnum,
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { tokenSymbol } = context;
    const id = toId(tokenSymbol);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await res.json();

    if (!data[id]) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const price = data[id].usd;
    const change = data[id].usd_24h_change;

    const trend: z.infer<typeof TrendEnum> =
      change > 2 ? "Uptrend" : change < -2 ? "Downtrend" : "Sideways";

    const message =
      trend === "Uptrend"
        ? `${tokenSymbol} is pumping today — up ${change.toFixed(2)}%!`
        : trend === "Downtrend"
        ? `${tokenSymbol} is bleeding — down ${change.toFixed(2)}%. Stay cautious.`
        : `${tokenSymbol} is ranging. No major moves yet.`;

    return {
      symbol: tokenSymbol.toUpperCase(),
      price,
      trend,
      message,
    };
  },
});

function toId(symbol: string): string {
  const map: Record<string, string> = {
    ETH: "ethereum",
    BTC: "bitcoin",
    SOL: "solana",
    ARB: "arbitrum",
    OP: "optimism",
  };
  return map[symbol.toUpperCase()] || symbol.toLowerCase();
}
