# Sprint-01 Contract

**목표:** Supabase 기반 인증 + DB 스키마 + RLS + 공통 레이아웃 구축  
**기간:** Week 1–2  
**상태:** not_started

---

## 범위 (Scope)

### 포함
- Supabase 프로젝트 연결 및 환경 변수 설정
- DB 테이블 생성 (profiles, watchlist_items, global_issues, issue_analyses, institutional_ratings, alerts)
- 모든 테이블 RLS 활성화 및 정책 적용
- `src/lib/supabase/` 클라이언트 유틸 구현 (browser / server)
- `/login`, `/signup` 페이지 구현
- `(dashboard)/layout.tsx` 인증 가드 + 네비게이션 구현
- `(dashboard)/page.tsx` 기본 대시보드 (빈 상태 UI)
- `npm run verify` 스크립트 등록

### 제외 (다음 Sprint로 이월)
- 실제 주가 데이터 연동
- 뉴스/이슈 수집
- AI 분석
- 알림 기능

---

## 완료 기준 (Definition of Done)

- [ ] Supabase DB에 6개 테이블이 모두 생성되어 있다.
- [ ] 모든 테이블에 RLS가 활성화되어 있고, `docs/SECURITY.md` 정책과 일치한다.
- [ ] 이메일 회원가입 → 로그인 → 대시보드 진입 흐름이 정상 동작한다.
- [ ] 미인증 사용자가 `/` 접근 시 `/login`으로 리다이렉트된다.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 코드에 노출되지 않는다.
- [ ] `npm run verify` (tsc + eslint + build)가 통과한다.
- [ ] `state/progress.json`의 `sprint-01.status`가 `"completed"`로 업데이트된다.
- [ ] `docs/DECISIONS.md`에 Supabase 클라이언트 구조 결정 내용이 기록된다.

---

## 주요 파일

```
src/
├── lib/supabase/
│   ├── client.ts       # createBrowserClient
│   └── server.ts       # createServerClient
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx
│       └── page.tsx
supabase/
└── migrations/
    └── 001_initial_schema.sql
```

---

## 품질 체크리스트

- [ ] TypeScript 에러 0개
- [ ] ESLint 에러 0개
- [ ] `next build` 성공
- [ ] QUALITY_SCORE.md 기준 70점 이상
