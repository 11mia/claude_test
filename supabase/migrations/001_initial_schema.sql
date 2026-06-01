-- profiles
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz default now()
);

-- watchlist_items
create table if not exists watchlist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  ticker     text not null,
  company    text,
  added_at   timestamptz default now(),
  unique(user_id, ticker)
);

-- global_issues
create table if not exists global_issues (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  source_url   text,
  category     text,
  published_at timestamptz,
  created_at   timestamptz default now()
);

-- issue_analyses
create table if not exists issue_analyses (
  id           uuid primary key default gen_random_uuid(),
  issue_id     uuid not null references global_issues(id) on delete cascade,
  ticker       text not null,
  summary      text,
  impact_score integer,
  impact_label text,
  scenario     text,
  raw_response jsonb,
  created_at   timestamptz default now(),
  unique(issue_id, ticker)
);

-- institutional_ratings
create table if not exists institutional_ratings (
  id           uuid primary key default gen_random_uuid(),
  ticker       text not null,
  firm         text not null,
  rating       text not null,
  price_target numeric,
  rated_at     timestamptz,
  created_at   timestamptz default now()
);

-- alerts
create table if not exists alerts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  issue_id   uuid references global_issues(id),
  ticker     text,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table watchlist_items enable row level security;
alter table global_issues enable row level security;
alter table issue_analyses enable row level security;
alter table institutional_ratings enable row level security;
alter table alerts enable row level security;

-- profiles 정책
create policy "profiles: self read" on profiles for select using ((select auth.uid()) = id);
create policy "profiles: self update" on profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- watchlist_items 정책
create policy "watchlist: owner read"   on watchlist_items for select using ((select auth.uid()) = user_id);
create policy "watchlist: owner insert" on watchlist_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "watchlist: owner delete" on watchlist_items for delete using ((select auth.uid()) = user_id);

-- global_issues 정책
create policy "issues: authenticated read" on global_issues for select to authenticated using (true);

-- issue_analyses 정책
create policy "analyses: authenticated read" on issue_analyses for select to authenticated using (true);

-- institutional_ratings 정책
create policy "ratings: authenticated read" on institutional_ratings for select to authenticated using (true);

-- alerts 정책
create policy "alerts: owner read" on alerts for select using ((select auth.uid()) = user_id);
create policy "alerts: owner update" on alerts for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 신규 가입 시 profiles 자동 생성
create or replace function handle_new_user()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
