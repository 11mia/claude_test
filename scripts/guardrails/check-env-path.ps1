# Guardrail: .env 파일 직접 수정 차단
# 트리거: PreToolUse Write|Edit
# 목적: .env* 파일에 직접 쓰는 행위를 차단한다.
#        환경변수는 Vercel 대시보드 또는 로컬 .env.local에서 관리한다.

$j = $input | ConvertFrom-Json
$f = $j.tool_input.file_path

if ($f -match '\.env') {
    [PSCustomObject]@{
        continue   = $false
        stopReason = '.env 파일 직접 수정 차단. 환경변수는 Vercel 대시보드 또는 로컬 .env.local에서 직접 관리하세요. SUPABASE_SERVICE_ROLE_KEY 등 서버 전용 키가 git에 노출되지 않도록 주의하세요.'
    } | ConvertTo-Json -Compress
}
