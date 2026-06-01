# QUALITY_SCORE.md

## 품질 기준

각 sprint 완료 시 아래 항목을 모두 통과해야 한다.

---

## 자동 검증 (npm run verify)

| 항목 | 명령 | 기준 |
|------|------|------|
| TypeScript 타입 검사 | `tsc --noEmit` | 에러 0개 |
| Lint | `eslint src/` | 에러 0개 |
| 빌드 | `next build` | 성공 |

`package.json`에 등록:
```json
"scripts": {
  "verify": "tsc --noEmit && eslint src/ && next build"
}
```

---

## 보안 품질

| 항목 | 기준 |
|------|------|
| RLS 활성화 | 모든 public 테이블에 적용 |
| service_role key 노출 | 클라이언트 코드 내 0건 |
| `.env` git 커밋 | 0건 |
| `NEXT_PUBLIC_` 서버 전용 키 | 0건 |

---

## 기능 품질

| Sprint | 항목 | 기준 |
|--------|------|------|
| Sprint-01 | 회원가입 → 로그인 → 대시보드 진입 | 정상 동작 |
| Sprint-01 | 미인증 사용자 /login 리다이렉트 | 정상 동작 |
| Sprint-02 | Watchlist 추가/삭제 후 즉시 UI 반영 | 정상 동작 |
| Sprint-02 | 이슈 피드 15분 이내 데이터 | 정상 동작 |
| Sprint-03 | AI 분석 결과 렌더링 (요약 + 점수 + 시나리오) | 정상 동작 |
| Sprint-03 | 알림 생성 및 읽음 처리 | 정상 동작 |

---

## 성능 기준

| 항목 | 기준 |
|------|------|
| 대시보드 초기 로드 (LCP) | 3초 이하 |
| API Route 응답 시간 | 1초 이하 (AI 분석 제외) |
| AI 분석 응답 시간 | 30초 이하 |

---

## 점수 산정 (각 Sprint 완료 시 평가)

| 항목 | 배점 |
|------|------|
| npm run verify 통과 | 30점 |
| 보안 품질 전항목 통과 | 30점 |
| 해당 Sprint 기능 품질 통과 | 30점 |
| 문서 최신화 (DECISIONS.md, progress.json) | 10점 |
| **합계** | **100점** |

**70점 미만 시 해당 Sprint를 완료로 인정하지 않는다.**
