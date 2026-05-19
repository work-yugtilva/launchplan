import { notFound } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { NavBar } from '@/components/layout/NavBar'
import { IdeaDetailClient } from './IdeaDetailClient'
import type { IdeaWithSignals, Profile } from '@/app/lib/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: idea } = await supabase
    .from('ideas')
    .select('*, community_signals(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!idea) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let plan = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    plan = (profile as Profile | null)?.plan ?? 'free'
  }

  return (
    <>
      <NavBar />
      <IdeaDetailClient idea={idea as IdeaWithSignals} plan={plan} />
    </>
  )
}
