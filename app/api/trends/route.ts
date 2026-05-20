import { NextRequest, NextResponse } from 'next/server'
import { queryTrends } from '@/app/lib/queries/public-home'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const rawLimit = parseInt(searchParams.get('limit') ?? '12', 10)
    const limit = isNaN(rawLimit) ? 12 : Math.min(Math.max(1, rawLimit), 50)
    const offset = Math.max(0, parseInt(searchParams.get('offset') ?? '0', 10))
    const sort_by = searchParams.get('sort_by')
    const category = searchParams.get('category')
    const search = searchParams.get('search')?.trim().slice(0, 200) ?? undefined

    const result = await queryTrends({
      limit,
      offset,
      sort_by,
      category,
      search: search ?? null,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[trends]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
