# AgriFlow

## Problem

Farms lose value when harvest timing, buyer demand, storage constraints, transport availability, and spoilage risk are not planned together. Farmers often sell too early, store too much in the wrong place, or miss better market windows. AgriFlow turns that decision-making into a structured AI-driven process.

## Solution

AgriFlow is an AI-powered farm supply-chain decision agent that evaluates the current harvest, market prices, storage capacity, transport availability, buyer demand, and spoilage risk. It then recommends the most profitable and lowest-risk action plan using deterministic calculations and tool-based reasoning.

## Agent Architecture

User
↓
AgriFlow Agent
↓
AI Gateway
↓
AI Model
↓
Tools
↓
Market / Storage / Transport / Buyer data
↓
Optimization
↓
Recommendation

## Features

- AI-driven harvest planning and allocation
- Market pricing and buyer demand review
- Storage and transport constraint checks
- Spoilage risk estimation
- Expected revenue and profit calculations
- What-if scenario simulation
- Agent activity transparency
- Responsive agricultural dashboard

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Vercel AI SDK
- Vercel AI Gateway
- Supabase (with local mock-data fallback)

## Local Setup

1. Install dependencies:
   npm install
2. Create a .env.local file and add:
   AI_GATEWAY_API_KEY=
   AI_MODEL=gpt-4o-mini
   SUPABASE_URL=
   SUPABASE_ANON_KEY=

   The Supabase project should contain these tables: `markets`, `storage_facilities`,
   `transport_options`, and `buyers`. Column names may use either camelCase or
   snake_case (for example, `pricePerKg` or `price_per_kg`).

3. Run the app:
   npm run dev

## Deployment

This app is designed for Vercel deployment with a standard Next.js project setup. Add the same environment variables in the Vercel project settings under Environment Variables, then deploy the repository.

## Demo Scenario

The dashboard includes a demo scenario that loads tomato harvest data, market prices, storage options, buyer offers, and transport availability. This lets the user run the full agent workflow without any external APIs.

## Agentic Behavior

AgriFlow does not behave like a generic chatbot. It uses tool calling, structured calculations, and decision analysis to evaluate the current state, simulate alternative plans, and generate a recommendation based on real application data.

## Notes

- Do not commit real API keys.
- Use .env.local during local development.
- The app keeps AI Gateway and Supabase requests server-side and does not expose credentials to the browser.
