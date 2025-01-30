import supabase from '../config/supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

export const playerService = {
  create: async ({ name, nickname, phone }: { name: string; nickname?: string; phone?: string }) => {
    // Gera um email e senha temporários
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@domatch.temp`;
    const password = Math.random().toString(36).slice(-8);

    // Cria o usuário na autenticação
    const { data: auth, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          nickname,
          phone
        }
      }
    });

    if (signUpError) throw signUpError;
    if (!auth.user) throw new Error('Erro ao criar usuário');

    // Cria o perfil do usuário
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: auth.user.id,
        name,
        nickname,
        phone,
        roles: ['player']
      }]);

    if (profileError) throw profileError;

    return { data: auth.user, error: null };
  },

  update: async (id: string, { name, nickname, phone }: { name?: string; nickname?: string; phone?: string }) => {
    return await supabase
      .from('users')
      .update({ name, nickname, phone })
      .eq('id', id)
      .select()
      .single();
  },

  list: async () => {
    return await supabase
      .from('users')
      .select('*')
      .contains('roles', ['player'])
      .order('name');
  },

  getById: async (id: string) => {
    return await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
  }
};
