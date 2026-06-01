# Guardrail: NEXT_PUBLIC_ 접두사로 서버 전용 키 노출 차단
# 트리거: PreToolUse Write|Edit
# 목적: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY 등 클라이언트 번들에 포함되면
#        안 되는 키를 NEXT_PUBLIC_ 변수로 노출하려는 시도를 차단한다.

$j = $input | ConvertFrom-Json
$c = if ($j.tool_input.content) { $j.tool_input.content } `
     elseif ($j.tool_input.new_string) { $j.tool_input.new_string } `
     else { '' }

$dangerPatterns = @(
    'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE',
    'NEXT_PUBLIC_ANTHROPIC',
    'NEXT_PUBLIC_POLYGON_API',
    'NEXT_PUBLIC_NEWS_API'
)

foreach ($p in $dangerPatterns) {
    if ($c -match $p) {
        [PSCustomObject]@{
            continue   = $false
            stopReason = '차단: NEXT_PUBLIC_(' + $p + ')로 서버 전용 키를 노출하려 합니다. 이 값은 클라이언트 번들에 포함되어 누구나 볼 수 있습니다. 서버 전용 키는 NEXT_PUBLIC_ 없이 서버 컴포넌트/api 라우트에서만 사용하세요.'
        } | ConvertTo-Json -Compress
        break
    }
}
