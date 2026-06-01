# SECURITY.md

## 인증 (Authentication)

Supabase Auth를 사용하며 이메일/패스워드 방식으로 로그인한다.  
세션은 서버 컴포넌트에서 `@supabase/ssr`의 `createServerClient`로만 읽는다.

```
클라이언트: createBrowserClient (anon key 사용)
서버 컴포넌트 / Route Handler: createServerClient (anon key 사용)
관리자 작업(트리거 등): createClient with service_role key — 서버 전용
```

---

## Row Level Security (RLS)

모든 public 테이블에 RLS를 활성화한다. 정책은 아래와 같다.

### profiles
```sql
alter table profiles enable row level security;

-- 본인 프로필만 조회/수정
create policy "profiles: self read"   on profiles for select using ((select auth.uid()) = id);
create policy "profiles: self update" on profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
```

### watchlist_items
```sql
alter table watchlist_items enable row level security;

create policy "watchlist: owner read"   on watchlist_items for select using ((select auth.uid()) = user_id);
create policy "watchlist: owner insert" on watchlist_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "watchlist: owner delete" on watchlist_items for delete using ((select auth.uid()) = user_id);
```

### global_issues
```sql
alter table global_issues enable row level security;

-- 로그인 사용자 전체 읽기 허용, 쓰기는 service_role만
create policy "issues: authenticated read" on global_issues for select to authenticated using (true);
```

### issue_analyses
```sql
alter table issue_analyses enable row level security;

create policy "analyses: authenticated read" on issue_analyses for select to authenticated using (true);
```

### institutional_ratings
```sql
alter table institutional_ratings enable row level security;

create policy "ratings: authenticated read" on institutional_ratings for select to authenticated using (true);
```

### alerts
```sql
alter table alerts enable row level security;

create policy "alerts: owner read"   on alerts for select using ((select auth.uid()) = user_id);
create policy "alerts: owner update" on alerts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

---

## API Key 관리 원칙

| 키 | 노출 허용 범위 |
|----|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 허용 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 허용 (RLS로 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** — 절대 `NEXT_PUBLIC_` 금지 |
| `ANTHROPIC_API_KEY` | **서버 전용** |
| `POLYGON_API_KEY` | **서버 전용** |
| `NEWS_API_KEY` | **서버 전용** |

---

## 금지 사항

- `SUPABASE_SERVICE_ROLE_KEY`를 클라이언트 컴포넌트나 `NEXT_PUBLIC_` 변수로 노출하지 마라.
- `auth.role()` deprecated 함수를 RLS 정책에 사용하지 마라. `TO authenticated` 절을 사용하라.
- `SECURITY DEFINER` 함수를 public 스키마에 추가하지 마라.
- 뷰(View)를 public 스키마에 생성할 경우 `security_invoker = true`를 명시하라.
- `.env*` 파일을 git에 커밋하지 마라.

---

## 인증 플로우

```
1. 사용자가 /login 또는 /signup 접근
2. Supabase Auth로 세션 생성
3. 세션 쿠키를 서버 컴포넌트에서 검증
4. (dashboard) layout.tsx에서 미인증 사용자를 /login으로 리다이렉트
5. Route Handler는 createServerClient로 세션을 검증한 후 DB에 접근
```
