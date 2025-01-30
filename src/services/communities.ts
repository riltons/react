import supabaseClient from '../config/supabase';
import type { Database } from '../types/supabase';

type Community = Database['public']['Tables']['communities']['Row'];

export const createCommunity = async (
  name: string,
  adminId: string,
  description: string = ''
): Promise<Community> => {
  try {
    const { data, error } = await supabaseClient
      .from('communities')
      .insert({
        name,
        description,
        admin_id: adminId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar comunidade:', error);
    throw error;
  }
};

export const listCommunities = async (): Promise<Community[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('communities')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao listar comunidades:', error);
    throw error;
  }
};

export const getCommunity = async (id: string): Promise<Community> => {
  try {
    const { data, error } = await supabaseClient
      .from('communities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar comunidade:', error);
    throw error;
  }
};

export const updateCommunity = async (
  id: string,
  updates: Partial<Community>
): Promise<Community> => {
  try {
    const { data, error } = await supabaseClient
      .from('communities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar comunidade:', error);
    throw error;
  }
};

export const deleteCommunity = async (id: string): Promise<void> => {
  try {
    const { error } = await supabaseClient
      .from('communities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar comunidade:', error);
    throw error;
  }
};
