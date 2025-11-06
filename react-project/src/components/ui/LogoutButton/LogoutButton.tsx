import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/auth.service';
import './LogoutButton.css';

export const LogoutButton: React.FC = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
  
      
      // Ejecutar logout del servicio
      await authService.logout();
      

      
      // 🔀 REDIRECCIÓN: Navegar al login después del logout exitoso
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('❌ [LOGOUT] Error durante logout:', error);
      
      // En caso de error, limpiar sesión localmente y redirigir
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="logout-button"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: '#dc3545' // Color rojo para logout
      }}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
    >
      <LogOut size={20} />
    </button>
  );
};