import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useGobernanza } from '../../../hooks/useGobernanza';
import { Modal } from '../modal/Modal';
import { Button } from '../button/button';
import { TipoEntidadManager } from '../tipo-entidad-manager';
import { RolGobernanzaManager } from '../rol-gobernanza-manager';
import { ReglaGobernanzaManager } from '../regla-gobernanza-manager';
import { TipoGobiernoManager } from '../tipo-gobierno-manager';
import { 
  TipoEntidad, 
  CreateTipoEntidadCommand 
} from '../../../services/types/tipo-entidad.types';
import { 
  RolGobernanza, 
  CreateRolGobernanzaCommand 
} from '../../../services/types/rol-gobernanza.types';
import { 
  ReglaGobernanza, 
  CreateReglaGobernanzaCommand 
} from '../../../services/types/regla-gobernanza.types';
import { 
  TipoGobierno, 
  CreateTipoGobiernoCommand 
} from '../../../services/types/tipo-gobierno.types';
import { AlertService } from '../alerts';
import { 
  Database, 
  Users, 
  Shield, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Settings
} from 'lucide-react';
import styles from './GovernanceWizard.module.css';

// =============================================
// INTERFACES
// =============================================

export interface GovernanceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialStep?: WizardStep;
}

export type WizardStep = 'tipos-entidad' | 'roles-gobernanza' | 'reglas-gobernanza' | 'tipos-gobierno' | 'complete';

interface WizardStepConfig {
  id: WizardStep;
  title: string;
  description: string;
  icon: React.ReactNode;
  component?: React.ComponentType<any>;
}

interface WizardState {
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  stepData: {
    tiposEntidad: TipoEntidad[];
    rolesGobernanza: RolGobernanza[];
    reglasGobernanza: ReglaGobernanza[];
    tiposGobierno: TipoGobierno[];
  };
  isLoading: boolean;
  canProceed: boolean;
  hasUnsavedChanges: boolean;
}

// =============================================
// CONFIGURACIÓN DE PASOS
// =============================================

