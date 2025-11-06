import { useState, useEffect, useCallback } from 'react';
import { servidoresService } from '../services/servidores.service';
import { 
  Servidor, 
  SistemaServidor,
  CreateServidorDto, 
  UpdateServidorDto,
  TipoServidor,
  AmbienteServidor,
  EstadoServidor,
  ProveedorCloud
} from '../models/Servidores';
import { 
  ServidorDto, 
  ServidorSimpleDto,
  Servidor as ServidorApi
} from '../services/types/servidores.types';
import { useAuth } from './useAuth';
import { AlertService } from '../components/ui/alerts/AlertService';

// Funciones de mapeo entre frontend y backend

// Mapea tipo de servidor del backend (0=Virtual, 1=Físico) al frontend
const mapTipoServidorFromBackend = (backendTipo: number): TipoServidor => {
  switch (backendTipo) {
    case 0: return TipoServidor.VIRTUAL;
    case 1: return TipoServidor.FISICO;
    default: return TipoServidor.VIRTUAL;
  }
};

// Mapea tipo de servidor del frontend al backend
const mapTipoServidorToBackend = (frontendTipo: TipoServidor): number => {
  switch (frontendTipo) {
    case TipoServidor.VIRTUAL: return 0;
    case TipoServidor.FISICO: return 1;
    default: return 0;
  }
};

// Mapea ambiente del backend (0=Desarrollo, 1=Producción, 2=Pruebas, 3=PreProducción, 4=Recovery) al frontend
const mapAmbienteFromBackend = (backendAmbiente: number): AmbienteServidor => {
  switch (backendAmbiente) {
    case 0: return AmbienteServidor.DESARROLLO;
    case 1: return AmbienteServidor.PRODUCCION;
    case 2: return AmbienteServidor.PRUEBAS;
    case 3: return AmbienteServidor.PREPRODUCCION;
    case 4: return AmbienteServidor.RECOVERY;
    default: return AmbienteServidor.DESARROLLO;
  }
};

// Mapea ambiente del frontend al backend
const mapAmbienteToBackend = (frontendAmbiente: AmbienteServidor): number => {
  switch (frontendAmbiente) {
    case AmbienteServidor.DESARROLLO: return 0;
    case AmbienteServidor.PRODUCCION: return 1;
    case AmbienteServidor.PRUEBAS: return 2;
    case AmbienteServidor.PREPRODUCCION: return 3;
    case AmbienteServidor.RECOVERY: return 4;
    default: return 0;
  }
};

// Mapea estado del backend (0=Inactivo, 1=Activo) al frontend
const mapEstadoFromBackend = (backendEstado: number): EstadoServidor => {
  switch (backendEstado) {
    case 0: return EstadoServidor.INACTIVO;
    case 1: return EstadoServidor.ACTIVO;
    default: return EstadoServidor.ACTIVO;
  }
};

// Mapea estado del frontend al backend
const mapEstadoToBackend = (frontendEstado: EstadoServidor): number => {
  switch (frontendEstado) {
    case EstadoServidor.ACTIVO: return 1;
    case EstadoServidor.INACTIVO: return 0;
    default: return 1;
  }
};

// Sistema operativo es string en ambos lados, no necesita mapeo especial
const mapSistemaOperativoFromBackend = (backendSO: string): string => {
  return backendSO || 'Ubuntu 20.04'; // Default
};

// Mapea sistema operativo del frontend al backend (string a string)
const mapSistemaOperativoToBackend = (frontendSO: string): string => {
  return frontendSO || 'Ubuntu 20.04'; // Default
};

