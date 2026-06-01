# Guardrail: 서버 전용 키를 클라이언트 파일에서 참조 차단
# 트리거: PreToolUse Write|Edit
# 목적: SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY 등 서버 전용 환경변수를
#        src/app/api/ 라우트 외부(클라이언트 컴포넌트 등)에서 참조하는 것을 차단한다.
#
# 허용:  src/app/api/**/*.ts  (Route Handler — 서버에서만 실행)
#        src/lib/supabase/server.ts
# 차단:  src/app/page.tsx, src/app/watchlist/page.tsx 등 클라이언트 경로

$j = $input | ConvertFrom-Json
$f = $j.tool_input.file_path
$c = if ($j.tool_input.content) { $j.tool_input.content } `
     elseif ($j.tool_input.new_string) { $j.tool_input.new_string } `
     else { '' }

$isClientPath = $f -match 'src[/\\]' -and $f -notmatch '[/\\]api[/\\]|server\.(ts|js)$'

if ($isClientPath) {
    $serverOnlyKeys = @(
        'SUPABASE_SERVICE_ROLE_KEY',
        'ANTHROPIC_API_KEY',
        'POLYGON_API_KEY',
        'NEWS_API_KEY'
    )

    foreach ($k in $serverOnlyKeys) {
        if ($c -match ('process\.env\.' + $k)) {
            [PSCustomObject]@{
                continue   = $false
                stopReason = '차단: 서버 전용 키(' + $k + ')가 클라이언트 파일에서 참조됩니다. src/app/api/ 라우트 또는 서버 전용 파일에서만 사용하세요.'
            } | ConvertTo-Json -Compress
            break
        }
    }
}
