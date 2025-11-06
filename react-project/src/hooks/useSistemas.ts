import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sistema, 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema 
} from '../models/Sistemas';
import { 
  sistemasService,
  CreateSistemaRequest,
  UpdateSistemaRequest,
  DeleteSistemaRequest
} from '../services';
import { AlertService } from '../components/ui/alerts';
import { useAuth } from './useAuth';

export interface SistemasFilters {
  search: string;
  tipo?: TipoSistema;
  familia?: FamiliaSistema;
  estado?: EstadoSistema;
  conDependencias?: boolean;
  tieneGobernanzaPropia?: boolean;
}

export interface SistemasPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SistemasState {
  sistemas: Sistema[];
  filteredSistemas: Sistema[];
  loading: boolean;
  error: string | null;
  filters: SistemasFilters;
  pagination: SistemasPagination;
  stats: {
    total: number;
    activos: number;
    inactivos: number;
    internos: number;
    externos: number;
    conDependencias: number;
  };
}

const DEFAULT_FILTERS: SistemasFilters = {
  search: '',
  tipo: undefined,
  familia: undefined,
  estado: undefined,
  conDependencias: undefined,
  tieneGobernanzaPropia: undefined
};

const DEFAULT_PAGINATION: SistemasPagination = {
  page: 1,
  pageSize: 5,
  total: 0,
  totalPages: 0
};

// Función para mapear desde API real a modelo local
const mapSistemaFromAPI = (sistemaAPI: any): Sistema => {
  return {
    sistemaId: sistemaAPI.sistemaId || sistemaAPI.id,
    organizacionId: sistemaAPI.organizacionId || 1,
    codigoSistema: sistemaAPI.codigoSistema || sistemaAPI.codigo || null,
    nombreSistema: sistemaAPI.nombreSistema || sistemaAPI.nombre,
    funcionPrincipal: sistemaAPI.funcionPrincipal || sistemaAPI.descripcion || null,
    sistemaDepende: sistemaAPI.sistemaDepende || sistemaAPI.sistemaParentId || null,
    tipoSistema: sistemaAPI.tipoSistemaId || sistemaAPI.tipoSistema || TipoSistema.INTERNO,
    familiaSistema: sistemaAPI.familiaSistemaId || sistemaAPI.familiaSistema || FamiliaSistema.ERP,
    tieneGobernanzaPropia: Boolean(sistemaAPI.tieneGobernanzaPropia), // ✅ AGREGADO: Mapear tieneGobernanzaPropia
    gobernanzaId: sistemaAPI.gobernanzaId || null, // ✅ AGREGADO: Mapear gobernanzaId desde la tabla intermedia
    version: sistemaAPI.version || 1,
    estado: sistemaAPI.estado !== undefined ? sistemaAPI.estado : EstadoSistema.Activo,
    creadoPor: sistemaAPI.creadoPor || null,
    fechaCreacion: sistemaAPI.fechaCreacion || new Date().toISOString(),
    actualizadoPor: sistemaAPI.actualizadoPor || null,
    fechaActualizacion: sistemaAPI.fechaActualizacion || null,
    // Mapear nombres de usuario desde el backend
    nombreUsuarioCreador: sistemaAPI.nombreUsuarioCreador || null,
    nombreUsuarioActualizador: sistemaAPI.nombreUsuarioActualizador || null,
    registroEliminado: sistemaAPI.registroEliminado || sistemaAPI.estado_registro === 0 || false,
    // Mapear modulosActivos del backend a un array mock para compatibilidad con la UI
    modulos: sistemaAPI.modulos || (sistemaAPI.modulosActivos ? Array(sistemaAPI.modulosActivos).fill({}) : []),
    // Campos adicionales para el modal
    url: sistemaAPI.url || null,
    servidorIds: sistemaAPI.servidorIds || (sistemaAPI.idServidor ? [sistemaAPI.idServidor] : [])
  };
};