const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: 'tipos-entidad',
    title: 'Tipos de Entidad',
    description: 'Configura los tipos de entidades.',
    icon: <Database size={20} />,
    component: TipoEntidadManager
  },
  {
    id: 'roles-gobernanza',
    title: 'Roles de Gobierno',
    description: 'Define los roles y permisos de gobierno',
    icon: <Users size={20} />,
    component: RolGobernanzaManager
  },
  {
    id: 'reglas-gobernanza',
    title: 'Reglas de Roles',
    description: 'Establece las reglas y restricciones para cada rol',
    icon: <Settings size={20} />,
    component: ReglaGobernanzaManager
  },
  {
    id: 'tipos-gobierno',
    title: 'Tipos de Gobierno',
    description: 'Establece los tipos de gobierno disponibles',
    icon: <Shield size={20} />,
    component: TipoGobiernoManager
  },
  {
    id: 'complete',
    title: 'Configuración Completa',
    description: 'Tu configuración está lista para usar',
    icon: <CheckCircle size={20} />
  }
];

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const GovernanceWizard: React.FC<GovernanceWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialStep = 'tipos-entidad'
}) => {
  const { colors } = useTheme();
  const { tiposEntidad, rolesGobernanza, reglasGobernanza, tiposGobierno, loadCatalogData } = useGobernanza();

  // Estado del wizard
  const [state, setState] = useState<WizardState>({
    currentStep: initialStep,
    completedSteps: new Set(),
    stepData: {
      tiposEntidad: [],
      rolesGobernanza: [],
      reglasGobernanza: [],
      tiposGobierno: []
    },
    isLoading: false,
    canProceed: false,
    hasUnsavedChanges: false
  });

  // =============================================
  // EFECTOS
  // =============================================

  useEffect(() => {
    if (isOpen) {
      console.log('🔄 GovernanceWizard abriendo - Datos del catálogo:', {
        tiposEntidad: tiposEntidad.length,
        rolesGobernanza: rolesGobernanza.length,
        reglasGobernanza: reglasGobernanza.length,
        tiposGobierno: tiposGobierno.length
      });
      
      // Resetear el estado del wizard pero preservar datos existentes del catálogo
      setState(prev => {
        const newStepData = {
          // Preservar datos existentes del catálogo o usar arrays vacíos como fallback
          tiposEntidad: tiposEntidad.length > 0 ? tiposEntidad : prev.stepData.tiposEntidad,
          rolesGobernanza: rolesGobernanza.length > 0 ? rolesGobernanza : prev.stepData.rolesGobernanza,
          reglasGobernanza: reglasGobernanza.length > 0 ? reglasGobernanza : prev.stepData.reglasGobernanza,
          tiposGobierno: tiposGobierno.length > 0 ? tiposGobierno : prev.stepData.tiposGobierno
        };
        
        console.log('📊 Actualizando stepData:', newStepData);
        
        return {
          ...prev,
          currentStep: initialStep,
          completedSteps: new Set(), // Limpiar pasos completados
          canProceed: false,
          hasUnsavedChanges: false,
          stepData: newStepData
        };
      });
    }
  }, [isOpen, initialStep, tiposEntidad, rolesGobernanza, reglasGobernanza, tiposGobierno]);

  // Cargar datos del catálogo cuando se abra el modal
  useEffect(() => {
    if (isOpen) {
      // Siempre intentar cargar datos del catálogo al abrir
      loadCatalogData();
    }
  }, [isOpen, loadCatalogData]);

  // Actualizar stepData cuando los datos del catálogo cambien y el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      // Sincronizar siempre los catálogos con el estado del wizard, incluso si están vacíos
      setState(prev => ({
        ...prev,
        stepData: {
          tiposEntidad: Array.isArray(tiposEntidad) ? tiposEntidad : [],
          rolesGobernanza: Array.isArray(rolesGobernanza) ? rolesGobernanza : [],
          reglasGobernanza: Array.isArray(reglasGobernanza) ? reglasGobernanza : [],
          tiposGobierno: Array.isArray(tiposGobierno) ? tiposGobierno : []
        }
      }));
    }
  }, [isOpen, tiposEntidad, rolesGobernanza, reglasGobernanza, tiposGobierno]);

  // =============================================
  // FUNCIONES DE NAVEGACIÓN
  // =============================================

  const getCurrentStepIndex = () => {
    return WIZARD_STEPS.findIndex(step => step.id === state.currentStep);
  };

  const canGoNext = () => {
    if (state.currentStep === 'complete') return false;
    
    switch (state.currentStep) {
      case 'tipos-entidad':
        // Solo permitir avanzar si existen tipos de entidad (creados o ya existentes)
        return state.stepData.tiposEntidad.length > 0 || tiposEntidad.length > 0;
      case 'roles-gobernanza':
        return state.stepData.rolesGobernanza.length > 0;
      case 'reglas-gobernanza':
        return state.stepData.reglasGobernanza.length > 0;
      case 'tipos-gobierno':
        return state.stepData.tiposGobierno.length > 0;
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return getCurrentStepIndex() > 0;
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentIndex + 1];
      setState(prev => ({
        ...prev,
        currentStep: nextStep.id,
        completedSteps: new Set([...prev.completedSteps, prev.currentStep]),
        canProceed: false
      }));
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      const previousStep = WIZARD_STEPS[currentIndex - 1];
      setState(prev => ({
        ...prev,
        currentStep: previousStep.id,
        canProceed: true
      }));
    }
  };

  // =============================================
  // HANDLERS DE DATOS
  // =============================================

  const handleTiposEntidadCreated = (tipos: TipoEntidad[]) => {
    setState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        tiposEntidad: tipos
      },
      canProceed: tipos.length > 0
    }));
    
    AlertService.success(`${tipos.length} tipos de entidad configurados`);
  };

  const handleRolesGobernanzaCreated = (roles: RolGobernanza[]) => {
    setState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        rolesGobernanza: roles
      },
      canProceed: roles.length > 0
    }));
    
    AlertService.success(`${roles.length} roles de gobernanza configurados`);
  };

  const handleReglasGobernanzaCreated = (reglas: ReglaGobernanza[]) => {
    setState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        reglasGobernanza: reglas
      },
      canProceed: reglas.length > 0
    }));
    
    AlertService.success(`${reglas.length} reglas de gobernanza configuradas`);
  };

  const handleTiposGobiernoCreated = (tipos: TipoGobierno[]) => {
    setState(prev => ({
      ...prev,
      stepData: {
        ...prev.stepData,
        tiposGobierno: tipos
      },
      canProceed: tipos.length > 0
    }));
    
    AlertService.success(`${tipos.length} tipos de gobierno configurados`);
  };

  // =============================================
  // HANDLERS DE ACCIONES
  // =============================================

  const handleNext = () => {
    if (state.currentStep === 'tipos-gobierno' && canGoNext()) {
      // Último paso antes de completar
      goToNextStep();
    } else if (canGoNext()) {
      goToNextStep();
    }
  };

  const handleBack = () => {
    if (canGoBack()) {
      goToPreviousStep();
    }
  };

  const handleComplete = () => {
    setState(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, 'tipos-gobierno'])
    }));
    
    AlertService.success('Configuración de gobierno completada exitosamente');
    onComplete();
  };

  const handleClose = async () => {
    if (state.hasUnsavedChanges) {
      // Mostrar confirmación si hay progreso
      const confirmClose = await AlertService.confirm(
        '¿Estás seguro de que quieres cerrar? Hay cambios no guardados.',
        {
          confirmText: 'Cerrar',
          cancelText: 'Continuar'
        }
      );
      if (confirmClose) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // =============================================
  // FUNCIONES DE RENDERIZADO
  // =============================================

  const renderStepIndicator = () => {
    return (
      <div className={styles.stepIndicator}>
        {WIZARD_STEPS.map((step, index) => {
          const isActive = step.id === state.currentStep;
          const isCompleted = state.completedSteps.has(step.id);
          const isAccessible = index <= getCurrentStepIndex() || isCompleted;

          return (
            <div 
              key={step.id} 
              className={`${styles.stepIndicatorItem} ${isCompleted ? 'completed' : ''}`}
            >
              <div
                className={`${styles.stepCircle} ${
                  isActive ? styles.active : ''
                } ${isCompleted ? styles.completed : ''}`}
                style={{
                  backgroundColor: isCompleted 
                    ? '#10b981' 
                    : isActive 
                      ? colors.primary 
                      : colors.border,
                  color: isCompleted || isActive ? '#ffffff' : colors.textSecondary
                }}
              >
                {isCompleted ? <CheckCircle size={16} /> : index + 1}
              </div>
              <div className={styles.stepInfo}>
                <span 
                  className={styles.stepTitle}
                  style={{ 
                    color: isActive ? colors.primary : colors.text,
                    fontWeight: isActive ? '600' : '500'
                  }}
                >
                  {step.title}
                </span>
                <span 
                  className={styles.stepDescription}
                  style={{ color: colors.textSecondary }}
                >
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    const currentStepConfig = WIZARD_STEPS.find(step => step.id === state.currentStep);
    
    switch (state.currentStep) {
      case 'tipos-entidad':
        return (
          <TipoEntidadManager
            onTiposCreated={handleTiposEntidadCreated}
            onNext={handleNext}
            existingTipos={state.stepData.tiposEntidad}
            onDirtyChange={(dirty: boolean) => setState(prev => ({ ...prev, hasUnsavedChanges: dirty }))}
          />
        );
        
      case 'roles-gobernanza':
        return (
          <RolGobernanzaManager
            tiposEntidad={state.stepData.tiposEntidad}
            onRolesCreated={handleRolesGobernanzaCreated}
            onNext={handleNext}
            existingRoles={state.stepData.rolesGobernanza}
            onDirtyChange={(dirty: boolean) => setState(prev => ({ ...prev, hasUnsavedChanges: dirty }))}
          />
        );
        
      case 'reglas-gobernanza':
        return (
          <ReglaGobernanzaManager
            rolesGobernanza={state.stepData.rolesGobernanza}
            onReglasCreated={handleReglasGobernanzaCreated}
            onNext={handleNext}
            existingReglas={state.stepData.reglasGobernanza}
            onDirtyChange={(dirty: boolean) => setState(prev => ({ ...prev, hasUnsavedChanges: dirty }))}
          />
        );
        
      case 'tipos-gobierno':
        return (
          <TipoGobiernoManager
            onTiposCreated={handleTiposGobiernoCreated}
            onComplete={handleNext}
            existingTipos={state.stepData.tiposGobierno}
            onDirtyChange={(dirty: boolean) => setState(prev => ({ ...prev, hasUnsavedChanges: dirty }))}
          />
        );
        
      case 'complete':
        return (
          <div className={styles.completeStep}>
            <div className={styles.completeContent}>
              <CheckCircle size={64} color="#10b981" />
              <h2>¡Configuración Completada!</h2>
              <p>
                Has configurado exitosamente todos los componentes de gobernanza:
              </p>
              <ul className={styles.summaryList}>
                <li>{state.stepData.tiposEntidad.length} tipos de entidad</li>
                <li>{state.stepData.rolesGobernanza.length} roles de gobernanza</li>
                <li>{state.stepData.reglasGobernanza.length} reglas de gobernanza</li>
                <li>{state.stepData.tiposGobierno.length} tipos de gobierno</li>
              </ul>
              <p>
                Tu sistema de gobernanza está listo para gestionar responsabilidades y usuarios.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Configurar Gobierno"
      size="xl"
      hideFooter={true}
      forcedClose={true}
      className={styles.wizardModal}
    >
      <div className={styles.wizardContainer}>
        <div className={styles.wizardSidebar}>
          {renderStepIndicator()}
        </div>
        
        <div className={styles.wizardContent}>
          <div className={styles.stepContent}>
            {renderStepContent()}
          </div>
          
          {state.currentStep !== 'complete' && (
            <div className={styles.wizardFooter}>
              <Button
                variant="outline"
                size="m"
                onClick={handleBack}
                disabled={!canGoBack()}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Anterior
              </Button>
              
              <div className={styles.stepProgress}>
                Paso {getCurrentStepIndex() + 1} de {WIZARD_STEPS.length}
              </div>
              
              {state.currentStep === 'tipos-gobierno' ? (
                <Button
                  variant="default"
                  size="m"
                  onClick={handleComplete}
                  disabled={!canGoNext()}
                  iconName="CheckCircle"
                  iconPosition="right"
                >
                  Completar
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="m"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  Siguiente
                </Button>
              )}
            </div>
          )}
          
          {state.currentStep === 'complete' && (
            <div className={styles.wizardFooter}>
              <Button
                variant="default"
                size="l"
                onClick={handleComplete}
                iconName="CheckCircle"
                iconPosition="right"
              >
                Finalizar Configuración
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};