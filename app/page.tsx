import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Server-side root redirect: straight into the app if a session cookie exists,
// otherwise to the login page. Avoids any client-side auth flash.
export default async function Root() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  redirect(user ? '/admin' : '/login')
}
