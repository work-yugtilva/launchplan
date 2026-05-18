# LaunchPlan.dev — Claude Context

## What this project is
LaunchPlan.dev is a startup idea discovery and validation platform for PMs and founders.
It is similar to Ideabrowser.com but specialized for PM-led software ideas.
It connects to SpecFlow AI as the downstream execution tool.

## Stack
- Next.js 15 (App Router, TypeScript strict)
- Tailwind CSS v4
- Supabase (auth + database)
- Anthropic Claude API
- Stripe

## Structure
- /app              → Next.js App Router pages and API routes
- /app/components   → All React components
- /app/lib          → Supabase client, utilities, types
- /app/api          → All API route handlers

## Design System
Brand: SpecFlow AI palette
  Primary orange: #e4611a
  Background: #f7f4f0 (warm off-white)
  Text: #0d0d0d
Fonts: DM Sans (UI) + Instrument Serif (headlines)
Buttons: pill shape always

## Rules
- No hardcoded content. All data from Supabase.
- No dark mode. Warm neutral palette only.
- Server Components by default. 'use client' only when needed.
- All API routes live in /app/api/[route]/route.ts

@AGENTS.md