import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Position,
  Node,
  Edge,
  NodeMouseHandler,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Building, Trash2, UserPlus, Edit, Eye, Users, Building2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { SaveOrganizationalLayoutRequest } from '../../../services/types/organizaciones.types';
import { ContextMenu, ContextMenuItem } from '../../ui/context-menu';
import ELK from 'elkjs/lib/elk.bundled.js';

export interface ReactFlowOrgChartProps {
  data?: any; // esperar objeto con { data: { unidadesOrg: [...], personas: [...], organizacion: {...} } }
  layout?: SaveOrganizationalLayoutRequest | null; // NUEVO: layout guardado opcional
  onEditUnit?: (unitId: number) => void;
  onCreatePosition?: (unitId: number) => void;
  onCreateSubunit?: (unitId: number) => void;
  onAssignPerson?: (unitId: number) => void;
  onDeleteUnit?: (unitId: number) => void;
  onViewDetail?: (unitId: number) => void; // NUEVO: ver detalle
  onReactFlowInit?: (instance: any) => void; // NUEVO: callback para obtener la instancia de ReactFlow
  onNodesEdgesChange?: (nodes: Node[], edges: Edge[]) => void; // NUEVO: callback para exponer nodos y edges actuales
}

// Tipos de datos
interface UnidadOrg {
  unidadesOrgId: number;
  unidadPadreId: number | null;
  nombre: string;
  nombreCorto?: string;
  tipoUnidad?: string | number;
}

// Helper: convertir el código de tipo de unidad a su nombre legible
const getTipoUnidadTexto = (tipoUnidad: number | string | undefined): string => {
  if (tipoUnidad === undefined || tipoUnidad === null) return '';
  const n = typeof tipoUnidad === 'string' ? parseInt(tipoUnidad, 10) : tipoUnidad;
  const tipos: Record<number, string> = {
    1: 'Corporativo',
    2: 'División',
    3: 'Gerencia',
    4: 'Subgerencia',
    5: 'Departamento',
    6: 'Área',
    7: 'Sección',
    8: 'Equipo',
  };
  return tipos[n as number] ?? String(tipoUnidad);
};

// Componente de nodo personalizado para unidades organizacionales
const CustomOrgUnitNode = ({ data }: { data: any }) => {
  const { colors, theme } = useTheme();
  const isRoot = !data.parentId; // Nodo raíz si no tiene padre
  
  // Determinar el tipo de unidad para el icono
  const getUnitIcon = () => {
    if (isRoot) return Building2;
    return Building;
  };
  
  const IconComponent = getUnitIcon();
  
  return (
    <div style={{
      padding: '14px 18px',
      borderRadius: '12px',
      border: `1px solid var(--organigrama-border)`,
      background: 'var(--organigrama-card-bg)',
      color: 'var(--organigrama-card-text)',
      minWidth: '220px',
      maxWidth: '280px',
      boxShadow: 'var(--organigrama-shadow)',
      position: 'relative',
      transition: 'all 0.2s ease'
    }}>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          background: 'var(--organigrama-primary)',
          border: `2px solid var(--organigrama-surface)`,
          width: '10px',
          height: '10px'
        }} 
      />
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        marginBottom: '8px' 
      }}>
        <div style={{
          padding: '6px',
          borderRadius: '8px',
          background: 'var(--organigrama-button-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconComponent size={16} style={{ color: 'var(--organigrama-card-text)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
             fontWeight: isRoot ? '700' : '600',
             fontSize: isRoot ? '15px' : '14px',
             color: 'var(--organigrama-card-text)',
             lineHeight: '1.3',
             wordBreak: 'break-word',
             marginBottom: '2px'
           }}>
             {data.label}
           </div>
           {data.short && data.short !== data.label && (
             <div style={{
               fontSize: '12px',
               color: 'var(--organigrama-card-text)',
               opacity: '0.8',
               fontStyle: 'italic',
               lineHeight: '1.2'
             }}>
               {data.short}
             </div>
           )}
        </div>
      </div>
      
      {data.tipoNombre && (
         <div style={{
           fontSize: '11px',
           color: 'var(--organigrama-card-text)',
           background: 'var(--organigrama-button-bg)',
           padding: '4px 8px',
           borderRadius: '6px',
           display: 'inline-block',
           marginTop: '4px'
         }}>
           {data.tipoNombre}
         </div>
       )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ 
          background: 'var(--organigrama-primary)',
          border: `2px solid var(--organigrama-surface)`,
          width: '10px',
          height: '10px'
        }} 
      />
    </div>
  );
};

