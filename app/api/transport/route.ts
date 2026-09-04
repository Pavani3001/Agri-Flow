import { NextResponse } from "next/server";
import { getTransportAvailability } from "@/lib/calculations/supply-chain";
import { loadSupplyChainData } from "@/lib/data/supabase";

export async function GET() {
  const data = await loadSupplyChainData();
  return NextResponse.json({ transport: getTransportAvailability(undefined, data.transportOptions) });
}
