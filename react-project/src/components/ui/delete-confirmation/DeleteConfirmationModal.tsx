import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from '../modal/Modal';
import { StatusBadge } from '../status-badge/StatusBadge';
import { SystemTypeIcon } from '../system-type-icon/SystemTypeIcon';
import { HierarchyIndicator } from '../hierarchy-indicator/HierarchyIndicator';
import { AlertService } from '../alerts/AlertService';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { Sistema, EstadoSistema } from '../../../models/Sistemas';
import { sistemasService } from '../../../services/sistemas.service';
import { DeleteSistemaRequest, Sistema as SistemaService } from '../../../services/types/sistemas.types';
import styles from './DeleteConfirmationModal.module.css';

export interface DeleteConfirmationModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Sistema a eliminar */
  sistema: Sistema | null;
  /** Función llamada después de eliminar exitosamente */
  onSuccess?: (sistemaId: number) => void;
  /** Función llamada si hay error */
  onError?: (error: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  sistema,
  onSuccess,
  onError
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();
  const organizacionId = organizationInfo?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [dependencies, setDependencies] = useState<Sistema[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

  // Cargar dependencias del sistema desde el backend
  const loadSystemDependencies = async (sistemaId: number) => {
    if (!organizacionId) return;

    setLoadingDependencies(true);
    try {
      // Obtener todos los sistemas de la organización para verificar dependencias
      const response = await sistemasService.getSistemasPaginated({
        organizacionId,
        includeDeleted: false,
        pageSize: 1000, // Obtener todos para verificar dependencias
        page: 1
      });

      if (response.success && response.data) {
        // Filtrar sistemas que dependen del sistema a eliminar
        const systemDependencies = response.data.data.filter((s: SistemaService) => 
          s.sistemaParentId === sistemaId && 
          s.estado === EstadoSistema.Activo
        );
        
        // Convertir sistemas del servicio al modelo Sistema
        const mappedDependencies: Sistema[] = systemDependencies.map((s: SistemaService) => ({
          sistemaId: s.id,
          organizacionId: 0, // No disponible en el servicio
          codigoSistema: s.codigo,
          nombreSistema: s.nombre,
          funcionPrincipal: s.descripcion || null,
          sistemaDepende: s.sistemaParentId || null,
          tipoSistema: 1, // Valor por defecto
          familiaSistema: s.familiaSistemaId,
          version: 1, // Valor por defecto
          estado: s.estado as EstadoSistema,
          creadoPor: s.creadoPor,
          fechaCreacion: s.fechaCreacion,
          actualizadoPor: s.actualizadoPor,
          fechaActualizacion: s.fechaActualizacion,
          registroEliminado: s.estado_registro !== 1,
          url: s.url || null
        }));
        
        setDependencies(mappedDependencies);
      } else {
        console.error('Error al cargar dependencias:', response.message);
        setDependencies([]);
      }
    } catch (error) {
      console.error('Error al cargar dependencias del sistema:', error);
      setDependencies([]);
    } finally {
      setLoadingDependencies(false);
    }
  };

  // Cargar dependencias cuando se abra el modal o cambie el sistema
  useEffect(() => {
    if (isOpen && sistema?.sistemaId) {
      loadSystemDependencies(sistema.sistemaId);
    } else {
      setDependencies([]);
    }
  }, [isOpen, sistema?.sistemaId, organizacionId]);

  // Eliminar sistema usando el servicio real
  const deleteSistema = async (sistemaId: number, motivo?: string): Promise<void> => {
    const request: DeleteSistemaRequest = {
      sistemaId,
      forceDelete: false,
      motivo
    };

    const response = await sistemasService.deleteSistema(request);

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar el sistema');
    }
  };

  // Manejar confirmación de eliminación
  const handleConfirmDelete = async () => {
    if (!sistema || isDeleting || !organizacionId) return;

    setIsDeleting(true);

    // Mostrar toast de loading
    const loadingToastId = AlertService.loading('Eliminando sistema...');

    try {
      const motivo = `Sistema eliminado desde la interfaz de usuario - ${new Date().toISOString()}`;
      await deleteSistema(sistema.sistemaId, motivo);

      // Actualizar toast de loading con éxito
      AlertService.updateLoading(
        loadingToastId,
        'success',
        '¡Sistema eliminado exitosamente!',
        3000
      );

      // Notificar éxito
      if (onSuccess) {
        onSuccess(sistema.sistemaId);
      }

      // Cerrar modal
      onClose();

    } catch (error) {
      console.error('Error al eliminar sistema:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado al eliminar el sistema';

      // Actualizar toast de loading con error
      AlertService.updateLoading(
        loadingToastId,
        'error',
        errorMessage,
        5000
      );

      // Notificar error
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!sistema) return null;

  const hasDependencies = dependencies.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación"
      size="m"
      saveButtonText="Eliminar Sistema"
      cancelButtonText="Cancelar"
      onSave={handleConfirmDelete}
      onCancel={onClose}
      saveDisabled={hasDependencies || isDeleting}
      saveButtonLoading={isDeleting}
      forcedClose={isDeleting}
      closeOnEscape={!isDeleting}
      className="delete-confirmation-modal"
    >
      <div className={styles.deleteConfirmation}>
        {/* Header de advertencia */}
        <div className={`${styles.warningHeader} ${hasDependencies ? styles.warningError : styles.warningCaution}`}>
          <AlertTriangle size={24} />
          <div>
            <h3 className={styles.warningTitle}>
              {hasDependencies ? 'No se puede eliminar' : 'Acción Irreversible'}
            </h3>
            <p className={styles.warningSubtitle}>
              {hasDependencies 
                ? 'Este sistema tiene dependencias activas' 
                : 'Esta acción no se puede deshacer'
              }
            </p>
          </div>
        </div>

        {/* Información del sistema */}
        <div className={styles.systemInfo}>
          <div className={styles.systemHeader}>
            <SystemTypeIcon familia={sistema.familiaSistema} size={24} />
            <div className={styles.systemDetails}>
              <h4 className={styles.systemName}>
                {sistema.nombreSistema}
              </h4>
              {sistema.codigoSistema && (
                <p className={styles.systemCode}>
                  Código: {sistema.codigoSistema}
                </p>
              )}
            </div>
            <StatusBadge 
              status={sistema.estado === EstadoSistema.Activo ? 'active' : 'inactive'}
            />
          </div>
          
          {sistema.funcionPrincipal && (
            <div className={styles.systemFunction}>
              <p>
                <strong>Función:</strong> {sistema.funcionPrincipal}
              </p>
            </div>
          )}

          {sistema.sistemaDepende_Nombre && (
            <div className={styles.systemDependency}>
              <HierarchyIndicator type="child" showLabel />
              <span>
                Depende de: <strong>{sistema.sistemaDepende_Nombre}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Mostrar dependencias si las hay */}
        {loadingDependencies ? (
          <div className={styles.loadingDependencies}>
            <p>Verificando dependencias...</p>
          </div>
        ) : hasDependencies ? (
          <div className={styles.dependenciesSection}>
            <div className={styles.dependenciesHeader}>
              <Trash2 size={20} />
              <h4>Sistemas que dependen de este sistema</h4>
            </div>
            <div className={styles.dependenciesList}>
              {dependencies.map(dep => (
                <div 
                  key={dep.sistemaId} 
                  className={styles.dependencyItem}
                >
                  <SystemTypeIcon familia={dep.familiaSistema} size={16} />
                  <span className={styles.dependencyName}>
                    {dep.nombreSistema}
                  </span>
                  <StatusBadge 
                    status={dep.estado === EstadoSistema.Activo ? 'active' : 'inactive'}
                    size="s"
                  />
                </div>
              ))}
            </div>
            <div className={styles.dependenciesFooter}>
              <p>
                <strong>Para eliminar este sistema, primero debes:</strong>
              </p>
              <ul>
                <li>Cambiar las dependencias de los sistemas listados arriba</li>
                <li>O desactivar los sistemas dependientes</li>
              </ul>
            </div>
          </div>
        ) : null}

        {/* Mensaje de confirmación */}
        {!hasDependencies && !loadingDependencies && (
          <div className={styles.confirmationMessage}>
            <p className={styles.confirmationText}>
              ¿Estás seguro de que quieres eliminar el sistema <strong>{sistema.nombreSistema}</strong>?
            </p>
            <p className={styles.warningText}>
              Esta acción marcará el sistema como eliminado y no se puede deshacer.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};