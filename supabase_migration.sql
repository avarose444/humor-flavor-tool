-- ============================================================
-- Run this in your Supabase SQL Editor (once)
-- Creates humor_flavors and humor_flavor_steps tables
-- ============================================================

create table if not exists public.humor_flavors (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  created_by  uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.humor_flavor_steps (
  id          uuid        primary key default gen_random_uuid(),
  flavor_id   uuid        not null references public.humor_flavors(id) on delete cascade,
  step_order  integer     not null default 1,
  prompt      text        not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Row-level security
alter table public.humor_flavors      enable row level security;
alter table public.humor_flavor_steps enable row level security;

-- Only superadmins / matrix admins may read or write
create policy "admin_all_flavors" on public.humor_flavors
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and (is_superadmin = true or is_matrix_admin = true)
    )
  );

create policy "admin_all_steps" on public.humor_flavor_steps
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and (is_superadmin = true or is_matrix_admin = true)
    )
  );

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_flavor_updated_at
  before update on public.humor_flavors
  for each row execute procedure public.set_updated_at();

create trigger trg_step_updated_at
  before update on public.humor_flavor_steps
  for each row execute procedure public.set_updated_at();
