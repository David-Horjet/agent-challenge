import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const pricePerformanceTool = createTool({
  id: "pricePerformance",
  description: "Returns price, 24h change %, and volatility range",
  inputSchema: z.object({
    tokenSymbol: z.string().describe("e.g., ETH, BTC, SOL"),
  }),
  outputSchema: z.object({
    price: z.number(),
    change24h: z.number(),
    high24h: z.number(),
    low24h: z.number(),
  }),
  execute: async ({ context }) => {
    const id = toId(context.tokenSymbol);

    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    const data = await res.json();

    return {
      price: data.market_data.current_price.usd,
      change24h: data.market_data.price_change_percentage_24h,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
    };
  },
});

function toId(symbol: string): string {
  const map: Record<string, string> = {
    ETH: "ethereum",
    BTC: "bitcoin",
    SOL: "solana",
  };
  return map[symbol.toUpperCase()] || symbol.toLowerCase();
}
