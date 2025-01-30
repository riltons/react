-- Remove as políticas antigas
DROP POLICY IF EXISTS "Membros podem ver outros membros da comunidade" ON public.community_members;
DROP POLICY IF EXISTS "Admins podem gerenciar membros" ON public.community_members;

-- Cria as novas políticas
CREATE POLICY "Membros podem ver membros da comunidade"
    ON public.community_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.community_id = community_members.community_id
        AND cm.user_id = auth.uid()
    ));

CREATE POLICY "Admins podem adicionar membros"
    ON public.community_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.admin_id = auth.uid()
    ));

CREATE POLICY "Admins podem atualizar membros"
    ON public.community_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.admin_id = auth.uid()
    ));

CREATE POLICY "Admins podem remover membros"
    ON public.community_members FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.admin_id = auth.uid()
    ));
