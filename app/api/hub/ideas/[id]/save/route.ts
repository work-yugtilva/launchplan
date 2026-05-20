import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabase
    .from('saved_ideas')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert({ user_id: user.id, idea_id: id } as any, { onConflict: 'user_id,idea_id' })
  if (error) {
    console.error('[save POST]', error)
    return NextResponse.json({ error: 'Failed to save idea' }, { status: 500 })
  }
  return NextResponse.json({ saved: true })
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabase
    .from('saved_ideas')
    .delete()
    .eq('user_id', user.id)
    .eq('idea_id', id)
  if (error) {
    console.error('[save DELETE]', error)
    return NextResponse.json({ error: 'Failed to unsave idea' }, { status: 500 })
  }
  return NextResponse.json({ saved: false })
}
