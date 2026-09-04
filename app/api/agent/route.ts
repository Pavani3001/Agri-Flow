import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "ai";
import { buildAnalysis } from "@/lib/calculations/supply-chain";
import { getGatewayModel } from "@/lib/ai/gateway";
import { logAiRequest } from "@/lib/data/supabase";
import type { Crop } from "@/lib/types";

const inputSchema = z.object({
  crop: z.string().min(1),
  quantityKg: z.number().positive(),
  harvestDate: z.string().min(1),
  farmLocation: z.string().min(1),
  quality: z.string().min(1),
  storageAvailable: z.number().nonnegative(),
  preferredSellingDate: z.string().min(1),
  scenario: z
    .object({
      marketPriceAdjustment: z.number().optional(),
      truckUnavailableId: z.string().optional(),
      storageUnavailableId: z.string().optional(),
      buyerCancelledId: z.string().optional(),
      spoilageRiskFactor: z.number().optional(),
      harvestQuantityOverride: z.number().optional(),
    })
    .optional(),
  question: z.string().optional(),
});

function buildQuestionResponse(question: string, analysis: Awaited<ReturnType<typeof buildAnalysis>>) {
  const q = question.toLowerCase();

  if (q.includes("market") || q.includes("sell") || q.includes("buyer")) {
    return `The strongest current market signal is ${analysis.plan.recommendedMarket}, which offers ₹${analysis.marketPrices[0]?.pricePerKg ?? analysis.plan.expectedRevenue} per kg. Buyer demand is strongest in ${analysis.buyerOffers[0]?.name ?? "the current buyer set"}, and the plan is weighted toward the highest-value route.`;
  }

  if (q.includes("store") || q.includes("storage")) {
    return `Storage is being handled through ${analysis.plan.storageDecision}. This uses available cold-capacity to limit spoilage while respecting the current storage constraints.`;
  }

  if (q.includes("truck") || q.includes("transport")) {
    return `Transport is centered on ${analysis.plan.transportation}. The selected option is the most cost-effective available route that still clears the expected volume and route timing.`;
  }

  if (q.includes("profit") || q.includes("revenue") || q.includes("why")) {
    return `The recommendation is designed to maximize net revenue. Current expected net profit is ₹${analysis.plan.estimatedNetProfit.toLocaleString("en-IN")}, with gross revenue at ₹${analysis.plan.grossRevenue.toLocaleString("en-IN")} and expected spoilage at ${analysis.plan.expectedSpoilage}%.`;
  }

  if (q.includes("cold") || q.includes("spoilage")) {
    return `Spoilage is estimated at ${analysis.plan.expectedSpoilage}% based on crop type, storage conditions, and the current risk scenario. The selected storage is chosen to keep that loss low.`;
  }

  return `I reviewed the current supply-chain data and selected the plan that best balances price, storage, transport, and spoilage risk. The recommendation is based on the actual dataset and current constraints.`;
}

export async function POST(request: NextRequest) {
  const requestStartedAt = performance.now();

  try {
    const body = await request.json();
    const payload = inputSchema.parse(body);

    const analysis = await buildAnalysis({
      harvestInput: {
        crop: payload.crop as Crop,
        quantityKg: payload.quantityKg,
        harvestDate: payload.harvestDate,
        farmLocation: payload.farmLocation,
        quality: payload.quality,
        storageAvailable: payload.storageAvailable,
        preferredSellingDate: payload.preferredSellingDate,
      },
      scenario: payload.scenario ?? {},
    });

    const model = getGatewayModel();
    const taskType = payload.question ? "question_answer" : "supply_chain_analysis";
    const selectedModel = model ? process.env.AI_MODEL ?? "gpt-4o-mini" : "deterministic";
    const routingReason = model
      ? "The existing AI_MODEL configuration selected this model through Vercel AI Gateway."
      : "AI_GATEWAY_API_KEY is not configured, so the existing deterministic fallback was used.";
    let gatewayError = false;
    let aiMessage = "";

    if (payload.question) {
      if (model) {
        try {
          const result = await generateText({
            model,
            prompt: [
              "You are AgriFlow, a concise farm supply-chain decision assistant.",
              "Answer the user's question using the supplied analysis. Do not invent data.",
              `User question: ${payload.question}`,
              `Analysis: ${JSON.stringify(analysis)}`,
            ].join("\n\n"),
          });
          aiMessage = result.text;
        } catch (error) {
          gatewayError = true;
          console.error("AI Gateway request failed; using deterministic fallback.", error);
          aiMessage = buildQuestionResponse(payload.question, analysis);
        }
      } else {
        aiMessage = buildQuestionResponse(payload.question, analysis);
      }
    }

    const latencyMs = Math.round(performance.now() - requestStartedAt);
    const responseModel = gatewayError ? "deterministic_fallback" : selectedModel;

    await logAiRequest({
      userMessage: payload.question ?? "Run supply-chain analysis",
      taskType,
      modelUsed: responseModel,
      aiResponse: aiMessage,
      latencyMs,
    });

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        modelUsed: responseModel !== "deterministic_fallback",
        aiMessage,
        routingDecision: {
          taskType,
          selectedModel,
          reason: gatewayError
            ? "The Gateway request was attempted, but the provider rejected it; the existing deterministic fallback answered instead."
            : routingReason,
          gateway: gatewayError
            ? "Vercel AI Gateway (attempted; fallback used)"
            : model ? "Vercel AI Gateway" : "Not used (deterministic fallback)",
          gatewayUsed: Boolean(model) && !gatewayError,
          latencyMs,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid harvest input. Please check the form values." },
        { status: 400 },
      );
    }

    console.error("Agent request failed.", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Supply-chain analysis failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
