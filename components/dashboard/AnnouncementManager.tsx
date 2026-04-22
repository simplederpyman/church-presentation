'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Announcement } from '@/types/database'

interface Props { initialAnnouncements: Announcement[] }

const EMPTY = { title: '', content: '', start_date: '', end_date: '' }

export default function AnnouncementManager({ initialAnnouncements }: Props) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openNew() { setForm(EMPTY); setEditId(null); setShowForm(true); setError(null) }
  function openEdit(a: Announcement) {
    setForm({ title: a.title, content: a.content, start_date: a.start_date, end_date: a.end_date })
    setEditId(a.id); setShowForm(true); setError(null)
  }
  function cancel() { setShowForm(false); setEditId(null) }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    const supabase = createClient()

    if (editId) {
      const { data, error } = await supabase.from('announcements').update(form).eq('id', editId).select().single()
      if (error) setError(error.message)
      else { setAnnouncements(prev => prev.map(a => a.id === editId ? data : a)); setShowForm(false) }
    } else {
      const { data, error } = await supabase.from('announcements').insert(form).select().single()
      if (error) setError(error.message)
      else { setAnnouncements(prev => [data, ...prev]); cancel() }
    }
    setSaving(false)
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Delete this announcement?')) return
    const supabase = createClient()
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (!error) setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <span className="text-neutral-500 text-sm">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</span>
        <button onClick={openNew} className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
          + Add announcement
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">{editId ? 'Edit announcement' : 'New announcement'}</h3>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500"
              placeholder="Youth Group Meeting" />
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Content *</label>
            <textarea required rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500 resize-y"
              placeholder="This Friday at 7pm..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Start date *</label>
              <input required type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">End date *</label>
              <input required type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500" />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-white text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : editId ? 'Save changes' : 'Add announcement'}
            </button>
            <button type="button" onClick={cancel} className="text-neutral-500 hover:text-white text-sm px-4 py-2 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <p className="text-lg">No announcements yet</p>
          <p className="text-sm mt-1">Add announcements to display during service</p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcements.map(a => (
            <div key={a.id} className="group flex items-start justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 hover:border-neutral-700 transition-colors">
              <div>
                <p className="font-medium text-white">{a.title}</p>
                <p className="text-neutral-500 text-sm mt-1 line-clamp-2">{a.content}</p>
                <p className="text-xs text-neutral-600 mt-1">{a.start_date} → {a.end_date}</p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(a)}
                  className="text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                <button onClick={() => deleteAnnouncement(a.id)}
                  className="text-xs text-red-500 hover:text-red-400 border border-neutral-700 hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
