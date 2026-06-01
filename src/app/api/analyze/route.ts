import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized', code: 401 }, { status: 401 })

  const { issue_id, ticker } = await request.json()
  if (!issue_id || !ticker) {
    return NextResponse.json({ error: 'issue_id and ticker required', code: 400 }, { status: 400 })
  }

  const admin = createAdminClient()

  // 중복 방지
  const { data: existing } = await admin
    .from('issue_analyses')
    .select('id, summary, impact_score, impact_label, scenario')
    .eq('issue_id', issue_id)
    .eq('ticker', ticker)
    .maybeSingle()

  if (existing) return NextResponse.json({ data: existing })

  // 이슈 조회
  const { data: issue } = await admin
    .from('global_issues')
    .select('title, category')
    .eq('id', issue_id)
    .single()

  if (!issue) return NextResponse.json({ error: 'Issue not found', code: 404 }, { status: 404 })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `다음 글로벌 이슈가 미국 주식 종목 ${ticker}에 미치는 영향을 분석해주세요.

이슈 제목: ${issue.title}
카테고리: ${issue.category}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "summary": "핵심 3줄 요약 (줄바꿈 없이 한 문장)",
  "impact_score": -100에서 +100 사이 정수 (양수=호재, 음수=악재),
  "impact_label": "강한 호재" | "호재" | "중립" | "악재" | "강한 악재",
  "scenario": "구체적인 시나리오 서술 (2-3문장)"
}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response format')

    const parsed = JSON.parse(jsonMatch[0]) as {
      summary: string
      impact_score: number
      impact_label: string
      scenario: string
    }

    const { data: saved, error } = await admin
      .from('issue_analyses')
      .insert({
        issue_id,
        ticker: ticker.toUpperCase(),
        summary: parsed.summary,
        impact_score: parsed.impact_score,
        impact_label: parsed.impact_label,
        scenario: parsed.scenario,
        raw_response: message as unknown as Record<string, unknown>,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data: saved })
  } catch {
    return NextResponse.json(
      { error: 'AI 분석을 일시적으로 사용할 수 없습니다', code: 503 },
      { status: 503 }
    )
  }
}
