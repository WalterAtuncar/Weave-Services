import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Proceso, 
  TipoProceso, 
  CategoriaProceso, 
  EstadoProceso 
} from '../models/Procesos';
import { 
  procesosService,
  CreateProcesoRequest,
  UpdateProcesoRequest,
  DeleteProcesoRequest
} from '../services';
import { AlertService } from '../components/ui/alerts';
import { useAuth } from './useAuth';

export interface ProcesosFilters {
  search: string;
  tipo?: TipoProceso;
  categoria?: CategoriaProceso;
  estado?: EstadoProceso;
  conDependencias?: boolean;
  tieneGobernanzaPropia?: boolean;
}

export interface ProcesosPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProcesosState {
  procesos: Proceso[];
  filteredProcesos: Proceso[];
  loading: boolean;
  error: string | null;
  filters: ProcesosFilters;
  pagination: ProcesosPagination;
  stats: {
    total: number;
    activos: number;
    inactivos: number;
    estrategicos: number;
    operativos: number;
    conDependencias: number;
  };
}

const DEFAULT_FILTERS: ProcesosFilters = {
  search: '',
  tipo: undefined,
  categoria: undefined,
  estado: undefined,
  conDependencias: undefined,
  tieneGobernanzaPropia: undefined
};

const DEFAULT_PAGINATION: ProcesosPagination = {
  page: 1,
  pageSize: 5,
  total: 0,
  totalPages: 0
};

// Función para mapear desde API real a modelo local
const mapProcesoFromAPI = (procesoAPI: any): Proceso => {
  return {
    procesoId: procesoAPI.procesoId || procesoAPI.ProcesoId || procesoAPI.id,
    organizacionId: procesoAPI.organizacionId || procesoAPI.OrganizacionId || 1,
    codigoProceso: procesoAPI.codigoProceso || procesoAPI.CodigoProceso || procesoAPI.codigo || null,
    nombreProceso: procesoAPI.nombreProceso || procesoAPI.NombreProceso || procesoAPI.nombre,
    objetivos: procesoAPI.descripcionProceso || procesoAPI.objetivos || procesoAPI.Objetivos || procesoAPI.descripcion || null,
    procesoDepende: procesoAPI.padreId || procesoAPI.procesoDepende || procesoAPI.ProcesoDepende || procesoAPI.procesoParentId || null,
    tipoProceso: procesoAPI.tipoProcesoId || procesoAPI.TipoProcesoId || procesoAPI.tipoProceso || TipoProceso.OPERATIVO,
    categoriaProceso: procesoAPI.categoriaProcesoId || procesoAPI.CategoriaProcesoId || procesoAPI.categoriaProceso || CategoriaProceso.GESTION,
    tieneGobernanzaPropia: Boolean(procesoAPI.tieneGobernanza || procesoAPI.TieneGobernanzaPropia || procesoAPI.tieneGobernanzaPropia),
    gobernanzaId: procesoAPI.gobernanzaId || procesoAPI.GobernanzaId || null,
    version: procesoAPI.versionProceso || procesoAPI.version || procesoAPI.Version || "1.0",
    estado: procesoAPI.estadoId !== undefined ? procesoAPI.estadoId : (procesoAPI.Estado !== undefined ? procesoAPI.Estado : (procesoAPI.estado !== undefined ? procesoAPI.estado : EstadoProceso.Activo)),
    creadoPor: procesoAPI.creadoPor || procesoAPI.CreadoPor || null,
    fechaCreacion: procesoAPI.fechaCreacion || procesoAPI.FechaCreacion || new Date().toISOString(),
    actualizadoPor: procesoAPI.actualizadoPor || procesoAPI.ActualizadoPor || null,
    fechaActualizacion: procesoAPI.fechaModificacion || procesoAPI.fechaActualizacion || procesoAPI.FechaActualizacion || null,
    // Mapear nombres de usuario desde el backend
    nombreUsuarioCreador: procesoAPI.nombreUsuarioCreador || procesoAPI.NombreUsuarioCreador || null,
    nombreUsuarioActualizador: procesoAPI.nombreUsuarioActualizador || procesoAPI.NombreUsuarioActualizador || null,
    registroEliminado: procesoAPI.registroEliminado || procesoAPI.RegistroEliminado || procesoAPI.estado_registro === 0 || false,
    // Mapear actividades del backend
    actividades: procesoAPI.actividades || procesoAPI.Actividades || (procesoAPI.actividadesActivas ? Array(procesoAPI.actividadesActivas).fill({}) : []),
    // Campos adicionales para el modal
    alcance: procesoAPI.alcance || procesoAPI.Alcance || null,
    responsableId: procesoAPI.responsableId || procesoAPI.ResponsableId || null,
    // Campos adicionales de la nueva estructura
    nombreTipoProceso: procesoAPI.nombreTipoProceso || null,
    nombreEstado: procesoAPI.nombreEstado || null,
    categoria: procesoAPI.categoria || null,
    responsable: procesoAPI.responsable || null,
    duracion: procesoAPI.duracion || null,
    nivel: procesoAPI.nivel || null,
    rutaJerarquica: procesoAPI.rutaJerarquica || null,
    tieneHijos: procesoAPI.tieneHijos || false,
    nombrePadre: procesoAPI.nombrePadre || null
  };
};

