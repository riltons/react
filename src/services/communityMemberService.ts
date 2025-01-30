import supabase from '../config/supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type CommunityMemberRow = Tables['community_members']['Row'];
type User = Tables['users']['Row'];

type CommunityMember = {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  user?: User;
};

export const communityMemberService = {
  addMember: async (communityId: string, userId: string, role: string = 'player') => {
    return await supabase
      .from('community_members')
      .insert([{
        community_id: communityId,
        user_id: userId,
        role
      }])
      .select()
      .single();
  },

  removeMember: async (communityId: string, userId: string) => {
    return await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);
  },

  listMembers: async (communityId: string) => {
    const { data: members, error: membersError } = await supabase
      .from('community_members')
      .select('*, user:users(*)')
      .eq('community_id', communityId);

    if (membersError) {
      console.error('Erro ao buscar membros:', membersError);
      return { data: [], error: membersError };
    }

    const formattedMembers: CommunityMember[] = members?.map(member => ({
      id: member.id,
      community_id: member.community_id,
      user_id: member.user_id,
      role: member.role,
      user: member.user
    })) || [];

    return { data: formattedMembers, error: null };
  },

  listAvailablePlayers: async (communityId: string) => {
    // Primeiro, busca os membros atuais
    const { data: members } = await supabase
      .from('community_members')
      .select('user_id')
      .eq('community_id', communityId);

    const memberIds = members?.map(m => m.user_id) || [];

    // Depois, busca os jogadores que não são membros
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .not('id', 'in', `(${memberIds.length > 0 ? memberIds.join(',') : '00000000-0000-0000-0000-000000000000'})`);

    return { data: users, error };
  }
};
