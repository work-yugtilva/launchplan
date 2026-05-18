import { NextRequest, NextResponse } from 'next/server'
import { queryMarketInsights } from '@/app/lib/queries/public-home'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const rawLimit = parseInt(searchParams.get('limit') ?? '3', 10)
    const limit = isNaN(rawLimit) ? 3 : Math.min(Math.max(1, rawLimit), 12)

    const insight_type = searchParams.get('insight_type')

    const result = await queryMarketInsights({
      limit,
      insight_type,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[market-insights]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
