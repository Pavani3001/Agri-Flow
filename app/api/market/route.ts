import { NextResponse } from "next/server";
import { getMarketPrices } from "@/lib/calculations/supply-chain";
import { loadSupplyChainData } from "@/lib/data/supabase";

export async function GET() {
  const data = await loadSupplyChainData();
  return NextResponse.json({ markets: getMarketPrices(0, data.markets) });
}
