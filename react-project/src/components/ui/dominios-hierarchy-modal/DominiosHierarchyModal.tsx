import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { X, Database, Folder, FolderTree } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Modal } from '../modal/Modal';
import { DominioData } from '../../../models/DominiosData';
import { dominiosDataService } from '../../../services/dominios-data.service';
import { useAuth } from '../../../hooks/useAuth';
import { AlertService } from '../alerts/AlertService';

export interface DominiosHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente de nodo personalizado
const CustomDominioNode = ({ data }: { data: any }) => {
  const { colors } = useTheme();
  const isSubDominio = data.isSubDominio;
  const isDomain = !isSubDominio; // todo nodo que no es subdominio es dominio y debe ir en azul
  
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '8px',
      border: `2px solid ${isSubDominio ? '#10b981' : colors.primary}`,
      background: isSubDominio ? '#10b98110' : colors.primary + '10',
      minWidth: isSubDominio ? '180px' : '200px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: isSubDominio ? '#10b981' : colors.primary }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        {isSubDominio ? (
          <FolderTree size={14} style={{ color: '#10b981' }} />
        ) : (
          <Database size={16} style={{ color: colors.primary }} />
        )}
        <span style={{
          fontWeight: isDomain ? '600' : '500',
          fontSize: isSubDominio ? '13px' : '14px',
          color: colors.text,
          lineHeight: '1.2'
        }}>
          {data.label}
        </span>
      </div>
      
      {data.codigo && (
        <div style={{
          fontSize: '11px',
          color: colors.textSecondary || colors.text + '80',
          marginBottom: '2px'
        }}>
          {data.codigo}
        </div>
      )}
      
      {isDomain && data.totalSubDominios > 0 && (
        <div style={{
          fontSize: '10px',
          color: colors.textSecondary || colors.text + '60',
          fontStyle: 'italic'
        }}>
          {data.totalSubDominios} subdominios
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} style={{ background: isSubDominio ? '#10b981' : colors.primary }} />
    </div>
  );
};

// Tipos de nodos personalizados
const nodeTypes = {
  dominioNode: CustomDominioNode,
};

// Tipos de datos para la jerarquía
interface DominioNode {
  dominioDataId: number;
  dominioParentId: number | null;
  nombreDominio: string;
  codigoDominio?: string;
  tipo: number;
  estado: number;
  totalSubDominios?: number;
  children: number[];
}

// Función para construir la jerarquía
function buildDominiosHierarchy(dominios: DominioData[]) {
  const byId = new Map<number, DominioNode>();
  
  // Crear mapa de nodos
  dominios.forEach(d => {
    byId.set(d.dominioDataId, {
      dominioDataId: d.dominioDataId,
      dominioParentId: d.dominioParentId,
      nombreDominio: d.nombreDominio,
      codigoDominio: d.codigoDominio,
      tipo: d.tipo,
      estado: d.estado,
      totalSubDominios: d.totalSubDominios,
      children: []
    });
  });
  
  const roots: number[] = [];
  
  // Construir relaciones padre-hijo
  byId.forEach((dominio) => {
    if (dominio.dominioParentId == null) {
      roots.push(dominio.dominioDataId);
    } else {
      const parent = byId.get(dominio.dominioParentId);
      if (parent) {
        parent.children.push(dominio.dominioDataId);
      }
    }
  });
  
  return { byId, roots };
}

