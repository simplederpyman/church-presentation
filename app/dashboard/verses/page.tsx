import { createClient } from '@/lib/supabase/server'
import VerseManager from '@/components/dashboard/VerseManager'

export default async function VersesPage() {
  const supabase = await createClient()
  const { data: verses } = await supabase.from('verses').select('*').order('reference')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bible Verses</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your Bible verse library</p>
      </div>
      <VerseManager initialVerses={verses ?? []} />
    </div>
  )
}
