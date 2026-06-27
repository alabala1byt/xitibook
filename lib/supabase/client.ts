import { createBrowserClient } from '@supabase/ssr'

// Browser client — used by Client Components for auth + data access.
// The @supabase/ssr browser client persists the session in cookies, so a
// logged-in user stays logged in across page refreshes and devices.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
