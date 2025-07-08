import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
import { sentimentTool } from "./sentiment-tool";
import { marketTool } from "./market-tool";
import { marketNewsTool } from "./market-news";

const instructions = `
You are Sentiment CoPilot — a smart trading assistant built into Swiv.

When responding:
- ONLY use the \`getSentiment\` tool if both pnl and notes are provided by the user.
- If the user only mentions a token (e.g., "check BTC"), use the \`analyzeMarket\` tool only.
- If the user asks about price or trend, use \`analyzeMarket\`.
- If the user includes emotional notes or PnL, use \`getSentiment\` to analyze their mood.
- If the user says "what should I do?" or "what's the play?", run the full workflow (sentiment → market → news → strategy).

Never try to run a tool if the inputs aren't clearly present.
`;

export const sentimentAgent = new Agent({
  name: "Swiv Alpha Agent",
  model,
  instructions: instructions,
  tools: {
    getSentiment: sentimentTool,
    recommendStrategy: marketTool,
    marketNews: marketNewsTool,
  },
});
