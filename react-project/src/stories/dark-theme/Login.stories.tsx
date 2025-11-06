import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { Input } from "../../components/ui/input";
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

// Login Component específico para Dark Theme
const DarkThemeLogin = ({ onSubmit }: { onSubmit: (credentials: { username: string; password: string }) => void }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  // Colores forzados para Dark Theme
  const darkColors = {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F3F4F8',
    primary: '#F3F4F8',
    border: '#334155'
  };

  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      backgroundColor: darkColors.background
    }}>
      <div style={{
        boxSizing: 'border-box',
        width: '420px',
        height: '480px',
        backgroundColor: darkColors.surface,
        borderColor: darkColors.border,
        color: darkColors.text,
        boxShadow: '2px 2px 2px 0.5px rgba(0, 0, 0, 0.25)',
        borderRadius: '8px',
        borderWidth: '0.5px',
        borderStyle: 'solid',
        padding: '48px 40px 40px 40px',
        display: 'flex',
        flexDirection: 'column'
      }}>

        <h1 style={{
          fontSize: '26px',
          fontWeight: '600',
          textAlign: 'center',
          color: darkColors.text,
          margin: '0 0 40px 0',
          lineHeight: '1.2',
          flexShrink: 0
        }}>
          Inicia sesión
        </h1>
        
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          paddingTop: '0px',
          paddingBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            flexShrink: 0
          }}>
            <Input
              label="Usuario"
              icon="User"
              type="text"
              placeholder="Ingrese su usuario"
              requiredText={true}
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            />

            <Input
              label="Contraseña"
              icon="Lock"
              type="password"
              placeholder="Ingrese su contraseña"
              requiredText={true}
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <a 
            href="#" 
            style={{
              fontSize: '14px',
              color: darkColors.primary,
              textDecoration: 'none',
              textAlign: 'left',
              margin: 0,
              flexShrink: 0,
              alignSelf: 'flex-start',
              transition: 'opacity 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            ¿Olvidaste tu contraseña?
          </a>

          <div style={{ flexShrink: 0, margin: 0 }}>
            <DarkThemeButton 
              type="submit"
              onClick={() => {}}
            >
              Ingresar
            </DarkThemeButton>
          </div>
        </form>
      </div>
    </div>
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
          
          {/* Sección de Login */}
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
              Formulario de Login
            </h2>
            
            <DarkThemeLogin 
              onSubmit={(credentials) => {
                action('dark-login-submit')(credentials);
              }} 
            />

          </section>
        </div>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta<typeof DarkThemeApp> = {
  title: "Dark Theme/Login",
  component: DarkThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componente de login para el tema oscuro del sistema de gestión de procesos."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginShowcase: Story = {
  name: "Formulario de Login",
  parameters: {
    docs: {
      description: {
        story: "Muestra el formulario de login completo en el tema oscuro."
      }
    }
  }
};