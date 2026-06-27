'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import BottomNav from '@/app/components/BottomNav'
import { listChapters, listQuestions, listSessions, listWrong } from '@/lib/db'

export default function AdminHome() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ chs: 0, qs: 0, sess: 0, wrong: 0 })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      try {
        const [chs, qs, sess, wrong] = await Promise.all([
          listChapters(),
          listQuestions(),
          listSessions(),
          listWrong(),
        ])
        if (!active) return
        setStats({
          chs: chs.length,
          qs: qs.length,
          sess: sess.filter(s => s.completedAt).length,
          wrong: wrong.length,
        })
      } catch (e) {
        console.error('load stats failed', e)
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

  const card = 'rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5'
  const cardStyle = { background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black">你好！</div>
            <div className="text-sm mt-0.5 truncate" style={{ color: '#6b7280' }}>{user.email}</div>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>
            {user.email[0].toUpperCase()}
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📂', name: '题库管理', desc: '录题 / 改答案', href: '/admin/chapters' },
            { icon: '✏️', name: '开始练习', desc: '做题 / 学习', href: '/quiz' },
            { icon: '📝', name: '错题本', desc: '复习错题', href: '/wrong-answers' },
          ].map(c => (
            <div key={c.href} onClick={() => router.push(c.href)} className={card} style={cardStyle}>
              <div className="text-3xl mb-2.5">{c.icon}</div>
              <div className="text-sm font-bold">{c.name}</div>
              <div className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wide mb-2.5" style={{ color: '#6b7280' }}>总览</div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { num: stats.chs, lbl: '章节数' },
              { num: stats.qs, lbl: '题目数' },
              { num: stats.sess, lbl: '练习次数' },
              { num: stats.wrong, lbl: '错题数' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-3.5 text-center" style={cardStyle}>
                <div className="text-2xl font-black" style={{ color: '#5b8def' }}>{s.num}</div>
                <div className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
