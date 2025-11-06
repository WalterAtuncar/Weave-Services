import React, { useState, useMemo, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  GitBranch, 
  Database, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Layers,
  Move,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../button/button';
import { StatusBadge } from '../status-badge/StatusBadge';
import { SystemTypeIcon } from '../system-type-icon/SystemTypeIcon';
import { HierarchyIndicator } from '../hierarchy-indicator/HierarchyIndicator';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Sistema, 
  EstadoSistema, 
  TIPO_SISTEMA_LABELS, 
  FAMILIA_SISTEMA_LABELS 
} from '../../../models/Sistemas';

import styles from './SystemTree.module.css';

export interface SystemTreeProps {
  /** Lista de sistemas para mostrar en el árbol */
  sistemas: Sistema[];
  /** ID de la organización */
  organizacionId: number;
  /** Sistema seleccionado */
  selectedSistemaId?: number;
  /** Función llamada cuando se selecciona un sistema */
  onSystemSelect?: (sistemaId: number) => void;
  /** Función llamada cuando se quiere editar un sistema */
  onSystemEdit?: (sistemaId: number) => void;
  /** Función llamada cuando se quiere ver detalles de un sistema */
  onSystemView?: (sistemaId: number) => void;
  /** Función llamada cuando se reorganiza la jerarquía */
  onHierarchyChange?: (sistemaId: number, newParentId: number | null) => Promise<void>;
  /** Mostrar acciones en cada nodo */
  showActions?: boolean;
  /** Modo expandido inicial */
  initialExpanded?: boolean;
  /** Altura máxima del árbol */
  maxHeight?: number;
  /** Mostrar estadísticas por nivel */
  showLevelStats?: boolean;
  /** Solo lectura */
  readOnly?: boolean;
  /** Habilitar drag & drop */
  enableDragDrop?: boolean;
}

interface TreeNode extends Sistema {
  children: TreeNode[];
  level: number;
  isExpanded: boolean;
  parentPath: number[];
}

interface LevelStats {
  level: number;
  count: number;
  activeCount: number;
  inactiveCount: number;
}

interface DragState {
  isDragging: boolean;
  draggedNodeId: number | null;
  dragOverNodeId: number | null;
  dropPosition: 'above' | 'below' | 'inside' | null;
  isValidDrop: boolean;
}