// Función para mapear desde modelo local a API
const mapSistemaToAPI = (sistema: Partial<Sistema>): any => {
  const apiData: any = {};
  
  // Solo incluir campos que no sean undefined/null
  if (sistema.codigoSistema !== undefined) apiData.codigoSistema = sistema.codigoSistema;
  if (sistema.nombreSistema !== undefined) apiData.nombreSistema = sistema.nombreSistema;
  if (sistema.funcionPrincipal !== undefined) apiData.funcionPrincipal = sistema.funcionPrincipal;
  if (sistema.familiaSistema !== undefined) apiData.familiaSistemaId = sistema.familiaSistema;
  if (sistema.sistemaDepende !== undefined) apiData.sistemaDepende = sistema.sistemaDepende;
  if (sistema.tipoSistema !== undefined) apiData.tipoSistemaId = sistema.tipoSistema;
  
  // Respetar valor del formulario (no forzar true)
  if (sistema.tieneGobernanzaPropia !== undefined) {
    apiData.tieneGobernanzaPropia = sistema.tieneGobernanzaPropia;
  }
  
  // Mapear gobernanzaId SIEMPRE desde el formData, sin condicionar por tieneGobernanzaPropia
  apiData.gobernanzaId = (sistema as any).gobernanzaId ?? null;

  if (sistema.estado !== undefined) apiData.estado = sistema.estado;
  if (sistema.organizacionId !== undefined) apiData.organizacionId = sistema.organizacionId;
  if (sistema.version !== undefined) apiData.version = sistema.version;
  if (sistema.url !== undefined) apiData.url = sistema.url;
  if (sistema.servidorIds !== undefined) apiData.servidorIds = sistema.servidorIds; // ✅ ACTUALIZADO: Usar servidorIds

  // ✅ NUEVO: Soporte para actualización incremental de servidores
  const anySistema = sistema as any;
  if (anySistema.servidoresToInsert !== undefined) apiData.servidoresToInsert = anySistema.servidoresToInsert;
  if (anySistema.servidoresToDelete !== undefined) apiData.servidoresToDelete = anySistema.servidoresToDelete;

  // ✅ NUEVO: Flags para workflow de eliminación (solo informativos, no aplican eliminación)
  if (anySistema.esEliminacion !== undefined) apiData.esEliminacion = anySistema.esEliminacion;
  if (anySistema.registroEliminadoSolicitado !== undefined) apiData.registroEliminadoSolicitado = anySistema.registroEliminadoSolicitado;

  // ✅ NUEVO: Soporte opcional para creación con módulos (el backend los permite en CREATE)
  if (Array.isArray(anySistema.modulos)) {
    apiData.modulos = anySistema.modulos;
  }
  
  return apiData;
};

