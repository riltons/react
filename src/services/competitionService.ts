import supabase from '../config/supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type Competition = Tables['competitions']['Row'];

export const competitionService = {
  create: async ({ name, description, startDate, endDate, communityId }: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    communityId: string;
  }) => {
    return await supabase
      .from('competitions')
      .insert([{
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        community_id: communityId,
        status: 'pending'
      }])
      .select()
      .single();
  },

  update: async (id: string, {
    name,
    description,
    startDate,
    endDate,
    status
  }: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: 'pending' | 'active' | 'finished';
  }) => {
    return await supabase
      .from('competitions')
      .update({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        status
      })
      .eq('id', id)
      .select()
      .single();
  },

  delete: async (id: string) => {
    return await supabase
      .from('competitions')
      .delete()
      .eq('id', id);
  },

  listByCommunity: async (communityId: string) => {
    return await supabase
      .from('competitions')
      .select('*')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });
  },

  getById: async (id: string) => {
    return await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single();
  }
};
