import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { StepIndicatorProps } from './types';
import styles from './Stepper.module.css';

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  showNumbers = false,
  allowClick = false
}) => {
  const { colors, theme } = useTheme();

  const handleStepClick = (index: number) => {
    if (allowClick && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className={styles.stepIndicator}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = step.isCompleted || index < currentStep;
        const isClickable = allowClick && (isCompleted || index <= currentStep);

        return (
          <div key={step.id} className={styles.stepWrapper}>
            {/* Línea conectora */}
            {index > 0 && (
              <div 
                className={`${styles.stepConnector} ${isCompleted ? styles.completed : ''}`}
                style={{
                  backgroundColor: isCompleted 
                    ? colors.primary 
                    : theme === 'dark' ? '#374151' : '#E5E7EB'
                }}
              />
            )}
            
            {/* Indicador del paso */}
            <div 
              className={`
                ${styles.stepItem} 
                ${isActive ? styles.active : ''} 
                ${isCompleted ? styles.completed : ''} 
                ${isClickable ? styles.clickable : ''}
                ${isActive && theme === 'dark' ? styles.darkThemeSelected : ''}
                ${isCompleted && !isActive && theme === 'dark' ? styles.darkThemeCompleted : ''}
              `}
              onClick={() => handleStepClick(index)}
              style={(isActive && theme === 'dark') || (isCompleted && !isActive && theme === 'dark') ? {} : {
                backgroundColor: isActive || isCompleted 
                  ? colors.primary 
                  : theme === 'dark' ? '#374151' : '#F3F4F6',
                borderColor: isActive 
                  ? colors.primary 
                  : theme === 'dark' ? '#4B5563' : '#D1D5DB',
                color: isActive || isCompleted 
                  ? '#FFFFFF' 
                  : theme === 'dark' ? '#9CA3AF' : '#6B7280'
              }}
            >
              {isCompleted && !isActive ? (
                <Check size={16} />
              ) : showNumbers ? (
                <span className={styles.stepNumber}>{index + 1}</span>
              ) : (
                <step.icon size={16} />
              )}
            </div>

            {/* Label del paso */}
            <div className={styles.stepLabel}>
              <span 
                className={`${styles.stepTitle} ${isActive ? styles.activeTitle : ''}`}
                style={{
                  color: isActive 
                    ? colors.primary 
                    : theme === 'dark' ? '#D1D5DB' : '#4B5563'
                }}
                title={step.label}
              >
                {step.label}
              </span>
              {step.isOptional && (
                <span 
                  className={styles.optionalText}
                  style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                >
                  (Opcional)
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};