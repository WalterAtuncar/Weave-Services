import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Building, Users, Plus, Save, Trash2, ChevronUp, ChevronDown, Crown, CheckCircle, Edit } from 'lucide-react';
import { SystemFormData, SystemFormErrors, GobernanzaRef } from '../types';
import styles from '../StepperSystemForm.module.css';
import gfStyles from '../../gobernanza-form/GobernanzaForm.module.css';
import { Button } from '../../button/button';
import { SearchableSelect, SearchableSelectOption } from '../../searchable-select/SearchableSelect';
import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../contexts/ThemeContext';
import { gobernanzaService, gobernanzaRolService, rolGobernanzaService, usuariosService } from '../../../../services';
import { SelectWrapper, SelectContent, SelectItem } from '../../select';
import { AlertService } from '../../alerts';
import { TipoEntidadAsociacion } from '../../../../services/types/gobernanza-entidad.types';
import { UpdateGobernanzaCommand } from '../../../../services/types/gobernanza.types';

const MIN_SEARCH_CHARS = 3;

// Interface para los elementos de rol rápido
export interface QuickRoleItem {
  id: string;
  gobernanzaRolId?: number;
  rolGobernanzaId?: number;
  usuarioId?: number;
  fechaAsignacion?: string; // yyyy-MM-dd
  ordenEjecucion?: number; // 0 para involucrados
  estadoActivo?: number; // 1 activo, 0 inactivo
  puedeEditar?: boolean; // permisos de edición
  expanded?: boolean; // UI expand/collapse
}

// Props base para el componente abstracto
export interface GovernanceStepBaseProps {
  formData: SystemFormData;
  errors?: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  onErrorChange?: (errors: SystemFormErrors) => void;
  gobernanzas?: GobernanzaRef[];
  // Props específicos del dominio
  tipoEntidadId: number; // 1 para sistemas, 3 para data
  title: string; // "Gobernanza" para sistemas, "Gobernanza de Datos" para data
  description: string; // Descripción específica
  allowedRoleCodes?: string[]; // Códigos de roles permitidos (ej: ['EJ', 'IN'])
  readOnlyRoleCodes?: string[]; // Códigos de roles de solo lectura (ej: ['SP', 'OW'])
}

