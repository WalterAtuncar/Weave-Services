import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useFamiliasSistema } from './useFamiliasSistema';
import { AlertService } from '../components/ui/alerts/AlertService';

// Servicios
import { tipoSistemaService } from '../services/tipo-sistema.service';
import { servidoresService } from '../services/servidores.service';
import { sistemasService } from '../services/sistemas.service';

// Tipos
import { TipoSistemaOption } from '../services/types/tipo-sistema.types';
import { FamiliaSistemaOption } from '../services/types/familia-sistema.types';
import { Servidor } from '../models/Servidores';
import { Sistema, EstadoSistema } from '../models/Sistemas';
import { ServidorDto } from '../services/types/servidores.types';
import { Sistema as SistemaDto } from '../services/types/sistemas.types';

interface SystemFormData {
  tiposSistemaActivos: TipoSistemaOption[];
  familiasSistemaActivas: FamiliaSistemaOption[];
  servidoresActivos: Servidor[];
  sistemasActivos: Sistema[];
}

interface UseSystemFormDataReturn {
  data: SystemFormData;
  loading: boolean;
  error: string | null;
  reloadData: () => Promise<void>;
  isReady: boolean; // Indica si todos los datos están listos
}

// Función para mapear ServidorDto a Servidor (modelo)
const mapServidorDtoToServidor = (servidorDto: ServidorDto, organizacionId: number): Servidor => {
  return {
    servidorId: servidorDto.id,
    organizacionId: organizacionId,
    codigoServidor: servidorDto.codigo,
    nombreServidor: servidorDto.nombre,
    descripcion: null,
    tipoServidor: servidorDto.tipo as any,
    sistemaOperativo: 'Windows Server 2019', // Default
    ambiente: servidorDto.ambiente as any,
    direccionIP: servidorDto.ip,
    puerto: null,
    cpu: null,
    memoriaRAM: null,
    almacenamiento: null,
    proveedor: 1, // Default ON_PREMISE
    ubicacionFisica: null,
    responsableTecnico: null,
    fechaInstalacion: null,
    fechaUltimoMantenimiento: null,
    version: 1,
    estado: servidorDto.estado as any,
    creadoPor: servidorDto.creadoPor,
    fechaCreacion: servidorDto.fechaCreacion,
    actualizadoPor: servidorDto.actualizadoPor,
    fechaActualizacion: servidorDto.fechaActualizacion,
    registroEliminado: false,
    sistemasAsignados: servidorDto.totalSistemas,
    cantidadSistemas: servidorDto.totalSistemas
  };
};

// Función para mapear SistemaDto (del servicio) a Sistema (del modelo)
const mapSistemaDtoToSistema = (sistemaDto: SistemaDto | any, organizacionId: number): Sistema => {
  // Soportar distintas formas del backend/local JSON
  const id = sistemaDto?.sistemaId ?? sistemaDto?.id;
  const codigo = sistemaDto?.codigoSistema ?? sistemaDto?.codigo;
  const nombre = sistemaDto?.nombreSistema ?? sistemaDto?.nombre;
  const descripcion = sistemaDto?.funcionPrincipal ?? sistemaDto?.descripcion ?? null;
  const parentId = sistemaDto?.sistemaParentId ?? sistemaDto?.sistemaDepende ?? null;
  const familia = sistemaDto?.familiaSistemaId ?? sistemaDto?.familiaSistema ?? 1;
  const estadoRaw = sistemaDto?.estado ?? sistemaDto?.estado_registro ?? 1;
  const creadoPor = sistemaDto?.creadoPor ?? null;
  const actualizadoPor = sistemaDto?.actualizadoPor ?? null;
  const fechaCreacion = sistemaDto?.fechaCreacion ?? sistemaDto?.fecha_creacion ?? new Date().toISOString();
  const fechaActualizacion = sistemaDto?.fechaActualizacion ?? sistemaDto?.fecha_actualizacion ?? null;
  const url = sistemaDto?.url ?? null;
  const idServidor = sistemaDto?.idServidor ?? (Array.isArray(sistemaDto?.servidorIds) ? sistemaDto.servidorIds[0] : undefined);
  const tieneGobernanzaPropia = Boolean(sistemaDto?.tieneGobernanzaPropia);

  return {
    sistemaId: id,
    organizacionId: organizacionId,
    codigoSistema: codigo ?? null,
    nombreSistema: nombre ?? '',
    funcionPrincipal: descripcion,
    sistemaDepende: parentId ?? null,
    tipoSistema: 1, // Valor por defecto, se puede ajustar según necesidad
    familiaSistema: familia,
    tieneGobernanzaPropia,
    gobernanzaId: null, // Se establecerá desde la tabla intermedia GobernanzaEntidad
    version: 1, // Valor por defecto
    estado: Number(estadoRaw) as EstadoSistema,
    creadoPor: creadoPor,
    fechaCreacion,
    actualizadoPor: actualizadoPor,
    fechaActualizacion,
    registroEliminado: false,
    url,
    servidorIds: idServidor ? [idServidor] : undefined,
    sistemaDepende_Nombre: undefined,
    modulos: undefined,
    sistemasHijos: undefined
  };
};

