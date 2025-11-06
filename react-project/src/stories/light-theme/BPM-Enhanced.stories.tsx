import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { action } from '@storybook/addon-actions';
import { SuperWizardProcesos } from '../../components/pages/Procesos/SuperWizardProcesos';
import { ListaProcesosEnhanced } from '../../components/pages/Procesos/ListaProcesosEnhanced';
import type { WizardCompleteData } from '../../components/pages/Procesos/SuperWizardProcesos';
import { AlertProvider } from '../../components/ui/alerts/AlertProvider';

// Componente wrapper que simula la aplicación principal con Light Theme
const LightThemeApp = () => {
  const [mounted, setMounted] = useState(false);

  // Forzar Light Theme de manera robusta
  useEffect(() => {
    localStorage.removeItem('theme');
    document.body.className = '';
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.add('bg-background', 'text-foreground');
    localStorage.setItem('theme', 'light');
    document.body.style.backgroundColor = '#F5F7FA';
    document.body.style.color = '#414976';
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <AlertProvider>
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#F5F7FA',
          color: '#414976',
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
        }}>
          <BPMEnhancedShowcase />
        </div>
      </AlertProvider>
    </ThemeProvider>
  );
};

// Componente principal del showcase BPM mejorado
const BPMEnhancedShowcase = () => {
  const [currentView, setCurrentView] = useState<'lista' | 'wizard'>('lista');
  const [showWizard, setShowWizard] = useState(false);

  const handleCreateProcess = () => {
    setShowWizard(true);
    action('create-process-clicked')();
  };

  const handleWizardComplete = (data: WizardCompleteData) => {
    setShowWizard(false);
    action('wizard-completed')(data);
  };

  const handleEditProcess = (proceso: any) => {
    action('edit-process')(proceso);
  };

  const handleViewProcess = (proceso: any) => {
    action('view-process')(proceso);
  };

  const handleViewDiagram = (proceso: any) => {
    action('view-diagram')(proceso);
  };

  return (
    <div>
      <div style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        margin: '20px',
        boxShadow: '0 2px 8px rgba(65, 73, 118, 0.1)',
        border: '1px solid #E5E7EB'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          textAlign: 'center', 
          marginBottom: '16px',
          color: '#414976'
        }}>
          🚀 Sistema BPM Mejorado con Componentes UI Reutilizables
        </h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#EFF6FF',
            borderRadius: '8px',
            border: '1px solid #BFDBFE'
          }}>
            <h3 style={{ color: '#1E40AF', margin: '0 0 8px 0', fontSize: '16px' }}>✨ Mejoras Implementadas</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#1E40AF', fontSize: '14px' }}>
              <li>Componentes Button reutilizables</li>
              <li>Sistema Input con validación</li>
              <li>Cards para organización visual</li>
              <li>AlertService para notificaciones</li>
              <li>Stepper para wizard mejorado</li>
            </ul>
          </div>
          
          <div style={{
            padding: '16px',
            backgroundColor: '#F0FDF4',
            borderRadius: '8px',
            border: '1px solid #BBF7D0'
          }}>
            <h3 style={{ color: '#166534', margin: '0 0 8px 0', fontSize: '16px' }}>🎨 Beneficios UX/UI</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534', fontSize: '14px' }}>
              <li>Consistencia visual total</li>
              <li>Mejor feedback para el usuario</li>
              <li>Navegación más intuitiva</li>
              <li>Responsive design mejorado</li>
              <li>Accesibilidad optimizada</li>
            </ul>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => setCurrentView('lista')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: currentView === 'lista' ? '#3B82F6' : '#FFFFFF',
              color: currentView === 'lista' ? '#FFFFFF' : '#414976',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📋 Lista Mejorada
          </button>
          <button
            onClick={() => setCurrentView('wizard')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: currentView === 'wizard' ? '#3B82F6' : '#FFFFFF',
              color: currentView === 'wizard' ? '#FFFFFF' : '#414976',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🧙‍♂️ Super Wizard
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      {currentView === 'lista' && (
        <ListaProcesosEnhanced
          onCreateProcess={handleCreateProcess}
          onEditProcess={handleEditProcess}
          onViewProcess={handleViewProcess}
          onViewDiagram={handleViewDiagram}
        />
      )}

      {currentView === 'wizard' && (
        <div style={{ padding: '20px' }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(65, 73, 118, 0.1)'
          }}>
            <h2 style={{ color: '#414976', marginBottom: '16px' }}>Super Wizard con Stepper UI</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              Wizard mejorado que integra el componente Stepper con alertas y validación
            </p>
            <button
              onClick={() => setShowWizard(true)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3B82F6',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              🚀 Abrir Super Wizard
            </button>
          </div>
        </div>
      )}

      {/* Super Wizard */}
      {showWizard && (
        <SuperWizardProcesos
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
};

// Meta información para Storybook
const meta = {
  title: 'Light Theme/BPM Sistema Mejorado',
  component: LightThemeApp,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# 🚀 Sistema BPM Mejorado con Componentes UI Reutilizables

Este showcase presenta el sistema BPM completamente renovado utilizando los componentes UI existentes para mayor consistencia y mejor experiencia de usuario.

## ✨ Mejoras Implementadas

### 🎯 **Reutilización de Componentes UI**
- **Button**: Variantes, iconos, estados de carga
- **Input**: Validación, iconos, tipos especializados  
- **Card**: Organización visual consistente
- **AlertService**: Notificaciones Toast profesionales
- **Stepper**: Wizard con navegación visual mejorada

### 🎨 **Beneficios UX/UI**
- **Consistencia Visual**: Todos los componentes siguen el mismo design system
- **Mejor Feedback**: Alertas contextuales y estados de carga
- **Navegación Intuitiva**: Stepper visual para el wizard
- **Responsive Design**: Adaptación automática a diferentes pantallas
- **Accesibilidad**: Componentes optimizados para screen readers

### 🛠️ **Componentes Mejorados**

#### **ListaProcesosEnhanced**
- Interfaz tipo dashboard moderna
- Filtros avanzados con Input components
- Cards para mejor organización
- Tabla responsive con acciones consistentes
- Integración completa con AlertService

#### **SuperWizardProcesos**  
- Utiliza el componente Stepper UI existente
- Validación de pasos automática
- Alertas contextuales para cada acción
- Navegación mejorada con indicadores visuales
- Integración seamless con todos los pasos del BPM

## 🔧 **Arquitectura de Reutilización**

\`\`\`typescript
// Ejemplo de integración
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input';  
import { AlertService } from '../../ui/alerts';
import { Stepper } from '../../ui/stepper';

// Uso consistente en todos los componentes BPM
<Button iconName="Plus" onClick={handleCreate}>
  Nuevo Proceso
</Button>
\`\`\`

Esta aproximación garantiza:
- **Mantenimiento simplificado**
- **Consistencia automática** 
- **Performance optimizada**
- **Escalabilidad mejorada**
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LightThemeApp>;

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal
export const SistemaCompletoMejorado: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: `
### 🚀 Sistema BPM Mejorado - Showcase Completo

Esta historia presenta el sistema BPM completamente renovado con componentes UI reutilizables.

**Características destacadas:**
- **Lista Mejorada**: Interface moderna tipo dashboard
- **Super Wizard**: Integración con Stepper UI component
- **Alertas Contextuales**: Feedback inmediato para todas las acciones
- **Consistencia Total**: Uso de design system unificado

**Cómo probar:**
1. Explora la "Lista Mejorada" - Nota la interfaz moderna y filtros avanzados
2. Prueba el "Super Wizard" - Observa la navegación mejorada con Stepper
3. Interactúa con botones y formularios - Ve las alertas contextuales
4. Compara con el sistema anterior - Nota las mejoras en UX/UI
        `
      }
    }
  }
};

// Historia enfocada en componentes individuales
export const ComponentesUIIntegrados: Story = {
  args: {},
  render: () => {
    const [activeDemo, setActiveDemo] = useState<string>('buttons');
    
    return (
      <ThemeProvider>
        <AlertProvider>
          <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#F5F7FA',
            padding: '20px'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#414976' }}>
              Demostración de Componentes UI Integrados
            </h2>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'buttons', label: '🔘 Buttons' },
                { id: 'inputs', label: '📝 Inputs' },
                { id: 'alerts', label: '🔔 Alerts' },
                { id: 'cards', label: '🃏 Cards' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveDemo(id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: activeDemo === id ? '#3B82F6' : '#FFFFFF',
                    color: activeDemo === id ? '#FFFFFF' : '#414976',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(65, 73, 118, 0.1)'
            }}>
              {activeDemo === 'buttons' && (
                <div>
                  <h3 style={{ color: '#414976', marginBottom: '16px' }}>Variantes de Button Component</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px' }}>
                      Button Default
                    </button>
                    <button style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#3B82F6', border: '1px solid #3B82F6', borderRadius: '6px' }}>
                      Button Outline
                    </button>
                    <button style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px' }}>
                      Button Destructive
                    </button>
                  </div>
                  <p style={{ color: '#6B7280', marginTop: '12px', fontSize: '14px' }}>
                    Todos los botones usan el mismo componente base con diferentes variantes
                  </p>
                </div>
              )}
              
              {activeDemo === 'inputs' && (
                <div>
                  <h3 style={{ color: '#414976', marginBottom: '16px' }}>Input Components con Validación</h3>
                  <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
                    <input 
                      placeholder="Input básico"
                      style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                    />
                    <input 
                      placeholder="Email con validación"
                      type="email"
                      style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                    />
                    <input 
                      placeholder="Password con toggle"
                      type="password"
                      style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                    />
                  </div>
                  <p style={{ color: '#6B7280', marginTop: '12px', fontSize: '14px' }}>
                    Inputs con iconos, validación automática y estados de error
                  </p>
                </div>
              )}
              
              {/* Otras demos... */}
            </div>
          </div>
        </AlertProvider>
      </ThemeProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
### 🧩 Demostración de Componentes UI Integrados

Esta historia muestra cómo los componentes UI existentes se integran perfectamente en el sistema BPM.

**Componentes demostrados:**
- Button con variantes y estados
- Input con validación y tipos especializados  
- AlertService para notificaciones
- Card para organización de contenido

Útil para entender la arquitectura de reutilización de componentes.
        `
      }
    }
  }
}; 