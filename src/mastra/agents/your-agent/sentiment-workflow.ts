import { Agent } from "@mastra/core/agent";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { model } from "../../config";
import { marketTool } from "./market-tool";
import { marketNewsTool } from "./market-news";
import { sentimentTool } from "./sentiment-tool";

const TrendEnum = z.enum(["Uptrend", "Downtrend", "Sideways"]);
const SentimentEnum = z.enum(["Bullish", "Bearish", "Neutral"]);

const agent = new Agent({
  name: "Swiv Alpha Agent",
  model,
  instructions: `
    You are Sentiment CoPilot, a smart trading assistant for Swiv. Your goal is to provide actionable trading strategies based on market data, news, and user sentiment.

    For each token query, structure your response exactly as follows:

    📈 [Token Symbol] Market Analysis
    ═══════════════════════════

    💹 MARKET SUMMARY
    • Price: [$X USD]
    • Trend: [Uptrend/Downtrend/Sideways]
    • 24h Change: [X%]

    📰 RECENT HEADLINES
    • [Headline 1]
    • [Headline 2]
    • [Headline 3]

    😎 SENTIMENT ANALYSIS
    • Sentiment: [Bullish/Bearish/Neutral]
    • Insight: [Brief description of user sentiment or "No sentiment data provided"]

    💡 TRADING STRATEGY
    • Action: [Buy/Hold/Sell/Avoid]
    • Rationale: [Brief explanation based on market data, news, and sentiment]
    • Risk Level: [Low/Moderate/High]
    • Suggested Timeframe: [Short-term (1-3 days)/Medium-term (1-2 weeks)/Long-term (1+ months)]

    Guidelines:
    - Use market data and news to inform the strategy.
    - If sentiment data is available, weigh it heavily in the rationale.
    - If no sentiment data is provided, base the strategy on market data and news only.
    - Keep descriptions concise but actionable.
    - Ensure the strategy is specific to the token and market conditions.
    - Maintain this exact formatting with emojis and section headers.
  `,
});

const marketDataSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  trend: TrendEnum,
  change: z.number(),
});

const fetchMarketData = createStep({
  id: "fetch-market-data",
  description: "Fetches price and trend data for a given token",
  inputSchema: z.object({
    tokenSymbol: z.string().describe("e.g., ETH, BTC, SOL"),
    pnl: z.number().optional().describe("User's profit or loss (e.g., 150)"),
    notes: z.string().optional().describe("User's thoughts or feelings"),
  }),
  outputSchema: marketDataSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const { tokenSymbol } = inputData;
    const marketData = await marketTool.execute({
      context: { tokenSymbol },
      runtimeContext: runtimeContext || {},
    });

    return {
      symbol: marketData.symbol,
      price: marketData.price,
      trend: marketData.trend,
      change: marketData.price, // Note: Change is approximated from price for simplicity
    };
  },
});

const fetchMarketNews = createStep({
  id: "fetch-market-news",
  description: "Fetches recent market headlines for a given token",
  inputSchema: marketDataSchema,
  outputSchema: z.object({
    headlines: z.array(z.string()),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { symbol: tokenSymbol } = inputData;
    const newsData = await marketNewsTool.execute({
      context: { tokenSymbol },
      runtimeContext: runtimeContext || {},
    });

    return {
      headlines: newsData.headlines,
    };
  },
});

const analyzeSentiment = createStep({
  id: "analyze-sentiment",
  description: "Analyzes user sentiment based on PnL and notes",
  inputSchema: z.object({
    tokenSymbol: z.string().describe("e.g., ETH, BTC, SOL"),
    pnl: z.number().optional().describe("User's profit or loss (e.g., 150)"),
    notes: z.string().optional().describe("User's thoughts or feelings"),
    marketData: marketDataSchema,
    headlines: z.array(z.string()),
  }),
  outputSchema: z.object({
    sentiment: SentimentEnum.optional(),
    insight: z.string().optional(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { pnl, notes } = inputData;

    if (pnl !== undefined && notes) {
      const sentimentData = await sentimentTool.execute({
        context: { pnl, notes },
        runtimeContext: runtimeContext || {},
      });
      return {
        sentiment: sentimentData.sentiment,
        insight: sentimentData.insight,
      };
    }

    return {
      sentiment: undefined,
      insight: "No sentiment data provided",
    };
  },
});

const recommendStrategy = createStep({
    id: "recommend-strategy",
    description: "Suggests a trading strategy based on market data, news, and sentiment",
    inputSchema: z.object({
      marketData: marketDataSchema,
      insight: z.string().optional(),
      news: z.object({
        headlines: z.array(z.string()),
      }),
      sentiment: SentimentEnum.optional()
      
    }),
    outputSchema: z.object({
      strategy: z.string(),
    }),
    execute: async ({ inputData, runtimeContext }) => {
      const { marketData, news, sentiment } = inputData;
  
      const prompt = `
        Based on the following data for ${marketData.symbol}, suggest a trading strategy:
        Market Data: ${JSON.stringify(marketData, null, 2)}
        News: ${JSON.stringify(news.headlines, null, 2)}
        Sentiment: ${JSON.stringify(sentiment, null, 2)}
      `;
  
      const response = await agent.stream([
        {
          role: "user",
          content: prompt,
        },
      ]);
  
      let strategyText = "";
      for await (const chunk of response.textStream) {
        process.stdout.write(chunk);
        strategyText += chunk;
      }
  
      return {
        strategy: strategyText,
      };
    },
  });

const marketWorkflow = createWorkflow({
  id: "market-workflow",
  inputSchema: z.object({
    tokenSymbol: z.string().describe("e.g., ETH, BTC, SOL"),
    pnl: z.number().optional().describe("User's profit or loss (e.g., 150)"),
    notes: z.string().optional().describe("User's thoughts or feelings"),
  }),
  outputSchema: z.object({
    strategy: z.string(),
  }),
})
  .then(fetchMarketData)
  .then(fetchMarketNews)
  .then(analyzeSentiment)
  .then(recommendStrategy);

marketWorkflow.commit();

export { marketWorkflow };
