import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { Badge } from '../badge/badge';
import { AlertService } from '../alerts';
import { 
  Save, 
  Send, 
  FileText, 
  Edit3, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Info
} from 'lucide-react';
import styles from './CRUDConfirmationModal.module.css';

// =============================================
// INTERFACES
// =============================================

export interface CRUDConfirmationModalProps {
  isOpen: boolean;
  tipoOperacion: 'CREAR' | 'EDITAR' | 'ELIMINAR';
  entidadNombre: string;
  entidadTipo: string;
  datosEntidad: any;
  onClose: () => void;
  onConfirm: (action: 'BORRADOR' | 'NOTIFICAR') => void;
  onCancel: () => void;
  /** Indica si la entidad original tiene GobernanzaId para permitir workflow */
  hasGobernanzaId?: boolean;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const CRUDConfirmationModal: React.FC<CRUDConfirmationModalProps> = ({
  isOpen,
  tipoOperacion,
  entidadNombre,
  entidadTipo,
  datosEntidad,
  onClose,
  onConfirm,
  onCancel,
  hasGobernanzaId = true
}) => {
  const { colors } = useTheme();
  
  const [selectedAction, setSelectedAction] = useState<'BORRADOR' | 'NOTIFICAR'>('BORRADOR');
  const [submitting, setSubmitting] = useState(false);

  // =============================================
  // FUNCIONES
  // =============================================

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(selectedAction);
    } finally {
      setSubmitting(false);
    }
  };

  // =============================================
  // RENDER FUNCTIONS
  // =============================================

  const getOperacionIcon = () => {
    switch (tipoOperacion) {
      case 'CREAR': return <FileText size={24} color="#10b981" />;
      case 'EDITAR': return <Edit3 size={24} color="#f59e0b" />;
      case 'ELIMINAR': return <Trash2 size={24} color="#ef4444" />;
      default: return <FileText size={24} color="#6b7280" />;
    }
  };

  const getOperacionColor = () => {
    switch (tipoOperacion) {
      case 'CREAR': return '#10b981';
      case 'EDITAR': return '#f59e0b';
      case 'ELIMINAR': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getOperacionText = () => {
    switch (tipoOperacion) {
      case 'CREAR': return 'Crear';
      case 'EDITAR': return 'Editar';
      case 'ELIMINAR': return 'Eliminar';
      default: return 'Procesar';
    }
  };

  const renderActionOption = (action: 'BORRADOR' | 'NOTIFICAR') => {
    const isBorrador = action === 'BORRADOR';
    const isSelected = selectedAction === action;
    const isDisabled = !isBorrador && !hasGobernanzaId;

    return (
      <div
        key={action}
        className={`${styles.actionOption} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
        onClick={() => !isDisabled && setSelectedAction(action)}
        style={{
          borderColor: isSelected ? colors.primary : colors.border,
          backgroundColor: isSelected ? `${colors.primary}10` : colors.background,
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer'
        }}
      >
        <div className={styles.actionHeader}>
          <div className={styles.actionIcon}>
            {isBorrador ? (
              <Save size={20} color={isSelected ? colors.primary : '#6b7280'} />
            ) : (
              <Send size={20} color={isDisabled ? '#9ca3af' : (isSelected ? colors.primary : '#6b7280')} />
            )}
          </div>
          <div className={styles.actionInfo}>
            <h4 style={{ color: isDisabled ? '#9ca3af' : (isSelected ? colors.primary : colors.text) }}>
              {isBorrador ? 'Guardar como Borrador' : 'Grabar y Notificar'}
              {isDisabled && ' (Requiere Gobernanza)'}
            </h4>
            <p style={{ color: isDisabled ? '#9ca3af' : colors.textSecondary }}>
              {isBorrador 
                ? 'Guardar sin iniciar proceso de aprobación'
                : isDisabled 
                  ? 'No disponible: La entidad debe tener un Gobierno asignado para iniciar el workflow de aprobación'
                  : 'Iniciar proceso de aprobación'
              }
            </p>
          </div>
          <div className={styles.actionIndicator}>
            {isSelected && <CheckCircle size={16} color={colors.primary} />}
          </div>
        </div>

        <div className={styles.actionDetails}>
          {isBorrador ? (
            <div className={styles.borradorDetails}>
              <div className={styles.detailItem}>
                <Clock size={14} color="#6b7280" />
                <span>Estado: Borrador</span>
              </div>
              <div className={styles.detailItem}>
                <Info size={14} color="#6b7280" />
                <span>Solo visible para el creador</span>
              </div>
              <div className={styles.detailItem}>
                <FileText size={14} color="#6b7280" />
                <span>Se puede editar libremente</span>
              </div>
            </div>
          ) : (
            <div className={styles.notificarDetails}>
              <div className={styles.detailItem}>
                <Send size={14} color="#f59e0b" />
                <span>Notifica a Owner y Sponsor</span>
              </div>
              <div className={styles.detailItem}>
                <Clock size={14} color="#f59e0b" />
                <span>Inicia proceso de aprobación</span>
              </div>
              <div className={styles.detailItem}>
                <AlertTriangle size={14} color="#f59e0b" />
                <span>No se puede editar hasta aprobación</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // ✅ CORREGIDO: Permitir ambas opciones para CREAR y EDITAR
  // Solo para ELIMINAR forzar la opción de notificar
  const showBothOptions = tipoOperacion === 'CREAR' || tipoOperacion === 'EDITAR';
  const forceNotificar = tipoOperacion === 'ELIMINAR';
  const canNotificar = hasGobernanzaId;

  // Si no tiene gobernanza y está seleccionado NOTIFICAR, cambiar a BORRADOR
  if (!canNotificar && selectedAction === 'NOTIFICAR') {
    setSelectedAction('BORRADOR');
  }

  if (forceNotificar && selectedAction === 'BORRADOR') {
    setSelectedAction('NOTIFICAR');
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ backgroundColor: colors.background }}>
        <div className={styles.header} style={{ 
          backgroundColor: colors.primary,
          borderBottomColor: colors.primary
        }}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              {getOperacionIcon()}
            </div>
            <div>
              <h2 style={{ color: '#ffffff' }}>
                Confirmar {getOperacionText()} - {entidadTipo}
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {entidadNombre}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} color="#ffffff" />
          </button>
        </div>

        <div className={styles.content}>
          {/* Información de la operación */}
          <div className={styles.operacionSection}>
            <div className={styles.operacionCard} style={{ backgroundColor: colors.surface }}>
              <div className={styles.operacionHeader}>
                <Badge
                  label={tipoOperacion}
                  color={getOperacionColor()}
                  size="m"
                  variant="subtle"
                />
                <h3>Resumen de la Operación</h3>
              </div>
              
              {datosEntidad && (
                <div className={styles.datosGrid}>
                  {Object.entries(datosEntidad).slice(0, 6).map(([key, value]) => (
                    <div key={key} className={styles.datoItem}>
                      <span className={styles.datoLabel}>{key}:</span>
                      <span className={styles.datoValue}>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Opciones de acción */}
          <div className={styles.actionsSection}>
            <h3 style={{ color: colors.text }}>
              {showBothOptions ? '¿Cómo desea proceder?' : 'Confirmar Acción'}
            </h3>
            
            {showBothOptions ? (
              <p style={{ color: colors.textSecondary }}>
                Seleccione si desea guardar como borrador o iniciar el proceso de aprobación:
              </p>
            ) : (
              <p style={{ color: colors.textSecondary }}>
                Esta operación requerirá aprobación del gobierno:
              </p>
            )}

            <div className={styles.actionsGrid}>
              {showBothOptions && renderActionOption('BORRADOR')}
              {renderActionOption('NOTIFICAR')}
            </div>
          </div>

          {/* Información adicional */}
          {selectedAction === 'NOTIFICAR' && (
            <div className={styles.approvalInfo} style={{ backgroundColor: colors.surface }}>
              <div className={styles.approvalHeader}>
                <Send size={16} color="#f59e0b" />
                <h4>Proceso de Aprobación</h4>
              </div>
              <div className={styles.approvalSteps}>
                <div className={styles.approvalStep}>
                  <span className={styles.stepNumber}>1</span>
                  <span>Se notifica al <strong>Owner</strong> para aprobación</span>
                </div>
                <div className={styles.approvalStep}>
                  <span className={styles.stepNumber}>2</span>
                  <span>Luego se notifica al <strong>Sponsor</strong> para aprobación final</span>
                </div>
                <div className={styles.approvalStep}>
                  <span className={styles.stepNumber}>3</span>
                  <span>
                    {tipoOperacion === 'ELIMINAR'
                      ? `Una vez aprobado, el ${entidadTipo.toLowerCase()} será eliminado`
                      : `Una vez aprobado, el ${entidadTipo.toLowerCase()} quedará activo`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer} style={{ borderTopColor: colors.border }}>
          <div className={styles.footerInfo}>
            <span style={{ color: colors.textSecondary }}>
              {selectedAction === 'BORRADOR' 
                ? 'Se guardará sin notificaciones'
                : 'Se enviará a proceso de aprobación'
              }
            </span>
          </div>
          <div className={styles.footerActions}>
            <Button
              variant="outline"
              size="m"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              size="m"
              onClick={handleConfirm}
              disabled={submitting || (selectedAction === 'NOTIFICAR' && !hasGobernanzaId)}
              loading={submitting}
              iconName={selectedAction === 'BORRADOR' ? 'Save' : 'Send'}
            >
              {submitting 
                ? 'Procesando...' 
                : selectedAction === 'BORRADOR' 
                  ? 'Guardar Borrador' 
                  : 'Enviar a Aprobación'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};