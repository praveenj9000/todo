-- Grant base table privileges to the API roles.
-- Newer Supabase versions no longer auto-expose new tables to the
-- `anon`/`authenticated` roles, so explicit GRANTs are required for
-- the REST API (PostgREST) to work with RLS-protected tables.

grant select, insert, update, delete on public.tasks to anon, authenticated;
grant select, insert, update, delete on public.task_links to anon, authenticated;