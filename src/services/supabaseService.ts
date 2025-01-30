// supabaseService.ts - Nova implementação com camada de repositório
import supabase from '../config/supabase';
import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Community = Tables['communities']['Row'];
type Competition = Tables['competitions']['Row'];

// Serviço de autenticação
export const authService = {
  login: async ({ email, password }: { email: string; password: string }) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  register: async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const { data: auth, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) return { error: signUpError };

    // Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('users')
      .insert([{ id: auth.user?.id, email, name }]);

    if (profileError) return { error: profileError };

    return { data: auth, error: null };
  },

  logout: async () => {
    return await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    return await supabase.auth.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  getUserProfile: async (userId: string) => {
    return await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
  },

  ensureUserProfile: async (user: { id: string; email?: string | undefined }) => {
    if (!user.email) throw new Error('Email do usuário não encontrado');

    // Verifica se o usuário já existe na tabela users
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // Se não existe, cria um novo perfil
      const { error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          name: user.email.split('@')[0], // Usa parte do email como nome temporário
          roles: ['player']
        }]);

      if (error) throw error;
    }
  }
};

// Serviço de comunidades
export const communityService = {
  create: async ({ name, description, admin_id }: { name: string; description: string; admin_id: string }) => {
    // Garante que o usuário existe na tabela users
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    await authService.ensureUserProfile(user);

    return await supabase
      .from('communities')
      .insert([{ name, description, admin_id }])
      .select()
      .single();
  },

  update: async (id: string, community: Partial<Tables['communities']['Update']>) => {
    return await supabase
      .from('communities')
      .update(community)
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

  getById: async (id: string) => {
    return await supabase
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();
  },

  list: async () => {
    return await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false });
  },

  getMembers: async (communityId: string) => {
    return await supabase
      .from('community_members')
      .select(`
        id,
        role,
        users (
          id,
          name,
          email
        )
      `)
      .eq('community_id', communityId);
  },

  addMember: async (communityId: string, userId: string, role: string) => {
    return await supabase
      .from('community_members')
      .insert([
        { community_id: communityId, user_id: userId, role }
      ]);
  },

  removeMember: async (communityId: string, userId: string) => {
    return await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);
  }
};

// Serviço de competições
export const competitionService = {
  create: async (competition: Omit<Tables['competitions']['Insert'], 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase
      .from('competitions')
      .insert([competition])
      .select()
      .single();
  },

  update: async (id: string, competition: Partial<Tables['competitions']['Update']>) => {
    return await supabase
      .from('competitions')
      .update(competition)
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

  getById: async (id: string) => {
    return await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single();
  },

  list: async (communityId: string) => {
    return await supabase
      .from('competitions')
      .select('*')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });
  }
};