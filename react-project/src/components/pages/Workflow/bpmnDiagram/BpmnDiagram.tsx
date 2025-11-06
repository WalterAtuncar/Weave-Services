import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  NodeTypes,
  MarkerType,
  ConnectionMode,
  NodeResizer,
  NodeResizeControl,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useTheme } from '../../../../contexts/ThemeContext';
import { AlertService } from '../../../ui/alerts/AlertService';
import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import TaskNode from './nodes/TaskNode';
import DecisionNode from './nodes/DecisionNode';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import styles from './BpmnDiagram.module.css';

// Tipos para el diagrama BPMN
export interface BpmnNodeData {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision';
  label: string;
  // Propiedades específicas para tareas
  assignee?: string;
  dueDate?: string;
  description?: string;
  // Propiedades para decisiones
  conditions?: { [key: string]: string };
  // Metadatos
  createdAt?: string;
  updatedAt?: string;
}

export interface BpmnDiagramData {
  nodes: Node<BpmnNodeData>[];
  edges: Edge[];
  metadata: {
    name: string;
    description?: string;
    version: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface BpmnDiagramProps {
  // Datos iniciales del diagrama
  initialData?: string | BpmnDiagramData;
  // Configuración
  readOnly?: boolean;
  height?: string;
  width?: string;
  showToolbar?: boolean;
  showPropertiesPanel?: boolean;
  showMiniMap?: boolean;
  // Callbacks
  onSave?: (data: string) => void;
  onChange?: (data: BpmnDiagramData) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  // Configuración de nodos
  allowedNodeTypes?: ('start' | 'end' | 'task' | 'decision')[];
}

const BpmnDiagram: React.FC<BpmnDiagramProps> = ({
  initialData,
  readOnly = false,
  height = '600px',
  width = '100%',
  showToolbar = true,
  showPropertiesPanel = true,
  showMiniMap = true,
  onSave,
  onChange,
  onValidation,
  allowedNodeTypes = ['start', 'end', 'task', 'decision']
}) => {
  const { colors } = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Debug: Verificar dimensiones del wrapper después del render
  React.useEffect(() => {
    const checkDimensions = () => {
      if (reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('⚠️ ReactFlow Wrapper has no dimensions:', {
            width: rect.width,
            height: rect.height
          });
        }
      }
    };
    
    // Verificar después de un pequeño delay para dar tiempo al render
    const timer = setTimeout(checkDimensions, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Estados del diagrama
  const [nodes, setNodes, originalOnNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Función personalizada para manejar cambios de nodos incluyendo resize
  const onNodesChange = useCallback((changes: any[]) => {
    changes.forEach(change => {
      if (change.type === 'dimensions') {
        // Forzar actualización inmediata para cambios de dimensiones
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ duration: 0 });
          }
        }, 0);
      }
    });
    
    originalOnNodesChange(changes);
  }, [originalOnNodesChange, reactFlowInstance]);

  const [selectedNode, setSelectedNode] = useState<Node<BpmnNodeData> | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Debug: Trackear cambios en nodes y forzar actualización visual
  React.useEffect(() => {
    if (nodes.length > 0) {
      // Forzar re-render cuando los nodos cambien
      if (reactFlowInstance) {
        nodes.forEach(node => {
          const domNode = document.querySelector(`[data-id="${node.id}"]`);
          if (domNode && node.style?.width && node.style?.height) {
            const element = domNode as HTMLElement;
            element.style.width = `${node.style.width}px`;
            element.style.height = `${node.style.height}px`;
          }
        });
      }
    }
  }, [nodes, reactFlowInstance]);
  
