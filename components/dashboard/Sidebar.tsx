'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface Props {
  user: User
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard', label: 'Presentations', icon: '▤' },
  { href: '/dashboard/songs', label: 'Songs', icon: '♪' },
  { href: '/dashboard/verses', label: 'Verses', icon: '📖' },
  { href: '/dashboard/announcements', label: 'Announcements', icon: '📢' },
]

export default function DashboardSidebar({ user, profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 flex flex-col bg-neutral-900 border-r border-neutral-800 shrink-0">
      <div className="p-5 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="7" y="1" width="2" height="14" rx="1" fill="black"/>
              <rect x="1" y="7" width="14" height="2" rx="1" fill="black"/>
            </svg>
          </div>
          <span className="font-bold text-sm text-white">Church Presenter</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-white text-black font-medium'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-neutral-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
          {profile && (
            <span className="text-xs text-neutral-600 capitalize">{profile.role}</span>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-sm text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
