import { useState, useCallback } from 'react';
import { servidoresService } from '../services/servidores.service';
import { ServidorDto } from '../services/types/servidores.types';
import { 
  Servidor, 
  TipoServidor,
  AmbienteServidor,
  EstadoServidor,
  ProveedorCloud
} from '../models/Servidores';
import { useAuth } from './useAuth';
import { AlertService } from '../components/ui/alerts/AlertService';

// Función para mapear ServidorDto (API) a Servidor (modelo)
const mapServidorDtoToServidor = (servidorDto: ServidorDto): Servidor => {
  return {
    servidorId: servidorDto.id,
    organizacionId: 0, // Se asignará desde el contexto
    codigoServidor: servidorDto.codigo,
    nombreServidor: servidorDto.nombre,
    descripcion: null,
    tipoServidor: servidorDto.tipo as TipoServidor,
    sistemaOperativo: 'Ubuntu 20.04', // Default, se podría mapear mejor
    ambiente: servidorDto.ambiente as AmbienteServidor,
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
    estado: servidorDto.estado as EstadoServidor,
    creadoPor: servidorDto.creadoPor,
    fechaCreacion: servidorDto.fechaCreacion,
    actualizadoPor: servidorDto.actualizadoPor,
    fechaActualizacion: servidorDto.fechaActualizacion,
    registroEliminado: false,
    sistemasAsignados: servidorDto.totalSistemas,
    cantidadSistemas: servidorDto.totalSistemas
  };
};

interface UseServidoresActivosReturn {
  servidoresActivos: Servidor[];
  loading: boolean;
  error: string | null;
  obtenerServidoresActivos: () => Promise<Servidor[]>;
  limpiarError: () => void;
}

export const useServidoresActivos = (): UseServidoresActivosReturn => {
  // Obtener organizationId desde useAuth
  const { organizationInfo } = useAuth();
  
  // Estados
  const [servidoresActivos, setServidoresActivos] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar errores
  const handleError = useCallback((error: any, mensaje: string) => {
    console.error(mensaje, error);
    
    // Priorizar el mensaje específico del backend si está disponible
    let errorMessage = mensaje;
    
    if (error && Array.isArray(error) && error.length > 0) {
      // Si error es un array de errores, usar el primero
      errorMessage = error[0];
    } else if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      // Si error tiene una propiedad errors que es un array, usar el primero
      errorMessage = error.errors[0];
    } else if (error?.message) {
      // Si error tiene una propiedad message, usarla
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    AlertService.error(errorMessage);
  }, []);

  // Función para limpiar errores
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // Función para obtener servidores activos
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
        

        setServidoresActivos(servidoresMapeados);
        return servidoresMapeados;
      } else {

        handleError(response.errors, 'Error al obtener servidores activos');
        return [];
      }
    } catch (error) {
      console.error('❌ useServidoresActivos - Error en obtenerServidoresActivos:', error);
      handleError(error, 'Error al conectar con el servidor');
      return [];
    } finally {
      setLoading(false);
    }
  }, [organizationInfo.id, handleError]);

  return {
    servidoresActivos,
    loading,
    error,
    obtenerServidoresActivos,
    limpiarError
  };
};