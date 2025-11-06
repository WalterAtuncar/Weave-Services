import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select } from '../select';
import { 
  TipoEntidad, 
  CreateTipoEntidadCommand,
  UpdateTipoEntidadCommand,
  DeleteTipoEntidadRequest,
  EstadoTipoEntidad 
} from '../../../services/types/tipo-entidad.types';
import { tipoEntidadService } from '../../../services';
import { useAuth } from '../../../hooks/useAuth';
import { AlertService } from '../alerts';
import { 
  Plus, 
  Trash2, 
  Database, 
  AlertCircle,
  CheckCircle,
  Edit3,
  Save,
  X,
  Eye
} from 'lucide-react';
import styles from './TipoEntidadManager.module.css';

// =============================================
// INTERFACES
// =============================================

export interface TipoEntidadManagerProps {
  onTiposCreated: (tipos: TipoEntidad[]) => void;
  onNext: () => void;
  existingTipos?: TipoEntidad[];
  onDirtyChange?: (dirty: boolean) => void;
}

interface TipoEntidadForm {
  tipoEntidadCodigo: string;
  tipoEntidadNombre: string;
  tipoEntidadDescripcion: string;
  estado: EstadoTipoEntidad;
  isEditing?: boolean;
  isNew?: boolean;
}

interface ComponentState {
  tipos: TipoEntidad[];
  newTipo: TipoEntidadForm;
  isLoading: boolean;
  error: string | null;
  editingId: number | null;
  viewingId: number | null;
}

// =============================================
// TIPOS PREDEFINIDOS
// =============================================

const TIPOS_PREDEFINIDOS: Omit<TipoEntidadForm, 'isEditing' | 'isNew'>[] = [
  {
    tipoEntidadCodigo: 'SISTEMA',
    tipoEntidadNombre: 'Sistema',
    tipoEntidadDescripcion: 'Sistemas de información y aplicaciones',
    estado: EstadoTipoEntidad.Activo
  },
  {
    tipoEntidadCodigo: 'PROCESO',
    tipoEntidadNombre: 'Proceso',
    tipoEntidadDescripcion: 'Procesos de negocio y operacionales',
    estado: EstadoTipoEntidad.Activo
  },
  {
    tipoEntidadCodigo: 'DOCUMENTO',
    tipoEntidadNombre: 'Documento',
    tipoEntidadDescripcion: 'Documentos y políticas organizacionales',
    estado: EstadoTipoEntidad.Activo
  },
  {
    tipoEntidadCodigo: 'ACTIVO',
    tipoEntidadNombre: 'Activo',
    tipoEntidadDescripcion: 'Activos tecnológicos y de información',
    estado: EstadoTipoEntidad.Activo
  },
  {
    tipoEntidadCodigo: 'RIESGO',
    tipoEntidadNombre: 'Riesgo',
    tipoEntidadDescripcion: 'Riesgos identificados y sus controles',
    estado: EstadoTipoEntidad.Activo
  }
];

