# DECISIONS.md

## Sprint-01

### Supabase 클라이언트 구조

**결정:** browser/server 클라이언트 분리  
**파일:**
- `src/lib/supabase/client.ts` — `createBrowserClient` (클라이언트 컴포넌트용)
- `src/lib/supabase/server.ts` — `createServerClient` + cookie 처리 (서버 컴포넌트 / Route Handler용)

**이유:** `@supabase/ssr` 패키지의 권장 패턴. 서버 컴포넌트에서 세션을 안전하게 읽고 쿠키를 통해 세션을 갱신하기 위함. 서버에서 anon key를 사용하며, service_role key는 Route Handler(`src/app/api/`)에서만 사용한다.

### 인증 가드 방식

**결정:** proxy.ts(미들웨어) + 서버 컴포넌트 이중 가드  
**이유:** proxy.ts에서 세션 쿠키를 갱신하고 미인증 사용자를 `/login`으로 리다이렉트. `(dashboard)/layout.tsx`에서도 2차 가드를 두어 방어 심층화. Next.js 16에서 `middleware.ts` → `proxy.ts`로 명칭 변경됨.

### 대시보드 홈 라우팅

**결정:** `src/app/page.tsx`가 대시보드 홈 역할  
**이유:** `(dashboard)` 라우트 그룹과 `src/app/page.tsx`가 모두 `/`에 매핑되어 충돌 발생. `src/app/page.tsx`를 직접 대시보드 홈으로 사용하고, `(dashboard)/layout.tsx`는 `/watchlist`, `/issues`, `/alerts` 등 하위 페이지에 적용.

### DB 트리거

**결정:** `handle_new_user` 트리거로 `auth.users` → `profiles` 자동 동기화  
**이유:** 회원가입 시 `profiles` 테이블에 수동 INSERT가 필요 없도록 자동화. `security invoker` + `set search_path = ''`로 보안 강화.