// Tipos de nodos personalizados
const nodeTypes = {
  orgUnitNode: CustomOrgUnitNode,
};

// Layout: cálculo sencillo de niveles y posiciones x acumuladas por orden
function buildHierarchy(unidades: UnidadOrg[]) {
  const byId = new Map<number, UnidadOrg & { children: number[] }>();
  unidades.forEach(u => byId.set(u.unidadesOrgId, { ...u, children: [] }));
  const roots: number[] = [];
  byId.forEach((u) => {
    if (u.unidadPadreId == null) {
      roots.push(u.unidadesOrgId);
    } else {
      const parent = byId.get(u.unidadPadreId);
      if (parent) parent.children.push(u.unidadesOrgId);
    }
  });
  return { byId, roots };
}

// Configuración ELK para layout avanzado
const elk = new ELK();

// Función para crear layout con ELK
async function computeELKLayout(unidades: UnidadOrg[]) {
  const { byId, roots } = buildHierarchy(unidades);
  
  if (roots.length === 0) return { nodePositions: new Map(), byId };

  // Crear estructura de grafo para ELK
  const elkNodes: any[] = [];
  const elkEdges: any[] = [];
  
  // Dimensiones de nodos (ajustadas para el CustomOrgUnitNode)
  const nodeWidth = 280;
  const nodeHeight = 100;
  
  // Crear nodos ELK
  unidades.forEach(unidad => {
    elkNodes.push({
      id: unidad.unidadesOrgId.toString(),
      width: nodeWidth,
      height: nodeHeight
    });
  });
  
  // Crear edges ELK
  unidades.forEach(unidad => {
    if (unidad.unidadPadreId !== null) {
      elkEdges.push({
        id: `edge-${unidad.unidadPadreId}-${unidad.unidadesOrgId}`,
        sources: [unidad.unidadPadreId.toString()],
        targets: [unidad.unidadesOrgId.toString()]
      });
    }
  });
  
  // Configuración del grafo ELK con opciones específicas para jerarquías profundas
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      // Espaciado horizontal entre nodos en la misma capa
      'elk.spacing.nodeNode': '100',
      // Espaciado vertical entre capas (muy importante para jerarquías profundas)
      'elk.layered.spacing.nodeNodeBetweenLayers': '150',
      // Espaciado entre componentes separados
      'elk.spacing.componentComponent': '120',
      // Espaciado adicional entre edges y nodos en diferentes capas
      'elk.layered.spacing.edgeNodeBetweenLayers': '80',
      // Estrategia de colocación de nodos para minimizar cruces
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      // Estrategia para minimizar cruces de edges
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      // Estrategia de layering para distribución óptima
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      // Espaciado entre puertos
      'elk.spacing.portPort': '30',
      // Restricciones de puertos
      'elk.portConstraints': 'FIXED_SIDE',
      // Nivel de minuciosidad del algoritmo (mayor = mejor calidad)
      'elk.layered.thoroughness': '15',
      // Eliminar puntos de inflexión innecesarios
      'elk.layered.unnecessaryBendpoints': 'true',
      // Valor base para todos los espaciados
      'elk.layered.spacing.baseValue': '100',
      // Configuraciones adicionales para jerarquías profundas
      'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
      'elk.layered.compaction.postCompaction.constraints': 'SEQUENCE',
      // Mejorar la distribución en capas profundas
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      // Espaciado mínimo entre nodos
      'elk.spacing.nodeNodeBetweenLayers': '150'
    },
    children: elkNodes,
    edges: elkEdges
  };
  
  try {
    const layoutedGraph = await elk.layout(graph);
    const nodePositions = new Map<number, { x: number; y: number }>();
    
    layoutedGraph.children?.forEach((node: any) => {
      const nodeId = parseInt(node.id);
      nodePositions.set(nodeId, {
        x: node.x || 0,
        y: node.y || 0
      });
    });
    
    return { nodePositions, byId };
  } catch (error) {
    console.error('Error en layout ELK:', error);
    // Fallback al layout simple en caso de error
    return computeSimpleLayout(unidades);
  }
}

