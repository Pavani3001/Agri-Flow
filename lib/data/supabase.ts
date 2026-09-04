import { createClient } from "@supabase/supabase-js";
import { buyers as mockBuyers, markets as mockMarkets, storageFacilities as mockStorageFacilities, transportOptions as mockTransportOptions } from "@/lib/data/mock-data";
import type { Buyer, Market, StorageFacility, TransportOption } from "@/lib/types";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const normalizedSupabaseUrl = supabaseUrl
  ? new URL(supabaseUrl.replace(/\/+$/, "")).origin
  : null;
export const supabase = normalizedSupabaseUrl && supabaseKey ? createClient(normalizedSupabaseUrl, supabaseKey) : null;

const value = (row: Record<string, unknown>, camelCase: string, snakeCase: string) =>
  row[camelCase] ?? row[snakeCase];

const mapMarket = (row: Record<string, unknown>): Market => ({
  id: String(row.id),
  name: String(row.name),
  location: String(row.location),
  pricePerKg: Number(value(row, "pricePerKg", "price_per_kg")),
  demand: String(row.demand),
  maximumQuantity: Number(value(row, "maximumQuantity", "maximum_quantity")),
  distanceKm: Number(value(row, "distanceKm", "distance_km")),
  closingTime: String(value(row, "closingTime", "closing_time")),
});

const mapStorageFacility = (row: Record<string, unknown>): StorageFacility => ({
  id: String(row.id),
  name: String(row.name),
  type: row.type as StorageFacility["type"],
  totalCapacity: Number(value(row, "totalCapacity", "total_capacity")),
  availableCapacity: Number(value(row, "availableCapacity", "available_capacity")),
  costPerKgPerDay: Number(value(row, "costPerKgPerDay", "cost_per_kg_per_day")),
  distanceKm: Number(value(row, "distanceKm", "distance_km")),
  temperatureControlled: Boolean(value(row, "temperatureControlled", "temperature_controlled")),
  status: row.status as StorageFacility["status"],
});

const mapTransportOption = (row: Record<string, unknown>): TransportOption => ({
  id: String(row.id),
  provider: String(row.provider),
  capacity: Number(row.capacity),
  cost: Number(row.cost),
  available: Boolean(row.available),
  departureTime: String(value(row, "departureTime", "departure_time")),
  arrivalTime: String(value(row, "arrivalTime", "arrival_time")),
  destination: String(row.destination),
});

const mapBuyer = (row: Record<string, unknown>): Buyer => ({
  id: String(row.id),
  name: String(row.name),
  crop: row.crop as Buyer["crop"],
  requiredQuantity: Number(value(row, "requiredQuantity", "required_quantity")),
  offeredPrice: Number(value(row, "offeredPrice", "offered_price")),
  deadline: String(row.deadline),
  location: String(row.location),
});

async function loadTable<T>(table: string, fallback: T[], map: (row: Record<string, unknown>) => T): Promise<T[]> {
  if (!supabase) return fallback;

  const { data, error } = await supabase.from(table).select("*");
  if (error || !data?.length) {
    console.warn(`Supabase table '${table}' was unavailable; using demo data.`);
    return fallback;
  }

  return data.map((row) => map(row as Record<string, unknown>));
}

export async function loadSupplyChainData() {
  const [markets, storageFacilities, transportOptions, buyers] = await Promise.all([
    loadTable("markets", mockMarkets, mapMarket),
    loadTable("storage_facilities", mockStorageFacilities, mapStorageFacility),
    loadTable("transport_options", mockTransportOptions, mapTransportOption),
    loadTable("buyers", mockBuyers, mapBuyer),
  ]);

  return { markets, storageFacilities, transportOptions, buyers };
}

export async function logAiRequest({
  userMessage,
  taskType,
  modelUsed,
  aiResponse,
  latencyMs,
}: {
  userMessage: string;
  taskType: string;
  modelUsed: string;
  aiResponse: string;
  latencyMs: number;
}): Promise<{ success: boolean; error?: unknown }> {
  if (!supabase) {
    const error = new Error("Supabase is not configured.");
    console.warn("[Analytics] Insert failed:", error);
    return { success: false, error };
  }

  try {
    console.info("[Analytics] Attempting to insert ai_requests row");
    const { error } = await supabase.schema("public").from("ai_requests").insert({
        user_message: userMessage,
        task_type: taskType,
        model_used: modelUsed,
        ai_response: aiResponse,
        latency_ms: latencyMs,
      });

    if (error) {
      console.warn("[Analytics] Insert failed:", error);
      return { success: false, error };
    } else {
      console.info("[Analytics] Insert successful", { taskType, modelUsed, latencyMs });
      return { success: true };
    }
  } catch (error) {
    console.warn("[Analytics] Insert failed:", error);
    return { success: false, error };
  }
}