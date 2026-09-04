import { buyers, markets, storageFacilities, transportOptions } from "@/lib/data/mock-data";
import { loadSupplyChainData } from "@/lib/data/supabase";
import type {
  AllocationItem,
  Buyer,
  HarvestInput,
  Market,
  PlanSummary,
  ScenarioChanges,
  StorageFacility,
  SupplyChainAnalysis,
  TransportOption,
} from "@/lib/types";

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const getMarketPrices = (adjustmentPercent = 0, source: Market[] = markets) =>
  source.map((market) => ({
    ...market,
    pricePerKg: roundCurrency(market.pricePerKg * (1 + adjustmentPercent / 100)),
  }));

export const getStorageAvailability = (storageUnavailableId?: string, source: StorageFacility[] = storageFacilities): StorageFacility[] =>
  source.map((facility): StorageFacility =>
    facility.id === storageUnavailableId
      ? { ...facility, availableCapacity: 0, status: "Unavailable" }
      : facility,
  );

export const getTransportAvailability = (truckUnavailableId?: string, source: TransportOption[] = transportOptions): TransportOption[] =>
  source.map((option): TransportOption =>
    option.id === truckUnavailableId ? { ...option, available: false } : option,
  );

export const getBuyerOffers = (crop: string, buyerCancelledId?: string, source: Buyer[] = buyers) =>
  source.filter(
    (buyer) => buyer.crop.toLowerCase() === crop.toLowerCase() && buyer.id !== buyerCancelledId,
  );

export const estimateSpoilage = ({
  crop,
  quantity,
  storageType,
  durationDays,
  riskFactor = 1,
}: {
  crop: string;
  quantity: number;
  storageType: string;
  durationDays: number;
  riskFactor?: number;
}) => {
  const cropRisk = crop.toLowerCase() === "tomato" ? 0.014 : 0.01;
  const storageMultiplier = storageType.toLowerCase().includes("cold") ? 0.65 : 1.1;
  const durationMultiplier = 1 + durationDays * 0.02;
  const percentage = Math.min(18, cropRisk * storageMultiplier * durationMultiplier * riskFactor * 100);
  const kilograms = (quantity * percentage) / 100;

  const riskLevel: "Low" | "Medium" | "High" =
    percentage > 10 ? "High" : percentage > 5 ? "Medium" : "Low";

  return {
    percentage: roundCurrency(percentage),
    kilograms: roundCurrency(kilograms),
    riskLevel,
  };
};

export const calculateRevenue = ({
  soldQuantity,
  pricePerKg,
  transportCost,
  storageCost,
  spoilageLoss,
}: {
  soldQuantity: number;
  pricePerKg: number;
  transportCost: number;
  storageCost: number;
  spoilageLoss: number;
}) => {
  const grossRevenue = soldQuantity * pricePerKg;
  const totalCost = transportCost + storageCost + spoilageLoss;
  const netRevenue = grossRevenue - totalCost;

  return {
    grossRevenue: roundCurrency(grossRevenue),
    transportCost: roundCurrency(transportCost),
    storageCost: roundCurrency(storageCost),
    spoilageLoss: roundCurrency(spoilageLoss),
    netRevenue: roundCurrency(netRevenue),
  };
};

