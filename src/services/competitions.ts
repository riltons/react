import supabaseClient from '../config/supabase';
import type { Database } from '../types/supabase';

type Competition = Database['public']['Tables']['competitions']['Row'];
type CompetitionPlayer = Database['public']['Tables']['competition_players']['Row'];
type Game = Database['public']['Tables']['games']['Row'];
type Match = Database['public']['Tables']['matches']['Row'];
type PlayerStats = Database['public']['Tables']['player_stats']['Row'];

type GameStatus = 'pending' | 'in_progress' | 'finished';

interface CompetitionWithGames extends Competition {
  games: Game[];
}

export const createCompetition = async (
  name: string,
  organizerId: string,
  description: string = ''
): Promise<Competition> => {
  try {
    const { data, error } = await supabaseClient
      .from('competitions')
      .insert({
        name,
        description,
        organizer_id: organizerId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar competição:', error);
    throw error;
  }
};

export const updateCompetitionStatus = async (
  competitionId: string,
  status: 'pending' | 'in_progress' | 'finished'
): Promise<void> => {
  try {
    const { error } = await supabaseClient
      .from('competitions')
      .update({ status })
      .eq('id', competitionId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar status da competição:', error);
    throw error;
  }
};

export const addPlayer = async (
  competitionId: string,
  playerId: string
): Promise<void> => {
  try {
    const { error } = await supabaseClient
      .from('competition_players')
      .insert({
        competition_id: competitionId,
        user_id: playerId
      });

    if (error) throw error;

    // Inicializa as estatísticas do jogador
    const { error: statsError } = await supabaseClient
      .from('player_stats')
      .insert({
        competition_id: competitionId,
        player_id: playerId,
        games_played: 0,
        games_won: 0,
        games_lost: 0
      });

    if (statsError) throw statsError;
  } catch (error) {
    console.error('Erro ao adicionar jogador:', error);
    throw error;
  }
};

export const createGame = async (
  competitionId: string,
  player1Id: string,
  player2Id: string
): Promise<Game> => {
  try {
    const { data, error } = await supabaseClient
      .from('games')
      .insert({
        competition_id: competitionId,
        player1_id: player1Id,
        player2_id: player2Id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar jogo:', error);
    throw error;
  }
};

export const updateGameStatus = async (
  gameId: string,
  status: GameStatus,
  winnerId?: string
): Promise<void> => {
  try {
    const { error } = await supabaseClient
      .from('games')
      .update({
        status,
        winner_id: winnerId
      })
      .eq('id', gameId);

    if (error) throw error;

    if (status === 'finished' && winnerId) {
      // Atualiza as estatísticas dos jogadores
      const { data: gameData } = await supabaseClient
        .from('games')
        .select('competition_id, player1_id, player2_id')
        .eq('id', gameId)
        .single();

      if (gameData) {
        const loserId = gameData.player1_id === winnerId ? gameData.player2_id : gameData.player1_id;

        // Atualiza estatísticas do vencedor
        const { error: winnerError } = await supabaseClient.rpc('increment_player_stats', {
          p_player_id: winnerId,
          p_competition_id: gameData.competition_id,
          p_games_played: 1,
          p_games_won: 1,
          p_games_lost: 0
        });

        if (winnerError) throw winnerError;

        // Atualiza estatísticas do perdedor
        const { error: loserError } = await supabaseClient.rpc('increment_player_stats', {
          p_player_id: loserId,
          p_competition_id: gameData.competition_id,
          p_games_played: 1,
          p_games_won: 0,
          p_games_lost: 1
        });

        if (loserError) throw loserError;
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar status do jogo:', error);
    throw error;
  }
};

export const getCompetitionStats = async (competitionId: string): Promise<PlayerStats[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('player_stats')
      .select(`
        *,
        player:users (name)
      `)
      .eq('competition_id', competitionId)
      .order('games_won', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas da competição:', error);
    throw error;
  }
};

export const finishCompetition = async (competitionId: string): Promise<void> => {
  try {
    // Verifica se todos os jogos estão finalizados
    const { data: competitionData, error: competitionError } = await supabaseClient
      .from('competitions')
      .select('*, games!inner(*)')
      .eq('id', competitionId)
      .single() as { data: CompetitionWithGames | null; error: Error | null };

    if (competitionError) throw competitionError;
    if (!competitionData) throw new Error('Competição não encontrada');

    // Verifica se há pelo menos um jogo finalizado
    const hasFinishedGames = competitionData.games.some((game: Game) => game.status === 'finished');
    if (!hasFinishedGames) {
      throw new Error('A competição precisa ter pelo menos um jogo finalizado');
    }

    // Verifica se não há jogos pendentes ou em andamento
    const hasUnfinishedGames = competitionData.games.some(
      (game: Game) => game.status === 'pending' || game.status === 'in_progress'
    );
    if (hasUnfinishedGames) {
      throw new Error('Todos os jogos precisam estar finalizados');
    }

    // Atualiza o status da competição
    const { error } = await supabaseClient
      .from('competitions')
      .update({ status: 'finished' })
      .eq('id', competitionId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao finalizar competição:', error);
    throw error;
  }
};
