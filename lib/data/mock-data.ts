import type { Buyer, Crop, Market, StorageFacility, TransportOption } from "@/lib/types";

export const markets: Market[] = [
  {
    id: "market-a",
    name: "Market A",
    location: "Coimbatore",
    pricePerKg: 28,
    demand: "High",
    maximumQuantity: 8000,
    distanceKm: 48,
    closingTime: "17:00",
  },
  {
    id: "market-b",
    name: "Market B",
    location: "Madurai",
    pricePerKg: 32,
    demand: "Very High",
    maximumQuantity: 9000,
    distanceKm: 120,
    closingTime: "18:00",
  },
  {
    id: "market-c",
    name: "Market C",
    location: "Bengaluru",
    pricePerKg: 30,
    demand: "Moderate",
    maximumQuantity: 7000,
    distanceKm: 210,
    closingTime: "16:30",
  },
];

export const storageFacilities: StorageFacility[] = [
  {
    id: "storage-a",
    name: "Cold Storage A",
    type: "Cold Storage",
    totalCapacity: 4000,
    availableCapacity: 2500,
    costPerKgPerDay: 1.1,
    distanceKm: 24,
    temperatureControlled: true,
    status: "Available",
  },
  {
    id: "storage-b",
    name: "Warehouse B",
    type: "Warehouse",
    totalCapacity: 3000,
    availableCapacity: 2000,
    costPerKgPerDay: 0.7,
    distanceKm: 36,
    temperatureControlled: false,
    status: "Available",
  },
  {
    id: "storage-c",
    name: "Cold Storage C",
    type: "Cold Storage",
    totalCapacity: 5000,
    availableCapacity: 800,
    costPerKgPerDay: 1.5,
    distanceKm: 55,
    temperatureControlled: true,
    status: "Limited",
  },
];

export const transportOptions: TransportOption[] = [
  {
    id: "truck-a",
    provider: "Truck A",
    capacity: 5000,
    cost: 4500,
    available: true,
    departureTime: "06:00",
    arrivalTime: "10:00",
    destination: "Coimbatore",
  },
  {
    id: "truck-b",
    provider: "Truck B",
    capacity: 8000,
    cost: 6500,
    available: true,
    departureTime: "07:30",
    arrivalTime: "12:00",
    destination: "Madurai",
  },
  {
    id: "truck-c",
    provider: "Truck C",
    capacity: 10000,
    cost: 8200,
    available: false,
    departureTime: "05:30",
    arrivalTime: "08:30",
    destination: "Bengaluru",
  },
];

export const buyers: Buyer[] = [
  {
    id: "buyer-1",
    name: "FreshHarvest Co.",
    crop: "Tomato",
    requiredQuantity: 5000,
    offeredPrice: 31.5,
    deadline: "Tomorrow 18:00",
    location: "Coimbatore",
  },
  {
    id: "buyer-2",
    name: "Metro Retail Hub",
    crop: "Tomato",
    requiredQuantity: 4000,
    offeredPrice: 33,
    deadline: "Tomorrow 21:00",
    location: "Madurai",
  },
  {
    id: "buyer-3",
    name: "Agri-Direct Foods",
    crop: "Tomato",
    requiredQuantity: 3500,
    offeredPrice: 29,
    deadline: "Day after tomorrow 12:00",
    location: "Bengaluru",
  },
];

export const demoHarvest = {
  crop: "Tomato" as Crop,
  quantityKg: 10000,
  harvestDate: "Tomorrow",
  farmLocation: "Dindigul",
  quality: "Grade A",
  storageAvailable: 2000,
  preferredSellingDate: "Within 48 hours",
};
