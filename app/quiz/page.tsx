'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import BottomNav from '@/app/components/BottomNav'
import { listChapters, listQuestions } from '@/lib/db'
import type { Chapter } from '@/lib/types'

export default function StudentHome() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [qCounts, setQCounts] = useState<Record<string, number>>({})
  const [loadingData, setLoadingData] = useState(true)

  async function load() {
    try {
      const [chs, qs] = await Promise.all([listChapters(), listQuestions()])
      const counts: Record<string, number> = {}
      chs.forEach(c => { counts[c.id] = qs.filter(q => q.chapterId === c.id).length })
      setChapters(chs)
      setQCounts(counts)
    } catch (e) {
      console.error('load practice list failed', e)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) load() }, [user])

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: '#9ca3af' }}>加载中…</div>
  }
  if (!user) return null

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black">开始练习</div>
            <div className="text-sm mt-0.5" style={{ color: '#6b7280' }}>选择章节做题</div>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>
            {user.email[0].toUpperCase()}
          </div>
        </div>
      </div>

      <div className="px-5">
        {chapters.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#6b7280' }}>
            <div className="text-5xl mb-3">📚</div>
            <div className="text-sm font-medium">暂无章节</div>
            <div className="text-xs mt-1.5">先去「题库」添加章节和题目</div>
          </div>
        ) : chapters.map(ch => {
          const qc = qCounts[ch.id] ?? 0
          return (
            <div key={ch.id} className="rounded-2xl p-3.5 mb-2.5" style={{ opacity: qc ? 1 : 0.55, background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#dbeafe,#e0e7ff)' }}>📖</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{ch.name}</div>
                  {ch.desc && <div className="text-xs mt-0.5 truncate" style={{ color: '#6b7280' }}>{ch.desc}</div>}
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#e8f0fe', color: '#5b8def' }}>{qc} 题</span>
              </div>
              {qc ? (
                <button onClick={() => router.push(`/quiz/${ch.id}`)}
                  className="w-full mt-2.5 py-3 rounded-xl text-[15px] font-semibold text-white border-0 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>开始练习</button>
              ) : (
                <div className="text-xs mt-2" style={{ color: '#6b7280' }}>暂无题目</div>
              )}
            </div>
          )
        })}
      </div>
      <BottomNav />
    </div>
  )
}
