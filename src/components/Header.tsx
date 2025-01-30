import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/supabaseService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState<{ email: string; name?: string } | null>(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await authService.getCurrentUser();
      if (user) {
        const { data } = await authService.getUserProfile(user.id);
        setUser(data || { email: user.email });
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e Nome do App */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="DoMatch"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">DoMatch</span>
            </div>
          </div>

          {/* Menu de Navegação */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a
              href="/communities"
              onClick={(e) => {
                e.preventDefault();
                navigate('/communities');
              }}
              className={`${
                isActive('/communities')
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
            >
              Comunidades
            </a>
            <a
              href="/players"
              onClick={(e) => {
                e.preventDefault();
                navigate('/players');
              }}
              className={`${
                isActive('/players')
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
            >
              Jogadores
            </a>
          </div>

          {/* Usuário e Logout */}
          <div className="flex items-center">
            {user && (
              <span className="text-sm text-gray-700 mr-4">
                {user.name || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
