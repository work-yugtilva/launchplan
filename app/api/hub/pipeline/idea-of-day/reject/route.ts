import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { validateCronSecret } from '@/app/lib/ai/utils/auth'

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

  await admin
    .from('ideas')
    .update({ published: false })
    .eq('id', drafted_idea_id)

  await admin
    .from('idea_candidates')
    .update({ status: 'rejected' })
    .eq('drafted_idea_id', drafted_idea_id)

  return NextResponse.json({ success: true })
}
