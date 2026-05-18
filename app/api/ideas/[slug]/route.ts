import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import type { Idea, IdeaWithSignals } from '@/app/lib/types'

export const revalidate = 3600

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data: idea, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }
    if (error) throw error
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    const row = idea as Idea

    const { data: signals } = await supabase
      .from('community_signals')
      .select('*')
      .eq('idea_id', row.id)

    const response: IdeaWithSignals = {
      ...row,
      community_signals: signals ?? [],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[ideas/slug]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
