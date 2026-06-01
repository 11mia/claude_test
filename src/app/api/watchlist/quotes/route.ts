import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const POLYGON_BASE = 'https://api.polygon.io'
const TIMEOUT_MS = 5000

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 401 }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const tickers = searchParams.get('tickers')
  if (!tickers) return NextResponse.json({ error: 'tickers required', code: 400 }, { status: 400 })

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(
      `${POLYGON_BASE}/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers}&apiKey=${process.env.POLYGON_API_KEY}`,
      { signal: controller.signal, next: { revalidate: 60 } }
    )
    clearTimeout(timer)

    if (!res.ok) throw new Error(`Polygon API error: ${res.status}`)
    const json = await res.json()
    return NextResponse.json({ data: json.tickers ?? [] })
  } catch {
    return NextResponse.json({ data: [], stale: true, error: '데이터 지연 중' })
  }
}
