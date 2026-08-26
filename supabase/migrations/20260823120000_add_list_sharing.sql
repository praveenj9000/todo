-- List sharing: public read/edit via a single shareable link, plus
-- per-user (and future group) shares with read/edit permissions.
-- Groups are schema-supported now (subject_type = 'group') but have no
-- UI/logic yet — the design keeps group support as a future extension
-- with minimal migration overhead.

-- 1. Public access flags + share token on lists.
alter table public.lists
    add column share_token uuid not null default gen_random_uuid();

alter table public.lists
    add column public_read boolean not null default false;

alter table public.lists
    add column public_edit boolean not null default false;

create unique index lists_share_token_idx
    on public.lists(share_token);

-- 2. Per-user / per-group shares.
create table public.list_shares (
    id uuid primary key default gen_random_uuid(),

    list_id uuid not null
        references public.lists(id)
        on delete cascade,

    -- 'user' = a specific user; 'group' = a future group entity.
    -- Groups are schema-supported now but not yet exposed in UI/logic.
    subject_type text not null
        check (subject_type in ('user', 'group')),

    -- For subject_type = 'user': the auth.users id.
    -- For subject_type = 'group': a future groups.id (no FK yet).
    subject_id uuid not null,

    permission text not null
        check (permission in ('read', 'edit')),

    created_at timestamptz not null default timezone('utc', now()),

    constraint list_shares_unique_subject unique (list_id, subject_type, subject_id)
);

create index list_shares_list_id_idx
    on public.list_shares(list_id);

create index list_shares_subject_idx
    on public.list_shares(subject_type, subject_id);

alter table public.list_shares enable row level security;

-- Owner can view/manage shares on their own lists.
create policy "Owner can view shares on their lists"
on public.list_shares
for select
using (
    exists (
        select 1 from public.lists
        where id = list_id and user_id = auth.uid()
    )
);

create policy "Owner can insert shares on their lists"
on public.list_shares
for insert
with check (
    exists (
        select 1 from public.lists
        where id = list_id and user_id = auth.uid()
    )
);

create policy "Owner can update shares on their lists"
on public.list_shares
for update
using (
    exists (
        select 1 from public.lists
        where id = list_id and user_id = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.lists
        where id = list_id and user_id = auth.uid()
    )
);

create policy "Owner can delete shares on their lists"
on public.list_shares
for delete
using (
    exists (
        select 1 from public.lists
        where id = list_id and user_id = auth.uid()
    )
);

-- 3. RLS on lists: owner OR shared-with-me OR public (via share_token).

-- Read: owner, or shared with me (read or edit), or public_read.
drop policy "Users can view their own lists" on public.lists;
create policy "Users can view lists they own or are shared on"
on public.lists
for select
using (
    auth.uid() = user_id
    or exists (
        select 1 from public.list_shares
        where list_id = id
          and subject_type = 'user'
          and subject_id = auth.uid()
    )
    or public_read = true
);

-- Insert: only owner (unchanged).
drop policy "Users can insert their own lists" on public.lists;
create policy "Users can insert their own lists"
on public.lists
for insert
with check (auth.uid() = user_id);

-- Update: owner, or shared with edit permission, or public_edit.
drop policy "Users can update their own lists" on public.lists;
create policy "Users can update lists they own or have edit access to"
on public.lists
for update
using (
    auth.uid() = user_id
    or exists (
        select 1 from public.list_shares
        where list_id = id
          and subject_type = 'user'
          and subject_id = auth.uid()
          and permission = 'edit'
    )
    or public_edit = true
)
with check (
    auth.uid() = user_id
    or exists (
        select 1 from public.list_shares
        where list_id = id
          and subject_type = 'user'
          and subject_id = auth.uid()
          and permission = 'edit'
    )
    or public_edit = true
);

-- Delete: only owner (unchanged).
drop policy "Users can delete their own lists" on public.lists;
create policy "Users can delete their own lists"
on public.lists
for delete
using (auth.uid() = user_id);

-- 4. RLS on tasks: owner, or has access to the parent list, or public.

-- Read: owner, or has read/edit access to the list, or list is public_read.
drop policy "Users can view their own tasks" on public.tasks;
create policy "Users can view tasks in lists they can access"
on public.tasks
for select
using (
    auth.uid() = user_id
    or exists (
        select 1 from public.lists
        where id = list_id
          and (
              exists (
                  select 1 from public.list_shares
                  where list_id = lists.id
                    and subject_type = 'user'
                    and subject_id = auth.uid()
              )
              or public_read = true
          )
    )
);

