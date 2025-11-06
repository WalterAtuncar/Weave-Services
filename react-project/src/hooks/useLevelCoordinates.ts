import { useState, useCallback, useEffect, useRef } from 'react';

interface LevelCoordinate {
  level: number;
  elementId: string;
  x: number;
  y: number;
  lastUpdated: number;
}

interface LevelCoordinatesMap {
  [level: number]: LevelCoordinate;
}

export interface UseLevelCoordinatesReturn {
  levelCoordinates: LevelCoordinatesMap;
  updateLevelCoordinates: () => void;
  navigateToLevel: (level: number, panToPosition: (x: number, y: number, zoom?: number) => void) => boolean;
  clearLevelCoordinates: () => void;
}

export const useLevelCoordinates = (
  unidades: any[],
  isFilterActive: boolean,
  filteredUnits: Set<number>
): UseLevelCoordinatesReturn => {
  const [levelCoordinates, setLevelCoordinates] = useState<LevelCoordinatesMap>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función helper para obtener nivel de unidad
  const getUnitLevel = useCallback((unitId: number, depth: number = 0): number => {
    if (depth > 10) return depth; // Prevenir bucles infinitos
    
    const unit = unidades.find(u => u.unidadesOrgId === unitId);
    if (!unit || !unit.unidadPadreId) return depth;
    
    return getUnitLevel(unit.unidadPadreId, depth + 1);
  }, [unidades]);

  // Función para obtener el primer elemento de cada nivel
  const getFirstElementByLevel = useCallback(() => {
    const levelElements: { [level: number]: { unitId: number; elementId: string } } = {};
    
    // Obtener unidades a considerar (filtradas o todas)
    const unidadesToConsiderar = isFilterActive && filteredUnits.size > 0
      ? unidades.filter(unidad => filteredUnits.has(unidad.unidadesOrgId))
      : unidades;

    // Agrupar por nivel y encontrar el primer elemento de cada nivel
    unidadesToConsiderar.forEach(unidad => {
      const level = getUnitLevel(unidad.unidadesOrgId);
      
      // Si no hay un elemento para este nivel, o si este es "menor" (por ID), usarlo
      if (!levelElements[level] || unidad.unidadesOrgId < levelElements[level].unitId) {
        levelElements[level] = {
          unitId: unidad.unidadesOrgId,
          elementId: `unit-${unidad.unidadesOrgId}`
        };
      }
    });

    return levelElements;
  }, [unidades, isFilterActive, filteredUnits, getUnitLevel]);

  // Función para actualizar coordenadas de niveles
  const updateLevelCoordinates = useCallback(() => {
    // Cancelar timeout anterior si existe
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Usar timeout para permitir que el DOM se actualice
    updateTimeoutRef.current = setTimeout(() => {
      try {
        const firstElements = getFirstElementByLevel();
        const newCoordinates: LevelCoordinatesMap = {};
        
        // Obtener contenedor del organigrama
        const container = document.querySelector('.orgChartView');
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        
        Object.entries(firstElements).forEach(([levelStr, elementInfo]) => {
          const level = parseInt(levelStr);
          const element = document.getElementById(elementInfo.elementId);
          
          if (element) {
            const rect = element.getBoundingClientRect();
            
            // Calcular coordenadas relativas al contenedor del organigrama
            const relativeX = rect.left - containerRect.left + rect.width / 2;
            const relativeY = rect.top - containerRect.top + rect.height / 2;
            
            newCoordinates[level] = {
              level,
              elementId: elementInfo.elementId,
              x: relativeX,
              y: relativeY,
              lastUpdated: Date.now()
            };
            

          } else {
            console.warn(`⚠️ [LEVEL COORDS] Elemento ${elementInfo.elementId} no encontrado en DOM`);
          }
        });
        

        setLevelCoordinates(newCoordinates);
        
      } catch (error) {
        console.warn('⚠️ [LEVEL COORDS] Error al actualizar coordenadas:', error);
      }
    }, 100); // Delay para permitir renderizado del DOM

  }, [getFirstElementByLevel]);

  // Función para navegar a un nivel específico
  const navigateToLevel = useCallback((
    level: number, 
    panToPosition: (x: number, y: number, zoom?: number) => void
  ): boolean => {
    const coordinate = levelCoordinates[level];
    
    if (!coordinate) {
      console.warn(`⚠️ [LEVEL NAV] No se encontraron coordenadas para el nivel ${level}`);
      // Intentar actualizar coordenadas y reintentarlo
      updateLevelCoordinates();
      return false;
    }

    // Verificar si el elemento aún existe (validación adicional)
    const element = document.getElementById(coordinate.elementId);
    if (!element) {
      console.warn(`⚠️ [LEVEL NAV] Elemento ${coordinate.elementId} ya no existe, actualizando coordenadas...`);
      updateLevelCoordinates();
      return false;
    }

    // Calcular posición para centrar el elemento en la vista
    const container = document.querySelector('.orgChartView');
    if (!container) return false;
    
    const containerRect = container.getBoundingClientRect();
    const centerX = (containerRect.width / 2) - coordinate.x;
    const centerY = (containerRect.height / 2) - coordinate.y;


    
    // Navegar a la posición
    panToPosition(centerX, centerY);
    
    return true;
  }, [levelCoordinates, updateLevelCoordinates]);

  // Función para limpiar coordenadas
  const clearLevelCoordinates = useCallback(() => {
    setLevelCoordinates({});
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
  }, []);

  // Efecto para actualizar coordenadas cuando cambien las unidades o filtros
  useEffect(() => {
    if (unidades.length > 0) {
      updateLevelCoordinates();
    } else {
      clearLevelCoordinates();
    }
  }, [unidades, isFilterActive, filteredUnits, updateLevelCoordinates, clearLevelCoordinates]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    levelCoordinates,
    updateLevelCoordinates,
    navigateToLevel,
    clearLevelCoordinates
  };
};