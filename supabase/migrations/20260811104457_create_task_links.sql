create table public.task_links (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    task_id_a uuid not null
        references public.tasks(id)
        on delete cascade,

    task_id_b uuid not null
        references public.tasks(id)
        on delete cascade,

    -- The task that was newly created (and thus the "child" side of the
    -- link), if this link came from create_linked_task. Null if a link
    -- is ever created some other way (e.g. a future "link existing
    -- tasks" feature) with no origin direction.
    created_from_task_id uuid
        references public.tasks(id)
        on delete set null,

    created_at timestamptz not null default timezone('utc', now()),

    constraint task_links_no_self_link check (task_id_a <> task_id_b),

    -- task_id_a is always the lexicographically smaller uuid (enforced
    -- by create_linked_task), so this prevents inserting both (A,B) and
    -- (B,A) as separate rows for the same pair.
    constraint task_links_unique_pair unique (task_id_a, task_id_b)
);

create index task_links_task_id_a_idx on public.task_links(task_id_a);
create index task_links_task_id_b_idx on public.task_links(task_id_b);
create index task_links_user_id_idx on public.task_links(user_id);
create index task_links_created_from_idx on public.task_links(created_from_task_id);

alter table public.task_links enable row level security;

create policy "Users can view their own task links"
on public.task_links
for select
using (auth.uid() = user_id);

create policy "Users can delete their own task links"
on public.task_links
for delete
using (auth.uid() = user_id);

create policy "Users can insert their own task links"
on public.task_links
for insert
with check (
    auth.uid() = user_id
    and exists (select 1 from public.tasks where id = task_id_a and user_id = auth.uid())
    and exists (select 1 from public.tasks where id = task_id_b and user_id = auth.uid())
);

-- Creates a brand-new task and links it to an existing one in a single
-- transaction, so a client never ends up with an orphaned task or a
-- dangling link if either half failed independently.
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
begin
    if current_user_id is null then
        raise exception 'Not authenticated';
    end if;

    if not exists (
        select 1 from public.tasks
        where id = p_source_task_id and user_id = current_user_id
    ) then
        raise exception 'Source task not found';
    end if;

    insert into public.tasks (title, user_id)
    values (p_title, current_user_id)
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