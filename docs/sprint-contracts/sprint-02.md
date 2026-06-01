# Sprint-02 Contract

**목표:** Watchlist CRUD + 글로벌 이슈 피드 + 주가 데이터 연동  
**기간:** Week 3–4  
**상태:** not_started  
**선행 조건:** sprint-01 완료 (status: "completed")

---

## 범위 (Scope)

### 포함
- Watchlist 종목 검색 (Polygon.io 티커 검색 API)
- Watchlist 추가·삭제 (RLS 적용된 `watchlist_items` 테이블 사용)
- `watchlist/page.tsx` — 목록 + 추가 UI
- `watchlist/[ticker]/page.tsx` — 종목 상세 (시세 + 기본 정보)
- 글로벌 이슈 수집 Cron (`/api/issues/collect`) — NewsAPI 연동
- `issues/page.tsx` — 이슈 피드 (카테고리 필터 포함)
- `issues/[id]/page.tsx` — 이슈 상세 (연관 종목 목록, AI 분석은 Sprint-03)
- Polygon.io 주가 데이터 Route Handler (`/api/watchlist/quotes`)
- Vercel Cron Job 설정 (`vercel.json`)

### 제외
- AI 분석 (Claude API 연동)
- 알림 생성 및 Push
- 기관 평가 차트 시각화 (데이터 수집만 포함 가능)

---

## 완료 기준 (Definition of Done)

- [ ] Watchlist 종목 추가 후 목록에 즉시 반영된다.
- [ ] Watchlist 종목 삭제 후 목록에서 즉시 제거된다.
- [ ] 타 사용자의 Watchlist 데이터에 접근이 불가하다 (RLS 검증).
- [ ] 이슈 피드에 최근 15분 이내 수집된 뉴스가 노출된다.
- [ ] Polygon.io 장애 시 "데이터 지연 중" UI가 표시된다.
- [ ] `/api/issues/collect`가 Vercel Cron에서 15분마다 실행된다.
- [ ] `npm run verify`가 통과한다.
- [ ] `state/progress.json`의 `sprint-02.status`가 `"completed"`로 업데이트된다.

---

## 주요 파일

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── watchlist/
│   │   │   ├── page.tsx
│   │   │   └── [ticker]/page.tsx
│   │   └── issues/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── api/
│       ├── watchlist/route.ts
│       ├── watchlist/quotes/route.ts
│       └── issues/
│           ├── route.ts
│           └── collect/route.ts
├── features/goals/              # Watchlist 관련 컴포넌트
vercel.json                      # Cron Job 설정
```

---

## 품질 체크리스트

- [ ] TypeScript 에러 0개
- [ ] ESLint 에러 0개
- [ ] `next build` 성공
- [ ] QUALITY_SCORE.md 기준 70점 이상
- [ ] `docs/DECISIONS.md`에 Polygon.io / NewsAPI 연동 결정 내용 기록
