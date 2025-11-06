import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AlertProvider, AlertService } from '../../components/ui/alerts';

// Componente para demostrar las alertas
const AlertDemo = () => {
  const handleSuccess = () => {
    AlertService.success('¡Operación completada exitosamente!', {
      title: 'Éxito',
      duration: 5000
    });
  };

  const handleError = () => {
    AlertService.error('Ha ocurrido un error inesperado. Intenta nuevamente.', {
      title: 'Error Crítico',
      duration: 5000
    });
  };

  const handleInfo = () => {
    AlertService.info('Tienes 3 notificaciones pendientes por revisar.', {
      title: 'Información',
      duration: 5000
    });
  };

  const handleWarning = () => {
    AlertService.warning('Tu sesión expirará en 5 minutos. ¿Deseas renovarla?', {
      title: 'Advertencia',
      duration: 5000
    });
  };

  const handleDecision = () => {
    AlertService.decision('¿Estás seguro de que deseas eliminar este elemento?', {
      title: 'Confirmar Acción',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        AlertService.success('Elemento eliminado correctamente');
      },
      onCancel: () => {
        AlertService.info('Operación cancelada');
      }
    });
  };

  const handleLoading = () => {
    const loadingId = AlertService.loading('Procesando información...');
    
    // Simular operación async
    setTimeout(() => {
      const success = Math.random() > 0.5;
      if (success) {
        AlertService.updateLoading(loadingId, 'success', '¡Datos procesados exitosamente!');
      } else {
        AlertService.updateLoading(loadingId, 'error', 'Error al procesar los datos');
      }
    }, 3000);
  };

  const handleAsyncConfirm = async () => {
    const confirmed = await AlertService.confirm('¿Continuar con el proceso de sincronización?', {
      title: 'Confirmar Sincronización',
      confirmText: 'Continuar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      AlertService.success('Sincronización iniciada correctamente');
    } else {
      AlertService.warning('Sincronización cancelada por el usuario');
    }
  };

  const handlePersistent = () => {
    AlertService.info('Esta alerta permanecerá hasta que la cierres manualmente.', {
      title: 'Alerta Persistente',
      persistent: true
    });
  };

  const handleDismissAll = () => {
    AlertService.dismissAll();
  };

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      color: '#1f2937'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '2rem',
          color: '#1f2937'
        }}>
          Sistema de Alertas - Tema Claro
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={handleSuccess}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Mostrar Éxito
          </button>

          <button
            onClick={handleError}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Mostrar Error
          </button>

          <button
            onClick={handleInfo}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Mostrar Info
          </button>

          <button
            onClick={handleWarning}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Mostrar Advertencia
          </button>

          <button
            onClick={handleDecision}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Mostrar Decisión
          </button>

          <button
            onClick={handleLoading}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Mostrar Carga
          </button>

          <button
            onClick={handleAsyncConfirm}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#EC4899',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Confirmar Async
          </button>

          <button
            onClick={handlePersistent}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#0891B2',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Alerta Persistente
          </button>

          <button
            onClick={handleDismissAll}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#4B5563',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Cerrar Todas
          </button>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Características del Sistema de Alertas
          </h2>
          <ul style={{ 
            listStyle: 'disc', 
            paddingLeft: '1.5rem',
            color: '#4b5563',
            lineHeight: '1.6'
          }}>
            <li>5 tipos de alertas: success, error, info, warning, decision</li>
            <li>Soporte completo para temas light y dark</li>
            <li>Alertas con botones de confirmación y cancelación</li>
            <li>Alertas de carga con actualización automática</li>
            <li>Promesas de confirmación para operaciones async</li>
            <li>Alertas persistentes (no se auto-ocultan)</li>
            <li>Configuración global personalizable</li>
            <li>Animaciones suaves con Headless UI</li>
            <li>Iconos Heroicons adaptativos al tema</li>
            <li>Posicionamiento configurable</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof AlertDemo> = {
  title: 'Light Theme/Alerts',
  component: AlertDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sistema completo de alertas con React Hot Toast + Headless UI para tema claro. Incluye todos los tipos de alertas con diseño moderno y profesional.'
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="light">
        <AlertProvider>
          <Story />
        </AlertProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlertDemo>;

export const Default: Story = {};