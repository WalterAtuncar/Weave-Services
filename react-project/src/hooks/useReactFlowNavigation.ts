import { useCallback } from 'react';
import { Node, Edge, ReactFlowInstance } from 'reactflow';

export interface UseReactFlowNavigationReturn {
  centerOnNode: (nodeId: string, duration?: number) => void;
  centerOnElement: (elementId: string, elementType?: 'node' | 'unit' | 'position' | 'person') => void;
  fitToNodes: (nodeIds: string[], padding?: number) => void;
  fitToScreen: () => void;
  panToPosition: (x: number, y: number, zoom?: number) => void;
  searchAndCenter: (searchTerm: string, searchType: 'unit' | 'position' | 'person', nodes: Node[], edges: Edge[]) => boolean;
  navigateToLevel: (level: number, nodes: Node[]) => void;
}

export const useReactFlowNavigation = (reactFlowInstance: ReactFlowInstance | null): UseReactFlowNavigationReturn => {
  
  // Centrar en un nodo específico por su ID
  const centerOnNode = useCallback((nodeId: string, duration: number = 300) => {
    if (!reactFlowInstance) {
      console.warn('ReactFlow instance not available');
      return;
    }

    try {
      // Normalizar IDs con prefijo (unit-, position-, person-)
      const normalizedId = /^(unit|position|person)-/.test(nodeId)
        ? nodeId.replace(/^(unit|position|person)-/, '')
        : nodeId;

      const doCenter = (node: Node) => {
        const viewport = reactFlowInstance.getViewport();
        const x = -node.position.x * viewport.zoom + (window.innerWidth / 2) - ((node.width || 200) * viewport.zoom / 2);
        const y = -node.position.y * viewport.zoom + (window.innerHeight / 2) - ((node.height || 100) * viewport.zoom / 2);
        reactFlowInstance.setViewport({ x, y, zoom: viewport.zoom }, { duration });
      };

      const tryFind = (attempt: number) => {
        // Probar con varios candidatos de ID
        const candidates: string[] = [normalizedId];
        if (/^(unit|position|person)-/.test(nodeId)) {
          // Si venía con prefijo, probar también el original
          candidates.push(nodeId);
        } else {
          // Si no venía con prefijo, probar variantes comunes
          candidates.push(`unit-${normalizedId}`, `position-${normalizedId}`, `person-${normalizedId}`);
        }

        let found: Node | null = null;
        for (const id of candidates) {
          const n = reactFlowInstance.getNode(id);
          if (n) {
            found = n;
            break;
          }
        }

        if (found) {
          doCenter(found);
          return;
        }

        // Intento de recuperación: hacer fitView una vez temprano
        if (attempt === 3) {
          try {
            reactFlowInstance.fitView({ padding: 0.2 });
          } catch {}
        }

        // Reintentar por hasta ~5s
        if (attempt < 50) {
          setTimeout(() => tryFind(attempt + 1), 100);
        } else {
          console.warn(`Node with id ${nodeId} not found after ${attempt} attempts (tried: ${candidates.join(', ')})`);
        }
      };

      tryFind(1);
    } catch (error) {
      console.error('Error centering on node:', error);
    }
  }, [reactFlowInstance]);

  // Centrar en un elemento específico (nodo, unidad, posición, persona)
  const centerOnElement = useCallback((elementId: string, elementType?: 'node' | 'unit' | 'position' | 'person') => {
    if (!reactFlowInstance) {
      console.warn('ReactFlow instance not available');
      return;
    }

    try {
      let nodeId: string;
      
      // Auto-detectar el tipo si no se proporciona, basado en el prefijo del ID
      if (!elementType) {
        if (elementId.startsWith('unit-')) {
          elementType = 'unit';
        } else if (elementId.startsWith('position-')) {
          elementType = 'position';
        } else if (elementId.startsWith('person-')) {
          elementType = 'person';
        } else {
          elementType = 'node';
        }
      }
      
      // Mapear el elementId al nodeId correspondiente según el tipo
      switch (elementType) {
        case 'node':
          nodeId = elementId;
          break;
        case 'unit':
          // Si ya viene con el prefijo 'unit-', removerlo
          if (elementId.startsWith('unit-')) {
            nodeId = elementId.replace('unit-', '');
          } else {
            nodeId = elementId;
          }
          break;
        case 'position':
          // Para posiciones, extraer el ID numérico
          if (elementId.startsWith('position-')) {
            nodeId = elementId.replace('position-', '');
          } else {
            nodeId = elementId;
          }
          break;
        case 'person':
          // Para personas, extraer el ID numérico
          if (elementId.startsWith('person-')) {
            nodeId = elementId.replace('person-', '');
          } else {
            nodeId = elementId;
          }
          break;
        default:
          nodeId = elementId;
      }
      
      centerOnNode(nodeId);
      
    } catch (error) {
      console.error('Error centering on element:', error);
    }
  }, [centerOnNode]);

  // Ajustar vista para mostrar múltiples nodos
  const fitToNodes = useCallback((nodeIds: string[], padding: number = 0.2) => {
    if (!reactFlowInstance) {
      console.warn('ReactFlow instance not available');
      return;
    }

    try {
      const nodes = nodeIds.map(id => reactFlowInstance.getNode(id)).filter(Boolean) as Node[];
      
      if (nodes.length === 0) {
        console.warn('No valid nodes found for the provided IDs');
        return;
      }

      // Si solo hay un nodo, centrarlo
      if (nodes.length === 1) {
        centerOnNode(nodes[0].id);
        return;
      }

      // Para múltiples nodos, usar fitView con los nodos específicos
      reactFlowInstance.fitView({
        padding,
        nodes: nodes.map(n => ({ id: n.id })),
        duration: 300
      });
      
    } catch (error) {
      console.error('Error fitting to nodes:', error);
    }
  }, [reactFlowInstance, centerOnNode]);

  // Ajustar toda la vista a la pantalla
  const fitToScreen = useCallback(() => {
    if (!reactFlowInstance) {
      console.warn('ReactFlow instance not available');
      return;
    }

    try {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
    } catch (error) {
      console.error('Error fitting to screen:', error);
    }
  }, [reactFlowInstance]);

  // Navegar a una posición específica
  const panToPosition = useCallback((x: number, y: number, zoom?: number) => {
    if (!reactFlowInstance) {
      console.warn('ReactFlow instance not available');
      return;
    }

    try {
      const currentViewport = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({
        x,
        y,
        zoom: zoom !== undefined ? Math.max(0.1, Math.min(3, zoom)) : currentViewport.zoom
      }, { duration: 300 });
    } catch (error) {
      console.error('Error panning to position:', error);
    }
  }, [reactFlowInstance]);

  // Buscar y centrar en un elemento
  const searchAndCenter = useCallback((searchTerm: string, searchType: 'unit' | 'position' | 'person', nodes: Node[], edges: Edge[]): boolean => {
    if (!reactFlowInstance || !searchTerm.trim()) {
      return false;
    }

    try {
      const term = searchTerm.toLowerCase().trim();
      let foundNode: Node | null = null;

      // Buscar en los nodos según el tipo
      for (const node of nodes) {
        const nodeData = (node as any).data;
        
        switch (searchType) {
          case 'unit':
            if (nodeData.label?.toLowerCase().includes(term) || 
                nodeData.short?.toLowerCase().includes(term)) {
              foundNode = node;
            }
            break;
          case 'position':
            // Para posiciones, buscar en el label del nodo (que contiene el nombre de la unidad)
            if (nodeData.label?.toLowerCase().includes(term)) {
              foundNode = node;
            }
            break;
          case 'person':
            // Para personas, buscar en el label del nodo
            if (nodeData.label?.toLowerCase().includes(term)) {
              foundNode = node;
            }
            break;
        }
        
        if (foundNode) break;
      }

      if (foundNode) {
        centerOnNode(foundNode.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error searching and centering:', error);
      return false;
    }
  }, [reactFlowInstance, centerOnNode]);

  // Navegar a un nivel específico
  const navigateToLevel = useCallback((level: number, nodes: Node[]) => {
    if (!reactFlowInstance) {
      console.warn('ReactFlow instance not available');
      return;
    }

    try {
      // 1) Intento principal: filtrar por claves de nivel conocidas
      const readLevel = (n: Node): number => {
        const data: any = (n as any).data || {};
        let nodeLevel: any = data.nivel ?? data.level ?? data.nivelJerarquico ?? data.depth ?? undefined;
        if (typeof nodeLevel === 'string') {
          const parsed = parseInt(nodeLevel, 10);
          nodeLevel = isNaN(parsed) ? undefined : parsed;
        }
        return typeof nodeLevel === 'number' ? nodeLevel : NaN;
      };

      let levelNodes = nodes.filter(n => readLevel(n) === level);

      // 2) Fallback: si no hay nodos con nivel explícito, calcular niveles usando parentId
      if (levelNodes.length === 0) {
        const idToNode = new Map<string, Node>();
        const idToParent = new Map<string, string | null>();
        for (const n of nodes) {
          idToNode.set(n.id, n);
          const data: any = (n as any).data || {};
          let parentId: any = data.parentId ?? null;
          if (typeof parentId === 'number') parentId = String(parentId);
          if (typeof parentId === 'string' && parentId.length === 0) parentId = null;
          idToParent.set(n.id, parentId);
        }

        // raíces = nodos sin padre o con parentId que no existe
        const roots: string[] = [];
        for (const [id, parentId] of idToParent.entries()) {
          if (!parentId || !idToNode.has(String(parentId))) {
            roots.push(id);
          }
        }

        // construir hijos
        const children = new Map<string, string[]>();
        for (const [id] of idToNode.entries()) children.set(id, []);
        for (const [id, parentId] of idToParent.entries()) {
          if (parentId && children.has(String(parentId))) {
            children.get(String(parentId))!.push(id);
          }
        }

        // BFS para asignar niveles
        const computedLevel = new Map<string, number>();
        const queue: Array<{ id: string; lvl: number }> = roots.map(r => ({ id: r, lvl: 0 }));
        while (queue.length) {
          const { id, lvl } = queue.shift()!;
          if (computedLevel.has(id)) continue;
          computedLevel.set(id, lvl);
          const kids = children.get(id) || [];
          for (const k of kids) queue.push({ id: k, lvl: lvl + 1 });
        }

        levelNodes = nodes.filter(n => computedLevel.get(n.id) === level);

        if (levelNodes.length === 0) {
          console.warn(`No nodes found for level ${level}`);
          // Para ayudar a diagnosticar, loguear un resumen
          const exampleLevels = Array.from(new Set(
            nodes.map(n => computedLevel.get(n.id)).filter(v => v !== undefined)
          ));
          console.debug('[REACT FLOW NAV] Niveles detectados (fallback):', exampleLevels);
          return;
        }
      }

      // Si hay nodos en ese nivel, ajustar la vista para mostrarlos
      const nodeIds = levelNodes.map(node => node.id);
      fitToNodes(nodeIds, 0.3);
      
    } catch (error) {
      console.error('Error navigating to level:', error);
    }
  }, [reactFlowInstance, fitToNodes]);

  return {
    centerOnNode,
    centerOnElement,
    fitToNodes,
    fitToScreen,
    panToPosition,
    searchAndCenter,
    navigateToLevel
  };
};