export const createSupplyChainPlan = ({
  crop,
  harvestQuantityKg,
  marketPrices,
  storageOptions,
  transportOptions,
  buyerOffers,
  scenario,
}: {
  crop: string;
  harvestQuantityKg: number;
  marketPrices: Market[];
  storageOptions: StorageFacility[];
  transportOptions: TransportOption[];
  buyerOffers: Buyer[];
  scenario: ScenarioChanges;
}): PlanSummary => {
  const marketWithHighestPrice = [...marketPrices].sort((a, b) => b.pricePerKg - a.pricePerKg)[0];
  const selectedTransport = [...transportOptions]
    .filter((option) => option.available)
    .sort((a, b) => a.cost - b.cost)[0];
  const coldStorage = storageOptions.find(
    (facility) => facility.type === "Cold Storage" && facility.status === "Available" && facility.availableCapacity > 0,
  );
  const availableStorage = storageOptions.filter(
    (facility) => facility.status !== "Unavailable" && facility.availableCapacity > 0,
  );

  const sellDirectQuantity = Math.min(
    harvestQuantityKg,
    marketWithHighestPrice.maximumQuantity,
  );
  const storedQuantity = Math.max(0, Math.min(harvestQuantityKg - sellDirectQuantity, coldStorage?.availableCapacity ?? 0));
  const marketSoldQuantity = Math.max(0, harvestQuantityKg - storedQuantity);

  const transportCost = selectedTransport ? selectedTransport.cost : 0;
  const storageCost = coldStorage ? storedQuantity * coldStorage.costPerKgPerDay * 1.5 : 0;
  const spoilage = estimateSpoilage({
    crop,
    quantity: storedQuantity + marketSoldQuantity,
    storageType: coldStorage ? "Cold Storage" : "Warehouse",
    durationDays: 2,
    riskFactor: scenario.spoilageRiskFactor ?? 1,
  });
  const spoilageLoss = (spoilage.percentage / 100) * (marketWithHighestPrice.pricePerKg * marketSoldQuantity || 1);

  const grossRevenue = calculateRevenue({
    soldQuantity: marketSoldQuantity,
    pricePerKg: marketWithHighestPrice.pricePerKg,
    transportCost,
    storageCost,
    spoilageLoss,
  });

  const buyerBest = [...buyerOffers].sort((a, b) => b.offeredPrice - a.offeredPrice)[0];
  const buyerGross = buyerBest ? buyerBest.offeredPrice * Math.min(harvestQuantityKg, buyerBest.requiredQuantity) : 0;
  const buyerNet = buyerGross - transportCost - storageCost - spoilageLoss;

  const chosenPlanGross = buyerNet > grossRevenue.netRevenue ? buyerGross : grossRevenue.grossRevenue;
  const chosenNet = buyerNet > grossRevenue.netRevenue ? buyerNet : grossRevenue.netRevenue;

  const allocation: AllocationItem[] = [
    { quantityKg: Math.max(0, storedQuantity), destination: coldStorage?.name ?? "No cold storage", type: "Storage" },
    { quantityKg: Math.max(0, marketSoldQuantity), destination: marketWithHighestPrice.name, type: "Market" },
    ...(buyerBest ? [{ quantityKg: Math.min(harvestQuantityKg, buyerBest.requiredQuantity), destination: buyerBest.name, type: "Buyer" as const }] : []),
  ].filter((entry) => entry.quantityKg > 0) as AllocationItem[];

  const plan: PlanSummary = {
    crop: crop as any,
    harvestQuantityKg,
    allocation,
    storageDecision: coldStorage ? `${coldStorage.name} (${storedQuantity} kg)` : "No suitable storage available",
    buyerSelection: buyerBest ? buyerBest.name : "No active buyer",
    transportation: selectedTransport ? `${selectedTransport.provider} (${selectedTransport.capacity} kg)` : "No viable transport",
    expectedRevenue: roundCurrency(Math.max(grossRevenue.grossRevenue, buyerGross)),
    expectedCost: roundCurrency(Math.max(transportCost + storageCost + spoilageLoss, 0)),
    expectedSpoilage: roundCurrency(spoilage.percentage),
    estimatedNetProfit: roundCurrency(chosenNet),
    grossRevenue: roundCurrency(Math.max(grossRevenue.grossRevenue, buyerGross)),
    transportCost: roundCurrency(transportCost),
    storageCost: roundCurrency(storageCost),
    spoilageLoss: roundCurrency(spoilageLoss),
    explanation: [
      `${marketWithHighestPrice.name} offers the strongest selling price at ₹${marketWithHighestPrice.pricePerKg}/kg.`,
      coldStorage ? `${coldStorage.name} keeps the crop stable and reduces risk.` : "No cold storage option is available, so risk rises.",
      selectedTransport ? `${selectedTransport.provider} has enough capacity for the chosen route.` : "No suitable transport is available.",
      `Projected spoilage is ${spoilage.percentage}% based on current storage and crop conditions.`,
    ],
    recommendedMarket: marketWithHighestPrice.name,
  };

  return plan;
};

export const buildAnalysis = async ({
  harvestInput,
  scenario,
}: {
  harvestInput: HarvestInput;
  scenario: ScenarioChanges;
}): Promise<SupplyChainAnalysis> => {
  const data = await loadSupplyChainData();
  const adjustedMarketPrices = getMarketPrices(scenario.marketPriceAdjustment ?? 0, data.markets);
  const availableStorage = getStorageAvailability(scenario.storageUnavailableId, data.storageFacilities);
  const availableTransport = getTransportAvailability(scenario.truckUnavailableId, data.transportOptions);
  const buyerOffers = getBuyerOffers(harvestInput.crop, scenario.buyerCancelledId, data.buyers);
  const quantity = scenario.harvestQuantityOverride ?? harvestInput.quantityKg;
  const spoilageEstimate = estimateSpoilage({
    crop: harvestInput.crop,
    quantity,
    storageType: "Cold Storage",
    durationDays: 2,
    riskFactor: scenario.spoilageRiskFactor ?? 1,
  });

  const plan = createSupplyChainPlan({
    crop: harvestInput.crop,
    harvestQuantityKg: quantity,
    marketPrices: adjustedMarketPrices,
    storageOptions: availableStorage,
    transportOptions: availableTransport,
    buyerOffers,
    scenario,
  });

  return {
    marketPrices: adjustedMarketPrices,
    storageFacilities: availableStorage,
    transportOptions: availableTransport,
    buyerOffers,
    spoilageEstimate,
    plan,
    activity: [
      { label: "Checking market prices", done: true },
      { label: "Checking buyer demand", done: true },
      { label: "Checking storage capacity", done: true },
      { label: "Checking transportation", done: true },
      { label: "Estimating spoilage", done: true },
      { label: "Comparing supply-chain plans", done: true },
      { label: "Generating recommendation", done: true },
    ],
    scenario,
    modelUsed: false,
  };
};
