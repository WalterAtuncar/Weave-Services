import React, { useState } from 'react';
import { Stepper } from '../../ui/stepper';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertService } from '../../ui/alerts';
import {
  ConfiguracionCabecera,
  DefinicionActividades,
  VerificacionProceso,
  FinalizacionProceso
} from './index';
import type { ConfiguracionData, ActividadesData } from './index';
import { FileText, List, CheckCircle, Flag } from 'lucide-react';

interface SuperWizardProcesosProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: WizardCompleteData) => void;
  initialData?: Partial<WizardCompleteData>;
}

export interface WizardCompleteData {
  configuracion: ConfiguracionData;
  actividades: ActividadesData;
  estado: string;
}

const WIZARD_STEPS = [
  {
    id: 'configuracion',
    label: 'ConfiguraciÃ³n',
    icon: FileText,
    isCompleted: false
  },
  {
    id: 'actividades',
    label: 'Actividades',
    icon: List,
    isCompleted: false
  },
  {
    id: 'verificacion',
    label: 'VerificaciÃ³n',
    icon: CheckCircle,
    isCompleted: false
  },
  {
    id: 'finalizacion',
    label: 'FinalizaciÃ³n',
    icon: Flag,
    isCompleted: false
  }
];

export const SuperWizardProcesos: React.FC<SuperWizardProcesosProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData
}) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<WizardCompleteData>>(
    initialData || {}
  );
  const [isLoading, setIsLoading] = useState(false);

  // Validar si el paso actual estÃ¡ completo
  const isStepComplete = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // ConfiguraciÃ³n
        return !!(wizardData.configuracion?.codigo && 
                 wizardData.configuracion?.nombre && 
                 wizardData.configuracion?.descripcion);
      case 1: // Actividades
        return !!(wizardData.actividades?.actividades?.length && 
                 wizardData.actividades.actividades.length > 0);
      case 2: // VerificaciÃ³n
        return !!(wizardData.configuracion && wizardData.actividades);
      case 3: // FinalizaciÃ³n
        return !!wizardData.estado;
      default:
        return false;
    }
  };

  // Handlers de cada paso
  const handleConfiguracionComplete = (data: ConfiguracionData) => {
    setWizardData(prev => ({ ...prev, configuracion: data }));
    AlertService.success('La configuraciÃ³n del proceso se guardÃ³ correctamente', {
      title: 'ConfiguraciÃ³n guardada'
    });
  };

  const handleActividadesComplete = (data: ActividadesData) => {
    setWizardData(prev => ({ ...prev, actividades: data }));
    AlertService.success(`Se guardaron ${data.actividades.length} actividades correctamente`, {
      title: 'Actividades guardadas'
    });
  };

  const handleVerificacionComplete = () => {
    AlertService.info('El proceso estÃ¡ listo para su finalizaciÃ³n', {
      title: 'Proceso verificado'
    });
  };

  const handleFinalizacionComplete = (estado: string) => {
    setWizardData(prev => ({ ...prev, estado }));
    
    const completeData: WizardCompleteData = {
      configuracion: wizardData.configuracion!,
      actividades: wizardData.actividades!,
      estado
    };

    AlertService.success(`El proceso ${completeData.configuracion.nombre} fue creado con estado ${estado}`, {
      title: 'Proceso creado exitosamente'
    });

    onComplete(completeData);
  };

  // NavegaciÃ³n del wizard
  const handleNext = async () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (wizardData.configuracion && wizardData.actividades && wizardData.estado) {
        const completeData: WizardCompleteData = {
          configuracion: wizardData.configuracion,
          actividades: wizardData.actividades,
          estado: wizardData.estado
        };
        onComplete(completeData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canGoNext = isStepComplete(currentStep);
  const canGoPrevious = currentStep > 0;

  // Renderizar contenido del paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConfiguracionCabecera
            isOpen={true}
            onClose={() => {}}
            onContinue={handleConfiguracionComplete}
            initialData={wizardData.configuracion}
          />
        );

      case 1:
        return (
          <DefinicionActividades
            isOpen={true}
            onClose={() => {}}
            onContinue={handleActividadesComplete}
            initialData={wizardData.actividades}
          />
        );

      case 2:
        return (
          <VerificacionProceso
            isOpen={true}
            onClose={() => {}}
            onContinue={handleVerificacionComplete}
            configuracionData={wizardData.configuracion!}
            actividadesData={wizardData.actividades!}
          />
        );

             case 3:
         return (
           <FinalizacionProceso
             isOpen={true}
             onClose={() => {}}
             onFinalizar={handleFinalizacionComplete}
             configuracionData={wizardData.configuracion!}
           />
         );

      default:
        return null;
    }
  };

  return (
    <Stepper
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Proceso"
      subtitle="Sigue los pasos para crear un proceso de negocio completo"
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onFinish={handleFinish}
      canGoNext={canGoNext}
      canGoPrevious={canGoPrevious}
      isLoading={isLoading}
      showStepNumbers={true}
      allowStepClick={false} // Solo permitir navegaciÃ³n secuencial
      forcedClose={true} // Evitar cierre accidental al hacer clic fuera
      nextButtonText="Continuar"
      prevButtonText="AtrÃ¡s"
    >
      <div style={{ 
        minHeight: '500px',
        backgroundColor: colors.background,
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {renderStepContent()}
      </div>
    </Stepper>
  );
};
