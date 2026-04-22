import { createClient } from '@/lib/supabase/server'
import AnnouncementManager from '@/components/dashboard/AnnouncementManager'

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Announcements</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage church announcements</p>
      </div>
      <AnnouncementManager initialAnnouncements={announcements ?? []} />
    </div>
  )
}
