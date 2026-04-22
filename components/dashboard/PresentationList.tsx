'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Presentation } from '@/types/database'

interface Props {
  presentations: Presentation[]
}

export default function PresentationList({ presentations: initial }: Props) {
  const [presentations, setPresentations] = useState(initial)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function createPresentation(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('presentations')
      .insert({ name: newName.trim(), created_by: user?.id ?? null })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setPresentations(prev => [data, ...prev])
      setNewName('')
      setShowForm(false)
      router.push(`/dashboard/presentations/${data.id}`)
    }
    setCreating(false)
  }

  async function deletePresentation(id: string) {
    if (!confirm('Delete this presentation?')) return
    const supabase = createClient()
    const { error } = await supabase.from('presentations').delete().eq('id', id)
    if (!error) setPresentations(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <span className="text-neutral-500 text-sm">{presentations.length} presentation{presentations.length !== 1 ? 's' : ''}</span>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          + New presentation
        </button>
      </div>

      {showForm && (
        <form onSubmit={createPresentation} className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <label className="block text-sm text-neutral-400 mb-2">Presentation name</label>
          <div className="flex gap-3">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Sunday Morning Service"
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 text-sm"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-neutral-500 hover:text-white px-3 py-2.5 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </form>
      )}

      {presentations.length === 0 ? (
        <div className="text-center py-24 text-neutral-600">
          <p className="text-lg">No presentations yet</p>
          <p className="text-sm mt-1">Create your first presentation to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {presentations.map(p => (
            <div
              key={p.id}
              className="group flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 hover:border-neutral-700 transition-colors"
            >
              <div>
                <Link
                  href={`/dashboard/presentations/${p.id}`}
                  className="font-medium text-white hover:text-neutral-300 transition-colors"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/present/${p.id}`}
                  target="_blank"
                  className="text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Present
                </Link>
                <Link
                  href={`/dashboard/presentations/${p.id}`}
                  className="text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deletePresentation(p.id)}
                  className="text-xs text-red-500 hover:text-red-400 border border-neutral-700 hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
