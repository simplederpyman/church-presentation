import { createClient } from '@/lib/supabase/server'
import PresentationList from '@/components/dashboard/PresentationList'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: presentations, error } = await supabase
    .from('presentations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-950/30 border border-red-900 rounded-xl p-6 text-red-400">
          Failed to load presentations. Check your connection.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Presentations</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your service presentations</p>
      </div>
      <PresentationList presentations={presentations ?? []} />
    </div>
  )
}
