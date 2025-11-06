import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Modal } from '../modal';
import { Button } from '../button';
import { XCircle, AlertTriangle } from 'lucide-react';

import styles from './RejectionModal.module.css';

// =============================================
// INTERFACES
// =============================================

export interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivoRechazo: string) => void;
  loading?: boolean;
  tareaNombre?: string;
  usuarioNombre?: string;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  tareaNombre = 'la tarea',
  usuarioNombre = 'Usuario'
}) => {
  const { colors } = useTheme();
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState<string | null>(null);

  // =============================================
  // FUNCIONES
  // =============================================

  const handleSubmit = () => {
    // Validar que el motivo no esté vacío
    if (!motivoRechazo.trim()) {
      setError('El motivo del rechazo es obligatorio');
      return;
    }

    // Validar longitud máxima (500 caracteres como en el backend)
    if (motivoRechazo.length > 500) {
      setError('El motivo del rechazo no puede exceder 500 caracteres');
      return;
    }

    // Limpiar error y ejecutar confirmación
    setError(null);
    onConfirm(motivoRechazo.trim());
  };

  const handleClose = () => {
    if (!loading) {
      setMotivoRechazo('');
      setError(null);
      onClose();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMotivoRechazo(value);
    
    // Limpiar error si el usuario empieza a escribir
    if (error && value.trim()) {
      setError(null);
    }
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirmar Rechazo"
      size="m"
      hideFooter={true}
      className="rejection-modal"
    >
      <div className={styles.container}>
        {/* Header con icono de advertencia */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <XCircle size={48} color="#ef4444" />
          </div>
          <div className={styles.headerText}>
            <h3 style={{ color: colors.text }}>
              ¿Estás seguro de rechazar esta tarea?
            </h3>
            <p style={{ color: colors.textSecondary }}>
              Esta acción rechazará <strong>{tareaNombre}</strong> asignada a <strong>{usuarioNombre}</strong>
            </p>
          </div>
        </div>

        {/* Advertencia */}
        <div className={styles.warning} style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <span style={{ color: '#92400e' }}>
            El rechazo cancelará todo el proceso de aprobación y notificará al solicitante.
          </span>
        </div>

        {/* Campo de motivo */}
        <div className={styles.formGroup}>
          <label 
            htmlFor="motivoRechazo" 
            className={styles.label}
            style={{ color: colors.text }}
          >
            Motivo del Rechazo <span className={styles.required}>*</span>
          </label>
          <textarea
            id="motivoRechazo"
            value={motivoRechazo}
            onChange={handleTextareaChange}
            placeholder="Describe el motivo por el cual rechazas esta tarea..."
            className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
            style={{
              backgroundColor: colors.surface,
              borderColor: error ? '#ef4444' : colors.border,
              color: colors.text
            }}
            rows={4}
            maxLength={500}
            disabled={loading}
          />
          
          {/* Contador de caracteres */}
          <div className={styles.characterCount}>
            <span 
              style={{ 
                color: motivoRechazo.length > 450 ? '#ef4444' : colors.textSecondary 
              }}
            >
              {motivoRechazo.length}/500 caracteres
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error}>
              <AlertTriangle size={14} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="m"
            onClick={handleClose}
            disabled={loading}
            style={{
              borderColor: colors.border,
              color: colors.text
            }}
          >
            Cancelar
          </Button>
          
          <Button
            variant="default"
            size="m"
            onClick={handleSubmit}
            disabled={loading || !motivoRechazo.trim()}
            backgroundColor="#ef4444"
            textColor="#ffffff"
            iconName={loading ? undefined : "XCircle"}
          >
            {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};