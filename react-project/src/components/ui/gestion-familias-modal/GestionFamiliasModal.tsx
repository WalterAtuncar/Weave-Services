import React, { useState, useEffect } from 'react';
import { Modal } from '../modal/Modal';
import { ChipGroup } from '../chip/chip-group';
import { SearchableSelect } from '../searchable-select/SearchableSelect';
import { Button } from '../button/button';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { Settings, Plus, AlertTriangle } from 'lucide-react';
import { OrganizacionFamiliaSistemaService } from '../../../services/organizacion-familia-sistema.service';
import { FamiliaSistemaService } from '../../../services/familia-sistema.service';
import { 
  FamiliaSistemaAsignada, 
  FamiliaSistemaDisponible,
  CreateOrganizacionFamiliaSistemaRequest 
} from '../../../types/organizacion-familia-sistema.types';
import { FamiliaSistema, CreateFamiliaSistemaRequest } from '../../../types/familia-sistema.types';
import { Organizacion } from '../../../types/organizacion.types';
import styles from './GestionFamiliasModal.module.css';

// =============================================
// INTERFACES
// =============================================

export interface GestionFamiliasModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Organización seleccionada */
  organizacion: Organizacion | null;
  /** Callback cuando se actualiza la lista de familias */
  onUpdate?: () => void;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const GestionFamiliasModal: React.FC<GestionFamiliasModalProps> = ({
  isOpen,
  onClose,
  organizacion,
  onUpdate
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // Estados
  const [familiasAsignadas, setFamiliasAsignadas] = useState<FamiliaSistemaAsignada[]>([]);
  const [familiasDisponibles, setFamiliasDisponibles] = useState<FamiliaSistemaDisponible[]>([]);
  const [selectedFamiliaId, setSelectedFamiliaId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAsignar, setLoadingAsignar] = useState(false);
  const [loadingEliminar, setLoadingEliminar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Servicios
  const organizacionFamiliaSistemaService = new OrganizacionFamiliaSistemaService();
  const familiaSistemaService = new FamiliaSistemaService();

  // =============================================
  // EFECTOS
  // =============================================

  useEffect(() => {
    if (isOpen && organizacion) {
      loadData();
    }
  }, [isOpen, organizacion]);

  // =============================================
  // FUNCIONES DE CARGA DE DATOS
  // =============================================

  const loadData = async () => {
    if (!organizacion) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Cargar familias asignadas y disponibles en paralelo
      const [asignadasResponse, disponiblesResponse] = await Promise.all([
        organizacionFamiliaSistemaService.getFamiliasSistemaAsignadas(organizacion.organizacionId),
        organizacionFamiliaSistemaService.getFamiliasSistemaDisponibles(organizacion.organizacionId)
      ]);
      
      // Verificar que las respuestas sean exitosas y extraer los datos
      if (asignadasResponse.success && asignadasResponse.data) {
        setFamiliasAsignadas(asignadasResponse.data);
      } else {
        console.error('Error al cargar familias asignadas:', asignadasResponse.message);
        setFamiliasAsignadas([]);
      }
      
      if (disponiblesResponse.success && disponiblesResponse.data) {
        setFamiliasDisponibles(disponiblesResponse.data);
      } else {
        console.error('Error al cargar familias disponibles:', disponiblesResponse.message);
        setFamiliasDisponibles([]);
      }
      
      // Si alguna de las respuestas falló, mostrar error
      if (!asignadasResponse.success || !disponiblesResponse.success) {
        setError('Error al cargar algunas familias de sistemas');
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar las familias de sistemas');
      setFamiliasAsignadas([]);
      setFamiliasDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // FUNCIONES DE MANEJO DE EVENTOS
  // =============================================

  const handleAsignarFamilia = async () => {
    if (!organizacion || !selectedFamiliaId) return;
    
    setLoadingAsignar(true);
    setError(null);
    
    try {
      const request: CreateOrganizacionFamiliaSistemaRequest = {
        organizacionId: organizacion.organizacionId,
        familiaSistemaId: parseInt(selectedFamiliaId)
      };
      
      await organizacionFamiliaSistemaService.createOrganizacionFamiliaSistema(request);
      
      // Recargar datos
      await loadData();
      
      // Limpiar selección
      setSelectedFamiliaId('');
      
      // Notificar actualización
      onUpdate?.();
    } catch (err) {
      console.error('Error al asignar familia:', err);
      setError('Error al asignar la familia de sistema');
    } finally {
      setLoadingAsignar(false);
    }
  };

  const handleCreateNewFamilia = async (searchTerm: string) => {
    const trimmedTerm = searchTerm.trim();
    
    // Validaciones básicas
    if (!trimmedTerm) {
      setError('El nombre de la familia no puede estar vacío');
      return;
    }
    
    if (trimmedTerm.length < 2) {
      setError('El nombre de la familia debe tener al menos 2 caracteres');
      return;
    }
    
    if (trimmedTerm.length > 100) {
      setError('El nombre de la familia no puede exceder los 100 caracteres');
      return;
    }
    
    // Verificar si ya existe una familia con el mismo nombre
    const existingFamily = familiasDisponibles.find(
      familia => familia.nombre.toLowerCase() === trimmedTerm.toLowerCase()
    );
    
    if (existingFamily) {
      setError('Ya existe una familia de sistema con ese nombre');
      return;
    }
    
    setLoadingCreate(true);
    setError(null);
    
    try {
      // Generar código automáticamente basado en el nombre
      // Remover caracteres especiales y limitar longitud
      const codigo = trimmedTerm
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
        .substring(0, 50); // Limitar a 50 caracteres
      
      // Verificar que el código no esté vacío después de la limpieza
      if (!codigo || codigo.length < 2) {
        setError('No se pudo generar un código válido para la familia');
        return;
      }
      
      const request: CreateFamiliaSistemaRequest = {
        FamiliaSistemaCodigo: codigo,
        FamiliaSistemaNombre: trimmedTerm,
        FamiliaSistemaDescripcion: `Familia de sistema creada automáticamente: ${trimmedTerm}`,
        CreadoPor: user?.usuarioId || 1 // ID del usuario actual o 1 por defecto
      };
      
      const response = await familiaSistemaService.createFamiliaSistema(request);
      
      if (response.success && response.data) {
        // Recargar las familias disponibles
        await loadData();
        
        // Seleccionar automáticamente la nueva familia creada
        const familiaData = response.data; // response.data ya es el objeto FamiliaSistema
        const familiaId = familiaData?.FamiliaSistemaId || familiaData?.id;
        if (familiaId) {
          setSelectedFamiliaId(familiaId.toString());
        }
        
        // Notificar actualización
        onUpdate?.();
        
        // Mensaje de éxito (opcional, se puede mostrar en un toast)
      } else {
        // Manejar respuesta no exitosa
        const errorMessage = response.message || 'Error desconocido al crear la familia';
        setError(`Error al crear la familia: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error('Error al crear nueva familia:', err);
      
      // Manejo de errores más específico
      let errorMessage = 'Error al crear la nueva familia de sistema';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Errores específicos del backend
      if (errorMessage.includes('duplicate') || errorMessage.includes('duplicado')) {
        errorMessage = 'Ya existe una familia de sistema con ese código o nombre';
      } else if (errorMessage.includes('validation') || errorMessage.includes('validación')) {
        errorMessage = 'Los datos proporcionados no son válidos';
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('no autorizado')) {
        errorMessage = 'No tiene permisos para crear familias de sistema';
      }
      
      setError(errorMessage);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleEliminarFamilia = async (familiaId: number) => {
    if (!organizacion) return;
    
    setLoadingEliminar(familiaId.toString());
    setError(null);
    
    try {
      await organizacionFamiliaSistemaService.deleteOrganizacionFamiliaSistema({
        organizacionId: organizacion.organizacionId,
        familiaSistemaId: familiaId
      });
      
      // Recargar datos
      await loadData();
      
      // Notificar actualización
      onUpdate?.();
    } catch (err) {
      console.error('Error al eliminar familia:', err);
      setError('Error al eliminar la familia de sistema');
    } finally {
      setLoadingEliminar(null);
      setShowConfirmDelete(null);
    }
  };

  const handleConfirmDelete = (familiaId: number) => {
    setShowConfirmDelete(familiaId.toString());
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(null);
  };

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const getChipsFromFamiliasAsignadas = () => {
    return familiasAsignadas.map(familia => ({
      id: familia.id,
      label: familia.nombre,
      ...(familia.descripcion && { description: familia.descripcion }),
      type: 'system' as const
    }));
  };

  const getOptionsFromFamiliasDisponibles = () => {
    return familiasDisponibles.map(familia => ({
      value: familia.id.toString(),
      label: familia.nombre,
      description: familia.descripcion || 'Sin descripción'
    }));
  };

  const handleChipRemove = (familiaId: string | number) => {
    handleConfirmDelete(Number(familiaId));
  };

  // =============================================
  // RENDER
  // =============================================

  if (!organizacion) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestionar Familias de Sistemas - ${organizacion.razonSocial || organizacion.nombreComercial || 'Organización'}`}
      size="l"
      hideFooter
      forcedClose={true}
      className={styles.gestionFamiliasModal}
    >
      <div className={styles.modalContent}>
        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage} style={{ 
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: '#DC2626'
          }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Sección de Familias Asignadas */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <Settings size={20} style={{ color: colors.primary }} />
              <h3 style={{ color: colors.text }}>Familias de Sistemas Asignadas</h3>
            </div>
            <span className={styles.badge} style={{ 
              backgroundColor: colors.primary + '20',
              color: colors.primary 
            }}>
              {familiasAsignadas.length}
            </span>
          </div>
          
          <div className={styles.sectionContent}>
            {loading ? (
              <div className={styles.loadingState} style={{ color: colors.textSecondary }}>
                Cargando familias asignadas...
              </div>
            ) : familiasAsignadas.length > 0 ? (
              <ChipGroup
                chips={getChipsFromFamiliasAsignadas()}
                removable
                onRemove={handleChipRemove}
                size="m"
                variant="filled"
                className={styles.chipGroup}
              />
            ) : (
              <div className={styles.emptyState} style={{ color: colors.textSecondary }}>
                No hay familias de sistemas asignadas a esta organización.
              </div>
            )}
          </div>
        </div>

        {/* Sección de Asignar Nueva Familia */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <Plus size={20} style={{ color: colors.success }} />
              <h3 style={{ color: colors.text }}>Asignar Nueva Familia</h3>
            </div>
          </div>
          
          <div className={styles.sectionContent}>
            <div className={styles.assignForm}>
              <div className={styles.selectContainer}>
                <SearchableSelect
                label="Familia de Sistema"
                placeholder="Seleccionar familia de sistema..."
                searchPlaceholder="Buscar familia..."
                options={getOptionsFromFamiliasDisponibles()}
                value={selectedFamiliaId}
                onChange={setSelectedFamiliaId}
                disabled={loading || loadingAsignar || loadingCreate}
                className={styles.familiaSelect}
                allowCreate={true}
                createText="Crear nueva familia"
                onCreateNew={handleCreateNewFamilia}
              />
              </div>
              
              <Button
                variant="default"
                size="m"
                onClick={handleAsignarFamilia}
                disabled={!selectedFamiliaId || loading || loadingAsignar}
                backgroundColor={colors.success}
                textColor="#FFFFFF"
                iconName="Plus"
                iconPosition="left"
                className={styles.assignButton}
              >
                {loadingAsignar ? 'Asignando...' : 'Asignar'}
              </Button>
            </div>
            
            {familiasDisponibles.length === 0 && !loading && (
              <div className={styles.emptyState} style={{ color: colors.textSecondary }}>
                Todas las familias de sistemas disponibles ya están asignadas.
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmación de Eliminación */}
        {showConfirmDelete && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmDialog} style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }}>
              <div className={styles.confirmHeader}>
                <AlertTriangle size={24} style={{ color: '#EF4444' }} />
                <h4 style={{ color: colors.text }}>Confirmar Eliminación</h4>
              </div>
              
              <p style={{ color: colors.textSecondary }}>
                ¿Está seguro de que desea eliminar esta familia de sistema de la organización?
                Esta acción no se puede deshacer.
              </p>
              
              <div className={styles.confirmActions}>
                <Button
                  variant="ghost"
                  size="m"
                  onClick={handleCancelDelete}
                  disabled={loadingEliminar !== null}
                >
                  Cancelar
                </Button>
                
                <Button
                  variant="custom"
                  size="m"
                  onClick={() => handleEliminarFamilia(Number(showConfirmDelete))}
                  disabled={loadingEliminar !== null}
                  backgroundColor="#EF4444"
                  textColor="#FFFFFF"
                  iconName="Trash2"
                  iconPosition="left"
                >
                  {loadingEliminar === showConfirmDelete ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};