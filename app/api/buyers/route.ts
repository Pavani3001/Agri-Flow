import { NextResponse } from "next/server";
import { getBuyerOffers } from "@/lib/calculations/supply-chain";
import { loadSupplyChainData } from "@/lib/data/supabase";

export async function GET() {
  const data = await loadSupplyChainData();
  return NextResponse.json({ buyers: getBuyerOffers("Tomato", undefined, data.buyers) });
}