// Función para calcular layout jerárquico con opción de apilar raíces verticalmente
function computeHierarchicalLayout(
  dominios: DominioData[],
  options?: { direction?: 'TB' | 'LR'; stackRootsVertically?: boolean }
) {
  const direction = options?.direction ?? 'TB';
  const stackRootsVertically = options?.stackRootsVertically ?? true; // por requerimiento, apilar dominios raíz

  const { byId, roots } = buildDominiosHierarchy(dominios);

  // Constantes de separación
  const levelGapPrimary = 150;      // separación entre niveles (eje principal)
  const siblingGapSecondary = 280;  // separación entre hermanos (eje secundario)
  const groupGap = 180;             // separación entre grupos de raíces

  // Calcula layout de un subárbol (relativo al origen 0,0)
  const computeSubtreeLayout = (rootId: number) => {
    const levels: number[][] = [];
    const queue: Array<{ id: number; level: number }> = [{ id: rootId, level: 0 }];
    const visited = new Set<number>();

    while (queue.length) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      if (!levels[level]) levels[level] = [];
      levels[level].push(id);

      const node = byId.get(id)!;
      node.children.forEach(childId => {
        queue.push({ id: childId, level: level + 1 });
      });
    }

    const nodePositions = new Map<number, { x: number; y: number }>();

    // Posicionamiento inicial por niveles
    levels.forEach((level, levelIndex) => {
      const levelSpan = (level.length - 1) * siblingGapSecondary;
      const startSecondary = -levelSpan / 2;

      level.forEach((id, nodeIndex) => {
        if (direction === 'TB') {
          nodePositions.set(id, {
            x: startSecondary + (nodeIndex * siblingGapSecondary),
            y: levelIndex * levelGapPrimary
          });
        } else { // 'LR'
          nodePositions.set(id, {
            x: levelIndex * levelGapPrimary,
            y: startSecondary + (nodeIndex * siblingGapSecondary)
          });
        }
      });
    });

    // Centrar subárboles sobre el eje secundario
    const centerSubtrees = (id: number): number => {
      const node = byId.get(id)!;
      if (node.children.length === 0) {
        const pos = nodePositions.get(id)!;
        return direction === 'TB' ? pos.x : pos.y;
      }

      const childCenters = node.children.map(childId => centerSubtrees(childId));
      const avg = childCenters.reduce((a, b) => a + b, 0) / childCenters.length;

      const pos = nodePositions.get(id)!;
      if (direction === 'TB') {
        nodePositions.set(id, { x: avg, y: pos.y });
      } else {
        nodePositions.set(id, { x: pos.x, y: avg });
      }
      return avg;
    };

    centerSubtrees(rootId);

    // Altura utilizada por el subárbol (en pixeles) para apilar correctamente
    const usedHeight = levels.length > 0 ? (levels.length - 1) * levelGapPrimary : 0;

    return { nodePositions, usedHeight };
  };

  if (stackRootsVertically && direction === 'TB') {
    // Ordenar raíces por nombre para una lista vertical estable
    const sortedRoots = [...roots].sort((a, b) => {
      const na = byId.get(a)?.nombreDominio?.toLowerCase() ?? '';
      const nb = byId.get(b)?.nombreDominio?.toLowerCase() ?? '';
      return na.localeCompare(nb);
    });

    const nodePositions = new Map<number, { x: number; y: number }>();
    let offsetY = 0;

    sortedRoots.forEach(rootId => {
      const { nodePositions: subPos, usedHeight } = computeSubtreeLayout(rootId);
      // Trasladar el subárbol para apilarlo debajo del anterior
      subPos.forEach((pos, id) => {
        nodePositions.set(id, { x: pos.x, y: pos.y + offsetY });
      });
      // Avanzar el offset Y: altura usada por este subárbol + separación entre grupos
      offsetY += usedHeight + groupGap;
    });

    return { byId, roots: sortedRoots, nodePositions };
  }

  // Layout estándar para todos los nodos juntos (mismo nivel horizontal)
  const levels: number[][] = [];
  const queue: Array<{ id: number; level: number }> = roots.map(id => ({ id, level: 0 }));

  while (queue.length) {
    const { id, level } = queue.shift()!;
    if (!levels[level]) levels[level] = [];
    levels[level].push(id);

    const node = byId.get(id)!;
    node.children.forEach(childId => {
      queue.push({ id: childId, level: level + 1 });
    });
  }

  const nodePositions = new Map<number, { x: number; y: number }>();
  levels.forEach((level, levelIndex) => {
    const levelSpan = (level.length - 1) * siblingGapSecondary;
    const startSecondary = -levelSpan / 2;

    level.forEach((id, nodeIndex) => {
      if (direction === 'TB') {
        nodePositions.set(id, {
          x: startSecondary + (nodeIndex * siblingGapSecondary),
          y: levelIndex * levelGapPrimary
        });
      } else { // 'LR'
        nodePositions.set(id, {
          x: levelIndex * levelGapPrimary,
          y: startSecondary + (nodeIndex * siblingGapSecondary)
        });
      }
    });
  });

  const centerSubtrees = (id: number): number => {
    const node = byId.get(id)!;
    if (node.children.length === 0) {
      const pos = nodePositions.get(id)!;
      return direction === 'TB' ? pos.x : pos.y;
    }
    const childCenters = node.children.map(childId => centerSubtrees(childId));
    const avg = childCenters.reduce((a, b) => a + b, 0) / childCenters.length;
    const pos = nodePositions.get(id)!;
    if (direction === 'TB') {
      nodePositions.set(id, { x: avg, y: pos.y });
    } else {
      nodePositions.set(id, { x: pos.x, y: avg });
    }
    return avg;
  };

  roots.forEach(centerSubtrees);
  return { byId, roots, nodePositions };
}

