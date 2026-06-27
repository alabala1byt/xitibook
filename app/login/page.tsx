'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Translate common Supabase auth errors into friendly Chinese messages.
function translateError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return '邮箱或密码错误'
  if (m.includes('already registered') || m.includes('already been registered'))
    return '该邮箱已注册，请直接登录'
  if (m.includes('password should be at least')) return '密码至少 6 位'
  if (m.includes('unable to validate email')) return '邮箱格式不正确'
  if (m.includes('rate limit') || m.includes('too many')) return '操作过于频繁，请稍后再试'
  return message
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already signed in? Skip straight to the app. Client created lazily so this
  // page can be statically prerendered without the Supabase env vars at build time.
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/admin')
    })
  }, [router])

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    setError('')
    const em = email.trim()
    if (!em || !password) { setError('请输入邮箱和密码'); return }
    if (password.length < 6) { setError('密码至少 6 位'); return }

    setBusy(true)
    const sb = createClient()
    const { error } =
      mode === 'in'
        ? await sb.auth.signInWithPassword({ email: em, password })
        : await sb.auth.signUp({ email: em, password })
    setBusy(false)

    if (error) { setError(translateError(error.message)); return }
    router.replace('/admin')
  }

  const inputStyle = {
    border: '1.5px solid rgba(0,0,0,0.08)',
    background: 'rgba(255,255,255,0.88)',
    fontFamily: 'inherit',
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-10 mx-auto" style={{ maxWidth: 480 }}>
      <div className="flex items-center justify-center text-3xl mb-5 shadow-lg"
        style={{ width: 68, height: 68, borderRadius: 18, background: 'linear-gradient(135deg,#5b8def,#a78bfa)' }}>
        📚
      </div>
      <h1 className="text-3xl font-black">习题本</h1>
      <p className="text-sm mt-1.5 mb-7" style={{ color: '#6b7280' }}>
        {mode === 'in' ? '登录账号，继续学习' : '注册账号，开始学习'}
      </p>

      <form onSubmit={submit} className="mb-3">
        <div className="mb-3">
          <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>邮箱</label>
          <input
            type="email"
            autoComplete="email"
            className="w-full px-3.5 py-3 text-[15px] outline-none transition-colors rounded-xl"
            style={inputStyle}
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold block mb-1.5" style={{ color: '#6b7280' }}>密码</label>
          <input
            type="password"
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            className="w-full px-3.5 py-3 text-[15px] outline-none transition-colors rounded-xl"
            style={inputStyle}
            placeholder="至少 6 位"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl px-3.5 py-2.5 text-sm mb-3" style={{ background: '#fee8e8', color: '#ff3b30' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl text-[15px] font-semibold text-white border-0 cursor-pointer disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#5b8def,#a78bfa)', boxShadow: '0 4px 16px rgba(91,141,239,0.3)' }}
        >
          {busy ? '请稍候…' : mode === 'in' ? '登录 →' : '注册并登录 →'}
        </button>
      </form>

      <div className="text-sm text-center" style={{ color: '#6b7280' }}>
        {mode === 'in' ? '还没有账号？' : '已有账号？'}
        <button
          type="button"
          onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError('') }}
          className="ml-1 font-semibold border-0 bg-transparent cursor-pointer p-0"
          style={{ color: '#5b8def' }}
        >
          {mode === 'in' ? '去注册' : '去登录'}
        </button>
      </div>
    </div>
  )
}
