create table public.tasks (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    title text not null,

    completed boolean not null default false,

    sort_order integer not null default 0,

    completed_at timestamptz,

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())
);

create index tasks_user_id_idx
    on public.tasks(user_id);

create index tasks_user_id_sort_order_idx
    on public.tasks(user_id, sort_order);

create index tasks_user_id_completed_idx
    on public.tasks(user_id, completed);

alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
on public.tasks
for select
using (
    auth.uid() = user_id
);

create policy "Users can insert their own tasks"
on public.tasks
for insert
with check (
    auth.uid() = user_id
);

create policy "Users can update their own tasks"
on public.tasks
for update
using (
    auth.uid() = user_id
);

create policy "Users can delete their own tasks"
on public.tasks
for delete
using (
    auth.uid() = user_id
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create trigger tasks_set_updated_at
before update
on public.tasks
for each row
execute function public.set_updated_at();