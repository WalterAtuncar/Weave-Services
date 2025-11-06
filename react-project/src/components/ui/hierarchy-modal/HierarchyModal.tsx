import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../modal/Modal';
import { Input } from '../input/input';
import { Search, GitBranch, ChevronRight, ChevronDown, Package, Network } from 'lucide-react';
import { 
  Sistema, 
  getTipoSistemaLabel,
  getFamiliaSistemaLabel
} from '../../../models/Sistemas';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './HierarchyModal.module.css';

export interface HierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  sistema: Sistema;
  sistemas?: Sistema[];
}

interface SistemaNode {
  sistema: Sistema;
  hijos: SistemaNode[];
  nivel: number;
}

export const HierarchyModal: React.FC<HierarchyModalProps> = ({
  isOpen,
  onClose,
  sistema,
  sistemas = []
}) => {
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  if (!sistema) {
    return null;
  }

  // Construir el árbol jerárquico completo
  const buildHierarchyTree = useMemo(() => {
    
    
    // Encontrar todas las raíces (sistemas sin dependencias)
    const roots = sistemas.filter(s => !s.sistemaDepende);

    
    // Función recursiva para construir nodos
    const buildNode = (sistema: Sistema, nivel: number = 0): SistemaNode => {
      const hijos = sistemas
        .filter(s => s.sistemaDepende === sistema.sistemaId)
        .map(s => buildNode(s, nivel + 1));
      

      
      return {
        sistema,
        hijos,
        nivel
      };
    };

    const tree = roots.map(root => buildNode(root));

    return tree;
  }, [sistemas]);

  // Auto-expandir todos los nodos que tienen hijos
  useEffect(() => {
    const nodesToExpand = new Set<number>();
    
    const collectExpandableNodes = (nodes: SistemaNode[]) => {
      nodes.forEach(node => {
        if (node.hijos.length > 0) {
          nodesToExpand.add(node.sistema.sistemaId);
          collectExpandableNodes(node.hijos);
        }
      });
    };
    
    collectExpandableNodes(buildHierarchyTree);

    setExpandedNodes(nodesToExpand);
  }, [buildHierarchyTree]);

  // Encontrar el camino hacia el sistema actual
  const findSystemPath = useMemo(() => {
    const path: Sistema[] = [];
    let currentSistema = sistema;
    
    // Subir hasta la raíz
    while (currentSistema) {
      path.unshift(currentSistema);
      const padre = sistemas.find(s => s.sistemaId === currentSistema.sistemaDepende);
      currentSistema = padre || (null as any);
    }
    
    return path;
  }, [sistema, sistemas]);

  // Filtrar árbol por búsqueda
  const filteredTree = useMemo(() => {
    if (!searchTerm) return buildHierarchyTree;
    
    const filterNode = (node: SistemaNode): SistemaNode | null => {
      const matchesSearch = 
        node.sistema.nombreSistema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.sistema.codigoSistema && node.sistema.codigoSistema.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const filteredHijos = node.hijos.map(filterNode).filter(Boolean) as SistemaNode[];
      
      if (matchesSearch || filteredHijos.length > 0) {
        return {
          ...node,
          hijos: filteredHijos
        };
      }
      
      return null;
    };
    
    return buildHierarchyTree.map(filterNode).filter(Boolean) as SistemaNode[];
  }, [buildHierarchyTree, searchTerm]);

  // Toggle expansión de nodos
  const toggleExpansion = (sistemaId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(sistemaId)) {
      newExpanded.delete(sistemaId);
    } else {
      newExpanded.add(sistemaId);
    }
    setExpandedNodes(newExpanded);
  };

  // Renderizar nodo del árbol
  const renderTreeNode = (node: SistemaNode, isLast: boolean = false) => {
    const isExpanded = expandedNodes.has(node.sistema.sistemaId);
    const hasChildren = node.hijos.length > 0;
    const isCurrentSystem = node.sistema.sistemaId === sistema.sistemaId;
    
    return (
      <div key={node.sistema.sistemaId} className={styles.treeNode}>
        <div 
          className={`${styles.nodeContent} ${isCurrentSystem ? styles.currentSystem : ''}`}
          style={{
            paddingLeft: `${node.nivel * 20 + 8}px`,
            backgroundColor: isCurrentSystem ? colors.primary + '20' : 'transparent',
            borderColor: isCurrentSystem ? colors.primary : colors.border
          }}
        >
          {/* Indicador de expansión */}
          <div className={styles.expandIndicator} onClick={() => hasChildren && toggleExpansion(node.sistema.sistemaId)}>
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={16} style={{ color: colors.textSecondary }} />
              ) : (
                <ChevronRight size={16} style={{ color: colors.textSecondary }} />
              )
            ) : (
              <div style={{ width: 16, height: 16 }} />
            )}
          </div>

          {/* Icono del sistema */}
          <div className={styles.systemIcon} style={{ color: isCurrentSystem ? colors.primary : colors.textSecondary }}>
            <Package size={16} />
          </div>

          {/* Información del sistema */}
          <div className={styles.systemInfo}>
            <div className={styles.systemName} style={{ color: isCurrentSystem ? colors.primary : colors.text }}>
              {node.sistema.nombreSistema}
              {isCurrentSystem && <span className={styles.currentBadge}> (Actual)</span>}
            </div>
            <div className={styles.systemDetails} style={{ color: colors.textSecondary }}>
              {node.sistema.codigoSistema && `${node.sistema.codigoSistema} • `}
              {getTipoSistemaLabel(node.sistema.tipoSistema)} • {getFamiliaSistemaLabel(node.sistema.familiaSistema)}
              {hasChildren && ` • ${node.hijos.length} dependiente${node.hijos.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* Renderizar hijos si está expandido */}
        {hasChildren && isExpanded && (
          <div className={styles.nodeChildren}>
            {node.hijos.map((child, index) => 
              renderTreeNode(child, index === node.hijos.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Árbol Completo de Sistemas"
      size="l"
      hideFooter={true}
    >
      <div className={styles.treeContainer} style={{ 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        marginTop: 0,
        maxHeight: '70vh'
      }}>
        {filteredTree.length > 0 ? (
          <div className={styles.tree}>
            {filteredTree.map((rootNode, index) => 
              renderTreeNode(rootNode, index === filteredTree.length - 1)
            )}
          </div>
        ) : (
          <div className={styles.emptyTree} style={{ color: colors.textSecondary }}>
            <Network size={48} style={{ margin: '0 0 16px 0', opacity: 0.5 }} />
            <div>No hay sistemas disponibles para mostrar</div>
          </div>
        )}
      </div>
    </Modal>
  );
};