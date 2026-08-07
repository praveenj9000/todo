-- sort_order needs fractional values so a drop position can be computed
-- as a midpoint between two neighbors without rewriting every other row.
alter table public.tasks
    alter column sort_order type double precision
    using sort_order::double precision;

alter table public.tasks
    alter column sort_order set default 0;

-- keyset pagination needs id as a tiebreaker on every sort column in use
create index tasks_user_id_sort_order_id_idx
    on public.tasks(user_id, sort_order, id);

create index tasks_user_id_created_at_id_idx
    on public.tasks(user_id, created_at, id);

create index tasks_user_id_updated_at_id_idx
    on public.tasks(user_id, updated_at, id);

-- replaces reorder_tasks(uuid[]): moves exactly one task between two
-- (optional) neighbors, computing a midpoint sort_order. This is what
-- makes drag-and-drop work correctly when the client only ever holds
-- one page/window of the full list, not the whole thing.
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

    if p_prev_id is not null then
        select sort_order into prev_order
        from public.tasks
        where id = p_prev_id and user_id = current_user_id;

        if not found then
            raise exception 'Invalid prev task';
        end if;
    end if;

    if p_next_id is not null then
        select sort_order into next_order
        from public.tasks
        where id = p_next_id and user_id = current_user_id;

        if not found then
            raise exception 'Invalid next task';
        end if;
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

drop function if exists public.reorder_tasks(uuid[]);