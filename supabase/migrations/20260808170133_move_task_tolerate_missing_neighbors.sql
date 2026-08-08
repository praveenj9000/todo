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
begin
    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;

    if not exists (
        select 1 from public.tasks
        where id = p_task_id and user_id = current_user_id
    ) then
        raise exception 'Task not found';
    end if;

    -- A queued offline move may reference a neighbor that no longer
    -- exists (deleted before reconnect) or belongs to another user.
    -- Treat that as "no neighbor on that side" instead of failing
    -- the whole sync.
    if p_prev_id is not null then
        select sort_order into prev_order
        from public.tasks
        where id = p_prev_id and user_id = current_user_id;
    end if;

    if p_next_id is not null then
        select sort_order into next_order
        from public.tasks
        where id = p_next_id and user_id = current_user_id;
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
    where id = p_task_id and user_id = current_user_id
    returning * into moved_task;

    return moved_task;
end;
$$;