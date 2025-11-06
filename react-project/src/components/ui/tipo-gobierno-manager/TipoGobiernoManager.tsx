import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Textarea } from '../textarea/textarea';
import { Grid, GridColumn, GridAction } from '../grid/Grid';
import { Modal } from '../modal/Modal';
import { TipoGobierno, CreateTipoGobiernoCommand, UpdateTipoGobiernoCommand, DeleteTipoGobiernoRequest, TipoGobiernoFilters } from '../../../services/types/tipo-gobierno.types';
import { tipoGobiernoService } from '../../../services';
import { useAuth } from '../../../hooks/useAuth';
import { AlertService } from '../alerts';
import { 
  Plus, 
  Search, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  Filter,
  X
} from 'lucide-react';
import styles from './TipoGobiernoManager.module.css';

// =============================================
// INTERFACES
// =============================================

export interface TipoGobiernoManagerProps {
  onTiposCreated: (tipos: TipoGobierno[]) => void;
  onComplete: () => void;
  existingTipos?: TipoGobierno[];
  onDirtyChange?: (dirty: boolean) => void;
}

interface TipoGobiernoForm {
  tipoGobiernoCodigo: string;
  tipoGobiernoNombre: string;
  tipoGobiernoDescripcion: string;
}

interface FilterState {
  searchTerm: string;
  estado: number | '';
  showFilters: boolean;
}

interface ComponentState {
  tipos: TipoGobierno[];
  filteredTipos: TipoGobierno[];
  isLoading: boolean;
  error: string | null;
  
  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  editingTipo: TipoGobierno | null;
  
  // Form state
  form: TipoGobiernoForm;
  formErrors: Partial<TipoGobiernoForm>;
  isSaving: boolean;
  
  // Filters
  filters: FilterState;
}

// =============================================
// CONSTANTES
// =============================================

const EMPTY_FORM: TipoGobiernoForm = {
  tipoGobiernoCodigo: '',
  tipoGobiernoNombre: '',
  tipoGobiernoDescripcion: ''
};

const DEFAULT_FILTERS: FilterState = {
  searchTerm: '',
  estado: '',
  showFilters: false
};

