import { NextResponse } from "next/server";
import { getStorageAvailability } from "@/lib/calculations/supply-chain";
import { loadSupplyChainData } from "@/lib/data/supabase";

export async function GET() {
  const data = await loadSupplyChainData();
  return NextResponse.json({ storage: getStorageAvailability(undefined, data.storageFacilities) });
}