// Función para mapear ServidorApi (entidad base) a Servidor (modelo)
const mapServidorApiToServidor = (servidorApi: ServidorApi): Servidor => {
  return {
    servidorId: servidorApi.id,
    organizacionId: 0, // Se asignará desde el contexto
    codigoServidor: servidorApi.codigo,
    nombreServidor: servidorApi.nombre,
    descripcion: null,
    tipoServidor: mapTipoServidorFromBackend(servidorApi.tipo),
    sistemaOperativo: mapSistemaOperativoFromBackend(servidorApi.sistemaOperativo),
    ambiente: mapAmbienteFromBackend(servidorApi.ambiente),
    direccionIP: servidorApi.ip,
    puerto: null,
    cpu: null,
    memoriaRAM: null,
    almacenamiento: null,
    proveedor: ProveedorCloud.ON_PREMISE, // Default
    ubicacionFisica: null,
    responsableTecnico: null,
    fechaInstalacion: null,
    fechaUltimoMantenimiento: null,
    version: 1,
    estado: mapEstadoFromBackend(servidorApi.estado),
    creadoPor: servidorApi.creadoPor,
    fechaCreacion: servidorApi.fechaCreacion,
    actualizadoPor: servidorApi.actualizadoPor,
    fechaActualizacion: servidorApi.fechaActualizacion,
    registroEliminado: false,
    sistemasAsignados: 0, // No disponible en entidad base
    cantidadSistemas: 0 // No disponible en entidad base
  };
};

// Función para mapear ServidorDto (extendido) a Servidor (modelo)
const mapServidorDtoToServidor = (servidorDto: ServidorDto): Servidor => {
  return {
    servidorId: servidorDto.id,
    organizacionId: 0, // Se asignará desde el contexto
    codigoServidor: servidorDto.codigo,
    nombreServidor: servidorDto.nombre,
    descripcion: null,
    tipoServidor: mapTipoServidorFromBackend(servidorDto.tipo),
    sistemaOperativo: mapSistemaOperativoFromBackend(servidorDto.sistemaOperativo),
    ambiente: mapAmbienteFromBackend(servidorDto.ambiente),
    direccionIP: servidorDto.ip,
    puerto: null,
    cpu: null,
    memoriaRAM: null,
    almacenamiento: null,
    proveedor: ProveedorCloud.ON_PREMISE, // Default
    ubicacionFisica: null,
    responsableTecnico: null,
    fechaInstalacion: null,
    fechaUltimoMantenimiento: null,
    version: 1,
    estado: mapEstadoFromBackend(servidorDto.estado),
    creadoPor: servidorDto.creadoPor,
    fechaCreacion: servidorDto.fechaCreacion,
    actualizadoPor: servidorDto.actualizadoPor,
    fechaActualizacion: servidorDto.fechaActualizacion,
    registroEliminado: false,
    sistemasAsignados: servidorDto.totalSistemas,
    cantidadSistemas: servidorDto.totalSistemas
  };
};

interface UseServidoresFilters {
  search: string;
  ambiente?: AmbienteServidor;
  tipoServidor?: TipoServidor;
  proveedor?: ProveedorCloud;
  sistemaOperativo?: string;
  estado?: EstadoServidor;
  responsableTecnico?: string;
}

interface UseServidoresReturn {
  // Estados
  servidores: Servidor[];
  servidorActual: Servidor | null;
  loading: boolean;
  error: string | null;
  
  // Filtros
  filters: UseServidoresFilters;
  
  // Funciones CRUD básicas
  obtenerServidores: () => Promise<void>;
  obtenerServidorPorId: (id: number) => Promise<Servidor | null>;
  crearServidor: (data: CreateServidorDto) => Promise<Servidor | null>;
  actualizarServidor: (data: UpdateServidorDto) => Promise<Servidor | null>;
  eliminarServidor: (id: number) => Promise<boolean>;
  
  // Funciones de filtrado
  setFilters: (filters: Partial<UseServidoresFilters>) => void;
  limpiarFiltros: () => void;
  
  // Funciones de utilidad simplificadas
  obtenerServidoresActivos: () => Promise<Servidor[]>;
  
  // Funciones adicionales
  cambiarEstado: (servidorId: number, nuevoEstado: EstadoServidor) => Promise<boolean>;
  buscarServidores: (searchTerm: string) => Promise<void>;
  obtenerEstadisticas: () => Promise<any>;
  
  // Funciones de estado
  setServidorActual: (servidor: Servidor | null) => void;
  limpiarError: () => void;
  refrescar: () => Promise<void>;
}

const filtrosIniciales: UseServidoresFilters = {
  search: '',
  ambiente: undefined,
  tipoServidor: undefined,
  proveedor: undefined,
  sistemaOperativo: undefined,
  estado: undefined,
  responsableTecnico: undefined
};

