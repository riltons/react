-- Remove todas as políticas existentes
DROP POLICY IF EXISTS "Membros podem ver membros da comunidade" ON public.community_members;
DROP POLICY IF EXISTS "Membros podem ver outros membros da comunidade" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem gerenciar membros" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem adicionar membros" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem atualizar membros" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem remover membros" ON public.community_members;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.community_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.community_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.community_members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.community_members;

-- Desabilita RLS temporariamente
ALTER TABLE public.community_members DISABLE ROW LEVEL SECURITY;

-- Habilita RLS novamente
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Cria uma política simples para leitura
CREATE POLICY "Membros podem ver membros da comunidade"
    ON public.community_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
        )
    );

-- Cria uma política simples para inserção
CREATE POLICY "Admins podem adicionar membros"
    ON public.community_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_id
            AND c.admin_id = auth.uid()
        )
    );

-- Cria uma política simples para atualização
CREATE POLICY "Admins podem atualizar membros"
    ON public.community_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_id
            AND c.admin_id = auth.uid()
        )
    );

-- Cria uma política simples para deleção
CREATE POLICY "Admins podem remover membros"
    ON public.community_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM communities c
            WHERE c.id = community_id
            AND c.admin_id = auth.uid()
        )
    );
