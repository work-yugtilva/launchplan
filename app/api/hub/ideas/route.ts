import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export const revalidate = 60

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim().slice(0, 200) ?? null
  const business_model = searchParams.get('business_model') ?? null
  const market_type = searchParams.get('market_type') ?? null
  const execution_difficulty = searchParams.get('execution_difficulty') ?? null
  const revenue_potential = searchParams.get('revenue_potential') ?? null
  const limit = Math.min(Number(searchParams.get('limit') ?? 12), 50)
  const offset = Number(searchParams.get('offset') ?? 0)

  let query = supabase
    .from('ideas')
    .select('*', { count: 'exact' })
    .eq('published', true)

  if (search) {
    const escaped = search.replace(/[(),]/g, (c: string) => `\\${c}`)
    query = query.or(`title.ilike.%${escaped}%,tagline.ilike.%${escaped}%`)
  }

  if (business_model) {
    const values = business_model.split(',').filter(Boolean)
    if (values.length === 1) {
      query = query.eq('business_model', values[0])
    } else if (values.length > 1) {
      query = query.in('business_model', values)
    }
  }

  if (market_type) {
    const values = market_type.split(',').filter(Boolean)
    if (values.length === 1) {
      query = query.eq('market_type', values[0])
    } else if (values.length > 1) {
      query = query.in('market_type', values)
    }
  }

  if (execution_difficulty) {
    const values = execution_difficulty.split(',').filter(Boolean)
    if (values.length === 1) {
      query = query.eq('execution_difficulty', values[0])
    } else if (values.length > 1) {
      query = query.in('execution_difficulty', values)
    }
  }

  if (revenue_potential) {
    const values = revenue_potential.split(',').filter(Boolean)
    if (values.length === 1) {
      query = query.eq('revenue_potential', values[0])
    } else if (values.length > 1) {
      query = query.in('revenue_potential', values)
    }
  }

  const { data: ideas, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[api/hub/ideas]', error)
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
  }

  const total = count ?? 0

  return NextResponse.json({
    ideas: ideas ?? [],
    total,
    hasMore: offset + limit < total,
  })
}
