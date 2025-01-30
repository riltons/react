-- Cria a função para incrementar as estatísticas do jogador
CREATE OR REPLACE FUNCTION increment_player_stats(
  p_player_id UUID,
  p_competition_id UUID,
  p_games_played INT DEFAULT 0,
  p_games_won INT DEFAULT 0,
  p_games_lost INT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE player_stats
  SET
    games_played = games_played + p_games_played,
    games_won = games_won + p_games_won,
    games_lost = games_lost + p_games_lost
  WHERE player_id = p_player_id AND competition_id = p_competition_id;
END;
$$;
