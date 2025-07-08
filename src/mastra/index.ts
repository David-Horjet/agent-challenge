import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { weatherAgent } from "./agents/weather-agent/weather-agent"; // This can be deleted later
import { weatherWorkflow } from "./agents/weather-agent/weather-workflow"; // This can be deleted later
import { sentimentAgent } from "./agents/your-agent/sentiment-agent"; // Build your agent here
import { marketWorkflow } from "./agents/your-agent/sentiment-workflow";

export const mastra = new Mastra({
	workflows: { weatherWorkflow, marketWorkflow }, // can be deleted later
	agents: { weatherAgent, sentimentAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