export const SystemTree: React.FC<SystemTreeProps> = ({
  sistemas,
  organizacionId,
  selectedSistemaId,
  onSystemSelect,
  onSystemEdit,
  onSystemView,
  onHierarchyChange,
  showActions = true,
  initialExpanded = true,
  maxHeight = 600,
  showLevelStats = true,
  readOnly = false,
  enableDragDrop = false
}) => {
  const { colors } = useTheme();

  // Estado para controlar nodos expandidos
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(
    new Set(initialExpanded ? sistemas.map(s => s.sistemaId) : [])
  );

  // Estado para drag & drop
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNodeId: null,
    dragOverNodeId: null,
    dropPosition: null,
    isValidDrop: false
  });

  // Construir árbol jerárquico
  const treeData = useMemo(() => {
    const sistemasActivos = sistemas.filter(s => 
      s.organizacionId === organizacionId && 
      !s.registroEliminado
    );

    // Función recursiva para construir el árbol
    const buildTree = (parentId: number | null, level: number = 0, parentPath: number[] = []): TreeNode[] => {
      return sistemasActivos
        .filter(s => s.sistemaDepende === parentId)
        .map(sistema => {
          const currentPath = [...parentPath, sistema.sistemaId];
          const children = buildTree(sistema.sistemaId, level + 1, currentPath);
          
          return {
            ...sistema,
            children,
            level,
            isExpanded: expandedNodes.has(sistema.sistemaId),
            parentPath
          };
        });
    };

    const tree = buildTree(null);

    // Calcular estadísticas por nivel
    const levelStats: LevelStats[] = [];
    const calculateLevelStats = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        // Asegurar que existe el nivel en las estadísticas
        let levelStat = levelStats.find(stat => stat.level === node.level);
        if (!levelStat) {
          levelStat = { level: node.level, count: 0, activeCount: 0, inactiveCount: 0 };
          levelStats.push(levelStat);
        }

        // Incrementar contadores
        levelStat.count++;
        if (node.estado === EstadoSistema.ACTIVO) {
          levelStat.activeCount++;
        } else {
          levelStat.inactiveCount++;
        }

        // Procesar hijos recursivamente
        if (node.children.length > 0) {
          calculateLevelStats(node.children);
        }
      });
    };

    calculateLevelStats(tree);

    // Ordenar estadísticas por nivel
    levelStats.sort((a, b) => a.level - b.level);

    return { tree, levelStats };
  }, [sistemas, organizacionId, expandedNodes]);

  // Validar si un drop es válido (evitar dependencias circulares)
  const isValidDrop = useCallback((draggedId: number, targetId: number | null): boolean => {
    if (draggedId === targetId) return false;
    
    // Si el target es null (raíz), siempre es válido
    if (targetId === null) return true;
    
    // Verificar que el target no sea un descendiente del nodo arrastrado
    const checkDescendant = (nodeId: number, ancestorId: number): boolean => {
      const node = sistemas.find(s => s.sistemaId === nodeId);
      if (!node) return false;
      
      if (node.sistemaDepende === ancestorId) return true;
      if (node.sistemaDepende === null) return false;
      
      return checkDescendant(node.sistemaDepende, ancestorId);
    };
    
    return !checkDescendant(targetId, draggedId);
  }, [sistemas]);

  // Handlers para drag & drop
  const handleDragStart = useCallback((e: React.DragEvent, nodeId: number) => {
    if (!enableDragDrop || readOnly) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId.toString());
    
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedNodeId: nodeId
    }));
  }, [enableDragDrop, readOnly]);

  const handleDragOver = useCallback((e: React.DragEvent, nodeId: number) => {
    if (!enableDragDrop || !dragState.isDragging) return;
    
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let dropPosition: 'above' | 'below' | 'inside' = 'inside';
    if (y < height * 0.25) {
      dropPosition = 'above';
    } else if (y > height * 0.75) {
      dropPosition = 'below';
    }
    
    const isValid = dragState.draggedNodeId ? 
      isValidDrop(dragState.draggedNodeId, nodeId) : false;
    
    setDragState(prev => ({
      ...prev,
      dragOverNodeId: nodeId,
      dropPosition,
      isValidDrop: isValid
    }));
  }, [enableDragDrop, dragState.isDragging, dragState.draggedNodeId, isValidDrop]);

  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      dragOverNodeId: null,
      dropPosition: null,
      isValidDrop: false
    }));
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetNodeId: number) => {
    if (!enableDragDrop || !dragState.isDragging || !dragState.draggedNodeId) return;
    
    e.preventDefault();
    
    if (!dragState.isValidDrop) {
      setDragState({
        isDragging: false,
        draggedNodeId: null,
        dragOverNodeId: null,
        dropPosition: null,
        isValidDrop: false
      });
      return;
    }

    const draggedId = dragState.draggedNodeId;
    let newParentId: number | null = null;
    
    // Determinar el nuevo padre basado en la posición del drop
    if (dragState.dropPosition === 'inside') {
      newParentId = targetNodeId;
    } else {
      // Para 'above' o 'below', usar el mismo padre que el nodo target
      const targetNode = sistemas.find(s => s.sistemaId === targetNodeId);
      newParentId = targetNode?.sistemaDepende || null;
    }
    
    try {
      await onHierarchyChange?.(draggedId, newParentId);
    } catch (error) {
      console.error('Error al reorganizar jerarquía:', error);
    } finally {
      setDragState({
        isDragging: false,
        draggedNodeId: null,
        dragOverNodeId: null,
        dropPosition: null,
        isValidDrop: false
      });
    }
  }, [enableDragDrop, dragState, sistemas, onHierarchyChange]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedNodeId: null,
      dragOverNodeId: null,
      dropPosition: null,
      isValidDrop: false
    });
  }, []);

  // Toggle expansión de nodo
  const toggleNode = (sistemaId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(sistemaId)) {
      newExpanded.delete(sistemaId);
    } else {
      newExpanded.add(sistemaId);
    }
    setExpandedNodes(newExpanded);
  };

  // Expandir/colapsar todos
  const expandAll = () => {
    const allIds = new Set(sistemas.map(s => s.sistemaId));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Renderizar nodo del árbol
  const renderTreeNode = (node: TreeNode): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedSistemaId === node.sistemaId;
    const hierarchyLevel = node.level + 1;
    
    // Estados de drag & drop
    const isDraggedNode = dragState.draggedNodeId === node.sistemaId;
    const isDragOver = dragState.dragOverNodeId === node.sistemaId;
    const canDrop = isDragOver && dragState.isValidDrop;
    const invalidDrop = isDragOver && !dragState.isValidDrop;

    return (
      <div key={node.sistemaId} className={styles.treeNode}>
        {/* Líneas de conexión */}
        <div className={styles.nodeConnector} style={{ 
          marginLeft: `${(node.level) * 24}px`,
          borderColor: colors.border 
        }}>
          {node.level > 0 && (
            <>
              <div className={styles.verticalLine} style={{ borderColor: colors.border }} />
              <div className={styles.horizontalLine} style={{ borderColor: colors.border }} />
            </>
          )}
        </div>

        {/* Contenido del nodo */}
        <div 
          className={`${styles.nodeContent} 
            ${isSelected ? styles.selected : ''} 
            ${isDraggedNode ? styles.dragging : ''}
            ${canDrop ? styles.dropValid : ''}
            ${invalidDrop ? styles.dropInvalid : ''}
          `}
          style={{ 
            marginLeft: `${(node.level) * 24 + 20}px`,
            backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
            borderColor: canDrop ? '#10B981' : invalidDrop ? '#EF4444' : isSelected ? colors.primary : colors.border,
            opacity: isDraggedNode ? 0.5 : 1
          }}
          draggable={enableDragDrop && !readOnly}
          onDragStart={(e) => handleDragStart(e, node.sistemaId)}
          onDragOver={(e) => handleDragOver(e, node.sistemaId)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.sistemaId)}
          onDragEnd={handleDragEnd}
        >
          {/* Indicador de drop */}
          {isDragOver && dragState.dropPosition && (
            <div className={`${styles.dropIndicator} ${styles[dragState.dropPosition]}`} 
                 style={{ backgroundColor: canDrop ? '#10B981' : '#EF4444' }} />
          )}

          {/* Botón de expansión */}
          <div className={styles.expandButton}>
            {hasChildren ? (
              <Button
                variant="ghost"
                size="s"
                onClick={() => toggleNode(node.sistemaId)}
                iconName={node.isExpanded ? "ChevronDown" : "ChevronRight"}
                className={styles.expandIcon}
              />
            ) : (
              <div className={styles.leafIndicator} style={{ backgroundColor: colors.border }} />
            )}
          </div>

          {/* Handle de drag */}
          {enableDragDrop && !readOnly && (
            <div className={styles.dragHandle} style={{ color: colors.textSecondary }}>
              <Move size={14} />
            </div>
          )}

          {/* Información del sistema */}
          <div 
            className={styles.nodeInfo}
            onClick={() => onSystemSelect?.(node.sistemaId)}
          >
            <div className={styles.nodeHeader}>
              <SystemTypeIcon 
                familia={node.familiaSistema} 
                size={18}
              />
              
              <h4 className={styles.nodeName} style={{ color: colors.text }}>
                {node.nombreSistema}
              </h4>
              
              <StatusBadge
                status={node.estado === EstadoSistema.ACTIVO ? 'active' : 'inactive'}
                size="s"
              />

              {/* Indicador de profundidad */}
              {hierarchyLevel > 1 && (
                <span className={styles.depthIndicator} style={{ 
                  backgroundColor: colors.primary + '20', 
                  color: colors.primary 
                }}>
                  Nivel {hierarchyLevel}
                </span>
              )}

              {/* Indicador de validación de drop */}
              {invalidDrop && (
                <div className={styles.invalidDropIndicator} style={{ color: '#EF4444' }}>
                  <AlertTriangle size={14} />
                  <span>Dependencia circular no permitida</span>
                </div>
              )}
            </div>

            <div className={styles.nodeMeta}>
              <span style={{ color: colors.textSecondary }}>
                {TIPO_SISTEMA_LABELS[node.tipoSistema]} • {FAMILIA_SISTEMA_LABELS[node.familiaSistema]}
              </span>
              
              {node.codigoSistema && (
                <code className={styles.systemCode} style={{ 
                  backgroundColor: colors.surface, 
                  color: colors.textSecondary 
                }}>
                  {node.codigoSistema}
                </code>
              )}

              {hasChildren && (
                <span className={styles.childrenCount} style={{ color: colors.primary }}>
                  {node.children.length} {node.children.length === 1 ? 'dependencia' : 'dependencias'}
                </span>
              )}
            </div>

            {node.funcionPrincipal && (
              <p className={styles.nodeDescription} style={{ color: colors.textSecondary }}>
                {node.funcionPrincipal}
              </p>
            )}
          </div>

          {/* Acciones */}
          {showActions && !readOnly && (
            <div className={styles.nodeActions}>
              <Button
                variant="ghost"
                size="s"
                onClick={() => onSystemView?.(node.sistemaId)}
                iconName="Eye"
                title="Ver detalles"
              />
              <Button
                variant="ghost"
                size="s"
                onClick={() => onSystemEdit?.(node.sistemaId)}
                iconName="Edit"
                title="Editar sistema"
              />
            </div>
          )}
        </div>

        {/* Nodos hijos */}
        {hasChildren && node.isExpanded && (
          <div className={styles.childrenContainer}>
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.systemTree} style={{ maxHeight: `${maxHeight}px` }}>
      {/* Header con controles */}
      <div className={styles.treeHeader}>
        <div className={styles.titleSection}>
          <Layers size={20} color={colors.primary} />
          <h3 className={styles.title} style={{ color: colors.text }}>
            Árbol de Sistemas
          </h3>
          <span className={styles.systemCount} style={{ color: colors.textSecondary }}>
            ({treeData.tree.length} sistemas raíz)
          </span>
          {enableDragDrop && !readOnly && (
            <span className={styles.dragHint} style={{ color: colors.textSecondary }}>
              • Arrastra para reorganizar
            </span>
          )}
        </div>

        <div className={styles.treeControls}>
          <Button
            variant="outline"
            size="s"
            onClick={expandAll}
            iconName="ChevronDown"
          >
            Expandir Todo
          </Button>
          <Button
            variant="outline"
            size="s"
            onClick={collapseAll}
            iconName="ChevronRight"
          >
            Colapsar Todo
          </Button>
        </div>
      </div>

      {/* Estadísticas por nivel */}
      {showLevelStats && treeData.levelStats.length > 0 && (
        <div className={styles.levelStats} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          {treeData.levelStats.map(stat => (
            <div key={stat.level} className={styles.levelStat}>
              <span className={styles.levelLabel} style={{ color: colors.textSecondary }}>
                Nivel {stat.level}:
              </span>
              <div className={styles.levelCounts}>
                <span style={{ color: colors.text }}>{stat.count} sistemas</span>
                <span style={{ color: '#10B981' }}>({stat.activeCount} activos)</span>
                {stat.inactiveCount > 0 && (
                  <span style={{ color: '#EF4444' }}>({stat.inactiveCount} inactivos)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenido del árbol */}
      <div className={styles.treeContent}>
        {treeData.tree.length === 0 ? (
          <div className={styles.emptyState} style={{ color: colors.textSecondary }}>
            <GitBranch size={32} />
            <p>No hay sistemas configurados</p>
            <small>Los sistemas aparecerán aquí una vez que se configuren las jerarquías</small>
          </div>
        ) : (
          <div className={styles.treeNodes}>
            {treeData.tree.map(node => renderTreeNode(node))}
          </div>
        )}
      </div>
    </div>
  );
};