-- User groups: named collections of members (email addresses) that can later
-- be shared as a whole (list_shares already supports subject_type = 'group').
-- Groups belong to a single owner who manages them from the Settings screen.
--
-- Members are stored as email addresses rather than auth.users FKs so a group
-- can reference people before they have accounts; when a member later signs in,
-- their user id can be resolved from the email and matched against list sharing.

create table public.groups (
    id uuid primary key default gen_random_uuid(),

    owner_id uuid not null
        references auth.users(id)
        on delete cascade,

    name text not null,

    constraint groups_name_length check (
        char_length(name) between 1 and 200
    ),

    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index groups_owner_id_idx
    on public.groups(owner_id);

alter table public.groups enable row level security;

create policy "Users can view their own groups"
on public.groups
for select
using (auth.uid() = owner_id);

create policy "Users can insert their own groups"
on public.groups
for insert
with check (auth.uid() = owner_id);

create policy "Users can update their own groups"
on public.groups
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Users can delete their own groups"
on public.groups
for delete
using (auth.uid() = owner_id);

-- Group members: one row per member per group. Emails are kept lower-case so
-- the uniqueness constraint is case-insensitive regardless of how they were
-- typed (the client normalizes before inserting, this is a backstop).

create table public.group_members (
    id uuid primary key default gen_random_uuid(),

    group_id uuid not null
        references public.groups(id)
        on delete cascade,

    email text not null,

    created_at timestamptz not null default timezone('utc', now()),

    constraint group_members_email_format check (
        email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    ),

    constraint group_members_email_length check (
        char_length(email) between 3 and 254
    )
);

create unique index group_members_group_email_idx
    on public.group_members(group_id, lower(email));

create index group_members_group_id_idx
    on public.group_members(group_id);

alter table public.group_members enable row level security;

-- Member rows are owned by the group's owner. These policies only read
-- public.groups (whose policies never read group_members), so there is no
-- RLS recursion risk here.
create policy "Owner can view group members"
on public.group_members
for select
using (
    exists (
        select 1 from public.groups
        where id = group_id and owner_id = auth.uid()
    )
);

create policy "Owner can insert group members"
on public.group_members
for insert
with check (
    exists (
        select 1 from public.groups
        where id = group_id and owner_id = auth.uid()
    )
);

create policy "Owner can update group members"
on public.group_members
for update
using (
    exists (
        select 1 from public.groups
        where id = group_id and owner_id = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.groups
        where id = group_id and owner_id = auth.uid()
    )
);

create policy "Owner can delete group members"
on public.group_members
for delete
using (
    exists (
        select 1 from public.groups
        where id = group_id and owner_id = auth.uid()
    )
);

-- Newer Supabase versions no longer auto-expose new tables to the API roles,
-- so explicit GRANTs are required for PostgREST to work with RLS.
grant select, insert, update, delete on public.groups to anon, authenticated;
grant select, insert, update, delete on public.group_members to anon, authenticated;