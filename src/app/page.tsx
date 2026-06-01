import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SignOutButton from '@/features/auth/SignOutButton'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-zinc-900">StockRadar</span>
          <Link href="/watchlist" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Watchlist</Link>
          <Link href="/issues" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Issues</Link>
          <Link href="/alerts" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">Alerts</Link>
        </div>
        <SignOutButton />
      </nav>
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">대시보드</h1>
        <p className="text-zinc-500 mb-8">{user.email}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/watchlist"
            className="p-6 bg-white rounded-xl border border-zinc-200 hover:border-blue-300 transition-colors"
          >
            <h2 className="font-semibold text-zinc-900 mb-1">Watchlist</h2>
            <p className="text-sm text-zinc-500">관심 종목 관리</p>
          </Link>
          <Link
            href="/issues"
            className="p-6 bg-white rounded-xl border border-zinc-200 hover:border-blue-300 transition-colors"
          >
            <h2 className="font-semibold text-zinc-900 mb-1">글로벌 이슈</h2>
            <p className="text-sm text-zinc-500">최신 이슈 피드</p>
          </Link>
          <Link
            href="/alerts"
            className="p-6 bg-white rounded-xl border border-zinc-200 hover:border-blue-300 transition-colors"
          >
            <h2 className="font-semibold text-zinc-900 mb-1">알림</h2>
            <p className="text-sm text-zinc-500">AI 분석 알림</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
