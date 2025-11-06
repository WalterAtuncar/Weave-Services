import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // 🔧 FIX: Configuración global consistente con AlertService
          className: '',
          duration: 5000, // 🔧 FIX: 5 segundos por defecto
          style: {
            background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            color: theme === 'dark' ? '#F9FAFB' : '#1F2937',
            borderRadius: '0.5rem',
            boxShadow: theme === 'dark' 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          // 🔧 FIX: Estilos específicos por tipo - todos 5 segundos
          success: {
            duration: 5000, // 🔧 FIX: 5 segundos
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            duration: 5000, // 🔧 FIX: 5 segundos
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
          warning: {
            duration: 5000, // 🔧 FIX: 5 segundos
            iconTheme: {
              primary: '#F59E0B',
              secondary: '#FFFFFF',
            },
          },
          info: {
            duration: 5000, // 🔧 FIX: 5 segundos
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#FFFFFF',
            },
          },
          loading: {
            duration: 5000, // 🔧 FIX: 5 segundos para loading
            iconTheme: {
              primary: theme === 'dark' ? '#F9FAFB' : '#1F2937',
              secondary: theme === 'dark' ? '#1F2937' : '#F9FAFB',
            },
          },
        }}
      />
    </>
  );
}; 