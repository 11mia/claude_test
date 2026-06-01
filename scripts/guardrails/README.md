# Security Guardrails

이 디렉토리는 API 키 노출을 방지하는 보안 가드레일 스크립트를 포함한다.

## 방어선 구조

```
사용자 직접 커밋  →  .git/hooks/pre-commit  →  pre-commit-secrets-scan.sh
Claude 커밋      →  .claude/settings.json (PreToolUse Bash)  →  pre-commit-secrets-scan.sh
Claude 파일 쓰기 →  .claude/settings.json (PreToolUse Write|Edit)  →  인라인 PowerShell 검사
```

## 스크립트 목록

| 파일 | 용도 |
|------|------|
| `pre-commit-secrets-scan.sh` | 스테이징된 파일의 시크릿 패턴 스캔 (git hook + Claude hook 공용) |
| `check-env-path.ps1` | `.env*` 파일 직접 쓰기 차단 로직 문서 |
| `check-next-public.ps1` | `NEXT_PUBLIC_` 서버키 노출 차단 로직 문서 |
| `check-hardcoded-secrets.ps1` | JWT/API 키 하드코딩 차단 로직 문서 |
| `check-server-key-in-client.ps1` | 서버 전용 키의 클라이언트 파일 참조 차단 로직 문서 |

## 저장소 clone 후 초기 설정

`.git/hooks/` 는 git에 추적되지 않으므로 clone 후 아래 명령어를 실행한다.

```bash
bash scripts/guardrails/install-hooks.sh
```

또는 수동으로:

```bash
cp scripts/guardrails/pre-commit-secrets-scan.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 감지 패턴

| 패턴 | 예시 | 차단 시점 |
|------|------|---------|
| JWT 토큰 | `eyJhbGci...` (20자 이상) | 파일 쓰기 / 커밋 |
| Anthropic API 키 | `sk-ant-...` (60자 이상) | 파일 쓰기 / 커밋 |
| Supabase 프로젝트 키 | `sbp_...` (40자 이상) | 파일 쓰기 / 커밋 |
| `NEXT_PUBLIC_` 서버키 | `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | 파일 쓰기 |
| 클라이언트에서 서버키 참조 | `process.env.SUPABASE_SERVICE_ROLE_KEY` in non-api/ | 파일 쓰기 / 커밋 |
| `.env*` 직접 수정 | `.env.local`, `.env.production` 등 | 파일 쓰기 |
