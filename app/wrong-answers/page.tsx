'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import BottomNav from '@/app/components/BottomNav'
import { getWrong, getQuestions, getChapters } from '@/lib/storage'

const L = ['A', 'B', 'C', 'D']

export default function WrongAnswers() {
  const user = useAuth('student')
  const [items, setItems] = useState<{ question: string; options: string[]; answer: number; explanation?: string; selectedIndex: number; chName?: string }[]>([])

  useEffect(() => {
    if (!user) return
    const wrong = getWrong().filter(w => w.username === user.username)
    const qs  = getQuestions()
    const chs = getChapters()
    setItems(wrong.map(w => {
      const q  = qs.find(q => q.id === w.questionId)
      if (!q) return null
      const ch = chs.find(c => c.id === q.chapterId)
      return { question: q.question, options: q.options, answer: q.answer, explanation: q.explanation, selectedIndex: w.selectedIndex, chName: ch?.name }
    }).filter(Boolean) as typeof items)
  }, [user])

  if (!user) return null

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      <div className="px-5 pt-14 pb-3 flex items-center gap-2.5">
        <h2 className="text-xl font-bold">错题本</h2>
      </div>

      <div className="px-5">
        {items.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#6b7280' }}>
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-sm font-medium">没有错题！</div>
            <div className="text-xs mt-1.5">继续保持</div>
          </div>
        ) : items.map((item, i) => (
          <div key={i} className="rounded-2xl p-3.5 mb-2.5" style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="text-sm font-semibold leading-snug">{item.question}</div>
            <div className="flex gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: '#fee8e8', color: '#ff3b30' }}>我答：{L[item.selectedIndex]}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: '#e6f9ed', color: '#34c759' }}>正确：{L[item.answer]}</span>
            </div>
            {item.explanation && <div className="text-xs mt-2 leading-relaxed" style={{ color: '#6b7280' }}>💡 {item.explanation}</div>}
            {item.chName && <div className="text-[11px] mt-1.5" style={{ color: '#9ca3af' }}>{item.chName}</div>}
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
