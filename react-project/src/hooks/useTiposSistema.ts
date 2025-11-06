import { useState, useEffect, useCallback } from 'react';
import { tipoSistemaService } from '../services/tipo-sistema.service';
import { 
  TipoSistemaOption,
  GetTiposSistemaActivosResponseData
} from '../services/types/tipo-sistema.types';
import { AlertService } from '../components/ui/alerts/AlertService';

interface UseTiposSistemaReturn {
  tiposSistemaActivos: TipoSistemaOption[];
  loading: boolean;
  error: string | null;
  obtenerTiposSistemaActivos: () => Promise<void>;
}

export const useTiposSistema = (): UseTiposSistemaReturn => {
  const [tiposSistemaActivos, setTiposSistemaActivos] = useState<TipoSistemaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener tipos de sistema activos
  const obtenerTiposSistemaActivos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {

      const response = await tipoSistemaService.getTiposSistemaActivos();
      

      
      if (response.success && response.data) {
        setTiposSistemaActivos(response.data);

      } else {
        const errorMessage = response.message || 'Error al cargar tipos de sistema activos';
        setError(errorMessage);
        console.error('❌ useTiposSistema - Error:', errorMessage);
        AlertService.error('Error al cargar tipos de sistema: ' + errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Error de conexión al cargar tipos de sistema';
      setError(errorMessage);
      console.error('❌ useTiposSistema - Error de conexión:', error);
      AlertService.error('Error de conexión: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar tipos de sistema activos al montar el hook
  useEffect(() => {
    obtenerTiposSistemaActivos();
  }, [obtenerTiposSistemaActivos]);

  return {
    tiposSistemaActivos,
    loading,
    error,
    obtenerTiposSistemaActivos
  };
};