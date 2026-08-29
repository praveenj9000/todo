-- ShareSettings.tsx needs a member count per group to render "Share with
-- a group", but getGroups() only returns plain groups rows. Rather than
-- fetch every group's full member list just to count it, expose the
-- count directly via a view.
--
-- security_invoker = true (Postgres 15+) makes this view enforce RLS as
-- the querying user, not the view's owner — so it only ever shows groups
-- (and counts) that user could already see via the existing "Owner or
-- member can view a group" / "Owner or member can view membership"
-- policies on the underlying tables.
create or replace view public.groups_with_member_count
with (security_invoker = true)
as
select
    g.id,
    g.owner_id,
    g.name,
    g.created_at,
    g.updated_at,
    count(gm.id) as member_count
from public.groups g
left join public.group_members gm on gm.group_id = g.id
group by g.id;

grant select on public.groups_with_member_count to authenticated;