// Hook para cargar todos los dominios
function useAllDominios() {
  const [dominios, setDominios] = useState<DominioData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const loadAllDominios = useCallback(async () => {
    if (!user?.organizacionId) {
      setError('No se ha encontrado la organización del usuario');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Cargar todos los dominios con pageSize grande
      const response = await dominiosDataService.getDominiosDataPaginated({
        page: 1,
        pageSize: 2500, // Asegurar que lleguen todos
        organizacionId: user.organizacionId,
        orderBy: 'nombreDominio',
        ascending: true,
        includeDeleted: false
      });
      
      if (response.success && response.data) {
        const dominiosData = response.data.data.map(d => ({
          dominioDataId: d.dominioDataId,
          organizacionId: d.organizacionId,
          codigoDominio: d.codigoDominio,
          nombreDominio: d.nombreDominio,
          descripcionDominio: d.descripcionDominio,
          tipo: d.tipo,
          estado: d.estado,
          dominioParentId: d.dominioParentId,
          dominioParent_Nombre: d.dominioParent_Nombre,
          totalSubDominios: d.totalSubDominios,
          propietarioNegocio: d.propietarioNegocio,
          stewardData: d.stewardData,
          politicasGobierno: d.politicasGobierno,
          estadoTexto: d.estadoTexto,
          version: d.version,
          creadoPor: d.creadoPor,
          fechaCreacion: d.fechaCreacion,
          actualizadoPor: d.actualizadoPor,
          fechaActualizacion: d.fechaActualizacion,
          registroEliminado: d.registroEliminado,
          // El backend puede enviar subdominios con la clave 'subDominios' (DTO)
          // o con 'subDominiosData' (modelo antiguo). Unificamos en subDominiosData.
          subDominiosData: (d as any).subDominiosData ?? (d as any).subDominios ?? []
          }));
          
          // Expandir dominios para incluir subdominios como nodos separados
          const allDominios: DominioData[] = [];
          
          dominiosData.forEach(dominio => {
            // Agregar el dominio principal
            allDominios.push(dominio);
            
            // Agregar subdominios como nodos separados si existen
            const subs: any[] = (dominio as any).subDominiosData?.length
              ? (dominio as any).subDominiosData
              : ((dominio as any).subDominios ?? []);
            if (subs && subs.length > 0) {
              subs.forEach((sub: any) => {
                const subIdRaw = sub.subDominioDataId ?? sub.subDominioId;
                const subCodigo = sub.codigoSubDominio ?? sub.codigo;
                const subNombre = sub.nombreSubDominio ?? sub.nombre;
                const subDescripcion = sub.descripcionSubDominio ?? sub.descripcion;

                // Asegurar IDs únicos entre dominios (tabla DominiosData) y subdominios (tabla SubDominiosData)
                // Para evitar colisiones en el grafo, usamos IDs negativos para subdominios
                const parsedSubId = Number(subIdRaw);
                const uniqueSubId = Number.isFinite(parsedSubId) ? -Math.abs(parsedSubId) : Number(`-999${dominio.dominioDataId}`);

                allDominios.push({
                  dominioDataId: uniqueSubId,
                  organizacionId: dominio.organizacionId,
                  codigoDominio: subCodigo,
                  nombreDominio: subNombre,
                  descripcionDominio: subDescripcion,
                  tipo: dominio.tipo, // Heredar tipo del padre
                  estado: sub.estado,
                  dominioParentId: dominio.dominioDataId, // Establecer relación padre-hijo
                  dominioParent_Nombre: dominio.nombreDominio,
                  totalSubDominios: 0, // Los subdominios no tienen hijos
                  propietarioNegocio: dominio.propietarioNegocio,
                  stewardData: dominio.stewardData,
                  politicasGobierno: dominio.politicasGobierno,
                  estadoTexto: sub.estadoTexto,
                  version: sub.version,
                  creadoPor: sub.creadoPor,
                  fechaCreacion: sub.fechaCreacion,
                  actualizadoPor: sub.actualizadoPor,
                  fechaActualizacion: sub.fechaActualizacion,
                  registroEliminado: sub.registroEliminado,
                  subDominiosData: [] // Los subdominios no tienen subdominios
                });
              });
            }
           });
        setDominios(allDominios);
      } else {
        setError(response.message || 'Error al cargar dominios');
      }
    } catch (err) {
      console.error('Error loading all dominios:', err);
      setError('Error al cargar la jerarquía de dominios');
      AlertService.error('Error al cargar la jerarquía de dominios');
    } finally {
      setLoading(false);
    }
  }, [user?.organizacionId]);
  
  return { dominios, loading, error, loadAllDominios };
}

