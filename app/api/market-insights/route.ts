import { NextRequest, NextResponse } from 'next/server'
import { queryMarketInsights } from '@/app/lib/queries/public-home'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const rawLimit = parseInt(searchParams.get('limit') ?? '9', 10)
    const limit = isNaN(rawLimit) ? 9 : Math.min(Math.max(1, rawLimit), 30)
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10))
    const insight_type = searchParams.get('insight_type')

    const result = await queryMarketInsights({
      limit,
      offset,
      insight_type,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[market-insights]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
