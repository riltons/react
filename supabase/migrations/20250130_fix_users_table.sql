-- Criar a tabela users com UUID
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "phone" TEXT,
    "roles" TEXT[] DEFAULT ARRAY['player']::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem criar seus próprios perfis" ON "public"."users";
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON "public"."users";
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios dados" ON "public"."users";
DROP POLICY IF EXISTS "Usuários autenticados podem criar novos usuários" ON "public"."users";
DROP POLICY IF EXISTS "Usuários autenticados podem ler usuários" ON "public"."users";
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar usuários" ON "public"."users";

-- Remover temporariamente as chaves estrangeiras
ALTER TABLE IF EXISTS "public"."users" DROP CONSTRAINT IF EXISTS "users_id_fkey";
ALTER TABLE IF EXISTS "public"."communities" DROP CONSTRAINT IF EXISTS "communities_admin_id_fkey";
ALTER TABLE IF EXISTS "public"."community_members" DROP CONSTRAINT IF EXISTS "community_members_user_id_fkey";
ALTER TABLE IF EXISTS "public"."competition_players" DROP CONSTRAINT IF EXISTS "competition_players_user_id_fkey";
ALTER TABLE IF EXISTS "public"."games" DROP CONSTRAINT IF EXISTS "games_team1_player1_id_fkey";
ALTER TABLE IF EXISTS "public"."games" DROP CONSTRAINT IF EXISTS "games_team1_player2_id_fkey";
ALTER TABLE IF EXISTS "public"."games" DROP CONSTRAINT IF EXISTS "games_team2_player1_id_fkey";
ALTER TABLE IF EXISTS "public"."games" DROP CONSTRAINT IF EXISTS "games_team2_player2_id_fkey";
ALTER TABLE IF EXISTS "public"."player_stats" DROP CONSTRAINT IF EXISTS "player_stats_player_id_fkey";

-- Criar tabela temporária para mapear IDs antigos e novos
CREATE TEMP TABLE user_id_mapping AS
SELECT id as old_id, uuid_generate_v4() as new_id
FROM "public"."users";

-- Atualizar IDs na tabela users
UPDATE "public"."users" u
SET id = m.new_id
FROM user_id_mapping m
WHERE u.id = m.old_id;

-- Atualizar IDs nas tabelas relacionadas
UPDATE "public"."communities" c
SET admin_id = m.new_id
FROM user_id_mapping m
WHERE c.admin_id = m.old_id;

UPDATE "public"."community_members" cm
SET user_id = m.new_id
FROM user_id_mapping m
WHERE cm.user_id = m.old_id;

UPDATE "public"."competition_players" cp
SET user_id = m.new_id
FROM user_id_mapping m
WHERE cp.user_id = m.old_id;

UPDATE "public"."games" g
SET 
  team1_player1_id = CASE WHEN team1_player1_id = m.old_id THEN m.new_id ELSE team1_player1_id END,
  team1_player2_id = CASE WHEN team1_player2_id = m.old_id THEN m.new_id ELSE team1_player2_id END,
  team2_player1_id = CASE WHEN team2_player1_id = m.old_id THEN m.new_id ELSE team2_player1_id END,
  team2_player2_id = CASE WHEN team2_player2_id = m.old_id THEN m.new_id ELSE team2_player2_id END
FROM user_id_mapping m
WHERE g.team1_player1_id = m.old_id 
   OR g.team1_player2_id = m.old_id
   OR g.team2_player1_id = m.old_id
   OR g.team2_player2_id = m.old_id;

UPDATE "public"."player_stats" ps
SET player_id = m.new_id
FROM user_id_mapping m
WHERE ps.player_id = m.old_id;

-- Alterar a coluna id para UUID
ALTER TABLE "public"."users" 
ALTER COLUMN "id" TYPE UUID USING id,
ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Atualizar os valores padrão dos outros campos
ALTER TABLE "public"."users" 
ALTER COLUMN "roles" SET DEFAULT ARRAY['player']::TEXT[],
ALTER COLUMN "created_at" SET DEFAULT NOW(),
ALTER COLUMN "updated_at" SET DEFAULT NOW();

-- Enable RLS
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Recriar as políticas
CREATE POLICY "Usuários autenticados podem criar novos usuários" ON "public"."users"
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ler usuários" ON "public"."users"
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem atualizar usuários" ON "public"."users"
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários podem deletar seus próprios dados" ON "public"."users"
FOR DELETE TO authenticated
USING (auth.uid() = id);

-- Recriar as chaves estrangeiras
ALTER TABLE IF EXISTS "public"."communities" 
ADD CONSTRAINT "communities_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS "public"."community_members" 
ADD CONSTRAINT "community_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS "public"."competition_players" 
ADD CONSTRAINT "competition_players_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS "public"."games" 
ADD CONSTRAINT "games_team1_player1_id_fkey" FOREIGN KEY (team1_player1_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT "games_team1_player2_id_fkey" FOREIGN KEY (team1_player2_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT "games_team2_player1_id_fkey" FOREIGN KEY (team2_player1_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT "games_team2_player2_id_fkey" FOREIGN KEY (team2_player2_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS "public"."player_stats" 
ADD CONSTRAINT "player_stats_player_id_fkey" FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE;

-- Remover tabela temporária
DROP TABLE user_id_mapping;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger apenas se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER "update_users_updated_at"
    BEFORE UPDATE ON "public"."users"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();
  END IF;
END
$$;
