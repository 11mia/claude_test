import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 401 }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')
  if (!ticker) return NextResponse.json({ error: 'ticker required', code: 400 }, { status: 400 })

  const { data, error } = await supabase
    .from('institutional_ratings')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .order('rated_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message, code: 500 }, { status: 500 })
  return NextResponse.json({ data })
}
