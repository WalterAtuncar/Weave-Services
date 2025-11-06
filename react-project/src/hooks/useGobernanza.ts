import { useState, useEffect, useCallback } from 'react';
import { 
  GobernanzaDto, 
  EstadoGobernanza,
  GetGobernanzaPaginatedRequest,
  AsignarGobernanzaCommand,
  TransferirGobernanzaCommand,
  RevocarGobernanzaCommand
} from '../services/types/gobernanza.types';
import { 
  RolGobernanza 
} from '../services/types/rol-gobernanza.types';
import { 
  TipoEntidad 
} from '../services/types/tipo-entidad.types';
import { 
  TipoGobierno 
} from '../services/types/tipo-gobierno.types';
import { 
  ReglaGobernanza 
} from '../services/types/regla-gobernanza.types';
import { 
  NotificacionGobernanza 
} from '../services/types/notificacion-gobernanza.types';
import { 
  gobernanzaService,
  rolGobernanzaService,
  tipoEntidadService,
  tipoGobiernoService,
  reglaGobernanzaService} from '../services';
import { AlertService } from '../components/ui/alerts';
import { useAuth } from './useAuth';

// =============================================
// INTERFACES Y TIPOS
// =============================================

export interface GobernanzaFilters {
  search: string;
  tipoEntidad?: number;
  tipoGobierno?: number;
  estado?: EstadoGobernanza;
  conAlertas?: boolean;
  sinPropietario?: boolean;
  usuarioId?: number;
}

export interface GobernanzaPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GobernanzaStats {
  totalEntidades: number;
  entidadesConGobernanza: number;
  entidadesSinGobernanza: number;
  alertasPendientes: number;
  vencimientosProximos: number;
  usuariosActivos: number;
  rolesAsignados: number;
  notificacionesPendientes: number;
}

export interface EntidadGobernanza {
  entidadId: number;
  entidadTipo: string;
  entidadNombre: string;
  entidadCodigo?: string;
  tipoEntidadId: number;
  tipoEntidadNombre: string;
  tieneGobernanza: boolean;
  gobernanzaId?: number;
  propietario?: {
    usuarioId: number;
    nombreCompleto: string;
    email: string;
  };
   alertas: number;
   fechaCreacion: string;
  activo: boolean;
}

export interface GobernanzaState {
  // Datos principales
  gobernanzas: GobernanzaDto[];
  entidades: EntidadGobernanza[];
  filteredGobernanzas: GobernanzaDto[];
  filteredEntidades: EntidadGobernanza[];
  
  // Catálogos de apoyo
  rolesGobernanza: RolGobernanza[];
  tiposEntidad: TipoEntidad[];
  reglasGobernanza: ReglaGobernanza[];
  tiposGobierno: TipoGobierno[];
  notificaciones: NotificacionGobernanza[];
  
  // Estados de control
  loading: boolean;
  error: string | null;
  filters: GobernanzaFilters;
  pagination: GobernanzaPagination;
  stats: GobernanzaStats;
  
  // Estados de configuración
  isFirstTimeSetup: boolean;
  configurationComplete: boolean;
}

// =============================================
// VALORES POR DEFECTO
// =============================================

const DEFAULT_FILTERS: GobernanzaFilters = {
  search: '',
  tipoEntidad: undefined,
  tipoGobierno: undefined,
  estado: undefined,
  conAlertas: undefined,
  sinPropietario: undefined,
  usuarioId: undefined
};

const DEFAULT_PAGINATION: GobernanzaPagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
};

const DEFAULT_STATS: GobernanzaStats = {
  totalEntidades: 0,
  entidadesConGobernanza: 0,
  entidadesSinGobernanza: 0,
  alertasPendientes: 0,
  vencimientosProximos: 0,
  usuariosActivos: 0,
  rolesAsignados: 0,
  notificacionesPendientes: 0
};

// =============================================
// FUNCIONES DE MAPEO OPTIMIZADAS
// =============================================

// Cache para evitar recálculos innecesarios con gestión de memoria
const mapCache = new Map<string, any>();
const CACHE_MAX_SIZE = 100;
const CACHE_CLEANUP_THRESHOLD = 150;