  // Metadatos del diagrama
  const [metadata, setMetadata] = useState({
    name: 'Nuevo Proceso',
    description: '',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Tipos de nodos personalizados
  const nodeTypes: NodeTypes = useMemo(() => ({
    start: StartNode,
    end: EndNode,
    task: TaskNode,
    decision: DecisionNode,
  }), []);

  // Configuración por defecto de edges
  const defaultEdgeOptions = {
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: colors.primary,
    },
    style: {
      stroke: colors.primary,
      strokeWidth: 2,
    },
  };

  // Cargar datos iniciales
  React.useEffect(() => {
    if (initialData) {
      loadDiagramData(initialData);
    }
  }, [initialData]);

  // Notificar cambios
  React.useEffect(() => {
    if (onChange) {
      const diagramData: BpmnDiagramData = {
        nodes,
        edges,
        metadata: {
          ...metadata,
          updatedAt: new Date().toISOString()
        }
      };
      onChange(diagramData);
    }
  }, [nodes, edges, metadata, onChange]);

  // Validar diagrama
  React.useEffect(() => {
    if (onValidation) {
      const { isValid, errors } = validateDiagram();
      onValidation(isValid, errors);
    }
  }, [nodes, edges, onValidation]);

  // Cargar datos del diagrama
  const loadDiagramData = (data: string | BpmnDiagramData) => {
    try {
      let diagramData: BpmnDiagramData;
      
      if (typeof data === 'string') {
        diagramData = JSON.parse(data);
      } else {
        diagramData = data;
      }

      // Agregar propiedades resizable y style a todos los nodos cargados
      const nodesWithResize = (diagramData.nodes || []).map(node => ({
        ...node,
        resizable: true,
        dragHandle: '.drag-handle',
        style: {
          ...node.style,
          width: node.style?.width || (node.type === 'task' ? 120 : 80),
          height: node.style?.height || (node.type === 'task' ? 50 : 80),
        },
        width: node.width || node.style?.width || (node.type === 'task' ? 120 : 80),
        height: node.height || node.style?.height || (node.type === 'task' ? 50 : 80),
      }));

      setNodes(nodesWithResize);
      setEdges(diagramData.edges || []);
      setMetadata(diagramData.metadata || metadata);
      
      AlertService.success('Diagrama cargado exitosamente');
    } catch (error) {
      console.error('Error al cargar diagrama:', error);
      AlertService.error('Error al cargar el diagrama');
    }
  };

  // Exportar datos del diagrama
  const exportDiagramData = (): string => {
    const diagramData: BpmnDiagramData = {
      nodes,
      edges,
      metadata: {
        ...metadata,
        updatedAt: new Date().toISOString()
      }
    };
    return JSON.stringify(diagramData, null, 2);
  };

  // Validar diagrama
  const validateDiagram = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Verificar que hay al menos un nodo de inicio
    const startNodes = nodes.filter(node => node.type === 'start');
    if (startNodes.length === 0) {
      errors.push('El diagrama debe tener al menos un nodo de inicio');
    } else if (startNodes.length > 1) {
      errors.push('El diagrama no puede tener más de un nodo de inicio');
    }

    // Verificar que hay al menos un nodo de fin
    const endNodes = nodes.filter(node => node.type === 'end');
    if (endNodes.length === 0) {
      errors.push('El diagrama debe tener al menos un nodo de fin');
    }

    // Verificar que todas las tareas tienen responsable
    const taskNodes = nodes.filter(node => node.type === 'task');
    taskNodes.forEach(task => {
      if (!task.data.assignee) {
        errors.push(`La tarea "${task.data.label}" debe tener un responsable asignado`);
      }
      if (!task.data.dueDate) {
        errors.push(`La tarea "${task.data.label}" debe tener una fecha de vencimiento`);
      }
    });

    // Verificar conectividad
    const nodeIds = new Set(nodes.map(node => node.id));
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const disconnectedNodes = Array.from(nodeIds).filter(id => !connectedNodes.has(id));
    if (disconnectedNodes.length > 0 && nodes.length > 1) {
      errors.push(`Hay nodos desconectados: ${disconnectedNodes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Manejar conexiones
  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      
      const newEdge = {
        ...params,
        ...defaultEdgeOptions,
        id: `edge-${Date.now()}`,
      };
      setEdges(eds => addEdge(newEdge, eds));
    },
    [readOnly, defaultEdgeOptions, setEdges]
  );

  // Manejar selección de nodos
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<BpmnNodeData>) => {
    if (!readOnly) {
      setSelectedNode(node);
    }
  }, [readOnly]);

  // Manejar drop de nuevos nodos
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (readOnly) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        console.warn('🚀 DROP FAILED: Missing data or bounds');
        return;
      }

      // Calcular posición - usar cálculo manual si reactFlowInstance no está disponible
      let position;
      if (reactFlowInstance && reactFlowInstance.project) {
        position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
      } else {
        // Fallback: cálculo manual de posición con offset para centrar
        position = {
          x: event.clientX - reactFlowBounds.left - 70, 
          y: event.clientY - reactFlowBounds.top - 40,
        };
      }

      const newNode: Node<BpmnNodeData> = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        resizable: true,
        dragHandle: '.drag-handle',
        data: {
          id: `${type}-${Date.now()}`,
          type: type as BpmnNodeData['type'],
          label: getDefaultLabel(type),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        style: {
          width: type === 'task' ? 120 : 80,
          height: type === 'task' ? 50 : 80,
        },
        width: type === 'task' ? 120 : 80,
        height: type === 'task' ? 50 : 80,
      };
      setNodes(nds => nds.concat(newNode));
      
      // Limpiar estado de dragging
      setIsDragging(false);
    },
    [reactFlowInstance, readOnly, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Asegurar que estamos permitiendo el drop
    if (!readOnly) {
      setIsDragging(true);
    }
  }, [readOnly]);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  // Obtener etiqueta por defecto para cada tipo
  const getDefaultLabel = (type: string): string => {
    switch (type) {
      case 'start': return 'Inicio';
      case 'end': return 'Fin';
      case 'task': return 'Nueva Tarea';
      case 'decision': return 'Decisión';
      default: return 'Nodo';
    }
  };

  // Manejar guardado
  const handleSave = () => {
    try {
      const data = exportDiagramData();
      if (onSave) {
        onSave(data);
      }
      AlertService.success('Diagrama guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      AlertService.error('Error al guardar el diagrama');
    }
  };

  // Actualizar nodo seleccionado
  const updateSelectedNode = (updates: Partial<BpmnNodeData>) => {
    if (!selectedNode) return;

    setNodes(nds =>
      nds.map(node =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            }
          : node
      )
    );
  };

  // Eliminar nodo seleccionado
  const deleteSelectedNode = () => {
    if (!selectedNode || readOnly) return;

    setNodes(nds => nds.filter(node => node.id !== selectedNode.id));
    setEdges(eds => eds.filter(edge => 
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
  };

  return (
    <div className={styles.bpmnDiagramContainer} style={{ height, width }}>
      <ReactFlowProvider>
        <div className={styles.diagramContent}>
          {/* Toolbar */}
          {showToolbar && !readOnly && (
            <Toolbar
              allowedNodeTypes={allowedNodeTypes}
              onSave={handleSave}
              onValidate={() => {
                const { isValid, errors } = validateDiagram();
                if (isValid) {
                  AlertService.success('Diagrama válido');
                } else {
                  AlertService.error(`Errores encontrados:\n${errors.join('\n')}`);
                }
              }}
              onClear={() => {
                setNodes([]);
                setEdges([]);
                setSelectedNode(null);
              }}
            />
          )}

          {/* Área principal del diagrama */}
          <div className={styles.diagramArea}>
            <div 
              ref={reactFlowWrapper}
              className={styles.reactFlowWrapper}
              style={{ 
                backgroundColor: colors.background
              }}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onInit={(instance) => {
                  setReactFlowInstance(instance);
                }}
                onNodeDragStart={(event, node) => // Debug removed}
                onNodeDrag={(event, node) => // Debug removed}
                onNodeDragStop={(event, node) => // Debug removed}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionMode={ConnectionMode.Loose}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                selectNodesOnDrag={false}
                panOnDrag={[1, 2]} 
                selectionOnDrag={false}
                multiSelectionKeyCode={['Meta', 'Ctrl']}
                deleteKeyCode={['Backspace', 'Delete']}
                zoomOnScroll={true}
                zoomOnPinch={true}
                nodeDragThreshold={1}
                nodeResizeThreshold={5}
                fitView
                attributionPosition="bottom-left"
                className={`${styles.reactFlow} ${isDragging ? styles.dragOver : ''}`}
                style={{
                  height: '100%',
                  minHeight: '600px'
                }}
                proOptions={{ hideAttribution: true }}
              >
                <Background 
                  color={colors.border} 
                  gap={20} 
                  size={1}
                />
                <Controls 
                  style={{ 
                    button: { 
                      backgroundColor: colors.surface,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }
                  }}
                />
                {showMiniMap && (
                  <MiniMap 
                    style={{ 
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`
                    }}
                    nodeColor={colors.primary}
                  />
                )}
              </ReactFlow>
            </div>

            {/* Panel de propiedades */}
            {showPropertiesPanel && !readOnly && (
              <PropertiesPanel
                selectedNode={selectedNode}
                onUpdateNode={updateSelectedNode}
                onDeleteNode={deleteSelectedNode}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </div>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default BpmnDiagram;