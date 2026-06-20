'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUser } from '@/lib/storage'

const adminTabs = [
  { href: '/admin',           icon: '🏠', label: '首页',  exact: true },
  { href: '/admin/chapters',  icon: '📂', label: '题库' },
  { href: '/admin/students',  icon: '👥', label: '学生' },
  { href: '/profile',         icon: '👤', label: '我的' },
]
const studentTabs = [
  { href: '/quiz',            icon: '🏠', label: '首页',  exact: true },
  { href: '/wrong-answers',   icon: '📝', label: '错题本' },
  { href: '/profile',         icon: '👤', label: '我的' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const [tabs, setTabs] = useState<typeof adminTabs>([])

  useEffect(() => {
    const u = getUser()
    if (u) setTabs(u.role === 'admin' ? adminTabs : studentTabs)
  }, [])

  if (!tabs.length) return null

  const active = (t: { href: string; exact?: boolean }) =>
    t.exact ? pathname === t.href : pathname.startsWith(t.href)

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex pb-5 pt-2 z-50"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      {tabs.map(t => (
        <button key={t.href} onClick={() => router.push(t.href)}
          className="flex-1 flex flex-col items-center gap-0.5 py-1.5 bg-transparent border-0 cursor-pointer">
          <span className="text-xl">{t.icon}</span>
          <span className="text-[10px]" style={{ color: active(t) ? '#5b8def' : '#9ca3af', fontWeight: active(t) ? 700 : 500 }}>
            {t.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
