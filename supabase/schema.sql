create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Workout',
  workout_date date not null default current_date,
  volume numeric not null default 0,
  logged_exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  exercise_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_date_idx on public.workouts (user_id, workout_date desc);
create index if not exists routines_user_created_idx on public.routines (user_id, created_at desc);

alter table public.workouts enable row level security;
alter table public.routines enable row level security;

drop policy if exists "Users manage their workouts" on public.workouts;
drop policy if exists "Users manage their routines" on public.routines;
create policy "Users manage their workouts" on public.workouts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users manage their routines" on public.routines
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
