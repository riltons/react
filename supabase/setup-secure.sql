-- Criação segura da tabela
BEGIN;

CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (LENGTH(name) > 3),
  description TEXT,
  type TEXT NOT NULL DEFAULT 'community' CHECK (type IN ('community', 'tournament')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')), 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Leitura pública" ON competitions
FOR SELECT USING (status = 'active');

-- Política de escrita moderada
CREATE POLICY "Criação autenticada" ON competitions
FOR INSERT TO authenticated WITH CHECK (
  type = 'community' AND
  LENGTH(name) <= 50 AND
  auth.uid() IS NOT NULL
);

-- Função de verificação de admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política de administração
CREATE POLICY "Administração total" ON competitions
FOR ALL TO authenticated USING (is_admin());

COMMIT;

-- Cria usuário admin (substitua pelo seu user_id)
UPDATE auth.users SET role = 'admin' WHERE id = 'SEU_USER_ID_AQUI';

-- Cria role restrita para uso futuro
CREATE ROLE restricted_access;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM restricted_access;
GRANT CONNECT ON DATABASE postgres TO restricted_access;