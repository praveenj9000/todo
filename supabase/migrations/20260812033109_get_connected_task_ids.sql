create or replace function public.get_connected_task_ids(p_task_id uuid)
returns uuid[]
language plpgsql
security invoker
as $$
declare
    current_user_id uuid := auth.uid();
    result uuid[];
begin
    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;

    -- Undirected graph reachability over task_links: starting from
    -- p_task_id, follow every link edge (regardless of direction) to
    -- find every task in the same connected tree. RLS on task_links
    -- (select policy: auth.uid() = user_id) restricts this to the
    -- caller's own data automatically, since this function runs as
    -- security invoker.
    with recursive component as (
        select p_task_id as id
        union
        select case when tl.task_id_a = c.id then tl.task_id_b else tl.task_id_a end
        from component c
        join public.task_links tl
          on tl.task_id_a = c.id or tl.task_id_b = c.id
    )
    select array_agg(distinct id) into result from component;

    return result;
end;
$$;