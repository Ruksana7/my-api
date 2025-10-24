ALTER TABLE public.todos
  ADD COLUMN IF NOT EXISTS priority SMALLINT NOT NULL DEFAULT 2;

ALTER TABLE public.todos
  ADD CONSTRAINT chk_todos_priority_range
  CHECK (priority BETWEEN 1 AND 3);

CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.todos(priority);
