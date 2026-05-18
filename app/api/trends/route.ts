import { NextRequest, NextResponse } from 'next/server'
import { queryTrends } from '@/app/lib/queries/public-home'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const rawLimit = parseInt(searchParams.get('limit') ?? '4', 10)
    const limit = isNaN(rawLimit) ? 4 : Math.min(Math.max(1, rawLimit), 20)

    const sort_by = searchParams.get('sort_by')
    const category = searchParams.get('category')

    const result = await queryTrends({
      limit,
      sort_by,
      category,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[trends]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
