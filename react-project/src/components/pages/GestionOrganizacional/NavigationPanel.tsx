import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Search, Target, Map, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Maximize2, Navigation, Users, Building, MapPin, X, ChevronDown, Filter, 
  FilterX, Check, CheckSquare, Square
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useReactFlowNavigation } from '../../../hooks/useReactFlowNavigation';
import { Node, Edge } from 'reactflow';
import styles from './NavigationPanel.module.css';

interface NavigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Datos del organigrama
  unidades: any[];
  posiciones: any[];
  personas: any[];
  personaPosiciones: any[];
  // Funciones de navegación
  fitToScreen: () => void;
  fitContentToScreen?: () => void;
  centerOnElement: (elementId: string) => void;
  panToPosition: (x: number, y: number, zoom?: number) => void;
  panState: any;
  // Nuevas funciones de filtrado
  filteredUnits?: Set<number>;
  onFilterUnits?: (unitIds: Set<number>) => void;
  onClearFilters?: () => void;
  // 🔧 AGREGADO: Navegación por coordenadas de niveles
  levelCoordinates?: any;
  navigateToLevel?: (level: number, panToPosition: (x: number, y: number, zoom?: number) => void) => boolean;
  updateLevelCoordinates?: () => void;
  // 🆕 NUEVO: Soporte para React Flow
  useReactFlowView?: boolean;
  reactFlowInstance?: any;
  reactFlowNodes?: Node[];
  reactFlowEdges?: Edge[];
}

