-- Extend the two access helpers (used by every lists/tasks RLS policy and
-- by move_task/create_linked_task/get_my_list_permission) to also honor
-- group-based shares now that public.groups/group_members exist.

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
                  join public.group_members gm on gm.group_id = s.subject_id
                  where s.list_id = l.id
                    and s.subject_type = 'group'
                    and gm.user_id = auth.uid()
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
                  join public.group_members gm on gm.group_id = s.subject_id
                  where s.list_id = l.id
                    and s.subject_type = 'group'
                    and gm.user_id = auth.uid()
                    and s.permission = 'edit'
              )
          )
    );
$$;

-- Defense in depth: reject a list_share row pointing at a subject that
-- doesn't exist, instead of silently accepting a dangling id.
create or replace function public.validate_list_share_subject()
returns trigger
language plpgsql
as $$
begin
    if new.subject_type = 'group' and not exists (
        select 1 from public.groups where id = new.subject_id
    ) then
        raise exception 'Group % does not exist', new.subject_id;
    end if;

    if new.subject_type = 'user' and not exists (
        select 1 from auth.users where id = new.subject_id
    ) then
        raise exception 'User % does not exist', new.subject_id;
    end if;

    return new;
end;
$$;

drop trigger if exists list_shares_validate_subject on public.list_shares;
create trigger list_shares_validate_subject
before insert or update on public.list_shares
for each row execute function public.validate_list_share_subject();