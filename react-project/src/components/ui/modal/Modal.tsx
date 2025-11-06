import React, { useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../button/button';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './Modal.module.css';

export type ModalSize = 's' | 'm' | 'l' | 'xl';

export interface ModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Título del modal */
  title: string;
  /** Tamaño predefinido del modal */
  size?: ModalSize;
  /** Ancho personalizado (sobrescribe el size) */
  width?: string | number;
  /** Alto personalizado (sobrescribe el size) */
  height?: string | number;
  /** Contenido del modal */
  children: React.ReactNode;
  /** Texto del botón de guardar */
  saveButtonText?: string;
  /** Texto del botón de cancelar */
  cancelButtonText?: string;
  /** Función al hacer click en guardar */
  onSave?: () => void;
  /** Función al hacer click en cancelar */
  onCancel?: () => void;
  /** Desactivar el botón de guardar */
  saveDisabled?: boolean;
  /** Desactivar el botón de cancelar */
  cancelDisabled?: boolean;
  /** Mostrar loading en el botón de guardar */
  saveButtonLoading?: boolean;
  /** Desactivar el botón de guardar por loading */
  saveButtonDisabled?: boolean;
  /** Ocultar el footer */
  hideFooter?: boolean;
  /** Forzar cierre solo con botones (no permite cerrar con click fuera) */
  forcedClose?: boolean;
  /** Permitir cerrar con tecla Escape */
  closeOnEscape?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'm',
  width,
  height,
  children,
  saveButtonText = 'Guardar',
  cancelButtonText = 'Cancelar',
  onSave,
  onCancel,
  saveDisabled = false,
  cancelDisabled = false,
  hideFooter = false,
  forcedClose = true,
  closeOnEscape = true,
  className = ''
}) => {
  const { colors, theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Manejar tecla Escape
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar click fuera del modal
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Solo cerrar si el click fue directamente en el backdrop, no en elementos internos
    if (!forcedClose && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Prevenir que los clicks en el contenido del modal se propaguen al backdrop
  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  // Manejar botón cancelar
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  // Obtener estilos de tamaño
  const getSizeStyles = (): React.CSSProperties => {
    if (width || height) {
      return {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        maxWidth: '95vw',
        maxHeight: '95vh'
      };
    }

    const sizeMap = {
      s: { width: '400px', maxHeight: '300px' },
      m: { width: '600px', maxHeight: '500px' },
      l: { width: '800px', maxHeight: '700px' },
      xl: { width: '1000px', maxHeight: '800px' }
    };

    return {
      ...sizeMap[size],
      maxWidth: '95vw',
      maxHeight: '95vh'
    };
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.modalOverlay}
      onClick={handleBackdropClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        ref={modalRef}
        className={`${styles.modalContainer} ${className}`}
        onClick={handleContentClick}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          ...getSizeStyles()
        }}
      >
        {/* Header */}
        <div 
          className={styles.modalHeader}
          style={{
            backgroundColor: theme === 'dark' ? '#374151' : colors.primary,
            borderBottomColor: theme === 'dark' ? '#4b5563' : colors.primary
          }}
        >
          <h2 
            className={styles.modalTitle}
            style={{ 
              color: theme === 'dark' ? '#f1f5f9' : colors.background
            }}
          >
            {title}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            style={{
              color: theme === 'dark' ? '#f1f5f9' : colors.background,
              backgroundColor: 'transparent'
            }}
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className={styles.modalContent}
          style={{ backgroundColor: colors.surface }}
        >
          {children}
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div 
            className={styles.modalFooter}
            style={{
              backgroundColor: colors.background,
              borderTopColor: colors.border
            }}
          >
            <div className={styles.footerButtons}>
              <Button
                variant="custom"
                size="m"
                onClick={handleCancel}
                disabled={cancelDisabled}
                backgroundColor="#6B7280"
                textColor="#FFFFFF"
                iconName="X"
                iconPosition="left"
              >
                {cancelButtonText}
              </Button>
              
              <Button
                variant="custom"
                size="m"
                onClick={onSave}
                disabled={saveDisabled}
                backgroundColor="#10B981"
                textColor="#FFFFFF"
                iconName="Save"
                iconPosition="left"
              >
                {saveButtonText}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Modal };