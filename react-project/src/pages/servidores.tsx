import React from 'react';
import { Layout } from '../components/templates/Layout';
import { Servidores } from '../components/pages/Servidores';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { MenuItem } from '../services/types/auth.types';

export default function ServidoresPage() {
  const navigate = useNavigate();

  // Obtener información del usuario actual
  const currentUser = authService.getCurrentUser();
  const userDisplayInfo = authService.getCurrentUserDisplayInfo();

  const handleSidebarItemClick = (item: MenuItem) => {
    
    // Navegar basado en la ruta del MenuItem
    if (item.ruta === '/home' || item.ruta === '/app') {
      navigate('/app');
    } else if (item.ruta === '/login') {
      navigate('/login');
    } else if (item.ruta === '/servidores') {
      // Ya estamos en servidores, no hacer nada
      return;
    } else {
      // Para otras rutas, ir a /app y que maneje internamente
      navigate('/app');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      navigate('/login');
    }
  };

  return (
    <Layout
      showHeader={true}
      user={{
        name: userDisplayInfo?.fullName || userDisplayInfo?.name || 'Usuario',
        avatar: userDisplayInfo?.photoUrl || null,
        email: currentUser?.nombreUsuario || 'usuario@company.com'
      }}
      onSidebarItemClick={handleSidebarItemClick}
      onLogout={handleLogout}
      isMobileSidebarOpen={false}
      setIsMobileSidebarOpen={() => {}}
    >
      <Servidores />
    </Layout>
  );
}