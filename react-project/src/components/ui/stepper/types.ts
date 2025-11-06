import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface StepConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  isCompleted?: boolean;
  isOptional?: boolean;
}

export interface StepperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  steps: StepConfig[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: ReactNode;
  /** Renderiza el Stepper embebido en la página en lugar de modal */
  inline?: boolean;
  
  // Configuración de botones
  nextButtonText?: string;
  nextButtonIcon?: LucideIcon;
  prevButtonText?: string;
  prevButtonIcon?: LucideIcon;
  
  // Funciones de navegación
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  onFinish?: () => void | Promise<void>;
  
  // Control de navegación
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLoading?: boolean;
  
  // Configuración adicional
  showStepNumbers?: boolean;
  allowStepClick?: boolean;
  forcedClose?: boolean; // Si es true, solo se puede cerrar con botón/ESC, no con clic fuera
  className?: string;
  // NUEVO: Permite ocultar el botón "Siguiente"
  hideNextButton?: boolean;
}

export interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  showNumbers?: boolean;
  allowClick?: boolean;
}