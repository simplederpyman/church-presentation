'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Song } from '@/types/database'

interface Props { initialSongs: Song[] }

const EMPTY: Omit<Song, 'id' | 'created_at'> = { title: '', lyrics: '', artist: null }

export default function SongManager({ initialSongs }: Props) {
  const [songs, setSongs] = useState(initialSongs)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openNew() { setForm(EMPTY); setEditId(null); setShowForm(true); setError(null) }
  function openEdit(s: Song) { setForm({ title: s.title, lyrics: s.lyrics, artist: s.artist }); setEditId(s.id); setShowForm(true); setError(null) }
  function cancel() { setShowForm(false); setEditId(null) }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    const supabase = createClient()

    if (editId) {
      const { data, error } = await supabase.from('songs').update(form).eq('id', editId).select().single()
      if (error) setError(error.message)
      else setSongs(prev => prev.map(s => s.id === editId ? data : s))
    } else {
      const { data, error } = await supabase.from('songs').insert(form).select().single()
      if (error) setError(error.message)
      else { setSongs(prev => [data, ...prev]); cancel() }
    }
    setSaving(false)
    if (!error) setShowForm(false)
  }

  async function deleteSong(id: string) {
    if (!confirm('Delete this song?')) return
    const supabase = createClient()
    const { error } = await supabase.from('songs').delete().eq('id', id)
    if (!error) setSongs(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <span className="text-neutral-500 text-sm">{songs.length} song{songs.length !== 1 ? 's' : ''}</span>
        <button onClick={openNew} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
          + Add song
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">{editId ? 'Edit song' : 'New song'}</h3>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500"
              placeholder="Amazing Grace" />
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Artist / Author</label>
            <input value={form.artist ?? ''} onChange={e => setForm(f => ({ ...f, artist: e.target.value || null }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500"
              placeholder="John Newton" />
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Lyrics *</label>
            <textarea required rows={8} value={form.lyrics} onChange={e => setForm(f => ({ ...f, lyrics: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 resize-y font-mono"
              placeholder="Amazing grace, how sweet the sound" />
            <p className="text-xs text-neutral-600 mt-1">Separate sections with a blank line</p>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-white text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : editId ? 'Save changes' : 'Add song'}
            </button>
            <button type="button" onClick={cancel}
              className="text-neutral-500 hover:text-white text-sm px-4 py-2 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {songs.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <p className="text-lg">No songs yet</p>
          <p className="text-sm mt-1">Add worship songs to use in presentations</p>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map(song => (
            <div key={song.id} className="group flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 hover:border-neutral-700 transition-colors">
              <div>
                <p className="font-medium text-white">{song.title}</p>
                {song.artist && <p className="text-xs text-neutral-500 mt-0.5">{song.artist}</p>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(song)}
                  className="text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                <button onClick={() => deleteSong(song.id)}
                  className="text-xs text-red-500 hover:text-red-400 border border-neutral-700 hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
