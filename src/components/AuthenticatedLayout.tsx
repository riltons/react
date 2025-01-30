import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/supabaseService';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { Toaster } from "../components/ui/toaster";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await authService.getCurrentUser();
    if (!user) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
      <Header />
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
      <Toaster />
      <BottomNavigation />
    </div>
  );
};

export default AuthenticatedLayout;
