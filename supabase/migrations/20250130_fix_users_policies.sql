-- Habilitar extensão uuid-ossp se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Alterar a coluna id para usar uuid por padrão
ALTER TABLE "public"."users" 
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Enable RLS
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de usuários por usuários autenticados
CREATE POLICY "Usuários autenticados podem criar novos usuários" ON "public"."users"
FOR INSERT TO authenticated
WITH CHECK (true);

-- Política para permitir leitura de usuários por usuários autenticados
CREATE POLICY "Usuários autenticados podem ler usuários" ON "public"."users"
FOR SELECT TO authenticated
USING (true);

-- Política para permitir atualização de usuários por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar usuários" ON "public"."users"
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);
