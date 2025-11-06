import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { Input } from "../../components/ui/input";
import { action } from "@storybook/addon-actions";

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
          
          {/* Sección de Inputs */}
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
              Inputs
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              marginBottom: '24px'
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#F3F4F8' }}>Básicos</h3>
                <Input 
                  label="Nombre completo"
                  type="text"
                  placeholder="Ingrese su nombre completo"
                  icon="User"
                  requiredText={true}
                />
                <Input 
                  label="Email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  icon="Mail"
                  requiredText={true}
                />
                <Input 
                  label="Teléfono"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  icon="Phone"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#F3F4F8' }}>Seguridad</h3>
                <Input 
                  label="Contraseña"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  icon="Lock"
                  requiredText={true}
                />
                <Input 
                  label="Confirmar contraseña"
                  type="password"
                  placeholder="Confirme su contraseña"
                  icon="Lock"
                  requiredText={true}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#F3F4F8' }}>Números y Fechas</h3>
                <Input 
                  label="Edad"
                  type="number"
                  placeholder="25"
                  icon="Calendar"
                  min={18}
                  max={120}
                />
                <Input 
                  label="Fecha de nacimiento"
                  type="date"
                  icon="Calendar"
                />
                <Input 
                  label="Salario"
                  type="number"
                  placeholder="50000"
                  icon="DollarSign"
                  min={0}
                  step={1000}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#F3F4F8' }}>Búsqueda y URLs</h3>
                <Input 
                  label="Buscar"
                  type="search"
                  placeholder="Buscar documentos..."
                  icon="Search"
                />
                <Input 
                  label="Sitio web"
                  type="url"
                  placeholder="https://ejemplo.com"
                  icon="Globe"
                />
                <Input 
                  label="Color favorito"
                  type="color"
                  icon="Palette"
                />
              </div>

            </div>

            {/* Sección de estados especiales */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#F3F4F8', marginBottom: '16px' }}>
                Estados Especiales
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px'
              }}>
                
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8', marginBottom: '8px' }}>
                    Con valor pre-cargado
                  </h4>
                  <Input 
                    label="Usuario"
                    type="text"
                    placeholder="Ingrese su usuario"
                    icon="User"
                    value="admin"
                    requiredText={true}
                  />
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8', marginBottom: '8px' }}>
                    Sin icono
                  </h4>
                  <Input 
                    label="Descripción"
                    type="text"
                    placeholder="Ingrese una descripción"
                  />
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8', marginBottom: '8px' }}>
                    Con validación
                  </h4>
                  <Input 
                    label="Código postal"
                    type="text"
                    placeholder="12345"
                    icon="MapPin"
                    pattern="[0-9]{5}"
                    requiredText={true}
                  />
                </div>

              </div>
            </div>

          </section>
        </div>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta<typeof DarkThemeApp> = {
  title: "Dark Theme/Input",
  component: DarkThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componentes de input para el tema oscuro del sistema de gestión de procesos."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InputShowcase: Story = {
  name: "Showcase de Inputs",
  parameters: {
    docs: {
      description: {
        story: "Muestra todos los tipos de inputs disponibles en el tema oscuro."
      }
    }
  }
}; 