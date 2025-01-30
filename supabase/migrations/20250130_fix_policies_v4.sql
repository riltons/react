-- Adiciona política para permitir que usuários autenticados vejam outros usuários
DROP POLICY IF EXISTS "Usuários autenticados podem ver outros usuários" ON public.users;
CREATE POLICY "Usuários autenticados podem ver outros usuários"
    ON public.users
    FOR SELECT
    USING (auth.role() = 'authenticated');
