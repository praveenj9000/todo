create or replace function public.reorder_tasks(
    task_ids uuid[]
)
returns void
language plpgsql
security invoker
as $$
declare
    current_user_id uuid := auth.uid();
begin
    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;

    if exists (
        select 1
        from unnest(task_ids) as id
        left join public.tasks t
            on t.id = id
        where t.user_id is distinct from current_user_id
    ) then
        raise exception 'Invalid task list';
    end if;

    update public.tasks
    set sort_order = reordered.sort_order
    from (
        select
            id,
            row_number() over () - 1 as sort_order
        from unnest(task_ids) with ordinality as ordered(id, position)
        order by position
    ) as reordered
    where tasks.id = reordered.id;
end;
$$;