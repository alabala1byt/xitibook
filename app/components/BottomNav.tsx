'use client'
import { usePathname, useRouter } from 'next/navigation'

// Unified bottom navigation — no roles. Every signed-in user can manage their
// own question bank (题库), practice (练习), review mistakes (错题), and view
// their profile (我的).
const tabs = [
  { href: '/admin', icon: '🏠', label: '首页', exact: true },
  { href: '/admin/chapters', icon: '📂', label: '题库' },
  { href: '/quiz', icon: '✏️', label: '练习' },
  { href: '/wrong-answers', icon: '📝', label: '错题' },
  { href: '/profile', icon: '👤', label: '我的' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

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
