# RELIABILITY.md

## 외부 API 의존성 및 장애 대응

### Polygon.io (주가 데이터)
- **장애 시:** 마지막으로 캐시된 시세 데이터를 표시하고 "데이터 지연 중" 배지를 노출한다.
- **Rate Limit:** Free tier 기준 분당 5 요청. Watchlist 종목은 순차 폴링(interval 기반)으로 처리한다.
- **타임아웃:** 5초 초과 시 fallback 처리.

### NewsAPI.org (뉴스/이슈)
- **장애 시:** 마지막 수집된 이슈 목록을 Supabase에서 조회해 표시한다.
- **수집 주기:** Vercel Cron Job으로 15분마다 실행.
- **타임아웃:** 8초 초과 시 수집 스킵, 다음 사이클에서 재시도.

### Claude API (AI 분석)
- **장애 시:** "AI 분석을 일시적으로 사용할 수 없습니다" 메시지를 표시한다. 기존 분석 결과는 DB에서 그대로 제공.
- **분석 중복 방지:** `issue_analyses` 테이블에 `(issue_id, ticker)` unique 제약을 걸어 동일 조합의 분석이 중복 생성되지 않도록 한다.
- **타임아웃:** 30초 초과 시 요청 취소.

---

## 데이터 신선도

| 데이터 | 갱신 주기 | 허용 지연 |
|--------|----------|----------|
| 주가 시세 | 사용자 요청 시 폴링 | 30초 |
| 글로벌 이슈 | 15분 Cron | 20분 |
| AI 분석 | 이슈 수집 후 즉시 | 5분 |
| 기관 평가 | 1일 1회 Cron | 24시간 |

---

## 에러 처리 원칙

- Route Handler는 항상 구조화된 JSON 에러를 반환한다.
  ```json
  { "error": "에러 메시지", "code": "ERROR_CODE" }
  ```
- 클라이언트 컴포넌트에서 fetch 실패 시 toast로 에러를 노출하고, 로딩 상태를 초기화한다.
- Supabase 쿼리 에러는 콘솔에 기록하되, 사용자에게는 일반 메시지("데이터를 불러오지 못했습니다")를 노출한다.

---

## Vercel Cron Jobs

```
# 이슈 수집
*/15 * * * *  POST /api/issues/collect

# 기관 평가 수집
0 2 * * *     POST /api/ratings/collect
```

---

## 모니터링

- Vercel Function 로그로 API 에러율 확인.
- Supabase 대시보드에서 DB 연결 수 및 쿼리 성능 확인.
- 알림 미전달 이슈는 `alerts` 테이블의 `is_read = false` 누적 건수로 추적.
