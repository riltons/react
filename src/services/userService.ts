import supabase from '../config/supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

// Tipo para criar usuário
type CreateUserData = {
  name: string;
  nickname?: string;
  phone?: string;
};

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

  create: async (data: CreateUserData) => {
    return await supabase
      .from('users')
      .insert([data])
      .select()
      .single();
  },

  createUser: async (data: CreateUserData) => {
    return await supabase
      .from('users')
      .insert([data])
      .select()
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
