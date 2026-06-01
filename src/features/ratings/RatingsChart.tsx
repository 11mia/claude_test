'use client'

import { useState, useEffect } from 'react'

interface Rating {
  id: string
  firm: string
  rating: string
  price_target: number | null
  rated_at: string | null
}

const RATING_COLORS: Record<string, string> = {
  buy: 'bg-green-500',
  sell: 'bg-red-500',
  hold: 'bg-yellow-500',
}

export default function RatingsChart({ ticker }: { ticker: string }) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/ratings?ticker=${ticker}`)
      .then(r => r.json())
      .then(json => {
        setRatings(json.data ?? [])
        setLoading(false)
      })
  }, [ticker])

  if (loading) return <div className="text-sm text-zinc-400">기관 평가 로딩 중...</div>

  const total = ratings.length
  const counts = { buy: 0, hold: 0, sell: 0 }
  for (const r of ratings) {
    const key = r.rating.toLowerCase() as keyof typeof counts
    if (key in counts) counts[key]++
  }

  if (total === 0) {
    return (
      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <h2 className="font-semibold text-zinc-900 mb-1">기관 평가</h2>
        <p className="text-sm text-zinc-400">데이터 없음</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-zinc-200">
      <h2 className="font-semibold text-zinc-900 mb-3">기관 평가 트렌드 ({total}건)</h2>
      <div className="flex h-4 rounded-full overflow-hidden mb-3">
        {(['buy', 'hold', 'sell'] as const).map(key => (
          counts[key] > 0 && (
            <div
              key={key}
              className={`${RATING_COLORS[key]} transition-all`}
              style={{ width: `${(counts[key] / total) * 100}%` }}
              title={`${key}: ${counts[key]}`}
            />
          )
        ))}
      </div>
      <div className="flex gap-4 text-xs text-zinc-600">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          매수 {counts.buy}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          중립 {counts.hold}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          매도 {counts.sell}
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-1">
        {ratings.slice(0, 5).map(r => (
          <li key={r.id} className="flex items-center justify-between text-xs text-zinc-600">
            <span>{r.firm}</span>
            <span className={`px-2 py-0.5 rounded-full text-white text-xs ${RATING_COLORS[r.rating.toLowerCase()] ?? 'bg-zinc-400'}`}>
              {r.rating}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
