import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Grid, GridColumn } from '../grid/Grid';
import { Modal } from '../modal/Modal';
import { 
  ReglaGobernanza, 
  CreateReglaGobernanzaCommand, 
  UpdateReglaGobernanzaCommand, 
  DeleteReglaGobernanzaRequest 
} from '../../../services/types/regla-gobernanza.types';
import { RolGobernanza } from '../../../services/types/rol-gobernanza.types';
import { reglaGobernanzaService } from '../../../services';
import { useAuth } from '../../../hooks/useAuth';
import { AlertService } from '../alerts';
import { 
  Plus, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Users,
  Shield
} from 'lucide-react';
import styles from './ReglaGobernanzaManager.module.css';

// =============================================
// INTERFACES
// =============================================

export interface ReglaGobernanzaManagerProps {
  rolesGobernanza: RolGobernanza[];
  onReglasCreated: (reglas: ReglaGobernanza[]) => void;
  onNext: () => void;
  existingReglas?: ReglaGobernanza[];
  onDirtyChange?: (dirty: boolean) => void;
}

interface ReglaGobernanzaForm {
  rolGobernanzaId: number | '';
  maximoUsuarios: number;
  minimoUsuarios: number;
  esObligatorio: boolean;
  diasAlertaVencimiento: number | '';
}

interface ComponentState {
  reglas: ReglaGobernanza[];
  filteredReglas: ReglaGobernanza[];
  isLoading: boolean;
  error: string | null;
  
  // Modal states
  showCreateModal: boolean;
  showEditModal: boolean;
  editingRegla: ReglaGobernanza | null;
  
  // Form state
  form: ReglaGobernanzaForm;
  formErrors: Partial<ReglaGobernanzaForm>;
  isSaving: boolean;
}

// =============================================
// CONSTANTES
// =============================================

