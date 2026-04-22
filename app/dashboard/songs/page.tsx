import { createClient } from '@/lib/supabase/server'
import SongManager from '@/components/dashboard/SongManager'

export default async function SongsPage() {
  const supabase = await createClient()
  const { data: songs } = await supabase.from('songs').select('*').order('title')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Songs</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your worship songs and lyrics</p>
      </div>
      <SongManager initialSongs={songs ?? []} />
    </div>
  )
}
