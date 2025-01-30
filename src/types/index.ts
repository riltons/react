export type UserRole = 'admin' | 'organizer' | 'player';

export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  phone?: string;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  whatsapp_group_id?: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Competition {
  id: string;
  community_id: string;
  name: string;
  description?: string;
  status: 'pending' | 'active' | 'finished';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitionPlayer {
  id: string;
  competition_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  competition_id: string;
  team1_player1_id: string;
  team1_player2_id: string;
  team2_player1_id: string;
  team2_player2_id: string;
  status: 'pending' | 'in_progress' | 'finished';
  winner_team?: 1 | 2;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  game_id: string;
  team1_score: number;
  team2_score: number;
  winner_team?: 1 | 2;
  victory_type?: 'simple' | 'carroca' | 'la_e_lo' | 'cruzada' | 'points';
  created_at: string;
  updated_at: string;
}

export interface PlayerStats {
  id: string;
  user_id: string;
  competition_id: string;
  games_played: number;
  games_won: number;
  matches_played: number;
  matches_won: number;
  simple_victories: number;
  carroca_victories: number;
  la_e_lo_victories: number;
  cruzada_victories: number;
  points_victories: number;
  buchuda_victories: number;
  buchuda_re_victories: number;
  created_at: string;
  updated_at: string;
}
