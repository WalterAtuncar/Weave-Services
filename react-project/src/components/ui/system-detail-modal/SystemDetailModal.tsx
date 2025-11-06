import React from 'react';
import { Eye, Database } from 'lucide-react';
import { Modal } from '../modal/Modal';
import { SystemFormWithModules } from '../system-form';
import { Sistema } from '../../../models/Sistemas';

export interface SystemDetailModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Sistema a mostrar */
  sistema: Sistema | null;
  /** ID de la organización */
  organizacionId: number;
}

export const SystemDetailModal: React.FC<SystemDetailModalProps> = ({
  isOpen,
  onClose,
  sistema,
  organizacionId
}) => {
  if (!sistema) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles del Sistema: ${sistema.nombreSistema}`}
      size="l"
      hideFooter={true}
      forcedClose={false}
      closeOnEscape={true}
      className="system-detail-modal"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Eye size={20} />
        <span style={{ fontSize: '14px', opacity: 0.8 }}>
          Vista detallada del sistema en modo solo lectura
        </span>
      </div>

      <SystemFormWithModules
        sistema={sistema}
        organizacionId={organizacionId}
        onSubmit={async () => {}} // No se usa en modo solo lectura
        onCancel={onClose}
        isLoading={false}
        disabled={true} // Modo solo lectura
        showActions={false} // No mostrar botones de acción
        compact={true} // ✅ CAMBIO: Modo compacto como en edición
        showModules={true}
        modulesReadOnly={true} // Módulos también en solo lectura
      />
    </Modal>
  );
};