interface SearchResult {
  id: string;
  type: 'unidad' | 'posicion' | 'persona';
  name: string;
  subtitle: string;
  level?: number;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isOpen,
  onClose,
  unidades,
  posiciones,
  personas,
  personaPosiciones,
  fitToScreen,
  fitContentToScreen,
  centerOnElement,
  panToPosition,
  panState,
  filteredUnits = new Set(),
  onFilterUnits,
  onClearFilters,
  // 🔧 AGREGADO: Nuevas props para navegación por coordenadas
  levelCoordinates,
  navigateToLevel,
  updateLevelCoordinates,
  // 🆕 NUEVO: Props para React Flow
  useReactFlowView = false,
  reactFlowInstance,
  reactFlowNodes = [],
  reactFlowEdges = []
}) => {
  // const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showUnitFilter, setShowUnitFilter] = useState(false);
  const [selectedUnitsForFilter, setSelectedUnitsForFilter] = useState<Set<number>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 🆕 Hook para navegación en React Flow
  const reactFlowNavigation = useReactFlowNavigation(reactFlowInstance);

  // 🆕 Helpers de viewport para mini-mapa (soporta React Flow y vista clásica)
  const getCurrentViewport = useCallback(() => {
    if (useReactFlowView && reactFlowInstance && typeof reactFlowInstance.getViewport === 'function') {
      try {
        return reactFlowInstance.getViewport();
      } catch {}
    }
    const x = panState?.currentPosition?.x ?? 0;
    const y = panState?.currentPosition?.y ?? 0;
    const zoom = panState?.zoom ?? 1;
    return { x, y, zoom };
  }, [useReactFlowView, reactFlowInstance, panState]);

  const panBy = useCallback((dx: number, dy: number) => {
    if (useReactFlowView && reactFlowInstance && typeof reactFlowInstance.getViewport === 'function' && typeof reactFlowInstance.setViewport === 'function') {
      const vp = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({ x: vp.x - dx, y: vp.y - dy, zoom: vp.zoom }, { duration: 200 });
      return;
    }
    const vp = getCurrentViewport();
    panToPosition(vp.x + dx, vp.y + dy, vp.zoom);
  }, [useReactFlowView, reactFlowInstance, getCurrentViewport, panToPosition]);

  const centerView = useCallback(() => {
    if (useReactFlowView && reactFlowInstance) {
      // Centrar contenido visible en React Flow
      try { reactFlowNavigation.fitToScreen(); } catch {}
      return;
    }
    // Vista clásica
    if (typeof fitContentToScreen === 'function') {
      fitContentToScreen();
    } else {
      fitToScreen();
    }
  }, [useReactFlowView, reactFlowInstance, reactFlowNavigation, fitContentToScreen, fitToScreen]);

  // Sincronizar filtros seleccionados con los externos
  useEffect(() => {
    setSelectedUnitsForFilter(new Set(filteredUnits));
  }, [filteredUnits]);

  // Función helper para obtener texto de tipo de unidad
  const getTipoUnidadTexto = (tipoUnidad: number | string): string => {
    const tipoNumerico = typeof tipoUnidad === 'string' ? parseInt(tipoUnidad, 10) : tipoUnidad;
    const tipos = {
      1: 'Dirección', 2: 'Gerencia', 3: 'Departamento', 4: 'Área',
      5: 'Sección', 6: 'Equipo', 7: 'Grupo', 8: 'Otro'
    };
    return tipos[tipoNumerico as keyof typeof tipos] || 'Desconocido';
  };

  // Obtener nivel de unidad (para navegación por niveles)
  // Función recursiva definida como función normal para evitar problemas de hoisting
  const getUnitLevel = (unitId: number, depth?: number): number => {
    const currentDepth = depth || 0;
    
    // Prevenir bucles infinitos con límite de profundidad
    if (currentDepth > 10) {
      console.warn('Profundidad máxima alcanzada en getUnitLevel para unitId:', unitId);
      return currentDepth;
    }
    
    const unit = unidades.find(u => u.unidadesOrgId === unitId);
    if (!unit || !unit.unidadPadreId) return currentDepth;
    
    return getUnitLevel(unit.unidadPadreId, currentDepth + 1);
  };

  // Auto-focus en búsqueda cuando se abre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Generar resultados de búsqueda con filtrado aplicado
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    try {
      const results: SearchResult[] = [];
      const query = searchQuery.toLowerCase();

    // Filtrar unidades basándose en los filtros aplicados
    const unidadesToSearch = filteredUnits.size > 0 
      ? unidades.filter(unidad => filteredUnits.has(unidad.unidadesOrgId))
      : unidades;

    // Buscar en unidades filtradas
    unidadesToSearch.forEach(unidad => {
      if (unidad.nombre.toLowerCase().includes(query) || 
          unidad.nombreCorto?.toLowerCase().includes(query)) {
        results.push({
          id: `unit-${unidad.unidadesOrgId}`,
          type: 'unidad',
          name: unidad.nombre,
          subtitle: `${getTipoUnidadTexto(unidad.tipoUnidad)} • ${filteredUnits.size > 0 ? 'Filtrada' : 'Todas'}`,
          level: getUnitLevel(unidad.unidadesOrgId)
        });
      }
    });

    // Buscar en posiciones (solo de unidades filtradas si hay filtro activo)
    const posicionesToSearch = filteredUnits.size > 0
      ? posiciones.filter(posicion => filteredUnits.has(posicion.unidadesOrgId))
      : posiciones;

    posicionesToSearch.forEach(posicion => {
      if (posicion.nombre.toLowerCase().includes(query)) {
        const unidad = unidades.find(u => u.unidadesOrgId === posicion.unidadesOrgId);
        results.push({
          id: `position-${posicion.posicionId}`,
          type: 'posicion',
          name: posicion.nombre,
          subtitle: unidad ? `${unidad.nombre} ${filteredUnits.size > 0 ? '• Filtrada' : ''}` : 'Sin unidad'
        });
      }
    });

    // Buscar en personas (solo asignadas a posiciones filtradas si hay filtro activo)
    const personasToSearch = filteredUnits.size > 0
      ? personas.filter(persona => {
          const assignment = personaPosiciones.find(pp => pp.personaId === persona.personaId);
          if (!assignment) return false;
          const posicion = posiciones.find(p => p.posicionId === assignment.posicionId);
          return posicion && filteredUnits.has(posicion.unidadesOrgId);
        })
      : personas;

    personasToSearch.forEach(persona => {
      const fullName = `${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno || ''}`;
      const docNumber = persona.nroDoc ? String(persona.nroDoc) : '';
      
      if (fullName.toLowerCase().includes(query) || 
          docNumber.toLowerCase().includes(query)) {
        const assignment = personaPosiciones.find(pp => pp.personaId === persona.personaId);
        const posicion = assignment ? posiciones.find(p => p.posicionId === assignment.posicionId) : null;
        
        results.push({
          id: `person-${persona.personaId}`,
          type: 'persona',
          name: fullName,
          subtitle: posicion ? `${posicion.nombre} ${filteredUnits.size > 0 ? '• Filtrada' : ''}` : 'Sin asignación'
        });
      }
    });

      return results.slice(0, 10); // Limitar resultados
    } catch (error) {
      console.error('Error en búsqueda de NavigationPanel:', error);
      return [];
    }
  }, [searchQuery, unidades, posiciones, personas, personaPosiciones, filteredUnits]);

  // Obtener unidades por nivel (considerando filtros)
  const getUnitsByLevel = (level: number) => {
    const allUnitsAtLevel = unidades.filter(unidad => getUnitLevel(unidad.unidadesOrgId) === level);
    return filteredUnits.size > 0 
      ? allUnitsAtLevel.filter(unidad => filteredUnits.has(unidad.unidadesOrgId))
      : allUnitsAtLevel;
  };

  // Manejar selección de resultado de búsqueda
  const handleSearchSelect = (result: SearchResult) => {
    if (useReactFlowView && reactFlowInstance) {
      // Usar navegación de React Flow
      const success = reactFlowNavigation.searchAndCenter(
        result.name, 
        result.type === 'unidad' ? 'unit' : result.type === 'posicion' ? 'position' : 'person',
        reactFlowNodes,
        reactFlowEdges
      );
      
      if (!success) {
        // Fallback: intentar centrar por ID
        let nodeId = result.id;
        if (result.type === 'unidad') {
          nodeId = result.id; // ya viene como 'unit-{id}'
        } else if (result.type === 'posicion') {
          // Para posiciones, buscar la unidad que la contiene
          const posicionId = result.id.replace('position-', '');
          const posicion = posiciones.find(p => p.posicionId === parseInt(posicionId));
          if (posicion) {
            nodeId = `unit-${posicion.unidadesOrgId}`;
          }
        } else if (result.type === 'persona') {
          // Para personas, buscar la posición/unidad asociada
          const personaId = result.id.replace('person-', '');
          const assignment = personaPosiciones.find(pp => pp.personaId === parseInt(personaId));
          if (assignment) {
            const posicion = posiciones.find(p => p.posicionId === assignment.posicionId);
            if (posicion) {
              nodeId = `unit-${posicion.unidadesOrgId}`;
            }
          }
        }
        reactFlowNavigation.centerOnNode(nodeId);
      }
    } else {
      // Usar navegación clásica
      centerOnElement(result.id);
    }
    setSearchQuery('');
  };

  // Manejar navegación por nivel
  const handleLevelNavigation = (level: number) => {
    setSelectedLevel(level);
    
    if (useReactFlowView && reactFlowInstance) {
      // Usar navegación de React Flow
      reactFlowNavigation.navigateToLevel(level, reactFlowNodes);
      return;
    }
    
    // 🔧 MEJORADO: Usar navegación por coordenadas si está disponible (vista clásica)
    if (navigateToLevel && panToPosition) {
      const success = navigateToLevel(level, panToPosition);
      if (success) {
        return;
      }
      console.warn(`⚠️ [LEVEL NAV] Navegación por coordenadas falló para nivel ${level}, usando fallback`);
    }
    
    // 🔄 FALLBACK: Usar el método anterior como respaldo
    const unitsAtLevel = getUnitsByLevel(level);
    if (unitsAtLevel.length > 0) {
      centerOnElement(`unit-${unitsAtLevel[0].unidadesOrgId}`);
    } else {
      console.warn(`⚠️ [LEVEL NAV] No se encontraron unidades para el nivel ${level}`);
    }
  };

  // Obtener estadísticas por nivel (considerando filtros)
  const levelStats = useMemo(() => {
    const stats: Record<number, { units: number; positions: number; people: number }> = {};
    
    const unidadesToConsiderar = filteredUnits.size > 0
      ? unidades.filter(unidad => filteredUnits.has(unidad.unidadesOrgId))
      : unidades;
    
    unidadesToConsiderar.forEach(unidad => {
      const level = getUnitLevel(unidad.unidadesOrgId);
      if (!stats[level]) {
        stats[level] = { units: 0, positions: 0, people: 0 };
      }
      stats[level].units++;
      
      // Contar posiciones en esta unidad
      const unitPositions = posiciones.filter(p => p.unidadesOrgId === unidad.unidadesOrgId);
      stats[level].positions += unitPositions.length;
      
      // Contar personas asignadas
      unitPositions.forEach(pos => {
        const hasAssignment = personaPosiciones.some(pp => pp.posicionId === pos.posicionId);
        if (hasAssignment) stats[level].people++;
      });
    });
    
    return stats;
  }, [unidades, posiciones, personaPosiciones, filteredUnits]);

  // Manejar selección/deselección de unidades para filtrar
  const handleUnitToggle = (unitId: number) => {
    const newSelection = new Set(selectedUnitsForFilter);
    if (newSelection.has(unitId)) {
      newSelection.delete(unitId);
    } else {
      newSelection.add(unitId);
    }
    setSelectedUnitsForFilter(newSelection);
  };

  // Aplicar filtros seleccionados
  const applyFilters = () => {
    if (onFilterUnits) {
      onFilterUnits(selectedUnitsForFilter);
    }
    setShowUnitFilter(false);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedUnitsForFilter(new Set());
    if (onClearFilters) {
      onClearFilters();
    }
    setShowUnitFilter(false);
  };

  // Seleccionar todas las unidades
  const selectAllUnits = () => {
    const allUnitIds = new Set(unidades.map(u => u.unidadesOrgId));
    setSelectedUnitsForFilter(allUnitIds);
  };

  // Manejar clic fuera del panel para cerrarlo
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.navigationOverlay} onClick={handleOverlayClick}>
      <div className={styles.navigationPanel}>
        {/* Header */}
        <div className={styles.navigationHeader}>
          <div className={styles.navigationTitle}>
            <Navigation size={20} className={styles.iconPrimary} />
            <h3 className={styles.panelTitle}>Navegación Avanzada</h3>
          </div>
          <button
            onClick={onClose}
            className={`${styles.closeButton} ${styles.textSecondary}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filtros de Unidades - Nueva Sección */}
        <div className={styles.navigationSection}>
          <h4 className={styles.sectionTitle}>
            Filtrar Organigrama
          </h4>
          
          {/* Indicador de estado del filtro */}
          {filteredUnits.size > 0 && (
            <div className={styles.filterStatus}>
              <Filter size={14} />
              <div className={styles.flex1}>
                <span>{filteredUnits.size} unidad{filteredUnits.size > 1 ? 'es' : ''} seleccionada{filteredUnits.size > 1 ? 's' : ''}</span>
                <br />
                <small className={styles.mutedSmall}>
                  (+ unidades padre automáticas)
                </small>
              </div>
              <button 
                onClick={clearAllFilters}
                className={styles.textPrimary}
                title="Limpiar filtros"
              >
                <FilterX size={14} />
              </button>
            </div>
          )}
          
          <div className={styles.filterControls}>
            <button
              onClick={() => setShowUnitFilter(!showUnitFilter)}
              className={`${styles.navButton} ${showUnitFilter ? styles.primaryButton : styles.bgContent} ${styles.borderBase} ${showUnitFilter ? styles.navButtonActive : ''}`}
            >
              <Filter size={16} />
              Filtrar por Unidades
              <ChevronDown 
                size={14} 
                style={{ 
                  transform: showUnitFilter ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </button>
            
            {filteredUnits.size > 0 && (
              <button
                onClick={clearAllFilters}
                className={`${styles.navButton} ${styles.dangerButton}`}
                title="Limpiar todos los filtros"
              >
                <FilterX size={16} />
                Limpiar Filtros
              </button>
            )}
          </div>
          
          {/* Panel de selección de unidades */}
          {showUnitFilter && (
            <div className={`${styles.unitFilterPanel} ${styles.bgContent} ${styles.borderBase}`}>
              <div className={styles.filterPanelHeader}>
                <span className={styles.panelTitle}>
                  Seleccionar Unidades a Mostrar
                </span>
                <div className={styles.filterActions}>
                  <button
                    onClick={selectAllUnits}
                    className={`${styles.filterAction} ${styles.textPrimary}`}
                  >
                    <CheckSquare size={14} />
                    Todas
                  </button>
                  <button
                    onClick={() => setSelectedUnitsForFilter(new Set())}
                    className={`${styles.filterAction} ${styles.textSecondary}`}
                  >
                    <Square size={14} />
                    Ninguna
                  </button>
                </div>
              </div>
              
              {/* Nota explicativa */}
              <div className={`${styles.noteHint} ${styles.mutedSmall}`}>
                <strong>💡 Filtrado inteligente:</strong> Al seleccionar unidades hijo, se incluirán automáticamente sus unidades padre para mantener la estructura jerárquica completa.
              </div>
              
              <div className={styles.unitsList}>
                {unidades
                  .sort((a, b) => {
                    const levelA = getUnitLevel(a.unidadesOrgId);
                    const levelB = getUnitLevel(b.unidadesOrgId);
                    if (levelA !== levelB) return levelA - levelB;
                    return a.nombre.localeCompare(b.nombre);
                  })
                  .map(unidad => {
                    const isSelected = selectedUnitsForFilter.has(unidad.unidadesOrgId);
                    const level = getUnitLevel(unidad.unidadesOrgId);
                    
                    return (
                      <div
                        key={unidad.unidadesOrgId}
                        className={`${styles.unitFilterItem} ${isSelected ? styles.unitFilterItemSelected : ''}`}
                        onClick={() => handleUnitToggle(unidad.unidadesOrgId)}
                        style={{ paddingLeft: `${0.75 + (level * 1)}rem` }}
                      >
                        <div className={styles.unitCheckbox}>
                          {isSelected ? (
                            <CheckSquare size={16} className={styles.iconPrimary} />
                          ) : (
                            <Square size={16} className={styles.iconMuted} />
                          )}
                        </div>
                        <div className={styles.unitInfo}>
                          <span className={styles.unitName}>
                            {unidad.nombre}
                          </span>
                          <span className={`${styles.unitType} ${styles.textSecondary}`}>
                            {getTipoUnidadTexto(unidad.tipoUnidad)} • Nivel {level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              <div className={styles.filterPanelActions}>
                <button
                  onClick={() => setShowUnitFilter(false)}
                  className={`${styles.filterCancelButton} ${styles.textSecondary}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={applyFilters}
                  className={`${styles.filterApplyButton} ${styles.primaryButton}`}
                >
                  <Check size={16} />
                  Aplicar Filtros ({selectedUnitsForFilter.size})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Herramientas de navegación rápida */}
        <div className={styles.navigationSection}>
          <h4 className={styles.sectionTitle}>
            Herramientas Rápidas
          </h4>
          <div className={styles.quickTools}>
            <button
              onClick={() => {
                if (useReactFlowView && reactFlowInstance) {
                  reactFlowNavigation.fitToScreen();
                } else {
                  (fitContentToScreen || fitToScreen)();
                }
              }}
              className={`${styles.navButton} ${styles.bgContent} ${styles.borderBase}`}
              title="Ajustar contenido a pantalla (F)"
            >
              <Maximize2 size={16} />
              Ajustar Contenido
            </button>
            
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              className={`${styles.navButton} ${showMiniMap ? styles.primaryButton : styles.bgContent} ${styles.borderBase} ${showMiniMap ? styles.navButtonActive : ''}`}
              title="Mini-mapa"
            >
              <Map size={16} />
              Mini-mapa
            </button>
          </div>
        </div>

        {/* Búsqueda rápida */}
        <div className={styles.navigationSection}>
          <h4 className={styles.sectionTitle}>
            Búsqueda Rápida
            {filteredUnits.size > 0 && (
              <span 
                className={`${styles.searchFilterIndicator} ${styles.textPrimary}`}
              >
                (en {filteredUnits.size} unidad{filteredUnits.size > 1 ? 'es' : ''})
              </span>
            )}
          </h4>
          <div className={`${styles.searchContainer} ${styles.bgContent} ${styles.borderBase}`}>
            <Search size={16} className={styles.iconMuted} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={filteredUnits.size > 0 
                ? "Buscar en unidades filtradas..." 
                : "Buscar personas, posiciones o unidades..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter' && searchResults.length === 0) {
                  setSearchQuery('');
                }
                if (e.key === 'Escape') {
                  setSearchQuery('');
                  searchInputRef.current?.blur();
                }
              }}
              className={styles.searchInput}
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className={`${styles.searchResults} ${styles.bgContent} ${styles.borderBase}`}>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSearchSelect(result)}
                  className={styles.searchResultItem}
                >
                  <div className={styles.searchResultIcon}>
                    {result.type === 'unidad' && <Building size={16} className={styles.iconPrimary} />}
                    {result.type === 'posicion' && <Target size={16} className={styles.iconSuccess} />}
                    {result.type === 'persona' && <Users size={16} className={styles.iconWarning} />}
                  </div>
                  <div className={styles.searchResultText}>
                    <div className={styles.searchResultName}>{result.name}</div>
                    <div className={`${styles.searchResultSubtitle} ${styles.textSecondary}`}>
                      {result.subtitle}
                      {result.level !== undefined && ` • Nivel ${result.level}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navegación por niveles */}
        <div className={styles.navigationSection}>
          <h4 className={styles.sectionTitle}>
            Navegación por Niveles
            {filteredUnits.size > 0 && (
              <span 
                className={`${styles.searchFilterIndicator} ${styles.textPrimary}`}
              >
                (filtrado)
              </span>
            )}
            {levelCoordinates && Object.keys(levelCoordinates).length > 0 && (
              <span 
                className={styles.coordsIndicator}
                title={`Coordenadas disponibles para ${Object.keys(levelCoordinates).length} niveles`}
              >
                📍 {Object.keys(levelCoordinates).length}
              </span>
            )}
          </h4>
          <div className={styles.levelNavigation}>
            {Object.entries(levelStats).map(([level, stats]) => (
              <button
                key={level}
                onClick={() => handleLevelNavigation(parseInt(level))}
                className={`${styles.levelButton} ${selectedLevel === parseInt(level) ? styles.levelButtonActive + ' ' + styles.primaryButton : styles.bgContent} ${styles.borderBase}`}
                title={`Navegar al nivel ${level} - ${stats.units} unidades, ${stats.positions} posiciones`}
              >
                <div className={styles.levelInfo}>
                  <span className={styles.levelNumber}>Nivel {level}</span>
                  <div className={styles.levelStats}>
                    <span>{stats.units}U</span>
                    <span>{stats.positions}P</span>
                    <span>{stats.people}Pe</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {updateLevelCoordinates && (
            <button
              onClick={updateLevelCoordinates}
              className={styles.refreshButton}
              title="Actualizar coordenadas de navegación"
            >
              🔄 Actualizar coordenadas
            </button>
          )}
        </div>

        {/* Mini-mapa */}
        {showMiniMap && (
          <div className={styles.navigationSection}>
            <h4 className={styles.sectionTitle}>
              Mini-mapa
            </h4>
            <div className={`${styles.miniMap} ${styles.bgContent} ${styles.borderBase}`}>
              <div className={styles.miniMapContent}>
                <div className={styles.miniMapInfo}>
                  <p className={styles.textSecondary}>
                    Zoom: {Math.round(getCurrentViewport().zoom * 100)}%
                  </p>
                  <p className={styles.textSecondary}>
                    Posición: ({Math.round(getCurrentViewport().x)}, {Math.round(getCurrentViewport().y)})
                  </p>
                </div>
                
                <div className={styles.miniMapControls}>
                  <button
                    onClick={() => panBy(0, -100)}
                    className={styles.miniMapButton}
                    title="Mover arriba"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <div className={styles.miniMapRow}>
                    <button
                      onClick={() => panBy(-100, 0)}
                      className={styles.miniMapButton}
                      title="Mover izquierda"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      onClick={centerView}
                      className={styles.miniMapButton}
                      title="Centrar"
                    >
                      <MapPin size={12} />
                    </button>
                    <button
                      onClick={() => panBy(100, 0)}
                      className={styles.miniMapButton}
                      title="Mover derecha"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => panBy(0, 100)}
                    className={styles.miniMapButton}
                    title="Mover abajo"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas generales */}
        <div className={styles.navigationSection}>
          <h4 className={styles.sectionTitle}>
            Estadísticas
            {filteredUnits.size > 0 && (
              <span 
                className={`${styles.searchFilterIndicator} ${styles.textPrimary}`}
              >
                (filtrado)
              </span>
            )}
          </h4>
          <div className={styles.generalStats}>
            <div className={`${styles.statItem} ${styles.bgContent}`}>
              <Building size={16} className={styles.iconPrimary} />
              <span>
                {filteredUnits.size > 0 
                  ? `${filteredUnits.size} de ${unidades.length} Unidades`
                  : `${unidades.length} Unidades`
                }
              </span>
            </div>
            <div className={`${styles.statItem} ${styles.bgContent}`}>
              <Target size={16} className={styles.iconSuccess} />
              <span>
                {filteredUnits.size > 0
                  ? `${posiciones.filter(p => filteredUnits.has(p.unidadesOrgId)).length} de ${posiciones.length} Posiciones`
                  : `${posiciones.length} Posiciones`
                }
              </span>
            </div>
            <div className={`${styles.statItem} ${styles.bgContent}`}>
              <Users size={16} className={styles.iconWarning} />
              <span>
                {filteredUnits.size > 0
                  ? `${personaPosiciones.filter(pp => {
                      const pos = posiciones.find(p => p.posicionId === pp.posicionId);
                      return pos && filteredUnits.has(pos.unidadesOrgId);
                    }).length} de ${personaPosiciones.length} Asignadas`
                  : `${personaPosiciones.length} Asignadas`
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};