const ESTADOS_OPCIONES = [
  { value: '', label: 'Todos los estados' },
  { value: 1, label: 'Activo' },
  { value: 2, label: 'Inactivo' },
  { value: 3, label: 'Suspendido' }
];

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const TipoGobiernoManager: React.FC<TipoGobiernoManagerProps> = ({
  onTiposCreated,
  onComplete,
  existingTipos = [],
  onDirtyChange
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();

  const [state, setState] = useState<ComponentState>({
    tipos: existingTipos,
    filteredTipos: existingTipos,
    isLoading: false,
    error: null,
    showCreateModal: false,
    showEditModal: false,
    editingTipo: null,
    form: EMPTY_FORM,
    formErrors: {},
    isSaving: false,
    filters: DEFAULT_FILTERS
  });

  // =============================================
  // EFECTOS
  // =============================================

  useEffect(() => {
    if (existingTipos.length > 0) {
      setState(prev => ({
        ...prev,
        tipos: existingTipos,
        filteredTipos: existingTipos
      }));
    } else {
      loadTipos();
    }
  }, [existingTipos]);

  // Filtrar datos cuando cambien los filtros
  useEffect(() => {
    applyFilters();
  }, [state.tipos, state.filters.searchTerm, state.filters.estado]);

  // =============================================
  // FUNCIONES DE CARGA DE DATOS
  // =============================================

  const loadTipos = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await tipoGobiernoService.getAllTiposGobierno();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          tipos: response.data,
          filteredTipos: response.data,
          isLoading: false
        }));
        onTiposCreated(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar tipos de gobierno');
      }
    } catch (error: any) {
      console.error('Error al cargar tipos de gobierno:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar tipos de gobierno',
        isLoading: false
      }));
      AlertService.error('Error al cargar tipos de gobierno');
    }
  }, [onTiposCreated]);

  const applyFilters = useCallback(async () => {
    try {
      const { searchTerm, estado } = state.filters;
      
      if (!searchTerm && !estado) {
        setState(prev => ({ ...prev, filteredTipos: prev.tipos }));
        return;
      }

      const filters: TipoGobiernoFilters = {};
      if (estado) filters.estado = Number(estado);

      const response = await tipoGobiernoService.searchTiposGobierno(searchTerm, filters);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          filteredTipos: response.data
        }));
      }
    } catch (error: any) {
      console.error('Error al filtrar tipos:', error);
    }
  }, [state.filters]);

  // =============================================
  // VALIDACIONES
  // =============================================

  const validateForm = (form: TipoGobiernoForm): Partial<TipoGobiernoForm> => {
    const errors: Partial<TipoGobiernoForm> = {};

    if (!form.tipoGobiernoCodigo.trim()) {
      errors.tipoGobiernoCodigo = 'El código es requerido';
    } else if (form.tipoGobiernoCodigo.length < 2) {
      errors.tipoGobiernoCodigo = 'El código debe tener al menos 2 caracteres';
    }

    if (!form.tipoGobiernoNombre.trim()) {
      errors.tipoGobiernoNombre = 'El nombre es requerido';
    } else if (form.tipoGobiernoNombre.length < 3) {
      errors.tipoGobiernoNombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Verificar duplicados
    const existingTipo = state.tipos.find(t => 
      t.tipoGobiernoId !== state.editingTipo?.tipoGobiernoId && 
      (t.tipoGobiernoCodigo?.toLowerCase() === form.tipoGobiernoCodigo.toLowerCase() ||
       t.tipoGobiernoNombre?.toLowerCase() === form.tipoGobiernoNombre.toLowerCase())
    );
    
    if (existingTipo) {
      errors.tipoGobiernoCodigo = 'Ya existe un tipo con ese código o nombre';
    }

    return errors;
  };

  // =============================================
  // HANDLERS DE MODAL
  // =============================================

  const handleOpenCreateModal = () => {
    setState(prev => ({
      ...prev,
      showCreateModal: true,
      form: EMPTY_FORM,
      formErrors: {},
      editingTipo: null
    }));
    onDirtyChange?.(true);
  };

  const handleOpenEditModal = (tipo: TipoGobierno) => {
    setState(prev => ({
      ...prev,
      showEditModal: true,
      editingTipo: tipo,
      form: {
        tipoGobiernoCodigo: tipo.tipoGobiernoCodigo || '',
        tipoGobiernoNombre: tipo.tipoGobiernoNombre || '',
        tipoGobiernoDescripcion: tipo.tipoGobiernoDescripcion || ''
      },
      formErrors: {}
    }));
    onDirtyChange?.(true);
  };

  const handleCloseModals = () => {
    setState(prev => ({
      ...prev,
      showCreateModal: false,
      showEditModal: false,
      editingTipo: null,
      form: EMPTY_FORM,
      formErrors: {},
      isSaving: false
    }));
    onDirtyChange?.(false);
  };

  // =============================================
  // HANDLERS DE FORMULARIO
  // =============================================

  const handleInputChange = (field: keyof TipoGobiernoForm, value: string) => {
    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: value
      },
      formErrors: {
        ...prev.formErrors,
        [field]: undefined
      }
    }));
    onDirtyChange?.(true);
  };

  const handleSave = async () => {
    const errors = validateForm(state.form);
    
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, formErrors: errors }));
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      if (state.editingTipo) {
        // Actualizar
        const updateCommand: UpdateTipoGobiernoCommand = {
          tipoGobiernoId: state.editingTipo.tipoGobiernoId,
          tipoGobiernoCodigo: state.form.tipoGobiernoCodigo.toUpperCase(),
          tipoGobiernoNombre: state.form.tipoGobiernoNombre,
          tipoGobiernoDescripcion: state.form.tipoGobiernoDescripcion,
          actualizadoPor: organizationInfo?.id || 1
        };

        const response = await tipoGobiernoService.updateTipoGobierno(updateCommand);
        
        if (response.success && response.data) {
          const updatedTipos = state.tipos.map(t => 
            t.tipoGobiernoId === state.editingTipo!.tipoGobiernoId ? response.data : t
          );
          
          setState(prev => ({
            ...prev,
            tipos: updatedTipos,
            isSaving: false
          }));
          
          onTiposCreated(updatedTipos);
          AlertService.success('Tipo de gobierno actualizado exitosamente');
          handleCloseModals();
          onDirtyChange?.(false);
        } else {
          throw new Error(response.message || 'Error al actualizar tipo de gobierno');
        }
      } else {
        // Crear
        const createCommand: CreateTipoGobiernoCommand = {
          tipoGobiernoCodigo: state.form.tipoGobiernoCodigo.toUpperCase(),
          tipoGobiernoNombre: state.form.tipoGobiernoNombre,
          tipoGobiernoDescripcion: state.form.tipoGobiernoDescripcion,
          creadoPor: organizationInfo?.id || 1
        };

        const response = await tipoGobiernoService.createTipoGobierno(createCommand);
        
        if (response.success && response.data) {
          const newTipos = [...state.tipos, response.data];
          
          setState(prev => ({
            ...prev,
            tipos: newTipos,
            isSaving: false
          }));
          
          onTiposCreated(newTipos);
          AlertService.success('Tipo de gobierno creado exitosamente');
          handleCloseModals();
          onDirtyChange?.(false);
        } else {
          throw new Error(response.message || 'Error al crear tipo de gobierno');
        }
      }
    } catch (error: any) {
      console.error('Error al guardar tipo de gobierno:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      AlertService.error('Error al guardar tipo de gobierno');
    }
  };

  // =============================================
  // HANDLERS DE ACCIONES
  // =============================================

  const handleDelete = async (tipo: TipoGobierno) => {
    const confirmed = await AlertService.confirm(
      `¿Está seguro de eliminar el tipo de gobierno "${tipo.tipoGobiernoNombre}"?`,
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    );
    
    if (!confirmed) return;

    try {
      const deleteRequest: DeleteTipoGobiernoRequest = {
        tipoGobiernoId: tipo.tipoGobiernoId,
        motivo: 'Eliminación desde configuración de gobierno'
      };

      const response = await tipoGobiernoService.deleteTipoGobierno(deleteRequest);
      
      if (response.success) {
        const updatedTipos = state.tipos.filter(t => t.tipoGobiernoId !== tipo.tipoGobiernoId);
        setState(prev => ({ ...prev, tipos: updatedTipos }));
        onTiposCreated(updatedTipos);
        AlertService.success('Tipo de gobierno eliminado exitosamente');
        onDirtyChange?.(false);
      } else {
        throw new Error(response.message || 'Error al eliminar tipo de gobierno');
      }
    } catch (error: any) {
      console.error('Error al eliminar tipo:', error);
      AlertService.error('Error al eliminar tipo de gobierno');
    }
  };

  // =============================================
  // HANDLERS DE FILTROS
  // =============================================

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value
      }
    }));
  };

  const handleClearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: DEFAULT_FILTERS
    }));
  };

  // =============================================
  // CONFIGURACIÓN DEL GRID
  // =============================================

  const columns: GridColumn<TipoGobierno>[] = [
    {
      id: 'tipoGobiernoCodigo',
      header: 'Código',
      accessor: 'tipoGobiernoCodigo',
      width: '120px',
      sortable: true,
      render: (value) => (
        <span style={{ 
          fontFamily: 'monospace', 
                     backgroundColor: colors.surface,
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.85em'
        }}>
          {value}
        </span>
      )
    },
    {
      id: 'tipoGobiernoNombre',
      header: 'Nombre',
      accessor: 'tipoGobiernoNombre',
      width: '200px',
      sortable: true,
      render: (value) => <strong>{value}</strong>
    },
    {
      id: 'tipoGobiernoDescripcion',
      header: 'Descripción',
      accessor: 'tipoGobiernoDescripcion',
      sortable: false,
      render: (value) => (
        <span style={{ 
          color: colors.textSecondary,
          fontSize: '0.9em',
          lineHeight: '1.4'
        }}>
          {value || 'Sin descripción'}
        </span>
      )
    },
    {
      id: 'estadoTexto',
      header: 'Estado',
      accessor: 'estadoTexto',
      width: '100px',
      align: 'center',
      sortable: true,
      render: (value, row) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75em',
          fontWeight: '500',
          backgroundColor: row.estado === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          color: row.estado === 1 ? '#10b981' : '#6b7280'
        }}>
          {value}
        </span>
      )
    },
    {
      id: 'fechaCreacion',
      header: 'Creado',
      accessor: 'fechaCreacion',
      width: '120px',
      align: 'center',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('es-ES') : '-'
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: () => null,
      width: '100px',
      align: 'center',
      actions: [
        {
          icon: 'Edit3',
          color: '#F59E0B',
          onClick: handleOpenEditModal,
          tooltip: 'Editar tipo de gobierno'
        },
        {
          icon: 'Trash2',
          color: '#EF4444',
          onClick: handleDelete,
          tooltip: 'Eliminar tipo de gobierno'
        }
      ]
    }
  ];

  // =============================================
  // RENDERIZADO DE COMPONENTES
  // =============================================



  const renderModal = () => (
    <Modal
      isOpen={state.showCreateModal || state.showEditModal}
      onClose={handleCloseModals}
      title={state.editingTipo ? 'Editar Tipo de Gobierno' : 'Nuevo Tipo de Gobierno'}
      size="m"
      onSave={handleSave}
      saveDisabled={state.isSaving}
      saveButtonText={state.editingTipo ? 'Actualizar' : 'Crear'}
    >
      <div className={styles.modalContent}>
        <div className={styles.formGrid}>
                     <div>
             <Input
               label="Código"
               value={state.form.tipoGobiernoCodigo}
               onChange={(e) => handleInputChange('tipoGobiernoCodigo', e.target.value.toUpperCase())}
               placeholder="Ej: GENERAL"
               required
               disabled={state.isSaving}
             />
             {state.formErrors.tipoGobiernoCodigo && (
               <span style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                 {state.formErrors.tipoGobiernoCodigo}
               </span>
             )}
           </div>

           <div>
             <Input
               label="Nombre"
               value={state.form.tipoGobiernoNombre}
               onChange={(e) => handleInputChange('tipoGobiernoNombre', e.target.value)}
               placeholder="Ej: Gobierno General"
               required
               disabled={state.isSaving}
             />
             {state.formErrors.tipoGobiernoNombre && (
               <span style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                 {state.formErrors.tipoGobiernoNombre}
               </span>
             )}
           </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea
              label="Descripción"
              value={state.form.tipoGobiernoDescripcion}
              onChange={(e) => handleInputChange('tipoGobiernoDescripcion', e.target.value)}
              placeholder="Describe las características y restricciones de este tipo de gobierno..."
              rows={3}
              disabled={state.isSaving}
            />
          </div>
        </div>
      </div>
    </Modal>
  );

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  if (state.isLoading && state.tipos.length === 0) {
    return (
      <div className={styles.loading}>
        <Shield size={32} color={colors.primary} />
        <p>Cargando tipos de gobierno...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Shield size={20} color={colors.primary} />
            <div>
              <h2>Tipos de Gobierno</h2>
              <p>Define los modelos de gobierno que determinarán cómo se gestionan las responsabilidades.</p>
            </div>
        </div>
        </div>
      </div>

      {state.error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          <span>{state.error}</span>
        </div>
      )}

      <div className={styles.toolbarAndFilters}>
        <div className={styles.leftControls}>
          <div className={styles.searchContainer}>
            <div className={styles.searchInput}>
              <Search size={16} color={colors.textSecondary} />
              <Input
                placeholder="Buscar por código, nombre o descripción..."
                value={state.filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                style={{ border: 'none', boxShadow: 'none', minWidth: '300px' }}
              />
            </div>
          </div>
          
          {state.filters.showFilters && (
            <div className={styles.inlineFilters}>
              <select
                value={state.filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: colors.background,
                  color: colors.text,
                  minWidth: '150px'
                }}
              >
                {ESTADOS_OPCIONES.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <Button
                variant="ghost"
                size="s"
                iconName="X"
                onClick={handleClearFilters}
                title="Limpiar filtros"
              />
            </div>
                  )}
                </div>

        <div className={styles.rightControls}>
          <Button
            variant="outline"
            size="s"
            iconName="Filter"
            onClick={() => handleFilterChange('showFilters', !state.filters.showFilters)}
          >
            Filtros
          </Button>
          
          <Button
            variant="default"
            size="m"
            iconName="Plus"
            onClick={handleOpenCreateModal}
          >
            Nuevo Tipo
          </Button>
          </div>
      </div>

      <div className={styles.gridContainer}>
        <Grid
          columns={columns}
          data={state.filteredTipos}
          pageSize={10}
          showPagination={true}
          loading={state.isLoading}
          emptyMessage="No se encontraron tipos de gobierno"
        />
        </div>
        
      {state.filteredTipos.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <CheckCircle size={16} color="#10b981" />
            <span>{state.filteredTipos.length} tipos configurados</span>
          </div>
        <Button
            variant="default"
          size="m"
          onClick={onComplete}
          iconName="CheckCircle"
          iconPosition="right"
        >
          Finalizar Configuración
        </Button>
      </div>
      )}

      {renderModal()}
    </div>
  );
};