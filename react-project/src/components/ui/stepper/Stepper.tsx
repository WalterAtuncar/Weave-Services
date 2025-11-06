import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { StepIndicator } from './StepIndicator';
import { StepperProps } from './types';
import styles from './Stepper.module.css';

export const Stepper: React.FC<StepperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  steps,
  currentStep,
  onStepChange,
  children,
  
  // Configuración de botones
  nextButtonText = 'Siguiente',
  nextButtonIcon: NextIcon = ChevronRight,
  prevButtonText = 'Anterior',
  prevButtonIcon: PrevIcon = ChevronLeft,
  
  // Funciones de navegación
  onNext,
  onPrevious,
  onFinish,
  
  // Control de navegación
  canGoNext = true,
  canGoPrevious = true,
  isLoading = false,
  
  // Configuración adicional
  showStepNumbers = false,
  allowStepClick = false,
  forcedClose = true, // Por defecto true para evitar cierres accidentales
  className = '',
  // NUEVO
  hideNextButton = false,
  // Modo inline (embebido en la página)
  inline = false
}) => {
  const { colors, theme } = useTheme();

  // Ref del contenedor scrollable para forzar scroll al tope en cada cambio de step
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Manejo de teclas ESC y cleanup mejorado
  useEffect(() => {
    // En modo inline no forzamos overflow ni escuchamos ESC global
    if (inline) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Usar setTimeout para asegurar que el cleanup se ejecute después de que el DOM se actualice
      setTimeout(() => {
        document.body.style.overflow = 'unset';
      }, 0);
    };
  }, [isOpen, onClose, inline]);

  // Al cambiar de paso, llevar el contenedor de contenido al tope
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [currentStep]);

  // Navegación
  const handleNext = async () => {
    if (isLoading) return;
    
    const isLastStep = currentStep === steps.length - 1;
    
    if (isLastStep && onFinish) {
      await onFinish();
    } else {
      if (onNext) {
        await onNext();
      }
      if (currentStep < steps.length - 1) {
        onStepChange(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (isLoading) return;
    
    if (onPrevious) {
      onPrevious();
    }
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (isLoading) return;
    onStepChange(stepIndex);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (inline) return; // En inline no hay overlay
    if (!forcedClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const finalNextButtonText = isLastStep ? 'Finalizar' : nextButtonText;

  const shouldHideNextButton = hideNextButton; // Ocultar solo si el padre lo solicita

  // Reemplazo: evitar componente inline Container que provoca remounts en cada render
  return inline ? (
    <div
      className={`${styles.stepperInline} ${className}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border
      }}
    >
      {/* Header */}
      <div 
        className={styles.stepperHeader}
        style={{ 
          borderBottomColor: colors.border,
          backgroundColor: theme === 'light' ? colors.primary : colors.surface,
          color: theme === 'light' ? '#FFFFFF' : colors.text
        }}
      >
        <div className={styles.headerContent}>
          <h2 className={styles.headerTitle}>{title}</h2>
          {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
        </div>
        {/* En inline no mostramos botón de cierre */}
        {/* {!inline && (
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar stepper"
            style={{ color: theme === 'light' ? '#FFFFFF' : colors.text }}
          >
            <X size={16} />
          </button>
        )} */}
      </div>

      {/* Step Indicator */}
      <div 
        className={styles.stepIndicator}
        style={{ borderBottomColor: colors.border }}
      >
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={allowStepClick ? handleStepClick : undefined}
          showNumbers={showStepNumbers}
          allowClick={allowStepClick}
        />
      </div>

      {/* Content */}
      <div 
        className={`${styles.stepperContent} ${inline ? styles.inlineContent : ''}`}
        style={{ backgroundColor: colors.surface }}
        ref={contentRef}
      >
        {children}
      </div>

      {/* Footer */}
      <div 
        className={styles.stepperFooter}
        style={{ borderTopColor: colors.border }}
      >
        <button
          className={`${styles.footerButton} ${styles.prevButton}`}
          onClick={handlePrevious}
          disabled={isFirstStep || !canGoPrevious || isLoading}
          style={{
            borderColor: colors.border,
            color: colors.textSecondary,
            backgroundColor: 'transparent'
          }}
        >
          <PrevIcon size={16} />
          {prevButtonText}
        </button>

        {!shouldHideNextButton && (
          <button
            className={`${styles.footerButton} ${styles.nextButton} ${theme === 'dark' ? styles.darkTheme : ''} ${isLoading ? styles.loading : ''}`}
            onClick={handleNext}
            disabled={!canGoNext || isLoading}
            style={theme === 'dark' ? {} : {
              backgroundColor: colors.primary,
              color: '#FFFFFF'
            }}
          >
            {isLoading ? (
              <>
                <div className={styles.buttonSpinner} />
                Procesando...
              </>
            ) : (
              <>
                {finalNextButtonText}
                <NextIcon size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  ) : (
    <div 
      className={styles.stepperOverlay}
      onClick={handleOverlayClick}
    >
      <div 
        className={`${styles.stepperModal} ${className}`}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border
        }}
      >
        {/* Header */}
        <div 
          className={styles.stepperHeader}
          style={{ 
            borderBottomColor: colors.border,
            backgroundColor: theme === 'light' ? colors.primary : colors.surface,
            color: theme === 'light' ? '#FFFFFF' : colors.text
          }}
        >
          <div className={styles.headerContent}>
            <h2 className={styles.headerTitle}>{title}</h2>
            {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar stepper"
            style={{ color: theme === 'light' ? '#FFFFFF' : colors.text }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div 
          className={styles.stepIndicator}
          style={{ borderBottomColor: colors.border }}
        >
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={allowStepClick ? handleStepClick : undefined}
            showNumbers={showStepNumbers}
            allowClick={allowStepClick}
          />
        </div>

        {/* Content */}
        <div 
          className={`${styles.stepperContent} ${inline ? styles.inlineContent : ''}`}
          style={{ backgroundColor: colors.surface }}
          ref={contentRef}
        >
          {children}
        </div>

        {/* Footer */}
        <div 
          className={styles.stepperFooter}
          style={{ borderTopColor: colors.border }}
        >
          <button
            className={`${styles.footerButton} ${styles.prevButton}`}
            onClick={handlePrevious}
            disabled={isFirstStep || !canGoPrevious || isLoading}
            style={{
              borderColor: colors.border,
              color: colors.textSecondary,
              backgroundColor: 'transparent'
            }}
          >
            <PrevIcon size={16} />
            {prevButtonText}
          </button>

          {!shouldHideNextButton && (
            <button
              className={`${styles.footerButton} ${styles.nextButton} ${theme === 'dark' ? styles.darkTheme : ''} ${isLoading ? styles.loading : ''}`}
              onClick={handleNext}
              disabled={!canGoNext || isLoading}
              style={theme === 'dark' ? {} : {
                backgroundColor: colors.primary,
                color: '#FFFFFF'
              }}
            >
              {isLoading ? (
                <>
                  <div className={styles.buttonSpinner} />
                  Procesando...
                </>
              ) : (
                <>
                  {finalNextButtonText}
                  <NextIcon size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};