import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { DatePickerComponent } from "../../components/ui/calendar/DatePickerComponent";
import { action } from "@storybook/addon-actions";

// Componente wrapper que simula la aplicación principal con Dark Theme
const DarkThemeApp = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedRange, setSelectedRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: new Date(),
    to: undefined
  });
  const [selectedMultiple, setSelectedMultiple] = useState<Date[]>([new Date()]);

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
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          
          {/* Sección de Calendarios */}
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
              Componentes Calendar
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '32px',
              marginBottom: '32px'
            }}>
              
              {/* Calendar Básico */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#94A3B8', marginBottom: '8px' }}>
                  Selección Simple
                </h3>
                <div style={{ 
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #334155'
                }}>
                                     <DatePickerComponent
                     mode="single"
                     selected={selectedDate}
                     onSelect={(date: Date | undefined) => {
                       setSelectedDate(date);
                       action("calendar-single-select")(date);
                     }}
                   />
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                  Fecha seleccionada: {selectedDate?.toLocaleDateString() || 'Ninguna'}
                </p>
              </div>

              {/* Calendar Rango */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#94A3B8', marginBottom: '8px' }}>
                  Selección de Rango
                </h3>
                <div style={{ 
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #334155'
                }}>
                                     <DatePickerComponent
                     mode="single"
                     selected={selectedRange.from}
                     onSelect={(date: Date | undefined) => {
                       setSelectedRange({ from: date, to: undefined });
                       action("calendar-range-select")({ from: date, to: undefined });
                     }}
                   />
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                  Desde: {selectedRange.from?.toLocaleDateString() || 'N/A'}<br/>
                  Hasta: {selectedRange.to?.toLocaleDateString() || 'N/A'}
                </p>
              </div>

              {/* Calendar Múltiple */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#94A3B8', marginBottom: '8px' }}>
                  Selección Múltiple
                </h3>
                <div style={{ 
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #334155'
                }}>
                                     <DatePickerComponent
                     mode="single"
                     selected={selectedMultiple[0]}
                     onSelect={(date: Date | undefined) => {
                       setSelectedMultiple(date ? [date] : []);
                       action("calendar-multiple-select")(date ? [date] : []);
                     }}
                   />
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                  {selectedMultiple.length} fechas seleccionadas
                </p>
              </div>
              
            </div>

            {/* Ejemplo de Casos de Uso */}
            <div style={{ 
              marginTop: '32px',
              padding: '24px',
              backgroundColor: '#0F172A',
              borderRadius: '8px',
              border: '1px solid #334155'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '20px',
                color: '#F3F4F8'
              }}>
                Casos de Uso en Sistema de Procesos
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px'
              }}>
                
                {/* Planificación de Tareas */}
                <div style={{ 
                  padding: '16px',
                  backgroundColor: '#1E293B',
                  borderRadius: '6px',
                  border: '1px solid #475569'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#E2E8F0', marginBottom: '12px' }}>
                    📅 Planificación de Tareas
                  </h4>
                                     <DatePickerComponent
                     mode="single"
                     selected={undefined}
                     onSelect={action("task-planning")}
                     disabled={{ before: new Date() }}
                   />
                </div>

                {/* Período de Revisión */}
                <div style={{ 
                  padding: '16px',
                  backgroundColor: '#1E293B',
                  borderRadius: '6px',
                  border: '1px solid #475569'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#E2E8F0', marginBottom: '12px' }}>
                    📊 Período de Revisión
                  </h4>
                                     <DatePickerComponent
                     mode="single"
                     selected={undefined}
                     onSelect={action("review-period")}
                   />
                </div>

                {/* Fecha Límite */}
                <div style={{ 
                  padding: '16px',
                  backgroundColor: '#1E293B',
                  borderRadius: '6px',
                  border: '1px solid #475569'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#E2E8F0', marginBottom: '12px' }}>
                    ⏰ Fecha Límite
                  </h4>
                                     <DatePickerComponent
                     mode="single"
                     selected={undefined}
                     onSelect={action("deadline-select")}
                     disabled={{ before: new Date() }}
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
  title: "Dark Theme/Calendar",
  component: DarkThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componente Calendar con múltiples modos de selección para el sistema de gestión de procesos en tema oscuro. Incluye selección simple, múltiple y de rango."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => <DarkThemeApp />,
  name: "Todas las Variantes",
  parameters: {
    docs: {
      description: {
        story: "Muestra todas las variantes del componente Calendar: selección simple, rango, múltiple y casos de uso específicos para planificación de procesos en tema oscuro."
      }
    }
  }
}; 