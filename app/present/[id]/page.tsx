import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PresentationScreen from '@/components/presentation/PresentationScreen'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PresentPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: presentation } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single()

  if (!presentation) notFound()

  const { data: items } = await supabase
    .from('presentation_items')
    .select('*, song:songs(*), verse:verses(*), announcement:announcements(*)')
    .eq('presentation_id', id)
    .order('order_index', { ascending: true })

  const { data: liveState } = await supabase
    .from('live_state')
    .select('*')
    .eq('presentation_id', id)
    .single()

  return (
    <PresentationScreen
      presentation={presentation}
      initialItems={items ?? []}
      initialState={liveState ?? null}
    />
  )
}
