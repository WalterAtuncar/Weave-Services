import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select } from '../select';
import { Textarea } from '../textarea/textarea';
import { Badge } from '../badge/badge';
import { RolGobernanza, CreateRolGobernanzaCommand, UpdateRolGobernanzaCommand, DeleteRolGobernanzaRequest } from '../../../services/types/rol-gobernanza.types';
import { TipoEntidad } from '../../../services/types/tipo-entidad.types';
import { rolGobernanzaService } from '../../../services';
import { useAuth } from '../../../hooks/useAuth';
import { AlertService } from '../alerts';
import { 
  Plus, 
  Trash2, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Edit3, 
  Save, 
  X,
  Crown,
  Shield
} from 'lucide-react';
import styles from './RolGobernanzaManager.module.css';

// =============================================
// INTERFACES
// =============================================

export interface RolGobernanzaManagerProps {
  tiposEntidad: TipoEntidad[];
  onRolesCreated: (roles: RolGobernanza[]) => void;
  onNext: () => void;
  existingRoles?: RolGobernanza[];
  onDirtyChange?: (dirty: boolean) => void;
}

interface RolGobernanzaForm {
  rolGobernanzaCodigo: string;
  rolGobernanzaNombre: string;
  rolGobernanzaDescripcion: string;
  nivel: string;
  color: string;
  isEditing: boolean;
  isNew: boolean;
}

interface ComponentState {
  roles: RolGobernanza[];
  newRol: RolGobernanzaForm;
  isLoading: boolean;
  error: string | null;
  editingId: number | null;
}

// =============================================
// DATOS PREDEFINIDOS
// =============================================

const ROLES_PREDEFINIDOS: Omit<RolGobernanzaForm, 'isEditing' | 'isNew'>[] = [
  {
    rolGobernanzaCodigo: 'OWNER',
    rolGobernanzaNombre: 'Propietario',
    rolGobernanzaDescripcion: 'Responsable principal y máxima autoridad sobre la entidad',
    nivel: '1',
    color: '#dc2626'
  },
  {
    rolGobernanzaCodigo: 'ADMIN',
    rolGobernanzaNombre: 'Administrador',
    rolGobernanzaDescripcion: 'Gestiona y administra la entidad con permisos elevados',
    nivel: '2',
    color: '#ea580c'
  },
  {
    rolGobernanzaCodigo: 'MANAGER',
    rolGobernanzaNombre: 'Gestor',
    rolGobernanzaDescripcion: 'Supervisa operaciones y toma decisiones operativas',
    nivel: '4',
    color: '#059669'
  },
  {
    rolGobernanzaCodigo: 'COORDINATOR',
    rolGobernanzaNombre: 'Coordinador',
    rolGobernanzaDescripcion: 'Coordina actividades y facilita comunicación',
    nivel: '6',
    color: '#0284c7'
  },
  {
    rolGobernanzaCodigo: 'REVIEWER',
    rolGobernanzaNombre: 'Revisor',
    rolGobernanzaDescripcion: 'Revisa y valida cambios y documentación',
    nivel: '8',
    color: '#7c3aed'
  },
  {
    rolGobernanzaCodigo: 'OBSERVER',
    rolGobernanzaNombre: 'Observador',
    rolGobernanzaDescripcion: 'Acceso de solo lectura para seguimiento y auditoría',
    nivel: '10',
    color: '#6b7280'
  }
];

const COLORES_DISPONIBLES = [
  '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d',
  '#059669', '#0891b2', '#0284c7', '#2563eb', '#4f46e5',
  '#7c3aed', '#a21caf', '#be185d', '#e11d48', '#6b7280'
];

