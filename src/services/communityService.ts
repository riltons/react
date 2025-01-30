import supabase from '../config/supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type Community = Tables['communities']['Row'];

export const communityService = {
  create: async ({ name, description }: { name: string; description?: string }) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    return await supabase
      .from('communities')
      .insert([{
        name,
        description,
        admin_id: userData.user.id
      }])
      .select()
      .single();
  },

  update: async (id: string, { name, description }: { name?: string; description?: string }) => {
    return await supabase
      .from('communities')
      .update({
        name,
        description
      })
      .eq('id', id)
      .select()
      .single();
  },

  delete: async (id: string) => {
    return await supabase
      .from('communities')
      .delete()
      .eq('id', id);
  },

  list: async () => {
    return await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false });
  },

  getById: async (id: string) => {
    return await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();
  }
};
