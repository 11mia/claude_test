#!/bin/bash
# pre-commit-secrets-scan.sh
# 스테이징된 파일에서 시크릿 패턴을 스캔한다.
# git pre-commit hook 및 Claude PreToolUse Bash hook에서 공통으로 사용한다.

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  echo "git 저장소를 찾을 수 없습니다."
  exit 1
fi

STAGED=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null)
if [ -z "$STAGED" ]; then
  exit 0
fi

BLOCKED=0

while IFS= read -r file; do
  [ -z "$file" ] && continue

  # 스테이징된 콘텐츠를 읽는다 (워킹 카피가 아닌 index 기준)
  content=$(git show ":$file" 2>/dev/null) || continue

  # Guard 1: 하드코딩된 JWT/API 키 패턴 (lockfile 제외 — 무결성 해시 false positive 방지)
  if ! echo "$file" | grep -qE '(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$'; then
    if echo "$content" | grep -qE 'eyJ[A-Za-z0-9+/]{20,}|sk-ant-[A-Za-z0-9_-]{60,}|sbp_[a-zA-Z0-9]{40,}'; then
      echo "BLOCKED [하드코딩 키]: $file"
      BLOCKED=1
    fi
  fi

  # Guard 2: 서버 전용 키를 클라이언트 파일에서 참조
  if echo "$file" | grep -qE '^src/' && ! echo "$file" | grep -qE '/api/|server\.(ts|js)$'; then
    if echo "$content" | grep -qE 'process\.env\.(SUPABASE_SERVICE_ROLE_KEY|ANTHROPIC_API_KEY|POLYGON_API_KEY|NEWS_API_KEY)'; then
      echo "BLOCKED [클라이언트에 서버키]: $file"
      BLOCKED=1
    fi
  fi

done <<< "$STAGED"

if [ "$BLOCKED" -eq 1 ]; then
  echo ""
  echo "커밋이 차단됐습니다. 위 파일에서 시크릿을 제거 후 재시도하세요."
  exit 1
fi

exit 0
