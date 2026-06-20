'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/storage'
import type { User } from '@/lib/types'

export function useAuth(role?: 'admin' | 'student') {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/login'); return }
    if (role && u.role !== role) {
      router.replace(u.role === 'admin' ? '/admin' : '/quiz')
      return
    }
    setUser(u)
  }, [router, role])

  return user
}
