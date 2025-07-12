import { Agent } from "@mastra/core/agent";
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { model } from "../../config";

import { marketSentimentTool } from "./market-sentiment";
import { pricePerformanceTool } from "./price-performance";
import { capitalFlowTool } from "./capital-flow";
import { newsFetcherTool } from "./news-fetcher";
import { technicalIndicatorsTool } from "./technical-indicators";
import { whaleAccumulationTool } from "./whale-accumulation";
import { strategyBuilderTool } from "./strategy-builder";

const agent = new Agent({
  name: "Swiv Market Agent",
  model,
  instructions: `
You are Swiv Bot — a trading sentiment assistant for analyzing token momentum, trends, and narratives.

When a user asks about a token (e.g., BTC or ETH), your job is to:
- Break down market sentiment
- Fetch price movement and volatility
- Estimate capital flow
- Analyze technical indicators
- Check whale activity
- Fetch relevant news
- Finally, compile all the insights into a clean market outlook

Return all insights in one full report. Use emoji section headers.
Keep it concise and easy to understand for traders.
  `,
});

const InputSchema = z.object({
  tokenSymbol: z.string().describe("e.g., ETH, BTC, SOL"),
});

const fetchMarketSentiment = createStep({
  id: "fetch-market-sentiment",
  description: "Fetch general sentiment score (Fear & Greed Index)",
  inputSchema: InputSchema,
  outputSchema: z.object({
    sentimentScore: z.number(),
    sentimentLevel: z.string(),
    message: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    return await marketSentimentTool.execute({
      context: inputData,
      runtimeContext,
    });
  },
});

const fetchPricePerformance = createStep({
  id: "fetch-price-performance",
  description: "Fetch price, 24h change and high/low range",
  inputSchema: InputSchema,
  outputSchema: z.object({
    price: z.number(),
    change24h: z.number(),
    high24h: z.number(),
    low24h: z.number(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    return await pricePerformanceTool.execute({
      context: inputData,
      runtimeContext,
    });
  },
});

const fetchCapitalFlow = createStep({
  id: "fetch-capital-flow",
  description: "Fetch simulated capital inflow/outflow",
  inputSchema: InputSchema,
  outputSchema: z.object({
    inflow: z.number(),
    outflow: z.number(),
    netFlow: z.number(),
    message: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    return await capitalFlowTool.execute({
      context: inputData,
      runtimeContext,
    });
  },
});

const fetchTechnicalIndicators = createStep({
  id: "fetch-technical-indicators",
  description: "Returns pattern-based signals",
  inputSchema: InputSchema,
  outputSchema: z.object({
    indicator: z.string(),
    message: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    return await technicalIndicatorsTool.execute({
      context: inputData,
      runtimeContext,
    });
  },
});

const fetchWhaleActivity = createStep({
  id: "fetch-whale-accumulation",
  description: "Estimate whale activity level",
  inputSchema: InputSchema,
  outputSchema: z.object({
    whaleActivity: z.string(),
    message: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    return await whaleAccumulationTool.execute({
      context: inputData,
      runtimeContext,
    });
  },
});

const fetchNews = createStep({
  id: "fetch-token-news",
  description: "Returns top 3 recent news headlines",
  inputSchema: InputSchema,
  outputSchema: z.object({
    headlines: z.array(z.string()),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    return await newsFetcherTool.execute({
      context: inputData,
      runtimeContext,
    });
  },
});

const compileStrategy = createStep({
  id: "compile-strategy",
  description: "Generates final response based on all insights",
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
  execute: async ({ inputData, runtimeContext }) => {
    return await strategyBuilderTool.execute({
      context: inputData,
      runtimeContext,
    });
  },
});

const compileContextData = createStep({
    id: "compile-context-data",
    description: "Combines all signals into a single context for strategy builder",
    inputSchema: z.object({
      tokenSymbol: z.string(),
      sentimentScore: z.number(),
      sentimentLevel: z.string(),
      message: z.string(),
    }),
    outputSchema: z.object({
      symbol: z.string(),
      sentimentMessage: z.string(),
      priceMessage: z.string(),
      flowMessage: z.string(),
      techMessage: z.string(),
      whaleMessage: z.string(),
    }),
    execute: async ({ inputData, runtimeContext }) => {
      const { tokenSymbol, message: sentimentMessage } = inputData;
  
      const price = await pricePerformanceTool.execute({
        context: { tokenSymbol },
        runtimeContext,
      });
  
      const flow = await capitalFlowTool.execute({
        context: { tokenSymbol },
        runtimeContext,
      });
  
      const tech = await technicalIndicatorsTool.execute({
        context: { tokenSymbol },
        runtimeContext,
      });
  
      const whale = await whaleAccumulationTool.execute({
        context: { tokenSymbol },
        runtimeContext,
      });
  
      return {
        symbol: tokenSymbol.toUpperCase(),
        sentimentMessage,
        priceMessage: `Price: $${price.price.toFixed(
          2
        )}, 24h Change: ${price.change24h.toFixed(2)}%, High: $${
          price.high24h
        }, Low: $${price.low24h}`,
        flowMessage: flow.message,
        techMessage: tech.message,
        whaleMessage: whale.message,
      };
    },
  });
  

const marketWorkflow = createWorkflow({
  id: "swiv-market-analysis",
  inputSchema: InputSchema,
  outputSchema: z.object({
    strategy: z.string(),
  }),
})
  .then(fetchMarketSentiment)
  .then(compileContextData)
  .then(compileStrategy);

marketWorkflow.commit();

export { marketWorkflow };
