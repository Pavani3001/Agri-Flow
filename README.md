# AgriFlow

## Problem

Farms lose value when harvest timing, buyer demand, storage constraints, transport availability, and spoilage risk are not planned together. Farmers often sell too early, store too much in the wrong place, or miss better market windows. AgriFlow turns that decision-making into a structured AI-driven process.

## Solution

AgriFlow is an AI-powered farm supply-chain decision agent that evaluates the current harvest, market prices, storage capacity, transport availability, buyer demand, and spoilage risk. It then recommends the most profitable and lowest-risk action plan using deterministic calculations and tool-based reasoning.

## Agent Architecture

User
|
AgriFlow Agent
|
AI Gateway
|
AI Model
|
Tools
|
Market / Storage / Transport / Buyer data
|
Optimization
Recommendation

## Features

- AI-driven harvest planning and allocation
- Market pricing and buyer demand review
- Storage and transport constraint checks
- Spoilage risk estimation
- Expected revenue and profit calculations
- What-if scenario simulation
- Agent activity transparency
- Transparent routing decision with task type, model, gateway status, reason, and latency
- Supabase-persisted AI request analytics
- Analytics dashboard with request counts, model/task distributions, latency, and recent requests
- Responsive agricultural dashboard

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Vercel AI SDK
- Vercel AI Gateway
- Supabase (with local mock-data fallback)

## Application Routes

- `/` - Supply-chain dashboard, harvest inputs, scenario simulation, AI Agent chat, and routing decision
- `/analytics` - AI request analytics dashboard
- `/api/agent` - Runs supply-chain analysis, calls the configured AI Gateway model, and logs successful requests
- `/api/analytics` - Reads analytics from `public.ai_requests`
- `/api/market`, `/api/storage`, `/api/transport`, `/api/buyers` - Supply-chain data endpoints

## Local Setup

1. Install dependencies:
   `npm install`
2. Create a .env.local file and add:
   ```text
   AI_GATEWAY_API_KEY=
   AI_MODEL=gpt-4o-mini
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   ```

   The Supabase client also accepts the existing public variable names:
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

   The Supabase project should contain these supply-chain tables: `markets`,
   `storage_facilities`, `transport_options`, and `buyers`. Column names may use
   either camelCase or snake_case (for example, `pricePerKg` or `price_per_kg`).

   For analytics, create the existing `public.ai_requests` table with columns
   `user_message`, `task_type`, `model_used`, `ai_response`, `latency_ms`, and
   `created_at`. The app uses the publishable key, so Supabase RLS must allow the
   intended application role to insert rows. The analytics dashboard also needs a
   `SELECT` policy for that role. Do not disable RLS.

3. Run the app:
   `npm run dev`

4. Open `http://localhost:3000` and run an analysis. Open
   `http://localhost:3000/analytics` to view persisted request analytics.

## Deployment

This app is designed for Vercel deployment with a standard Next.js project setup. Add the same environment variables in the Vercel project settings under Environment Variables, then deploy the repository.

## Demo Scenario

The dashboard includes a demo scenario that loads tomato harvest data, market prices, storage options, buyer offers, and transport availability. This lets the user run the full agent workflow without any external APIs.

## Agentic Behavior

AgriFlow does not behave like a generic chatbot. It uses structured calculations and
decision analysis to evaluate the current state, simulate alternative plans, and
generate a recommendation based on Supabase data when available. If a supply-chain
table is unavailable or empty, the corresponding local demo dataset is used.

When `AI_GATEWAY_API_KEY` is configured, `/api/agent` sends the user question through
Vercel AI Gateway using `AI_MODEL`. If the provider rejects the request, the existing
deterministic response fallback keeps the request usable and records the actual
fallback model in analytics.

## Analytics

Successful `/api/agent` requests are recorded in `public.ai_requests` with the user
message, task type, model that produced the response, response text, and server-side
latency. Analytics persistence runs on the server and does not expose Supabase
credentials to the browser. Insert failures are logged but do not break the AI
response.

The analytics page loads data through `/api/analytics`, supports manual refresh, and
refreshes when the page regains focus. It displays an empty state when no rows are
visible and an error state when the analytics query fails.

## Validation Commands

```text
npm run lint
npm run build
```

## Notes

- Do not commit real API keys.
- Use .env.local during local development.
- Keep AI Gateway and Supabase requests server-side; do not expose secret or service-role keys to the browser.
