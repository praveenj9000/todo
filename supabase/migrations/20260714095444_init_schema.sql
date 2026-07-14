-- Enable UUID generation
create extension if not exists pgcrypto;

--------------------------------------------------------------------------------
-- PROFILES
--------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  display_name text,

  avatar_url text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- TASKS
--------------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  title text not null,

  description text,

  completed boolean not null default false,

  completed_at timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

--------------------------------------------------------------------------------
-- INDEXES
--------------------------------------------------------------------------------

create index idx_tasks_user
on public.tasks(user_id);

create index idx_tasks_user_completed
on public.tasks(user_id, completed);

create index idx_tasks_updated
on public.tasks(updated_at desc);

--------------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
--------------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin

  new.updated_at = timezone('utc', now());

  if new.completed = true
     and old.completed = false then
     new.completed_at = timezone('utc', now());
  end if;

  if new.completed = false then
     new.completed_at = null;
  end if;

  return new;

end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

create trigger tasks_updated_at
before update on public.tasks
for each row
execute function public.handle_updated_at();

--------------------------------------------------------------------------------
-- RLS
--------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

--------------------------------------------------------------------------------
-- PROFILE POLICIES
--------------------------------------------------------------------------------

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

--------------------------------------------------------------------------------
-- TASK POLICIES
--------------------------------------------------------------------------------

create policy "Users can view own tasks"
on public.tasks
for select
using (auth.uid() = user_id);

create policy "Users can insert own tasks"
on public.tasks
for insert
with check (auth.uid() = user_id);

create policy "Users can update own tasks"
on public.tasks
for update
using (auth.uid() = user_id);

create policy "Users can delete own tasks"
on public.tasks
for delete
using (auth.uid() = user_id);