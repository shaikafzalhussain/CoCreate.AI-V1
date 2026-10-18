-- Keep profile/identity data in Supabase. Never store authentication PINs here or in Sheets.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

grant select on public.profiles to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, created_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.created_at, now())
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name;
  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- Backfill accounts that already exist before this migration is applied.
insert into public.profiles (id, email, full_name, created_at)
select
  id,
  coalesce(email, ''),
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  coalesce(created_at, now())
from auth.users
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name;
