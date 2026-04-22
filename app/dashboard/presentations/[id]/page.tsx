import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PresentationEditor from '@/components/dashboard/PresentationEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PresentationPage({ params }: Props) {
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
    .select('*')
    .eq('presentation_id', id)
    .order('order_index', { ascending: true })

  const { data: songs } = await supabase.from('songs').select('*').order('title')
  const { data: verses } = await supabase.from('verses').select('*').order('reference')
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <PresentationEditor
      presentation={presentation}
      initialItems={items ?? []}
      songs={songs ?? []}
      verses={verses ?? []}
      announcements={announcements ?? []}
    />
  )
}
