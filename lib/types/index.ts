export type Crop = "Tomato" | "Wheat" | "Rice" | "Corn" | "Onion" | "Potato";

export type Market = {
  id: string;
  name: string;
  location: string;
  pricePerKg: number;
  demand: string;
  maximumQuantity: number;
  distanceKm: number;
  closingTime: string;
};

export type StorageFacility = {
  id: string;
  name: string;
  type: "Cold Storage" | "Warehouse" | "Open Yard";
  totalCapacity: number;
  availableCapacity: number;
  costPerKgPerDay: number;
  distanceKm: number;
  temperatureControlled: boolean;
  status: "Available" | "Limited" | "Unavailable";
};

export type TransportOption = {
  id: string;
  provider: string;
  capacity: number;
  cost: number;
  available: boolean;
  departureTime: string;
  arrivalTime: string;
  destination: string;
};

export type Buyer = {
  id: string;
  name: string;
  crop: Crop;
  requiredQuantity: number;
  offeredPrice: number;
  deadline: string;
  location: string;
};

export type HarvestInput = {
  crop: Crop;
  quantityKg: number;
  harvestDate: string;
  farmLocation: string;
  quality: string;
  storageAvailable: number;
  preferredSellingDate: string;
};

export type ScenarioChanges = {
  marketPriceAdjustment?: number;
  truckUnavailableId?: string;
  storageUnavailableId?: string;
  buyerCancelledId?: string;
  spoilageRiskFactor?: number;
  harvestQuantityOverride?: number;
};

export type AgentStep = {
  label: string;
  done: boolean;
};

export type AllocationItem = {
  quantityKg: number;
  destination: string;
  type: "Market" | "Storage" | "Buyer";
};

export type PlanSummary = {
  crop: Crop;
  harvestQuantityKg: number;
  allocation: AllocationItem[];
  storageDecision: string;
  buyerSelection: string;
  transportation: string;
  expectedRevenue: number;
  expectedCost: number;
  expectedSpoilage: number;
  estimatedNetProfit: number;
  grossRevenue: number;
  transportCost: number;
  storageCost: number;
  spoilageLoss: number;
  explanation: string[];
  recommendedMarket: string;
};

export type SupplyChainAnalysis = {
  marketPrices: Market[];
  storageFacilities: StorageFacility[];
  transportOptions: TransportOption[];
  buyerOffers: Buyer[];
  spoilageEstimate: {
    percentage: number;
    kilograms: number;
    riskLevel: "Low" | "Medium" | "High";
  };
  plan: PlanSummary;
  activity: AgentStep[];
  scenario: ScenarioChanges;
  modelUsed: boolean;
  aiMessage?: string;
};
