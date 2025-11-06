import { useState, useEffect, useCallback, useMemo } from 'react';
import { familiaSistemaService } from '../services/familia-sistema.service';
import { 
  FamiliaSistemaOption,
  GetFamiliasSistemaActivasResponseData
} from '../services/types/familia-sistema.types';
import { AlertService } from '../components/ui/alerts/AlertService';
import { useAuth } from './useAuth';

interface UseFamiliasSistemaReturn {
  familiasSistemaActivas: FamiliaSistemaOption[];
  loading: boolean;
  error: string | null;
  obtenerFamiliasSistemaActivas: () => Promise<void>;
}

export const useFamiliasSistema = (): UseFamiliasSistemaReturn => {
  // 🔧 Obtener organizationInfo desde useAuth siguiendo el patrón de otros hooks
  const { organizationInfo } = useAuth();
  
  // 🔒 MEMOIZAR para evitar loops infinitos
  const organizacionId = useMemo(() => organizationInfo?.id, [organizationInfo?.id]);
  const hasValidOrganization = useMemo(() => 
    Boolean(organizationInfo?.hasOrganization && organizacionId), 
    [organizationInfo?.hasOrganization, organizacionId]
  );
  
  const [familiasSistemaActivas, setFamiliasSistemaActivas] = useState<FamiliaSistemaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🔧 Función para obtener organizationId con fallback a localStorage
  const getOrganizationId = useCallback((): number => {
    // Intentar con organizationInfo primero
    if (organizacionId && organizacionId > 0) {
      return organizacionId;
    }
    
    // Fallback a localStorage
    try {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const orgId = session?.organizacion?.organizacionId;
        if (orgId && orgId > 0) {
          return orgId;
        }
      }
    } catch (error) {
      console.error('❌ [useFamiliasSistema] Error reading from localStorage:', error);
    }
    
    console.warn('⚠️ [useFamiliasSistema] No valid organization ID found, using 0');
    return 0;
  }, [organizacionId]);

  // Función para obtener familias de sistema activas
  const obtenerFamiliasSistemaActivas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentOrganizationId = getOrganizationId();
      
      // Verificar que haya organizationId válido antes de hacer la llamada
      if (!currentOrganizationId || currentOrganizationId <= 0) {
        setError("No se encontró información de organización. Por favor, inicia sesión nuevamente.");
        setFamiliasSistemaActivas([]);
        return;
      }
      // Intentar primero con el nuevo endpoint especializado por organización
      let response = await familiaSistemaService.getFamiliasSistemaActivasByOrganizacion(currentOrganizationId);
      
      // Si falla, intentar con el endpoint básico y filtrar
      if (!response.success) {
        console.warn('⚠️ [useFamiliasSistema] Endpoint especializado falló, intentando con endpoint básico');
        
        const responseBasico = await familiaSistemaService.getAllFamiliasSistema({ organizationId: currentOrganizationId });
        
        if (responseBasico.success && responseBasico.data) {
          // Filtrar solo las activas (estado = 1) y mapear al formato simplificado
          const familiasActivas: FamiliaSistemaOption[] = responseBasico.data
            .filter(familia => familia.estado === 1)
            .map(familia => ({
              id: familia.id,
              codigo: familia.codigo,
              nombre: familia.nombre,
              descripcion: familia.descripcion
            }));
          
          response = {
            success: true,
            data: familiasActivas,
            message: 'Familias cargadas con endpoint básico',
            errors: [],
            statusCode: 200,
            metadata: ''
          };
        }
      }
      
      if (response.success && response.data) {
        setFamiliasSistemaActivas(response.data);
      } else {
        const errorMessage = response.message || 'Error al cargar familias de sistema activas';
        setError(errorMessage);
        console.error('❌ useFamiliasSistema - Error:', errorMessage);
        console.error('❌ useFamiliasSistema - Response completa:', response);
        AlertService.error('Error al cargar familias de sistema: ' + errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Error de conexión al cargar familias de sistema';
      setError(errorMessage);
      console.error('❌ useFamiliasSistema - Error de conexión:', error);
      AlertService.error('Error de conexión: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getOrganizationId]);

  // Cargar familias de sistema activas al montar el hook y cuando cambie la organización
  useEffect(() => {
    if (hasValidOrganization) {
      obtenerFamiliasSistemaActivas();
    }
  }, [obtenerFamiliasSistemaActivas, hasValidOrganization]);

  return {
    familiasSistemaActivas,
    loading,
    error,
    obtenerFamiliasSistemaActivas
  };
};