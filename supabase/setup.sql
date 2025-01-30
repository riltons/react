-- Criação da tabela competitions
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'community',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilita Row Level Security
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Leitura pública de comunidades" ON competitions
FOR SELECT USING (status = 'active');

CREATE POLICY "Criação de comunidades por usuários autenticados" ON competitions
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Atualização por administradores" ON competitions
FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Exclusão por administradores" ON competitions
FOR DELETE USING (auth.role() = 'admin');

-- Função para verificar role de admin
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

-- Atribuir role de admin (execute para seu usuário)
UPDATE auth.users SET role = 'admin' WHERE id = 'seu-user-id-aqui';