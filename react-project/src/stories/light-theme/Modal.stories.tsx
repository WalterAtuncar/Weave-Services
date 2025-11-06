import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button/button';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { action } from '@storybook/addon-actions';

// Componente wrapper que simula la aplicación principal con Light Theme
const LightThemeApp = () => {
  const [mounted, setMounted] = useState(false);

  // Forzar Light Theme de manera más robusta
  useEffect(() => {
    // Limpiar cualquier tema previo
    localStorage.removeItem('theme');
    document.body.className = '';
    
    // Aplicar clases específicas para light theme
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.add('bg-background', 'text-foreground');
    
    // Establecer en localStorage para garantizar persistencia
    localStorage.setItem('theme', 'light');
    
    // Aplicar estilos directos para mayor garantía
    document.body.style.backgroundColor = '#F5F7FA';
    document.body.style.color = '#414976';
    
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F5F7FA',
        color: '#414976',
        padding: '20px',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          textAlign: 'center', 
          marginBottom: '40px',
          color: '#414976'
        }}>
          Sistema de Gestión de Procesos - Light Theme
        </h1>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '20px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          
          {/* Sección de Modales */}
          <section style={{ 
            width: '100%', 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(65, 73, 118, 0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px',
              textAlign: 'center',
              color: '#414976'
            }}>
              Componentes Modal
            </h2>
            
            <LightThemeModalShowcase />

          </section>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Wrapper component para manejar el estado del modal
interface ModalWrapperProps {
  title: string;
  size?: 's' | 'm' | 'l' | 'xl';
  width?: string;
  height?: string;
  children: React.ReactNode;
  saveButtonText?: string;
  cancelButtonText?: string;
  hideFooter?: boolean;
  buttonText: string;
}

const LightModalWrapper: React.FC<ModalWrapperProps> = ({ 
  children, 
  buttonText,
  ...modalProps 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        {buttonText}
      </Button>
      <Modal
        {...modalProps}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={() => {
          action('modal-save')('Guardando desde Light Theme...');
          setIsOpen(false);
        }}
        onCancel={() => {
          action('modal-cancel')('Cancelando desde Light Theme...');
          setIsOpen(false);
        }}
      >
        {children}
      </Modal>
    </>
  );
};

// Showcase de todos los modales
const LightThemeModalShowcase = () => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '16px' 
    }}>
      
      {/* Modal Básico */}
      <LightModalWrapper
        title="Modal Básico"
        size="m"
        buttonText="Modal Básico"
      >
        <div>
          <p>Este es el contenido básico del modal. Aquí puedes agregar cualquier contenido que necesites.</p>
          <p>El modal se adapta automáticamente al contenido y soporta scroll si es necesario.</p>
        </div>
      </LightModalWrapper>

      {/* Modal con Formulario */}
      <LightModalWrapper
        title="Crear Usuario"
        size="m"
        saveButtonText="Crear Usuario"
        buttonText="Modal con Formulario"
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Ingresa el nombre completo"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Rol
            </label>
            <select
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Seleccionar rol...</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
              <option value="editor">Editor</option>
            </select>
          </div>
        </form>
      </LightModalWrapper>

      {/* Modal Pequeño */}
      <LightModalWrapper
        title="Confirmación"
        size="s"
        saveButtonText="Confirmar"
        buttonText="Modal Pequeño"
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500' }}>
            ¿Estás seguro que deseas eliminar este elemento?
          </p>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Esta acción no se puede deshacer.
          </p>
        </div>
      </LightModalWrapper>

      {/* Modal Grande */}
      <LightModalWrapper
        title="Configuración Avanzada"
        size="l"
        saveButtonText="Aplicar Cambios"
        buttonText="Modal Grande"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Configuración General</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Nombre del proyecto
                </label>
                <input
                  type="text"
                  placeholder="Mi Proyecto"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" />
                  <span>Proyecto público</span>
                </label>
              </div>
            </form>
          </div>
          
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Configuración de Seguridad</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Nivel de acceso
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                >
                  <option>Público</option>
                  <option>Privado</option>
                  <option>Restringido</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" />
                  <span>Requiere autenticación</span>
                </label>
              </div>
            </form>
          </div>
        </div>
      </LightModalWrapper>

      {/* Modal Personalizado */}
      <LightModalWrapper
        title="Modal Personalizado"
        width="700px"
        height="500px"
        buttonText="Modal Personalizado"
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          height: '100%'
        }}>
          <p>
            Este modal tiene dimensiones personalizadas: 700px x 500px
          </p>
          
          <div style={{ 
            flex: 1, 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px' 
          }}>
            {[1, 2, 3, 4].map(num => (
              <div 
                key={num}
                style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#f9fafb',
                  textAlign: 'center'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0' }}>Elemento {num}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Contenido de ejemplo
                </p>
              </div>
            ))}
          </div>
        </div>
      </LightModalWrapper>

      {/* Modal con Forced Close */}
      <LightModalWrapper
        title="Modal con Cierre Forzado"
        size="m"
        forcedClose={true}
        buttonText="Modal Forced Close (true)"
      >
        <div>
          <div style={{ 
            background: '#fef3c7', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #f59e0b',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>
              ⚠️ Cierre Forzado Activado
            </h4>
            <p style={{ margin: 0, color: '#92400e' }}>
              Este modal NO se puede cerrar haciendo click fuera. Solo se cierra con el botón X o Cancelar.
            </p>
          </div>
          <p>Intenta hacer click fuera del modal - no se cerrará.</p>
        </div>
      </LightModalWrapper>

      {/* Modal sin Forced Close */}
      <LightModalWrapper
        title="Modal Normal"
        size="m"
        forcedClose={false}
        buttonText="Modal Forced Close (false)"
      >
        <div>
          <div style={{ 
            background: '#dcfce7', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #16a34a',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#15803d' }}>
              ✅ Comportamiento Normal
            </h4>
            <p style={{ margin: 0, color: '#15803d' }}>
              Este modal se puede cerrar haciendo click fuera (comportamiento tradicional).
            </p>
          </div>
          <p>Puedes hacer click fuera del modal para cerrarlo.</p>
        </div>
      </LightModalWrapper>

      {/* Modal sin Footer */}
      <LightModalWrapper
        title="Solo Información"
        size="m"
        hideFooter={true}
        buttonText="Modal sin Footer"
      >
        <div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#059669' }}>
              ¡Proceso Completado!
            </h3>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Tu solicitud ha sido procesada exitosamente.
            </p>
          </div>
          
          <div style={{ 
            background: '#f0f9ff', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#0369a1' }}>
              Detalles del proceso:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
              <li>ID de transacción: #12345</li>
              <li>Fecha: {new Date().toLocaleDateString()}</li>
              <li>Estado: Completado</li>
            </ul>
          </div>
        </div>
      </LightModalWrapper>

    </div>
  );
};

const meta: Meta = {
  title: 'LIGHT THEME/Modal',
  component: LightThemeApp,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Componente modal reutilizable con soporte completo para Light Theme. Incluye header, content, footer y múltiples variaciones de tamaño.'
      }
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story principal con todos los ejemplos
export const AllModals: Story = {
  render: () => <LightThemeApp />
};