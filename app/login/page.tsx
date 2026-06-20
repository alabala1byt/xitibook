'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, setUser as saveUser, getStudents, setStudents, seedData } from '@/lib/storage'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole]   = useState<'admin' | 'student' | null>(null)
  const [name, setName]   = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    seedData()
    const u = getUser()
    if (u) router.replace(u.role === 'admin' ? '/admin' : '/quiz')
  }, [router])

  function login() {
    setError('')
    if (!role)        { setError('请先选择身份'); return }
    const n = name.trim()
    if (!n)           { setError('请输入用户名'); return }
    saveUser({ username: n, role })
    if (role === 'student') {
      const stus = getStudents(), now = new Date().toISOString()
      const ei = stus.findIndex(s => s.username === n)
      if (ei === -1) stus.push({ username: n, firstSeenAt: now, lastActiveAt: now })
      else stus[ei].lastActiveAt = now
      setStudents(stus)
    }
    router.push(role === 'admin' ? '/admin' : '/quiz')
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-10 mx-auto" style={{ maxWidth: 480 }}>
      <div className="flex items-center justify-center text-3xl mb-5 shadow-lg"
        style={{ width: 68, height: 68, borderRadius: 18, background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>
        📚
      </div>
      <h1 className="text-3xl font-black">习题本</h1>
      <p className="text-sm mt-1.5 mb-7" style={{ color: '#6b7280' }}>选择身份，开始学习</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['admin', 'student'] as const).map(r => (
          <div key={r} onClick={() => setRole(r)} className="rounded-2xl p-5 text-center cursor-pointer transition-all"
            style={{
              background: role === r ? '#e8f0fe' : 'rgba(255,255,255,0.88)',
              border: `2px solid ${role === r ? '#5b8def' : 'rgba(0,0,0,0.08)'}`,
            }}>
            <div className="text-4xl mb-2">{r === 'admin' ? '👨‍🏫' : '🎓'}</div>
            <div className="text-sm font-semibold">{r === 'admin' ? '管理员' : '学生'}</div>
            <div className="text-[11px] mt-0.5" style={{ color: '#6b7280' }}>{r === 'admin' ? '录题 / 管理' : '做题 / 学习'}</div>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>用户名</label>
        <input className="w-full px-3.5 py-3 text-[15px] outline-none transition-colors rounded-xl"
          style={{ border: '1.5px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.88)', fontFamily: 'inherit' }}
          placeholder="输入你的名字" maxLength={20} value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          onFocus={e => (e.target.style.borderColor = '#5b8def')}
          onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')}
        />
      </div>

      {error && <div className="rounded-xl px-3.5 py-2.5 text-sm mb-3" style={{ background: '#fee8e8', color: '#ff3b30' }}>{error}</div>}

      <button onClick={login} className="w-full py-3 rounded-xl text-[15px] font-semibold text-white"
        style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)', boxShadow: '0 4px 16px rgba(91,141,239,0.3)' }}>
        进入 →
      </button>
    </div>
  )
}
