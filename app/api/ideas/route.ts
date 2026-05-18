import { NextRequest, NextResponse } from 'next/server'
import { queryPublishedIdeas } from '@/app/lib/queries/public-home'

export const revalidate = 300

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const business_model = searchParams.get('business_model')
    const rawSearch = searchParams.get('search')
    const search = rawSearch ? rawSearch.slice(0, 200) : null

    const rawLimit = Number(searchParams.get('limit') ?? 12)
    const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? 12 : rawLimit))
    const rawOffset = Number(searchParams.get('offset') ?? 0)
    const offset = Math.max(0, isNaN(rawOffset) ? 0 : rawOffset)

    const response = await queryPublishedIdeas({
      limit,
      offset,
      category,
      business_model,
      search,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[ideas]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
