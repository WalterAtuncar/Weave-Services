import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectWrapper,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "../../components/ui/select";
import { action } from "@storybook/addon-actions";

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
          
          {/* Sección de Selects */}
          <section style={{ 
            width: '100%', 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px',
              textAlign: 'center',
              color: '#414976'
            }}>
              Componentes Select
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px',
              marginBottom: '24px'
            }}>
              
              {/* Select Básico */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748B' }}>Select Básico</h3>
                <Select onValueChange={action("select-basic-change")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Opción 1</SelectItem>
                    <SelectItem value="option2">Opción 2</SelectItem>
                    <SelectItem value="option3">Opción 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select con Label */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748B' }}>Con Label</h3>
                <SelectWrapper
                  label="Estado del Proceso"
                  placeholder="Selecciona el estado"
                  onValueChange={action("select-label-change")}
                >
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </SelectWrapper>
              </div>

              {/* Select con Icono */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748B' }}>Con Icono</h3>
                <SelectWrapper
                  label="Departamento"
                  icon="Building2"
                  placeholder="Selecciona departamento"
                  onValueChange={action("select-icon-change")}
                >
                  <SelectContent>
                    <SelectItem value="hr">Recursos Humanos</SelectItem>
                    <SelectItem value="it">Tecnología</SelectItem>
                    <SelectItem value="finance">Finanzas</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </SelectWrapper>
              </div>

              {/* Select Requerido */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748B' }}>Campo Requerido</h3>
                <SelectWrapper
                  label="Prioridad"
                  icon="AlertTriangle"
                  requiredText={true}
                  placeholder="Selecciona prioridad"
                  onValueChange={action("select-required-change")}
                >
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </SelectWrapper>
              </div>

              {/* Select Deshabilitado */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748B' }}>Deshabilitado</h3>
                <SelectWrapper
                  label="Estado (Solo lectura)"
                  icon="Lock"
                  disabled={true}
                  value="readonly"
                  onValueChange={action("select-disabled-change")}
                >
                  <SelectContent>
                    <SelectItem value="readonly">Solo lectura</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                  </SelectContent>
                </SelectWrapper>
              </div>

              {/* Select con Grupos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748B' }}>Con Grupos</h3>
                <SelectWrapper
                  label="Usuario Asignado"
                  icon="Users"
                  placeholder="Selecciona usuario"
                  onValueChange={action("select-groups-change")}
                >
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Administradores</SelectLabel>
                      <SelectItem value="admin1">Juan Pérez (Admin)</SelectItem>
                      <SelectItem value="admin2">María García (Admin)</SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Usuarios</SelectLabel>
                      <SelectItem value="user1">Carlos López</SelectItem>
                      <SelectItem value="user2">Ana Martínez</SelectItem>
                      <SelectItem value="user3">Luis Rodríguez</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </SelectWrapper>
              </div>
              
            </div>

            {/* Ejemplo Completo */}
            <div style={{ 
              marginTop: '32px',
              padding: '20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#414976'
              }}>
                Formulario de Proceso
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px'
              }}>
                <SelectWrapper
                  label="Tipo de Proceso"
                  icon="FileText"
                  requiredText={true}
                  placeholder="Selecciona tipo"
                  onValueChange={action("form-process-type")}
                >
                  <SelectContent>
                    <SelectItem value="approval">Aprobación</SelectItem>
                    <SelectItem value="review">Revisión</SelectItem>
                    <SelectItem value="validation">Validación</SelectItem>
                  </SelectContent>
                </SelectWrapper>

                <SelectWrapper
                  label="Responsable"
                  icon="User"
                  requiredText={true}
                  placeholder="Asignar responsable"
                  onValueChange={action("form-responsible")}
                >
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Gerentes</SelectLabel>
                      <SelectItem value="manager1">Erick Machuca</SelectItem>
                      <SelectItem value="manager2">Laura Sánchez</SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Supervisores</SelectLabel>
                      <SelectItem value="super1">Pedro Ramírez</SelectItem>
                      <SelectItem value="super2">Sofia Herrera</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </SelectWrapper>

                <SelectWrapper
                  label="Urgencia"
                  icon="Clock"
                  placeholder="Nivel de urgencia"
                  onValueChange={action("form-urgency")}
                >
                  <SelectContent>
                    <SelectItem value="low">🟢 Baja</SelectItem>
                    <SelectItem value="medium">🟡 Media</SelectItem>
                    <SelectItem value="high">🟠 Alta</SelectItem>
                    <SelectItem value="critical">🔴 Crítica</SelectItem>
                  </SelectContent>
                </SelectWrapper>
              </div>
            </div>
            
          </section>
        </div>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta<typeof LightThemeApp> = {
  title: "Light Theme/Select",
  component: LightThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componente Select con múltiples variantes para formularios del sistema de gestión de procesos en tema claro. Incluye validación, iconos, grupos y estados."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => <LightThemeApp />,
  name: "Todas las Variantes",
  parameters: {
    docs: {
      description: {
        story: "Muestra todas las variantes del componente Select: básico, con label, con icono, requerido, deshabilitado, con grupos y ejemplo de formulario completo en tema claro."
      }
    }
  }
}; 