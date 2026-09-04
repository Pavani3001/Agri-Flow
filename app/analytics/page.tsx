"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AnalyticsData = {
  totalRequests: number;
  modelUsage: { label: string; count: number }[];
  taskTypeDistribution: { label: string; count: number }[];
  averageLatency: number;
  recentRequests: {
    id: number;
    created_at: string;
    task_type: string | null;
    model_used: string | null;
    latency_ms: number | null;
    user_message: string;
  }[];
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const loadAnalytics = () => fetch("/api/analytics", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Analytics could not be loaded.");
        setAnalytics(data);
      })
      .catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "Analytics could not be loaded.");
      })
      .finally(() => setLoading(false));

    void loadAnalytics();
    window.addEventListener("focus", loadAnalytics);
    return () => window.removeEventListener("focus", loadAnalytics);
  }, [refreshToken]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ebf7ee_0%,_#f7f9f4_35%,_#f3f4f6_100%)] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">AgriFlow</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">AI request activity from your Supabase workspace</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setLoading(true); setError(""); setRefreshToken((value) => value + 1); }} className="secondary-btn" disabled={loading}>
              {loading ? "Refreshing..." : "Refresh data"}
            </button>
            <Link href="/" className="secondary-btn text-center">Back to Dashboard</Link>
          </div>
        </header>

        {loading ? <StateMessage>Loading analytics...</StateMessage> : null}
        {error ? <StateMessage error>{error}</StateMessage> : null}
        {!loading && !error && analytics ? (
          <>
            <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Total AI requests" value={analytics.totalRequests.toLocaleString()} detail="All recorded requests" />
              <SummaryCard label="Average latency" value={`${analytics.averageLatency} ms`} detail="Across measured requests" />
              <SummaryCard label="Models used" value={analytics.modelUsage.length.toString()} detail="Distinct model labels" />
              <SummaryCard label="Task types" value={analytics.taskTypeDistribution.length.toString()} detail="Distinct request categories" />
            </section>

            {analytics.totalRequests === 0 ? (
              <StateMessage>No AI requests have been recorded yet.</StateMessage>
            ) : (
              <>
                <section className="mb-6 grid gap-4 lg:grid-cols-2">
                  <Chart title="Model usage" items={analytics.modelUsage} color="bg-emerald-500" />
                  <Chart title="Task type distribution" items={analytics.taskTypeDistribution} color="bg-sky-500" />
                </section>
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Performance</p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">Recent request latency</h2>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Latest 20</span>
                  </div>
                  <LatencyChart requests={analytics.recentRequests} />
                  <RecentRequests requests={analytics.recentRequests} />
                </section>
              </>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p><p className="mt-2 text-sm text-slate-500">{detail}</p></div>;
}

function Chart({ title, items, color }: { title: string; items: { label: string; count: number }[]; color: string }) {
  const maximum = Math.max(...items.map((item) => item.count), 1);
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">{title}</h2><div className="mt-5 space-y-4">{items.map((item) => <div key={item.label}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-slate-600">{item.label}</span><span className="font-semibold text-slate-900">{item.count}</span></div><div className="h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${color}`} style={{ width: `${(item.count / maximum) * 100}%` }} /></div></div>)}</div></div>;
}

function LatencyChart({ requests }: { requests: AnalyticsData["recentRequests"] }) {
  const measured = requests.filter((request) => typeof request.latency_ms === "number");
  const maximum = Math.max(...measured.map((request) => request.latency_ms ?? 0), 1);
  return <div className="flex h-44 items-end gap-2 overflow-x-auto border-b border-slate-200 pb-3">{measured.length ? measured.map((request) => <div key={request.id} className="group flex h-full min-w-8 flex-col items-center justify-end gap-2"><span className="text-[10px] text-slate-400 opacity-0 transition group-hover:opacity-100">{request.latency_ms}ms</span><div className="w-6 rounded-t-md bg-amber-400" style={{ height: `${Math.max(((request.latency_ms ?? 0) / maximum) * 100, 5)}%` }} /></div>) : <p className="pb-3 text-sm text-slate-500">No latency measurements available.</p>}</div>;
}

function RecentRequests({ requests }: { requests: AnalyticsData["recentRequests"] }) {
  return <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500"><tr><th className="pb-3 pr-4">Created</th><th className="pb-3 pr-4">Task type</th><th className="pb-3 pr-4">Model</th><th className="pb-3 pr-4">Latency</th><th className="pb-3">User message</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-b border-slate-100 last:border-0"><td className="py-3 pr-4 whitespace-nowrap text-slate-500">{new Date(request.created_at).toLocaleString()}</td><td className="py-3 pr-4 font-medium text-slate-700">{request.task_type ?? "Unknown"}</td><td className="py-3 pr-4 text-slate-600">{request.model_used ?? "Unknown"}</td><td className="py-3 pr-4 text-slate-600">{request.latency_ms == null ? "-" : `${request.latency_ms} ms`}</td><td className="max-w-md truncate py-3 text-slate-500">{request.user_message}</td></tr>)}</tbody></table></div>;
}

function StateMessage({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <div className={`rounded-3xl border p-8 text-center text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-500"}`}>{children}</div>;
}