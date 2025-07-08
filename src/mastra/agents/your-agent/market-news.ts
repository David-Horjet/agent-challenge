// market-news-tool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const marketNewsTool = createTool({
  id: "marketNews",
  description: "Fetch recent market headlines for a token",
  inputSchema: z.object({
    tokenSymbol: z.string().describe("e.g., ETH, BTC, SOL"),
  }),
  outputSchema: z.object({
    headlines: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { tokenSymbol } = context;
    const tokenId = toId(tokenSymbol);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${tokenId}/status_updates`
    );
    const data = await res.json();

    const headlines =
      data.status_updates?.slice(0, 3).map((item: any) => `• ${item.title}`) ||
      ["No major headlines found."];

    return { headlines };
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
