import { getBuyerOffers, getMarketPrices, getStorageAvailability, getTransportAvailability, estimateSpoilage, calculateRevenue, createSupplyChainPlan } from "@/lib/calculations/supply-chain";

export const agentTools = [
  {
    name: "getMarketPrices",
    description: "Return market prices and demand for the crop under current market conditions.",
    execute: async (args: Record<string, unknown>) => getMarketPrices(Number(args.marketPriceAdjustment ?? 0)),
  },
  {
    name: "getStorageAvailability",
    description: "Return available storage facilities and capacity left.",
    execute: async (args: Record<string, unknown>) =>
      getStorageAvailability(String(args.storageUnavailableId ?? "")),
  },
  {
    name: "getTransportAvailability",
    description: "Return transportation options and route capacity.",
    execute: async (args: Record<string, unknown>) =>
      getTransportAvailability(String(args.truckUnavailableId ?? "")),
  },
  {
    name: "getBuyerOffers",
    description: "Return current buyers and offers for the crop.",
    execute: async (args: Record<string, unknown>) =>
      getBuyerOffers(String(args.crop ?? "Tomato"), String(args.buyerCancelledId ?? "")),
  },
  {
    name: "estimateSpoilage",
    description: "Estimate expected spoilage using crop, storage, duration, and scenario risk.",
    execute: async (args: Record<string, unknown>) =>
      estimateSpoilage({
        crop: String(args.crop ?? "Tomato"),
        quantity: Number(args.quantity ?? 0),
        storageType: String(args.storageType ?? "Cold Storage"),
        durationDays: Number(args.durationDays ?? 2),
        riskFactor: Number(args.riskFactor ?? 1),
      }),
  },
  {
    name: "calculateRevenue",
    description: "Calculate gross revenue, costs, spoilage loss, and net revenue.",
    execute: async (args: Record<string, unknown>) =>
      calculateRevenue({
        soldQuantity: Number(args.soldQuantity ?? 0),
        pricePerKg: Number(args.pricePerKg ?? 0),
        transportCost: Number(args.transportCost ?? 0),
        storageCost: Number(args.storageCost ?? 0),
        spoilageLoss: Number(args.spoilageLoss ?? 0),
      }),
  },
  {
    name: "createSupplyChainPlan",
    description: "Generate a structured farm supply-chain plan based on market, storage, buyer and transport data.",
    execute: async (args: Record<string, unknown>) =>
      createSupplyChainPlan({
        crop: String(args.crop ?? "Tomato"),
        harvestQuantityKg: Number(args.harvestQuantityKg ?? 0),
        marketPrices: Array.isArray(args.marketPrices) ? (args.marketPrices as any[]) : [],
        storageOptions: Array.isArray(args.storageOptions) ? (args.storageOptions as any[]) : [],
        transportOptions: Array.isArray(args.transportOptions) ? (args.transportOptions as any[]) : [],
        buyerOffers: Array.isArray(args.buyerOffers) ? (args.buyerOffers as any[]) : [],
        scenario: (args.scenario as any) ?? {},
      }),
  },
];

export const toolRegistry = Object.fromEntries(agentTools.map((tool) => [tool.name, tool]));
