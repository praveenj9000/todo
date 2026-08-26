-- Lists: user-owned groupings of tasks. Each list is either a todo list
-- or a checklist; tasks belong to exactly one list.

create table public.lists (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    name text not null,

    type text not null default 'todo'
        check (type in ('todo', 'checklist')),

    constraint lists_name_length check (
        char_length(name) between 1 and 200
    ),

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())
);

create index lists_user_id_idx
    on public.lists(user_id);

alter table public.lists enable row level security;

create policy "Users can view their own lists"
on public.lists
for select
using (auth.uid() = user_id);

create policy "Users can insert their own lists"
on public.lists
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own lists"
on public.lists
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own lists"
on public.lists
for delete
using (auth.uid() = user_id);

-- Every task belongs to exactly one list.
alter table public.tasks
    add column list_id uuid
        references public.lists(id)
        on delete cascade;

create index tasks_user_id_list_id_idx
    on public.tasks(user_id, list_id);

-- Backfill: give every existing user a default list, and assign their
-- existing tasks to it.
do $$
declare
    user_record record;
    default_list_id uuid;
begin
    for user_record in select distinct user_id from public.tasks loop
        insert into public.lists (user_id, name, type)
        values (user_record.user_id, 'My Tasks', 'todo')
        returning id into default_list_id;

        update public.tasks
        set list_id = default_list_id
        where user_id = user_record.user_id
          and list_id is null;
    end loop;

    -- Users with no tasks yet still get a default list.
    for user_record in
        select id from auth.users
        where id not in (select user_id from public.lists)
    loop
        insert into public.lists (user_id, name, type)
        values (user_record.id, 'My Tasks', 'todo');
    end loop;
end;
$$;

alter table public.tasks
    alter column list_id set not null;

-- New users get a default list automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.lists (user_id, name, type)
    values (new.id, 'My Tasks', 'todo');
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Tasks RLS: a task's list must belong to the same user.
drop policy "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
on public.tasks
for insert
with check (
    auth.uid() = user_id
    and exists (
        select 1 from public.lists
        where id = list_id and user_id = auth.uid()
    )
);

drop policy "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
on public.tasks
for update
using (auth.uid() = user_id)
with check (
    auth.uid() = user_id
    and exists (
        select 1 from public.lists
        where id = list_id and user_id = auth.uid()
    )
);

-- move_task: neighbors must be in the same list as the moved task.
create or replace function public.move_task(
    p_task_id uuid,
    p_prev_id uuid default null,
    p_next_id uuid default null
)
returns public.tasks
language plpgsql
security invoker
as $$
declare
    current_user_id uuid := auth.uid();
    prev_order double precision;
    next_order double precision;
    new_order double precision;
    moved_task public.tasks;
    task_list_id uuid;
begin
    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;

    select list_id into task_list_id
    from public.tasks
    where id = p_task_id and user_id = current_user_id;

    if not found then
        raise exception 'Task not found';
    end if;

    -- A queued offline move may reference a neighbor that no longer
    -- exists (deleted before reconnect), belongs to another user, or
    -- is in a different list. Treat that as "no neighbor on that side"
    -- instead of failing the whole sync.
    if p_prev_id is not null then
        select sort_order into prev_order
        from public.tasks
        where id = p_prev_id and user_id = current_user_id
          and list_id is not distinct from task_list_id;
    end if;

    if p_next_id is not null then
        select sort_order into next_order
        from public.tasks
        where id = p_next_id and user_id = current_user_id
          and list_id is not distinct from task_list_id;
    end if;

    if prev_order is null and next_order is null then
        new_order := 0;
    elsif prev_order is null then
        new_order := next_order - 1;
    elsif next_order is null then
        new_order := prev_order + 1;
    else
        new_order := (prev_order + next_order) / 2;
    end if;

    update public.tasks
    set sort_order = new_order
    where id = p_task_id and user_id = current_user_id
    returning * into moved_task;

    return moved_task;
end;
$$;

-- create_linked_task: the new task inherits the source task's list.
create or replace function public.create_linked_task(
    p_source_task_id uuid,
    p_title text
)
returns public.tasks
language plpgsql
security invoker
as $$
declare
    current_user_id uuid := auth.uid();
    new_task public.tasks;
    id_a uuid;
    id_b uuid;
    source_list_id uuid;
begin
    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;

    select list_id into source_list_id
    from public.tasks
    where id = p_source_task_id and user_id = current_user_id;

    if not found then
        raise exception 'Source task not found';
    end if;

    insert into public.tasks (title, user_id, list_id)
    values (p_title, current_user_id, source_list_id)
    returning * into new_task;

    if p_source_task_id < new_task.id then
        id_a := p_source_task_id;
        id_b := new_task.id;
    else
        id_a := new_task.id;
        id_b := p_source_task_id;
    end if;

    insert into public.task_links (user_id, task_id_a, task_id_b, created_from_task_id)
    values (current_user_id, id_a, id_b, p_source_task_id);

    return new_task;
end;
$$;

-- Grant base table privileges to the API roles.
grant select, insert, update, delete on public.lists to anon, authenticated;
