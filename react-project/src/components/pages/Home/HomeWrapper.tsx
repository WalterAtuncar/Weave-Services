import React from 'react';
import { Home, HomeProps } from './Home';
import { HomeAdmin, HomeAdminProps } from './HomeAdmin';
import { HomeData, HomeAdminData } from '../../../models/Home';

export interface HomeWrapperProps {
  userProfile: number; // 1 = Super Admin, otros = Usuario institucional
  homeData?: HomeData; // Datos para usuario institucional
  homeAdminData?: HomeAdminData; // Datos para super admin
  onMenuToggle?: () => void;
  onNavigate?: (page: string) => void;
}

/**
 * Componente wrapper que decide qué tipo de dashboard mostrar
 * según el perfil del usuario:
 * 
 * - Perfil 1: HomeAdmin (Super Admin) - Dashboard administrativo
 * - Otros perfiles: Home (Usuario institucional) - Dashboard operativo
 */
export const HomeWrapper: React.FC<HomeWrapperProps> = ({
  userProfile,
  homeData,
  homeAdminData,
  onMenuToggle,
  onNavigate
}) => {
  // Si es perfil 1 (Super Admin), mostrar HomeAdmin
  if (userProfile === 1) {
    if (!homeAdminData) {
      console.warn('HomeWrapper: homeAdminData es requerido para perfil Super Admin');
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          color: '#6B7280'
        }}>
          <h2>Error: Datos del Super Admin no disponibles</h2>
          <p>No se pudieron cargar los datos del dashboard administrativo.</p>
        </div>
      );
    }

    return (
      <HomeAdmin 
        data={homeAdminData} 
        onMenuToggle={onMenuToggle}
        onNavigate={onNavigate}
      />
    );
  }

  // Para cualquier otro perfil, mostrar Home institucional
  if (!homeData) {
    console.warn('HomeWrapper: homeData es requerido para usuario institucional');
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#6B7280'
      }}>
        <h2>Error: Datos del usuario no disponibles</h2>
        <p>No se pudieron cargar los datos del dashboard.</p>
      </div>
    );
  }

  return (
    <Home 
      data={homeData} 
      onMenuToggle={onMenuToggle}
    />
  );
};

// Función helper para determinar qué tipo de dashboard mostrar
export const shouldShowAdminDashboard = (userProfile: number): boolean => {
  return userProfile === 1;
};

// Función helper para obtener el título del dashboard según el perfil
export const getDashboardTitle = (userProfile: number): string => {
  return userProfile === 1 ? 'Panel de Administración' : 'Dashboard';
};

// Función helper para obtener la descripción del dashboard según el perfil
export const getDashboardDescription = (userProfile: number): string => {
  return userProfile === 1 
    ? 'Gestión administrativa del sistema completo'
    : 'Dashboard operativo de la organización';
}; 