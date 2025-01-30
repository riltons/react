// Funções de autenticação com Supabase
// TODO: Implementar integração com backend real

import supabaseClient from '../config/supabase';
import type { Database } from '../types/supabase';

type DBUser = Database['public']['Tables']['users']['Row'];

interface AuthResponse {
  data: {
    user: DBUser | null;
    session: any | null;
  } | null;
  error: Error | null;
}

export const getCurrentUser = async (): Promise<{ data: { user: DBUser | null }; error: Error | null }> => {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;

    if (!session?.user) {
      return { data: { user: null }, error: null };
    }

    // Busca os dados completos do usuário no banco
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) throw userError;
    return { data: { user: userData }, error: null };
  } catch (error) {
    return { data: { user: null }, error: error as Error };
  }
};

export const onAuthStateChange = (callback: (event: string, session: any) => void): { data: { subscription: any } } => {
  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(callback);
  return { data: { subscription } };
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;

    // Busca os dados completos do usuário no banco
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;
    return { data: { user: userData, session: data.session }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const register = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    if (error) throw error;

    if (data.user) {
      // Cria o registro do usuário na tabela users
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name: name
        })
        .select()
        .single();

      if (userError) throw userError;
      return { data: { user: userData, session: data.session }, error: null };
    }

    return { data: null, error: new Error('Falha ao criar usuário') };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const logout = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return { session, error: null };
  } catch (error) {
    return { session: null, error: error as Error };
  }
};
