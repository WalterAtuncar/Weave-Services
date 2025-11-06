import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { action } from '@storybook/addon-actions';
import { AlertService } from '../../components/ui/alerts/AlertService';
import {
  ListaProcesos,
  ConfiguracionCabecera,
  DefinicionActividades,
  VerificacionProceso,
  FinalizacionProceso,
  VistaCompletada,
  DiagramaFlujo,
  EditorAvanzado,
  PanelComponentes,
  DetalleActividades,
  AcuerdoServicio
} from '../../components/pages/Procesos';
import type { ConfiguracionData, ActividadesData } from '../../components/pages/Procesos';

// Componente wrapper que simula la aplicación principal con Dark Theme
const DarkThemeApp = () => {
  const [mounted, setMounted] = useState(false);

  // Forzar Dark Theme de manera robusta
  useEffect(() => {
    localStorage.removeItem('theme');
    document.body.className = '';
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-background', 'text-foreground');
    localStorage.setItem('theme', 'dark');
    document.body.style.backgroundColor = '#1A1D29';
    document.body.style.color = '#E2E8F0';
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#1A1D29',
        color: '#E2E8F0',
        padding: '20px',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          textAlign: 'center', 
          marginBottom: '40px',
          color: '#E2E8F0'
        }}>
          Sistema BPM - Gestión de Procesos (Dark Theme)
        </h1>
        
        <BPMFlowShowcase />
      </div>
    </ThemeProvider>
  );
};

// Tipos para el estado del flujo
type FlowStep = 'lista' | 'config' | 'actividades' | 'verificacion' | 'finalizacion' | 'completado' | 'diagrama' | 'editor' | 'detalles' | 'sla';

interface FlowData {
  configuracion?: ConfiguracionData;
  actividades?: ActividadesData;
  estado?: string;
}

