import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, communityService } from '../services/supabaseService';
import type { Database } from '../types/supabase';

type Community = Database['public']['Tables']['communities']['Row'];

interface NewCommunityForm {
  name: string;
  description: string;
}

const Communities: React.FC = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showNewCommunityForm, setShowNewCommunityForm] = useState<boolean>(false);
  const [newCommunity, setNewCommunity] = useState<NewCommunityForm>({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const { data: user } = await authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: communities, error } = await communityService.list();
      if (error) throw error;

      setCommunities(communities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar comunidades');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCommunity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCommunity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Obtendo usuário atual...');
      const { data: { user } } = await authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');
      console.log('Usuário:', user);

      console.log('Criando comunidade...');
      const { data, error } = await communityService.create({
        name: newCommunity.name,
        description: newCommunity.description,
        admin_id: user.id
      });
      console.log('Resposta:', { data, error });

      if (error) throw error;

      setShowNewCommunityForm(false);
      setNewCommunity({ name: '', description: '' });
      await loadCommunities();
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar comunidade');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Minhas Comunidades</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          <button
            onClick={() => setShowNewCommunityForm(!showNewCommunityForm)}
            className="mb-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showNewCommunityForm ? 'Cancelar' : 'Nova Comunidade'}
          </button>

          {showNewCommunityForm && (
            <div className="mb-8 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Criar Nova Comunidade
                </h3>
                <form className="mt-5 space-y-4" onSubmit={handleCreateCommunity}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={newCommunity.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      required
                      value={newCommunity.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Criando...' : 'Criar Comunidade'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {communities.map((community) => (
                <li key={community.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {community.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{community.description}</p>
                  </div>
                </li>
              ))}
              {communities.length === 0 && (
                <li>
                  <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    Nenhuma comunidade encontrada
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Communities;