# PRODUCT_SPEC.md

## 서비스 개요

**서비스명:** StockRadar  
**목표:** 글로벌 이슈(정치·경제·지정학)를 실시간 모니터링하여 미국 주식 관심 종목에 대한 AI 기반 영향 분석과 개인화 알림을 제공한다.

---

## 핵심 기능

### 기능 1 — 글로벌 이슈 트래킹 및 미국 증시 전이 분석
- 전 세계 뉴스 소스에서 정치·경제·지정학적 이슈를 수집한다.
- 수집된 이슈가 미국 증시 전체(S&P 500, NASDAQ) 및 개별 종목에 미치는 인과관계를 AI로 분석한다.

### 기능 2 — 개인 맞춤형 Watchlist 관리
- 사용자가 관심 있는 미국 주식 티커를 검색·등록·삭제한다.
- 등록 종목은 대시보드에서 실시간 시세 및 AI 분석 결과와 함께 표시된다.

### 기능 3 — AI 기반 이슈 요약 및 예측 알림
- 관심 종목과 연관된 이슈 발생 시 Claude API를 통해 다음을 생성한다:
  - 핵심 3줄 요약
  - 주가 영향 예측 (호재/악재 점수 -100 ~ +100, 시나리오 서술)
  - 주요 글로벌 투자 기관의 최근 평가(매수/매도/중립) 트렌드 요약 및 시각화

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers |
| DB / Auth | Supabase (PostgreSQL + Auth + RLS) |
| AI | Claude API (claude-sonnet-4-6) |
| 주가 데이터 | Polygon.io REST API |
| 뉴스/이슈 | NewsAPI.org |
| 배포 | Vercel |
| 알림 | Supabase Realtime + Web Push |

---

## 페이지 구조 (App Router)

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── layout.tsx                  # 인증 가드 + 공통 네비게이션
│   ├── page.tsx                    # 대시보드 홈
│   ├── watchlist/
│   │   ├── page.tsx                # Watchlist 목록 + 종목 추가
│   │   └── [ticker]/page.tsx       # 종목 상세
│   ├── issues/
│   │   ├── page.tsx                # 글로벌 이슈 피드
│   │   └── [id]/page.tsx           # 이슈 상세 + 연관 종목 영향 분석
│   └── alerts/
│       └── page.tsx                # 알림 센터
└── api/
    ├── watchlist/route.ts
    ├── issues/route.ts
    ├── analyze/route.ts
    ├── alerts/route.ts
    └── ratings/route.ts
```

---

## 데이터 모델 (Supabase)

### profiles
```sql
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz default now()
);
```

### watchlist_items
```sql
create table watchlist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  ticker     text not null,
  company    text,
  added_at   timestamptz default now(),
  unique(user_id, ticker)
);
```

### global_issues
```sql
create table global_issues (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  source_url   text,
  category     text,   -- 'geopolitical' | 'macro' | 'supply_chain' | 'political'
  published_at timestamptz,
  created_at   timestamptz default now()
);
```

### issue_analyses
```sql
create table issue_analyses (
  id           uuid primary key default gen_random_uuid(),
  issue_id     uuid not null references global_issues(id) on delete cascade,
  ticker       text not null,
  summary      text,         -- AI 3줄 요약
  impact_score integer,      -- -100 ~ +100
  impact_label text,         -- '강한 호재' | '호재' | '중립' | '악재' | '강한 악재'
  scenario     text,
  raw_response jsonb,
  created_at   timestamptz default now()
);
```

### institutional_ratings
```sql
create table institutional_ratings (
  id           uuid primary key default gen_random_uuid(),
  ticker       text not null,
  firm         text not null,
  rating       text not null,  -- 'buy' | 'sell' | 'hold'
  price_target numeric,
  rated_at     timestamptz,
  created_at   timestamptz default now()
);
```

### alerts
```sql
create table alerts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  issue_id   uuid references global_issues(id),
  ticker     text,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);
```

---

## 사용자 스토리

| ID | 스토리 | 완료 기준 |
|----|--------|----------|
| US-01 | 이메일로 회원가입·로그인할 수 있다 | Supabase Auth 세션 유지 |
| US-02 | 관심 종목(티커)을 검색해 Watchlist에 추가·삭제할 수 있다 | RLS로 본인 데이터만 접근 |
| US-03 | 대시보드에서 Watchlist 종목의 실시간 시세를 볼 수 있다 | Polygon.io 데이터 표시 |
| US-04 | 글로벌 이슈 피드를 볼 수 있다 | NewsAPI 데이터 표시 |
| US-05 | 관심 종목 관련 이슈 발생 시 AI 분석 결과를 알림으로 받는다 | 알림 센터 + 브라우저 Push |
| US-06 | 이슈 상세 페이지에서 AI 요약·영향 점수·시나리오를 확인한다 | Claude API 결과 렌더링 |
| US-07 | 종목 상세 페이지에서 기관 평가 트렌드를 차트로 본다 | 기관 평가 시각화 |

---

## 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # 서버 전용, 클라이언트 노출 금지

# External APIs (모두 서버 전용)
ANTHROPIC_API_KEY=
POLYGON_API_KEY=
NEWS_API_KEY=
```
