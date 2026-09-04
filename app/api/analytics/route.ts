import { NextResponse } from "next/server";
import { supabase } from "@/lib/data/supabase";

type AiRequest = {
  id: number;
  created_at: string;
  task_type: string | null;
  model_used: string | null;
  latency_ms: number | null;
  user_message: string;
};

export async function GET() {
  console.info("[Analytics API] Fetching ai_requests");

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .schema("public")
      .from("ai_requests")
      .select("id, created_at, task_type, model_used, latency_ms, user_message")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Analytics API] Fetch failed:", error);
      return NextResponse.json({ error: "Analytics could not be loaded." }, { status: 502 });
    }

    const requests = (data ?? []) as AiRequest[];
    console.info(`[Analytics API] Retrieved ${requests.length} rows`);
    const modelUsage = groupBy(requests, (item) => item.model_used ?? "Unknown");
    const taskTypeDistribution = groupBy(requests, (item) => item.task_type ?? "Unknown");
    const latencyValues = requests
      .map((item) => item.latency_ms)
      .filter((latency): latency is number => typeof latency === "number");

    return NextResponse.json({
      totalRequests: requests.length,
      modelUsage,
      taskTypeDistribution,
      averageLatency: latencyValues.length
        ? Math.round(latencyValues.reduce((sum, latency) => sum + latency, 0) / latencyValues.length)
        : 0,
      recentRequests: requests.slice(0, 20),
    });
  } catch (error) {
    console.warn("Unable to initialize analytics query.", error);
    return NextResponse.json({ error: "Analytics could not be loaded." }, { status: 500 });
  }
}

function groupBy(items: AiRequest[], getKey: (item: AiRequest) => string) {
  const counts: Record<string, number> = {};

  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}