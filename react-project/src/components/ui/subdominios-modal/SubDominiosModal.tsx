import React, { useState, useCallback, useMemo } from 'react';
import { Database, Eye, Edit, Trash2, Plus, Search } from 'lucide-react';
import { Modal } from '../modal/Modal';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Grid, GridColumn, GridAction } from '../grid/Grid';
import { StatusBadge } from '../status-badge';
import { AlertService } from '../alerts/AlertService';
import { useTheme } from '../../../contexts/ThemeContext';
import { useDominiosData } from '../../../hooks/useDominiosData';
import { SubDominioDataModal } from '../subdominio-data-modal';
import { SubDominioDataService } from '../../../services/subdominio-data.service';
import {
  DominioData,
  SubDominioData,
  getCategoriaSubDominioLabel,
  getNivelSensibilidadLabel,
  getEstadoDominioDataLabel
} from '../../../models/DominiosData';
import styles from './SubDominiosModal.module.css';

export interface SubDominiosModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Dominio seleccionado con sus subdominios */
  dominio: DominioData | null;
  /** Función llamada después de una operación exitosa */
  onSuccess?: (subdominio: SubDominioData) => void;
  /** Función llamada si hay error */
  onError?: (error: string) => void;
  /** Función llamada para ver la gobernanza del subdominio */
  onGovernance?: (subDominio: SubDominioData) => void;
}

