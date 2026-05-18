import { NextResponse } from 'next/server'
import { querySiteStats } from '@/app/lib/queries/public-home'
import type { StatsResponse } from '@/app/lib/types'

export const revalidate = 86400

const STATS_FALLBACK: StatsResponse = {
  total_ideas: 0,
  total_trends: 0,
  total_insights: 0,
}

export async function GET() {
  try {
    const response = await querySiteStats()
    return NextResponse.json(response)
  } catch (error) {
    console.error('[stats]', error)
    return NextResponse.json(STATS_FALLBACK)
  }
}
