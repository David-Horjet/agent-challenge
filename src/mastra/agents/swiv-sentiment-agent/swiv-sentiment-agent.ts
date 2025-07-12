import { Agent } from "@mastra/core/agent";
import { model } from "../../config";

import { marketSentimentTool } from "./market-sentiment";
import { pricePerformanceTool } from "./price-performance";
import { capitalFlowTool } from "./capital-flow";
import { newsFetcherTool } from "./news-fetcher";
import { technicalIndicatorsTool } from "./technical-indicators";
import { whaleAccumulationTool } from "./whale-accumulation";
import { strategyBuilderTool } from "./strategy-builder";

const instructions = `
You are Swiv Bot — an intelligent market scout built into Swiv.

When a user asks about a token:
- Use \`marketSentimentTool\` to gauge overall sentiment (e.g., Fear/Greed).
- Use \`pricePerformanceTool\` to get current price, 24h change, highs/lows.
- Use \`capitalFlowTool\` to simulate capital inflows/outflows.
- Use \`technicalIndicatorsTool\` to check moving average crossovers and pattern strength.
- Use \`whaleAccumulationTool\` to estimate whale buying or selling pressure.
- Use \`newsFetcherTool\` to fetch the latest token headlines.
- Finally, use \`strategyBuilderTool\` to summarize everything and suggest a trading direction.

Respond clearly and concisely using:
📊 Market Snapshot  
💰 Capital Flow  
🧠 Sentiment Analysis  
📈 Technical Signals  
🐋 Whale Activity  
📰 Headlines  
🚀 Strategy Summary

Never use a tool unless its input is clearly defined (e.g., tokenSymbol).
`;

export const swivMarketAgent = new Agent({
  name: "Swiv Market Agent",
  model,
  instructions,
  tools: {
    marketSentimentTool,
    pricePerformanceTool,
    capitalFlowTool,
    technicalIndicatorsTool,
    whaleAccumulationTool,
    newsFetcherTool,
    strategyBuilderTool,
  },
});
