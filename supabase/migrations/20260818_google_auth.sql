-- Come Home — Google OAuth backend (applied to project ydyklmqkddcxrcdzvjrs).
-- Extends the existing public.profiles with the fields Google returns + an
-- onboarding flag, adds the auto-insert trigger that creates a profile row on every
-- new signup, and hardens the trigger-only functions. Idempotent.

-- 1. Account fields ---------------------------------------------------------------
alter table public.profiles
  add column if not exists email      text,
  add column if not exists avatar_url text,
  add column if not exists onboarded  boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- 2. Auto-create a profile on signup ----------------------------------------------
-- SECURITY DEFINER so the insert runs as the function owner, past RLS. Google puts
-- name/picture/email in raw_user_meta_data; coalesce the common keys.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    new.email
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Keep updated_at fresh ---------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 4. Harden: these are trigger-only — don't expose them as PostgREST RPC -----------
revoke execute on function public.handle_new_user()  from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Existing RLS on public.profiles (own sel/ins/upd via auth.uid() = user_id) is
-- already in place from the initial schema and is left unchanged.
