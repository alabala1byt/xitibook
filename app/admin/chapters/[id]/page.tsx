'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import BottomNav from '@/app/components/BottomNav'
import Modal from '@/app/components/Modal'
import { getChapters, getQuestions, setQuestions, nextId } from '@/lib/storage'
import type { Question } from '@/lib/types'

const LABELS = ['A', 'B', 'C', 'D']

export default function ChapterDetail() {
  const user   = useAuth('admin')
  const router = useRouter()
  const { id } = useParams()
  const chId   = Number(id)

  const [chName, setChName]   = useState('')
  const [questions, setQState] = useState<Question[]>([])
  const [modal, setModal]      = useState(false)
  const [editQId, setEditQId]  = useState<number | null>(null)
  const [qText, setQText]      = useState('')
  const [opts, setOpts]        = useState(['', '', '', ''])
  const [ans, setAns]          = useState(0)
  const [exp, setExp]          = useState('')

  function load() {
    const ch = getChapters().find(c => c.id === chId)
    if (!ch) { router.replace('/admin/chapters'); return }
    setChName(ch.name)
    setQState(getQuestions().filter(q => q.chapterId === chId))
  }

  useEffect(() => { load() }, [chId])
  if (!user) return null

  function openAdd() {
    setEditQId(null); setQText(''); setOpts(['','','','']); setAns(0); setExp(''); setModal(true)
  }

  function openEdit(q: Question) {
    setEditQId(q.id); setQText(q.question); setOpts([...q.options]); setAns(q.answer); setExp(q.explanation || ''); setModal(true)
  }

  function save() {
    if (!qText.trim())         { alert('请输入题目内容'); return }
    if (opts.some(o => !o.trim())) { alert('请填写所有四个选项'); return }
    const qs = getQuestions()
    if (editQId !== null) {
      const i = qs.findIndex(q => q.id === editQId)
      if (i !== -1) qs[i] = { ...qs[i], question: qText.trim(), options: opts.map(o => o.trim()), answer: ans, explanation: exp.trim() }
    } else {
      qs.push({ id: nextId(qs), chapterId: chId, question: qText.trim(), options: opts.map(o => o.trim()), answer: ans, explanation: exp.trim() })
    }
    setQuestions(qs); setModal(false); load()
  }

  function del(qid: number) {
    if (!confirm('确定删除这道题？')) return
    setQuestions(getQuestions().filter(q => q.id !== qid)); load()
  }

  const cardStyle = { background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }
  const inputStyle = { border: '1.5px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.88)', borderRadius: 12, fontFamily: 'inherit', width: '100%', padding: '12px 14px', fontSize: 15, outline: 'none' }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      <div className="px-5 pt-14 pb-3 flex items-center gap-2.5">
        <button onClick={() => router.push('/admin/chapters')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-base cursor-pointer border-0"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', color: '#5b8def' }}>←</button>
        <h2 className="text-xl font-bold truncate">{chName}</h2>
      </div>

      <div className="px-5">
        {questions.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#6b7280' }}>
            <div className="text-5xl mb-3">✏️</div>
            <div className="text-sm font-medium">还没有题目</div>
            <div className="text-xs mt-1.5">点右下角 ＋ 添加题目</div>
          </div>
        ) : questions.map((q, i) => (
          <div key={q.id} className="rounded-[14px] p-3 mb-2.5" style={cardStyle}>
            <div className="text-sm font-medium leading-snug">
              <span style={{ color: '#6b7280' }}>{i + 1}. </span>{q.question}
            </div>
            <div className="mt-1.5">
              {q.options.map((o, oi) => (
                <div key={oi} className="text-xs mt-0.5" style={{ color: oi === q.answer ? '#34c759' : '#6b7280', fontWeight: oi === q.answer ? 600 : 400 }}>
                  {oi === q.answer ? '✓' : ' '} {LABELS[oi]}. {o}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <button onClick={() => openEdit(q)} className="py-1.5 px-3 rounded-[9px] text-xs font-semibold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#6b7280' }}>编辑</button>
              <button onClick={() => del(q.id)} className="py-1.5 px-3 rounded-[9px] text-xs font-semibold cursor-pointer border-0"
                style={{ background: '#fee8e8', color: '#ff3b30' }}>删除</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={openAdd}
        className="fixed w-12 h-12 rounded-full text-white text-2xl flex items-center justify-center cursor-pointer border-0 z-50"
        style={{ bottom: 88, right: 'max(16px, calc(50vw - 224px))', background: 'linear-gradient(135deg,#5b8def,#a78bfa)', boxShadow: '0 4px 18px rgba(91,141,239,0.4)' }}>
        ＋
      </button>

      {modal && (
        <Modal title={editQId ? '编辑题目' : '添加题目'} onClose={() => setModal(false)}>
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>题目</label>
            <textarea style={{ ...inputStyle, minHeight: 74, resize: 'vertical' }}
              placeholder="输入题目内容" value={qText} onChange={e => setQText(e.target.value)} />
          </div>
          {LABELS.map((l, i) => (
            <div key={l} className="mb-3">
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>选项 {l}</label>
              <input style={inputStyle} placeholder={`选项 ${l}`} value={opts[i]}
                onChange={e => { const o = [...opts]; o[i] = e.target.value; setOpts(o) }} />
            </div>
          ))}
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>正确答案</label>
            <div className="flex gap-2 flex-wrap">
              {LABELS.map((l, i) => (
                <div key={l} onClick={() => setAns(i)} className="px-3 py-1.5 rounded-[9px] text-sm font-semibold cursor-pointer"
                  style={{ border: `1.5px solid ${ans === i ? '#5b8def' : 'rgba(0,0,0,0.08)'}`, background: ans === i ? '#e8f0fe' : 'rgba(255,255,255,0.88)', color: ans === i ? '#5b8def' : '#1a1a2e' }}>
                  {l}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>解析（选填）</label>
            <textarea style={{ ...inputStyle, minHeight: 74, resize: 'vertical' }}
              placeholder="解析..." value={exp} onChange={e => setExp(e.target.value)} />
          </div>
          <button onClick={save} className="w-full py-3 rounded-xl text-[15px] font-semibold text-white border-0 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>保存</button>
        </Modal>
      )}

      <BottomNav />
    </div>
  )
}
