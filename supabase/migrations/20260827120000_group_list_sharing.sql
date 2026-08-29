-- Group list sharing: make list_shares rows with subject_type = 'group' actually
-- grant access. Groups exist (public.groups / public.group_members) and the
-- list_shares schema already supports subject_type = 'group', but the lists /
-- tasks RLS policies and the move_task / create_linked_task RPCs only ever
-- checked subject_type = 'user', so a group share granted nobody anything.
--
-- Membership lookup:
--   * group_members reference auth.users directly (user_id), matching the
--     schema created by 20260827091000_create_groups.sql.
--   * The current user's id comes from their auth token (auth.uid()).
--   * Group members may reference the list owner themselves; being a group
--     member is not required to OWN the list, so this is purely additive.

-- 1. Helper to test whether the current user is a member of a group.
--    SECURITY DEFINER (owned by postgres) so it bypasses the group_members RLS
--    policy (which only lets the group OWNER view members). This follows the
--    same pattern as public.is_list_owner used to break the list_shares RLS
--    recursion: a lists/tasks policy may call this helper without re-entering
--    the group_members policies.
create or replace function public.is_member_of_group(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.group_members
        where group_id = p_group_id
          and user_id = auth.uid()
    );
$$;

grant execute on function public.is_member_of_group(uuid) to anon, authenticated;

-- 2. RLS on lists: also grant access when a group the user belongs to is
--    shared on the list.

-- Read: owner, or shared with me (user or group), or public_read.
drop policy if exists "Users can view lists they own or are shared on" on public.lists;
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
    or exists (
        select 1 from public.list_shares ls
        where ls.list_id = id
          and ls.subject_type = 'group'
          and public.is_member_of_group(ls.subject_id)
    )
    or public_read = true
);
-- Update: owner, or shared with edit permission (user or group), or public_edit.
drop policy if exists "Users can update lists they own or have edit access to" on public.lists;
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
    or exists (
        select 1 from public.list_shares ls
        where ls.list_id = id
          and ls.subject_type = 'group'
          and ls.permission = 'edit'
          and public.is_member_of_group(ls.subject_id)
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
    or exists (
        select 1 from public.list_shares ls
        where ls.list_id = id
          and ls.subject_type = 'group'
          and ls.permission = 'edit'
          and public.is_member_of_group(ls.subject_id)
    )
    or public_edit = true
);
-- 3. RLS on tasks: owner, or has access (via user or group share) to the
--    parent list, or public.

-- Read: owner, or has read/edit access to the list, or list is public_read.
drop policy if exists "Users can view tasks in lists they can access" on public.tasks;
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
              or exists (
                  select 1 from public.list_shares ls
                  where ls.list_id = lists.id
                    and ls.subject_type = 'group'
                    and public.is_member_of_group(ls.subject_id)
              )
              or public_read = true
          )
    )
);

-- Insert: owner, or has edit access to the list (user or group), or public_edit.
drop policy if exists "Users can insert tasks in lists they can edit" on public.tasks;
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
              or exists (
                  select 1 from public.list_shares ls
                  where ls.list_id = lists.id
                    and ls.subject_type = 'group'
                    and ls.permission = 'edit'
                    and public.is_member_of_group(ls.subject_id)
              )
              or public_edit = true
          )
    )
);
-- Update: owner, or has edit access to the list (user or group), or public_edit.
drop policy if exists "Users can update tasks in lists they can edit" on public.tasks;
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
              or exists (
                  select 1 from public.list_shares ls
                  where ls.list_id = lists.id
                    and ls.subject_type = 'group'
                    and ls.permission = 'edit'
                    and public.is_member_of_group(ls.subject_id)
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
              or exists (
                  select 1 from public.list_shares ls
                  where ls.list_id = lists.id
                    and ls.subject_type = 'group'
                    and ls.permission = 'edit'
                    and public.is_member_of_group(ls.subject_id)
              )
              or public_edit = true
          )
    )
);

-- Delete: owner, or has edit access to the list (user or group), or public_edit.
drop policy if exists "Users can delete tasks in lists they can edit" on public.tasks;
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
              or exists (
                  select 1 from public.list_shares ls
                  where ls.list_id = lists.id
                    and ls.subject_type = 'group'
                    and ls.permission = 'edit'
                    and public.is_member_of_group(ls.subject_id)
              )
              or public_edit = true
          )
    )
);

-- 4. move_task: allow moving tasks in lists the user can edit via a group share.
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
              or exists (
                  select 1 from public.list_shares ls
                  where ls.list_id = l.id
                    and ls.subject_type = 'group'
                    and ls.permission = 'edit'
                    and public.is_member_of_group(ls.subject_id)
              )
              or l.public_edit = true
          );

        if not found then
            raise exception 'Task not found';
        end if;
    end if;

    -- Double-check: the *owner* of the task may be someone else, so re-verify
    -- the user can edit the parent list (including via a group share).
    select true into can_edit
    from public.lists l
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
          or exists (
              select 1 from public.list_shares ls
              where ls.list_id = l.id
                and ls.subject_type = 'group'
                and ls.permission = 'edit'
                and public.is_member_of_group(ls.subject_id)
          )
          or l.public_edit = true
      );

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

-- 5. create_linked_task: allow creating linked tasks in lists the user can
--    edit via a group share.
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
          or exists (
              select 1 from public.list_shares ls
              where ls.list_id = l.id
                and ls.subject_type = 'group'
                and ls.permission = 'edit'
                and public.is_member_of_group(ls.subject_id)
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
