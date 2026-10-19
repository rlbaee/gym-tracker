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

create table if not exists public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  muscle text not null default 'Other',
  equipment text not null default 'Other',
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_date_idx on public.workouts (user_id, workout_date desc);
create index if not exists routines_user_created_idx on public.routines (user_id, created_at desc);
create index if not exists custom_exercises_user_created_idx on public.custom_exercises (user_id, created_at asc);

alter table public.workouts enable row level security;
alter table public.routines enable row level security;
alter table public.custom_exercises enable row level security;

drop policy if exists "Users manage their workouts" on public.workouts;
drop policy if exists "Users manage their routines" on public.routines;
drop policy if exists "Users manage their custom exercises" on public.custom_exercises;
create policy "Users manage their workouts" on public.workouts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users manage their routines" on public.routines
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users manage their custom exercises" on public.custom_exercises
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "Users upload their avatar" on storage.objects;
drop policy if exists "Anyone can view avatars" on storage.objects;
drop policy if exists "Users update their avatar" on storage.objects;
drop policy if exists "Users delete their avatar" on storage.objects;
create policy "Anyone can view avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Users upload their avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users update their avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete their avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
