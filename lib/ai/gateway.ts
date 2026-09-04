import { createOpenAI } from "@ai-sdk/openai";

export const getGatewayModel = () => {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const modelName = process.env.AI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return null;
  }

  const gateway = createOpenAI({
    apiKey,
    baseURL: "https://ai-gateway.vercel.sh/v1",
  });

  return gateway(modelName);
};
