import supabase from '../config/supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

export const userService = {
  list: async () => {
    return await supabase
      .from('users')
      .select('*')
      .order('name');
  },

  get: async (id: string) => {
    return await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
  },

  update: async (id: string, data: Partial<User>) => {
    return await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }
};