const EMPTY_FORM: RolGobernanzaForm = {
  rolGobernanzaCodigo: '',
  rolGobernanzaNombre: '',
  rolGobernanzaDescripcion: '',
  nivel: '5',
  color: COLORES_DISPONIBLES[0],
  isEditing: false,
  isNew: true
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const RolGobernanzaManager: React.FC<RolGobernanzaManagerProps> = ({
  tiposEntidad,
  onRolesCreated,
  onNext,
  existingRoles = [],
  onDirtyChange
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();

  const [state, setState] = useState<ComponentState>({
    roles: existingRoles,
    newRol: EMPTY_FORM,
    isLoading: false,
    error: null,
    editingId: null
  });

  // =============================================
  // EFECTOS
  // =============================================

  useEffect(() => {
    if (existingRoles.length === 0) {
      loadPredefinedRoles();
    }
  }, []);

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const loadPredefinedRoles = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simular creación de roles predefinidos
             const rolesCreados: RolGobernanza[] = ROLES_PREDEFINIDOS.map((rol, index) => ({
         rolGobernanzaId: index + 1,
         rolGobernanzaCodigo: rol.rolGobernanzaCodigo,
         rolGobernanzaNombre: rol.rolGobernanzaNombre,
         rolGobernanzaDescripcion: rol.rolGobernanzaDescripcion,
         nivel: parseInt(rol.nivel),
         color: rol.color,
         version: 1,
         estado: 1,
         creadoPor: organizationInfo?.id || 1,
         fechaCreacion: new Date().toISOString(),
         registroEliminado: false,
         // Propiedades calculadas
         estadoTexto: 'Activo',
         puedeEliminar: true,
         puedeEditar: true,
         totalAsignaciones: 0,
         asignacionesActivas: 0
       }));

      setState(prev => ({
        ...prev,
        roles: rolesCreados,
        isLoading: false
      }));

      onRolesCreated(rolesCreados);
    } catch (error) {
      console.error('Error al cargar roles predefinidos:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al cargar roles predefinidos',
        isLoading: false
      }));
    }
  };

  const validateForm = (form: RolGobernanzaForm): string | null => {
    if (!form.rolGobernanzaCodigo.trim()) {
      return 'El código es requerido';
    }
    if (form.rolGobernanzaCodigo.length < 2) {
      return 'El código debe tener al menos 2 caracteres';
    }
    if (!form.rolGobernanzaNombre.trim()) {
      return 'El nombre es requerido';
    }
    if (form.rolGobernanzaNombre.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (!form.nivel || parseInt(form.nivel) < 1 || parseInt(form.nivel) > 10) {
      return 'El nivel debe estar entre 1 y 10';
    }

    // Verificar duplicados
    const existingRole = state.roles.find(r => 
      r.rolGobernanzaId !== state.editingId && 
      (r.rolGobernanzaCodigo?.toLowerCase() === form.rolGobernanzaCodigo.toLowerCase() ||
       r.rolGobernanzaNombre?.toLowerCase() === form.rolGobernanzaNombre.toLowerCase())
    );
    
    if (existingRole) {
      return 'Ya existe un rol con ese código o nombre';
    }

    return null;
  };

  // =============================================
  // HANDLERS
  // =============================================

  const handleInputChange = (field: keyof RolGobernanzaForm, value: any) => {
    setState(prev => ({
      ...prev,
      newRol: {
        ...prev.newRol,
        [field]: value
      }
    }));
    onDirtyChange?.(true);
  };

  const handleAddRol = async () => {
    const validationError = validateForm(state.newRol);
    if (validationError) {
      AlertService.error(validationError);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Crear command para el backend
      const createCommand: CreateRolGobernanzaCommand = {
        rolGobernanzaCodigo: state.newRol.rolGobernanzaCodigo.toUpperCase(),
        rolGobernanzaNombre: state.newRol.rolGobernanzaNombre,
        rolGobernanzaDescripcion: state.newRol.rolGobernanzaDescripcion,
        nivel: parseInt(state.newRol.nivel),
        color: state.newRol.color,
        creadoPor: organizationInfo?.id || 1
      };

      // Llamada real al backend
      const response = await rolGobernanzaService.createRolGobernanza(createCommand);
      
      if (response.success && response.data) {
        const newRole = response.data;
        const updatedRoles = [...state.roles, newRole];
        
        setState(prev => ({
          ...prev,
          roles: updatedRoles,
          newRol: EMPTY_FORM,
          isLoading: false
        }));

        onRolesCreated(updatedRoles);
        AlertService.success('Rol agregado exitosamente');
        onDirtyChange?.(false);
      } else {
        throw new Error(response.message || 'Error al crear rol de gobernanza');
      }
    } catch (error: any) {
      console.error('Error al agregar rol:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al agregar rol',
        isLoading: false
      }));
      AlertService.error('Error al agregar rol');
    }
  };

  const handleEditRol = (rol: RolGobernanza) => {
    // Normalizar el color y verificar si está en la lista disponible
    let colorToUse = rol.color || COLORES_DISPONIBLES[0];
    
    // Si el color no está en la lista disponible, usar el primero por defecto
    if (colorToUse && !COLORES_DISPONIBLES.includes(colorToUse)) {
      // Verificar si es un problema de case-sensitivity
      const colorFound = COLORES_DISPONIBLES.find(c => c.toLowerCase() === colorToUse.toLowerCase());
      colorToUse = colorFound || COLORES_DISPONIBLES[0];
    }
    
    setState(prev => ({
      ...prev,
      newRol: {
        rolGobernanzaCodigo: rol.rolGobernanzaCodigo || '',
        rolGobernanzaNombre: rol.rolGobernanzaNombre || '',
        rolGobernanzaDescripcion: rol.rolGobernanzaDescripcion || '',
        nivel: (rol.nivel || 1).toString(),
        color: colorToUse,
        isEditing: true,
        isNew: false
      },
      editingId: rol.rolGobernanzaId || null
    }));
    onDirtyChange?.(true);
  };

  const handleSaveEdit = async () => {
    const validationError = validateForm(state.newRol);
    if (validationError) {
      AlertService.error(validationError);
      return;
    }

    if (!state.editingId) {
      AlertService.error('No se puede actualizar: ID no válido');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Crear command para el backend
      const updateCommand: UpdateRolGobernanzaCommand = {
        rolGobernanzaId: state.editingId,
        rolGobernanzaCodigo: state.newRol.rolGobernanzaCodigo.toUpperCase(),
        rolGobernanzaNombre: state.newRol.rolGobernanzaNombre,
        rolGobernanzaDescripcion: state.newRol.rolGobernanzaDescripcion,
        nivel: parseInt(state.newRol.nivel),
        color: state.newRol.color,
        actualizadoPor: organizationInfo?.id || 1
      };

      // Llamada real al backend
      const response = await rolGobernanzaService.updateRolGobernanza(updateCommand);
      
      if (response.success && response.data) {
        const rolActualizado = response.data;
        
        const updatedRoles = state.roles.map(rol => 
          rol.rolGobernanzaId === state.editingId ? rolActualizado : rol
        );

        setState(prev => ({
          ...prev,
          roles: updatedRoles,
          newRol: EMPTY_FORM,
          editingId: null,
          isLoading: false
        }));

        onRolesCreated(updatedRoles);
        AlertService.success('Rol actualizado exitosamente');
        onDirtyChange?.(false);
      } else {
        throw new Error(response.message || 'Error al actualizar rol de gobernanza');
      }
    } catch (error: any) {
      console.error('Error al actualizar rol:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al actualizar rol',
        isLoading: false
      }));
      AlertService.error('Error al actualizar rol');
    }
  };

  const handleCancelEdit = () => {
    setState(prev => ({
      ...prev,
      newRol: EMPTY_FORM,
      editingId: null
    }));
    onDirtyChange?.(false);
  };

  const handleDeleteRol = async (rolId: number) => {
    const confirmed = await AlertService.confirm(
      '¿Está seguro de eliminar este rol?',
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    );
    if (!confirmed) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Crear request para el backend
      const deleteRequest: DeleteRolGobernanzaRequest = {
        rolGobernanzaId: rolId,
        motivo: 'Eliminación desde configuración de gobierno'
      };

      // Llamada real al backend
      const response = await rolGobernanzaService.deleteRolGobernanza(deleteRequest);
      
      if (response.success) {
        // Solo actualizar estado local si el backend confirma la eliminación
        const updatedRoles = state.roles.filter(rol => rol.rolGobernanzaId !== rolId);
        setState(prev => ({
          ...prev,
          roles: updatedRoles,
          isLoading: false,
          error: null
        }));

        onRolesCreated(updatedRoles);
        AlertService.success('Rol eliminado exitosamente');
        onDirtyChange?.(false);
      } else {
        throw new Error(response.message || 'Error al eliminar rol de gobernanza');
      }
    } catch (error: any) {
      console.error('Error al eliminar rol:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al eliminar rol',
        isLoading: false
      }));
      AlertService.error('Error al eliminar rol');
    }
  };

  // =============================================
  // FUNCIONES DE RENDERIZADO
  // =============================================

  const renderForm = () => (
    <div className={styles.form}>
      <div className={styles.formHeader}>
        <div className={styles.formTitle}>
          <Crown size={20} color={colors.primary} />
          <h3>{state.newRol.isEditing ? 'Editar Rol' : 'Agregar Nuevo Rol'}</h3>
        </div>
        {state.newRol.isEditing && (
          <Button
            variant="ghost"
            size="s"
            iconName="X"
            onClick={handleCancelEdit}
            title="Cancelar edición"
          />
        )}
      </div>

      <div className={styles.formGrid}>
        <Input
          label="Código"
          value={state.newRol.rolGobernanzaCodigo}
          onChange={(e) => handleInputChange('rolGobernanzaCodigo', e.target.value.toUpperCase())}
          placeholder="Ej: ADMIN"
          required
          disabled={state.isLoading}
        />

        <Input
          label="Nombre"
          value={state.newRol.rolGobernanzaNombre}
          onChange={(e) => handleInputChange('rolGobernanzaNombre', e.target.value)}
          placeholder="Ej: Administrador"
          required
          disabled={state.isLoading}
        />

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.text,
            marginBottom: '6px'
          }}>
            Nivel de Autoridad *
          </label>
          <select
            value={state.newRol.nivel}
            onChange={(e) => handleInputChange('nivel', e.target.value)}
            disabled={state.isLoading}
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
             {Array.from({ length: 10 }, (_, i) => (
               <option key={i + 1} value={(i + 1).toString()}>
                 Nivel {i + 1}{i === 0 ? ' (Máxima Autoridad)' : i === 9 ? ' (Mínima Autoridad)' : ''}
               </option>
             ))}
           </select>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.text,
            marginBottom: '6px'
          }}>
            Color
          </label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {COLORES_DISPONIBLES.map(color => (
              <button
                key={color}
                onClick={() => handleInputChange('color', color)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: color,
                  border: state.newRol.color?.toLowerCase() === color.toLowerCase() ? `3px solid ${colors.primary}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Textarea
            label="Descripción"
            value={state.newRol.rolGobernanzaDescripcion}
            onChange={(e) => handleInputChange('rolGobernanzaDescripcion', e.target.value)}
            placeholder="Describe las responsabilidades y autoridad de este rol..."
            rows={3}
            disabled={state.isLoading}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <Button
          variant="default"
          onClick={state.newRol.isEditing ? handleSaveEdit : handleAddRol}
          disabled={state.isLoading || !state.newRol.rolGobernanzaCodigo || !state.newRol.rolGobernanzaNombre}
          iconName={state.newRol.isEditing ? "Save" : "Plus"}
        >
          {state.newRol.isEditing ? 'Guardar Cambios' : 'Agregar Rol'}
        </Button>
      </div>
    </div>
  );

  const renderRolesList = () => (
    <div className={styles.rolesList}>
      <div className={styles.rolesHeader}>
        <h4>Roles Configurados ({state.roles.length})</h4>
        <p>Lista de roles disponibles para asignar responsabilidades</p>
      </div>

      {state.roles.length === 0 ? (
        <div className={styles.emptyState}>
          <Crown size={32} color={colors.textSecondary} />
          <p>No hay roles configurados</p>
        </div>
      ) : (
        <div className={styles.rolesGrid}>
          {state.roles.map((rol) => (
            <div key={rol.rolGobernanzaId} className={styles.roleCard}>
              <div className={styles.roleHeader}>
                <div className={styles.roleInfo}>
                  <div
                    className={styles.roleColor}
                    style={{ backgroundColor: rol.color }}
                  />
                  <div>
                    <h5>{rol.rolGobernanzaNombre}</h5>
                    <span className={styles.roleCode}>{rol.rolGobernanzaCodigo}</span>
                  </div>
                </div>
                
                <div className={styles.roleLevel}>
                  <Badge
                    label={`Nivel ${rol.nivel}`}
                    color={rol.color}
                    size="s"
                    variant="subtle"
                  />
                </div>
              </div>

              {rol.rolGobernanzaDescripcion && (
                <p className={styles.roleDescription}>
                  {rol.rolGobernanzaDescripcion}
                </p>
              )}

              <div className={styles.roleFooter}>
                <div className={styles.roleStats}>
                  <span className={styles.roleStat}>
                    {rol.totalAsignaciones || 0} asignaciones
                  </span>
                </div>

                <div className={styles.roleActions}>
                  <button
                    onClick={() => handleEditRol(rol)}
                    title="Editar rol"
                    disabled={state.isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: state.isLoading ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: state.isLoading ? 0.5 : 1
                    }}
                  >
                    <Edit3 size={16} color="#F59E0B" />
                  </button>
                  <button
                    onClick={() => handleDeleteRol(rol.rolGobernanzaId || 0)}
                    title="Eliminar rol"
                    disabled={state.isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: state.isLoading ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: state.isLoading ? 0.5 : 1
                    }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  if (state.isLoading && state.roles.length === 0) {
    return (
      <div className={styles.loading}>
        <Users size={32} color={colors.primary} />
        <p>Configurando roles de gobernanza...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Users size={24} color={colors.primary} />
        <div>
          <h2>Configurar Roles de Gobernanza</h2>
          <p>Define los roles que podrán ser asignados a usuarios para gestionar las entidades.</p>
          <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
            Los roles determinan el nivel de autoridad y responsabilidad de cada usuario.
          </p>
        </div>
      </div>

      {state.error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          <span>{state.error}</span>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          {renderForm()}
        </div>
        <div className={styles.rightPanel}>
          {renderRolesList()}
        </div>
      </div>

      {state.roles.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <CheckCircle size={16} color="#10b981" />
            <span>{state.roles.length} roles configurados</span>
          </div>
          <Button
            variant="default"
            size="m"
            onClick={onNext}
            iconName="ArrowRight"
            iconPosition="right"
            disabled={state.isLoading}
          >
            Continuar con Tipos de Gobierno
          </Button>
        </div>
      )}
    </div>
  );
};