export const useServidores = (): UseServidoresReturn => {
  // 🔧 REPLICANDO LÓGICA EXITOSA DE USUARIOS: Obtener organizationInfo completo
  const { user, organization, organizationInfo } = useAuth();
  
  // Estados principales
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [servidorActual, setServidorActual] = useState<Servidor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔧 VALIDACIÓN IGUAL QUE USUARIOS: verificar hasOrganization Y id
  const hasValidOrganization = organizationInfo.hasOrganization && organizationInfo.id;
  
  if (!hasValidOrganization) {
    // No hay organización válida - manejar como Usuarios
  }
  
  // Estados de filtros
  const [filters, setFiltersState] = useState<UseServidoresFilters>(filtrosIniciales);


  // Función para manejar errores
  const handleError = useCallback((error: any, mensaje: string) => {
    console.error(mensaje, error);
    
    // Priorizar el mensaje específico del backend si está disponible
    let errorMessage = mensaje;

    // Extraer potencial payload de Axios
    const respData = error?.response?.data;

    if (respData?.errors && Array.isArray(respData.errors) && respData.errors.length > 0) {
      // Si viene de Axios con estructura ApiResponse y contiene errors[], usar el primero
      errorMessage = respData.errors[0];
    } else if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      // Si error tiene una propiedad errors que es un array, usar el primero
      errorMessage = error.errors[0];
    } else if (error && Array.isArray(error) && error.length > 0) {
      // Si error es un array de errores, usar el primero
      errorMessage = error[0];
    } else if (respData?.message) {
      // Mensaje del backend
      errorMessage = respData.message;
    } else if (error?.message) {
      // Mensaje del objeto Error
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    AlertService.error(errorMessage);
  }, []);

  // Función para limpiar errores
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Función para obtener todos los servidores
  const obtenerServidores = useCallback(async () => {
    if (!hasValidOrganization) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await servidoresService.getAllServidores({ organizationId: organizationInfo.id! });
      
      if (response.success && response.data) {
        // Mapear ServidorApi[] a Servidor[] 
        const servidoresMapeados = response.data.map(servidorApi => {
          const servidorMapeado = mapServidorApiToServidor(servidorApi);
          return {
            ...servidorMapeado,
            organizacionId: organizationInfo.id!
          };
        });
        setServidores(servidoresMapeados);
      } else {
        handleError(response.errors, 'Error al obtener servidores');
      }
    } catch (error) {
      handleError(error, 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, [organizationInfo.id, handleError]);

  // Función para obtener un servidor por ID
  const obtenerServidorPorId = useCallback(async (id: number): Promise<Servidor | null> => {
    if (!organizationInfo.id) {
      console.error('obtenerServidorPorId: organizationInfo.id no disponible');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await servidoresService.getServidorById({ 
        servidorId: id,
        organizationId: organizationInfo.id,
        includeDeleted: false
      });
      
      if (response.success && response.data) {
        // Mapear ServidorApi a Servidor
        const servidorMapeado = {
          ...mapServidorApiToServidor(response.data),
          organizacionId: organizationInfo.id!
        };
        return servidorMapeado;
      } else {
        handleError(response.errors, 'Error al obtener servidor');
        return null;
      }
    } catch (error) {
      handleError(error, 'Error al conectar con el servidor');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, organizationInfo.id]);

  // Función para crear un nuevo servidor
  const crearServidor = useCallback(async (data: CreateServidorDto): Promise<Servidor | null> => {
    if (!organizationInfo.id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mapear CreateServidorDto a CreateServidorRequest
      const createRequest = {
        organizationId: organizationInfo.id,
        codigo: data.codigoServidor || '',
        nombre: data.nombreServidor,
        tipo: mapTipoServidorToBackend(data.tipoServidor),
        ambiente: mapAmbienteToBackend(data.ambiente),
        sistemaOperativo: mapSistemaOperativoToBackend(data.sistemaOperativo),
        ip: data.direccionIP || '',
        estado: mapEstadoToBackend(data.estado || EstadoServidor.ACTIVO),
        creadoPor: 1 // TODO: Get from auth context
      };
      
      const response = await servidoresService.createServidor(createRequest);
      
      if (response.success && response.data) {
        // response.data es el ID del servidor creado, necesitamos obtener el servidor completo
        const servidorId = response.data;
        const servidorCompleto = await obtenerServidorPorId(servidorId);
        
        if (servidorCompleto) {
          setServidores(prev => [...prev, servidorCompleto]);
          AlertService.success('Servidor creado exitosamente');
          return servidorCompleto;
        } else {
          throw new Error('No se pudo obtener el servidor creado');
        }
      } else {
        handleError(response.errors, 'Error al crear servidor');
        return null;
      }
    } catch (error) {
      handleError(error, 'Error al conectar con el servidor');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, organizationInfo.id]);

  // Función para actualizar un servidor
  const actualizarServidor = useCallback(async (data: UpdateServidorDto): Promise<Servidor | null> => {
    if (!organizationInfo.id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mapear UpdateServidorDto a UpdateServidorRequest
      const updateRequest = {
        id: data.servidorId,
        organizationId: organizationInfo.id,
        codigo: data.codigoServidor || '',
        nombre: data.nombreServidor,
        tipo: mapTipoServidorToBackend(data.tipoServidor),
        ambiente: mapAmbienteToBackend(data.ambiente),
        sistemaOperativo: mapSistemaOperativoToBackend(data.sistemaOperativo),
        ip: data.direccionIP || '',
        estado: mapEstadoToBackend(data.estado),
        actualizadoPor: 1 // TODO: Get from auth context
      };
      
      const response = await servidoresService.updateServidor(updateRequest);
      
      if (response.success && response.data) {
        // response.data es boolean, necesitamos obtener el servidor actualizado
        const servidorActualizado = await obtenerServidorPorId(data.servidorId);
        
        if (servidorActualizado) {
          setServidores(prev => 
            prev.map(servidor => 
              servidor.servidorId === data.servidorId ? servidorActualizado : servidor
            )
          );
          if (servidorActual?.servidorId === data.servidorId) {
            setServidorActual(servidorActualizado);
          }
          AlertService.success('Servidor actualizado exitosamente');
          return servidorActualizado;
        } else {
          throw new Error('No se pudo obtener el servidor actualizado');
        }
      } else {
        handleError(response.errors, 'Error al actualizar servidor');
        return null;
      }
    } catch (error) {
      handleError(error, 'Error al conectar con el servidor');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, servidorActual, organizationInfo.id]);

  // Función para eliminar un servidor
  const eliminarServidor = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    // ✅ VALIDACIÓN: Verificar que tenemos organizationId válido
    if (!organizationInfo.id) {
      handleError(['Organización no válida'], 'Error de organización');
      setLoading(false);
      return false;
    }
    
    try {
      const deleteRequest = {
        servidorId: id,
        organizationId: organizationInfo.id, // ✅ AGREGADO: organizationId requerido
        forceDelete: false,
        reasignarSistemas: false,
        motivo: 'Eliminado desde interfaz de usuario',
        eliminadoPor: 1 // TODO: Get from auth context
      };
      
      const response = await servidoresService.deleteServidor(deleteRequest);
      
      if (response.success) {
        setServidores(prev => prev.filter(servidor => servidor.servidorId !== id));
        if (servidorActual?.servidorId === id) {
          setServidorActual(null);
        }
        AlertService.success('Servidor eliminado exitosamente');
        return true;
      } else {
        handleError(response.errors, 'Error al eliminar servidor');
        return false;
      }
    } catch (error) {
      handleError(error, 'Error al conectar con el servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, servidorActual, organizationInfo.id]); // ✅ AGREGADO: organizationInfo.id a dependencias

  // Función para obtener servidores activos (simplificada)
  const obtenerServidoresActivos = useCallback(async (): Promise<Servidor[]> => {
    if (!organizationInfo.id) {
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await servidoresService.getServidoresPaginated({
        organizationId: organizationInfo.id,
        soloActivos: true,
        page: 1,
        pageSize: 100
      });
      
      if (response.success && response.data?.data) {
        // Mapear ServidorDto[] a Servidor[]
        const servidoresMapeados = response.data.data.map(dto => {
          const servidorMapeado = mapServidorDtoToServidor(dto);
          return {
            ...servidorMapeado,
            organizacionId: organizationInfo.id!
          };
        });
        
        return servidoresMapeados;
      } else {
        handleError(response.errors, 'Error al obtener servidores activos');
        return [];
      }
    } catch (error) {
      handleError(error, 'Error al conectar con el servidor');
      return [];
    } finally {
      setLoading(false);
    }
  }, [organizationInfo.id, handleError]);

  // Función para actualizar filtros
  const setFilters = useCallback((newFilters: Partial<UseServidoresFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Función para limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltersState(filtrosIniciales);
  }, []);

  // Función para refrescar datos
  const refrescar = useCallback(async () => {
    await obtenerServidores();
  }, [obtenerServidores]);

  // Función para cambiar estado de un servidor
  const cambiarEstado = useCallback(async (servidorId: number, nuevoEstado: EstadoServidor): Promise<boolean> => {
    if (!organizationInfo.id) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Primero obtenemos el servidor actual para tener todos los datos
      const servidorActual = servidores.find(s => s.servidorId === servidorId);
      if (!servidorActual) {
        throw new Error('Servidor no encontrado');
      }

      // Preparar los datos de actualización
      const updateRequest = {
        id: servidorId,
        organizationId: organizationInfo.id,
        codigo: servidorActual.codigoServidor || '',
        nombre: servidorActual.nombreServidor,
        tipo: mapTipoServidorToBackend(servidorActual.tipoServidor),
        ambiente: mapAmbienteToBackend(servidorActual.ambiente),
        sistemaOperativo: mapSistemaOperativoToBackend(servidorActual.sistemaOperativo),
        ip: servidorActual.direccionIP || '',
        estado: mapEstadoToBackend(nuevoEstado),
        actualizadoPor: 1 // TODO: Get from auth context
      };
      
      const response = await servidoresService.updateServidor(updateRequest);
      
      if (response.success) {
        // Actualizar el estado local
        setServidores(prev => 
          prev.map(servidor => 
            servidor.servidorId === servidorId 
              ? { ...servidor, estado: nuevoEstado } 
              : servidor
          )
        );
        return true;
      } else {
        handleError(response.errors, 'Error al cambiar estado del servidor');
        return false;
      }
    } catch (error) {
      handleError(error, 'Error al cambiar estado del servidor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [organizationInfo.id, servidores, handleError]);

  // Función para buscar servidores (usando búsqueda paginada)
  const buscarServidores = useCallback(async (searchTerm: string): Promise<void> => {
    if (!organizationInfo.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await servidoresService.getServidoresPaginated({
        organizationId: organizationInfo.id,
        searchTerm: searchTerm,
        page: 1,
        pageSize: 100
      });
      
      if (response.success && response.data?.data) {
        // Mapear ServidorDto[] a Servidor[]
        const servidoresMapeados = response.data.data.map(dto => {
          const servidorMapeado = mapServidorDtoToServidor(dto);
          return {
            ...servidorMapeado,
            organizacionId: organizationInfo.id!
          };
        });
        setServidores(servidoresMapeados);
      } else {
        handleError(response.errors, 'Error al buscar servidores');
      }
    } catch (error) {
      handleError(error, 'Error al buscar servidores');
    } finally {
      setLoading(false);
    }
  }, [organizationInfo.id, handleError]);

  // Función para obtener estadísticas de servidores
  const obtenerEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await servidoresService.getEstadisticasServidores();
      
      if (response.success && response.data) {
        return response.data;
      } else {
        handleError(response.errors, 'Error al obtener estadísticas');
        return null;
      }
    } catch (error) {
      handleError(error, 'Error al obtener estadísticas');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ❌ FILTRADO LOCAL ELIMINADO: Solo usamos búsqueda del servidor

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (organizationInfo.id) {
      obtenerServidores();
    }
  }, [organizationInfo.id, obtenerServidores]);

  return {
    // Estados
    servidores,
    servidorActual,
    loading,
    error,
    
    // Filtros
    filters,
    
    // Funciones CRUD
    obtenerServidores,
    obtenerServidorPorId,
    crearServidor,
    actualizarServidor,
    eliminarServidor,
    
    // Funciones de filtrado
    setFilters,
    limpiarFiltros,
    
    // Funciones de utilidad
    obtenerServidoresActivos,
    
    // Funciones adicionales
    cambiarEstado,
    buscarServidores,
    obtenerEstadisticas,
    
    // Funciones de estado
    setServidorActual,
    limpiarError,
    refrescar
  };
};