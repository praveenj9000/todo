-- get_my_list_permission (and therefore every client-side read-only gate
-- built on it via useListPermission) still called the pre-group versions
-- of user_can_read_list/user_can_edit_list. 20260827120000 correctly
-- extended the *actual* RLS policies on lists/tasks (and move_task/
-- create_linked_task) to honor group shares, but did it by inlining the
-- access-check tree into each policy instead of updating the two
-- centralized helpers those policies used to share — so the helpers (and
-- get_my_list_permission) silently fell out of sync with what RLS
-- actually allows. A user with access only via a group share was let
-- through by RLS but told by the UI they had no access at all.
--
-- Restores one source of truth: user_can_read_list / user_can_edit_list
-- now include the group-aware logic, and every policy/RPC that had it
-- duplicated inline is pointed back at the helpers.

create or replace function public.user_can_read_list(p_list_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
    select exists (
        select 1 from public.lists l
        where l.id = p_list_id
          and (
              l.user_id = auth.uid()
              or l.public_read = true
              or l.public_edit = true
              or exists (
                  select 1 from public.list_shares s
                  where s.list_id = l.id
                    and s.subject_type = 'user'
                    and s.subject_id = auth.uid()
              )
              or exists (
                  select 1 from public.list_shares s
                  where s.list_id = l.id
                    and s.subject_type = 'group'
                    and public.is_group_member(s.subject_id)
              )
          )
    );
$$;

create or replace function public.user_can_edit_list(p_list_id uuid)
returns boolean
language sql security definer set search_path = public stable
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
              or exists (
                  select 1 from public.list_shares s
                  where s.list_id = l.id
                    and s.subject_type = 'group'
                    and s.permission = 'edit'
                    and public.is_group_member(s.subject_id)
              )
          )
    );
$$;

-- lists
drop policy if exists "Users can view lists they own or are shared on" on public.lists;
create policy "Users can view lists they own or are shared on"
on public.lists for select
using (public.user_can_read_list(id));

drop policy if exists "Users can update lists they own or have edit access to" on public.lists;
create policy "Users can update lists they own or have edit access to"
on public.lists for update
using (public.user_can_edit_list(id))
with check (public.user_can_edit_list(id));

-- tasks
drop policy if exists "Users can view tasks in lists they can access" on public.tasks;
create policy "Users can view tasks in lists they can access"
on public.tasks for select
using (public.user_can_read_list(list_id));

drop policy if exists "Users can insert tasks in lists they can edit" on public.tasks;
create policy "Users can insert tasks in lists they can edit"
on public.tasks for insert
with check (public.user_can_edit_list(list_id));

drop policy if exists "Users can update tasks in lists they can edit" on public.tasks;
create policy "Users can update tasks in lists they can edit"
on public.tasks for update
using (public.user_can_edit_list(list_id))
with check (public.user_can_edit_list(list_id));

drop policy if exists "Users can delete tasks in lists they can edit" on public.tasks;
create policy "Users can delete tasks in lists they can edit"
on public.tasks for delete
using (public.user_can_edit_list(list_id));

-- move_task / create_linked_task: back to the shared helper instead of
-- re-deriving the access tree inline.
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

-- is_group_member and is_member_of_group did the exact same membership
-- check. Nothing needs the duplicate now that the policies above stopped
-- referencing it directly.
drop function if exists public.is_member_of_group(uuid);