// Componente principal del showcase BPM
const BPMFlowShowcase = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('lista');
  const [flowData, setFlowData] = useState<FlowData>({});
  const [showComponentsPanel, setShowComponentsPanel] = useState(false);

  // Datos mock para demostración
  const sampleConfigData: ConfiguracionData = {
    codigo: 'P000001',
    nombre: 'Pago de Factura',
    descripcion: 'Proceso para gestionar el pago de facturas de proveedores',
    nivel: 'Alto',
    criticidad: 'Crítico',
    estado: 'Activo',
    procesoPadre: '',
    organizacion: 'Empresa Demo S.A.C.',
    categoria: 'Financiero'
  };

  const sampleActivitiesData: ActividadesData = {
    actividades: [
      {
        id: '1',
        que: 'Recepción Factura',
        quien: 'Mesa de Partes',
        como: 'Recibir y registrar la factura en el sistema',
        sistema: 'SAP'
      },
      {
        id: '2',
        que: 'Registro Factura',
        quien: 'Mesa de Partes',
        como: 'Validar datos y registrar en el sistema contable',
        sistema: 'SAP'
      },
      {
        id: '3',
        que: 'Análisis de gasto',
        quien: 'Analista de Compras',
        como: 'Verificar presupuesto y autorización de gasto',
        sistema: 'SAP'
      }
    ]
  };

  // Handlers para el flujo
  const handleStepChange = (step: FlowStep) => {
    setCurrentStep(step);
    action('step-change')(step);
  };

  const handleConfigContinue = (data: ConfiguracionData) => {
    setFlowData(prev => ({ ...prev, configuracion: data }));
    setCurrentStep('actividades');
    action('config-saved')(data);
  };

  const handleActivitiesContinue = (data: ActividadesData) => {
    setFlowData(prev => ({ ...prev, actividades: data }));
    setCurrentStep('verificacion');
    action('activities-saved')(data);
  };

  const handleVerificationContinue = () => {
    setCurrentStep('finalizacion');
    action('verification-completed')();
  };

  const handleFinalizationComplete = (estado: string) => {
    setFlowData(prev => ({ ...prev, estado }));
    setCurrentStep('completado');
    action('process-finalized')(estado);
  };

  const handleComponentSelect = (component: any) => {
    action('component-selected')(component);
  };

  // Renderizar el componente actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'lista':
        return (
          <ListaProcesos
            onCreateProcess={() => handleStepChange('config')}
            onEditProcess={() => handleStepChange('editor')}
            onViewProcess={() => handleStepChange('completado')}
            onViewDiagram={() => handleStepChange('diagrama')}
          />
        );

      case 'config':
        return (
          <ConfiguracionCabecera
            isOpen={true}
            onClose={() => handleStepChange('lista')}
            onContinue={handleConfigContinue}
            initialData={flowData.configuracion}
          />
        );

      case 'actividades':
        return (
          <DefinicionActividades
            isOpen={true}
            onClose={() => handleStepChange('config')}
            onContinue={handleActivitiesContinue}
            initialData={flowData.actividades}
          />
        );

      case 'verificacion':
        return (
          <VerificacionProceso
            isOpen={true}
            onClose={() => handleStepChange('actividades')}
            onContinue={handleVerificationContinue}
            configuracionData={flowData.configuracion || sampleConfigData}
            actividadesData={flowData.actividades || sampleActivitiesData}
          />
        );

      case 'finalizacion':
        return (
          <FinalizacionProceso
            isOpen={true}
            onClose={() => handleStepChange('verificacion')}
            onComplete={handleFinalizationComplete}
            configuracionData={flowData.configuracion || sampleConfigData}
            actividadesData={flowData.actividades || sampleActivitiesData}
          />
        );

      case 'completado':
        return (
          <VistaCompletada
            configuracionData={flowData.configuracion || sampleConfigData}
            actividadesData={flowData.actividades || sampleActivitiesData}
            estado={flowData.estado || 'Activo'}
            onEdit={() => handleStepChange('editor')}
            onViewDiagram={() => handleStepChange('diagrama')}
            onViewSLA={() => handleStepChange('sla')}
            onBack={() => handleStepChange('lista')}
          />
        );

      case 'diagrama':
        return (
          <DiagramaFlujo
            configuracionData={flowData.configuracion || sampleConfigData}
            actividadesData={flowData.actividades || sampleActivitiesData}
            onBack={() => handleStepChange('completado')}
            onEdit={() => handleStepChange('editor')}
          />
        );

      case 'editor':
        return (
          <div style={{ display: 'flex', height: '80vh', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <EditorAvanzado
                configuracionData={flowData.configuracion || sampleConfigData}
                actividadesData={flowData.actividades || sampleActivitiesData}
                onSave={(data) => {
                  action('editor-save')(data);
                  handleStepChange('completado');
                }}
                onCancel={() => handleStepChange('completado')}
              />
            </div>
            <PanelComponentes
              isVisible={showComponentsPanel}
              onToggle={() => setShowComponentsPanel(!showComponentsPanel)}
              onComponentSelect={handleComponentSelect}
            />
          </div>
        );

      case 'detalles':
        return (
          <DetalleActividades
            actividadesData={flowData.actividades || sampleActivitiesData}
            onBack={() => handleStepChange('completado')}
          />
        );

      case 'sla':
        return (
          <AcuerdoServicio
            configuracionData={flowData.configuracion || sampleConfigData}
            onBack={() => handleStepChange('completado')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Navegación del flujo */}
      <div style={{ 
        backgroundColor: '#2D3748',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #4A5568'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#E2E8F0'
        }}>
          Navegación del Flujo BPM
        </h2>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {[
            { key: 'lista', label: '📋 Lista Procesos' },
            { key: 'config', label: '⚙️ Configuración' },
            { key: 'actividades', label: '📝 Actividades' },
            { key: 'verificacion', label: '✅ Verificación' },
            { key: 'finalizacion', label: '🎯 Finalización' },
            { key: 'completado', label: '✨ Completado' },
            { key: 'diagrama', label: '📊 Diagrama' },
            { key: 'editor', label: '🎨 Editor' },
            { key: 'detalles', label: '📄 Detalles' },
            { key: 'sla', label: '⏱️ SLA' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleStepChange(key as FlowStep)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #4A5568',
                backgroundColor: currentStep === key ? '#3B82F6' : '#2D3748',
                color: currentStep === key ? '#FFFFFF' : '#E2E8F0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Indicador del paso actual */}
      <div style={{ 
        backgroundColor: '#1E3A8A',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '24px',
        border: '1px solid #3B82F6'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: '#DBEAFE',
          fontWeight: '500'
        }}>
          📍 Paso actual: <strong>{getCurrentStepLabel(currentStep)}</strong>
        </p>
      </div>

      {/* Contenido del paso actual */}
      <div style={{ 
        backgroundColor: '#2D3748',
        borderRadius: '12px',
        minHeight: '600px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #4A5568',
        overflow: 'hidden'
      }}>
        {renderCurrentStep()}
      </div>
    </div>
  );
};

// Función auxiliar para obtener el label del paso actual
const getCurrentStepLabel = (step: FlowStep): string => {
  const labels: Record<FlowStep, string> = {
    lista: 'Lista de Procesos',
    config: 'Configuración de Cabecera',
    actividades: 'Definición de Actividades',
    verificacion: 'Verificación del Proceso',
    finalizacion: 'Finalización del Proceso',
    completado: 'Vista Completada',
    diagrama: 'Diagrama de Flujo',
    editor: 'Editor Avanzado',
    detalles: 'Detalles de Actividades',
    sla: 'Acuerdo de Servicio'
  };
  return labels[step];
};

// Meta información para Storybook
const meta = {
  title: 'Dark Theme/BPM Sistema Completo',
  component: DarkThemeApp,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark'
    },
    docs: {
      description: {
        component: `
# Sistema BPM - Business Process Management (Dark Theme)

Versión optimizada para el tema oscuro del sistema completo de gestión de procesos de negocio (BPM).

## 🌙 Características del Tema Oscuro
- Colores optimizados para reducir fatiga visual
- Alto contraste para mejor legibilidad
- Interfaz elegante y profesional
- Perfecto para trabajo en ambientes con poca luz

## 🔄 Flujo Principal del Wizard
1. **Lista de Procesos** - Vista principal con filtros y búsqueda
2. **Configuración** - Definición de la cabecera del proceso
3. **Actividades** - Definición de las actividades del proceso
4. **Verificación** - Preview del proceso con diagrama BPMN
5. **Finalización** - Activación y cambio de estado del proceso

## 📊 Componentes Adicionales
- **Vista Completada** - Vista expandible del proceso finalizado
- **Diagram Viewer** - Visualizador completo de diagramas BPMN
- **Editor Avanzado** - Editor con toolbar completo de formateo
- **Panel Componentes** - Panel lateral con elementos BPMN
- **Detalles Actividades** - Vista detallada de las actividades
- **SLA** - Métricas y acuerdos de nivel de servicio
        `
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DarkThemeApp>;

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal
export const SistemaCompletoInteractivo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: `
### 🌙 Sistema BPM Interactivo Completo (Dark Theme)

Esta historia presenta el sistema completo de gestión de procesos optimizado para el tema oscuro.

**Beneficios del tema oscuro:**
- Menor fatiga visual durante sesiones largas de trabajo
- Mejor contraste para elementos importantes
- Interfaz moderna y elegante
- Ideal para desarrolladores y usuarios avanzados

**Navegación:**
Utiliza los botones de navegación para explorar todos los componentes del sistema BPM.
        `
      }
    }
  }
};

// Historia enfocada en el wizard
export const WizardFlujoCompleto: Story = {
  args: {},
  render: () => {
    const [currentStep, setCurrentStep] = useState<'config' | 'actividades' | 'verificacion' | 'finalizacion'>('config');
    const [flowData, setFlowData] = useState<FlowData>({});

    return (
      <ThemeProvider>
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#1A1D29',
          padding: '20px'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#E2E8F0' }}>
            Wizard de Creación de Procesos - Dark Theme
          </h2>
          
          {/* Stepper visual */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '32px',
            gap: '16px'
          }}>
            {[
              { key: 'config', label: '1. Configuración', active: currentStep === 'config' },
              { key: 'actividades', label: '2. Actividades', active: currentStep === 'actividades' },
              { key: 'verificacion', label: '3. Verificación', active: currentStep === 'verificacion' },
              { key: 'finalizacion', label: '4. Finalización', active: currentStep === 'finalizacion' }
            ].map(({ key, label, active }) => (
              <div
                key={key}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: active ? '#3B82F6' : '#4A5568',
                  color: active ? 'white' : '#E2E8F0',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Contenido del wizard */}
          {currentStep === 'config' && (
            <ConfiguracionCabecera
              isOpen={true}
              onClose={() => {}}
              onContinue={(data) => {
                setFlowData({ configuracion: data });
                setCurrentStep('actividades');
                action('wizard-step-1-completed')(data);
              }}
            />
          )}
          
          {currentStep === 'actividades' && (
            <DefinicionActividades
              isOpen={true}
              onClose={() => setCurrentStep('config')}
              onContinue={(data) => {
                setFlowData(prev => ({ ...prev, actividades: data }));
                setCurrentStep('verificacion');
                action('wizard-step-2-completed')(data);
              }}
            />
          )}
          
          {currentStep === 'verificacion' && (
            <VerificacionProceso
              isOpen={true}
              onClose={() => setCurrentStep('actividades')}
              onContinue={() => {
                setCurrentStep('finalizacion');
                action('wizard-step-3-completed')();
              }}
              configuracionData={flowData.configuracion || {
                codigo: 'P000001',
                nombre: 'Proceso Demo',
                descripcion: 'Proceso de demostración',
                nivel: 'Medio',
                criticidad: 'Normal',
                estado: 'Borrador',
                procesoPadre: '',
                organizacion: 'Demo Corp',
                categoria: 'Operativo'
              }}
              actividadesData={flowData.actividades || {
                actividades: [
                  {
                    id: '1',
                    que: 'Actividad Demo',
                    quien: 'Usuario Demo',
                    como: 'Procedimiento demo',
                    sistema: 'Sistema Demo'
                  }
                ]
              }}
            />
          )}
          
          {currentStep === 'finalizacion' && (
            <FinalizacionProceso
              isOpen={true}
              onClose={() => setCurrentStep('verificacion')}
              onComplete={(estado) => {
                action('wizard-completed')(estado);
                AlertService.success(`¡Proceso creado exitosamente con estado: ${estado}!`);
              }}
              configuracionData={flowData.configuracion || {
                codigo: 'P000001',
                nombre: 'Proceso Demo',
                descripcion: 'Proceso de demostración',
                nivel: 'Medio',
                criticidad: 'Normal',
                estado: 'Borrador',
                procesoPadre: '',
                organizacion: 'Demo Corp',
                categoria: 'Operativo'
              }}
              actividadesData={flowData.actividades || {
                actividades: [
                  {
                    id: '1',
                    que: 'Actividad Demo',
                    quien: 'Usuario Demo',
                    como: 'Procedimiento demo',
                    sistema: 'Sistema Demo'
                  }
                ]
              }}
            />
          )}
        </div>
      </ThemeProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
### 🧙‍♂️ Wizard de Creación - Dark Theme

El wizard de creación optimizado para el tema oscuro, ideal para trabajo nocturno o en ambientes con poca iluminación.
        `
      }
    }
  }
}; 