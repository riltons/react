-- Remove todas as políticas existentes
DROP POLICY IF EXISTS "Membros podem ver membros da comunidade" ON public.community_members;
DROP POLICY IF EXISTS "Membros podem ver outros membros da comunidade" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem gerenciar membros" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem adicionar membros" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem atualizar membros" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem remover membros" ON public.community_members;

-- Desabilita RLS temporariamente
ALTER TABLE public.community_members DISABLE ROW LEVEL SECURITY;

-- Remove todas as políticas
DROP POLICY IF EXISTS "Enable read access for all users" ON public.community_members;

-- Habilita RLS novamente
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Cria uma única política simples para leitura
CREATE POLICY "Enable read access for all users"
    ON public.community_members
    FOR SELECT
    USING (true);

-- Cria uma política simples para inserção
CREATE POLICY "Enable insert for authenticated users"
    ON public.community_members
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Cria uma política simples para atualização
CREATE POLICY "Enable update for authenticated users"
    ON public.community_members
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Cria uma política simples para deleção
CREATE POLICY "Enable delete for authenticated users"
    ON public.community_members
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