// Función para mapear desde modelo local a API
const mapProcesoToAPI = (proceso: Partial<Proceso>): any => {
  const apiData: any = {};
  
  // Solo incluir campos que no sean undefined/null
  if (proceso.codigoProceso !== undefined) apiData.codigoProceso = proceso.codigoProceso;
  if (proceso.nombreProceso !== undefined) apiData.nombreProceso = proceso.nombreProceso;
  if (proceso.objetivos !== undefined) apiData.objetivos = proceso.objetivos;
  if (proceso.categoriaProceso !== undefined) apiData.categoriaProcesoId = proceso.categoriaProceso;
  if (proceso.procesoDepende !== undefined) apiData.procesoDepende = proceso.procesoDepende;
  if (proceso.tipoProceso !== undefined) apiData.tipoProcesoId = proceso.tipoProceso;
  
  // Respetar valor del formulario (no forzar true)
  if (proceso.tieneGobernanzaPropia !== undefined) {
    apiData.tieneGobernanzaPropia = proceso.tieneGobernanzaPropia;
  }
  
  // Mapear gobernanzaId SIEMPRE desde el formData, sin condicionar por tieneGobernanzaPropia
  apiData.gobernanzaId = (proceso as any).gobernanzaId ?? null;

  if (proceso.estado !== undefined) apiData.estado = proceso.estado;
  if (proceso.organizacionId !== undefined) apiData.organizacionId = proceso.organizacionId;
  if (proceso.version !== undefined) apiData.version = proceso.version;
  if (proceso.alcance !== undefined) apiData.alcance = proceso.alcance;
  if (proceso.responsableId !== undefined) apiData.responsableId = proceso.responsableId;

  // Soporte opcional para creación con actividades
  if (Array.isArray((proceso as any).actividades)) {
    apiData.actividades = (proceso as any).actividades;
  }
  
  return apiData;
};

