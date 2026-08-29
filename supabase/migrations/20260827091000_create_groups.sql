-- Supersedes the email-based groups schema created by
-- 20260826120000_create_groups.sql (already applied to the remote projects):
-- membership now references auth.users directly (user_id) instead of storing
-- raw email addresses, matching the app's groups API
-- (add_group_member_by_email / get_group_members_with_email RPCs).
-- Drop the superseded tables (cascading their policies and indexes) before
-- recreating them with the new shape. Rows recorded against the old schema
-- are discarded on purpose — the old schema predated those RPCs, so the
-- groups feature was not functional against it.
drop table if exists public.group_members cascade;
drop table if exists public.groups cascade;

create table public.groups (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id) on delete cascade,
    name text not null check (char_length(name) between 1 and 100),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index groups_owner_id_idx on public.groups(owner_id);

create trigger groups_set_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

create table public.group_members (
    id uuid primary key default gen_random_uuid(),
    group_id uuid not null references public.groups(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    added_at timestamptz not null default timezone('utc', now()),
    constraint group_members_unique unique (group_id, user_id)
);

create index group_members_group_id_idx on public.group_members(group_id);
create index group_members_user_id_idx on public.group_members(user_id);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create or replace function public.is_group_owner(p_group_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
    select exists (select 1 from public.groups where id = p_group_id and owner_id = auth.uid());
$$;

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
    select exists (
        select 1 from public.group_members
        where group_id = p_group_id and user_id = auth.uid()
    );
$$;

grant execute on function public.is_group_owner(uuid) to authenticated;
grant execute on function public.is_group_member(uuid) to authenticated;

create policy "Owner or member can view a group"
on public.groups for select
using (owner_id = auth.uid() or public.is_group_member(id));

create policy "Owner can create groups"
on public.groups for insert
with check (owner_id = auth.uid());

create policy "Owner can update own groups"
on public.groups for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owner can delete own groups"
on public.groups for delete
using (owner_id = auth.uid());

create policy "Owner or member can view membership"
on public.group_members for select
using (public.is_group_owner(group_id) or user_id = auth.uid());

create policy "Owner can add members"
on public.group_members for insert
with check (public.is_group_owner(group_id));

create policy "Owner can remove members"
on public.group_members for delete
using (public.is_group_owner(group_id));

grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, delete on public.group_members to authenticated;

-- Adds a member by email, atomically: validates ownership, resolves the
-- email, and reports a clear error instead of a bare FK/unique violation.
create or replace function public.add_group_member_by_email(p_group_id uuid, p_email text)
returns public.group_members
language plpgsql
security invoker
as $$
declare
    target_user_id uuid;
    new_member public.group_members;
begin
    if not public.is_group_owner(p_group_id) then
        raise exception 'Only the group owner can add members';
    end if;

    target_user_id := public.find_user_id_by_email(p_email);

    if target_user_id is null then
        raise exception 'No account found for %', p_email;
    end if;

    insert into public.group_members (group_id, user_id)
    values (p_group_id, target_user_id)
    on conflict (group_id, user_id) do nothing
    returning * into new_member;

    if new_member.id is null then
        raise exception 'That person is already a member of this group';
    end if;

    return new_member;
end;
$$;

grant execute on function public.add_group_member_by_email(uuid, text) to authenticated;

-- auth.users isn't directly queryable by clients — this surfaces member
-- emails to the group owner only, for the chip list in the UI.
create or replace function public.get_group_members_with_email(p_group_id uuid)
returns table (id uuid, user_id uuid, email text, added_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
    select gm.id, gm.user_id, u.email, gm.added_at
    from public.group_members gm
    join auth.users u on u.id = gm.user_id
    where gm.group_id = p_group_id
      and public.is_group_owner(p_group_id)
    order by gm.added_at asc;
$$;

grant execute on function public.get_group_members_with_email(uuid) to authenticated;