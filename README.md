# Chrono-Rail MVP

Chrono-Rail is a hackathon-ready MVP for predictive rail delay prevention.

It demonstrates the core product idea in a single-page dashboard:

- observe a live rail network
- simulate near-future outcomes
- detect a junction cascade before it happens
- recommend the smallest intervention needed
- keep the network stable with minimal disruption

## What the MVP Includes

- a bold operator-style dashboard
- live mock train data for three services
- a simple delay-risk simulation loop
- a clear intervention recommendation panel
- scenario buttons to inject or reduce disruption
- responsive layout for desktop and mobile

## Tech Stack

- React
- TypeScript
- Vite
- CSS with custom gradients and glassmorphism styling

## How It Works

The MVP uses mocked operational data rather than real rail integrations.
The app updates its internal clock every second, recalculates delay risk, and changes the recommended intervention based on the current scenario.

## Run Locally

1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Build for production with `npm run build`.

## MVP Scope

This version is intentionally small so it can be submitted quickly for a hackathon.
It focuses on the core value proposition rather than full production integrations, backend services, or live transport feeds.

## Next Step After Hackathon

If you want to take this beyond MVP, the next version would add real-time data ingestion, a backend simulation engine, operator authentication, and audit logging.