export const useSistemas = () => {
  // 🔧 REPLICANDO LÓGICA EXITOSA DE USUARIOS: Obtener organizationInfo completo
  const { user, organization, organizationInfo } = useAuth();
  
  // 🔒 MEMOIZAR para evitar loops infinitos
  const organizacionId = useMemo(() => organizationInfo?.id, [organizationInfo?.id]);
  const hasValidOrganization = useMemo(() => 
    Boolean(organizationInfo?.hasOrganization && organizacionId), 
    [organizationInfo?.hasOrganization, organizacionId]
  );
  
  // Estado inicial - siguiendo patrón de Usuarios
  const [state, setState] = useState<SistemasState>({
    sistemas: [],
    filteredSistemas: [],
    loading: false,
    error: null,
    filters: DEFAULT_FILTERS,
    pagination: DEFAULT_PAGINATION,
    stats: {
      total: 0,
      activos: 0,
      inactivos: 0,
      internos: 0,
      externos: 0,
      conDependencias: 0
    }
  });
  
  // Cargar datos desde la API real - MEMOIZADO para evitar loops
  const loadSistemas = useCallback(async (customFilters?: SistemasFilters, customPagination?: Partial<SistemasPagination>) => {
    // Verificar que haya organizacionId válido antes de hacer la llamada
    if (!hasValidOrganization) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "No se encontró información de organización. Por favor, inicia sesión nuevamente." 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const currentFilters = customFilters || state.filters;
      const currentPagination = customPagination ? { ...state.pagination, ...customPagination } : state.pagination;
      

      
      // Preparar parámetros para el endpoint real /api/Sistemas/paginated
      const params = new URLSearchParams();
      
      // Parámetros de paginación (nombres según el swagger)
      params.append('Page', currentPagination.page.toString());
      params.append('PageSize', currentPagination.pageSize.toString());
      params.append('OrderBy', 'FechaCreacion');
      params.append('OrderDescending', 'true');
      params.append('IncludeDeleted', 'false');
      params.append('OrganizacionId', organizacionId!.toString()); // Safe: validated by hasValidOrganization

      // Agregar filtros de búsqueda si existen
      if (currentFilters.search) {
        params.append('SearchTerm', currentFilters.search);
      }

      if (currentFilters.familia !== undefined) {
        params.append('FamiliaSistemaId', currentFilters.familia.toString());
      }

      if (currentFilters.estado !== undefined) {
        params.append('Estado', currentFilters.estado.toString());
      }

      if (currentFilters.conDependencias !== undefined) {
        if (currentFilters.conDependencias === false) {
          params.append('SoloSistemasRaiz', 'true');
        }
      }

      // Usar el método del servicio corregido
      const request: any = {
        page: currentPagination.page,
        pageSize: currentPagination.pageSize,
        orderBy: 'FechaCreacion',
        ascending: false,
        includeDeleted: false,
        organizacionId: organizacionId // Ya sabemos que existe por la verificación anterior
      };

      // Agregar filtros
      if (currentFilters.search) {
        request.searchTerm = currentFilters.search;
      }
      if (currentFilters.familia !== undefined) {
        request.familiaSistemaId = currentFilters.familia;
      }
      if (currentFilters.estado !== undefined) {
        request.estado = currentFilters.estado;
      }
      if (currentFilters.conDependencias === false) {
        request.soloSistemasRaiz = true;
      }
      if (currentFilters.tieneGobernanzaPropia !== undefined) {
        request.tieneGobernanzaPropia = currentFilters.tieneGobernanzaPropia;
      }

      const response = await sistemasService.getSistemasPaginated(request);
      
      if (response.success && response.data) {
        // 🔧 FIX: Leer estructura correcta del backend
        const responseData: any = response.data || {};
        
        // Extraer sistemas del array principal
        const sistemasArray = Array.isArray(responseData.items) ? responseData.items : 
                             Array.isArray(responseData.data) ? responseData.data : 
                             Array.isArray(responseData) ? responseData : [];
        const sistemasLocal = sistemasArray.map(mapSistemaFromAPI).filter(Boolean);
        
        // 🎯 FIX: Leer información de paginación del objeto pagination
        const paginationInfo = responseData.pagination || {};
        const total = paginationInfo.totalRecords || responseData.totalCount || responseData.total || sistemasArray.length;
        const backendTotalPages = paginationInfo.totalPages || responseData.totalPages;
        
        // Calcular estadísticas de forma segura
        const activosList = sistemasLocal.filter((s: Sistema) => s && s.estado === EstadoSistema.Activo);
        const inactivosList = sistemasLocal.filter((s: Sistema) => s && s.estado === EstadoSistema.Inactivo);
        const internosList = sistemasLocal.filter((s: Sistema) => s && s.tipoSistema === TipoSistema.INTERNO);
        const externosList = sistemasLocal.filter((s: Sistema) => s && s.tipoSistema !== TipoSistema.INTERNO);
        const conDependenciasList = sistemasLocal.filter((s: Sistema) => s && s.sistemaDepende !== null);
        
        const stats = {
          total,
          activos: activosList.length,
          inactivos: inactivosList.length,
          internos: internosList.length,
          externos: externosList.length,
          conDependencias: conDependenciasList.length
        };

        // 🔧 FIX: Usar totalPages del backend si está disponible, sino calcular
        const finalTotalPages = backendTotalPages || (total > 0 ? Math.ceil(total / currentPagination.pageSize) : 1);

        setState(prev => ({
          ...prev,
          sistemas: sistemasLocal,
          filteredSistemas: sistemasLocal,
          loading: false,
          stats,
          pagination: {
            ...prev.pagination,
            total,
            totalPages: finalTotalPages, // 🎯 USAR el valor correcto del backend
            page: currentPagination.page,
            pageSize: currentPagination.pageSize
          }
        }));
      } else {
        throw new Error(response.message || 'Error al cargar sistemas');
      }
    } catch (error: any) {
      console.error('Error loading sistemas:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar sistemas'
      }));
      AlertService.error('Error al cargar sistemas: ' + (error.message || 'Error desconocido'));
    }
  }, [hasValidOrganization, organizacionId]); // Dependencias memoizadas

  // Cargar datos inicial solo si hay organizacionId válido
  useEffect(() => {
    if (hasValidOrganization) {
      loadSistemas();
    }
  }, [hasValidOrganization]); // REMOVIDO loadSistemas para evitar loop

  // Funciones de control
  const setFilters = (newFilters: Partial<SistemasFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    const resetPagination = { page: 1 }; // Reset a página 1 al filtrar
    
    setState(prev => ({
      ...prev,
      filters: updatedFilters,
      pagination: { ...prev.pagination, ...resetPagination }
    }));
    
    // Cargar datos con los nuevos filtros
    loadSistemas(updatedFilters, resetPagination);
  };

  const setSearch = (search: string) => {
    setFilters({ search });
  };

  const clearFilters = () => {
    const resetPagination = { page: 1 };
    
    setState(prev => ({
      ...prev,
      filters: DEFAULT_FILTERS,
      pagination: { ...prev.pagination, ...resetPagination }
    }));
    
    // Cargar datos sin filtros
    loadSistemas(DEFAULT_FILTERS, resetPagination);
  };

  const setPage = (page: number) => {
    const newPagination = { page };
    
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...newPagination }
    }));
    
    // Cargar datos de la nueva página
    loadSistemas(undefined, newPagination);
  };

  const setPageSize = (pageSize: number) => {
    const newPagination = { pageSize, page: 1 };
    
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, ...newPagination }
    }));
    
    // Cargar datos con el nuevo tamaño de página
    loadSistemas(undefined, newPagination);
  };

  const refreshSistemas = useCallback(() => {
    loadSistemas();
  }, [loadSistemas]);

  // Función para obtener un sistema por ID (memoizada para evitar loops)
  const getSistemaById = useCallback(async (sistemaId: number): Promise<Sistema> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const request = { sistemaId };
      const response = await sistemasService.getSistemaById(request);
      
      if (response.success && response.data) {
        return mapSistemaFromAPI(response.data);
      } else {
        throw new Error(response.message || 'Error al obtener sistema');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al obtener sistema';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []); // Sin dependencias porque sistemasService es estable

  // Funciones CRUD usando API real (memoizadas)
  const createSistema = useCallback(async (sistema: Omit<Sistema, 'sistemaId' | 'fechaCreacion' | 'version' | 'registroEliminado'>) => {
    if (!hasValidOrganization) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const request: CreateSistemaRequest = mapSistemaToAPI(sistema);
      const response = await sistemasService.createSistema(request);
      
      if (response.success) {
        AlertService.success('Sistema creado exitosamente');
        await loadSistemas(); // Recargar la lista actual
        return mapSistemaFromAPI(response.data!);
      } else {
        throw new Error(response.message || 'Error al crear sistema');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al crear sistema';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization]); // ARREGLADO: removido refreshSistemas para evitar loop

  const updateSistema = useCallback(async (...args: any[]) => {
    if (!hasValidOrganization) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true }));

      let sistemaId: number;
      let updates: Partial<Sistema> = {};

      if (typeof args[0] === 'number') {
        // Pattern: updateSistema(sistemaId, updates)
        sistemaId = args[0] as number;
        updates = (args[1] || {}) as Partial<Sistema>;
      } else if (args[0] && typeof args[0] === 'object') {
        // Pattern: updateSistema({ sistemaId, ...updates })
        const obj = args[0] as Partial<Sistema> & { sistemaId?: number };
        if (!obj.sistemaId) {
          throw new Error('sistemaId es requerido para actualizar el sistema');
        }
        sistemaId = obj.sistemaId as number;
        const { sistemaId: _omit, ...rest } = obj as any;
        updates = rest as Partial<Sistema>;
      } else {
        throw new Error('Parámetros inválidos para updateSistema');
      }
      
      const mappedData = mapSistemaToAPI(updates);
      const request: UpdateSistemaRequest = {
        sistemaId,
        ...mappedData
      };
      
      const response = await sistemasService.updateSistema(request);
      
      if (response.success) {
        AlertService.success('Sistema actualizado exitosamente');
        await loadSistemas(); // Recargar la lista actual
        return true;
      } else {
        throw new Error(response.message || 'Error al actualizar sistema');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al actualizar sistema';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization]); // ARREGLADO: removido refreshSistemas para evitar loop

  const deleteSistema = useCallback(async (sistemaId: number) => {
    if (!hasValidOrganization) return false;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const request: DeleteSistemaRequest = {
        sistemaId,
        forceDelete: false,
        motivo: 'Eliminación desde interfaz de usuario'
      };
      
      const response = await sistemasService.deleteSistema(request);
      
      if (response.success) {
        AlertService.success('Sistema eliminado exitosamente');
        await loadSistemas(); // Recargar la lista actual
      } else {
        throw new Error(response.message || 'Error al eliminar sistema');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al eliminar sistema';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization]); // ARREGLADO: removido refreshSistemas para evitar loop

  // 🔒 PROTECCIÓN FINAL: Garantizar arrays válidos SIEMPRE
  const finalState = {
    sistemas: Array.isArray(state.filteredSistemas) ? state.filteredSistemas : [],
    allSistemas: Array.isArray(state.sistemas) ? state.sistemas : [],
    loading: Boolean(state.loading),
    error: hasValidOrganization ? state.error : 'No hay organización configurada',
    filters: state.filters || DEFAULT_FILTERS,
    pagination: state.pagination || DEFAULT_PAGINATION,
    stats: state.stats || {
      total: 0,
      activos: 0,
      inactivos: 0,
      internos: 0,
      externos: 0,
      conDependencias: 0
    }
  };

  return {
    // Estado
    sistemas: finalState.sistemas,
    allSistemas: finalState.allSistemas,
    loading: finalState.loading,
    error: finalState.error,
    filters: finalState.filters,
    pagination: finalState.pagination,
    stats: finalState.stats,

    // Acciones de filtrado - funcionan solo si hay organización
    setFilters: hasValidOrganization ? setFilters : () => {},
    setSearch: hasValidOrganization ? setSearch : () => {},
    clearFilters: hasValidOrganization ? clearFilters : () => {},

    // Acciones de paginación - funcionan solo si hay organización
    setPage: hasValidOrganization ? setPage : () => {},
    setPageSize: hasValidOrganization ? setPageSize : () => {},

    // Acciones de datos - funcionan solo si hay organización
    refreshSistemas: hasValidOrganization ? refreshSistemas : () => Promise.resolve(),
    getSistemaById: hasValidOrganization ? getSistemaById : () => Promise.resolve(null),
    createSistema: hasValidOrganization ? createSistema : () => Promise.resolve(null),
    updateSistema: hasValidOrganization ? updateSistema : () => Promise.resolve(null),
    deleteSistema: hasValidOrganization ? deleteSistema : () => Promise.resolve(false)
  };
};