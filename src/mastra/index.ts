import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { swivMarketAgent } from "./agents/swiv-sentiment-agent/swiv-sentiment-agent";
import { marketWorkflow } from "./agents/swiv-sentiment-agent/workflow";

export const mastra = new Mastra({
	workflows: { marketWorkflow },
	agents: { swivMarketAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
