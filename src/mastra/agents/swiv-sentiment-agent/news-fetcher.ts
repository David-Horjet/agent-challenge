import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const newsFetcherTool = createTool({
  id: "newsFetcher",
  description: "Fetch recent token-related headlines",
  inputSchema: z.object({
    tokenSymbol: z.string(),
  }),
  outputSchema: z.object({
    headlines: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const id = toId(context.tokenSymbol);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/status_updates`
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
  };
  return map[symbol.toUpperCase()] || symbol.toLowerCase();
}