const EMPTY_FORM: ReglaGobernanzaForm = {
  rolGobernanzaId: '',
  maximoUsuarios: 10,
  minimoUsuarios: 1,
  esObligatorio: false,
  diasAlertaVencimiento: ''
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const ReglaGobernanzaManager: React.FC<ReglaGobernanzaManagerProps> = ({
  rolesGobernanza,
  onReglasCreated,
  onNext,
  existingReglas = [],
  onDirtyChange
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();

  const [state, setState] = useState<ComponentState>({
    reglas: existingReglas,
    filteredReglas: existingReglas,
    isLoading: false,
    error: null,
    showCreateModal: false,
    showEditModal: false,
    editingRegla: null,
    form: EMPTY_FORM,
    formErrors: {},
    isSaving: false
  });

  // =============================================
  // EFECTOS
  // =============================================

  // Control de carga inicial
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (existingReglas.length > 0) {
      setState(prev => ({
        ...prev,
        reglas: existingReglas,
        filteredReglas: existingReglas
      }));
      setHasInitialized(true);
    } else if (!hasInitialized && !state.isLoading) {
      // Solo cargar una vez al inicio
      loadInitialReglas();
      setHasInitialized(true);
    }
  }, [existingReglas.length, hasInitialized, state.isLoading]);

  // =============================================
  // FUNCIONES DE CARGA DE DATOS
  // =============================================

  // Función para carga inicial (sin notificar al wizard)
  const loadInitialReglas = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Usar endpoint paginado con página 1 y tamaño 100 para obtener todas las reglas
      const response = await reglaGobernanzaService.getReglasGobernanzaPaginated({
        page: 1,
        pageSize: 100,
        includeDeleted: false
      });
      
      if (response.success && response.data?.data) {
        setState(prev => ({
          ...prev,
          reglas: response.data!.data,
          filteredReglas: response.data!.data,
          isLoading: false
        }));
        // Notificar al wizard para habilitar el botón "Siguiente"
        // Evita el bloqueo cuando existen reglas en BD pero el wizard aún no las conoce
        onReglasCreated(response.data!.data);
      } else {
        throw new Error(response.message || 'Error al cargar reglas de gobernanza');
      }
    } catch (error: any) {
      console.error('Error al cargar reglas:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar reglas de gobernanza',
        isLoading: false
      }));
      AlertService.error('Error al cargar reglas de gobernanza');
    }
  }, []);

  // Función para recargar reglas (con notificación al wizard)
  const loadReglas = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Usar endpoint paginado con página 1 y tamaño 100 para obtener todas las reglas
      const response = await reglaGobernanzaService.getReglasGobernanzaPaginated({
        page: 1,
        pageSize: 100,
        includeDeleted: false
      });
      
      if (response.success && response.data?.data) {
        setState(prev => ({
          ...prev,
          reglas: response.data!.data,
          filteredReglas: response.data!.data,
          isLoading: false
        }));
        onReglasCreated(response.data!.data);
      } else {
        throw new Error(response.message || 'Error al cargar reglas de gobernanza');
      }
    } catch (error: any) {
      console.error('Error al cargar reglas:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar reglas de gobernanza',
        isLoading: false
      }));
      AlertService.error('Error al cargar reglas de gobernanza');
    }
  }, [onReglasCreated]);

  // =============================================
  // VALIDACIONES
  // =============================================

  const validateForm = (form: ReglaGobernanzaForm): Partial<ReglaGobernanzaForm> => {
    const errors: Partial<ReglaGobernanzaForm> = {};

    if (!form.rolGobernanzaId) {
      errors.rolGobernanzaId = 'Debes seleccionar un rol';
    }

    if (form.minimoUsuarios < 0) {
      errors.minimoUsuarios = 'El mínimo no puede ser menor a 0';
    }

    if (form.maximoUsuarios < 1) {
      errors.maximoUsuarios = 'El máximo debe ser al menos 1';
    }

    if (form.minimoUsuarios > form.maximoUsuarios) {
      errors.minimoUsuarios = 'El mínimo no puede ser mayor al máximo';
    }

    // Verificar duplicados (un rol solo puede tener una regla)
    const existingRegla = state.reglas.find(r => 
      r.reglaGobernanzaId !== state.editingRegla?.reglaGobernanzaId && 
      r.rolGobernanzaId === form.rolGobernanzaId
    );
    
    if (existingRegla) {
      errors.rolGobernanzaId = 'Este rol ya tiene una regla configurada';
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
      editingRegla: null
    }));
    onDirtyChange?.(true);
  };

  const handleOpenEditModal = (regla: ReglaGobernanza) => {
    setState(prev => ({
      ...prev,
      showEditModal: true,
      editingRegla: regla,
      form: {
        rolGobernanzaId: regla.rolGobernanzaId || '',
        maximoUsuarios: regla.maximoUsuarios || 10,
        minimoUsuarios: regla.minimoUsuarios || 1,
        esObligatorio: regla.esObligatorio || false,
        diasAlertaVencimiento: regla.diasAlertaVencimiento || ''
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
      editingRegla: null,
      form: EMPTY_FORM,
      formErrors: {},
      isSaving: false
    }));
    onDirtyChange?.(false);
  };

  // =============================================
  // HANDLERS DE FORMULARIO
  // =============================================

  const handleInputChange = (field: keyof ReglaGobernanzaForm, value: any) => {
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
      if (state.editingRegla) {
        // Actualizar
        const updateCommand: UpdateReglaGobernanzaCommand = {
          reglaGobernanzaId: state.editingRegla.reglaGobernanzaId,
          rolGobernanzaId: Number(state.form.rolGobernanzaId),
          maximoUsuarios: state.form.maximoUsuarios,
          minimoUsuarios: state.form.minimoUsuarios,
          esObligatorio: state.form.esObligatorio,
          diasAlertaVencimiento: state.form.diasAlertaVencimiento ? Number(state.form.diasAlertaVencimiento) : undefined,
          actualizadoPor: organizationInfo?.id || 1
        };

        const response = await reglaGobernanzaService.updateReglaGobernanza(updateCommand);
        
        if (response.success && response.data) {
          setState(prev => ({ ...prev, isSaving: false }));
          AlertService.success('Regla actualizada exitosamente');
          handleCloseModals();
          onDirtyChange?.(false);
          
          // Recargar datos desde el endpoint paginado para obtener todas las propiedades calculadas
          await loadReglas();
        } else {
          throw new Error(response.message || 'Error al actualizar regla');
        }
      } else {
        // Crear
        const createCommand: CreateReglaGobernanzaCommand = {
          rolGobernanzaId: Number(state.form.rolGobernanzaId),
          maximoUsuarios: state.form.maximoUsuarios,
          minimoUsuarios: state.form.minimoUsuarios,
          esObligatorio: state.form.esObligatorio,
          diasAlertaVencimiento: state.form.diasAlertaVencimiento ? Number(state.form.diasAlertaVencimiento) : undefined,
          creadoPor: organizationInfo?.id || 1
        };

        const response = await reglaGobernanzaService.createReglaGobernanza(createCommand);
        
        if (response.success && response.data) {
          setState(prev => ({ ...prev, isSaving: false }));
          AlertService.success('Regla creada exitosamente');
          handleCloseModals();
          onDirtyChange?.(false);
          
          // Recargar datos desde el endpoint paginado para obtener todas las propiedades calculadas
          await loadReglas();
        } else {
          throw new Error(response.message || 'Error al crear regla');
        }
      }
    } catch (error: any) {
      console.error('Error al guardar regla:', error);
      setState(prev => ({ ...prev, isSaving: false }));
      AlertService.error('Error al guardar regla');
    }
  };

  // =============================================
  // HANDLERS DE ACCIONES
  // =============================================

  const handleDelete = async (regla: ReglaGobernanza) => {
    const rolNombre = regla.rolGobernanzaNombre || `Rol ID: ${regla.rolGobernanzaId}`;
    const confirmed = await AlertService.confirm(
      `¿Está seguro de eliminar la regla para el rol "${rolNombre}"?`,
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    );
    
    if (!confirmed) return;

    try {
      const deleteRequest: DeleteReglaGobernanzaRequest = {
        reglaGobernanzaId: regla.reglaGobernanzaId,
        motivo: 'Eliminación desde configuración de gobierno'
      };

      const response = await reglaGobernanzaService.deleteReglaGobernanza(deleteRequest);
      
      if (response.success) {
        AlertService.success('Regla eliminada exitosamente');
        onDirtyChange?.(false);
        
        // Recargar datos desde el endpoint paginado para obtener todas las propiedades calculadas
        await loadReglas();
      } else {
        throw new Error(response.message || 'Error al eliminar regla');
      }
    } catch (error: any) {
      console.error('Error al eliminar regla:', error);
      AlertService.error('Error al eliminar regla');
    }
  };

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const getRolesDisponibles = () => {
    return rolesGobernanza.filter(rol => 
      !state.reglas.some(regla => 
        regla.rolGobernanzaId === rol.rolGobernanzaId && 
        regla.reglaGobernanzaId !== state.editingRegla?.reglaGobernanzaId
      )
    );
  };

  // =============================================
  // CONFIGURACIÓN DEL GRID
  // =============================================

  const columns: GridColumn<ReglaGobernanza>[] = [
    {
      id: 'rolNombre',
      header: 'Rol',
      accessor: 'rolGobernanzaNombre',
      width: '200px',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: row.rolGobernanzaColor || colors.primary
            }}
          />
          <div>
            <strong>{value || 'Sin nombre'}</strong>
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
              {row.rolGobernanzaCodigo}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rangoUsuarios',
      header: 'Rango de Usuarios',
      accessor: 'rangoUsuariosTexto',
      width: '150px',
      align: 'center',
      sortable: false,
      render: (value, row) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            padding: '4px 8px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#2563eb',
            borderRadius: '4px',
            fontWeight: '500',
            marginBottom: '2px'
          }}>
            {value || `${row.minimoUsuarios} - ${row.maximoUsuarios}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
            Min: {row.minimoUsuarios} | Max: {row.maximoUsuarios}
          </div>
        </div>
      )
    },
    {
      id: 'tipoRegla',
      header: 'Tipo',
      accessor: 'tipoReglaTexto',
      width: '120px',
      align: 'center',
      sortable: true,
      render: (value, row) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75em',
          fontWeight: '500',
          backgroundColor: row.esObligatorio ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          color: row.esObligatorio ? '#dc2626' : '#6b7280'
        }}>
          {value || (row.esObligatorio ? 'Obligatorio' : 'Opcional')}
        </span>
      )
    },
    {
      id: 'configuracion',
      header: 'Configuración',
      accessor: 'configuracionResumen',
      width: '200px',
      align: 'left',
      sortable: false,
      render: (value, row) => (
        <div>
          <div style={{ 
            fontSize: '0.875rem',
            fontWeight: '500',
            color: colors.text
          }}>
            {value || `${row.esObligatorio ? 'Obligatorio' : 'Opcional'} | ${row.rangoUsuariosTexto || `${row.minimoUsuarios} usuario(s)`}`}
          </div>
          {row.diasAlertaVencimiento && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.textSecondary,
              marginTop: '2px'
            }}>
              ⏰ Alerta: {row.diasAlertaVencimiento} días
            </div>
          )}
        </div>
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
          tooltip: 'Editar regla'
        },
        {
          icon: 'Trash2',
          color: '#EF4444',
          onClick: handleDelete,
          tooltip: 'Eliminar regla'
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
      title={state.editingRegla ? 'Editar Regla de Gobierno' : 'Nueva Regla de Gobierno'}
      size="m"
      onSave={handleSave}
      saveDisabled={state.isSaving}
      saveButtonText={state.editingRegla ? 'Actualizar' : 'Crear'}
    >
      <div className={styles.modalContent}>
        <div className={styles.formGrid}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: colors.text, 
              marginBottom: '6px' 
            }}>
              Rol de Gobernanza *
            </label>
            <select
              value={state.form.rolGobernanzaId}
              onChange={(e) => handleInputChange('rolGobernanzaId', e.target.value)}
              disabled={state.isSaving}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: colors.background,
                color: colors.text
              }}
            >
              <option value="">Seleccionar rol...</option>
              {getRolesDisponibles().map(rol => (
                <option key={rol.rolGobernanzaId} value={rol.rolGobernanzaId}>
                  {rol.rolGobernanzaNombre}
                </option>
              ))}
            </select>
            {state.formErrors.rolGobernanzaId && (
              <span style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {state.formErrors.rolGobernanzaId}
              </span>
            )}
          </div>

          <div>
            <Input
              label="Mínimo de Usuarios"
              type="number"
              value={state.form.minimoUsuarios}
              onChange={(e) => handleInputChange('minimoUsuarios', parseInt(e.target.value) || 0)}
              min={0}
              required
              disabled={state.isSaving}
            />
            {state.formErrors.minimoUsuarios && (
              <span style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {state.formErrors.minimoUsuarios}
              </span>
            )}
          </div>

          <div>
            <Input
              label="Máximo de Usuarios"
              type="number"
              value={state.form.maximoUsuarios}
              onChange={(e) => handleInputChange('maximoUsuarios', parseInt(e.target.value) || 1)}
              min={1}
              required
              disabled={state.isSaving}
            />
            {state.formErrors.maximoUsuarios && (
              <span style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {state.formErrors.maximoUsuarios}
              </span>
            )}
          </div>

          <div>
            <Input
              label="Días de Alerta (opcional)"
              type="number"
              value={state.form.diasAlertaVencimiento}
              onChange={(e) => handleInputChange('diasAlertaVencimiento', e.target.value)}
              min={1}
              placeholder="30"
              disabled={state.isSaving}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <input
                type="checkbox"
                checked={state.form.esObligatorio}
                onChange={(e) => handleInputChange('esObligatorio', e.target.checked)}
                disabled={state.isSaving}
                style={{ marginRight: '8px' }}
              />
              Este rol es obligatorio
            </label>
            <p style={{ 
              fontSize: '12px', 
              color: colors.textSecondary, 
              marginTop: '4px',
              marginLeft: '24px'
            }}>
              Los roles obligatorios deben ser asignados para completar la gobernanza
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  if (state.isLoading && state.reglas.length === 0) {
    return (
      <div className={styles.loading}>
        <Settings size={32} color={colors.primary} />
        <p>Cargando reglas de gobernanza...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Settings size={20} color={colors.primary} />
            <div>
              <h2>Reglas de Roles</h2>
              <p>Establece las reglas y restricciones para cada rol de gobernanza.</p>
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

      <div className={styles.toolbar}>
        <Button
          variant="default"
          size="m"
          iconName="Plus"
          onClick={handleOpenCreateModal}
          disabled={getRolesDisponibles().length === 0}
        >
          Nueva Regla
        </Button>
        
        {getRolesDisponibles().length === 0 && state.reglas.length > 0 && (
          <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            Todos los roles ya tienen reglas configuradas
          </span>
        )}
      </div>

      <div className={styles.gridContainer}>
        <Grid
          columns={columns}
          data={state.filteredReglas}
          pageSize={10}
          showPagination={true}
          loading={state.isLoading}
          emptyMessage="No se encontraron reglas configuradas"
        />
      </div>

      {state.filteredReglas.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <CheckCircle size={16} color="#10b981" />
            <span>{state.filteredReglas.length} reglas configuradas</span>
          </div>
          <Button
            variant="default"
            size="m"
            onClick={onNext}
            iconName="ArrowRight"
            iconPosition="right"
          >
            Continuar con Tipos de Gobierno
          </Button>
        </div>
      )}

      {renderModal()}
    </div>
  );
};