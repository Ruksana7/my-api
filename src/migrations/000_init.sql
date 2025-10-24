CREATE TABLE IF NOT EXISTS public.users (
  id         BIGINT PRIMARY KEY,
  email      TEXT NOT NULL,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- unique email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
ON public.users (lower(email));

-- todos
CREATE TABLE IF NOT EXISTS public.todos (
  id         BIGINT PRIMARY KEY,
  title      TEXT NOT NULL,
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  priority   SMALLINT NOT NULL DEFAULT 2,
  user_id    BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- helper trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON public.users;
CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_todos_updated ON public.todos;
CREATE TRIGGER trg_todos_updated
BEFORE UPDATE ON public.todos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_id    ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_priority   ON public.todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_title_lower ON public.todos (lower(title));
