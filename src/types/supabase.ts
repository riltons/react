export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          nickname: string | null
          phone: string | null
          roles: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          nickname?: string | null
          phone?: string | null
          roles?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          nickname?: string | null
          phone?: string | null
          roles?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          community_id: string
          name: string
          description: string | null
          status: 'pending' | 'active' | 'finished'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          community_id: string
          name: string
          description?: string | null
          status?: 'pending' | 'active' | 'finished'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          name?: string
          description?: string | null
          status?: 'pending' | 'active' | 'finished'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          whatsapp_group_id: string | null
          admin_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          whatsapp_group_id?: string | null
          admin_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          whatsapp_group_id?: string | null
          admin_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          community_id: string
          user_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      competition_players: {
        Row: {
          id: string
          competition_id: string
          player_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          player_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          player_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          competition_id: string
          player1_id: string
          player2_id: string
          winner_id?: string
          status: 'pending' | 'in_progress' | 'finished'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          player1_id: string
          player2_id: string
          winner_id?: string
          status?: 'pending' | 'in_progress' | 'finished'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          player1_id?: string
          player2_id?: string
          winner_id?: string
          status?: 'pending' | 'in_progress' | 'finished'
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          game_id: string
          player1_score: number
          player2_score: number
          winner_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player1_score: number
          player2_score: number
          winner_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player1_score?: number
          player2_score?: number
          winner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      player_stats: {
        Row: {
          id: string
          competition_id: string
          player_id: string
          games_played: number
          games_won: number
          games_lost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          player_id: string
          games_played?: number
          games_won?: number
          games_lost?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          competition_id?: string
          player_id?: string
          games_played?: number
          games_won?: number
          games_lost?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_player_stats: {
        Args: {
          p_player_id: string
          p_competition_id: string
          p_games_played?: number
          p_games_won?: number
          p_games_lost?: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
