#!/bin/bash
# install-hooks.sh
# 저장소 clone 후 git pre-commit hook을 설치한다.

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_PATH="$REPO_ROOT/.git/hooks/pre-commit"

cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
bash "$REPO_ROOT/scripts/guardrails/pre-commit-secrets-scan.sh"
EOF

chmod +x "$HOOK_PATH"
echo "pre-commit hook 설치 완료: $HOOK_PATH"
