'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface WatchlistItem {
  id: string
  ticker: string
  company: string | null
  added_at: string
}

interface Quote {
  ticker: string
  day?: { c: number; o: number }
  prevDay?: { c: number }
  todaysChangePerc?: number
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [newTicker, setNewTicker] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/watchlist')
    const json = await res.json()
    if (json.data) setItems(json.data)
    setLoading(false)
  }, [])

  const fetchQuotes = useCallback(async (tickers: string[]) => {
    if (!tickers.length) return
    const res = await fetch(`/api/watchlist/quotes?tickers=${tickers.join(',')}`)
    const json = await res.json()
    if (json.stale) setStale(true)
    const map: Record<string, Quote> = {}
    for (const q of json.data ?? []) map[q.ticker] = q
    setQuotes(map)
  }, [])

  useEffect(() => {
    ;(async () => {
      await fetchItems()
    })()
  }, [fetchItems])

  useEffect(() => {
    if (!items.length) return
    ;(async () => {
      await fetchQuotes(items.map(i => i.ticker))
    })()
  }, [items, fetchQuotes])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTicker.trim()) return
    setAdding(true)
    setError(null)
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: newTicker.trim().toUpperCase() }),
    })
    const json = await res.json()
    if (json.error) {
      setError(json.error)
    } else {
      setNewTicker('')
      await fetchItems()
    }
    setAdding(false)
  }

  async function handleDelete(ticker: string) {
    await fetch(`/api/watchlist/${ticker}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.ticker !== ticker))
  }

  if (loading) return <div className="p-8 text-zinc-500">로딩 중...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Watchlist</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="티커 입력 (예: AAPL)"
          value={newTicker}
          onChange={e => setNewTicker(e.target.value.toUpperCase())}
          className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? '추가 중...' : '추가'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {stale && (
        <p className="text-sm text-amber-600 mb-4 bg-amber-50 px-3 py-2 rounded">
          ⚠ 데이터 지연 중 — 시세 정보가 최신이 아닐 수 있습니다
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-zinc-500 text-sm">관심 종목이 없습니다. 위에서 추가해보세요.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map(item => {
            const q = quotes[item.ticker]
            const price = q?.day?.c ?? q?.prevDay?.c
            const change = q?.todaysChangePerc
            return (
              <li key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200">
                <Link href={`/watchlist/${item.ticker}`} className="flex-1 hover:opacity-80">
                  <span className="font-semibold text-zinc-900">{item.ticker}</span>
                  {item.company && <span className="ml-2 text-sm text-zinc-500">{item.company}</span>}
                  {price !== undefined && (
                    <span className="ml-3 text-sm font-medium">
                      ${price.toFixed(2)}{' '}
                      {change !== undefined && (
                        <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                        </span>
                      )}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => handleDelete(item.ticker)}
                  className="ml-4 text-sm text-zinc-400 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
