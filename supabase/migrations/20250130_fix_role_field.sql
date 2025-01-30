-- Renomeia a coluna roles para role
ALTER TABLE public.community_members 
  RENAME COLUMN roles TO role;

-- Converte o tipo da coluna de text[] para text
ALTER TABLE public.community_members 
  ALTER COLUMN role TYPE text USING role[1];
