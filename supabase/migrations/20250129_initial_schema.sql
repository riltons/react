-- Removendo tabelas existentes
DROP TABLE IF EXISTS public.player_stats CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.competition_players CASCADE;
DROP TABLE IF EXISTS public.competitions CASCADE;
DROP TABLE IF EXISTS public.community_members CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (estende a tabela auth.users do Supabase)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    nickname TEXT,
    phone TEXT,
    roles TEXT[] NOT NULL DEFAULT '{player}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de comunidades
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    whatsapp_group_id TEXT,
    admin_id UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON public.communities
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de membros da comunidade
CREATE TABLE public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'organizer', 'player')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(community_id, user_id)
);

CREATE TRIGGER update_community_members_updated_at
    BEFORE UPDATE ON public.community_members
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de competições
CREATE TABLE public.competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'finished')) DEFAULT 'pending',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TRIGGER update_competitions_updated_at
    BEFORE UPDATE ON public.competitions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de jogadores da competição
CREATE TABLE public.competition_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(competition_id, user_id)
);

CREATE TRIGGER update_competition_players_updated_at
    BEFORE UPDATE ON public.competition_players
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de jogos
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    team1_player1_id UUID NOT NULL REFERENCES public.users(id),
    team1_player2_id UUID NOT NULL REFERENCES public.users(id),
    team2_player1_id UUID NOT NULL REFERENCES public.users(id),
    team2_player2_id UUID NOT NULL REFERENCES public.users(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'finished')) DEFAULT 'pending',
    winner_team INTEGER CHECK (winner_team IN (1, 2)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de estatísticas dos jogadores
CREATE TABLE public.player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    games_played INTEGER NOT NULL DEFAULT 0,
    games_won INTEGER NOT NULL DEFAULT 0,
    games_lost INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(competition_id, player_id)
);

CREATE TRIGGER update_player_stats_updated_at
    BEFORE UPDATE ON public.player_stats
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Tabela de partidas
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    team1_score INTEGER NOT NULL DEFAULT 0,
    team2_score INTEGER NOT NULL DEFAULT 0,
    winner_team INTEGER CHECK (winner_team IN (1, 2)),
    victory_type TEXT CHECK (victory_type IN ('simple', 'carroca', 'la_e_lo', 'cruzada', 'points')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)

-- Habilita RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Usuários podem ver outros usuários"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Usuários podem criar seus próprios perfis"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem deletar seus próprios dados"
    ON public.users FOR DELETE
    USING (auth.uid() = id);

-- Políticas para communities
CREATE POLICY "Qualquer um pode ver comunidades"
    ON public.communities FOR SELECT
    USING (true);

CREATE POLICY "Usuários autenticados podem criar comunidades"
    ON public.communities FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem atualizar suas comunidades"
    ON public.communities FOR UPDATE
    USING (admin_id = auth.uid());

CREATE POLICY "Admins podem deletar suas comunidades"
    ON public.communities FOR DELETE
    USING (admin_id = auth.uid());

-- Políticas para community_members
DROP POLICY IF EXISTS "Membros podem ver membros da comunidade" ON public.community_members;
CREATE POLICY "Membros podem ver membros da comunidade"
    ON public.community_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.community_id = community_members.community_id
        AND cm.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Admins podem adicionar membros" ON public.community_members;
CREATE POLICY "Admins podem adicionar membros"
    ON public.community_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.admin_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Admins podem atualizar membros" ON public.community_members;
CREATE POLICY "Admins podem atualizar membros"
    ON public.community_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.admin_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Admins podem remover membros" ON public.community_members;
CREATE POLICY "Admins podem remover membros"
    ON public.community_members FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.communities c
        WHERE c.id = community_id
        AND c.admin_id = auth.uid()
    ));

-- Políticas para competitions
CREATE POLICY "Qualquer um pode ver competições"
    ON public.competitions FOR SELECT
    USING (true);

CREATE POLICY "Organizadores podem gerenciar competições"
    ON public.competitions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.community_members
        WHERE community_id = community_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'organizer')
    ));

-- Políticas para competition_players
CREATE POLICY "Qualquer um pode ver jogadores das competições"
    ON public.competition_players FOR SELECT
    USING (true);

CREATE POLICY "Organizadores podem gerenciar jogadores das competições"
    ON public.competition_players FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.competitions c
        JOIN public.community_members cm ON cm.community_id = c.community_id
        WHERE c.id = competition_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'organizer')
    ));

-- Políticas para games
CREATE POLICY "Qualquer um pode ver jogos"
    ON public.games FOR SELECT
    USING (true);

CREATE POLICY "Organizadores podem gerenciar jogos"
    ON public.games FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.competitions c
        JOIN public.community_members cm ON cm.community_id = c.community_id
        WHERE c.id = competition_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'organizer')
    ));

-- Políticas para matches
CREATE POLICY "Qualquer um pode ver partidas"
    ON public.matches FOR SELECT
    USING (true);

CREATE POLICY "Organizadores podem gerenciar partidas"
    ON public.matches FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.games g
        JOIN public.competitions c ON c.id = g.competition_id
        JOIN public.community_members cm ON cm.community_id = c.community_id
        WHERE g.id = game_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'organizer')
    ));

-- Políticas para player_stats
CREATE POLICY "Qualquer um pode ver estatísticas"
    ON public.player_stats FOR SELECT
    USING (true);

CREATE POLICY "Sistema pode atualizar estatísticas"
    ON public.player_stats FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.competitions c
        JOIN public.community_members cm ON cm.community_id = c.community_id
        WHERE c.id = competition_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'organizer')
    ));