export const SubDominiosModal: React.FC<SubDominiosModalProps> = ({
  isOpen,
  onClose,
  dominio,
  onSuccess,
  onError,
  onGovernance
}) => {
  const { colors } = useTheme();
  const { updateSubDominioData } = useDominiosData();
  
  // ===== ESTADOS LOCALES =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubDominio, setSelectedSubDominio] = useState<SubDominioData | null>(null);
  const [showSubDominioDataModal, setShowSubDominioDataModal] = useState(false);
  const [editingSubDominio, setEditingSubDominio] = useState<SubDominioData | null>(null);
  const [deletingSubDominio, setDeletingSubDominio] = useState<SubDominioData | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // ===== DATOS FILTRADOS =====
  const filteredSubDominios = useMemo(() => {
    if (!dominio?.subDominiosData) return [];
    
    return dominio.subDominiosData.filter(subdominio => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        subdominio.nombre.toLowerCase().includes(searchLower) ||
        subdominio.codigo.toLowerCase().includes(searchLower) ||
        (subdominio.descripcion?.toLowerCase().includes(searchLower) ?? false)
      );
    });
  }, [dominio?.subDominiosData, searchTerm]);

  // ===== HANDLERS =====
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleViewSubDominio = useCallback((subdominio: SubDominioData) => {
    setSelectedSubDominio(subdominio);
    // TODO: Implementar modal de detalle
    AlertService.info(`Ver detalles de: ${subdominio.nombre}`);
  }, []);

  const handleEditSubDominio = useCallback((subdominio: SubDominioData) => {
    setEditingSubDominio(subdominio);
    setShowSubDominioDataModal(true);
  }, []);

  const handleDeleteSubDominio = useCallback((subdominio: SubDominioData) => {
    setDeletingSubDominio(subdominio);
    setShowDeleteConfirmation(true);
  }, []);

  const handleNewSubDominio = useCallback(() => {
    setEditingSubDominio(null);
    setShowSubDominioDataModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingSubDominio) return;
    
    try {
      await SubDominioDataService.deleteSubDominioData(deletingSubDominio.subDominioId);
      AlertService.success(`Subdominio "${deletingSubDominio.nombre}" eliminado exitosamente`);
      setShowDeleteConfirmation(false);
      setDeletingSubDominio(null);
      onSuccess?.(deletingSubDominio);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      AlertService.error(`Error al eliminar subdominio: ${errorMessage}`);
      onError?.(errorMessage);
    }
  }, [deletingSubDominio, onSuccess, onError]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
    setDeletingSubDominio(null);
  }, []);

  // ===== HANDLERS SUBDOMINIO DATA MODAL =====
  const handleSubDominioDataModalClose = useCallback(async () => {
    // Persistir gobernanzaId si ha cambiado
    if (editingSubDominio && editingSubDominio.subDominioId) {
      const originalSubDominio = dominio?.subDominiosData?.find(s => s.subDominioId === editingSubDominio.subDominioId);
      
      if (originalSubDominio && originalSubDominio.gobernanzaId !== editingSubDominio.gobernanzaId) {
        try {
          const updateData = {
            subDominioDataId: editingSubDominio.subDominioId,
            dominioDataId: editingSubDominio.dominioId,
            codigoSubDominio: editingSubDominio.codigo || '',
            nombreSubDominio: editingSubDominio.nombre,
            descripcionSubDominio: editingSubDominio.descripcion || '',
            tieneGobernanzaPropia: editingSubDominio.tieneGobernanzaPropia || false,
            gobernanzaId: editingSubDominio.gobernanzaId,
            actualizadoPor: 1 // TODO: Obtener del contexto de usuario
          };
          
          const success = await updateSubDominioData(updateData);
          if (success) {
            AlertService.success('Gobernanza del subdominio actualizada exitosamente');
          }
        } catch (error) {
          console.error('Error al actualizar gobernanza del subdominio:', error);
          AlertService.error('Error al actualizar la gobernanza del subdominio');
        }
      }
    }
    
    setShowSubDominioDataModal(false);
    setEditingSubDominio(null);
  }, [editingSubDominio, dominio?.subDominiosData, updateSubDominioData]);

  const handleSubDominioDataSuccess = useCallback((subdominio: SubDominioData) => {
    setShowSubDominioDataModal(false);
    setEditingSubDominio(null);
    onSuccess?.(subdominio);
    AlertService.success(
      editingSubDominio 
        ? `Subdominio "${subdominio.nombre}" actualizado exitosamente`
        : `Subdominio "${subdominio.nombre}" creado exitosamente`
    );
  }, [editingSubDominio, onSuccess]);

  const handleSubDominioDataError = useCallback((error: string) => {
    onError?.(error);
    AlertService.error(`Error: ${error}`);
  }, [onError]);

  const handleSubDominioGobernanzaChange = useCallback((gobernanzaId: number) => {
    if (editingSubDominio) {
      setEditingSubDominio(prev => prev ? {
        ...prev,
        gobernanzaId: gobernanzaId
      } : null);
    }
  }, [editingSubDominio]);

  // ===== CONFIGURACIÓN DE ACCIONES =====
  const actions: GridAction<SubDominioData>[] = useMemo(() => [
    {
      icon: 'Eye',
      color: '#3b82f6',
      onClick: handleViewSubDominio,
      tooltip: 'Ver detalles'
    },
    {
      icon: 'Edit',
      color: '#f59e0b',
      onClick: handleEditSubDominio,
      tooltip: 'Editar'
    },
    {
      icon: 'Trash2',
      color: '#ef4444',
      onClick: handleDeleteSubDominio,
      tooltip: 'Eliminar'
    }
  ], [handleViewSubDominio, handleEditSubDominio, handleDeleteSubDominio]);

  // Función para obtener el variant del badge según el estado
  const getEstadoBadgeVariant = (estado: string | number) => {
    const estadoNum = typeof estado === 'string' ? parseInt(estado) : estado;
    switch (estadoNum) {
      case 1: // Activo
        return 'active';
      case 0: // Inactivo
        return 'inactive';
      case -1: // Rechazado
        return 'error';
      case -2: // Pendiente
        return 'pending';
      case -3: // IniciarFlujo
        return 'running';
      case -4: // Borrador
        return 'info';
      default:
        return 'info';
    }
  };

  // Función para obtener el texto del estado
  const getEstadoTexto = (estado: string | number) => {
    const estadoNum = typeof estado === 'string' ? parseInt(estado) : estado;
    switch (estadoNum) {
      case 1: // Activo
        return 'Activo';
      case 0: // Inactivo
        return 'Inactivo';
      case -1: // Rechazado
        return 'Rechazado';
      case -2: // Pendiente
        return 'Pendiente';
      case -3: // IniciarFlujo
        return 'Iniciar Flujo';
      case -4: // Borrador
        return 'Borrador';
      default:
        return 'Desconocido';
    }
  };

  // ===== CONFIGURACIÓN DE COLUMNAS =====
  const columns: GridColumn<SubDominioData>[] = useMemo(() => [
    {
      id: 'codigoSubDominio',
      header: 'Código',
      accessor: (subdominio) => subdominio.codigo || subdominio.codigoSubDominio || '',
      width: '150px',
      render: (value, subdominio) => (
        <span className={styles.codeCell}>
          {value || 'Sin código'}
        </span>
      )
    },
    {
      id: 'nombreSubDominio',
      header: 'Nombre',
      accessor: (subdominio) => subdominio.nombre || subdominio.nombreSubDominio || '',
      width: '250px',
      render: (value, subdominio) => (
        <span className={styles.nameCell}>
          {value}
        </span>
      )
    },
    {
      id: 'tieneGobernanzaPropia',
      header: 'Gobernanza Propia',
      accessor: 'tieneGobernanzaPropia',
      width: '150px',
      align: 'center',
      render: (value, subdominio) => (
        <StatusBadge
          status={value ? 'success' : 'inactive'}
          variant="subtle"
          size="s"
          label={value ? 'Sí' : 'No'}
        />
      )
    },
    {
      id: 'estadoTexto',
      header: 'Estado',
      accessor: 'estadoTexto',
      width: '120px',
      align: 'center',
      render: (value, subdominio) => (
        <StatusBadge
          status={getEstadoBadgeVariant(subdominio.estado)}
          variant="subtle"
          size="s"
          label={getEstadoTexto(subdominio.estado)}
        />
      )
    },
    {
      id: 'actions',
      header: 'Acciones',
      accessor: () => '',
      width: '120px',
      align: 'center',
      actions: actions
    }
  ], [actions]);

  // ===== RENDER =====
  if (!dominio) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Subdominios"
        icon={Database}
        size="xl"
        className={styles.subDominiosModal}
      >
        <div className={styles.modalContent}>
          {/* Subtítulo con información del dominio */}
          <div className={styles.dominioSubtitle}>
            <span className={styles.dominioCode}>{dominio.codigo}</span>
            <span className={styles.dominioSeparator}>-</span>
            <span className={styles.dominioName}>{dominio.nombre}</span>
          </div>
          {/* Header con búsqueda y acciones */}
          <div className={styles.header}>
            <div className={styles.searchContainer}>
              <Input
                type="text"
                placeholder="Buscar subdominios..."
                value={searchTerm}
                onChange={handleSearchChange}
                icon={Search}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.headerActions}>
              <Button
                variant="default"
                size="m"
                onClick={handleNewSubDominio}
                iconName="Plus"
              >
                Nuevo Subdominio
              </Button>
            </div>
          </div>

          {/* Información del dominio padre */}
          <div className={styles.dominioInfo}>
            <div className={styles.dominioHeader}>
              <Database size={20} />
              <div>
                <h3>{dominio.nombre}</h3>
                <p>{dominio.descripcion || 'Sin descripción'}</p>
              </div>
            </div>
            <div className={styles.dominioStats}>
              <span className={styles.stat}>
                <strong>{filteredSubDominios.length}</strong> subdominios
              </span>
              <span className={styles.stat}>
                Código: <strong>{dominio.codigo}</strong>
              </span>
            </div>
          </div>

          {/* Grid de subdominios */}
          <div className={styles.gridContainer}>
            {filteredSubDominios.length === 0 ? (
              <div className={styles.emptyState}>
                <Database size={48} color={colors.textSecondary} />
                <h3>No hay subdominios</h3>
                <p>
                  {searchTerm 
                    ? 'No se encontraron subdominios que coincidan con tu búsqueda.'
                    : 'Este dominio aún no tiene subdominios registrados.'
                  }
                </p>
                <Button
                  variant="default"
                  size="m"
                  onClick={handleNewSubDominio}
                  iconName="Plus"
                >
                  Crear primer subdominio
                </Button>
              </div>
            ) : (
              <Grid
                data={filteredSubDominios}
                columns={columns}
                loading={false}
                className={styles.subDominiosGrid}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirmation && deletingSubDominio && (
        <Modal
          isOpen={showDeleteConfirmation}
          onClose={handleCancelDelete}
          title="Confirmar eliminación"
          icon={Trash2}
          size="s"
          className={styles.deleteModal}
        >
          <div className={styles.deleteContent}>
            <div className={styles.deleteWarning}>
              <Trash2 size={48} color={colors.danger} />
              <h3>¿Eliminar subdominio?</h3>
              <p>
                Estás a punto de eliminar el subdominio <strong>"{deletingSubDominio.nombre}"</strong>.
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className={styles.deleteActions}>
              <Button
                variant="outline"
                size="m"
                onClick={handleCancelDelete}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="m"
                onClick={handleConfirmDelete}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de SubDominio Data */}
      <SubDominioDataModal
        isOpen={showSubDominioDataModal}
        onClose={handleSubDominioDataModalClose}
        subDominio={editingSubDominio}
        dominioId={dominio?.dominioId || 0}
        onSuccess={handleSubDominioDataSuccess}
        onError={handleSubDominioDataError}
        onGovernance={onGovernance}
        onGobernanzaChange={handleSubDominioGobernanzaChange}
      />
    </>
  );
};

export default SubDominiosModal;