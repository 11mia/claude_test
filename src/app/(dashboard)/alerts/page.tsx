'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Alert {
  id: string
  ticker: string | null
  message: string
  is_read: boolean
  created_at: string
  global_issues: { title: string; category: string } | null
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(json => {
        setAlerts(json.data ?? [])
        setLoading(false)
      })

    // Supabase Realtime 구독
    const supabase = createClient()
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        payload => {
          setAlerts(prev => [payload.new as Alert, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function handleMarkRead(id: string) {
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
  }

  if (loading) return <div className="p-8 text-zinc-500">로딩 중...</div>

  const unread = alerts.filter(a => !a.is_read)
  const read = alerts.filter(a => a.is_read)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">알림 센터</h1>
      <p className="text-sm text-zinc-500 mb-6">읽지 않은 알림 {unread.length}개</p>

      {alerts.length === 0 ? (
        <p className="text-zinc-500 text-sm">알림이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {[...unread, ...read].map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-colors ${
                alert.is_read
                  ? 'bg-zinc-50 border-zinc-200 opacity-60'
                  : 'bg-white border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {alert.ticker && (
                    <span className="text-xs font-bold text-blue-600 mr-2">{alert.ticker}</span>
                  )}
                  <p className="text-sm text-zinc-800">{alert.message}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(alert.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => handleMarkRead(alert.id)}
                    className="flex-shrink-0 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    읽음
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
