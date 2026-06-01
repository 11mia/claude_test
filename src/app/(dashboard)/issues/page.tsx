'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Issue {
  id: string
  title: string
  source_url: string | null
  category: string
  published_at: string | null
}

const CATEGORIES = ['전체', 'geopolitical', 'macro', 'supply_chain', 'political']
const CATEGORY_LABELS: Record<string, string> = {
  geopolitical: '지정학',
  macro: '거시경제',
  supply_chain: '공급망',
  political: '정치',
  '전체': '전체',
}

function IssueList({ category }: { category: string }) {
  const [issues, setIssues] = useState<Issue[] | null>(null)

  useEffect(() => {
    const url = category === '전체' ? '/api/issues' : `/api/issues?category=${category}`
    fetch(url)
      .then(r => r.json())
      .then(json => setIssues(json.data ?? []))
      .catch(() => setIssues([]))
  }, [category])

  if (issues === null) return <p className="text-zinc-500 text-sm">로딩 중...</p>
  if (issues.length === 0) return <p className="text-zinc-500 text-sm">이슈가 없습니다.</p>

  return (
    <ul className="flex flex-col gap-3">
      {issues.map(issue => (
        <li key={issue.id}>
          <Link
            href={`/issues/${issue.id}`}
            className="block p-4 bg-white rounded-xl border border-zinc-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-medium text-zinc-900 leading-snug">{issue.title}</h2>
              <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                {CATEGORY_LABELS[issue.category] ?? issue.category}
              </span>
            </div>
            {issue.published_at && (
              <p className="mt-1 text-xs text-zinc-400">
                {new Date(issue.published_at).toLocaleString('ko-KR')}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function IssuesPage() {
  const [category, setCategory] = useState('전체')

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">글로벌 이슈</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              category === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-zinc-600 border-zinc-300 hover:border-blue-400'
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      <IssueList key={category} category={category} />
    </div>
  )
}
