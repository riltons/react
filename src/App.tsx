import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Communities from './pages/Communities';
import Players from './pages/Players';
import CommunityDetails from './pages/CommunityDetails';
import { authService } from './services/supabaseService';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: currentUser } } = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Inscreve-se para mudanças no estado de autenticação
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" /> : <Login />} 
      />
      <Route 
        path="/players" 
        element={user ? <Players /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/communities" 
        element={user ? <Communities /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/communities/:id" 
        element={user ? <CommunityDetails /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={<Navigate to="/communities" replace />} 
      />
    </Routes>
  );
};

export default App;