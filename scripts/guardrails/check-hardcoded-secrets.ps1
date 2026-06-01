# Guardrail: 하드코딩된 API 키/토큰 패턴 차단
# 트리거: PreToolUse Write|Edit
# 목적: JWT 토큰(eyJ...), Anthropic 키(sk-ant-...), Supabase 프로젝트 키(sbp_...)
#        등의 실제 키 값이 소스 코드에 하드코딩되는 것을 차단한다.

$j = $input | ConvertFrom-Json
$c = if ($j.tool_input.content) { $j.tool_input.content } `
     elseif ($j.tool_input.new_string) { $j.tool_input.new_string } `
     else { '' }

# eyJ: base64 인코딩된 JWT (Supabase, 기타 JWT 토큰)
# sk-ant-: Anthropic API 키 접두사
# sbp_: Supabase 프로젝트 키 접두사
$secretPattern = 'eyJ[A-Za-z0-9+/]{20,}|sk-ant-[A-Za-z0-9_-]{60,}|sbp_[a-zA-Z0-9]{40,}'

if ($c -match $secretPattern) {
    [PSCustomObject]@{
        continue   = $false
        stopReason = '하드코딩된 API 키/토큰 패턴이 감지됐습니다. 키 값을 코드에 직접 포함하지 마세요. .env.local 환경변수를 사용하고, process.env.KEY_NAME 으로 참조하세요.'
    } | ConvertTo-Json -Compress
}
