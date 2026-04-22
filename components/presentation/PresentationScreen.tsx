'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Presentation, PresentationItem, LiveState, Song, Verse, Announcement } from '@/types/database'
import SlideDisplay from './SlideDisplay'
import ControlBar from './ControlBar'

interface ItemWithContent extends PresentationItem {
  song?: Song
  verse?: Verse
  announcement?: Announcement
}

interface Props {
  presentation: Presentation
  initialItems: ItemWithContent[]
  initialState: LiveState | null
}

export default function PresentationScreen({ presentation, initialItems, initialState }: Props) {
  const [items] = useState(initialItems)
  const [currentIndex, setCurrentIndex] = useState(initialState?.current_item_index ?? 0)
  const [isOperator, setIsOperator] = useState(false)
  const [connectionLost, setConnectionLost] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [slideKey, setSlideKey] = useState(0)
  const supabase = useRef(createClient())

  useEffect(() => {
    supabase.current.auth.getUser().then(({ data: { user } }) => {
      if (user) setIsOperator(true)
    })
  }, [])

  const pushState = useCallback(async (index: number) => {
    if (!isOperator) return
    const client = supabase.current

    if (initialState) {
      await client
        .from('live_state')
        .update({ current_item_index: index, updated_at: new Date().toISOString() })
        .eq('id', initialState.id)
    } else {
      await client.from('live_state').upsert({
        presentation_id: presentation.id,
        current_item_index: index,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
    }
  }, [isOperator, initialState, presentation.id])

  useEffect(() => {
    const client = supabase.current
    const channel = client
      .channel(`live:${presentation.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_state', filter: `presentation_id=eq.${presentation.id}` },
        payload => {
          const row = payload.new as LiveState
          setCurrentIndex(row.current_item_index)
          setSlideKey(k => k + 1)
          setConnectionLost(false)
        }
      )
      .subscribe(status => {
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setConnectionLost(true)
        if (status === 'SUBSCRIBED') setConnectionLost(false)
      })

    return () => { client.removeChannel(channel) }
  }, [presentation.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isOperator) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(-1)
      if (e.key === 'f' || e.key === 'F') toggleFullscreen()
      if (e.key === 'Escape' && isFullscreen) exitFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOperator, currentIndex, items.length, isFullscreen])

  function navigate(delta: number) {
    const next = Math.max(0, Math.min(items.length - 1, currentIndex + delta))
    setCurrentIndex(next)
    setSlideKey(k => k + 1)
    pushState(next)
  }

  function goTo(index: number) {
    setCurrentIndex(index)
    setSlideKey(k => k + 1)
    pushState(index)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      exitFullscreen()
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    setIsFullscreen(false)
  }

  useEffect(() => {
    function onFsChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  if (items.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-neutral-600 text-center">
        <div>
          <p className="text-2xl font-light">No content available</p>
          <p className="text-sm mt-2">Add slides to this presentation first</p>
        </div>
      </div>
    )
  }

  const current = items[currentIndex]

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden select-none">
      {connectionLost && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-900 text-white text-center text-xs py-1.5">
          Connection lost — attempting to reconnect…
        </div>
      )}

      <div className="flex-1 relative">
        {current && <SlideDisplay key={slideKey} item={current} />}
      </div>

      {isOperator && (
        <ControlBar
          items={items}
          currentIndex={currentIndex}
          onNavigate={navigate}
          onGoTo={goTo}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}
    </div>
  )
}