const EMPTY_FORM: TipoEntidadForm = {
  tipoEntidadCodigo: '',
  tipoEntidadNombre: '',
  tipoEntidadDescripcion: '',
  estado: EstadoTipoEntidad.Activo,
  isNew: true
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const TipoEntidadManager: React.FC<TipoEntidadManagerProps> = ({
  onTiposCreated,
  onNext,
  existingTipos = [],
  onDirtyChange
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();

  // Estado del componente
  const [state, setState] = useState<ComponentState>({
    tipos: existingTipos,
    newTipo: EMPTY_FORM,
    isLoading: false,
    error: null,
    editingId: null,
    viewingId: null
  });

  // =============================================
  // EFECTOS
  // =============================================

  useEffect(() => {
    // Solo cargar predefinidos si es explícitamente solicitado (por ejemplo, en una nueva instalación)
    // Comentado para permitir que se usen solo los datos reales de la base de datos
    // if (existingTipos.length === 0) {
    //   loadPredefinedTypes();
    // }
  }, []);

  // Actualizar state cuando cambien los existingTipos (datos de la API)
  useEffect(() => {
    console.log('🔄 TipoEntidadManager: Recibiendo existingTipos:', existingTipos?.length || 0);
    if (existingTipos.length > 0) {
      setState(prev => ({
        ...prev,
        tipos: existingTipos
      }));
    }
  }, [existingTipos]);

  // =============================================
  // FUNCIONES DE CARGA
  // =============================================

  const loadPredefinedTypes = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const tiposCreados: TipoEntidad[] = [];

      // Simular creación de tipos predefinidos
      for (let i = 0; i < TIPOS_PREDEFINIDOS.length; i++) {
        const tipoPredefinido = TIPOS_PREDEFINIDOS[i];
        
        const tipoCreado: TipoEntidad = {
          tipoEntidadId: i + 1,
          tipoEntidadCodigo: tipoPredefinido.tipoEntidadCodigo,
          tipoEntidadNombre: tipoPredefinido.tipoEntidadNombre,
          tipoEntidadDescripcion: tipoPredefinido.tipoEntidadDescripcion,
          estado: tipoPredefinido.estado,
          creadoPor: organizationInfo?.id || 1,
          fechaCreacion: new Date().toISOString(),
          version: 1,
          registroEliminado: false,
          // Campos calculados
          estadoTexto: 'Activo'
        };

        tiposCreados.push(tipoCreado);
      }

      setState(prev => ({
        ...prev,
        tipos: tiposCreados,
        isLoading: false
      }));

      // Notificar al wizard
      onTiposCreated(tiposCreados);
      
      AlertService.success(`${tiposCreados.length} tipos de entidad configurados automáticamente`);

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al configurar tipos predefinidos'
      }));
      AlertService.error('Error al configurar tipos predefinidos');
    }
  };

  // =============================================
  // VALIDACIONES
  // =============================================

  const validateForm = (form: TipoEntidadForm): string | null => {
    if (!form.tipoEntidadCodigo.trim()) {
      return 'El código es requerido';
    }
    
    if (form.tipoEntidadCodigo.length < 2) {
      return 'El código debe tener al menos 2 caracteres';
    }
    
    if (!/^[A-Z0-9_-]+$/.test(form.tipoEntidadCodigo)) {
      return 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos';
    }

    if (!form.tipoEntidadNombre.trim()) {
      return 'El nombre es requerido';
    }
    
    if (form.tipoEntidadNombre.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }

    // Verificar duplicados
    const existeCodigo = state.tipos.some(tipo => 
      tipo.tipoEntidadCodigo === form.tipoEntidadCodigo && 
      tipo.tipoEntidadId !== state.editingId
    );
    
    if (existeCodigo) {
      return 'Ya existe un tipo con este código';
    }

    const existeNombre = state.tipos.some(tipo => 
      tipo.tipoEntidadNombre.toLowerCase() === form.tipoEntidadNombre.toLowerCase() && 
      tipo.tipoEntidadId !== state.editingId
    );
    
    if (existeNombre) {
      return 'Ya existe un tipo con este nombre';
    }

    return null;
  };

  // =============================================
  // HANDLERS DE FORMULARIO
  // =============================================

  const handleInputChange = (field: keyof TipoEntidadForm, value: any) => {
    setState(prev => ({
      ...prev,
      newTipo: {
        ...prev.newTipo,
        [field]: value
      },
      error: null
    }));
    onDirtyChange?.(true);
  };

  const handleAddTipo = async () => {
    const validation = validateForm(state.newTipo);
    if (validation) {
      setState(prev => ({ ...prev, error: validation }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Crear command para el backend
      const createCommand: CreateTipoEntidadCommand = {
        tipoEntidadCodigo: state.newTipo.tipoEntidadCodigo.toUpperCase(),
        tipoEntidadNombre: state.newTipo.tipoEntidadNombre,
        tipoEntidadDescripcion: state.newTipo.tipoEntidadDescripcion || '',
        estado: state.newTipo.estado,
        creadoPor: organizationInfo?.id || 1
      };

      // Llamada real al backend
      const response = await tipoEntidadService.createTipoEntidad(createCommand);
      
      if (response.success && response.data) {
        const nuevoTipo = response.data;
        const updatedTipos = [...state.tipos, nuevoTipo];

        setState(prev => ({
          ...prev,
          tipos: updatedTipos,
          newTipo: EMPTY_FORM,
          isLoading: false,
          error: null
        }));

        // Notificar al wizard
        onTiposCreated(updatedTipos);
        
        AlertService.success(`Tipo de entidad "${nuevoTipo.tipoEntidadNombre}" agregado exitosamente`);
        onDirtyChange?.(false);
      } else {
        throw new Error(response.message || 'Error al crear tipo de entidad');
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al agregar tipo de entidad'
      }));
      AlertService.error('Error al agregar tipo de entidad');
    }
  };

  const handleEditTipo = (tipo: TipoEntidad) => {
    setState(prev => ({
      ...prev,
      editingId: tipo.tipoEntidadId || null,
      newTipo: {
        tipoEntidadCodigo: tipo.tipoEntidadCodigo || '',
        tipoEntidadNombre: tipo.tipoEntidadNombre || '',
        tipoEntidadDescripcion: tipo.tipoEntidadDescripcion || '',
        estado: tipo.estado || EstadoTipoEntidad.Activo,
        isEditing: true
      }
    }));
    onDirtyChange?.(true);
  };

  const handleSaveEdit = async () => {
    const validation = validateForm(state.newTipo);
    if (validation) {
      setState(prev => ({ ...prev, error: validation }));
      return;
    }

    if (!state.editingId) {
      AlertService.error('No se puede actualizar: ID no válido');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Crear command para el backend
      const updateCommand: UpdateTipoEntidadCommand = {
        tipoEntidadId: state.editingId,
        tipoEntidadCodigo: state.newTipo.tipoEntidadCodigo.toUpperCase(),
        tipoEntidadNombre: state.newTipo.tipoEntidadNombre,
        tipoEntidadDescripcion: state.newTipo.tipoEntidadDescripcion || '',
        estado: state.newTipo.estado,
        actualizadoPor: organizationInfo?.id || 1
      };

      // Llamada real al backend
      const response = await tipoEntidadService.updateTipoEntidad(updateCommand);
      
      if (response.success && response.data) {
        const tipoActualizado = response.data;
        
        const updatedTipos = state.tipos.map(tipo => 
          tipo.tipoEntidadId === state.editingId ? tipoActualizado : tipo
        );

        setState(prev => ({
          ...prev,
          tipos: updatedTipos,
          newTipo: EMPTY_FORM,
          editingId: null,
          isLoading: false,
          error: null
        }));

        // Notificar al wizard
        onTiposCreated(updatedTipos);
        
        AlertService.success('Tipo de entidad actualizado exitosamente');
        onDirtyChange?.(false);
      } else {
        throw new Error(response.message || 'Error al actualizar tipo de entidad');
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al actualizar tipo de entidad'
      }));
      AlertService.error('Error al actualizar tipo de entidad');
    }
  };

  const handleCancelEdit = () => {
    setState(prev => ({
      ...prev,
      newTipo: EMPTY_FORM,
      editingId: null,
      viewingId: null,
      error: null
    }));
    onDirtyChange?.(false);
  };

  const handleViewTipo = (tipo: TipoEntidad) => {
    setState(prev => ({
      ...prev,
      viewingId: tipo.tipoEntidadId || null,
      editingId: null,
      newTipo: {
        tipoEntidadCodigo: tipo.tipoEntidadCodigo || '',
        tipoEntidadNombre: tipo.tipoEntidadNombre || '',
        tipoEntidadDescripcion: tipo.tipoEntidadDescripcion || '',
        estado: tipo.estado || EstadoTipoEntidad.Activo,
        isEditing: false
      },
      error: null
    }));
  };

  const handleCancelView = () => {
    setState(prev => ({
      ...prev,
      newTipo: EMPTY_FORM,
      viewingId: null,
      error: null
    }));
    onDirtyChange?.(false);
  };

  const handleDeleteTipo = async (tipoId: number) => {
    const tipo = state.tipos.find(t => t.tipoEntidadId === tipoId);
    if (!tipo) return;

    const confirmDelete = await AlertService.confirm(
      `¿Estás seguro de que quieres eliminar el tipo "${tipo.tipoEntidadNombre}"?`,
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    );
    
    if (!confirmDelete) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Crear request para el backend
      const deleteRequest: DeleteTipoEntidadRequest = {
        tipoEntidadId: tipoId,
        motivo: 'Eliminación desde configuración de gobierno'
      };

      // Llamada real al backend
      const response = await tipoEntidadService.deleteTipoEntidad(deleteRequest);
      
      if (response.success) {
        // Solo actualizar estado local si el backend confirma la eliminación
        const updatedTipos = state.tipos.filter(t => t.tipoEntidadId !== tipoId);

        setState(prev => ({
          ...prev,
          tipos: updatedTipos,
          isLoading: false,
          error: null
        }));

        // Notificar al wizard
        onTiposCreated(updatedTipos);
        
        AlertService.success(`Tipo "${tipo.tipoEntidadNombre}" eliminado exitosamente`);
        onDirtyChange?.(false);
      } else {
        throw new Error(response.message || 'Error al eliminar tipo de entidad');
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al eliminar tipo de entidad'
      }));
      AlertService.error('Error al eliminar tipo de entidad');
    }
  };

  // =============================================
  // FUNCIONES DE RENDERIZADO
  // =============================================

  const renderForm = () => {
    const isEditing = state.editingId !== null;
    const isViewing = state.viewingId !== null;
    const buttonText = isEditing ? 'Guardar Cambios' : 'Agregar Tipo';
    const buttonIcon = isEditing ? 'Save' : 'Plus';
    
    return (
      <div className={styles.formContainer}>
        <h3 className={styles.formTitle}>
          {isViewing ? 'Ver Tipo de Entidad' : isEditing ? 'Editar Tipo de Entidad' : 'Nuevo Tipo de Entidad'}
        </h3>
        
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <Input
              label="Código *"
              value={state.newTipo.tipoEntidadCodigo}
              onChange={(e) => handleInputChange('tipoEntidadCodigo', e.target.value.toUpperCase())}
              placeholder="Ej: SISTEMA, PROCESO"
              maxLength={20}
              disabled={state.isLoading || isViewing}
              readOnly={isViewing}
            />
          </div>
          
          <div className={styles.formField}>
            <Input
              label="Nombre *"
              value={state.newTipo.tipoEntidadNombre}
              onChange={(e) => handleInputChange('tipoEntidadNombre', e.target.value)}
              placeholder="Nombre descriptivo del tipo"
              maxLength={100}
              disabled={state.isLoading || isViewing}
              readOnly={isViewing}
            />
          </div>
          
          <div className={styles.formField}>
            <Input
              label="Descripción"
              value={state.newTipo.tipoEntidadDescripcion}
              onChange={(e) => handleInputChange('tipoEntidadDescripcion', e.target.value)}
              placeholder="Descripción opcional del tipo"
              maxLength={500}
              disabled={state.isLoading || isViewing}
              readOnly={isViewing}
            />
          </div>
          
          <div className={styles.formField}>
            <Select
              label="Estado"
              value={state.newTipo.estado.toString()}
              onChange={(value) => handleInputChange('estado', parseInt(value))}
              options={[
                { value: EstadoTipoEntidad.Activo.toString(), label: 'Activo' },
                { value: EstadoTipoEntidad.Inactivo.toString(), label: 'Inactivo' }
              ]}
              disabled={state.isLoading || isViewing}
            />
          </div>
        </div>

        {state.error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            <span>{state.error}</span>
          </div>
        )}

        <div className={styles.formActions}>
          {(isEditing || isViewing) && (
            <Button
              variant="default"
              size="m"
              onClick={isViewing ? handleCancelView : handleCancelEdit}
              disabled={state.isLoading}
              iconName="X"
              iconPosition="left"
              backgroundColor="#6B7280"
              textColor="#ffffff"
            >
              {isViewing ? 'Cerrar' : 'Cancelar'}
            </Button>
          )}
          
          {!isViewing && (
            <Button
              variant="default"
              size="m"
              onClick={isEditing ? handleSaveEdit : handleAddTipo}
              disabled={state.isLoading || !state.newTipo.tipoEntidadCodigo || !state.newTipo.tipoEntidadNombre}
              iconName={buttonIcon}
              iconPosition="left"
              loading={state.isLoading}
              backgroundColor="#10B981"
              textColor="#ffffff"
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderTiposList = () => {
    if (state.tipos.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Database size={48} color={colors.textSecondary} />
          <h4>No hay tipos configurados</h4>
          <p>Agrega tipos de entidad para continuar con la configuración</p>
        </div>
      );
    }

    return (
      <div className={styles.tiposList}>
        <h3 className={styles.listTitle}>
          Tipos Configurados ({state.tipos.length})
        </h3>
        
        <div className={styles.tiposGrid}>
          {state.tipos.map((tipo) => (
            <div key={tipo.tipoEntidadId} className={styles.tipoCard}>
              <div className={styles.tipoHeader}>
                <div className={styles.tipoIcon}>
                  <Database size={20} color={colors.primary} />
                </div>
                <div className={styles.tipoInfo}>
                  <h4 className={styles.tipoNombre}>{tipo.tipoEntidadNombre}</h4>
                  <span className={styles.tipoCodigo}>{tipo.tipoEntidadCodigo}</span>
                </div>
                <div className={styles.tipoActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleViewTipo(tipo)}
                    title="Ver"
                    disabled={state.isLoading}
                  >
                    <Eye size={16} color="#3B82F6" />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEditTipo(tipo)}
                    title="Editar"
                    disabled={state.isLoading}
                  >
                    <Edit3 size={16} color="#F59E0B" />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDeleteTipo(tipo.tipoEntidadId!)}
                    title="Eliminar"
                    disabled={state.isLoading}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </div>
              
              {tipo.tipoEntidadDescripcion && (
                <p className={styles.tipoDescripcion}>
                  {tipo.tipoEntidadDescripcion}
                </p>
              )}
              
              <div className={styles.tipoFooter}>
                <span className={`${styles.estadoBadge} ${
                  tipo.estado === EstadoTipoEntidad.Activo ? styles.estadoActivo : styles.estadoInactivo
                }`}>
                  {tipo.estadoTexto}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Database size={24} color={colors.primary} />
        </div>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Configurar Tipos de Entidad</h2>
          <p className={styles.description}>
            Define los tipos de entidades que tendrán gobernanza en tu organización. 
            Estos tipos determinarán qué elementos pueden ser gestionados y controlados.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          {renderForm()}
        </div>
        
        <div className={styles.rightPanel}>
          {renderTiposList()}
        </div>
      </div>

      {state.tipos.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <CheckCircle size={16} color={colors.success} />
            <span>
              {state.tipos.length} tipo{state.tipos.length !== 1 ? 's' : ''} configurado{state.tipos.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Button
            variant="primary"
            size="m"
            onClick={onNext}
            iconName="ArrowRight"
            iconPosition="right"
          >
            Continuar con Roles
          </Button>
        </div>
      )}
    </div>
  );
};