-- Insert: owner, or has edit access to the list, or list is public_edit.
drop policy "Users can insert their own tasks" on public.tasks;
create policy "Users can insert tasks in lists they can edit"
on public.tasks
for insert
with check (
    auth.uid() = user_id
    or exists (
        select 1 from public.lists
        where id = list_id
          and (
              exists (
                  select 1 from public.list_shares
                  where list_id = lists.id
                    and subject_type = 'user'
                    and subject_id = auth.uid()
                    and permission = 'edit'
              )
              or public_edit = true
          )
    )
);

-- Update: owner, or has edit access to the list, or list is public_edit.
drop policy "Users can update their own tasks" on public.tasks;
create policy "Users can update tasks in lists they can edit"
on public.tasks
for update
using (
    auth.uid() = user_id
    or exists (
        select 1 from public.lists
        where id = list_id
          and (
              exists (
                  select 1 from public.list_shares
                  where list_id = lists.id
                    and subject_type = 'user'
                    and subject_id = auth.uid()
                    and permission = 'edit'
              )
              or public_edit = true
          )
    )
)
with check (
    auth.uid() = user_id
    or exists (
        select 1 from public.lists
        where id = list_id
          and (
              exists (
                  select 1 from public.list_shares
                  where list_id = lists.id
                    and subject_type = 'user'
                    and subject_id = auth.uid()
                    and permission = 'edit'
              )
              or public_edit = true
          )
    )
);

-- Delete: owner, or has edit access to the list, or list is public_edit.
drop policy "Users can delete their own tasks" on public.tasks;
create policy "Users can delete tasks in lists they can edit"
on public.tasks
for delete
using (
    auth.uid() = user_id
    or exists (
        select 1 from public.lists
        where id = list_id
          and (
              exists (
                  select 1 from public.list_shares
                  where list_id = lists.id
                    and subject_type = 'user'
                    and subject_id = auth.uid()
                    and permission = 'edit'
              )
              or public_edit = true
          )
    )
);

-- 5. move_task: allow moving tasks in lists the user can edit (not just own).
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
    can_edit boolean;
begin
    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;

    select list_id into task_list_id
    from public.tasks
    where id = p_task_id and user_id = current_user_id;

    if not found then
        -- Maybe the task belongs to a list the user can edit (shared/public).
        select t.list_id into task_list_id
        from public.tasks t
        join public.lists l on l.id = t.list_id
        where t.id = p_task_id
          and (
              l.user_id = current_user_id
              or exists (
                  select 1 from public.list_shares
                  where list_id = l.id
                    and subject_type = 'user'
                    and subject_id = current_user_id
                    and permission = 'edit'
              )
              or l.public_edit = true
          );

        if not found then
            raise exception 'Task not found';
        end if;
    end if;

    -- Determine if the current user can edit this task's list.
    select exists (
        select 1 from public.lists l
        where l.id = task_list_id
          and (
              l.user_id = current_user_id
              or exists (
                  select 1 from public.list_shares
                  where list_id = l.id
                    and subject_type = 'user'
                    and subject_id = current_user_id
                    and permission = 'edit'
              )
              or l.public_edit = true
          )
    ) into can_edit;

    if not can_edit then
        raise exception 'Task not found';
    end if;

    -- A queued offline move may reference a neighbor that no longer
    -- exists (deleted before reconnect), belongs to another user, or
    -- is in a different list. Treat that as "no neighbor on that side"
    -- instead of failing the whole sync.
    if p_prev_id is not null then
        select sort_order into prev_order
        from public.tasks
        where id = p_prev_id and list_id is not distinct from task_list_id;
    end if;

    if p_next_id is not null then
        select sort_order into next_order
        from public.tasks
        where id = p_next_id and list_id is not distinct from task_list_id;
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
    where id = p_task_id
    returning * into moved_task;

    return moved_task;
end;
$$;

-- 6. create_linked_task: allow creating linked tasks in lists the user can edit.
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

    select t.list_id into source_list_id
    from public.tasks t
    join public.lists l on l.id = t.list_id
    where t.id = p_source_task_id
      and (
          l.user_id = current_user_id
          or exists (
              select 1 from public.list_shares
              where list_id = l.id
                and subject_type = 'user'
                and subject_id = current_user_id
                and permission = 'edit'
          )
          or l.public_edit = true
      );

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

-- 7. Grant base table privileges to the API roles.
grant select, insert, update, delete on public.list_shares to anon, authenticated;