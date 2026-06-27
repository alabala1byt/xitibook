'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

// Reads the Supabase session. Because @supabase/ssr stores the session in a
// cookie (kept fresh by proxy.ts), a logged-in user stays logged in on refresh.
// There are no roles — every signed-in user manages and practices their own bank.
//
// The client is created inside the effect (client-only), never at module load,
// so static prerendering at build time does not require the Supabase env vars.
export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!active) return
      if (!u) {
        setLoading(false)
        router.replace('/login')
        return
      }
      setUser({ id: u.id, email: u.email || '' })
      setLoading(false)
    })

    // React to sign-out / token expiry happening elsewhere.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (!session?.user) router.replace('/login')
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [router])

  return { user, loading }
}
