import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 401 }, { status: 401 })

  const { data, error } = await supabase
    .from('watchlist_items')
    .select('*')
    .order('added_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message, code: 500 }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 401 }, { status: 401 })

  const { ticker, company } = await request.json()
  if (!ticker) return NextResponse.json({ error: 'ticker required', code: 400 }, { status: 400 })

  const { data, error } = await supabase
    .from('watchlist_items')
    .insert({ user_id: user.id, ticker: ticker.toUpperCase(), company: company ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message, code: 500 }, { status: 500 })
  return NextResponse.json({ data })
}
