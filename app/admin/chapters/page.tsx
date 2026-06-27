'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import BottomNav from '@/app/components/BottomNav'
import Modal from '@/app/components/Modal'
import { listChapters, listQuestions, createChapter, updateChapter, deleteChapter } from '@/lib/db'
import type { Chapter } from '@/lib/types'

export default function AdminChapters() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [chapters, setChaptersState] = useState<Chapter[]>([])
  const [qCounts, setQCounts] = useState<Record<string, number>>({})
  const [loadingData, setLoadingData] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [chName, setChName] = useState('')
  const [chDesc, setChDesc] = useState('')

  async function load() {
    try {
      const [chs, qs] = await Promise.all([listChapters(), listQuestions()])
      const counts: Record<string, number> = {}
      chs.forEach(c => { counts[c.id] = qs.filter(q => q.chapterId === c.id).length })
      setChaptersState(chs)
      setQCounts(counts)
    } catch (e) {
      console.error('load chapters failed', e)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) load() }, [user])

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: '#9ca3af' }}>加载中…</div>
  }
  if (!user) return null

  function openAdd() { setChName(''); setChDesc(''); setModal('add') }
  function openEdit(ch: Chapter) { setEditId(ch.id); setChName(ch.name); setChDesc(ch.desc || ''); setModal('edit') }

  async function save() {
    if (!chName.trim()) { alert('请输入章节名称'); return }
    try {
      if (modal === 'edit' && editId) {
        await updateChapter(editId, chName.trim(), chDesc)
      } else {
        await createChapter(chName.trim(), chDesc)
      }
      setModal(null)
      await load()
    } catch (e: any) {
      alert('保存失败：' + (e?.message || '未知错误'))
    }
  }

  async function del(id: string) {
    const ch = chapters.find(c => c.id === id)
    if (!ch || !confirm(`确定删除「${ch.name}」及其所有题目？`)) return
    try {
      await deleteChapter(id)
      await load()
    } catch (e: any) {
      alert('删除失败：' + (e?.message || '未知错误'))
    }
  }

  const cardStyle = { background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }
  const inputStyle = { border: '1.5px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.88)', borderRadius: 12, fontFamily: 'inherit' }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen pb-24">
      <div className="px-5 pt-14 pb-3 flex items-center gap-2.5">
        <button onClick={() => router.push('/admin')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-base cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', color: '#5b8def' }}>
          ←
        </button>
        <h2 className="text-xl font-bold">题库管理</h2>
      </div>

      <div className="px-5">
        {chapters.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#6b7280' }}>
            <div className="text-5xl mb-3">📂</div>
            <div className="text-sm font-medium">还没有章节</div>
            <div className="text-xs mt-1.5">点右下角 ＋ 新建章节</div>
          </div>
        ) : chapters.map(ch => (
          <div key={ch.id} className="rounded-2xl p-3.5 mb-2.5" style={cardStyle}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#dbeafe,#e0e7ff)' }}>📁</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{ch.name}</div>
                {ch.desc && <div className="text-xs mt-0.5 truncate" style={{ color: '#6b7280' }}>{ch.desc}</div>}
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#e8f0fe', color: '#5b8def' }}>
                {qCounts[ch.id] ?? 0} 题
              </span>
            </div>
            <div className="flex gap-1.5 mt-2.5">
              <button onClick={() => router.push(`/admin/chapters/${ch.id}`)}
                className="flex-1 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border-0"
                style={{ background: '#e8f0fe', color: '#5b8def' }}>管理题目</button>
              <button onClick={() => openEdit(ch)}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#6b7280' }}>编辑</button>
              <button onClick={() => del(ch.id)}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer border-0"
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
        <Modal title={modal === 'add' ? '新建章节' : '编辑章节'} onClose={() => setModal(null)}>
          <div className="mb-3">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>章节名称</label>
            <input className="w-full px-3.5 py-3 text-[15px] outline-none" style={inputStyle}
              placeholder="例：第一章 基础概念" value={chName} onChange={e => setChName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>描述（选填）</label>
            <input className="w-full px-3.5 py-3 text-[15px] outline-none" style={inputStyle}
              placeholder="简短说明" value={chDesc} onChange={e => setChDesc(e.target.value)} />
          </div>
          <button onClick={save} className="w-full py-3 rounded-xl text-[15px] font-semibold text-white border-0 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>
            {modal === 'add' ? '创建' : '保存'}
          </button>
        </Modal>
      )}

      <BottomNav />
    </div>
  )
}
