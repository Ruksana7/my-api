DO $$
BEGIN
  -- users
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relkind='S' AND c.relname='users_id_seq' AND n.nspname='public'
  ) THEN
    CREATE SEQUENCE public.users_id_seq OWNED BY public.users.id;
  END IF;

  PERFORM setval('public.users_id_seq',
                 COALESCE((SELECT MAX(id)+1 FROM public.users), 1),
                 false);

  ALTER TABLE public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq');

  -- todos
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relkind='S' AND c.relname='todos_id_seq' AND n.nspname='public'
  ) THEN
    CREATE SEQUENCE public.todos_id_seq OWNED BY public.todos.id;
  END IF;

  PERFORM setval('public.todos_id_seq',
                 COALESCE((SELECT MAX(id)+1 FROM public.todos), 1),
                 false);

  ALTER TABLE public.todos ALTER COLUMN id SET DEFAULT nextval('public.todos_id_seq');
END$$;
