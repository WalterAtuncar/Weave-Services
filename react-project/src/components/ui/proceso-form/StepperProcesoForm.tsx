import React from 'react';
import { Stepper } from '../stepper';
import { StepConfig } from '../stepper/types';
import { 
  MessageSquareText, 
  ListChecks, 
  ShieldCheck, 
  Eye
} from 'lucide-react';

export interface StepperProcesoFormProps {
  title?: string;
  subtitle?: string;
  steps?: StepConfig[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  onFinish?: () => void | Promise<void>;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLoading?: boolean;
  hideNextButton?: boolean;
  className?: string;
  children: React.ReactNode;
}

const DEFAULT_STEPS: StepConfig[] = [
  { id: 'describe', label: 'Describe el proceso', icon: MessageSquareText },
  { id: 'datos', label: 'Datos y Actividades', icon: ListChecks },
  { id: 'gobernanza', label: 'Gobierno y aprobación', icon: ShieldCheck },
  { id: 'visualizar', label: 'Visualizar y Confirmar', icon: Eye }
];

export const StepperProcesoForm: React.FC<StepperProcesoFormProps> = ({
  title = 'Crear/Editar Proceso',
  subtitle = 'Completa los pasos para definir el proceso',
  steps = DEFAULT_STEPS,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onFinish,
  canGoNext = true,
  canGoPrevious = true,
  isLoading = false,
  hideNextButton = false,
  className = '',
  children
}) => {
  return (
    <Stepper
      isOpen={true}
      onClose={() => {}}
      title={title}
      subtitle={subtitle}
      steps={steps}
      currentStep={currentStep}
      onStepChange={onStepChange}
      onNext={onNext}
      onPrevious={onPrevious}
      onFinish={onFinish}
      canGoNext={canGoNext}
      canGoPrevious={canGoPrevious}
      isLoading={isLoading}
      showStepNumbers={true}
      allowStepClick={false}
      forcedClose={true}
      nextButtonText={currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
      prevButtonText={'Anterior'}
      hideNextButton={hideNextButton}
      inline
      className={className}
    >
      {children}
    </Stepper>
  );
};

export default StepperProcesoForm;