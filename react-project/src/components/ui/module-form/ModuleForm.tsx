import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { StatusBadge } from '../status-badge/StatusBadge';
import { AlertService } from '../alerts/AlertService';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { 
  SistemaModulo, 
  CreateModuloDto, 
  UpdateModuloDto, 
  EstadoSistema 
} from '../../../models/Sistemas';
import { 
  CreateSistemaModuloRequest,
  UpdateSistemaModuloRequest,
  DeleteSistemaModuloRequest,
  GetSistemaModulosRequest,
  SistemaModulo as SistemaModuloDto
} from '../../../services/types/sistemas.types';
import { sistemasService } from '../../../services/sistemas.service';
import styles from './ModuleForm.module.css';

export interface ModuleFormProps {
  /** ID del sistema al que pertenecen los módulos */
  sistemaId?: number;
  /** Módulos existentes del sistema */
  modulos?: SistemaModulo[];
  /** Función llamada cuando se crean/actualizan/eliminan módulos */
  onModulosChange?: (modulos: SistemaModulo[]) => void;
  /** Estado de loading externo */
  loading?: boolean;
  /** Desactivar todo el componente */
  disabled?: boolean;
  /** Modo compacto */
  compact?: boolean;
  /** Solo lectura */
  readOnly?: boolean;
}

interface ModuleFormData {
  nombreModulo: string;
  funcionModulo: string;
}

interface ModuleErrors {
  nombreModulo?: string;
  funcionModulo?: string;
}

// Función para mapear SistemaModuloDto del servicio a SistemaModulo del modelo
const mapSistemaModuloDtoToSistemaModulo = (dto: SistemaModuloDto): SistemaModulo => {
  return {
    sistemaModuloId: dto.sistemaModuloId,
    sistemaId: dto.sistemaId,
    nombreModulo: dto.nombreModulo,
    funcionModulo: dto.funcionModulo || '', // Asegurar que no sea undefined
    version: dto.version || 1,
    estado: dto.estado as EstadoSistema, // Convertir number a EstadoSistema
    creadoPor: dto.creadoPor || null,
    fechaCreacion: dto.fechaCreacion || new Date().toISOString(),
    actualizadoPor: dto.actualizadoPor || null,
    fechaActualizacion: dto.fechaActualizacion || null,
    registroEliminado: dto.registroEliminado || false
  };
};

