import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { Button } from "../../components/ui/button";
import { action } from "@storybook/addon-actions";
import * as LucideIcons from "lucide-react";

// Botón específico para Dark Theme
const DarkThemeButton = ({ children, onClick, type = "button" }: { 
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
        backgroundColor: '#F3F4F8', // Fondo claro para dark theme
        color: '#0F172A', // Texto oscuro
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
          0px 0px 2px rgba(243, 244, 248, 0.2),
          inset 0px 4px 4px rgba(255, 255, 255, 0.3),
          inset 0px -2px 2px rgba(243, 244, 248, 0.8),
          inset 0px 0.5px 1px 2px rgba(243, 244, 248, 0.15)
        `
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#E5E7EB';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#F3F4F8';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = '#D1D5DB';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = '#E5E7EB';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
    >
      <LucideIcons.LogIn className="h-4 w-4" style={{ color: '#0F172A' }} />
      {children}
    </button>
  );
};

// Componente wrapper que simula la aplicación principal con Dark Theme
const DarkThemeApp = () => {
  const [mounted, setMounted] = useState(false);

  // Forzar Dark Theme de manera más robusta
  useEffect(() => {
    // Limpiar cualquier tema previo
    localStorage.removeItem('theme');
    document.body.className = '';
    
    // Aplicar clases específicas para dark theme
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-background', 'text-foreground');
    
    // Establecer en localStorage para garantizar persistencia
    localStorage.setItem('theme', 'dark');
    
    // Aplicar estilos directos para mayor garantía
    document.body.style.backgroundColor = '#0F172A';
    document.body.style.color = '#F3F4F8';
    
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0F172A',
        color: '#F3F4F8',
        padding: '20px',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          textAlign: 'center', 
          marginBottom: '40px',
          color: '#F3F4F8'
        }}>
          Sistema de Gestión de Procesos - Dark Theme
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
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            border: '1px solid #334155'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px',
              textAlign: 'center',
              color: '#F3F4F8'
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
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Default</h3>
                <Button 
                  variant="default" 
                  size="m"
                  onClick={action("dark-button-default")}
                >
                  Botón Default
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Con Icono</h3>
                <Button 
                  variant="default" 
                  size="m"
                  iconName="Plus"
                  onClick={action("dark-button-icon")}
                >
                  Agregar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Outline</h3>
                <Button 
                  variant="outline" 
                  size="m"
                  iconName="Edit"
                  onClick={action("dark-button-outline")}
                >
                  Editar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Success</h3>
                <Button 
                  backgroundColor="#10B981" 
                  textColor="#FFFFFF" 
                  size="m"
                  iconName="Check"
                  onClick={action("dark-button-success")}
                >
                  Confirmar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Danger</h3>
                <Button 
                  backgroundColor="#EF4444" 
                  textColor="#FFFFFF" 
                  size="m"
                  iconName="Trash2"
                  onClick={action("dark-button-danger")}
                >
                  Eliminar
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>Small</h3>
                <Button 
                  variant="default" 
                  size="s"
                  iconName="Settings"
                  onClick={action("dark-button-small")}
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
              <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#F3F4F8' }}>
                Botón de Login Personalizado
              </h3>
              <DarkThemeButton onClick={action("dark-custom-login")}>
                Iniciar Sesión
              </DarkThemeButton>
            </div>

          </section>
        </div>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta<typeof DarkThemeApp> = {
  title: "Dark Theme/Button",
  component: DarkThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componentes de botón para el tema oscuro del sistema de gestión de procesos."
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
        story: "Muestra todos los tipos de botones disponibles en el tema oscuro."
      }
    }
  }
}; 