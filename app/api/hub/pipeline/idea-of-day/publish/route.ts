import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { validateCronSecret } from '@/app/lib/ai/utils/auth'
import { getTodayUTC } from '@/app/lib/ai/utils/date'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { drafted_idea_id } = body
  if (!drafted_idea_id) {
    return NextResponse.json({ error: 'drafted_idea_id required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin as any
  const today = getTodayUTC()

  // Clear any existing idea of the day
  await admin
    .from('ideas')
    .update({ is_idea_of_day: false })
    .eq('is_idea_of_day', true)

  // Publish target idea as idea of the day
  const { error } = await admin
    .from('ideas')
    .update({
      published: true,
      is_idea_of_day: true,
      idea_of_day_date: today,
    })
    .eq('id', drafted_idea_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, published_id: drafted_idea_id })
}