// Obtiene un layout jerárquico simple top-down (y por niveles)
function computeSimpleLayout(unidades: UnidadOrg[]) {
  const { byId, roots } = buildHierarchy(unidades);
  const levels: number[][] = [];
  const queue: Array<{ id: number; level: number }> = roots.map(id => ({ id, level: 0 }));
  while (queue.length) {
    const { id, level } = queue.shift()!;
    if (!levels[level]) levels[level] = [];
    levels[level].push(id);
    const node = byId.get(id)!;
    node.children.forEach(childId => queue.push({ id: childId, level: level + 1 }));
  }

  // Asignar posiciones x por índice en el nivel y y por nivel
  const nodePositions = new Map<number, { x: number; y: number }>();
  const levelGapY = 180;
  const nodeGapX = 260;
  levels.forEach((lvl, i) => {
    lvl.forEach((id, idx) => {
      nodePositions.set(id, { x: idx * nodeGapX, y: i * levelGapY });
    });
  });

  // Centrar por subárbol: mover x de cada nodo al promedio de sus hijos si tiene
  const postOrder = (id: number): number => {
    const node = byId.get(id)!;
    if (node.children.length === 0) {
      return nodePositions.get(id)!.x;
    }
    const xs = node.children.map(childId => postOrder(childId));
    const avg = xs.reduce((a, b) => a + b, 0) / xs.length;
    const p = nodePositions.get(id)!;
    nodePositions.set(id, { x: avg, y: p.y });
    return avg;
  };
  roots.forEach(postOrder);

  return { byId, roots, nodePositions };
}

