"use client";

import { useState } from "react";
import Link from "next/link";

const demoHarvest = {
  crop: "Tomato",
  quantityKg: 10000,
  harvestDate: "Tomorrow",
  farmLocation: "Dindigul",
  quality: "Grade A",
  storageAvailable: 2000,
  preferredSellingDate: "Within 48 hours",
};

const defaultScenario = {
  marketPriceAdjustment: 0,
  truckUnavailableId: "",
  storageUnavailableId: "",
  buyerCancelledId: "",
  spoilageRiskFactor: 1,
  harvestQuantityOverride: "",
};

const marketData = [
  { id: "market-a", name: "Market A", pricePerKg: 28, demand: "High", maximumQuantity: 8000 },
  { id: "market-b", name: "Market B", pricePerKg: 32, demand: "Very High", maximumQuantity: 9000 },
  { id: "market-c", name: "Market C", pricePerKg: 30, demand: "Moderate", maximumQuantity: 7000 },
];

const storageData = [
  { id: "storage-a", name: "Cold Storage A", totalCapacity: 4000, availableCapacity: 2500, costPerKgPerDay: 1.1, status: "Available" },
  { id: "storage-b", name: "Warehouse B", totalCapacity: 3000, availableCapacity: 2000, costPerKgPerDay: 0.7, status: "Available" },
  { id: "storage-c", name: "Cold Storage C", totalCapacity: 5000, availableCapacity: 800, costPerKgPerDay: 1.5, status: "Limited" },
];

const transportData = [
  { id: "truck-a", provider: "Truck A", capacity: 5000, cost: 4500, available: true },
  { id: "truck-b", provider: "Truck B", capacity: 8000, cost: 6500, available: true },
  { id: "truck-c", provider: "Truck C", capacity: 10000, cost: 8200, available: false },
];

