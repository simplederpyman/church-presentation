'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import type { Presentation, PresentationItem, Song, Verse, Announcement, SlideType } from '@/types/database'

interface Props {
  presentation: Presentation
  initialItems: PresentationItem[]
  songs: Song[]
  verses: Verse[]
  announcements: Announcement[]
}

function SortableItem({
  item, songs, verses, announcements, onRemove,
}: {
  item: PresentationItem
  songs: Song[]
  verses: Verse[]
  announcements: Announcement[]
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const label = (() => {
    if (item.type === 'song') return songs.find(s => s.id === item.content_id)?.title ?? 'Unknown song'
    if (item.type === 'verse') return verses.find(v => v.id === item.content_id)?.reference ?? 'Unknown verse'
    if (item.type === 'announcement') return announcements.find(a => a.id === item.content_id)?.title ?? 'Unknown announcement'
    return 'Blank slide'
  })()

  const typeColors: Record<SlideType, string> = {
    song: 'text-purple-400 bg-purple-950/40',
    verse: 'text-blue-400 bg-blue-950/40',
    announcement: 'text-yellow-400 bg-yellow-950/40',
    blank: 'text-neutral-500 bg-neutral-800',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-neutral-900 border rounded-lg px-4 py-3 ${isDragging ? 'border-neutral-600 opacity-80' : 'border-neutral-800'}`}
    >
      <button {...attributes} {...listeners} className="text-neutral-600 hover:text-neutral-400 cursor-grab active:cursor-grabbing px-1">
        ⠷
      </button>
      <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${typeColors[item.type]}`}>
        {item.type}
      </span>
      <span className="text-sm text-white flex-1 truncate">{label}</span>
      <button onClick={() => onRemove(item.id)} className="text-neutral-600 hover:text-red-400 text-sm transition-colors">
        ✕
      </button>
    </div>
  )
}

export default function PresentationEditor({ presentation, initialItems, songs, verses, announcements }: Props) {
  const [items, setItems] = useState(initialItems)
  const [addType, setAddType] = useState<SlideType | ''>('')
  const [selectedContent, setSelectedContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({ ...item, order_index: idx }))
    setItems(reordered)

    const supabase = createClient()
    await Promise.all(reordered.map(item =>
      supabase.from('presentation_items').update({ order_index: item.order_index }).eq('id', item.id)
    ))
  }

  async function addItem() {
    if (!addType) return
    setSaving(true); setError(null)

    const supabase = createClient()
    const newItem = {
      presentation_id: presentation.id,
      type: addType,
      content_id: addType !== 'blank' ? selectedContent || null : null,
      order_index: items.length,
      custom_content: null,
    }

    const { data, error } = await supabase.from('presentation_items').insert(newItem).select().single()
    if (error) setError(error.message)
    else if (data) {
      setItems(prev => [...prev, data])
      setSelectedContent('')
    }
    setSaving(false)
  }

  async function removeItem(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('presentation_items').delete().eq('id', id)
    if (!error) setItems(prev => prev.filter(i => i.id !== id))
  }

  const contentOptions = useCallback(() => {
    if (addType === 'song') return songs.map(s => ({ id: s.id, label: s.title }))
    if (addType === 'verse') return verses.map(v => ({ id: v.id, label: v.reference }))
    if (addType === 'announcement') return announcements.map(a => ({ id: a.id, label: a.title }))
    return []
  }, [addType, songs, verses, announcements])

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-neutral-800 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-neutral-500 hover:text-white text-sm transition-colors">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-white">{presentation.name}</h1>
        </div>
        <Link
          href={`/present/${presentation.id}`}
          target="_blank"
          className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Present live →
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-20 text-neutral-600">
              <p className="text-lg">No slides yet</p>
              <p className="text-sm mt-1">Add slides using the panel on the right</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map(item => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      songs={songs}
                      verses={verses}
                      announcements={announcements}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <aside className="w-72 border-l border-neutral-800 p-6 bg-neutral-900/50">
          <h2 className="text-sm font-semibold text-neutral-300 mb-4">Add slide</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-500 mb-1.5 block">Type</label>
              <select
                value={addType}
                onChange={e => { setAddType(e.target.value as SlideType); setSelectedContent('') }}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500"
              >
                <option value="">Select type…</option>
                <option value="song">Song</option>
                <option value="verse">Bible verse</option>
                <option value="announcement">Announcement</option>
                <option value="blank">Blank slide</option>
              </select>
            </div>

            {addType && addType !== 'blank' && (
              <div>
                <label className="text-xs text-neutral-500 mb-1.5 block">Content</label>
                <select
                  value={selectedContent}
                  onChange={e => setSelectedContent(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neutral-500"
                >
                  <option value="">Select…</option>
                  {contentOptions().map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                {contentOptions().length === 0 && (
                  <p className="text-xs text-neutral-600 mt-1">No {addType}s found. Add some first.</p>
                )}
              </div>
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={addItem}
              disabled={saving || !addType || (addType !== 'blank' && !selectedContent)}
              className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Adding…' : 'Add slide'}
            </button>
          </div>

          <div className="mt-8 border-t border-neutral-800 pt-6">
            <p className="text-xs text-neutral-600 mb-3">Quick add</p>
            <Link href="/dashboard/songs" className="block text-xs text-neutral-500 hover:text-white py-1 transition-colors">+ Add songs</Link>
            <Link href="/dashboard/verses" className="block text-xs text-neutral-500 hover:text-white py-1 transition-colors">+ Add verses</Link>
            <Link href="/dashboard/announcements" className="block text-xs text-neutral-500 hover:text-white py-1 transition-colors">+ Add announcements</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