export const DominiosHierarchyModal: React.FC<DominiosHierarchyModalProps> = ({
  isOpen,
  onClose
}) => {
  const { theme, colors } = useTheme();
  const { dominios, loading, error, loadAllDominios } = useAllDominios();
  
  // Cargar dominios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadAllDominios();
    }
  }, [isOpen, loadAllDominios]);
  
  // Generar nodos y edges para React Flow
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!dominios.length) {
      return { nodes: [], edges: [] };
    }

    // Orientación vertical y raíces apiladas una debajo de otra
    const { nodePositions, byId } = computeHierarchicalLayout(dominios, { direction: 'TB', stackRootsVertically: true });

    const nodes: Node[] = dominios.map(dominio => {
      const pos = nodePositions.get(dominio.dominioDataId) ?? { x: 0, y: 0 };
      const isRoot = dominio.dominioParentId === null;
      // Considerar subdominio solo si proviene de la expansión (IDs negativos)
      const isSubDominio = dominio.dominioDataId < 0;

      return {
        id: String(dominio.dominioDataId),
        position: pos,
        data: {
          label: dominio.nombreDominio,
          codigo: dominio.codigoDominio,
          tipo: dominio.tipo,
          totalSubDominios: dominio.totalSubDominios || 0,
          isRoot,
          isSubDominio,
          parentName: dominio.dominioParent_Nombre
        },
        type: 'dominioNode'
      } as Node;
    });

    const edges: Edge[] = [];
    byId.forEach((dominio) => {
      dominio.children.forEach(childId => {
        edges.push({
          id: `${dominio.dominioDataId}-${childId}`,
          source: String(dominio.dominioDataId),
          target: String(childId),
          animated: false,
          style: {
            stroke: colors.primary,
            strokeWidth: 2
          },
          type: 'smoothstep'
        });
      });
    });

    return { nodes, edges };
  }, [dominios, colors, theme]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Actualizar nodos y edges cuando cambien los datos
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  // Renderizado condicional del contenido
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: colors.text 
        }}>
          <div style={{ textAlign: 'center' }}>
            <Database size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Cargando jerarquía de dominios...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: colors.text 
        }}>
          <div style={{ textAlign: 'center' }}>
            <Database size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Error: {error}</p>
          </div>
        </div>
      );
    }
    
    if (!dominios.length) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          color: colors.text 
        }}>
          <div style={{ textAlign: 'center' }}>
            <Folder size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No hay dominios para mostrar</p>
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ width: '100%', height: '70vh', background: colors.background }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
          >
            <MiniMap 
              pannable 
              zoomable 
              nodeStrokeColor={colors.primary} 
              maskColor={theme === 'dark' ? '#0f172acc' : '#f5f7facc'} 
            />
            <Controls showInteractive={true} position="bottom-right" />
            <Background variant="dots" gap={16} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    );
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jerarquía de Dominios de Data"
      size="xl"
      hideFooter={true}
    >
      {renderContent()}
    </Modal>
  );
};