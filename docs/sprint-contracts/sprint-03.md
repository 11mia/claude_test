# Sprint-03 Contract

**목표:** Claude AI 분석 + 알림 시스템 + 기관 평가 시각화  
**기간:** Week 5–6  
**상태:** not_started  
**선행 조건:** sprint-02 완료 (status: "completed")

---

## 범위 (Scope)

### 포함
- Claude API 연동 Route Handler (`/api/analyze`)
  - 이슈별·종목별 3줄 요약 생성
  - 영향 점수 (-100 ~ +100) 및 호재/악재 라벨 산출
  - 시나리오 서술 생성
- `issue_analyses` 테이블 저장 및 중복 방지
- `issues/[id]/page.tsx` — AI 분석 결과 렌더링 (요약 + 점수 + 시나리오)
- 알림 생성 로직: 관심 종목 관련 이슈 발생 시 `alerts` 테이블에 레코드 삽입
- `alerts/page.tsx` — 알림 센터 (읽음 처리 포함)
- Supabase Realtime으로 알림 실시간 수신
- 기관 평가 수집 Cron (`/api/ratings/collect`) — 1일 1회
- `watchlist/[ticker]/page.tsx` — 기관 평가 트렌드 차트 (매수/매도/중립 비율)
- 전체 UI 품질 점검 및 반응형 레이아웃 마무리

### 제외
- 모바일 앱
- 유료 플랜 / 결제
- 소셜 로그인

---

## 완료 기준 (Definition of Done)

- [ ] 이슈 상세 페이지에서 AI 요약·영향 점수·시나리오가 렌더링된다.
- [ ] 동일 `(issue_id, ticker)` 조합의 AI 분석이 중복 생성되지 않는다.
- [ ] 관심 종목 관련 신규 이슈 발생 시 알림 센터에 알림이 생성된다.
- [ ] Supabase Realtime으로 알림이 즉시 반영된다.
- [ ] 알림 읽음 처리가 정상 동작한다.
- [ ] 종목 상세 페이지에서 기관 평가 차트(매수/매도/중립)가 표시된다.
- [ ] `ANTHROPIC_API_KEY`가 클라이언트 코드에 노출되지 않는다.
- [ ] Claude API 장애 시 "AI 분석을 일시적으로 사용할 수 없습니다" 메시지가 표시된다.
- [ ] `npm run verify`가 통과한다.
- [ ] `state/progress.json`의 `sprint-03.status`가 `"completed"`로 업데이트된다.
- [ ] `eval/final-report.md`에 최종 품질 점수 및 회고가 기록된다.

---

## 주요 파일

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── alerts/page.tsx
│   │   ├── issues/[id]/page.tsx     # AI 분석 결과 포함
│   │   └── watchlist/[ticker]/page.tsx  # 기관 평가 차트 포함
│   └── api/
│       ├── analyze/route.ts
│       ├── alerts/route.ts
│       └── ratings/
│           ├── route.ts
│           └── collect/route.ts
eval/
└── final-report.md
```

---

## 품질 체크리스트

- [ ] TypeScript 에러 0개
- [ ] ESLint 에러 0개
- [ ] `next build` 성공
- [ ] QUALITY_SCORE.md 기준 70점 이상
- [ ] `docs/SECURITY.md`에 Claude API 서버 전용 사용 확인 기록
- [ ] `docs/DECISIONS.md`에 AI 프롬프트 설계 결정 내용 기록
- [ ] `eval/final-report.md` 작성 완료
