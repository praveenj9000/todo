-- Realtime for lists: the subscription filters by user_id (a
-- non-primary-key column), so replica identity full is required for
-- DELETE/UPDATE events to carry user_id in the replicated payload.
alter publication supabase_realtime add table public.lists;

alter table public.lists replica identity full;