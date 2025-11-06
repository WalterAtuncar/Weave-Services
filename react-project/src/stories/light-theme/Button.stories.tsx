import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { Button } from "../../components/ui/button";
import { action } from "@storybook/addon-actions";
import * as LucideIcons from "lucide-react";

// Botón específico para Light Theme
const LightThemeButton = ({ children, onClick, type = "button" }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  type?: "button" | "submit" 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        width: '100%',
        maxWidth: '340px',
        height: '44px',
        margin: '0 auto',
        backgroundColor: '#414976', // Fondo oscuro para light theme
        color: '#FFFFFF', // Texto blanco
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: `
          0px 0px 2px rgba(39, 13, 105, 0.2),
          inset 0px 4px 4px rgba(255, 255, 255, 0.25),
          inset 0px -2px 2px rgba(22, 24, 39, 0.8),
          inset 0px 0.5px 1px 2px rgba(60, 53, 94, 0.25)
        `
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#1a1d2e';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#414976';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = '#0f1419';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = '#1a1d2e';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
    >
      <LucideIcons.LogIn className="h-4 w-4" />
      {children}
    </button>
  );
};

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
          
          {/* Sección de Botones */}
          <section style={{ 
            width: '100%', 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px',
              textAlign: 'center',
              color: '#414976'
            }}>
              Botones
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Default</h3>
                <Button 
                  variant="default" 
                  size="m"
                  onClick={action("light-button-default")}
                >
                  Botón Default
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Con Icono</h3>
                <Button 
                  variant="default" 
                  size="m"
                  iconName="Plus"
                  onClick={action("light-button-icon")}
                >
                  Agregar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Outline</h3>
                <Button 
                  variant="outline" 
                  size="m"
                  iconName="Edit"
                  onClick={action("light-button-outline")}
                >
                  Editar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Success</h3>
                <Button 
                  backgroundColor="#10B981" 
                  textColor="#FFFFFF" 
                  size="m"
                  iconName="Check"
                  onClick={action("light-button-success")}
                >
                  Confirmar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Danger</h3>
                <Button 
                  backgroundColor="#EF4444" 
                  textColor="#FFFFFF" 
                  size="m"
                  iconName="Trash2"
                  onClick={action("light-button-danger")}
                >
                  Eliminar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Small</h3>
                <Button 
                  variant="default" 
                  size="s"
                  iconName="Settings"
                  onClick={action("light-button-small")}
                >
                  Config
                </Button>
              </div>

            </div>

            {/* Botón personalizado de login */}
            <div style={{ 
              marginTop: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#414976' }}>
                Botón de Login Personalizado
              </h3>
              <LightThemeButton onClick={action("light-custom-login")}>
                Iniciar Sesión
              </LightThemeButton>
            </div>

          </section>
        </div>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta<typeof LightThemeApp> = {
  title: "Light Theme/Button",
  component: LightThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componentes de botón para el tema claro del sistema de gestión de procesos."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonShowcase: Story = {
  name: "Showcase de Botones",
  parameters: {
    docs: {
      description: {
        story: "Muestra todos los tipos de botones disponibles en el tema claro."
      }
    }
  }
}; 