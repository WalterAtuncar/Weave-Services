import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { Input } from "../../components/ui/input";
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

// Login Component específico para Light Theme
const LightThemeLogin = ({ onSubmit }: { onSubmit: (credentials: { username: string; password: string }) => void }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  // Colores forzados para Light Theme
  const lightColors = {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#414976',
    primary: '#414976',
    border: '#E5E7EB'
  };

  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      backgroundColor: lightColors.background
    }}>
      <div style={{
        boxSizing: 'border-box',
        width: '420px',
        height: '480px',
        backgroundColor: lightColors.surface,
        borderColor: lightColors.border,
        color: lightColors.text,
        boxShadow: '2px 2px 2px 0.5px rgba(173, 146, 146, 0.15)',
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
          color: lightColors.text,
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
              color: lightColors.primary,
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
            <LightThemeButton 
              type="submit"
              onClick={() => {}}
            >
              Ingresar
            </LightThemeButton>
          </div>
        </form>
      </div>
    </div>
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
          
          {/* Sección de Login */}
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
              Formulario de Login
            </h2>
            
            <LightThemeLogin 
              onSubmit={(credentials) => {
                action('light-login-submit')(credentials);
              }} 
            />

          </section>
        </div>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta<typeof LightThemeApp> = {
  title: "Light Theme/Login",
  component: LightThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componente de login para el tema claro del sistema de gestión de procesos."
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
        story: "Muestra el formulario de login completo en el tema claro."
      }
    }
  }
};