// Función para limpiar cache cuando crece demasiado
const cleanupCache = () => {
  if (mapCache.size > CACHE_CLEANUP_THRESHOLD) {
    const keysToDelete = Array.from(mapCache.keys()).slice(0, mapCache.size - CACHE_MAX_SIZE);
    keysToDelete.forEach(key => mapCache.delete(key));
    console.debug(`Cache limpiado: eliminadas ${keysToDelete.length} entradas`);
  }
};

// Función optimizada de mapeo con memoización
const mapGobernanzaFromAPI = (gobernanzaAPI: any): GobernanzaDto => {
  if (!gobernanzaAPI) return null;
  
  // Crear clave única para cache
  const cacheKey = `${gobernanzaAPI.gobernanzaId || gobernanzaAPI.id}_${gobernanzaAPI.fechaActualizacion || gobernanzaAPI.version || 1}`;
  
  // Verificar cache
  if (mapCache.has(cacheKey)) {
    return mapCache.get(cacheKey);
  }
  
  // Calcular días para vencimiento una sola vez
  const diasParaVencimiento = gobernanzaAPI.fechaVencimiento 
    ? Math.ceil((new Date(gobernanzaAPI.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const mapped: GobernanzaDto = {
    gobernanzaId: gobernanzaAPI.gobernanzaId || gobernanzaAPI.id,
    tipoGobiernoId: gobernanzaAPI.tipoGobiernoId,
    tipoEntidadId: gobernanzaAPI.tipoEntidadId,
    entidadId: gobernanzaAPI.entidadId,
    organizacionId: gobernanzaAPI.organizacionId,
    nombre: gobernanzaAPI.nombre,
    fechaAsignacion: gobernanzaAPI.fechaAsignacion,
    fechaVencimiento: gobernanzaAPI.fechaVencimiento,
    observaciones: gobernanzaAPI.observaciones,
    // Campos base de entidad
    version: gobernanzaAPI.version || 1,
    estado: gobernanzaAPI.estado || EstadoGobernanza.ACTIVO,
    creadoPor: gobernanzaAPI.creadoPor,
    fechaCreacion: gobernanzaAPI.fechaCreacion,
    actualizadoPor: gobernanzaAPI.actualizadoPor,
    fechaActualizacion: gobernanzaAPI.fechaActualizacion,
    registroEliminado: gobernanzaAPI.registroEliminado || false,
    // Propiedades calculadas optimizadas
    diasParaVencimiento,
    usuarioId: gobernanzaAPI.usuarioId,
    usuarioNombre: gobernanzaAPI.usuarioNombre
  };
  
  // Guardar en cache
  mapCache.set(cacheKey, mapped);
  
  // Limpiar cache si es necesario
  cleanupCache();
  
  return mapped;
};

// Función auxiliar optimizada para construir EntidadGobernanza desde datos de API
const buildEntidadGobernanza = (gobernanzaData: GobernanzaDto): EntidadGobernanza => {
  if (!gobernanzaData) return null;
  
  // Usar datos ya mapeados de gobernanza para evitar duplicación
  const alertasCount = gobernanzaData.diasParaVencimiento !== null && gobernanzaData.diasParaVencimiento <= 7 ? 1 : 0;
  
  return {
    entidadId: gobernanzaData.entidadId,
    entidadTipo: 'Entidad', // Valor por defecto optimizado
    entidadNombre: gobernanzaData.nombre || 'Sin nombre',
    entidadCodigo: `ENT-${gobernanzaData.entidadId}`, // Generar código consistente
    tipoEntidadId: gobernanzaData.tipoEntidadId,
    tipoEntidadNombre: 'Sin tipo', // Se puede enriquecer con datos de catálogo
    tieneGobernanza: true, // Siempre true si viene de gobernanza
    gobernanzaId: gobernanzaData.gobernanzaId,
    propietario: gobernanzaData.usuarioId ? {
      usuarioId: gobernanzaData.usuarioId,
      nombreCompleto: gobernanzaData.usuarioNombre || 'Usuario sin nombre',
      email: '' // Se puede enriquecer posteriormente
    } : undefined,
    alertas: alertasCount,
    fechaCreacion: gobernanzaData.fechaCreacion,
    activo: gobernanzaData.estado === EstadoGobernanza.ACTIVO
  };
};

// Función para enriquecer entidades con datos de catálogos
const enrichEntidadWithCatalogData = (
  entidad: EntidadGobernanza, 
  tiposEntidad: any[]
): EntidadGobernanza => {
  const tipoEntidad = tiposEntidad.find(t => t.tipoEntidadId === entidad.tipoEntidadId);
  
  return {
    ...entidad,
    tipoEntidadNombre: tipoEntidad?.nombre || entidad.tipoEntidadNombre || 'Sin tipo'
  };
};

// =============================================
// HOOK PRINCIPAL
// =============================================

export const useGobernanza = () => {
  const { organizationInfo } = useAuth();
  const organizacionId = organizationInfo?.id;
  const hasValidOrganization = Boolean(organizacionId && organizacionId > 0);

  // Estado principal
  const [state, setState] = useState<GobernanzaState>({
    gobernanzas: [],
    entidades: [],
    filteredGobernanzas: [],
    filteredEntidades: [],
    rolesGobernanza: [],
    tiposEntidad: [],
    reglasGobernanza: [],
    tiposGobierno: [],
    notificaciones: [],
    loading: false,
    error: null,
    filters: DEFAULT_FILTERS,
    pagination: DEFAULT_PAGINATION,
    stats: DEFAULT_STATS,
    isFirstTimeSetup: false,
    configurationComplete: false
  });

  // =============================================
  // FUNCIONES DE CARGA DE DATOS
  // =============================================

  const loadCatalogData = useCallback(async () => {
    if (!hasValidOrganization) return;

    console.log('🔄 useGobernanza: Iniciando carga de catálogo...');

    try {
      setState(prev => ({ ...prev, loading: true }));

      // ✅ Cargar catálogos en paralelo con organizacionId - OBLIGATORIO
      const catalogPromises = await Promise.allSettled([
        rolGobernanzaService.getAllRolesGobernanza({ 
          includeDeleted: false,
          organizationId: organizacionId
        }),
        tipoEntidadService.getAllTiposEntidad({ 
          includeDeleted: false,
          organizationId: organizacionId
        }),
        reglaGobernanzaService.getReglasGobernanzaPaginated({
          page: 1,
          pageSize: 100,
          includeDeleted: false,
          organizationId: organizacionId
        }),
        tipoGobiernoService.getAllTiposGobierno({ 
          includeDeleted: false,
          organizationId: organizacionId
        })
      ]);

      // Extraer datos de forma segura
      const rolesGobernanza = catalogPromises[0].status === 'fulfilled' && catalogPromises[0].value.success 
        ? catalogPromises[0].value.data || [] : [];
      
      const tiposEntidad = catalogPromises[1].status === 'fulfilled' && catalogPromises[1].value.success 
        ? catalogPromises[1].value.data || [] : [];
      
      const reglasGobernanza = catalogPromises[2].status === 'fulfilled' && catalogPromises[2].value.success && catalogPromises[2].value.data?.data 
        ? catalogPromises[2].value.data.data : [];
      
      const tiposGobierno = catalogPromises[3].status === 'fulfilled' && catalogPromises[3].value.success 
        ? catalogPromises[3].value.data || [] : [];

      console.log('📊 useGobernanza: Datos cargados:', {
        rolesGobernanza: rolesGobernanza.length,
        tiposEntidad: tiposEntidad.length,
        reglasGobernanza: reglasGobernanza.length,
        tiposGobierno: tiposGobierno.length
      });

      // Verificar errores en las cargas
      const failedLoads = catalogPromises.filter(p => p.status === 'rejected').length;
      if (failedLoads > 0) {
        console.warn(`${failedLoads} catálogos fallaron al cargar, continuando con datos parciales`);
      }

      // Verificar si es primera configuración
      const isFirstTimeSetup = rolesGobernanza.length === 0 || tiposEntidad.length === 0 || tiposGobierno.length === 0;
      const configurationComplete = !isFirstTimeSetup;

      console.log('🔧 useGobernanza: Estado de configuración:', {
        isFirstTimeSetup,
        configurationComplete
      });

      setState(prev => ({
        ...prev,
        rolesGobernanza,
        tiposEntidad,
        reglasGobernanza,
        tiposGobierno,
        isFirstTimeSetup,
        configurationComplete,
        loading: false,
        error: failedLoads === catalogPromises.length ? 'Error al cargar todos los catálogos' : null
      }));

    } catch (error: any) {
      console.error('❌ useGobernanza: Error loading catalog data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar datos de catálogo'
      }));
      AlertService.error('Error al cargar configuración: ' + (error.message || 'Error desconocido'));
    }
  }, [hasValidOrganization, organizacionId]);

  const loadGobernanzaData = useCallback(async (
    currentFilters: Partial<GobernanzaFilters> = {},
    currentPagination: Partial<GobernanzaPagination> = {}
  ) => {
    if (!hasValidOrganization) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Preparar parámetros de consulta
      const finalFilters = { ...state.filters, ...currentFilters };
      const finalPagination = { ...state.pagination, ...currentPagination };

      const request: GetGobernanzaPaginatedRequest = {
        page: finalPagination.page || 1,
        pageSize: finalPagination.pageSize || 10,
        orderBy: 'fechaAsignacion',
        ascending: false,
        filters: {
          organizacionId,
          ...(finalFilters.tipoEntidad && { tipoEntidadId: finalFilters.tipoEntidad }),
          ...(finalFilters.tipoGobierno && { tipoGobiernoId: finalFilters.tipoGobierno }),
          ...(finalFilters.estado && { estado: finalFilters.estado }),
          ...(finalFilters.usuarioId && { usuarioId: finalFilters.usuarioId })
        },
        ...(finalFilters.search && { searchTerm: finalFilters.search })
      }

      const response = await gobernanzaService.getGobernanzasPaginated(request);

      // Verificar si hay una respuesta válida (HTTP 200) aunque success sea false
      if (response.success || (response.statusCode === 200 && response.data)) {
        const responseData: any = response.data || {};
        
        // Extraer gobernanzas del array principal con validación optimizada
        const gobernanzasArray = responseData.items || responseData.data || responseData || [];
        
        if (!Array.isArray(gobernanzasArray)) {
          console.warn('Datos de gobernanza no están en formato de array:', responseData);
          throw new Error('Formato de datos inválido');
        }
        
        // Mapear gobernanzas con filtrado de nulos optimizado
        const gobernanzasLocal = gobernanzasArray
          .map(mapGobernanzaFromAPI)
          .filter((g): g is GobernanzaDto => g !== null && g !== undefined);

        // Construir entidades a partir de gobernanzas con filtrado optimizado
        const entidadesLocal = gobernanzasLocal
          .map(buildEntidadGobernanza)
          .filter((e): e is EntidadGobernanza => e !== null && e !== undefined)
          .map(entidad => enrichEntidadWithCatalogData(entidad, state.tiposEntidad));

        // Información de paginación optimizada
        const paginationInfo = responseData.pagination || {};
        const total = paginationInfo.totalRecords || responseData.totalCount || responseData.total || gobernanzasArray.length;
        const backendTotalPages = paginationInfo.totalPages || responseData.totalPages;

        // Calcular estadísticas de forma optimizada en una sola pasada
        let alertasPendientes = 0;
        let vencimientosProximos = 0;
        const usuariosUnicos = new Set<number>();
        
        gobernanzasLocal.forEach((g: GobernanzaDto) => {
          // Contar vencimientos próximos
          if (g.diasParaVencimiento !== null && g.diasParaVencimiento !== undefined && g.diasParaVencimiento <= 30) {
            vencimientosProximos++;
          }
          
          // Contar alertas (vencimientos en 7 días o menos)
          if (g.diasParaVencimiento !== null && g.diasParaVencimiento !== undefined && g.diasParaVencimiento <= 7) {
            alertasPendientes++;
          }
          
          // Recopilar usuarios únicos
          if (g.usuarioId) {
            usuariosUnicos.add(g.usuarioId);
          }
        });
        
        const stats: GobernanzaStats = {
          totalEntidades: entidadesLocal.length,
          entidadesConGobernanza: entidadesLocal.length, // Todas tienen gobernanza por definición
          entidadesSinGobernanza: 0, // No aplicable en este contexto
          alertasPendientes,
          vencimientosProximos,
          usuariosActivos: usuariosUnicos.size,
          rolesAsignados: gobernanzasLocal.length,
          notificacionesPendientes: 0 // Se cargará separadamente
        };

        const finalTotalPages = backendTotalPages || (total > 0 ? Math.ceil(total / finalPagination.pageSize) : 1);

        setState(prev => ({
          ...prev,
          gobernanzas: gobernanzasLocal,
          entidades: entidadesLocal,
          filteredGobernanzas: gobernanzasLocal,
          filteredEntidades: entidadesLocal,
          loading: false,
          error: null, // Limpiar cualquier error previo
          stats,
          pagination: {
            ...prev.pagination,
            total,
            totalPages: finalTotalPages,
            page: finalPagination.page || prev.pagination.page,
            pageSize: finalPagination.pageSize || prev.pagination.pageSize
          }
        }));

      } else {
        // Solo mostrar error si realmente hay un error del servidor (no 200)
        const errorMessage = response.statusCode === 200 
          ? 'No se encontraron datos' 
          : (response.message || 'Error al cargar datos de gobernanza');
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error loading gobernanza data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar datos de gobernanza'
      }));
      AlertService.error('Error al cargar gobernanza: ' + (error.message || 'Error desconocido'));
    }
  }, [hasValidOrganization, organizacionId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (hasValidOrganization) {
      loadCatalogData();
    }
  }, [hasValidOrganization, loadCatalogData]);

  useEffect(() => {
    if (hasValidOrganization && state.configurationComplete) {
      loadGobernanzaData();
    }
  }, [hasValidOrganization, state.configurationComplete, loadGobernanzaData]);

  // =============================================
  // FUNCIONES DE CONTROL
  // =============================================

  const setFilters = (newFilters: Partial<GobernanzaFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    const resetPagination = { page: 1 };
    
    setState(prev => ({
      ...prev,
      filters: updatedFilters,
      pagination: { ...prev.pagination, ...resetPagination }
    }));
    
    loadGobernanzaData(updatedFilters, resetPagination);
  };

  const setSearch = (search: string) => {
    setFilters({ search });
  };

  const setTipoEntidadFilter = (tipoEntidadId: number | null) => {
    setFilters({ tipoEntidad: tipoEntidadId || undefined });
  };

  const clearFilters = () => {
    const resetPagination = { page: 1 };
    
    setState(prev => ({
      ...prev,
      filters: DEFAULT_FILTERS,
      pagination: { ...prev.pagination, ...resetPagination }
    }));
    
    loadGobernanzaData(DEFAULT_FILTERS, resetPagination);
  };

  const setPage = (page: number) => {
    const newPagination = { page };
    
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...newPagination }
    }));
    
    loadGobernanzaData(undefined, newPagination);
  };

  const setPageSize = (pageSize: number) => {
    const newPagination = { pageSize, page: 1 };
    
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...newPagination }
    }));
    
    loadGobernanzaData(undefined, newPagination);
  };

  const refreshData = useCallback(() => {
    if (state.configurationComplete) {
      loadGobernanzaData();
    } else {
      loadCatalogData();
    }
  }, [loadGobernanzaData, loadCatalogData, state.configurationComplete]);

  // =============================================
  // FUNCIONES CRUD
  // =============================================

  const asignarGobernanza = useCallback(async (command: AsignarGobernanzaCommand): Promise<GobernanzaDto | null> => {
    if (!hasValidOrganization) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await gobernanzaService.asignarGobernanza(command);
      
      if (response.success && response.data) {
        AlertService.success('Gobernanza asignada exitosamente');
        await loadGobernanzaData(); // Recargar datos
        return mapGobernanzaFromAPI(response.data);
      } else {
        throw new Error(response.message || 'Error al asignar gobernanza');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al asignar gobernanza';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization, loadGobernanzaData]);

  const transferirGobernanza = useCallback(async (command: TransferirGobernanzaCommand): Promise<void> => {
    if (!hasValidOrganization) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await gobernanzaService.transferirGobernanza(command);
      
      if (response.success) {
        AlertService.success('Gobernanza transferida exitosamente');
        await loadGobernanzaData(); // Recargar datos
      } else {
        throw new Error(response.message || 'Error al transferir gobernanza');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al transferir gobernanza';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization, loadGobernanzaData]);

  const revocarGobernanza = useCallback(async (command: RevocarGobernanzaCommand): Promise<void> => {
    if (!hasValidOrganization) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await gobernanzaService.revocarGobernanza(command);
      
      if (response.success) {
        AlertService.success('Gobernanza revocada exitosamente');
        await loadGobernanzaData(); // Recargar datos
      } else {
        throw new Error(response.message || 'Error al revocar gobernanza');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al revocar gobernanza';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization, loadGobernanzaData]);

  // =============================================
  // FUNCIONES DE CONFIGURACIÓN
  // =============================================

  const completeConfiguration = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFirstTimeSetup: false,
      configurationComplete: true
    }));
    
    // Cargar datos de gobernanza después de completar configuración
    loadGobernanzaData();
  }, [loadGobernanzaData]);

  // =============================================
  // ESTADO FINAL PROTEGIDO
  // =============================================

  const finalState = {
    gobernanzas: Array.isArray(state.filteredGobernanzas) ? state.filteredGobernanzas : [],
    entidades: Array.isArray(state.filteredEntidades) ? state.filteredEntidades : [],
    rolesGobernanza: Array.isArray(state.rolesGobernanza) ? state.rolesGobernanza : [],
    tiposEntidad: Array.isArray(state.tiposEntidad) ? state.tiposEntidad : [],
    reglasGobernanza: Array.isArray(state.reglasGobernanza) ? state.reglasGobernanza : [],
    tiposGobierno: Array.isArray(state.tiposGobierno) ? state.tiposGobierno : [],
    notificaciones: Array.isArray(state.notificaciones) ? state.notificaciones : [],
    loading: Boolean(state.loading),
    error: hasValidOrganization ? state.error : 'No hay organización configurada',
    filters: state.filters || DEFAULT_FILTERS,
    pagination: state.pagination || DEFAULT_PAGINATION,
    stats: state.stats || DEFAULT_STATS,
    isFirstTimeSetup: Boolean(state.isFirstTimeSetup),
    configurationComplete: Boolean(state.configurationComplete)
  };

  return {
    // Estado
    gobernanzas: finalState.gobernanzas,
    entidades: finalState.entidades,
    rolesGobernanza: finalState.rolesGobernanza,
    tiposEntidad: finalState.tiposEntidad,
    reglasGobernanza: finalState.reglasGobernanza,
    tiposGobierno: finalState.tiposGobierno,
    notificaciones: finalState.notificaciones,
    loading: finalState.loading,
    error: finalState.error,
    filters: finalState.filters,
    pagination: finalState.pagination,
    stats: finalState.stats,
    isFirstTimeSetup: finalState.isFirstTimeSetup,
    configurationComplete: finalState.configurationComplete,

    // Acciones de filtrado
    setFilters: hasValidOrganization ? setFilters : () => {},
    setSearch: hasValidOrganization ? setSearch : () => {},
    setTipoEntidadFilter: hasValidOrganization ? setTipoEntidadFilter : () => {},
    clearFilters: hasValidOrganization ? clearFilters : () => {},

    // Acciones de paginación
    setPage: hasValidOrganization ? setPage : () => {},
    setPageSize: hasValidOrganization ? setPageSize : () => {},

    // Acciones de datos
    refreshData: hasValidOrganization ? refreshData : () => Promise.resolve(),
    loadCatalogData: hasValidOrganization ? loadCatalogData : () => Promise.resolve(),
    
    // Acciones CRUD
    asignarGobernanza: hasValidOrganization ? asignarGobernanza : () => Promise.resolve(null),
    transferirGobernanza: hasValidOrganization ? transferirGobernanza : () => Promise.resolve(),
    revocarGobernanza: hasValidOrganization ? revocarGobernanza : () => Promise.resolve(),
    
    // Acciones de configuración
    completeConfiguration: hasValidOrganization ? completeConfiguration : () => {}
  };
};