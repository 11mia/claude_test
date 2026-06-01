import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RatingsChart from '@/features/ratings/RatingsChart'

export default async function TickerDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>
}) {
  const { ticker } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: watchlistItem } = await supabase
    .from('watchlist_items')
    .select('ticker, company, added_at')
    .eq('user_id', user.id)
    .eq('ticker', ticker.toUpperCase())
    .maybeSingle()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/watchlist" className="text-sm text-zinc-400 hover:text-zinc-700">← Watchlist</Link>
        <h1 className="text-2xl font-bold text-zinc-900">{ticker.toUpperCase()}</h1>
        {watchlistItem?.company && (
          <span className="text-zinc-500 text-sm">{watchlistItem.company}</span>
        )}
      </div>

      <RatingsChart ticker={ticker.toUpperCase()} />

      {!watchlistItem && (
        <p className="mt-6 text-sm text-zinc-500">이 종목은 Watchlist에 없습니다.</p>
      )}
    </div>
  )
}