function useOrgFlowData(rawData?: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(rawData ?? null);

  useEffect(() => {
    if (rawData) return; // usar data proporcionada
    let mounted = true;
    setLoading(true);
    // Cargar JSON local (Vite soporta import.meta.url)
    const url = new URL('./MonckData/gestionOrganizacional.json', import.meta.url);
    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (!mounted) return;
        setData(json?.data ?? json);
      })
      .catch(e => setError(e?.message ?? 'Error cargando JSON'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [rawData]);

  return { loading, error, data: data ?? rawData };
}

export const ReactFlowOrgChart: React.FC<ReactFlowOrgChartProps> = ({
  data: incomingData,
  layout,
  onEditUnit,
  onCreatePosition,
  onCreateSubunit,
  onAssignPerson,
  onDeleteUnit,
  onViewDetail,
  onReactFlowInit,
  onNodesEdgesChange
}) => {
  const { theme, colors } = useTheme();
  const { loading, error, data } = useOrgFlowData(incomingData?.data ? incomingData : incomingData);

  // 🔍 DEBUG: Log para diagnosticar datos
  const unidades: UnidadOrg[] = useMemo(() => {
    const arr = data?.data?.unidadesOrg ?? data?.unidadesOrg ?? [];
    return arr as UnidadOrg[];
  }, [data]);

  // Mapa de posiciones guardadas por nodeId
  const savedPositionsMap = useMemo(() => {
    const m = new Map<number, { x: number; y: number }>();
    if (layout?.positions?.length) {
      layout.positions.forEach(p => m.set(p.nodeId, { x: p.x, y: p.y }));
    }
    return m;
  }, [layout]);

  // Estado para el layout ELK
  const [layoutData, setLayoutData] = useState<{
    nodePositions: Map<number, { x: number; y: number }>;
    byId: Map<number, UnidadOrg & { children: number[] }>;
  } | null>(null);

  // Efecto para calcular layout ELK de forma asíncrona
  useEffect(() => {
    if (unidades.length === 0) return;
    
    const calculateLayout = async () => {
      try {
        const result = await computeELKLayout(unidades);
        setLayoutData(result);
      } catch (error) {
        console.error('Error calculando layout ELK:', error);
        // Fallback al layout simple
        const fallbackResult = computeSimpleLayout(unidades);
        setLayoutData(fallbackResult);
      }
    };
    
    calculateLayout();
  }, [unidades]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!layoutData) {
      return { nodes: [], edges: [] };
    }

    const { nodePositions, byId } = layoutData;

    // NUEVO: Calcular niveles (profundidad) por unidad para navegación por niveles
    const levelsById = new Map<number, number>();
    const roots: number[] = [];
    byId.forEach((u, id) => {
      if (u.unidadPadreId == null) roots.push(id);
    });
    const queue: Array<{ id: number; level: number }> = roots.map(id => ({ id, level: 0 }));
    while (queue.length) {
      const { id, level } = queue.shift()!;
      if (!levelsById.has(id)) {
        levelsById.set(id, level);
        const node = byId.get(id);
        if (node) node.children.forEach(childId => queue.push({ id: childId, level: level + 1 }));
      }
    }

    const nodes: Node[] = unidades.map(u => {
      const saved = savedPositionsMap.get(u.unidadesOrgId);
      const p = saved ?? nodePositions.get(u.unidadesOrgId) ?? { x: 0, y: 0 };
      const nivel = levelsById.get(u.unidadesOrgId) ?? 0;
      return {
        id: String(u.unidadesOrgId),
        position: p,
        data: { 
          label: u.nombre, 
          short: u.nombreCorto, 
          tipo: u.tipoUnidad,
          tipoNombre: getTipoUnidadTexto(u.tipoUnidad as any),
          parentId: u.unidadPadreId,
          nivel
        },
        type: 'orgUnitNode',
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      } as Node;
    });

    const edges: Edge[] = [];
    byId.forEach((u) => {
      u.children.forEach(childId => {
        edges.push({
          id: `${u.unidadesOrgId}-${childId}`,
          source: String(u.unidadesOrgId),
          target: String(childId),
          animated: false,
          style: { stroke: colors.primary },
          type: 'smoothstep'
        });
      });
    });

    return { nodes, edges };
  }, [unidades, colors, theme, savedPositionsMap, layoutData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Notificar cambios de nodos y edges al componente padre
  useEffect(() => {
    if (onNodesEdgesChange) {
      onNodesEdgesChange(nodes, edges);
    }
  }, [nodes, edges, onNodesEdgesChange]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);

  // Estado del menú contextual
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    nodeId: string | null;
    nodeData: any;
  }>({ isOpen: false, position: { x: 0, y: 0 }, nodeId: null, nodeData: null });

  // Handler para el menú contextual
  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    const pane = reactFlowWrapper.current?.getBoundingClientRect();
    if (!pane) return;

    setContextMenu({
      isOpen: true,
      position: {
        x: event.clientX,
        y: event.clientY,
      },
      nodeId: node.id,
      nodeData: node.data,
    });
  }, []);

  // Cerrar menú contextual
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Generar items del menú contextual
  const getContextMenuItems = useCallback((nodeId: string, nodeData: any): ContextMenuItem[] => {
    const unitId = parseInt(nodeId);

    const items: ContextMenuItem[] = [];

    if (onViewDetail) {
      items.push({
        id: 'view-detail',
        label: 'Ver Detalle',
        icon: <Eye size={16} />,
        onClick: () => {
          onViewDetail(unitId);
          closeContextMenu();
        },
      });
    }

    if (onEditUnit) {
      items.push({
        id: 'edit-unit',
        label: 'Editar unidad',
        icon: <Edit size={16} />,
        onClick: () => {
          onEditUnit(unitId);
          closeContextMenu();
        },
      });
    }

    if (onCreatePosition) {
      items.push({
        id: 'add-position',
        label: 'Agregar posición',
        icon: <Plus size={16} />,
        onClick: () => {
          onCreatePosition(unitId);
          closeContextMenu();
        },
      });
    }

    if (onCreateSubunit) {
      items.push({
        id: 'add-subunit',
        label: 'Agregar sub-unidad',
        icon: <Building size={16} />,
        onClick: () => {
          onCreateSubunit(unitId);
          closeContextMenu();
        },
      });
    }

    if (onAssignPerson) {
      items.push({
        id: 'assign-person',
        label: 'Asignar persona',
        icon: <UserPlus size={16} />,
        onClick: () => {
          onAssignPerson(unitId);
          closeContextMenu();
        },
      });
    }

    if (onDeleteUnit) {
      items.push({
        id: 'delete-unit',
        label: 'Eliminar unidad',
        icon: <Trash2 size={16} />,
        onClick: () => {
          onDeleteUnit(unitId);
          closeContextMenu();
        },
        separator: true,
      });
    }

    return items;
  }, [onViewDetail, onEditUnit, onCreatePosition, onCreateSubunit, onAssignPerson, onDeleteUnit, closeContextMenu]);

  // Ajustar vista al montar
  const onInit = useCallback((instance: any) => {
    setRfInstance(instance);
    if (onReactFlowInit) {
      onReactFlowInit(instance);
    }
    if (layout?.viewport) {
      const { x, y, zoom } = layout.viewport;
      requestAnimationFrame(() => instance.setViewport({ x, y, zoom }));
    } else {
      requestAnimationFrame(() => instance.fitView({ padding: 0.2 }));
    }
  }, [layout, onReactFlowInit]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    if (rfInstance) {
      if (layout?.viewport) {
        const { x, y, zoom } = layout.viewport;
        requestAnimationFrame(() => rfInstance.setViewport({ x, y, zoom }));
      } else {
        requestAnimationFrame(() => rfInstance.fitView({ padding: 0.2 }));
      }
    }
  }, [initialNodes, initialEdges, rfInstance, setNodes, setEdges, layout]);

  // Enfocar el contenedor para capturar teclas
  useEffect(() => {
    if (reactFlowWrapper.current) {
      reactFlowWrapper.current.focus();
    }
  }, []);

  // Manejo de flechas para panear la vista
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!rfInstance || typeof rfInstance.getViewport !== 'function' || typeof rfInstance.setViewport !== 'function') return;
    const keys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const vp = rfInstance.getViewport();
    const base = e.shiftKey ? 150 : 70;
    const delta = base; // movimiento en px; React Flow ajusta internamente por zoom
    let nx = vp.x;
    let ny = vp.y;
    if (e.key === 'ArrowLeft') nx += delta;
    if (e.key === 'ArrowRight') nx -= delta;
    if (e.key === 'ArrowUp') ny += delta;
    if (e.key === 'ArrowDown') ny -= delta;
    rfInstance.setViewport({ x: nx, y: ny, zoom: vp.zoom });
  }, [rfInstance]);

  if (loading) {
    return <div style={{ padding: 16, color: colors.text }}>Cargando organigrama...</div>;
  }
  if (error) {
    return <div style={{ padding: 16, color: colors.text }}>Error: {error}</div>;
  }
  if (!unidades || unidades.length === 0) {
    return <div style={{ padding: 16, color: colors.text }}>No hay unidades para mostrar</div>;
  }

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '80vh', background: colors.background }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={() => reactFlowWrapper.current?.focus()}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeContextMenu={onNodeContextMenu}
          onInit={onInit}
          nodeTypes={nodeTypes}
          fitView={!layout?.viewport}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap pannable zoomable nodeStrokeColor={colors.primary} maskColor={theme === 'dark' ? '#0f172acc' : '#f5f7facc'} />
          <Controls showInteractive={true} position="bottom-right" />
          <Background variant="dots" gap={16} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={contextMenu.nodeId ? getContextMenuItems(contextMenu.nodeId, contextMenu.nodeData) : []}
        onClose={closeContextMenu}
      />
    </div>
  );
};