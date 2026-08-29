-- Fixes for the sharing/permission system:
-- 1. public_edit must imply readability everywhere.
-- 2. tasks.user_id must be nullable so unauthenticated users can create
--    tasks on public-edit lists.
-- 3. Centralize access checks into two SECURITY DEFINER helpers so every
--    policy/RPC agrees on what "can read" / "can edit" means, instead of
--    five near-duplicated `exists (...)` blocks that can drift apart
--    (which is exactly how #1 above happened).
-- 4. RPC to resolve an invite email to a user id (auth.users isn't
--    directly queryable by clients).
-- 5. RPC so a client can ask "what's my permission on this list" without
--    needing a SELECT policy on list_shares for non-owners.

alter table public.tasks alter column user_id drop not null;

create or replace function public.user_can_read_list(p_list_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1 from public.lists l
        where l.id = p_list_id
          and (
              l.user_id = auth.uid()
              or l.public_read = true
              or l.public_edit = true -- edit implies read
              or exists (
                  select 1 from public.list_shares s
                  where s.list_id = l.id
                    and s.subject_type = 'user'
                    and s.subject_id = auth.uid()
              )
          )
    );
$$;

create or replace function public.user_can_edit_list(p_list_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1 from public.lists l
        where l.id = p_list_id
          and (
              l.user_id = auth.uid()
              or l.public_edit = true
              or exists (
                  select 1 from public.list_shares s
                  where s.list_id = l.id
                    and s.subject_type = 'user'
                    and s.subject_id = auth.uid()
                    and s.permission = 'edit'
              )
          )
    );
$$;

grant execute on function public.user_can_read_list(uuid) to anon, authenticated;
grant execute on function public.user_can_edit_list(uuid) to anon, authenticated;

-- lists
drop policy "Users can view lists they own or are shared on" on public.lists;
create policy "Users can view lists they own or are shared on"
on public.lists for select
using (public.user_can_read_list(id));

drop policy "Users can update lists they own or have edit access to" on public.lists;
create policy "Users can update lists they own or have edit access to"
on public.lists for update
using (public.user_can_edit_list(id))
with check (public.user_can_edit_list(id));

-- tasks
drop policy "Users can view tasks in lists they can access" on public.tasks;
create policy "Users can view tasks in lists they can access"
on public.tasks for select
using (public.user_can_read_list(list_id));

drop policy "Users can insert tasks in lists they can edit" on public.tasks;
create policy "Users can insert tasks in lists they can edit"
on public.tasks for insert
with check (public.user_can_edit_list(list_id));

drop policy "Users can update tasks in lists they can edit" on public.tasks;
create policy "Users can update tasks in lists they can edit"
on public.tasks for update
using (public.user_can_edit_list(list_id))
with check (public.user_can_edit_list(list_id));

drop policy "Users can delete tasks in lists they can edit" on public.tasks;
create policy "Users can delete tasks in lists they can edit"
on public.tasks for delete
using (public.user_can_edit_list(list_id));

-- Simplify move_task / create_linked_task to reuse the same helper instead
-- of their own inline copies of the access-check logic.
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
    prev_order double precision;
    next_order double precision;
    new_order double precision;
    moved_task public.tasks;
    task_list_id uuid;
begin
    select list_id into task_list_id from public.tasks where id = p_task_id;

    if not found or not public.user_can_edit_list(task_list_id) then
        raise exception 'Task not found';
    end if;

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
    select list_id into source_list_id from public.tasks where id = p_source_task_id;

    if not found or not public.user_can_edit_list(source_list_id) then
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

-- Resolve an invite email to a user id. Restricted to authenticated users
-- so anon can't use this to enumerate registered emails.
create or replace function public.find_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
    select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function public.find_user_id_by_email(text) from public;
grant execute on function public.find_user_id_by_email(text) to authenticated;

-- Lets a client (owner, shared user, or anon) ask what access it has,
-- without needing a SELECT policy on list_shares for non-owners.
create or replace function public.get_my_list_permission(p_list_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
    select case
        when exists (select 1 from public.lists where id = p_list_id and user_id = auth.uid())
            then 'owner'
        when public.user_can_edit_list(p_list_id) then 'edit'
        when public.user_can_read_list(p_list_id) then 'read'
        else null
    end;
$$;

grant execute on function public.get_my_list_permission(uuid) to anon, authenticated;