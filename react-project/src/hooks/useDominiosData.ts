/**
 * Hook personalizado para gestión de Dominios de Data
 * Basado en useSistemas.ts pero adaptado para dominios y sub-dominios de datos
 */

import { useState, useCallback, useEffect } from 'react';
import {
  DominioData,
  SubDominioData,
  CreateDominioDataDto,
  UpdateDominioDataDto,
  CreateSubDominioDataDto,
  UpdateSubDominioDataDto,
  EstadoDominioData,
  TipoDominioData,
  CategoriaSubDominio,
  NivelSensibilidad
} from '../models/DominiosData';
import {
  DominiosDataFilters,
  DominiosDataPaginatedResponseData,
  EstadisticasDominiosData,
  mapDominioDataFromAPI,
  mapDominioDataToAPI,
  mapSubDominioDataFromAPI
} from '../services/types/dominios-data.types';
import { dominiosDataService } from '../services/dominios-data.service';
import SubDominioDataService from '../services/subdominio-data.service';
import { AlertService } from '../components/ui/alerts/AlertService';
import { useAuth } from './useAuth';

// ===== INTERFACES =====

export interface DominiosDataFiltersState {
  searchTerm: string;
  tipoDominio?: TipoDominioData;
  estado?: EstadoDominioData;
  dominioParentId?: number;
  propietarioNegocio?: string;
  stewardData?: string;
  soloDominiosRaiz?: boolean;
  tieneSubDominios?: boolean;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
}

export interface DominiosDataPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DominiosDataState {
  dominios: DominioData[];
  loading: boolean;
  error: string | null;
  filters: DominiosDataFiltersState;
  pagination: DominiosDataPagination;
  estadisticas: EstadisticasDominiosData | null;
  selectedDominio: DominioData | null;
  subDominiosData: SubDominioData[];
  loadingSubDominios: boolean;
}

// ===== VALORES POR DEFECTO =====

const defaultFilters: DominiosDataFiltersState = {
  searchTerm: '',
  tipoDominio: undefined,
  estado: undefined,
  dominioParentId: undefined,
  propietarioNegocio: '',
  stewardData: '',
  soloDominiosRaiz: false,
  tieneSubDominios: undefined,
  fechaCreacionDesde: undefined,
  fechaCreacionHasta: undefined
};

const defaultPagination: DominiosDataPagination = {
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
};

// ===== HOOK PRINCIPAL =====

