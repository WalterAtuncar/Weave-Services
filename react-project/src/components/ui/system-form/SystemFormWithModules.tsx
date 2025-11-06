import React, { useState, useRef } from 'react';
import { SystemForm, SystemFormProps } from './SystemForm';
import { ModuleForm } from '../module-form/ModuleForm';
import { Button } from '../button/button';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Sistema, 
  SistemaModulo, 
  CreateSistemaDto, 
  UpdateSistemaDto 
} from '../../../models/Sistemas';
import styles from './SystemFormWithModules.module.css';

export interface SystemFormWithModulesProps extends Omit<SystemFormProps, 'onSubmit'> {
  /** Función llamada al enviar el formulario con sistema y módulos */
  onSubmit: (
    sistemaData: CreateSistemaDto | UpdateSistemaDto,
    modulos: SistemaModulo[]
  ) => Promise<void>;
  /** Función llamada cuando cambian los módulos */
  onModulosChange?: (modulos: SistemaModulo[]) => void;
  /** Mostrar sección de módulos */
  showModules?: boolean;
  /** Solo lectura para módulos */
  modulesReadOnly?: boolean;
  /** ID de la organización */
  organizacionId?: number;
  /** Función llamada para ver la gobernanza del sistema */
  onGovernance?: (sistema: Sistema) => void;
}

export const SystemFormWithModules: React.FC<SystemFormWithModulesProps> = ({
  sistema,
  organizacionId,
  onSubmit,
  onCancel,
  onModulosChange,
  showModules = true,
  modulesReadOnly = false,
  isLoading = false,
  disabled = false,
  showActions = true,
  compact = false,
  onGovernance
}) => {
  const { colors } = useTheme();
  const isEditing = !!sistema;
  
  // Estado para los módulos
  const [modulos, setModulos] = useState<SistemaModulo[]>(sistema?.modulos || []);
  // Estado para manejar el loading del submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ref para acceder al formulario del sistema
  const systemFormRef = useRef<HTMLFormElement>(null);

  // Manejar cambios en módulos
  const handleModulosChange = (newModulos: SistemaModulo[]) => {
    setModulos(newModulos);
    if (onModulosChange) {
      onModulosChange(newModulos);
    }
  };

  // Manejar envío del formulario completo
  const handleSystemSubmit = async (sistemaData: CreateSistemaDto | UpdateSistemaDto) => {
    setIsSubmitting(true);
    try {
      await onSubmit(sistemaData, modulos);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar el submit desde los botones al final (solo en modo CREATE)
  const handleFinalSubmit = async () => {
    // Hacer submit del formulario del sistema programáticamente
    if (systemFormRef.current) {
      // Disparar el evento submit del formulario
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      systemFormRef.current.dispatchEvent(submitEvent);
    }
  };

  return (
    <div className={`${styles.systemFormWithModules} ${compact ? styles.compact : ''}`}>
      {/* Formulario principal del sistema */}
      <SystemForm
        ref={systemFormRef}
        sistema={sistema}
        organizacionId={organizacionId}
        onSubmit={handleSystemSubmit}
        onCancel={onCancel}
        isLoading={isLoading || isSubmitting}
        disabled={disabled}
        showActions={isEditing ? showActions : false} // En modo CREATE, ocultar botones del SystemForm
        compact={compact}
        onGovernance={onGovernance}
      />

      {/* Sección de módulos - Mostrar tanto para creación como para edición */}
      {showModules && (
        <div className={styles.modulesSection}>
          <div className={styles.modulesSeparator} style={{ borderColor: colors.border }} />
          
          <ModuleForm
            sistemaId={sistema?.sistemaId}
            modulos={modulos}
            onModulosChange={handleModulosChange}
            loading={isLoading || isSubmitting}
            disabled={disabled || modulesReadOnly}
            compact={compact}
            readOnly={modulesReadOnly}
          />
        </div>
      )}

      {/* Botones de acción al final - Solo en modo CREATE */}
      {!isEditing && showActions && (
        <div className={styles.finalActions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={disabled || isSubmitting}
            iconName="X"
            iconPosition="left"
          >
            Cancelar
          </Button>
          
          <Button
            type="button"
            variant="default"
            onClick={handleFinalSubmit}
            disabled={disabled || isSubmitting}
            iconName="Save"
            iconPosition="left"
          >
            Crear Sistema
          </Button>
        </div>
      )}
    </div>
  );
};