export const ModuleForm: React.FC<ModuleFormProps> = ({
  sistemaId,
  modulos = [],
  onModulosChange,
  loading = false,
  disabled = false,
  compact = false,
  readOnly = false
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();
  const organizacionId = organizationInfo?.id || 1;
  
  // Estados para el formulario
  const [isAdding, setIsAdding] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ModuleFormData>({
    nombreModulo: '',
    funcionModulo: ''
  });
  const [errors, setErrors] = useState<ModuleErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para carga de datos
  const [loadingModulos, setLoadingModulos] = useState(false);
  const [errorModulos, setErrorModulos] = useState<string | null>(null);

  // Ref para rastrear si ya se cargaron los módulos para este sistemaId
  const loadedSistemaIdRef = useRef<number | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Lista local de módulos para operaciones optimistas
  const [localModulos, setLocalModulos] = useState<SistemaModulo[]>(modulos);

  // Cargar módulos desde el backend cuando se proporcione sistemaId
  const loadModulos = useCallback(async () => {
    if (!sistemaId) {
      return;
    }
    if (isFetchingRef.current) {
      return; // evitar llamadas concurrentes o repetidas
    }

    setLoadingModulos(true);
    setErrorModulos(null);
    isFetchingRef.current = true;

    try {
      const request: GetSistemaModulosRequest = {
        sistemaId,
        includeDeleted: false
      };

      const response = await sistemasService.getSistemaModulos(request);

      if (response.success && response.data) {
        const mappedModulos = response.data.map(mapSistemaModuloDtoToSistemaModulo);
        // Solo actualizar si realmente cambió el contenido
        const sameLength = localModulos.length === mappedModulos.length;
        let isSame = sameLength;
        if (sameLength) {
          for (let i = 0; i < mappedModulos.length; i++) {
            const a = localModulos[i];
            const b = mappedModulos[i];
            if (!a || !b) { isSame = false; break; }
            if (
              a.sistemaModuloId !== b.sistemaModuloId ||
              a.nombreModulo !== b.nombreModulo ||
              a.funcionModulo !== b.funcionModulo ||
              a.version !== b.version ||
              a.estado !== b.estado ||
              a.registroEliminado !== b.registroEliminado
            ) {
              isSame = false;
              break;
            }
          }
        }
        if (!isSame) {
          setLocalModulos(mappedModulos);
          if (onModulosChange) {
            onModulosChange(mappedModulos);
          }
        }
      } else {
        throw new Error(response.message || 'Error al cargar módulos');
      }
    } catch (error: any) {
      console.error('❌ ModuleForm: Error cargando módulos:', error);
      setErrorModulos(error.message || 'Error al cargar módulos');
      AlertService.error(error.message || 'Error al cargar módulos');
    } finally {
      setLoadingModulos(false);
      isFetchingRef.current = false;
    }
  }, [sistemaId, onModulosChange, localModulos]);

  // Cargar módulos al montar el componente o cambiar sistemaId
  useEffect(() => {
    // Cargar módulos si:
    // 1. Tenemos sistemaId
    // 2. Y (módulos está vacío O estamos en modo readOnly)
    // 3. Y no hemos cargado ya los módulos para este sistemaId
    if (sistemaId && (modulos.length === 0 || readOnly) && loadedSistemaIdRef.current !== sistemaId) {
      loadedSistemaIdRef.current = sistemaId;
      loadModulos();
    }
  }, [sistemaId, readOnly, loadModulos]); // Remover modulos.length para evitar loop infinito

  // Sincronizar módulos externos con estado local evitando renders infinitos
  useEffect(() => {
    const sameLength = localModulos.length === modulos.length;
    let isSame = sameLength;
    if (sameLength) {
      for (let i = 0; i < modulos.length; i++) {
        const a = localModulos[i];
        const b = modulos[i];
        if (!a || !b) { isSame = false; break; }
        if (
          a.sistemaModuloId !== b.sistemaModuloId ||
          a.nombreModulo !== b.nombreModulo ||
          a.funcionModulo !== b.funcionModulo ||
          a.version !== b.version ||
          a.estado !== b.estado ||
          a.registroEliminado !== b.registroEliminado
        ) {
          isSame = false;
          break;
        }
      }
    }
    if (!isSame) {
      setLocalModulos(modulos);
    }
  }, [modulos, localModulos]);

  // Validaciones para módulos
  const validateModuleForm = (): boolean => {
    const newErrors: ModuleErrors = {};
    
    if (!formData.nombreModulo.trim()) {
      newErrors.nombreModulo = 'El nombre del módulo es requerido';
    } else if (formData.nombreModulo.trim().length < 3) {
      newErrors.nombreModulo = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombreModulo.trim().length > 100) {
      newErrors.nombreModulo = 'El nombre no puede exceder 100 caracteres';
    } else {
      // Verificar duplicados (excluyendo el módulo en edición)
      const isDuplicate = localModulos.some(m => 
        m.nombreModulo.toLowerCase() === formData.nombreModulo.trim().toLowerCase() &&
        m.sistemaModuloId !== editingModuleId &&
        !m.registroEliminado
      );
      if (isDuplicate) {
        newErrors.nombreModulo = 'Ya existe un módulo con este nombre';
      }
    }

    if (formData.funcionModulo.trim().length > 500) {
      newErrors.funcionModulo = 'La función no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API calls reales al backend
  const createModulo = async (data: CreateModuloDto): Promise<SistemaModulo> => {
    if (!sistemaId) throw new Error('Sistema ID requerido');

    const request: CreateSistemaModuloRequest = {
      sistemaId,
      nombreModulo: data.nombreModulo.trim(),
      funcionModulo: data.funcionModulo.trim() || undefined
    };

    const response = await sistemasService.createSistemaModulo(request);

    if (response.success && response.data) {
      // El backend devuelve el ID, recargar para obtener la lista actualizada
      await loadModulos();
      // Crear un módulo temporal con la información que tenemos
      const moduloCreado: SistemaModulo = {
        sistemaModuloId: response.data,
        sistemaId,
        nombreModulo: data.nombreModulo.trim(),
        funcionModulo: data.funcionModulo.trim() || '',
        version: 1,
        estado: EstadoSistema.Activo,
        creadoPor: 1,
        fechaCreacion: new Date().toISOString(),
        actualizadoPor: null,
        fechaActualizacion: null,
        registroEliminado: false
      };
      return moduloCreado;
    } else {
      throw new Error(response.message || 'Error al crear módulo');
    }
  };

  const updateModulo = async (data: UpdateModuloDto): Promise<SistemaModulo> => {
    if (!sistemaId) throw new Error('Sistema ID requerido');

    const request: UpdateSistemaModuloRequest = {
      sistemaId,
      sistemaModuloId: data.sistemaModuloId,
      nombreModulo: data.nombreModulo.trim(),
      funcionModulo: data.funcionModulo.trim() || undefined
    };

    const response = await sistemasService.updateSistemaModulo(request);

    if (response.success) {
      // Recargar módulos para obtener datos actualizados
      await loadModulos();
      // Retornar el módulo actualizado con la información que tenemos
      const moduloActualizado: SistemaModulo = {
        sistemaModuloId: data.sistemaModuloId,
        sistemaId,
        nombreModulo: data.nombreModulo.trim(),
        funcionModulo: data.funcionModulo.trim() || '',
        version: data.version + 1,
        estado: EstadoSistema.Activo,
        creadoPor: 1,
        fechaCreacion: new Date().toISOString(),
        actualizadoPor: 1,
        fechaActualizacion: new Date().toISOString(),
        registroEliminado: false
      };
      return moduloActualizado;
    } else {
      throw new Error(response.message || 'Error al actualizar módulo');
    }
  };

  const deleteModulo = async (moduloId: number): Promise<void> => {
    if (!sistemaId) throw new Error('Sistema ID requerido');

    const request: DeleteSistemaModuloRequest = {
      sistemaId,
      moduloId
    };

    const response = await sistemasService.deleteSistemaModulo(request);

    if (response.success) {
      // Recargar módulos para reflejar el cambio
      await loadModulos();
    } else {
      throw new Error(response.message || 'Error al eliminar módulo');
    }
  };

  // Handlers para el formulario
  const handleStartAdd = () => {
    if (readOnly || disabled) return;
    setFormData({ nombreModulo: '', funcionModulo: '' });
    setErrors({});
    setEditingModuleId(null);
    setIsAdding(true);
  };

  const handleStartEdit = (modulo: SistemaModulo) => {
    if (readOnly || disabled) return;
    setFormData({
      nombreModulo: modulo.nombreModulo,
      funcionModulo: modulo.funcionModulo
    });
    setErrors({});
    setEditingModuleId(modulo.sistemaModuloId);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingModuleId(null);
    setFormData({ nombreModulo: '', funcionModulo: '' });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (isSubmitting || !validateModuleForm()) return;

    setIsSubmitting(true);
    const loadingToastId = AlertService.loading(
      editingModuleId ? 'Actualizando módulo...' : 'Creando módulo...'
    );

    try {
      let resultado: SistemaModulo;

      if (sistemaId) {
        // Modo UPDATE - usar API del backend
        if (editingModuleId) {
          // Actualizar módulo existente
          const moduleToUpdate = localModulos.find(m => m.sistemaModuloId === editingModuleId);
          if (!moduleToUpdate) throw new Error('Módulo no encontrado');

          resultado = await updateModulo({
            sistemaModuloId: editingModuleId,
            sistemaId,
            nombreModulo: formData.nombreModulo.trim(),
            funcionModulo: formData.funcionModulo.trim(),
            version: moduleToUpdate.version
          });

          // Actualizar lista local
          const updatedModulos = localModulos.map(m => 
            m.sistemaModuloId === editingModuleId ? resultado : m
          );
          setLocalModulos(updatedModulos);
          
          if (onModulosChange) {
            onModulosChange(updatedModulos);
          }
        } else {
          // Crear nuevo módulo
          resultado = await createModulo({
            sistemaId,
            nombreModulo: formData.nombreModulo.trim(),
            funcionModulo: formData.funcionModulo.trim()
          });

          // Agregar a lista local
          const updatedModulos = [...localModulos, resultado];
          setLocalModulos(updatedModulos);
          
          if (onModulosChange) {
            onModulosChange(updatedModulos);
          }
        }
      } else {
        // Modo CREATE - crear módulo local sin llamar al backend
        if (editingModuleId) {
          // Actualizar módulo local existente
          const updatedModulos = localModulos.map(m => 
            m.sistemaModuloId === editingModuleId ? {
              ...m,
              nombreModulo: formData.nombreModulo.trim(),
              funcionModulo: formData.funcionModulo.trim(),
              fechaActualizacion: new Date().toISOString()
            } : m
          );
          setLocalModulos(updatedModulos);
          
          if (onModulosChange) {
            onModulosChange(updatedModulos);
          }
        } else {
          // Crear nuevo módulo local
          const nuevoModulo: SistemaModulo = {
            sistemaModuloId: Date.now(), // ID temporal único
            sistemaId: 0, // Se asignará cuando se cree el sistema
            nombreModulo: formData.nombreModulo.trim(),
            funcionModulo: formData.funcionModulo.trim(),
            version: 1,
            estado: EstadoSistema.Activo,
            creadoPor: 1,
            fechaCreacion: new Date().toISOString(),
            actualizadoPor: 1,
            fechaActualizacion: new Date().toISOString(),
            registroEliminado: false
          };

          const updatedModulos = [...localModulos, nuevoModulo];
          setLocalModulos(updatedModulos);
          
          if (onModulosChange) {
            onModulosChange(updatedModulos);
          }
        }
      }

      AlertService.updateLoading(
        loadingToastId,
        'success',
        editingModuleId ? '¡Módulo actualizado exitosamente!' : '¡Módulo creado exitosamente!',
        2000
      );

      handleCancel();
    } catch (error) {
      console.error('Error al procesar módulo:', error);
      AlertService.updateLoading(
        loadingToastId,
        'error',
        error instanceof Error ? error.message : 'Error inesperado',
        4000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (modulo: SistemaModulo) => {
    if (readOnly || disabled) return;

    const confirmed = await AlertService.confirm(
      `¿Estás seguro de que quieres eliminar el módulo "${modulo.nombreModulo}"?`,
      {
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar'
      }
    );

    if (!confirmed) return;

    const loadingToastId = AlertService.loading('Eliminando módulo...');

    try {
      if (sistemaId) {
        // Modo UPDATE - usar API del backend
        await deleteModulo(modulo.sistemaModuloId);
      }
      // En modo CREATE, solo eliminamos localmente sin llamar al backend

      // Actualizar lista local
      const updatedModulos = localModulos.filter(m => m.sistemaModuloId !== modulo.sistemaModuloId);
      setLocalModulos(updatedModulos);
      
      if (onModulosChange) {
        onModulosChange(updatedModulos);
      }

      AlertService.updateLoading(
        loadingToastId,
        'success',
        '¡Módulo eliminado exitosamente!',
        2000
      );
    } catch (error) {
      console.error('Error al eliminar módulo:', error);
      AlertService.updateLoading(
        loadingToastId,
        'error',
        error instanceof Error ? error.message : 'Error inesperado',
        4000
      );
    }
  };

  // Filtrar módulos activos
  const modulosActivos = localModulos.filter(m => !m.registroEliminado);

  return (
    <div className={`${styles.moduleForm} ${compact ? styles.compact : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Package size={20} />
          <h3 className={styles.title}>
            Módulos del Sistema
          </h3>
          <span className={styles.count}>
            ({modulosActivos.length})
          </span>
        </div>
        
        <div className={styles.headerActions}>
          {sistemaId && (
            <Button
              variant="ghost"
              size="s"
              onClick={loadModulos}
              disabled={disabled || loading || loadingModulos}
              title="Recargar módulos"
            >
              🔄
            </Button>
          )}
          
          {!readOnly && (
            <Button
              variant="outline"
              size="s"
              onClick={handleStartAdd}
              disabled={disabled || loading || loadingModulos || isAdding || editingModuleId !== null}
              iconName="Plus"
              iconPosition="left"
            >
              Agregar Módulo
            </Button>
          )}
        </div>
      </div>

      {/* Estado de carga de módulos */}
      {loadingModulos && (
        <div className={styles.loadingState}>
          <Package size={20} />
          <span>Cargando módulos del sistema...</span>
        </div>
      )}

      {/* Error al cargar módulos */}
      {errorModulos && (
        <div className={styles.errorState}>
          <span className={styles.errorMessage}>{errorModulos}</span>
          <Button
            variant="outline"
            size="s"
            onClick={loadModulos}
            disabled={loadingModulos}
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Lista de Módulos */}
      {!loadingModulos && !errorModulos && (
        <div className={styles.modulesList}>
          {modulosActivos.length === 0 && !isAdding ? (
          <div className={styles.emptyState}>
            <Package size={24} />
            <p>No hay módulos configurados para este sistema</p>
            {!readOnly && (
              <Button
                variant="outline"
                size="s"
                onClick={handleStartAdd}
                disabled={disabled || loading || loadingModulos}
              >
                Agregar primer módulo
              </Button>
            )}
          </div>
        ) : (
          <>
            {modulosActivos.map(modulo => (
              <div key={modulo.sistemaModuloId} className={styles.moduleItem}>
                {editingModuleId === modulo.sistemaModuloId ? (
                  // Formulario de edición inline
                  <div className={styles.moduleEditForm}>
                    <div className={styles.formFields}>
                      <Input
                        placeholder="Nombre del módulo"
                        value={formData.nombreModulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombreModulo: e.target.value }))}
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                      {errors.nombreModulo && (
                        <span className={styles.fieldError}>
                          {errors.nombreModulo}
                        </span>
                      )}
                      <textarea
                        className={styles.textArea}
                        placeholder="Función del módulo"
                        value={formData.funcionModulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, funcionModulo: e.target.value }))}
                        disabled={isSubmitting}
                        maxLength={500}
                        rows={3}
                      />
                      {errors.funcionModulo && (
                        <span className={styles.fieldError}>
                          {errors.funcionModulo}
                        </span>
                      )}
                    </div>
                    <div className={styles.formActions}>
                      <Button
                        variant="outline"
                        size="s"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        iconName="X"
                        iconPosition="left"
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="default"
                        size="s"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        iconName="Save"
                        iconPosition="left"
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Vista normal del módulo
                  <div className={styles.moduleContent}>
                    <div className={styles.moduleInfo}>
                      <div className={styles.moduleHeader}>
                        <h4 className={styles.moduleName}>
                          {modulo.nombreModulo}
                        </h4>
                        <StatusBadge
                          status={modulo.estado === EstadoSistema.Activo ? 'active' : 'inactive'}
                          size="s"
                        />
                      </div>
                      {modulo.funcionModulo && (
                        <p className={styles.moduleFunction}>
                          {modulo.funcionModulo}
                        </p>
                      )}
                    </div>
                    
                    {!readOnly && (
                      <div className={styles.moduleActions}>
                        <Button
                          variant="ghost"
                          size="s"
                          onClick={() => handleStartEdit(modulo)}
                          disabled={disabled || loading || isAdding || editingModuleId !== null}
                          iconName="Edit2"
                        />
                        <Button
                          variant="ghost"
                          size="s"
                          onClick={() => handleDelete(modulo)}
                          disabled={disabled || loading || isAdding || editingModuleId !== null}
                          iconName="Trash2"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Formulario para agregar nuevo módulo */}
            {isAdding && (
              <div className={`${styles.moduleItem} ${styles.addingModule}`}>
                <div className={styles.moduleEditForm}>
                  <div className={styles.formFields}>
                    <Input
                      placeholder="Nombre del módulo"
                      value={formData.nombreModulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombreModulo: e.target.value }))}
                      disabled={isSubmitting}
                      maxLength={100}
                      autoFocus
                    />
                    {errors.nombreModulo && (
                      <span className={styles.fieldError}>
                        {errors.nombreModulo}
                      </span>
                    )}
                    <textarea
                      className={styles.textArea}
                      placeholder="Función del módulo"
                      value={formData.funcionModulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, funcionModulo: e.target.value }))}
                      disabled={isSubmitting}
                      maxLength={500}
                      rows={3}
                    />
                    {errors.funcionModulo && (
                      <span className={styles.fieldError}>
                        {errors.funcionModulo}
                      </span>
                    )}
                  </div>
                  <div className={styles.formActions}>
                    <Button
                      variant="outline"
                      size="s"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      iconName="X"
                      iconPosition="left"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      size="s"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      iconName="Save"
                      iconPosition="left"
                    >
                      Crear Módulo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      )}
    </div>
  );
};