export const useSystemFormData = (): UseSystemFormDataReturn => {
  const { organizationInfo } = useAuth();
  const loadingRef = useRef(false);
  
  // Usar el hook de familias de sistemas que ya maneja organizationId
  const { 
    familiasSistemaActivas, 
    loading: loadingFamilias, 
    error: errorFamilias 
  } = useFamiliasSistema();
  
  const [data, setData] = useState<SystemFormData>({
    tiposSistemaActivos: [],
    familiasSistemaActivas: [],
    servidoresActivos: [],
    sistemasActivos: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const loadAllData = useCallback(async () => {
    // Resolver organizationId con fallback a localStorage
    const resolveOrganizationId = (): number | null => {
      if (organizationInfo?.id && organizationInfo.id > 0) return organizationInfo.id;
      try {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const orgId = session?.organizacion?.organizacionId;
          if (orgId && orgId > 0) return orgId;
        }
      } catch (e) {
        console.error('❌ [useSystemFormData] Error leyendo userSession de localStorage:', e);
      }
      return null;
    };

    const orgId = resolveOrganizationId();
    if (!orgId) {
      console.warn('🔍 useSystemFormData - No organization ID available (ni en contexto ni en localStorage)');
      return;
    }

    // Evitar llamadas múltiples usando ref
    if (loadingRef.current) {
      
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setIsReady(false);
    
    try {

      
      // Ejecutar llamadas en paralelo (familias se obtienen del hook)
      const [
        tiposResponse
      ] = await Promise.all([
        tipoSistemaService.getTiposSistemaActivos()
      ]);



      // Obtener servidores y sistemas por separado para mejor debugging
      let servidoresResponse, sistemasResponse;

      try {
        servidoresResponse = await servidoresService.getServidoresPaginated({
          organizationId: orgId,
          page: 1,
          pageSize: 100,
          estado: 1 // Solo activos
        });
      } catch (error) {
        console.error('❌ Error cargando servidores:', error);
        servidoresResponse = { success: false, message: 'Error cargando servidores', data: null };
      }

      try {
        // Strategic log: inicio de la llamada a cargar sistemas
        console.groupCollapsed('🧭 [SystemForm] Carga de sistemas activos');
        console.time('[SystemForm] Tiempo carga sistemas');
        console.log('🔄 Solicitando sistemas al backend...', { organizacionId: orgId });

        sistemasResponse = await sistemasService.getSistemasPaginated({
          organizacionId: orgId,
          page: 1,
          pageSize: 100,
          estado: 1 // Solo activos desde el backend
        });
        console.log('📥 Respuesta recibida de sistemas');
      } catch (error) {
        console.error('❌ Error cargando sistemas:', error);
        sistemasResponse = { success: false, message: 'Error cargando sistemas', data: null };
      }

      // Procesar datos incluso si algunas llamadas fallan
      const tiposSistemaActivos = tiposResponse.success ? (tiposResponse.data || []) : [];
      

      
      // Procesar datos de servidores
      let servidoresActivos: Servidor[] = [];
      if (servidoresResponse.success && servidoresResponse.data?.data) {
        servidoresActivos = servidoresResponse.data.data.map((servidor: ServidorDto) => 
          mapServidorDtoToServidor(servidor, orgId)
        );
      }

      // Procesar datos de sistemas (filtrar solo activos) con tolerancia a distintas formas del backend
      let sistemasActivos: Sistema[] = [];
      if (sistemasResponse.success && sistemasResponse.data) {
        const responseData: any = sistemasResponse.data;
        const sistemasArray: SistemaDto[] = Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray(responseData?.items)
          ? responseData.items
          : Array.isArray(responseData)
          ? responseData
          : [];

        console.log('📦 Sistemas devueltos por backend:', { total: sistemasArray.length });

        sistemasActivos = sistemasArray
          .filter((s: any) => s && (Number(s.estado ?? s.estado_registro ?? 1) === 1)) // 1 = Activo en el DTO
          .map((sistemaDto: SistemaDto) => mapSistemaDtoToSistema(sistemaDto, orgId));

        console.log('✅ Sistemas activos mapeados para el formulario:', { totalActivos: sistemasActivos.length, ejemplos: sistemasActivos.slice(0,3).map(x => ({ id: x.sistemaId, nombre: x.nombreSistema })) });
        console.timeEnd('[SystemForm] Tiempo carga sistemas');
        console.groupEnd();
        }

      // Actualizar estado con todos los datos (familias vienen del hook)
      setData(prev => {
        const newData = {
          tiposSistemaActivos,
          // Mantener las familias del hook si ya están cargadas, sino usar las del estado previo
          familiasSistemaActivas: familiasSistemaActivas.length > 0 ? familiasSistemaActivas : prev.familiasSistemaActivas,
          servidoresActivos,
          sistemasActivos
        };
        return newData;
      });

      setIsReady(true);
      


    } catch (error: any) {
      const errorMessage = error.message || 'Error crítico cargando datos del formulario';
      setError(errorMessage);
      console.error('❌ useSystemFormData - Error crítico:', error);
      setIsReady(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [organizationInfo?.id]); // Solo depender del orgId

  // Cargar datos solo una vez cuando organizationInfo esté disponible
  useEffect(() => {
    // Llamar siempre; internamente se resuelve el organizationId (con fallback a localStorage)
    loadAllData();
  }, [organizationInfo?.id]); // Solo depender del orgId

  // Actualizar familias cuando cambien en el hook
  useEffect(() => {
    // Siempre actualizar las familias, incluso si están vacías (para reflejar el estado real)
    setData(prev => {
      // Solo actualizar si realmente hay un cambio
      if (prev.familiasSistemaActivas.length !== familiasSistemaActivas.length) {
        return {
          ...prev,
          familiasSistemaActivas
        };
      }
      return prev;
    });
  }, [familiasSistemaActivas]);

  return {
    data,
    loading: loading || loadingFamilias,
    error: error || errorFamilias,
    reloadData: loadAllData,
    isReady: isReady && !loadingFamilias
  };
};