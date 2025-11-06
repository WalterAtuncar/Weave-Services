import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertService } from '../../ui/alerts';
import { StepperProcesoForm } from '../../ui/proceso-form/StepperProcesoForm';
import { DescribeProcesoStep } from '../../ui/proceso-form/steps/DescribeProcesoStep';
import { DatosActividadesStep } from '../../ui/proceso-form/steps/DatosActividadesStep';
import { GobernanzaAprobacionStep } from '../../ui/proceso-form/steps/GobernanzaAprobacionStep';
import { VisualizarConfirmarStep } from '../../ui/proceso-form/steps/VisualizarConfirmarStep';
import type { RelatedEntitiesMap } from '../../ui/related-entities/types';

export interface ProcesoStepperPageProps {
  className?: string;
}

export const ProcesoStepperPage: React.FC<ProcesoStepperPageProps> = ({
  className = ''
}) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [descripcion, setDescripcion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [entidadesRelacionadas, setEntidadesRelacionadas] = useState<RelatedEntitiesMap>({});

  const canGoNext = currentStep === 0 ? (descripcion.trim().length >= 10) : true;
  const canGoPrevious = currentStep > 0;

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      AlertService.success('Proceso preparado para confirmación', {
        title: 'Stepper completado'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerarProceso = () => {
    AlertService.info('Generando información del proceso a partir de la descripción...', {
      title: 'Generar Proceso'
    });
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <DescribeProcesoStep
            descripcion={descripcion}
            onDescripcionChange={setDescripcion}
            onGenerarProceso={onGenerarProceso}
            onAsistenteIA={() => AlertService.info('Abrir asistente IA (placeholder)')}
            onDesdeArchivo={() => AlertService.info('Importar desde archivo (placeholder)')}
            onUsarDatosProceso={() => AlertService.info('Rellenar desde datos del proceso (placeholder)')}
            entidadesRelacionadas={entidadesRelacionadas}
            onEntidadesRelacionadasChange={setEntidadesRelacionadas}
          />
        );
      case 1:
        return <DatosActividadesStep />;
      case 2:
        return <GobernanzaAprobacionStep />;
      case 3:
        return <VisualizarConfirmarStep />;
      default:
        return null;
    }
  };

  return (
    <div className={className} style={{ padding: '16px' }}>
      <StepperProcesoForm
        title="Crear Proceso"
        subtitle="Paso a paso: Describe, define datos, gobierna y confirma"
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onFinish={handleFinish}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        isLoading={isLoading}
      >
        <div style={{ backgroundColor: colors.background, borderRadius: 8, minHeight: 420 }}>
          {renderContent()}
        </div>
      </StepperProcesoForm>
    </div>
  );
};

export default ProcesoStepperPage;