const buyerData = [
  { id: "buyer-1", name: "FreshHarvest Co.", crop: "Tomato", offeredPrice: 31.5 },
  { id: "buyer-2", name: "Metro Retail Hub", crop: "Tomato", offeredPrice: 33 },
  { id: "buyer-3", name: "Agri-Direct Foods", crop: "Tomato", offeredPrice: 29 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HomePage() {
  const [harvest, setHarvest] = useState(demoHarvest);
  const [scenario, setScenario] = useState(defaultScenario);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatInput, setChatInput] = useState("Why did you choose this plan?");
  const [chatAnswer, setChatAnswer] = useState("AgriFlow evaluates the actual price, storage, transport, and spoilage data before selecting the best route.");

  const runAnalysis = async (customQuestion?: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...harvest,
          quantityKg: Number(harvest.quantityKg),
          storageAvailable: Number(harvest.storageAvailable),
          scenario: {
            ...scenario,
            marketPriceAdjustment: Number(scenario.marketPriceAdjustment || 0),
            harvestQuantityOverride: scenario.harvestQuantityOverride
              ? Number(scenario.harvestQuantityOverride)
              : undefined,
            spoilageRiskFactor: Number(scenario.spoilageRiskFactor || 1),
          },
          question: customQuestion ?? "Why did you choose this plan?",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Analysis could not be completed.");
      }

      setAnalysis(data.analysis);
      setChatAnswer(data.analysis.aiMessage || "I evaluated the current market, storage, transport, and spoilage factors before planning the supply chain.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const loadDemoScenario = () => {
    setHarvest(demoHarvest);
    setScenario(defaultScenario);
    setError("");
    void runAnalysis("Why did you choose this plan?");
  };

  const marketSummary = analysis?.marketPrices ?? marketData;
  const storageSummary = analysis?.storageFacilities ?? storageData;
  const transportSummary = analysis?.transportOptions ?? transportData;
  const buyerSummary = analysis?.buyerOffers ?? buyerData;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ebf7ee_0%,_#f7f9f4_35%,_#f3f4f6_100%)] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl border border-emerald-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">AgriFlow</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Farm Supply Chain Decision Agent</h1>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
              <Link href="/analytics" className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-emerald-700 transition hover:border-emerald-400">
                Analytics
              </Link>
            </nav>
          </div>
        </header>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Current Harvest</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{harvest.crop}</h2>
              </div>
              <button
                type="button"
                onClick={loadDemoScenario}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                Load Demo Scenario
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Quantity" value={`${harvest.quantityKg.toLocaleString()} kg`} accent="emerald" />
              <StatCard label="Harvest date" value={harvest.harvestDate} accent="amber" />
              <StatCard label="Location" value={harvest.farmLocation} accent="sky" />
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-700 to-emerald-900 p-5 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">AI Recommendation</p>
            <h2 className="mt-3 text-3xl font-bold">
              {analysis ? formatCurrency(analysis.plan.estimatedNetProfit) : "₹0"}
            </h2>
            <p className="mt-2 text-sm text-emerald-100">Estimated net revenue</p>
            <div className="mt-5 rounded-2xl bg-white/10 p-3 text-sm text-emerald-50">
              {analysis ? analysis.plan.explanation[0] : "The agent will compare prices, storage, transport, and spoilage before generating the plan."}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Harvest input</h3>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">Ready for decision</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Crop">
                <select value={harvest.crop} onChange={(e) => setHarvest({ ...harvest, crop: e.target.value })} className="field-input">
                  <option>Tomato</option>
                  <option>Wheat</option>
                  <option>Rice</option>
                  <option>Corn</option>
                  <option>Onion</option>
                  <option>Potato</option>
                </select>
              </Field>
              <Field label="Quantity in kg">
                <input type="number" value={harvest.quantityKg} onChange={(e) => setHarvest({ ...harvest, quantityKg: Number(e.target.value) })} className="field-input" />
              </Field>
              <Field label="Harvest date">
                <input type="text" value={harvest.harvestDate} onChange={(e) => setHarvest({ ...harvest, harvestDate: e.target.value })} className="field-input" />
              </Field>
              <Field label="Farm location">
                <input type="text" value={harvest.farmLocation} onChange={(e) => setHarvest({ ...harvest, farmLocation: e.target.value })} className="field-input" />
              </Field>
              <Field label="Crop quality">
                <select value={harvest.quality} onChange={(e) => setHarvest({ ...harvest, quality: e.target.value })} className="field-input">
                  <option>Grade A</option>
                  <option>Grade B</option>
                  <option>Grade C</option>
                </select>
              </Field>
              <Field label="Available storage">
                <input type="number" value={harvest.storageAvailable} onChange={(e) => setHarvest({ ...harvest, storageAvailable: Number(e.target.value) })} className="field-input" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Preferred selling date">
                  <input type="text" value={harvest.preferredSellingDate} onChange={(e) => setHarvest({ ...harvest, preferredSellingDate: e.target.value })} className="field-input" />
                </Field>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => void runAnalysis()} className="primary-btn">
                {loading ? "Analyzing..." : "Analyze Supply Chain"}
              </button>
              <button type="button" onClick={() => setScenario(defaultScenario)} className="secondary-btn">
                Reset Scenario
              </button>
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">What-If simulation</h3>
            <div className="mt-4 space-y-4">
              <Field label="Market price adjustment %">
                <input type="number" value={scenario.marketPriceAdjustment} onChange={(e) => setScenario({ ...scenario, marketPriceAdjustment: Number(e.target.value) })} className="field-input" />
              </Field>
              <Field label="Truck unavailable">
                <select value={scenario.truckUnavailableId} onChange={(e) => setScenario({ ...scenario, truckUnavailableId: e.target.value })} className="field-input">
                  <option value="">No disruption</option>
                  <option value="truck-a">Truck A</option>
                  <option value="truck-b">Truck B</option>
                  <option value="truck-c">Truck C</option>
                </select>
              </Field>
              <Field label="Storage unavailable">
                <select value={scenario.storageUnavailableId} onChange={(e) => setScenario({ ...scenario, storageUnavailableId: e.target.value })} className="field-input">
                  <option value="">No disruption</option>
                  <option value="storage-a">Cold Storage A</option>
                  <option value="storage-b">Warehouse B</option>
                  <option value="storage-c">Cold Storage C</option>
                </select>
              </Field>
              <Field label="Buyer cancellation">
                <select value={scenario.buyerCancelledId} onChange={(e) => setScenario({ ...scenario, buyerCancelledId: e.target.value })} className="field-input">
                  <option value="">No cancellation</option>
                  <option value="buyer-1">FreshHarvest Co.</option>
                  <option value="buyer-2">Metro Retail Hub</option>
                  <option value="buyer-3">Agri-Direct Foods</option>
                </select>
              </Field>
              <Field label="Spoilage risk factor">
                <input type="number" min="0.5" step="0.1" value={scenario.spoilageRiskFactor} onChange={(e) => setScenario({ ...scenario, spoilageRiskFactor: Number(e.target.value) })} className="field-input" />
              </Field>
              <Field label="Harvest quantity override">
                <input type="number" value={scenario.harvestQuantityOverride} onChange={(e) => setScenario({ ...scenario, harvestQuantityOverride: e.target.value })} className="field-input" />
              </Field>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Panel title="Market Overview" value="3 markets" description="Price comparison" content={
            <div className="space-y-3">
              {marketSummary.map((market: any) => (
                <div key={market.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <div>
                    <p className="font-semibold text-slate-800">{market.name}</p>
                    <p className="text-xs text-slate-500">{market.demand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">₹{market.pricePerKg}/kg</p>
                    <p className="text-xs text-slate-500">{market.maximumQuantity} kg max</p>
                  </div>
                </div>
              ))}
            </div>
          } />

          <Panel title="Storage" value="3 facilities" description="Capacity and status" content={
            <div className="space-y-3">
              {storageSummary.map((facility: any) => (
                <div key={facility.id} className="rounded-2xl bg-slate-50 px-3 py-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-800">{facility.name}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{facility.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Available: {facility.availableCapacity} kg / {facility.totalCapacity} kg</p>
                </div>
              ))}
            </div>
          } />

          <Panel title="Transport" value="3 options" description="Vehicle and route status" content={
            <div className="space-y-3">
              {transportSummary.map((option: any) => (
                <div key={option.id} className="rounded-2xl bg-slate-50 px-3 py-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-800">{option.provider}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${option.available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {option.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Capacity {option.capacity} kg • Cost {formatCurrency(option.cost)}</p>
                </div>
              ))}
            </div>
          } />
        </section>

        <section className="mb-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Recommended supply-chain plan</h3>
            {analysis ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Recommended Plan</p>
                  <h4 className="mt-2 text-2xl font-bold text-slate-900">{analysis.plan.storageDecision}</h4>
                  <p className="mt-1 text-sm text-slate-600">Transport: {analysis.plan.transportation}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Metric label="Gross Revenue" value={formatCurrency(analysis.plan.grossRevenue)} />
                  <Metric label="Transport Cost" value={formatCurrency(analysis.plan.transportCost)} />
                  <Metric label="Storage Cost" value={formatCurrency(analysis.plan.storageCost)} />
                  <Metric label="Spoilage Loss" value={formatCurrency(analysis.plan.spoilageLoss)} />
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-800">Allocation</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {analysis.plan.allocation.map((item: any, idx: number) => (
                      <li key={`${item.destination}-${idx}`} className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span>{item.quantityKg.toLocaleString()} kg → {item.destination}</span>
                        <span className="font-medium text-slate-800">{item.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-800">Why this plan?</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {analysis.plan.explanation.map((reason: string, idx: number) => (
                      <li key={reason} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No recommendation generated yet. Click “Analyze Supply Chain” to evaluate the current harvest.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Agent Activity</h3>
            <div className="mt-4 space-y-3">
              {[
                "Checking market prices",
                "Checking buyer demand",
                "Checking storage capacity",
                "Checking transportation",
                "Estimating spoilage",
                "Comparing supply-chain plans",
                "Generating recommendation",
              ].map((step) => (
                <div key={step} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{step}</span>
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Spoilage Risk</p>
              <h4 className="mt-2 text-3xl font-bold text-slate-900">
                {analysis ? analysis.spoilageEstimate.riskLevel : "Low"}
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                {analysis ? `${analysis.spoilageEstimate.percentage}% expected loss (${analysis.spoilageEstimate.kilograms} kg)` : "No current estimate available."}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">AI Agent Chat</h3>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              {chatAnswer}
            </div>
            {analysis?.routingDecision ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Routing Decision</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${analysis.routingDecision.gatewayUsed ? "bg-emerald-600 text-white" : "bg-amber-200 text-amber-800"}`}>
                    {analysis.routingDecision.gatewayUsed ? "Gateway confirmed" : "Fallback used"}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <RoutingRow label="Task" value={analysis.routingDecision.taskType} />
                  <RoutingRow label="Model" value={analysis.routingDecision.selectedModel} />
                  <RoutingRow label="Gateway" value={analysis.routingDecision.gateway} />
                  <RoutingRow label="Latency" value={`${analysis.routingDecision.latencyMs} ms`} />
                </dl>
                <p className="mt-3 border-t border-emerald-200 pt-3 text-xs leading-5 text-emerald-800">
                  <span className="font-semibold">Reason:</span> {analysis.routingDecision.reason}
                </p>
              </div>
            ) : null}
            <div className="mt-4 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="field-input flex-1"
                placeholder="Ask the agent a question"
              />
              <button type="button" onClick={() => void runAnalysis(chatInput)} className="primary-btn">
                Ask
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {[
                "Which market should I sell to?",
                "Should I store the tomatoes?",
                "What happens if Market B price drops 15%?",
                "Which truck should I use?",
              ].map((prompt) => (
                <button key={prompt} type="button" onClick={() => setChatInput(prompt)} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700">
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Market price comparison</h3>
            <div className="mt-5 grid gap-3">
              {marketSummary.map((market: any) => (
                <div key={market.id}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                    <span>{market.name}</span>
                    <span>₹{market.pricePerKg}/kg</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${(market.pricePerKg / 34) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Buyer offers</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {buyerSummary.map((buyer: any) => (
                  <div key={buyer.id} className="flex justify-between">
                    <span>{buyer.name}</span>
                    <span>₹{buyer.offeredPrice}/kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">About AgriFlow</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            AgriFlow does not just answer questions. It evaluates the current supply-chain state, calls specialized tools, compares likely actions, and generates an optimized plan. The system combines price, storage, buyer demand, transport, and spoilage signals to produce a recommendation that farmers can act on with confidence.
          </p>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: "emerald" | "amber" | "sky" }) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
  };

  return (
    <div className={`rounded-2xl p-3 ring-1 ${colorMap[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-80">{label}</p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function Panel({ title, value, description, content }: { title: string; value: string; description: string; content: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">{description}</span>
      </div>
      {content}
    </div>
  );
}

function RoutingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

