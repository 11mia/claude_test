# AGENTS.md

## 역할
당신은 Next.js + Supabase + Vercel 기반 실습 프로젝트를 함께 개발하는 AI 개발 에이전트다.
이 저장소가 유일한 진실의 출처(SSOT)다. 이전 대화 내용을 진실로 간주하지 마라.

## 작업 전에 반드시 먼저 읽을 것
1. ARCHITECTURE.md
2. docs/PRODUCT_SPEC.md
3. docs/SECURITY.md
4. docs/sprint-contracts/current.md 파일이 있으면 읽기
5. state/progress.json

## 코드를 변경하기 전에 확인할 것
- 지금 변경하려는 내용이 현재 sprint contract 범위에 포함되는지 확인한다.
- 아키텍처 결정이 바뀌면 docs/DECISIONS.md를 업데이트한다.
- 작업 상태가 바뀌면 state/progress.json을 업데이트한다.

## 작업을 끝내기 전에 반드시 실행할 것

npm run verify

다음 조건을 모두 만족해야 작업이 완료된 것으로 본다.
- 로컬에서 코드가 동작한다.
- Supabase RLS 관련 가정과 보안 규칙이 문서화되어 있다.
- 관련 문서가 최신 상태로 업데이트되어 있다.
- state/progress.json이 최신 상태로 업데이트되어 있다.
- npm run verify가 통과한다.

## 절대 하지 말 것
- Supabase service role key를 클라이언트 코드에 노출하지 마라.
- CI를 통과시키기 위해 lint, typecheck, test, build, guardrails를 비활성화하지 마라.
- 대화 내용을 진실의 출처로 간주하지 마라.
