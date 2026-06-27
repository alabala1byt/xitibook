-- 习题本 (xiti-book) — private per-user schema
-- Run once in the Supabase SQL Editor (or via Supabase MCP/CLI).
--
-- Every row is owned by its creator (user_id defaults to auth.uid()).
-- RLS enforces that a user can only ever read/write their OWN rows, so
-- account A cannot see account B's data.

create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chapter_id uuid not null references chapters(id) on delete cascade,
  question text not null,
  options text[] not null,
  answer int not null,
  explanation text,
  created_at timestamptz not null default now()
);

create table if not exists wrong_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  selected_index int not null,
  created_at timestamptz not null default now()
);

create table if not exists quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_questions int not null default 0,
  correct_count int not null default 0,
  accuracy numeric(5,2)
);

-- One wrong-answer record per (user, question) so re-anserving a question wrong
-- updates the stored answer instead of duplicating it.
create unique index if not exists wrong_answers_user_question_uidx
  on wrong_answers (user_id, question_id);

-- Enable Row Level Security on every table.
alter table chapters      enable row level security;
alter table questions     enable row level security;
alter table wrong_answers enable row level security;
alter table quiz_sessions enable row level security;

-- Owner-only CRUD. `(select auth.uid())` per the Supabase security checklist.
-- `for all` covers SELECT / INSERT / UPDATE / DELETE; WITH CHECK prevents
-- reassigning a row's user_id to another account.
create policy "own chapters"       on chapters      for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own questions"      on questions     for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own wrong_answers"  on wrong_answers for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own quiz_sessions"  on quiz_sessions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- As of the 2026-04-28 breaking change, new public-schema tables are NOT
-- exposed to the Data API automatically. Grant access to the authenticated
-- role so the browser client can reach these tables (RLS still gates rows).
grant all on chapters      to authenticated;
grant all on questions     to authenticated;
grant all on wrong_answers to authenticated;
grant all on quiz_sessions to authenticated;
