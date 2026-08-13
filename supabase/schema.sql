-- Come Home — schema DRAFT.
-- Your real column/RLS spec did not paste through ("[paste data model above]").
-- This is an inferred starting point for the 4 named tables; replace with your
-- actual model before running in the Supabase SQL editor.

-- profiles: one row per auth user
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- categories: groupings for meditations (public content)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- meditations: playable audio tracks (public content)
create table public.meditations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  title text not null,
  description text,
  audio_url text not null,
  duration_seconds int,
  cover_url text,
  created_at timestamptz not null default now()
);

-- progress: per-user playback progress
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meditation_id uuid not null references public.meditations (id) on delete cascade,
  position_seconds int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, meditation_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.meditations enable row level security;
alter table public.progress enable row level security;

-- profiles: owner-only
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

-- content: readable by anyone incl. anon/guest; no client writes (seed via service role)
create policy categories_read on public.categories for select using (true);
create policy meditations_read on public.meditations for select using (true);

-- progress: owner-only
create policy progress_select_own on public.progress for select using (auth.uid() = user_id);
create policy progress_insert_own on public.progress for insert with check (auth.uid() = user_id);
create policy progress_update_own on public.progress for update using (auth.uid() = user_id);
create policy progress_delete_own on public.progress for delete using (auth.uid() = user_id);
