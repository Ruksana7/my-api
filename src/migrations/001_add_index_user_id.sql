-- 001_add_index_user_id.sql
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

