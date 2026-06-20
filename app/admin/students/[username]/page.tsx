'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import BottomNav from '@/app/components/BottomNav'
import { getSessions, getWrong, getQuestions, getChapters } from '@/lib/storage'

const L = ['A', 'B', 'C', 'D']

function accCls(a: number) {
  if (a >= 75) return { background: '#e6f9ed', color: '#34c759' }
  if (a >= 50) return { background: '#fff8e1', color: '#f59e0b' }
  return { background: '#fee8e8', color: '#ff3b30' }
}

export default function StudentDetail() {
  const user     = useAuth('admin')
  const router   = useRouter()
  const { username } = useParams()
  const name     = decodeURIComponent(username as string)

  const [data, setData] = useState<{
    sessions: ReturnType<typeof getSessions>
    wrong: ReturnType<typeof getWrong>
    chMap: Record<number, { attempts: number; tq: number; tc: number }>
    tq: number; tc: number; acc: number
  } | null>(null)

  useEffect(() => {
    const sess  = getSessions().filter(s => s.username === name && s.completedAt)
    const wrong = getWrong().filter(w => w.username === name)
    const chMap: Record<number, { attempts: number; tq: number; tc: number }> = {}
    sess.forEach(s => {
      if (!chMap[s.chapterId]) chMap[s.chapterId] = { attempts: 0, tq: 0, tc: 0 }
      chMap[s.chapterId].attempts++
      chMap[s.chapterId].tq += s.totalQ
      chMap[s.chapterId].tc += s.correct
    })
    const tq = sess.reduce((a, s) => a + s.totalQ, 0)
    const tc = sess.reduce((a, s) => a + s.correct, 0)
    setData({ sessions: sess, wrong, chMap, tq, tc, acc: tq ? Math.round(tc / tq * 100) : 0 })
  }, [name])

  if (!user || !data) return null

  const qs  = getQuestions()
  const chs = getChapters()
  const row = { background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const stat = { background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '14px', textAlign: 'center' as const, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      <div className="px-5 pt-14 pb-3 flex items-center gap-2.5">
        <button onClick={() => router.push('/admin/students')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-base cursor-pointer border-0"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', color: '#5b8def' }}>←</button>
        <h2 className="text-xl font-bold">{name}</h2>
      </div>

      <div className="px-5">
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { num: data.sessions.length, lbl: '练习次数' },
            { num: `${data.acc}%`,       lbl: '综合正确率' },
            { num: data.tq,              lbl: '总答题数' },
            { num: data.wrong.length,    lbl: '错题数' },
          ].map((s, i) => (
            <div key={i} style={stat}>
              <div className="text-2xl font-black" style={{ color: '#5b8def' }}>{s.num}</div>
              <div className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {Object.keys(data.chMap).length > 0 && (
          <>
            <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>各章节情况</div>
            {Object.entries(data.chMap).map(([id, st]) => {
              const ch = chs.find(c => c.id === +id)
              const a  = st.tq ? Math.round(st.tc / st.tq * 100) : 0
              return (
                <div key={id} style={row}>
                  <div>
                    <div className="text-sm font-semibold">{ch ? ch.name : '已删除章节'}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>练习 {st.attempts} 次 · 共 {st.tq} 题</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-xs font-bold" style={accCls(a)}>{a}%</div>
                </div>
              )
            })}
          </>
        )}

        {data.wrong.length > 0 ? (
          <>
            <div className="text-xs font-bold uppercase tracking-wide mb-2 mt-4" style={{ color: '#6b7280' }}>错题列表</div>
            {data.wrong.map((w, i) => {
              const q = qs.find(q => q.id === w.questionId)
              if (!q) return null
              return (
                <div key={i} className="rounded-2xl p-3.5 mb-2.5" style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div className="text-sm font-semibold leading-snug">{q.question}</div>
                  <div className="flex gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: '#fee8e8', color: '#ff3b30' }}>答：{L[w.selectedIndex]}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: '#e6f9ed', color: '#34c759' }}>正确：{L[q.answer]}</span>
                  </div>
                  {q.explanation && <div className="text-xs mt-2 leading-relaxed" style={{ color: '#6b7280' }}>💡 {q.explanation}</div>}
                </div>
              )
            })}
          </>
        ) : (
          <div className="text-center py-8" style={{ color: '#6b7280' }}>
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-sm font-medium">没有错题记录</div>
          </div>
        )}

        {data.sessions.length > 0 && (
          <>
            <div className="text-xs font-bold uppercase tracking-wide mb-2 mt-4" style={{ color: '#6b7280' }}>练习记录</div>
            {[...data.sessions].reverse().map(s => {
              const ch = chs.find(c => c.id === s.chapterId)
              const a  = s.totalQ ? Math.round(s.correct / s.totalQ * 100) : 0
              const d  = new Date(s.completedAt!).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              return (
                <div key={s.id} style={row}>
                  <div>
                    <div className="text-sm font-semibold">{ch ? ch.name : '已删除章节'}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>{d} · {s.correct}/{s.totalQ} 题正确</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-xs font-bold" style={accCls(a)}>{a}%</div>
                </div>
              )
            })}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
