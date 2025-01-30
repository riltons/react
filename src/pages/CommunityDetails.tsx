import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communityService } from '../services/communityService';
import { communityMemberService } from '../services/communityMemberService';
import { competitionService } from '../services/competitionService';
import type { Database } from '../types/supabase';
import AuthenticatedLayout from '../components/AuthenticatedLayout';

type Tables = Database['public']['Tables'];
type Community = Tables['communities']['Row'];
type User = Tables['users']['Row'];
type Competition = Tables['competitions']['Row'];
type CommunityMember = {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  user?: User;
};

const CommunityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showAddCompetitionForm, setShowAddCompetitionForm] = useState(false);
  const [newCompetition, setNewCompetition] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('player');

  const filteredPlayers = availablePlayers.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!id) return;
    loadCommunityData();
  }, [id]);

  const loadCommunityData = async () => {
    if (!id) {
      setError('ID da comunidade não fornecido');
      setLoading(false);
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Carrega os dados da comunidade
      console.log('Carregando dados da comunidade:', id);
      const { data: communityData, error: communityError } = await communityService.getById(id);

      if (communityError) {
        console.error('Erro ao carregar comunidade:', communityError);
        throw communityError;
      }

      if (!communityData) {
        throw new Error('Comunidade não encontrada');
      }

      setCommunity(communityData);

      // Carrega os membros
      console.log('Carregando membros da comunidade');
      const { data: membersData, error: membersError } = await communityMemberService.listMembers(id);

      if (membersError) {
        console.error('Erro ao carregar membros:', membersError);
        throw membersError;
      }

      setMembers(membersData || []);

      // Carrega as competições
      console.log('Carregando competições');
      const { data: competitionsData, error: competitionsError } = await competitionService.listByCommunity(id);

      if (competitionsError) {
        console.error('Erro ao carregar competições:', competitionsError);
        throw competitionsError;
      }

      setCompetitions(competitionsData || []);

      // Carrega jogadores disponíveis
      const { data: playersData, error: playersError } = await communityMemberService.listAvailablePlayers(id);

      if (playersError) {
        console.error('Erro ao carregar jogadores:', playersError);
        throw playersError;
      }

      setAvailablePlayers(playersData || []);
      setLoading(false);
    } catch (err) {
      console.error('Erro completo:', err);
      setError('Erro ao carregar dados da comunidade');
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!id) {
      setError('ID da comunidade não fornecido');
      return;
    }

    setError('');

    try {
      const { error } = await communityMemberService.addMember(id, userId, selectedRole);
      if (error) throw error;
      await loadCommunityData();
      setShowAddMemberForm(false);
    } catch (err) {
      console.error('Erro ao adicionar membro:', err);
      setError('Erro ao adicionar membro');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) {
      setError('ID da comunidade não fornecido');
      return;
    }

    setError('');

    try {
      const { error } = await communityMemberService.removeMember(id, userId);
      if (error) throw error;
      await loadCommunityData();
    } catch (err) {
      console.error('Erro ao remover membro:', err);
      setError('Erro ao remover membro');
    }
  };

  const handleAddCompetition = async () => {
    if (!id) {
      setError('ID da comunidade não fornecido');
      return;
    }

    setError('');

    try {
      const { error } = await competitionService.create({
        name: newCompetition.name,
        description: newCompetition.description,
        startDate: newCompetition.startDate,
        endDate: newCompetition.endDate,
        communityId: id
      });

      if (error) throw error;

      await loadCommunityData();
      setShowAddCompetitionForm(false);
      setNewCompetition({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
      });
    } catch (err) {
      console.error('Erro ao criar competição:', err);
      setError('Erro ao criar competição');
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="py-6 flex flex-col justify-center sm:py-12">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="text-center">
              Carregando...
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="py-6 flex flex-col justify-center sm:py-12">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="text-center text-red-600">
              {error}
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!community) {
    return (
      <AuthenticatedLayout>
        <div className="py-6 flex flex-col justify-center sm:py-12">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="text-center text-red-600">
              Comunidade não encontrada
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      {/* Hero Section */}
      <div className="bg-indigo-600 pb-32">
        <div className="py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <button
              onClick={() => navigate('/communities')}
              className="mr-4 inline-flex items-center p-2 rounded-full bg-indigo-700 text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">
              {community.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="-mt-32">
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            
            {/* Membros */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Membros</h2>
                <button
                  onClick={() => setShowAddMemberForm(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Adicionar
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm flex items-center space-x-3 hover:border-gray-400">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.user?.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate capitalize">
                        {member.role}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Competições */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Competições</h2>
                <button
                  onClick={() => setShowAddCompetitionForm(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Nova Competição
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitions.map((competition) => (
                  <div key={competition.id} className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm hover:border-gray-400">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {competition.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {competition.description}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Início: {competition.start_date ? new Date(competition.start_date).toLocaleDateString() : 'Não definido'}</span>
                        <span>Fim: {competition.end_date ? new Date(competition.end_date).toLocaleDateString() : 'Não definido'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Adicionar Membro */}
      {showAddMemberForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Adicionar Membro
                </h3>

                {/* Barra de Pesquisa */}
                <div className="mb-4">
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Buscar jogador..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Lista de Jogadores */}
                <div className="mt-2 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {filteredPlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayerId(selectedPlayerId === player.id ? '' : player.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg border ${
                          selectedPlayerId === player.id
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {player.name}
                            </p>
                            {player.nickname && (
                              <p className="text-sm text-gray-500">
                                {player.nickname}
                              </p>
                            )}
                          </div>
                          {selectedPlayerId === player.id && (
                            <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seleção de Função */}
                {selectedPlayerId && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Função do Membro
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('player')}
                        className={`${
                          selectedRole === 'player'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        Jogador
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('admin')}
                        className={`${
                          selectedRole === 'admin'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        Administrador
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:col-start-2 sm:text-sm ${
                    selectedPlayerId
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (selectedPlayerId) {
                      handleAddMember(selectedPlayerId);
                      setSelectedPlayerId('');
                      setSearchTerm('');
                      setSelectedRole('player');
                    }
                  }}
                  disabled={!selectedPlayerId}
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setShowAddMemberForm(false);
                    setSelectedPlayerId('');
                    setSearchTerm('');
                    setSelectedRole('player');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Competição */}
      {showAddCompetitionForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Nova Competição
                </h3>
                <div className="mt-2 space-y-4">
                  <input
                    type="text"
                    placeholder="Nome da competição"
                    className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                    value={newCompetition.name}
                    onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                  />
                  <textarea
                    placeholder="Descrição"
                    rows={3}
                    className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                    value={newCompetition.description}
                    onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                        value={newCompetition.startDate}
                        onChange={(e) => setNewCompetition({ ...newCompetition, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Data de Fim
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                        value={newCompetition.endDate}
                        onChange={(e) => setNewCompetition({ ...newCompetition, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={handleAddCompetition}
                >
                  Criar
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowAddCompetitionForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
};

export default CommunityDetails;
