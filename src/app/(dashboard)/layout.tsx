import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SignOutButton from '@/features/auth/SignOutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-zinc-900">StockRadar</Link>
          <Link href="/watchlist" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Watchlist</Link>
          <Link href="/issues" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Issues</Link>
          <Link href="/alerts" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Alerts</Link>
        </div>
        <SignOutButton />
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
