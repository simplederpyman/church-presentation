'use client'

import type { PresentationItem, Song, Verse, Announcement, SlideType } from '@/types/database'

interface ItemWithContent extends PresentationItem {
  song?: Song
  verse?: Verse
  announcement?: Announcement
}

interface Props { item: ItemWithContent }

function SongSlide({ song }: { song: Song }) {
  const sections = song.lyrics.split(/\n\s*\n/)
  return (
    <div className="flex flex-col items-center justify-center h-full px-16 text-center">
      <p className="text-neutral-600 text-lg mb-8 uppercase tracking-widest font-light">
        {song.title}
      </p>
      {sections.map((section, i) => (
        <div key={i} className="mb-4">
          {section.split('\n').map((line, j) => (
            <p key={j} className="text-white text-5xl font-bold leading-tight mb-2">{line}</p>
          ))}
        </div>
      ))}
      {song.artist && (
        <p className="text-neutral-700 text-base mt-8">{song.artist}</p>
      )}
    </div>
  )
}

function VerseSlide({ verse }: { verse: Verse }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-20 text-center max-w-5xl mx-auto">
      <p className="text-neutral-500 text-xl mb-10 uppercase tracking-widest font-light">
        {verse.reference}
      </p>
      <p className="text-white text-5xl font-light leading-relaxed italic">
        &ldquo;{verse.text}&rdquo;
      </p>
    </div>
  )
}

function AnnouncementSlide({ announcement }: { announcement: Announcement }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-16 text-center">
      <div className="inline-block bg-white/10 rounded-full px-4 py-1 text-white/60 text-sm uppercase tracking-widest mb-8 font-light">
        Announcement
      </div>
      <h2 className="text-white text-6xl font-bold mb-8">{announcement.title}</h2>
      <p className="text-neutral-300 text-2xl max-w-3xl leading-relaxed font-light">
        {announcement.content}
      </p>
    </div>
  )
}

function BlankSlide() {
  return <div className="h-full bg-black" />
}

export default function SlideDisplay({ item }: Props) {
  const renderSlide = () => {
    switch (item.type as SlideType) {
      case 'song':
        return item.song ? <SongSlide song={item.song} /> : <BlankSlide />
      case 'verse':
        return item.verse ? <VerseSlide verse={item.verse} /> : <BlankSlide />
      case 'announcement':
        return item.announcement ? <AnnouncementSlide announcement={item.announcement} /> : <BlankSlide />
      case 'blank':
        return <BlankSlide />
    }
  }

  return (
    <div className="slide-enter w-full h-full bg-black overflow-hidden">
      {renderSlide()}
    </div>
  )
}
