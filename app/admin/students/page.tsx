'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import BottomNav from '@/app/components/BottomNav'
import { getStudents, getSessions, getWrong } from '@/lib/storage'
import type { Student } from '@/lib/types'

export default function AdminStudents() {
  const user   = useAuth('admin')
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [statMap, setStatMap]   = useState<Record<string, { sessions: number; acc: number | null; wrong: number }>>({})

  useEffect(() => {
    const stus  = getStudents()
    const sess  = getSessions()
    const wrong = getWrong()
    const map: typeof statMap = {}
    stus.forEach(s => {
      const mySess  = sess.filter(se => se.username === s.username && se.completedAt)
      const myWrong = wrong.filter(w => w.username === s.username)
      const tq = mySess.reduce((a, se) => a + se.totalQ, 0)
      const tc = mySess.reduce((a, se) => a + se.correct, 0)
      map[s.username] = { sessions: mySess.length, acc: tq ? Math.round(tc / tq * 100) : null, wrong: myWrong.length }
    })
    setStudents(stus)
    setStatMap(map)
  }, [])

  if (!user) return null

  function accStyle(acc: number | null) {
    if (acc === null) return { background: '#fff8e1', color: '#f59e0b' }
    if (acc >= 75) return { background: '#e6f9ed', color: '#34c759' }
    if (acc >= 50) return { background: '#fff8e1', color: '#f59e0b' }
    return { background: '#fee8e8', color: '#ff3b30' }
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      <div className="px-5 pt-14 pb-3 flex items-center gap-2.5">
        <button onClick={() => router.push('/admin')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-base cursor-pointer border-0"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', color: '#5b8def' }}>←</button>
        <h2 className="text-xl font-bold">学生统计</h2>
      </div>

      <div className="px-5">
        {students.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#6b7280' }}>
            <div className="text-5xl mb-3">👥</div>
            <div className="text-sm font-medium">还没有学生登录过</div>
          </div>
        ) : students.map(s => {
          const st = statMap[s.username]
          const last = new Date(s.lastActiveAt).toLocaleDateString('zh-CN')
          return (
            <div key={s.username} onClick={() => router.push(`/admin/students/${encodeURIComponent(s.username)}`)}
              className="rounded-2xl p-3.5 mb-2.5 cursor-pointer transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>
                  {s.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{s.username}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    最近活跃：{last} · {st?.sessions ?? 0} 次练习 · 错 {st?.wrong ?? 0} 题
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full text-xs font-bold" style={accStyle(st?.acc ?? null)}>
                  {st?.acc !== null && st?.acc !== undefined ? `${st.acc}%` : '—'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <BottomNav />
    </div>
  )
}
