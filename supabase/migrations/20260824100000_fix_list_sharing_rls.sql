-- Fix infinite RLS recursion in the list-sharing policies.
--
-- The original list_shares policies did `exists (select ... from public.lists
-- where user_id = auth.uid())`. Querying lists inside a list_shares policy
-- applies the lists RLS policies, which themselves query list_shares again —
-- mutual recursion, rejected by Postgres as "infinite recursion detected".
--
-- Fix: an OWNER-CHECK helper function with SECURITY DEFINER (owned by
-- postgres, which bypasses RLS), so share policies can verify list ownership
-- without re-entering the lists RLS policies. This breaks the cycle: a lists
-- policy may query list_shares, whose policy now calls the helper instead of
-- querying lists.

create or replace function public.is_list_owner(p_list_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1 from public.lists
        where id = p_list_id and user_id = auth.uid()
    );
$$;

-- Owner can view shares on their lists.
drop policy if exists "Owner can view shares on their lists" on public.list_shares;
create policy "Owner can view shares on their lists"
on public.list_shares
for select
using (public.is_list_owner(list_id));

drop policy if exists "Owner can insert shares on their lists" on public.list_shares;
create policy "Owner can insert shares on their lists"
on public.list_shares
for insert
with check (public.is_list_owner(list_id));

drop policy if exists "Owner can update shares on their lists" on public.list_shares;
create policy "Owner can update shares on their lists"
on public.list_shares
for update
using (public.is_list_owner(list_id))
with check (public.is_list_owner(list_id));

drop policy if exists "Owner can delete shares on their lists" on public.list_shares;
create policy "Owner can delete shares on their lists"
on public.list_shares
for delete
using (public.is_list_owner(list_id));

-- The policies above run as the calling user, so the helper must be
-- executable by the API roles as well.
grant execute on function public.is_list_owner(uuid) to anon, authenticated;