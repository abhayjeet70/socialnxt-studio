ALTER TABLE public.posts ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;
