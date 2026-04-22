'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Verse } from '@/types/database'

interface Props { initialVerses: Verse[] }

export default function VerseManager({ initialVerses }: Props) {
  const [verses, setVerses] = useState(initialVerses)
  const [form, setForm] = useState({ reference: '', text: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openNew() { setForm({ reference: '', text: '' }); setEditId(null); setShowForm(true); setError(null) }
  function openEdit(v: Verse) { setForm({ reference: v.reference, text: v.text }); setEditId(v.id); setShowForm(true); setError(null) }
  function cancel() { setShowForm(false); setEditId(null) }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    const supabase = createClient()

    if (editId) {
      const { data, error } = await supabase.from('verses').update(form).eq('id', editId).select().single()
      if (error) setError(error.message)
      else { setVerses(prev => prev.map(v => v.id === editId ? data : v)); setShowForm(false) }
    } else {
      const { data, error } = await supabase.from('verses').insert(form).select().single()
      if (error) setError(error.message)
      else { setVerses(prev => [data, ...prev]); cancel() }
    }
    setSaving(false)
  }

  async function deleteVerse(id: string) {
    if (!confirm('Delete this verse?')) return
    const supabase = createClient()
    const { error } = await supabase.from('verses').delete().eq('id', id)
    if (!error) setVerses(prev => prev.filter(v => v.id !== id))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <span className="text-neutral-500 text-sm">{verses.length} verse{verses.length !== 1 ? 's' : ''}</span>
        <button onClick={openNew} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
          + Add verse
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">{editId ? 'Edit verse' : 'New verse'}</h3>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Reference *</label>
            <input required value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500"
              placeholder="John 3:16" />
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Verse text *</label>
            <textarea required rows={4} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 resize-y"
              placeholder="For God so loved the world..." />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-white text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : editId ? 'Save changes' : 'Add verse'}
            </button>
            <button type="button" onClick={cancel} className="text-neutral-500 hover:text-white text-sm px-4 py-2 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {verses.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <p className="text-lg">No verses yet</p>
          <p className="text-sm mt-1">Add Bible verses to use in presentations</p>
        </div>
      ) : (
        <div className="space-y-2">
          {verses.map(verse => (
            <div key={verse.id} className="group flex items-start justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 hover:border-neutral-700 transition-colors">
              <div>
                <p className="font-medium text-white text-sm">{verse.reference}</p>
                <p className="text-neutral-500 text-sm mt-1 line-clamp-2">{verse.text}</p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(verse)}
                  className="text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                <button onClick={() => deleteVerse(verse.id)}
                  className="text-xs text-red-500 hover:text-red-400 border border-neutral-700 hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
