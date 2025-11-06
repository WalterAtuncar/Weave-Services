import { useState, useEffect, useCallback } from 'react';
import { tipoEntidadService } from '../services';
import { TipoEntidad as ApiTipoEntidad } from '../services/types/tipo-entidad.types';
import { TipoEntidad as ComponentTipoEntidad } from '../components/ui/related-entities/types';

interface UseTiposEntidadReturn {
  tiposEntidad: ComponentTipoEntidad[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar tipos de entidad desde la API
 * Convierte los datos de la API al formato esperado por los componentes
 */
export const useTiposEntidad = (): UseTiposEntidadReturn => {
  const [tiposEntidad, setTiposEntidad] = useState<ComponentTipoEntidad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Mapea los tipos de entidad de la API al formato del componente
   */
  const mapApiToComponent = (apiTipos: ApiTipoEntidad[]): ComponentTipoEntidad[] => {
    return apiTipos.map(tipo => ({
      id: tipo.tipoEntidadId.toString(),
      nombre: tipo.tipoEntidadNombre,
      icono: getIconForTipoEntidad(tipo.tipoEntidadCodigo)
    }));
  };

  /**
   * Obtiene el icono apropiado basado en el código del tipo de entidad
   */
  const getIconForTipoEntidad = (codigo: string): string => {
    const iconMap: Record<string, string> = {
      'SISTEMA': 'Server',
      'PROCESO': 'Workflow',
      'DOCUMENTO': 'FileText',
      'USUARIO': 'User',
      'ORGANIZACION': 'Building',
      'POSICION': 'UserCheck',
      'UNIDAD_ORG': 'Users'
    };
    
    return iconMap[codigo] || 'Circle';
  };

  /**
   * Carga los tipos de entidad desde la API
   */
  const fetchTiposEntidad = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tipoEntidadService.getAllTiposEntidad({ includeDeleted: false });
      
      if (response.success && response.data) {
        // Filtrar solo los tipos activos
        const tiposActivos = response.data.filter(tipo => tipo.estado === 1 && !tipo.registroEliminado);
        const tiposMapeados = mapApiToComponent(tiposActivos);
        setTiposEntidad(tiposMapeados);
      } else {
        setError(response.message || 'Error al cargar tipos de entidad');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar tipos de entidad';
      setError(errorMessage);
      console.error('Error en useTiposEntidad:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Función para recargar los datos
   */
  const refetch = useCallback(async () => {
    await fetchTiposEntidad();
  }, [fetchTiposEntidad]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchTiposEntidad();
  }, [fetchTiposEntidad]);

  return {
    tiposEntidad,
    loading,
    error,
    refetch
  };
};