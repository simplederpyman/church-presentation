'use client'

import type { PresentationItem, Song, Verse, Announcement, SlideType } from '@/types/database'

interface ItemWithContent extends PresentationItem {
  song?: Song
  verse?: Verse
  announcement?: Announcement
}

interface Props {
  items: ItemWithContent[]
  currentIndex: number
  onNavigate: (delta: number) => void
  onGoTo: (index: number) => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
}

function itemLabel(item: ItemWithContent): string {
  if (item.type === 'song') return item.song?.title ?? 'Song'
  if (item.type === 'verse') return item.verse?.reference ?? 'Verse'
  if (item.type === 'announcement') return item.announcement?.title ?? 'Announcement'
  return 'Blank'
}

const typeColors: Record<SlideType, string> = {
  song: 'border-purple-800 bg-purple-950/30',
  verse: 'border-blue-800 bg-blue-950/30',
  announcement: 'border-yellow-800 bg-yellow-950/30',
  blank: 'border-neutral-700 bg-neutral-900',
}

export default function ControlBar({ items, currentIndex, onNavigate, onGoTo, onToggleFullscreen, isFullscreen }: Props) {
  return (
    <div className="bg-neutral-950 border-t border-neutral-800 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onGoTo(i)}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs border transition-all ${
              i === currentIndex
                ? 'bg-white text-black border-white font-medium'
                : `text-neutral-400 hover:text-white ${typeColors[item.type]}`
            }`}
          >
            <span className="text-neutral-500 mr-1.5">{i + 1}</span>
            {itemLabel(item)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(-1)}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
          >
            ← Previous
          </button>
          <span className="text-neutral-600 text-sm">
            {currentIndex + 1} / {items.length}
          </span>
          <button
            onClick={() => onNavigate(1)}
            disabled={currentIndex === items.length - 1}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
          >
            Next →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-700 text-xs">← → to navigate</span>
          <button
            onClick={onToggleFullscreen}
            className="px-3 py-2 text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-lg text-xs transition-colors"
          >
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen (F)'}
          </button>
        </div>
      </div>
    </div>
  )
}