export const useProcesos = () => {
  // Obtener organizationInfo completo
  const { user, organization, organizationInfo } = useAuth();
  
  // Memoizar para evitar loops infinitos
  const organizacionId = useMemo(() => organizationInfo?.id, [organizationInfo?.id]);
  const hasValidOrganization = useMemo(() => 
    Boolean(organizationInfo?.hasOrganization && organizacionId), 
    [organizationInfo?.hasOrganization, organizacionId]
  );
  
  // Estado inicial - siguiendo patrón de Sistemas
  const [state, setState] = useState<ProcesosState>({
    procesos: [],
    filteredProcesos: [],
    loading: false,
    error: null,
    filters: DEFAULT_FILTERS,
    pagination: DEFAULT_PAGINATION,
    stats: {
      total: 0,
      activos: 0,
      inactivos: 0,
      estrategicos: 0,
      operativos: 0,
      conDependencias: 0
    }
  });
  
  // Cargar datos desde la API real - MEMOIZADO para evitar loops
  const loadProcesos = useCallback(async (customFilters?: ProcesosFilters, customPagination?: Partial<ProcesosPagination>) => {
    // Verificar que haya organizacionId válido antes de hacer la llamada
    if (!hasValidOrganization) {
      console.log('❌ No hay organización válida:', { hasValidOrganization, organizacionId });
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "No se encontró información de organización. Por favor, inicia sesión nuevamente." 
      }));
      return;
    }

    try {
      console.log('🔄 Iniciando carga de procesos...', { organizacionId, hasValidOrganization });
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const currentFilters = customFilters || state.filters;
      const currentPagination = customPagination ? { ...state.pagination, ...customPagination } : state.pagination;

      // Usar el método del servicio
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
      if (currentFilters.categoria !== undefined) {
        request.categoriaProceso = currentFilters.categoria;
      }
      if (currentFilters.estado !== undefined) {
        request.estado = currentFilters.estado;
      }
      if (currentFilters.conDependencias === false) {
        request.soloProcesosRaiz = true;
      }
      if (currentFilters.tieneGobernanzaPropia !== undefined) {
        request.tieneGobernanzaPropia = currentFilters.tieneGobernanzaPropia;
      }

      console.log('📤 Request enviado al backend:', request);
      const response = await procesosService.getProcesosPaginated(request);
      console.log('📥 Response del backend:', response);
      
      if (response.success && response.data) {
        // Leer estructura correcta del backend - actualizada para la nueva estructura
        const responseData: any = response.data || {};
        console.log('📊 Response data estructura:', responseData);
        
        // Extraer procesos del array principal - adaptado para múltiples estructuras (incluye "procesos")
        const procesosArray =
          Array.isArray(responseData.procesos) ? responseData.procesos :
          Array.isArray(responseData.data) ? responseData.data :
          Array.isArray(responseData.items) ? responseData.items :
          Array.isArray(responseData.result) ? responseData.result :
          Array.isArray(responseData) ? responseData : [];

        console.log('📋 Procesos array extraído:', procesosArray);
        console.log('📋 Cantidad de procesos:', procesosArray.length);

        const mappedProcesos = procesosArray.map(mapProcesoFromAPI);
        console.log('🔄 Procesos mapeados:', mappedProcesos);
        
        // Extraer información de paginación - adaptada para múltiples estructuras
        const paginacionInfo = responseData.paginacion || {};
        const totalCount = paginacionInfo.totalElementos
          || responseData.totalItems
          || responseData.totalCount
          || mappedProcesos.length;
        const currentPage = paginacionInfo.paginaActual
          || responseData.currentPage
          || responseData.page
          || currentPagination.page;
        const pageSize = paginacionInfo.tamañoPagina
          || responseData.pageSize
          || currentPagination.pageSize;
        const totalPages = paginacionInfo.totalPaginas
          || responseData.totalPages
          || Math.ceil((totalCount || 0) / (pageSize || 1));
        
        // Calcular estadísticas
        const stats = {
          total: totalCount,
          activos: mappedProcesos.filter(p => p.estado === EstadoProceso.Activo).length,
          inactivos: mappedProcesos.filter(p => p.estado === EstadoProceso.Inactivo).length,
          estrategicos: mappedProcesos.filter(p => p.tipoProceso === TipoProceso.ESTRATEGICO).length,
          operativos: mappedProcesos.filter(p => p.tipoProceso === TipoProceso.OPERATIVO).length,
          conDependencias: mappedProcesos.filter(p => p.procesoDepende !== null).length
        };

        const newPagination = {
          page: currentPage,
          pageSize: pageSize,
          total: totalCount,
          totalPages: totalPages
        };

        console.log('📈 Stats calculadas:', stats);
        console.log('📄 Paginación:', newPagination);

        setState(prev => ({
          ...prev,
          procesos: mappedProcesos,
          filteredProcesos: mappedProcesos,
          loading: false,
          error: null,
          filters: currentFilters,
          pagination: newPagination,
          stats
        }));

        console.log('✅ Estado actualizado con', mappedProcesos.length, 'procesos');
      } else {
        console.log('❌ Response no exitoso:', response);
        throw new Error(response.message || 'Error al cargar procesos');
      }
    } catch (error: any) {
      console.log('❌ Error en loadProcesos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar procesos'
      }));
    }
  }, [hasValidOrganization, organizacionId, state.filters, state.pagination]);

  // Cargar datos iniciales cuando cambie la organización
  useEffect(() => {
    if (hasValidOrganization) {
      loadProcesos();
    }
  }, [hasValidOrganization, organizacionId]);

  // Funciones de filtrado
  const setFilters = useCallback((newFilters: Partial<ProcesosFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    loadProcesos(updatedFilters, { page: 1 }); // Reset a página 1 cuando se filtran
  }, [loadProcesos, state.filters]);

  const setSearch = useCallback((search: string) => {
    setFilters({ search });
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    loadProcesos(DEFAULT_FILTERS, { page: 1 });
  }, [loadProcesos]);

  // Funciones de paginación
  const setPage = useCallback((page: number) => {
    loadProcesos(undefined, { page });
  }, [loadProcesos]);

  const setPageSize = useCallback((pageSize: number) => {
    loadProcesos(undefined, { page: 1, pageSize });
  }, [loadProcesos]);

  // Función para refrescar datos
  const refreshProcesos = useCallback(() => {
    return loadProcesos();
  }, [loadProcesos]);

  // Función para obtener proceso por ID
  const getProcesoById = useCallback(async (procesoId: number): Promise<Proceso | null> => {
    if (!hasValidOrganization) return null;
    
    try {
      const response = await procesosService.getProcesoById({ procesoId });
      
      if (response.success && response.data) {
        return mapProcesoFromAPI(response.data);
      }
      
      return null;
    } catch (error: any) {
      AlertService.error(error.message || 'Error al obtener proceso');
      return null;
    }
  }, [hasValidOrganization]);

  // Función para crear proceso
  const createProceso = useCallback(async (proceso: Partial<Proceso>): Promise<Proceso | null> => {
    if (!hasValidOrganization) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const request: CreateProcesoRequest = mapProcesoToAPI(proceso);
      const response = await procesosService.createProceso(request);
      
      if (response.success) {
        AlertService.success('Proceso creado exitosamente');
        await loadProcesos(); // Recargar la lista actual
        return mapProcesoFromAPI(response.data!);
      } else {
        throw new Error(response.message || 'Error al crear proceso');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al crear proceso';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization, loadProcesos]);

  const updateProceso = useCallback(async (...args: any[]) => {
    if (!hasValidOrganization) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true }));

      let procesoId: number;
      let updates: Partial<Proceso> = {};

      if (typeof args[0] === 'number') {
        // Pattern: updateProceso(procesoId, updates)
        procesoId = args[0] as number;
        updates = (args[1] || {}) as Partial<Proceso>;
      } else if (args[0] && typeof args[0] === 'object') {
        // Pattern: updateProceso({ procesoId, ...updates })
        const obj = args[0] as Partial<Proceso> & { procesoId?: number };
        if (!obj.procesoId) {
          throw new Error('procesoId es requerido para actualizar el proceso');
        }
        procesoId = obj.procesoId as number;
        const { procesoId: _omit, ...rest } = obj as any;
        updates = rest as Partial<Proceso>;
      } else {
        throw new Error('Parámetros inválidos para updateProceso');
      }
      
      const mappedData = mapProcesoToAPI(updates);
      const request: UpdateProcesoRequest = {
        procesoId,
        ...mappedData
      };
      
      const response = await procesosService.updateProceso(request);
      
      if (response.success) {
        AlertService.success('Proceso actualizado exitosamente');
        await loadProcesos(); // Recargar la lista actual
        return true;
      } else {
        throw new Error(response.message || 'Error al actualizar proceso');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al actualizar proceso';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization, loadProcesos]);

  const deleteProceso = useCallback(async (procesoId: number) => {
    if (!hasValidOrganization) return false;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const request: DeleteProcesoRequest = {
        procesoId,
        forceDelete: false,
        motivo: 'Eliminación desde interfaz de usuario'
      };
      
      const response = await procesosService.deleteProceso(request);
      
      if (response.success) {
        AlertService.success('Proceso eliminado exitosamente');
        await loadProcesos(); // Recargar la lista actual
      } else {
        throw new Error(response.message || 'Error al eliminar proceso');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Error al eliminar proceso';
      AlertService.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [hasValidOrganization, loadProcesos]);

  // Protección final: Garantizar arrays válidos SIEMPRE
  const finalState = {
    procesos: Array.isArray(state.filteredProcesos) ? state.filteredProcesos : [],
    allProcesos: Array.isArray(state.procesos) ? state.procesos : [],
    loading: Boolean(state.loading),
    error: hasValidOrganization ? state.error : 'No hay organización configurada',
    filters: state.filters || DEFAULT_FILTERS,
    pagination: state.pagination || DEFAULT_PAGINATION,
    stats: state.stats || {
      total: 0,
      activos: 0,
      inactivos: 0,
      estrategicos: 0,
      operativos: 0,
      conDependencias: 0
    }
  };

  return {
    // Estado
    procesos: finalState.procesos,
    allProcesos: finalState.allProcesos,
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
    refreshProcesos: hasValidOrganization ? refreshProcesos : () => Promise.resolve(),
    getProcesoById: hasValidOrganization ? getProcesoById : () => Promise.resolve(null),
    createProceso: hasValidOrganization ? createProceso : () => Promise.resolve(null),
    updateProceso: hasValidOrganization ? updateProceso : () => Promise.resolve(null),
    deleteProceso: hasValidOrganization ? deleteProceso : () => Promise.resolve(false)
  };
};