export const GovernanceStepBase: React.FC<GovernanceStepBaseProps> = ({
  formData,
  errors,
  onDataChange,
  onErrorChange,
  gobernanzas,
  tipoEntidadId,
  title,
  description,
  allowedRoleCodes = ['EJ', 'IN'],
  readOnlyRoleCodes = ['SP', 'OW', 'SPONSOR', 'OWNER']
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const orgId = user?.organizacionId;

  // Estados de búsqueda
  const [searchOptions, setSearchOptions] = useState<SearchableSelectOption[]>([]);
  const [tipoBusqueda, setTipoBusqueda] = useState<string>('NOMBRE_GOBIERNO');
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estados de datos
  const [gobernanzaDetails, setGobernanzaDetails] = useState<any>(null);
  const [rolesCatalog, setRolesCatalog] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [quickRoles, setQuickRoles] = useState<QuickRoleItem[]>([]);

  // Estados de UI
  const [loadingQuick, setLoadingQuick] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Ref para tracking de cambios
  const lastSavedSnapshotRef = useRef<string>('');

  // Utilidades
  const formatDateForInput = (date: Date | string | null | undefined): string => {
    if (!date) return new Date().toISOString().split('T')[0];
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  const getRoleCodeById = useCallback((id?: number): string | undefined => {
    if (!id) return undefined;
    const role = rolesCatalog.find((r: any) => r.rolGobernanzaId === id);
    return role?.rolGobernanzaCodigo;
  }, [rolesCatalog]);

  const detectarTipoFlujo = useCallback((roles: QuickRoleItem[]): 'SECUENCIAL' | 'PARALELO' => {
    // Tomar solo Ejecutores (EJ)
    const ejecutores = roles.filter((r) => getRoleCodeById(r.rolGobernanzaId)?.toUpperCase() === 'EJ');
    if (ejecutores.length === 0) return 'SECUENCIAL';
    const gruposPorOrden = new Map<number, number>();
    ejecutores.forEach((ej) => {
      const orden = (ej.ordenEjecucion ?? 1) || 1;
      gruposPorOrden.set(orden, (gruposPorOrden.get(orden) || 0) + 1);
    });
    for (const [, cantidad] of gruposPorOrden) {
      if (cantidad > 1) return 'PARALELO';
    }
    return 'SECUENCIAL';
  }, [getRoleCodeById]);

  // Determina si por código el rol es de solo lectura
  const isRoleReadOnlyByCode = (code?: string): boolean => {
    const c = (code || '').toUpperCase();
    return readOnlyRoleCodes.some(readOnlyCode => c === readOnlyCode.toUpperCase());
  };

  // FUNC: cargar gobiernos existentes usando el endpoint buscarGobernanzasConRoles
  const loadGobiernosExistentes = useCallback(async (searchTerm: string = '') => {
    const idOrg = orgId;
    if (!idOrg) {
      console.warn('⚠️ No organizationId available for search');
      return;
    }

    try {
      // Mapear tipoBusqueda de la UI al esperado por el servicio
      const tipoBusquedaApi = tipoBusqueda === 'NOMBRE_APELLIDO_OWNER_SPONSOR' ? 'OWNER_SPONSOR' : 'NOMBRE_GOBIERNO';

      const requestParams = {
        organizacionId: idOrg,
        tipoEntidadId: tipoEntidadId, // Usar el tipoEntidadId pasado como prop
        soloActivos: true,
        textSearch: searchTerm || undefined,
        tipoBusqueda: tipoBusquedaApi
      };

      console.log('🔍 Calling buscarGobernanzasConRoles with params:', requestParams);

      const response = await gobernanzaService.buscarGobernanzasConRoles(requestParams);
      
      console.log('📡 Response from buscarGobernanzasConRoles:', response);
      
      if (response?.success && Array.isArray(response.data)) {
        const normalizeStr = (s: any) =>
          (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const searchNorm = normalizeStr(searchTerm);

        const options: SearchableSelectOption[] = response.data.map((gov: any) => {
          const id = gov.gobernanzaId || gov.GobernanzaId || gov.id || gov.Id;
          const govName = gov.nombre || gov.Nombre || `Gobernanza ${id}`;

          let label = govName;

          if (tipoBusquedaApi === 'OWNER_SPONSOR') {
            const roles = gov.rolesAsignados || gov.RolesAsignados || [];
            const sponsorOwnerRoles = Array.isArray(roles)
              ? roles.filter((r: any) => {
                  const code = (r.rolGobernanzaCodigo || r.RolGobernanzaCodigo || '').toUpperCase();
                  return code === 'SPONSOR' || code === 'OWNER' || code === 'SP' || code === 'OW';
                })
              : [];

            const roleMatch =
              sponsorOwnerRoles.find((r: any) => {
                if (!searchNorm) return false;
                const parts = [
                  r.nombreCompleto || r.NombreCompleto || '',
                  r.nombres || r.Nombres || '',
                  r.apellidoPaterno || r.ApellidoPaterno || '',
                  r.apellidoMaterno || r.ApellidoMaterno || '',
                  r.usuarioNombre || r.UsuarioNombre || ''
                ];
                return parts.some((p: string) => normalizeStr(p).includes(searchNorm));
              }) || sponsorOwnerRoles[0];

            if (roleMatch) {
              const roleName =
                roleMatch.rolGobernanzaNombre ||
                roleMatch.RolGobernanzaNombre ||
                ((roleMatch.rolGobernanzaCodigo || roleMatch.RolGobernanzaCodigo || '').toUpperCase() === 'SPONSOR' ? 'Sponsor' : 'Owner');

              const personaNombre =
                `${roleMatch.nombres || roleMatch.Nombres || ''} ${roleMatch.apellidoPaterno || roleMatch.ApellidoPaterno || ''}`.trim() ||
                (roleMatch.nombreCompleto || roleMatch.NombreCompleto || '').trim();

              if (personaNombre && roleName) {
                label = `${personaNombre} (${roleName}) - ${govName}`;
              } else if (roleName) {
                label = `(${roleName}) - ${govName}`;
              }
            }
          }

          return {
            value: id,
            label
          } as SearchableSelectOption;
        });
        console.log('✅ Mapped options:', options);
        setSearchOptions(options);
      } else {
        console.log('❌ No data or unsuccessful response:', response);
        setSearchOptions([]);
        // Mostrar mensaje informativo si no hay resultados
        if (searchTerm && searchTerm.length >= MIN_SEARCH_CHARS) {
          AlertService.info(`No se encontraron gobiernos que coincidan con "${searchTerm}"`);
        }
      }
    } catch (error) {
      if ((error as any)?.code === 'ERR_CANCELED' || (error as any)?.message === 'canceled' || (error as any)?.name === 'CanceledError' || (error as any)?.name === 'AbortError') {
        return; // Ignorar cancelaciones
      }
      console.error('❌ Error loading gobiernos:', error);
      setSearchOptions([]);
      // Mostrar error al usuario
      AlertService.error('Error al buscar gobiernos. Por favor, intente nuevamente.');
    }
  }, [orgId, tipoBusqueda, tipoEntidadId]);

  // Cargar catálogos (roles y usuarios)
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        console.log('🔄 Cargando catálogos de roles y usuarios...');
        
        const [rolesResp, usuariosResp] = await Promise.all([
          rolGobernanzaService.getAllRolesGobernanza({ includeDeleted: false }),
          usuariosService.getUsuariosConPersonaPosicion(orgId || 0, { includeDeleted: false })
        ]);

        console.log('📡 Respuesta de roles:', rolesResp);
        console.log('📡 Respuesta de usuarios:', usuariosResp);

        const roles = rolesResp.success ? (rolesResp.data || []) : [];
        console.log('✅ Roles cargados:', roles.length, 'elementos');
        setRolesCatalog(Array.isArray(roles) ? roles : []);

        let usuariosData: any[] = [];
        if (usuariosResp.success && usuariosResp.data) {
          usuariosData = Array.isArray(usuariosResp.data) 
            ? usuariosResp.data 
            : (usuariosResp.data as any)?.usuarios || [];
        }
        console.log('✅ Usuarios cargados:', usuariosData.length, 'elementos');
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);

        if (!rolesResp.success) {
          console.error('❌ Error al cargar roles:', rolesResp.message);
          AlertService.error('Error al cargar catálogo de roles');
        }
        
        if (!usuariosResp.success) {
          console.error('❌ Error al cargar usuarios:', usuariosResp.message);
          AlertService.error('Error al cargar catálogo de usuarios');
        }
      } catch (e) {
        console.error('❌ Error cargando catálogos de roles/usuarios', e);
        AlertService.error('Error al cargar catálogos. Por favor, recargue la página.');
      }
    };

    if (orgId) {
      loadCatalogs();
    } else {
      console.warn('⚠️ No hay organizationId disponible para cargar catálogos');
    }
  }, [orgId]);

  // Handler de cambio de búsqueda con debounce y mínimo de caracteres
  const handleSearchChange = useCallback(
    (searchTerm: string) => {
      console.log('🔍 handleSearchChange called with:', searchTerm);
      console.log('🔍 Search term length:', searchTerm.length);
      console.log('🔍 MIN_SEARCH_CHARS:', MIN_SEARCH_CHARS);
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        if (searchTerm.length >= MIN_SEARCH_CHARS) {
          console.log('🔍 Starting search for:', searchTerm);
          setSearchOptions([]); // Limpiar opciones previas
          await loadGobiernosExistentes(searchTerm);
        } else if (searchTerm.length === 0) {
          console.log('🔍 Search term empty, clearing options');
          setSearchOptions([]);
        } else {
          console.log('🔍 Search term too short, clearing options');
          setSearchOptions([]);
        }
      }, 300);
    },
    [loadGobiernosExistentes]
  );

  // Limpiar timeout en desmontaje
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Limpiar opciones al cambiar criterio de búsqueda para evitar resultados obsoletos
  useEffect(() => {
    setSearchOptions([]);
  }, [tipoBusqueda]);

  // Manejar selección por id
  const handleGobiernoSeleccionadoById = async (value: string | number) => {
    const id = value ? Number(value) : undefined;
    if (!id) {
      setGobernanzaDetails(null);
      setQuickRoles([]);
      // Reiniciar baseline cuando no hay gobernanza seleccionada
      lastSavedSnapshotRef.current = makeSnapshot([]);
      onDataChange({ 
        gobernanzaId: undefined,
        tieneGobernanzaPropia: false 
      });
      return;
    }

    try {
      // Cargar detalles del gobierno seleccionado
      const detalles = await gobernanzaService.getGobernanzaById(id);
      setGobernanzaDetails(detalles?.data);
      // Asegurar que el seleccionado esté en el combo aunque no haya opciones cargadas por búsqueda
      const selectedLabel = detalles?.data?.nombre || detalles?.data?.Nombre || `Gobernanza ${id}`;
      setSearchOptions((prev) => {
        const index = prev.findIndex((o) => Number(o.value) === Number(id));
        if (index !== -1) {
          const current = prev[index];
          if (current.label !== selectedLabel) {
            const next = [...prev];
            next[index] = { ...current, label: selectedLabel };
            return next;
          }
          return prev;
        }
        return [{ value: id, label: selectedLabel }, ...prev];
      });
      
      // 🔧 CORRECCIÓN: Cuando se selecciona un gobierno, el sistema TIENE gobernanza propia
      // tieneGobernanzaPropia = true significa que el sistema tiene un gobierno asignado
      // tieneGobernanzaPropia = false significa que hereda el gobierno de la organización
      onDataChange({ 
        gobernanzaId: id,
        tieneGobernanzaPropia: true
      });

      // Cargar roles de la gobernanza seleccionada
      await loadAssignedRoles();
    } catch (error) {
      console.error('Error loading gobierno details:', error);
    }
  };

  // Cargar roles asignados (solo EJ/IN) cuando hay gobernanza seleccionada
  const loadAssignedRoles = useCallback(async () => {
    const id = formData.gobernanzaId;
    if (!id) {
      console.log('🔍 No hay gobernanzaId para cargar roles asignados');
      return;
    }
    
    console.log('🔄 Cargando roles asignados para gobernanza ID:', id);
    setLoadingQuick(true);
    
    try {
      const rolesResp = await gobernanzaRolService.getGobernanzaRolesByGobernanzaId(Number(id), false, true);
      console.log('📡 Respuesta de roles asignados:', rolesResp);
      
      if (rolesResp.success && Array.isArray(rolesResp.data)) {
        const mapped: QuickRoleItem[] = rolesResp.data
          .map((r: any) => ({
            id: `role_${r.gobernanzaRolId}`,
            gobernanzaRolId: r.gobernanzaRolId,
            rolGobernanzaId: r.rolGobernanzaId,
            usuarioId: r.usuarioId,
            fechaAsignacion: formatDateForInput(r.fechaAsignacion),
            ordenEjecucion: r.ordenEjecucion ?? 0,
            estadoActivo: typeof r.estado === 'number' ? r.estado : (typeof r.estadoActivo === 'number' ? r.estadoActivo : 1),
            puedeEditar: r.puedeEditar === 1 || r.puedeEditar === true,
            expanded: false
          }));
        
        console.log('✅ Roles asignados mapeados:', mapped.length, 'elementos');
        setQuickRoles(mapped);
        // Establecer baseline después de cargar desde backend
        lastSavedSnapshotRef.current = makeSnapshot(mapped);
      } else {
        console.log('⚠️ No se encontraron roles asignados o respuesta no exitosa');
        setQuickRoles([]);
        lastSavedSnapshotRef.current = makeSnapshot([]);
      }
    } catch (e) {
      console.error('❌ Error al cargar roles asignados', e);
      AlertService.error('Error al cargar roles asignados. Por favor, intente nuevamente.');
      setQuickRoles([]);
      lastSavedSnapshotRef.current = makeSnapshot([]);
    } finally {
      setLoadingQuick(false);
    }
  }, [formData.gobernanzaId, rolesCatalog]);

  useEffect(() => {
    if (formData.gobernanzaId) {
      loadAssignedRoles();
    }
  }, [formData.gobernanzaId, loadAssignedRoles]);

  // Efecto de hidratación al montar el paso o volver desde otros pasos
  useEffect(() => {
    const id = formData.gobernanzaId ? Number(formData.gobernanzaId) : undefined;
    if (!id) {
      setGobernanzaDetails(null);
      return;
    }

    let cancelled = false;

    const ensureSelectedInOptions = (label: string) => {
      setSearchOptions((prev) => {
        const index = prev.findIndex((o) => Number(o.value) === Number(id));
        if (index !== -1) {
          const current = prev[index];
          if (current.label !== label) {
            const next = [...prev];
            next[index] = { ...current, label };
            return next;
          }
          return prev;
        }
        // Insertar al inicio para que se vea inmediatamente
        return [{ value: id, label }, ...prev];
      });
    };

    const hydrate = async () => {
      try {
        // Si ya tenemos detalles del mismo id, solo asegurar opciones
        const currentId = Number(
          (gobernanzaDetails?.gobernanzaId ?? gobernanzaDetails?.id ?? gobernanzaDetails?.GobernanzaId ?? gobernanzaDetails?.Id) || 0
        );
        if (currentId === id) {
          const label = gobernanzaDetails?.nombre || gobernanzaDetails?.Nombre || `Gobernanza ${id}`;
          ensureSelectedInOptions(label);
          return;
        }
        const resp = await gobernanzaService.getGobernanzaById(id);
        if (cancelled) return;
        const det = resp?.data;
        setGobernanzaDetails(det);
        const label = det?.nombre || det?.Nombre || `Gobernanza ${id}`;
        ensureSelectedInOptions(label);
      } catch (e) {
        if (!cancelled) {
          console.error('Error pre-cargando gobernanza seleccionada', e);
        }
      }
    };

    // Preinsertar una opción con etiqueta provisional para mostrar selección inmediata
    ensureSelectedInOptions(`Gobernanza ${id}`);
    hydrate();

    return () => {
      cancelled = true;
    };
  }, [formData.gobernanzaId]);

  // Calcular y exponer "hasChanges" cuando se edita quickRoles
  useEffect(() => {
    const currentSnap = makeSnapshot(quickRoles);

    // Si no existe baseline aún (montaje inicial), lo establecemos al estado actual y NO marcamos cambios
    if (!lastSavedSnapshotRef.current) {
      lastSavedSnapshotRef.current = currentSnap;
      setHasChanges(false);
      (window as any).__step4HasChanges = () => false;
      return;
    }

    const changed = currentSnap !== lastSavedSnapshotRef.current;
    setHasChanges(changed);
    (window as any).__step4HasChanges = () => changed;
  }, [quickRoles]);

  // Limpiar el indicador global al desmontar
  useEffect(() => {
    // Inicializar baseline vacío al montar para evitar falsos positivos
    if (!lastSavedSnapshotRef.current) {
      lastSavedSnapshotRef.current = makeSnapshot([]);
    }
    // Exponer falso por defecto al cargar el paso
    (window as any).__step4HasChanges = () => false;

    return () => {
      (window as any).__step4HasChanges = undefined;
    };
  }, []);

  // Funciones de snapshot
  const normalizeRole = (r: QuickRoleItem) => ({
    key: r.gobernanzaRolId ?? r.id,
    rolGobernanzaId: r.rolGobernanzaId ?? null,
    usuarioId: r.usuarioId ?? null,
    fechaAsignacion: r.fechaAsignacion ?? '',
    ordenEjecucion: r.ordenEjecucion ?? 0,
    estadoActivo: r.estadoActivo ?? 1,
    puedeEditar: !!r.puedeEditar,
  });

  const makeSnapshot = (roles: QuickRoleItem[]) => {
    const normalized = roles
      .map(normalizeRole)
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
    return JSON.stringify(normalized);
  };

  // Derivar una lista de usuarios únicos desde los roles del detalle
  const usuariosInvolucrados: string[] = React.useMemo(() => {
    if (!gobernanzaDetails?.roles) return [];
    const nombres = gobernanzaDetails.roles
      .map((r: any) => r.usuarioAsignado || r.usuarioNombre)
      .filter(Boolean);
    return Array.from(new Set(nombres));
  }, [gobernanzaDetails]);

  // Handlers de edición rápida
  const handleAddQuickRole = () => {
    if (!formData.gobernanzaId) {
      AlertService.warning('Seleccione un gobierno antes de agregar roles.');
      return;
    }
    const newItem: QuickRoleItem = {
      id: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fechaAsignacion: formatDateForInput(new Date()),
      ordenEjecucion: 0,
      estadoActivo: 1,
      puedeEditar: false,
      expanded: true
    };
    setQuickRoles((prev) => [newItem, ...prev]);
  };

  const updateQuickRoleField = (id: string, field: keyof QuickRoleItem, value: any) => {
    setQuickRoles((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      let next: QuickRoleItem = { ...r, [field]: value } as any;
      if (field === 'rolGobernanzaId') {
        const code = getRoleCodeById(Number(value));
        if (code === 'IN') {
          next.ordenEjecucion = 0;
        }
      }
      return next;
    }));
  };

  const toggleExpand = (id: string) => {
    setQuickRoles(prev => prev.map(r => r.id === id ? { ...r, expanded: !r.expanded } : r));
  };

  const validateQuickRole = (r: QuickRoleItem): string | null => {
    if (!r.rolGobernanzaId) return 'Seleccione un rol';
    if (!r.usuarioId) return 'Seleccione un usuario';
    if (!r.fechaAsignacion) return 'Seleccione la fecha de asignación';
    if (r.ordenEjecucion === undefined || r.ordenEjecucion === null || r.ordenEjecucion < 0) return 'El orden debe ser mayor o igual a 0';
    return null;
  };

  const handleSaveQuickRole = async (id: string) => {
    const item = quickRoles.find((x) => x.id === id);
    if (!item || !formData.gobernanzaId) return;

    // Bloquear edición para roles de solo lectura
    const codeForItem = getRoleCodeById(item.rolGobernanzaId);
    if (isRoleReadOnlyByCode(codeForItem)) {
      AlertService.warning('Los roles Sponsor y Owner no se pueden editar en esta vista.');
      return;
    }

    const err = validateQuickRole(item);
    if (err) {
      AlertService.error(err);
      return;
    }

    setSavingIds((prev) => new Set(prev).add(id));
    try {
      if (item.gobernanzaRolId) {
        // Actualizar
        const payload: any = {
          gobernanzaRolId: item.gobernanzaRolId,
          gobernanzaId: Number(formData.gobernanzaId),
          rolGobernanzaId: Number(item.rolGobernanzaId),
          usuarioId: Number(item.usuarioId),
          fechaAsignacion: new Date(item.fechaAsignacion as string),
          estadoActivo: (item.estadoActivo ?? 1),
          ordenEjecucion: item.ordenEjecucion ?? 0,
          puedeEditar: !!item.puedeEditar,
          actualizadoPor: orgId || undefined
        };
        const resp = await gobernanzaRolService.updateGobernanzaRol(item.gobernanzaRolId, payload);
        if (resp.success) {
          AlertService.success('Asignación actualizada');
          await loadAssignedRoles();
        } else {
          AlertService.error(resp.message || 'No se pudo actualizar la asignación');
        }
      } else {
        // Crear
        const payload: any = {
          gobernanzaId: Number(formData.gobernanzaId),
          rolGobernanzaId: Number(item.rolGobernanzaId),
          usuarioId: Number(item.usuarioId),
          fechaAsignacion: new Date(item.fechaAsignacion as string),
          estadoActivo: (item.estadoActivo ?? 1),
          ordenEjecucion: item.ordenEjecucion ?? 0,
          puedeEditar: (item.puedeEditar ? 1 : 0),
          creadoPor: orgId || undefined
        };
        const resp = await gobernanzaRolService.createGobernanzaRol(payload);
        if (resp.success) {
          AlertService.success('Asignación creada');
          await loadAssignedRoles();
        } else {
          AlertService.error(resp.message || 'No se pudo crear la asignación');
        }
      }
    } catch (e: any) {
      console.error('Error guardando asignación', e);
      AlertService.error(e?.message || 'Error al guardar la asignación');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteQuickRole = async (id: string) => {
    const item = quickRoles.find((x) => x.id === id);
    if (!item) return;

    // Bloquear eliminación para roles de solo lectura
    const codeForItem = getRoleCodeById(item.rolGobernanzaId);
    if (isRoleReadOnlyByCode(codeForItem)) {
      AlertService.warning('Los roles Sponsor y Owner no se pueden eliminar en esta vista.');
      return;
    }

    // Si es temporal, solo borrar local
    if (!item.gobernanzaRolId) {
      setQuickRoles((prev) => prev.filter((x) => x.id !== id));
      return;
    }

    try {
      const resp = await gobernanzaRolService.deleteGobernanzaRol(item.gobernanzaRolId);
      if (resp.success) {
        AlertService.success('Asignación eliminada');
        await loadAssignedRoles();
      } else {
        AlertService.error(resp.message || 'No se pudo eliminar la asignación');
      }
    } catch (e: any) {
      console.error('Error eliminando asignación', e);
      AlertService.error(e?.message || 'Error al eliminar la asignación');
    }
  };

  // Guardado masivo enviando el MISMO payload que usa GobernanzaForm (updateGobernanza)
  const handleSaveAllQuickRoles = async () => {
    // Validar que haya una gobernanza seleccionada
    if (!formData.gobernanzaId) {
      AlertService.warning('Seleccione un gobierno antes de guardar.');
      return;
    }

    // Validar filas editables (no roles de solo lectura)
    for (const item of quickRoles) {
      const code = getRoleCodeById(item.rolGobernanzaId);
      if (isRoleReadOnlyByCode(code)) continue; // saltar roles de solo lectura
      const err = validateQuickRole(item);
      if (err) {
        AlertService.error(err);
        return; // detener al primer error para feedback claro
      }
    }

    // Construcción de payload estilo UpdateGobernanzaCommand
    try {
      // Marcar estado de guardado usando un id SENTINELA para deshabilitar botón
      setSavingIds((prev) => new Set(prev).add('__BULK__'));

      // Datos base desde el detalle cargado o fallback
      const base = gobernanzaDetails || {};
      const tipoFlujo = detectarTipoFlujo(quickRoles);

      const command: UpdateGobernanzaCommand = {
        gobernanzaId: Number(formData.gobernanzaId),
        tipoGobiernoId: base?.tipoGobiernoId ? Number(base.tipoGobiernoId) : undefined,
        tipoEntidadId: base?.tipoEntidadId ? Number(base.tipoEntidadId) : tipoEntidadId,
        organizacionId: base?.organizacionId ? Number(base.organizacionId) : (orgId || undefined),
        entidadId: typeof base?.entidadId === 'number' ? Number(base.entidadId) : -1,
        nombre: base?.nombre || undefined,
        fechaAsignacion: base?.fechaAsignacion || undefined,
        fechaVencimiento: base?.fechaVencimiento || undefined,
        observaciones: base?.observaciones || undefined,
        tipoFlujo,
        gobernanzaRoles: quickRoles
          // Enviar solo filas con rol y usuario definidos; roles de solo lectura no se editan aquí
          .filter((r) => !!r.rolGobernanzaId && !!r.usuarioId)
          .map((r) => ({
            gobernanzaRolId: r.gobernanzaRolId || undefined,
            rolGobernanzaId: Number(r.rolGobernanzaId!),
            usuarioId: Number(r.usuarioId!),
            fechaAsignacion: new Date(r.fechaAsignacion as string),
            estadoActivo: (r.estadoActivo ?? 1),
            ordenEjecucion: r.ordenEjecucion ?? 0,
            puedeEditar: !!r.puedeEditar
          })),
        actualizadoPor: orgId || undefined
      };

      const resp = await gobernanzaService.updateGobernanza(command);
      if (resp.success) {
        AlertService.success('Gobierno actualizado correctamente');
        // Recargar asignaciones para reflejar backend
        await loadAssignedRoles();
        // Actualizar snapshot base para detectar cambios futuros
        lastSavedSnapshotRef.current = makeSnapshot(quickRoles);
      } else {
        AlertService.error(resp.message || 'No se pudo actualizar el gobierno');
      }
    } catch (e: any) {
      console.error('Error actualizando gobierno', e);
      AlertService.error(e?.message || 'Error al guardar');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete('__BULK__');
        return next;
      });
    }
  };

  // Opciones filtradas según los códigos permitidos
  const filteredRolesCatalog = rolesCatalog.filter((rol: any) => {
    const code = rol?.rolGobernanzaCodigo?.toUpperCase();
    return allowedRoleCodes.some(allowedCode => code === allowedCode.toUpperCase());
  });

  // Obtener nombre completo del usuario
  const getUsuarioNombre = (u: any) => u?.nombreCompletoConPosicion || u?.nombreCompleto || u?.nombreUsuario || 'Usuario';

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <Shield size={20} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>{title}</h2>
          <p className={styles.stepDescription}>{description}</p>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.governanceSelection}>
          <div className={styles.searchSection}>
            <h4 className={styles.sectionTitle}>
              <Building className={styles.sectionIcon} />
              Gobierno Existente
            </h4>
            
            {/* Criterios de búsqueda */}
            <div className={styles.searchCriteria}>
              <label className={styles.radioLabel}>Criterios de búsqueda:</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="tipoBusqueda"
                    value="NOMBRE_GOBIERNO"
                    checked={tipoBusqueda === 'NOMBRE_GOBIERNO'}
                    onChange={(e) => setTipoBusqueda(e.target.value)}
                  />
                  <span>Nombre de Gobierno</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="tipoBusqueda"
                    value="NOMBRE_APELLIDO_OWNER_SPONSOR"
                    checked={tipoBusqueda === 'NOMBRE_APELLIDO_OWNER_SPONSOR'}
                    onChange={(e) => setTipoBusqueda(e.target.value)}
                  />
                  <span>Nombre/Apellido de Owner/Sponsor</span>
                </label>
              </div>
            </div>

            {/* Selector de gobierno */}
            <div className={styles.selectContainer}>
              <SearchableSelect
                options={searchOptions}
                value={formData.gobernanzaId ?? null}
                onChange={handleGobiernoSeleccionadoById}
                onSearchChange={handleSearchChange}
                placeholder="Escriba para buscar gobiernos..."
                searchPlaceholder="Buscar gobiernos (mín. 3 caracteres)..."
                noResultsText="No se encontraron gobiernos. Intente con otro término de búsqueda."
                className={styles.governanceSelect}
              />
            </div>

            {/* Información del gobierno seleccionado */}
            {gobernanzaDetails && (
              <div className={styles.selectedGovernanceInfo}>
                <div className={styles.governanceHeader}>
                  <Shield className={styles.governanceIcon} />
                  <h5>{gobernanzaDetails.nombre}</h5>
                </div>
                
                {gobernanzaDetails.descripcion && (
                  <p className={styles.governanceDescription}>
                    {gobernanzaDetails.descripcion}
                  </p>
                )}
                
                {/* Sección de Roles (visual) */}
                {gobernanzaDetails.roles && gobernanzaDetails.roles.length > 0 && (
                  <div className={styles.rolesSection}>
                    <h6 className={styles.rolesTitle}>
                      <Users className={styles.rolesIcon} />
                      Roles asignados ({gobernanzaDetails.roles.length})
                    </h6>
                    <div className={styles.rolesList}>
                      {gobernanzaDetails.roles.map((rol: any, index: number) => (
                        <div key={index} className={styles.roleItem}>
                          <span className={styles.roleName}>{rol.rolGobierno || rol.rolGobernanzaNombre || rol.rolNombre}</span>
                          <span className={styles.userName}>{rol.usuarioAsignado || rol.usuarioNombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sección de Asignación de Roles y Usuarios (replicada del modal) */}
                {formData.gobernanzaId && (
                  <div className={gfStyles.section}>
                    <div className={gfStyles.sectionHeader}>
                      <Users size={20} color={colors.primary} />
                      <h3>Asignación de Roles y Usuarios</h3>
                      <Button
                        variant="default"
                        size="s"
                        onClick={handleAddQuickRole}
                        iconName="Plus"
                        disabled={loadingQuick}
                      >
                        Agregar Rol
                      </Button>
                    </div>

                    {loadingQuick && (
                      <div style={{ fontSize: '0.875rem', color: '#6B7280', margin: '8px 0' }}>Cargando roles...</div>
                    )}

                    {quickRoles.length === 0 && !loadingQuick ? (
                      <div className={gfStyles.emptyRoles}>
                        <Users size={48} color={colors.textSecondary} />
                        <p>No hay roles asignados</p>
                        <p style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                          Agrega al menos un rol y usuario
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className={gfStyles.rolesList}>
                          {quickRoles.map((role, idx) => {
                            const saving = savingIds.has(role.id);
                            const roleCode = getRoleCodeById(role.rolGobernanzaId);
                            const disableOrden = roleCode === 'IN';
                            const roleName = (rolesCatalog.find((x: any) => x.rolGobernanzaId === role.rolGobernanzaId)?.rolGobernanzaNombre) || 'Sin asignar';
                            const userLabel = getUsuarioNombre(usuarios.find((u: any) => u.usuarioId === role.usuarioId)) || 'Sin asignar';
                            const isExpanded = !!role.expanded;
                            const isReadOnly = isRoleReadOnlyByCode(roleCode);

                            // Asegurar opciones por fila
                            const roleOptions = isReadOnly
                              ? rolesCatalog.filter((r: any) => r.rolGobernanzaId === role.rolGobernanzaId)
                              : filteredRolesCatalog;

                            const userOptions = (() => {
                              const list = [...usuarios];
                              if (role.usuarioId && !list.some((u: any) => u.usuarioId === role.usuarioId)) {
                                const det = (gobernanzaDetails?.roles || []).find((r: any) =>
                                  (r.gobernanzaRolId && r.gobernanzaRolId === role.gobernanzaRolId) ||
                                  (r.usuarioId && r.usuarioId === role.usuarioId)
                                );
                                const label = det?.usuarioAsignado || det?.usuarioNombre || undefined;
                                list.push({
                                  usuarioId: role.usuarioId,
                                  nombreCompleto: label || `Usuario ${role.usuarioId}`
                                });
                              }
                              return list;
                            })();

                            return (
                              <div key={role.id} className={gfStyles.roleCard}>
                                <div 
                                  className={gfStyles.roleHeader}
                                  onClick={() => toggleExpand(role.id)}
                                >
                                  {/* Título */}
                                  <div className={gfStyles.roleTitle}>
                                    <Crown size={16} color={colors.primary} />
                                    <span>Rol {idx + 1}</span>
                                  </div>

                                  {/* Información central */}
                                  <div className={gfStyles.roleHeaderInfo}>
                                    <div className={gfStyles.roleHeaderField}>
                                      <div className={gfStyles.roleHeaderLabel}>Rol de Gobierno</div>
                                      <div className={gfStyles.roleHeaderValue} title={roleName}>
                                        {roleName}
                                      </div>
                                    </div>
                                    <div className={gfStyles.roleHeaderField}>
                                      <div className={gfStyles.roleHeaderLabel}>Usuario Asignado</div>
                                      <div className={gfStyles.roleHeaderValue} title={userLabel}>
                                        {userLabel}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Acciones */}
                                  <div className={gfStyles.roleHeaderActions}>
                                    <button
                                      className={gfStyles.collapseButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(role.id);
                                      }}
                                      title={isExpanded ? 'Colapsar' : 'Expandir'}
                                    >
                                      <ChevronDown 
                                        size={16}
                                        style={{ 
                                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                          transition: 'transform 0.2s ease'
                                        }}
                                      />
                                    </button>
                                    {!isReadOnly && (
                                      <Button
                                        variant="ghost"
                                        size="s"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteQuickRole(role.id); }}
                                        iconName="Trash2"
                                        title="Eliminar rol"
                                        disabled={saving}
                                      />
                                    )}
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className={gfStyles.roleContentCompact} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1.3fr) minmax(0, 1fr) minmax(140px, 0.6fr)', gap: 12, alignItems: 'end' }}>
                                    {/* Rol */}
                                    <div className={gfStyles.roleFieldGroup}>
                                      <div className={gfStyles.roleFieldLabel}>Rol de Gobierno</div>
                                      <SelectWrapper
                                        value={role.rolGobernanzaId ? String(role.rolGobernanzaId) : undefined}
                                        onValueChange={(v) => updateQuickRoleField(role.id, 'rolGobernanzaId', v ? Number(v) : undefined)}
                                        placeholder="Seleccionar..."
                                        searchable
                                        disabled={isReadOnly}
                                      >
                                        <SelectContent>
                                          {roleOptions.map((r: any) => (
                                            <SelectItem key={r.rolGobernanzaId} value={String(r.rolGobernanzaId)}>
                                              {r.rolGobernanzaNombre}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </SelectWrapper>
                                    </div>

                                    {/* Usuario */}
                                    <div className={gfStyles.roleFieldGroup} style={{ minWidth: 0 }}>
                                      <div className={gfStyles.roleFieldLabel}>Usuario</div>
                                      <div style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
                                        <SelectWrapper
                                          value={role.usuarioId ? String(role.usuarioId) : undefined}
                                          onValueChange={(v) => updateQuickRoleField(role.id, 'usuarioId', v ? Number(v) : undefined)}
                                          placeholder="Seleccionar..."
                                          searchable
                                          disabled={isReadOnly}
                                        >
                                          <SelectContent>
                                            {userOptions.map((u: any) => (
                                              <SelectItem key={u.usuarioId} value={String(u.usuarioId)}>
                                                {getUsuarioNombre(u)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </SelectWrapper>
                                      </div>
                                    </div>

                                    {/* Fecha Asignación - Siempre deshabilitada */}
                                    <div className={gfStyles.roleFieldGroup}>
                                      <div className={gfStyles.roleFieldLabel}>Fecha Asignación</div>
                                      <input
                                        type="date"
                                        value={role.fechaAsignacion || ''}
                                        onChange={(e) => updateQuickRoleField(role.id, 'fechaAsignacion', e.target.value)}
                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 4, backgroundColor: '#f5f5f5' }}
                                        disabled={true}
                                      />
                                    </div>

                                    {/* Orden */}
                                    <div className={gfStyles.roleFieldGroup}>
                                      <div className={gfStyles.roleFieldLabel}>Orden</div>
                                      <input
                                        type="number"
                                        min={0}
                                        max={999}
                                        disabled={disableOrden || isReadOnly}
                                        value={role.ordenEjecucion ?? 0}
                                        onChange={(e) => updateQuickRoleField(role.id, 'ordenEjecucion', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 4 }}
                                      />
                                      <small style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem', lineHeight: 1.1, whiteSpace: 'normal' }}>
                                        Secuencia de ejecución
                                      </small>
                                    </div>

                                    {/* Permisos */}
                                    <div className={gfStyles.rolePermissions}>
                                      <div className={gfStyles.rolePermissionItem}>
                                        <input
                                          type="checkbox"
                                          checked={(role.estadoActivo ?? 1) === 1}
                                          onChange={(e) => updateQuickRoleField(role.id, 'estadoActivo', e.target.checked ? 1 : 0)}
                                          style={{ width: 12, height: 12 }}
                                          disabled={isReadOnly}
                                        />
                                        <CheckCircle size={12} color={(role.estadoActivo ?? 1) === 1 ? '#10b981' : '#6b7280'} />
                                        <span>Activo</span>
                                      </div>
                                      <div className={gfStyles.rolePermissionItem}>
                                        <input
                                          type="checkbox"
                                          checked={!!role.puedeEditar}
                                          onChange={(e) => updateQuickRoleField(role.id, 'puedeEditar', e.target.checked)}
                                          style={{ width: 12, height: 12 }}
                                          disabled={isReadOnly}
                                        />
                                        <Edit size={12} color={role.puedeEditar ? '#3b82f6' : '#6b7280'} />
                                        <span>Editar</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className={gfStyles.rolesFooter}>
                          <Button
                            variant="action"
                            size="s"
                            onClick={handleSaveAllQuickRoles}
                            iconName="Save"
                            loading={savingIds.size > 0}
                            disabled={loadingQuick || savingIds.size > 0}
                          >
                            Guardar
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Sección de Usuarios Involucrados (visual) */}
                {usuariosInvolucrados.length > 0 && (
                  <div className={styles.rolesSection}>
                    <h6 className={styles.rolesTitle}>
                      <Users className={styles.rolesIcon} />
                      Usuarios involucrados ({usuariosInvolucrados.length})
                    </h6>
                    <div className={styles.rolesList}>
                      {usuariosInvolucrados.map((u, idx) => (
                        <div key={idx} className={styles.roleItem}>
                          <span className={styles.userName}>{u}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceStepBase;