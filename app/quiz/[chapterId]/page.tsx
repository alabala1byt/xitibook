'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { getQuestions, getChapters, getSessions, setSessions, getWrong, setWrong, nextId } from '@/lib/storage'
import type { Question } from '@/lib/types'

const L = ['A', 'B', 'C', 'D']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizPage() {
  const user       = useAuth('student')
  const router     = useRouter()
  const { chapterId } = useParams()
  const chId       = Number(chapterId)

  const [qs, setQs]           = useState<Question[]>([])
  const [idx, setIdx]         = useState(0)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [picked, setPicked]   = useState<number | null>(null)
  const [done, setDone]       = useState(false)
  const [chName, setChName]   = useState('')
  const sidRef = useRef<number | null>(null)

  useEffect(() => {
    if (!user) return
    const ch = getChapters().find(c => c.id === chId)
    if (!ch) { router.replace('/quiz'); return }
    setChName(ch.name)
    const shuffled = shuffle(getQuestions().filter(q => q.chapterId === chId))
    if (!shuffled.length) { router.replace('/quiz'); return }
    setQs(shuffled)
    // start session
    const sess = getSessions()
    const sid  = nextId(sess)
    sidRef.current = sid
    sess.push({ id: sid, username: user.username, chapterId: chId, startedAt: new Date().toISOString(), totalQ: shuffled.length, correct: 0 })
    setSessions(sess)
  }, [user, chId, router])

  function pick(sel: number) {
    if (answered || !user) return
    setAnswered(true)
    setPicked(sel)
    const q  = qs[idx]
    const ok = sel === q.answer
    if (ok) {
      setCorrect(c => c + 1)
    } else {
      const wrong = getWrong()
      const ei    = wrong.findIndex(w => w.questionId === q.id && w.username === user.username)
      if (ei === -1) wrong.push({ questionId: q.id, selectedIndex: sel, username: user.username })
      else wrong[ei].selectedIndex = sel
      setWrong(wrong)
    }
  }

  function next(newCorrect: number) {
    if (idx + 1 >= qs.length) {
      // finish
      const sess = getSessions()
      const i    = sess.findIndex(s => s.id === sidRef.current)
      if (i !== -1) {
        sess[i].completedAt = new Date().toISOString()
        sess[i].correct     = newCorrect
        sess[i].accuracy    = Math.round(newCorrect / qs.length * 100)
      }
      setSessions(sess)
      setDone(true)
    } else {
      setIdx(i => i + 1)
      setAnswered(false)
      setPicked(null)
    }
  }

  function exit() {
    if (qs.length && !confirm('确定退出练习？')) return
    if (sidRef.current !== null) {
      const sess = getSessions()
      const i    = sess.findIndex(s => s.id === sidRef.current && !s.completedAt)
      if (i !== -1) sess.splice(i, 1)
      setSessions(sess)
    }
    router.push('/quiz')
  }

  if (!user || !qs.length) return null

  const q     = qs[idx]
  const total = qs.length
  const pct   = Math.round((done ? total : idx) / total * 100)

  // track correct count for next() call
  const curCorrect = answered && picked === q?.answer ? correct : correct

  if (done) {
    const score = correct
    const acc   = Math.round(score / total * 100)
    return (
      <div className="max-w-[480px] mx-auto flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center mb-5"
          style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)', boxShadow: '0 8px 28px rgba(91,141,239,0.35)' }}>
          <div className="text-3xl font-black text-white">{score}</div>
          <div className="text-sm text-white/75">/ {total}</div>
        </div>
        <div className="text-xl font-bold">{acc >= 80 ? '太棒了！🎉' : acc >= 60 ? '不错，继续加油！' : '再接再厉 💪'}</div>
        <div className="text-sm mt-1.5" style={{ color: '#6b7280' }}>正确率 {acc}%</div>
        <div className="w-full mt-7 flex flex-col gap-2.5">
          <button onClick={() => router.push('/quiz')} className="w-full py-3 rounded-xl text-[15px] font-semibold text-white border-0 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>返回首页</button>
          <button onClick={() => router.push('/wrong-answers')} className="w-full py-3 rounded-xl text-[15px] font-semibold cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#6b7280' }}>查看错题</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen">
      {/* Header */}
      <div className="px-5 pt-14">
        <div className="flex items-center gap-2.5">
          <button onClick={exit} className="w-8 h-8 rounded-full flex items-center justify-center text-base cursor-pointer border-0"
            style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', color: '#5b8def' }}>←</button>
          <div className="flex-1">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#5b8def,#a78bfa)' }} />
            </div>
            <div className="text-[11px] text-right mt-1" style={{ color: '#6b7280' }}>{idx + 1} / {total}</div>
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="mx-4 mt-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(91,141,239,0.10)' }}>
        <div className="text-base font-semibold leading-relaxed">{q.question}</div>
        <div className="mt-4 flex flex-col gap-2.5">
          {q.options.map((o, i) => {
            let bg = 'rgba(255,255,255,0.88)', border = '1.5px solid rgba(0,0,0,0.08)', color = '#1a1a2e', lblBg = 'rgba(0,0,0,0.06)'
            if (answered) {
              if (i === q.answer) { bg = '#e6f9ed'; border = '1.5px solid #34c759'; lblBg = '#34c759'; color = '#1a1a2e' }
              else if (i === picked) { bg = '#fee8e8'; border = '1.5px solid #ff3b30'; lblBg = '#ff3b30'; color = '#1a1a2e' }
            }
            return (
              <button key={i} onClick={() => pick(i)} disabled={answered}
                className="flex items-center gap-2.5 text-left rounded-xl px-3.5 py-3 text-sm cursor-pointer border-0 transition-all"
                style={{ background: bg, border, color, fontFamily: 'inherit' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: lblBg, color: (answered && (i === q.answer || i === picked)) ? '#fff' : '#1a1a2e' }}>
                  {L[i]}
                </span>
                {o}
              </button>
            )
          })}
        </div>
      </div>

      {/* Explanation */}
      {answered && q.explanation && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="text-xs font-bold mb-1.5" style={{ color: '#6b7280' }}>💡 解析</div>
          <div className="text-sm leading-relaxed">{q.explanation}</div>
        </div>
      )}

      {/* Next button */}
      {answered && (
        <div className="px-4 mt-3 pb-6">
          <button onClick={() => next(correct)} className="w-full py-3 rounded-xl text-[15px] font-semibold text-white border-0 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>
            {idx + 1 >= total ? '查看结果' : '下一题 →'}
          </button>
        </div>
      )}
    </div>
  )
}
