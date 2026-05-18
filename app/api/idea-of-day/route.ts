import { NextResponse } from 'next/server'
import { queryIdeaOfDay } from '@/app/lib/queries/public-home'

export const revalidate = 3600

export async function GET() {
  try {
    const data = await queryIdeaOfDay()

    if (!data) {
      return NextResponse.json({ error: 'No idea of the day found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[idea-of-day]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
