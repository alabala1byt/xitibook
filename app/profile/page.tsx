'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import BottomNav from '@/app/components/BottomNav'
import { listSessions, listWrong } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'

export default function Profile() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<{ label: string; value: string | number }[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      try {
        const [sess, wrong] = await Promise.all([listSessions(), listWrong()])
        if (!active) return
        const done = sess.filter(s => s.completedAt)
        const tq = done.reduce((a, s) => a + s.totalQ, 0)
        const tc = done.reduce((a, s) => a + s.correct, 0)
        setStats([
          { label: '练习次数', value: done.length },
          { label: '综合正确率', value: tq ? `${Math.round(tc / tq * 100)}%` : '—' },
          { label: '总答题数', value: tq },
          { label: '错题数', value: wrong.length },
        ])
      } catch (e) {
        console.error('load profile stats failed', e)
      } finally {
        if (active) setLoadingData(false)
      }
    })()
    return () => { active = false }
  }, [user])

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: '#9ca3af' }}>加载中…</div>
  }
  if (!user) return null

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const statStyle = { background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '14px', textAlign: 'center' as const, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      <div className="px-5 pt-14 pb-3">
        <h2 className="text-xl font-bold">个人中心</h2>
      </div>

      <div className="px-5">
        {/* User card */}
        <div className="rounded-2xl p-5 flex items-center gap-4 mb-5" style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
            style={{ width: 52, height: 52, fontSize: 22, background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>
            {user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold truncate">{user.email}</div>
            <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>账号已同步到云端</div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-xs font-bold uppercase tracking-wide mb-2.5" style={{ color: '#6b7280' }}>学习情况</div>
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {stats.map((s, i) => (
            <div key={i} style={statStyle}>
              <div className="text-2xl font-black" style={{ color: '#5b8def' }}>{s.value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={logout} className="w-full py-3 rounded-xl text-[15px] font-semibold cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#6b7280', fontFamily: 'inherit' }}>
          退出登录
        </button>
      </div>
      <BottomNav />
    </div>
  )
}
