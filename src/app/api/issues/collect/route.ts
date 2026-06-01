import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const NEWSAPI_BASE = 'https://newsapi.org/v2'
const TIMEOUT_MS = 8000

const CATEGORIES: Record<string, string[]> = {
  geopolitical: ['war', 'conflict', 'military', 'geopolitical', 'NATO', 'sanctions', 'invasion'],
  macro: ['inflation', 'interest rate', 'GDP', 'recession', 'Fed', 'central bank', 'economy'],
  supply_chain: ['supply chain', 'shortage', 'semiconductor', 'oil', 'energy', 'logistics'],
  political: ['election', 'congress', 'senate', 'president', 'policy', 'regulation', 'tariff'],
}

function detectCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) return cat
  }
  return 'macro'
}

export async function POST() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const supabase = createAdminClient()

  try {
    const res = await fetch(
      `${NEWSAPI_BASE}/everything?q=economy+OR+market+OR+geopolitical+OR+stocks&language=en&sortBy=publishedAt&pageSize=20&apiKey=${process.env.NEWS_API_KEY}`,
      { signal: controller.signal }
    )
    clearTimeout(timer)

    if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`)
    const json = await res.json()
    const articles = (json.articles ?? []) as Array<{
      title: string
      url: string
      description: string
      publishedAt: string
    }>

    const issues = articles
      .filter(a => a.title && a.title !== '[Removed]')
      .map(a => ({
        title: a.title,
        source_url: a.url,
        category: detectCategory(a.title, a.description ?? ''),
        published_at: a.publishedAt,
      }))

    if (issues.length > 0) {
      const { error } = await supabase
        .from('global_issues')
        .upsert(issues, { onConflict: 'title', ignoreDuplicates: true })
      if (error) throw error
    }

    // 방금 저장된 이슈로 알림 생성
    await generateAlertsForNewIssues(supabase)

    return NextResponse.json({ data: { collected: issues.length } })
  } catch {
    clearTimeout(timer)
    // NewsAPI 장애: DB 기존 데이터 반환
    const { data } = await supabase
      .from('global_issues')
      .select('id, title, published_at')
      .order('published_at', { ascending: false })
      .limit(10)
    return NextResponse.json({ data: { collected: 0, fallback: data }, stale: true })
  }
}

async function generateAlertsForNewIssues(supabase: ReturnType<typeof createAdminClient>) {
  const { data: recentIssues } = await supabase
    .from('global_issues')
    .select('id, title')
    .order('created_at', { ascending: false })
    .limit(20)
  if (!recentIssues?.length) return

  const { data: watchlistItems } = await supabase
    .from('watchlist_items')
    .select('user_id, ticker')
  if (!watchlistItems?.length) return

  const alerts = []
  for (const issue of recentIssues) {
    for (const item of watchlistItems) {
      if (issue.title.toUpperCase().includes(item.ticker)) {
        alerts.push({
          user_id: item.user_id,
          issue_id: issue.id,
          ticker: item.ticker,
          message: `[${item.ticker}] 관련 이슈: ${issue.title.slice(0, 100)}`,
        })
      }
    }
  }

  if (alerts.length > 0) {
    await supabase.from('alerts').upsert(alerts, { ignoreDuplicates: true })
  }
}