export const useDominiosData = () => {
  const { user } = useAuth();
  const subDominioDataService = new SubDominioDataService();
  
  // Estados principales
  const [state, setState] = useState<DominiosDataState>({
    dominios: [],
    loading: false,
    error: null,
    filters: defaultFilters,
    pagination: defaultPagination,
    estadisticas: null,
    selectedDominio: null,
    subDominiosData: [],
    loadingSubDominios: false
  });

  // ===== FUNCIONES DE CARGA =====

  /**
   * Carga dominios con paginación y filtros
   */
  const loadDominios = useCallback(async (resetPagination = false) => {
    if (!user?.organizacionId) {
      AlertService.error('No se ha encontrado la organización del usuario');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const currentPage = resetPagination ? 1 : state.pagination.currentPage;
      
      // Preparar parámetros de la consulta
      const params = {
        page: currentPage,
        pageSize: state.pagination.pageSize,
        organizacionId: user.organizacionId,
        orderBy: 'fechaCreacion',
        ascending: false,
        includeDeleted: false,
        
        // Aplicar filtros
        ...(state.filters.searchTerm && { searchTerm: state.filters.searchTerm }),
        ...(state.filters.tipoDominio && { tipoDominio: state.filters.tipoDominio }),
        ...(state.filters.estado && { estado: state.filters.estado }),
        ...(state.filters.dominioParentId && { dominioParentId: state.filters.dominioParentId }),
        ...(state.filters.propietarioNegocio && { propietarioNegocio: state.filters.propietarioNegocio }),
        ...(state.filters.stewardData && { stewardData: state.filters.stewardData }),
        ...(state.filters.soloDominiosRaiz && { soloDominiosRaiz: state.filters.soloDominiosRaiz }),
        ...(state.filters.tieneSubDominios !== undefined && { tieneSubDominios: state.filters.tieneSubDominios }),
        ...(state.filters.fechaCreacionDesde && { fechaCreacionDesde: state.filters.fechaCreacionDesde }),
        ...(state.filters.fechaCreacionHasta && { fechaCreacionHasta: state.filters.fechaCreacionHasta })
      };

      const response = await dominiosDataService.getDominiosDataPaginated(params);
      
      // Console.log para ver cómo llegan los datos del backend
      if (response.success && response.data) {
        const paginatedData = response.data as DominiosDataPaginatedResponseData;
        
        console.log('🔍 [DOMINIOS DATA HOOK] Datos del backend antes del mapeo:', {
          totalDominios: paginatedData.data.length,
          primerDominio: paginatedData.data[0],
          gobernanzaIds: paginatedData.data.map(d => ({ 
            dominioId: d.dominioDataId, 
            nombre: d.nombreDominio,
            gobernanzaId: d.gobernanzaId,
            tipoGobernanzaId: typeof d.gobernanzaId
          }))
        });
        
        // Console.log para ver cada dominio individual antes del mapeo
        paginatedData.data.forEach((dominio, index) => {
          console.log(`📋 [DOMINIO ${index}] Datos del backend:`, {
            dominioId: dominio.dominioDataId,
            nombre: dominio.nombreDominio,
            gobernanzaId: dominio.gobernanzaId,
            tipoGobernanzaId: typeof dominio.gobernanzaId,
            dominioCompleto: dominio
          });
        });
        
        const dominiosMapped = paginatedData.data.map(mapDominioDataFromAPI);
        
        console.log('🔄 [DOMINIOS DATA HOOK] Datos después del mapeo:', {
          totalDominios: dominiosMapped.length,
          primerDominio: dominiosMapped[0],
          gobernanzaIds: dominiosMapped.map(d => ({ 
            dominioId: d.dominioId, 
            nombre: d.nombre,
            gobernanzaId: d.gobernanzaId,
            tipoGobernanzaId: typeof d.gobernanzaId
          }))
        });
        
        // Console.log para ver los dominios después del mapeo
        dominiosMapped.forEach((dominio, index) => {
        });
        
        setState(prev => ({
          ...prev,
          dominios: dominiosMapped,
          pagination: {
            currentPage: paginatedData.pagination.page,
            pageSize: paginatedData.pagination.pageSize,
            totalCount: paginatedData.pagination.totalRecords,
            totalPages: paginatedData.pagination.totalPages,
            hasNextPage: paginatedData.pagination.hasNext,
            hasPreviousPage: paginatedData.pagination.hasPrevious
          },
          loading: false
        }));
        
        // Calcular estadísticas básicas
        const stats: EstadisticasDominiosData = {
          totalDominios: paginatedData.pagination.totalRecords,
          dominiosActivos: dominiosMapped.filter(d => d.estado === EstadoDominioData.ACTIVO).length,
          dominiosInactivos: dominiosMapped.filter(d => d.estado === EstadoDominioData.INACTIVO).length,
          dominiosRaiz: dominiosMapped.filter(d => !d.dominioParentId).length,
          subDominios: dominiosMapped.filter(d => d.dominioParentId).length,
          totalSubDominiosData: dominiosMapped.reduce((sum, d) => sum + (d.totalSubDominios || 0), 0),
          tiposConMasDominios: [],
          dominiosConMasSubDominios: [],
          distribucionPorSensibilidad: [],
          distribucionPorCategoria: []
        };
        
        setState(prev => ({ ...prev, estadisticas: stats }));
      } else {
        throw new Error(response.message || 'Error al cargar dominios');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar dominios';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      AlertService.error(errorMessage);
    }
  }, [user?.organizacionId, state.filters, state.pagination.currentPage, state.pagination.pageSize]);

  /**
   * Carga sub-dominios de data para un dominio específico
   */
  const loadSubDominiosData = useCallback(async (dominioId: number) => {
    setState(prev => ({ ...prev, loadingSubDominios: true }));
    
    try {
      const response = await subDominioDataService.getSubDominiosData({ dominioId });
      
      if (response.success && response.data) {
        const subDominiosMapped = response.data.map(mapSubDominioDataFromAPI);
        setState(prev => ({ ...prev, subDominiosData: subDominiosMapped, loadingSubDominios: false }));
      } else {
        throw new Error(response.message || 'Error al cargar sub-dominios');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar sub-dominios';
      setState(prev => ({ ...prev, loadingSubDominios: false }));
      AlertService.error(errorMessage);
    }
  }, []);

  // ===== FUNCIONES DE FILTROS =====

  /**
   * Establece filtros y recarga datos
   */
  const setFilters = useCallback((newFilters: Partial<DominiosDataFiltersState>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  /**
   * Establece término de búsqueda
   */
  const setSearchTerm = useCallback((searchTerm: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, searchTerm }
    }));
  }, []);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: defaultFilters
    }));
  }, []);

  // ===== FUNCIONES DE PAGINACIÓN =====

  /**
   * Cambia la página actual
   */
  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page }
    }));
  }, []);

  /**
   * Cambia el tamaño de página
   */
  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, currentPage: 1 }
    }));
  }, []);

  // ===== FUNCIONES DE DATOS =====

  /**
   * Refresca los datos
   */
  const refresh = useCallback(() => {
    loadDominios(false);
    // Si hay un dominio seleccionado, también recargar sus subdominios
    if (state.selectedDominio) {
      loadSubDominiosData(state.selectedDominio.dominioId);
    }
  }, [loadDominios, state.selectedDominio, loadSubDominiosData]);

  /**
   * Obtiene un dominio por ID
   */
  const getDominioById = useCallback(async (dominioId: number): Promise<DominioData | null> => {
    if (!user?.organizacionId) {
      AlertService.error('No se ha encontrado la organización del usuario');
      return null;
    }

    try {
      const response = await dominiosDataService.getDominioDataById({ dominioId });
      
      if (response.success && response.data) {
        return mapDominioDataFromAPI(response.data);
      } else {
        throw new Error(response.message || 'Error al obtener dominio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener dominio';
      AlertService.error(errorMessage);
      return null;
    }
  }, [user?.organizacionId]);

  /**
   * Crea un nuevo dominio
   */
  const createDominio = useCallback(async (dominioData: CreateDominioDataDto): Promise<DominioData | null> => {
    if (!user?.organizacionId) {
      AlertService.error('No se ha encontrado la organización del usuario');
      return null;
    }

    try {
      const requestData = {
        ...mapDominioDataToAPI(dominioData),
        organizacionId: user.organizacionId,
        creadoPor: user.usuarioId
      };

      const response = await dominiosDataService.createDominioData(requestData);
      
      if (response.success && response.data) {
        const nuevoDominio = mapDominioDataFromAPI(response.data);
        AlertService.success('Dominio creado exitosamente');
        await loadDominios(false); // Recargar lista
        return nuevoDominio;
      } else {
        throw new Error(response.message || 'Error al crear dominio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear dominio';
      AlertService.error(errorMessage);
      return null;
    }
  }, [user?.organizacionId, user?.usuarioId, loadDominios]);

  /**
   * Actualiza un dominio existente
   */
  const updateDominio = useCallback(async (dominioData: UpdateDominioDataDto): Promise<DominioData | null> => {
    if (!user?.organizacionId) {
      AlertService.error('No se ha encontrado la organización del usuario');
      return null;
    }

    try {
      const requestData = {
        ...mapDominioDataToAPI(dominioData),
        organizacionId: user.organizacionId,
        actualizadoPor: user.usuarioId
      };

      const response = await dominiosDataService.updateDominioData(requestData);
      
      if (response.success && response.data) {
        const dominioActualizado = mapDominioDataFromAPI(response.data);
        AlertService.success('Dominio actualizado exitosamente');
        await loadDominios(false); // Recargar lista
        return dominioActualizado;
      } else {
        throw new Error(response.message || 'Error al actualizar dominio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar dominio';
      AlertService.error(errorMessage);
      return null;
    }
  }, [user?.organizacionId, user?.usuarioId, loadDominios]);

  /**
   * Elimina un dominio
   */
  const deleteDominio = useCallback(async (dominioId: number, motivo?: string): Promise<boolean> => {
    try {
      const response = await dominiosDataService.deleteDominioData({ 
        dominioId, 
        motivo,
        forceDelete: false 
      });
      
      if (response.success) {
        AlertService.success('Dominio eliminado exitosamente');
        await loadDominios(false); // Recargar lista
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar dominio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar dominio';
      AlertService.error(errorMessage);
      return false;
    }
  }, [loadDominios]);

  // ===== FUNCIONES PARA SUB-DOMINIOS =====

  /**
   * Crea un nuevo sub-dominio de data
   */
  const createSubDominioData = useCallback(async (subDominioData: CreateSubDominioDataDto): Promise<boolean> => {
    try {
      const requestData: CreateSubDominioDataDto = {
        dominioDataId: subDominioData.dominioDataId,
        codigoSubDominio: subDominioData.codigoSubDominio,
        nombreSubDominio: subDominioData.nombreSubDominio,
        descripcionSubDominio: subDominioData.descripcionSubDominio,
        tieneGobernanzaPropia: subDominioData.tieneGobernanzaPropia,
        gobernanzaId: subDominioData.gobernanzaId,
        estado: subDominioData.estado,
        creadoPor: user?.usuarioId
      };

      const response = await subDominioDataService.createSubDominioData(requestData);
      
      if (response.success) {
        AlertService.success('Sub-dominio creado exitosamente');
        if (state.selectedDominio) {
          await loadSubDominiosData(state.selectedDominio.dominioId);
        }
        return true;
      } else {
        throw new Error(response.message || 'Error al crear sub-dominio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear sub-dominio';
      AlertService.error(errorMessage);
      return false;
    }
  }, [user?.usuarioId, state.selectedDominio, loadSubDominiosData]);

  /**
   * Actualiza un sub-dominio de data
   */
  const updateSubDominioData = useCallback(async (subDominioData: UpdateSubDominioDataDto): Promise<boolean> => {
    try {
      const requestData: UpdateSubDominioDataDto = {
        subDominioDataId: subDominioData.subDominioDataId,
        dominioDataId: subDominioData.dominioDataId,
        codigoSubDominio: subDominioData.codigoSubDominio,
        nombreSubDominio: subDominioData.nombreSubDominio,
        descripcionSubDominio: subDominioData.descripcionSubDominio,
        tieneGobernanzaPropia: subDominioData.tieneGobernanzaPropia,
        gobernanzaId: subDominioData.gobernanzaId,
        estado: subDominioData.estado,
        actualizadoPor: user?.usuarioId
      };

      const response = await subDominioDataService.updateSubDominioData(requestData);
      
      if (response.success) {
        AlertService.success('Sub-dominio actualizado exitosamente');
        if (state.selectedDominio) {
          await loadSubDominiosData(state.selectedDominio.dominioId);
        }
        return true;
      } else {
        throw new Error(response.message || 'Error al actualizar sub-dominio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar sub-dominio';
      AlertService.error(errorMessage);
      return false;
    }
  }, [user?.usuarioId, state.selectedDominio, loadSubDominiosData]);

  /**
   * Elimina un sub-dominio de data
   */
  const deleteSubDominioData = useCallback(async (dominioId: number, subDominioId: number): Promise<boolean> => {
    try {
      const response = await subDominioDataService.deleteSubDominioData({
        dominioDataId: dominioId,
        subDominioId,
        eliminadoPor: user?.usuarioId,
        forceDelete: false
      });
      
      if (response.success) {
        AlertService.success('Sub-dominio eliminado exitosamente');
        await loadSubDominiosData(dominioId);
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar sub-dominio');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar sub-dominio';
      AlertService.error(errorMessage);
      return false;
    }
  }, [loadSubDominiosData, user?.usuarioId]);

  // ===== FUNCIONES DE SELECCIÓN =====

  /**
   * Selecciona un dominio
   */
  const selectDominio = useCallback((dominio: DominioData | null) => {
    setState(prev => ({ ...prev, selectedDominio: dominio }));
    if (dominio) {
      loadSubDominiosData(dominio.dominioId);
    } else {
      setState(prev => ({ ...prev, subDominiosData: [] }));
    }
  }, [loadSubDominiosData]);

  // ===== EFECTOS =====

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    if (user?.organizacionId) {
      loadDominios(true);
    }
  }, [user?.organizacionId]);

  /**
   * Recarga cuando cambian filtros o paginación
   */
  useEffect(() => {
    if (user?.organizacionId) {
      loadDominios(false);
    }
  }, [state.filters, state.pagination.currentPage, state.pagination.pageSize]);

  // ===== RETURN =====

  return {
    // Estado
    dominios: state.dominios,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    estadisticas: state.estadisticas,
    selectedDominio: state.selectedDominio,
    subDominiosData: state.subDominiosData,
    loadingSubDominios: state.loadingSubDominios,
    
    // Funciones de carga
    loadDominios,
    loadSubDominiosData,
    refresh,
    
    // Funciones de filtros
    setFilters,
    setSearchTerm,
    clearFilters,
    
    // Funciones de paginación
    setPage,
    setPageSize,
    
    // CRUD Dominios
    getDominioById,
    createDominio,
    updateDominio,
    deleteDominio,
    
    // CRUD Sub-dominios
    createSubDominioData,
    updateSubDominioData,
    deleteSubDominioData,
    
    // Funciones de selección
    selectDominio
  };
};

export default useDominiosData;