import React, { useMemo, useRef, useState } from 'react';
import { Tree, TreeApi } from 'react-arborist';
import type { NodeRendererProps } from 'react-arborist';
import { Folder as FolderIcon, FileText, ChevronRight, ChevronDown, Download as DownloadIcon, Eye } from 'lucide-react';
import type { Documento } from './types';
import styles from './DocumentHierarchyTree.module.css';
import { useTheme } from '../../../contexts/ThemeContext';

export interface CarpetaNodeInput {
  carpetaId: number | string;
  nombreCarpeta: string;
  carpetaPadreId?: number | string | null;
}

type TreeNode = {
  id: string;
  type: 'folder' | 'doc';
  name: string;
  children?: TreeNode[];
  data: any;
};

export interface DocumentHierarchyTreeProps {
  folders: CarpetaNodeInput[];
  docs: Documento[];
  height?: number;
  width?: number;
  onOpen?: (doc: Documento) => void;
  onDownload?: (doc: Documento) => void;
  showLeafActions?: boolean; // Mostrar botones Ver/Descargar en hojas
}

const toId = (v: string | number | null | undefined) =>
  v == null ? null : String(v);

const buildTree = (folders: CarpetaNodeInput[], docs: Documento[]): TreeNode[] => {
  const folderMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Crear nodos de carpetas
  for (const f of folders) {
    const id = toId(f.carpetaId)!;
    const node: TreeNode = {
      id,
      type: 'folder',
      name: f.nombreCarpeta,
      children: [],
      data: { ...f },
    };
    folderMap.set(id, node);
  }

  // Vincular jerarquía de carpetas
  for (const f of folders) {
    const id = toId(f.carpetaId)!;
    const parentId = toId(f.carpetaPadreId);
    const node = folderMap.get(id)!;
    if (parentId && folderMap.has(parentId)) {
      (folderMap.get(parentId)!.children ||= []).push(node);
    } else {
      roots.push(node);
    }
  }

  // Insertar documentos como hojas bajo su carpeta
  const unassigned: TreeNode[] = [];
  for (const d of docs) {
    const folderId = toId(d.carpetaId ?? null);
    const docNode: TreeNode = {
      id: `doc-${d.id}`,
      type: 'doc',
      name: d.titulo,
      data: { ...d },
    };
    if (folderId && folderMap.has(folderId)) {
      (folderMap.get(folderId)!.children ||= []).push(docNode);
    } else {
      unassigned.push(docNode);
    }
  }

  if (unassigned.length) {
    roots.push({
      id: '__sin_carpeta__',
      type: 'folder',
      name: 'Sin carpeta',
      children: unassigned,
      data: { carpetaId: null, nombreCarpeta: 'Sin carpeta', carpetaPadreId: null },
    });
  }

  return roots;
};

export const DocumentHierarchyTree: React.FC<DocumentHierarchyTreeProps> = ({
  folders,
  docs,
  height = 480,
  width,
  onOpen,
  onDownload,
  showLeafActions = true,
}) => {
  const treeRef = useRef<TreeApi<TreeNode> | undefined>(undefined);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { colors } = useTheme();

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setContainerWidth(Math.round(rect.width));
    });
    ro.observe(el);
    setContainerWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => buildTree(folders, docs), [folders, docs]);

  function Node({ node, style }: NodeRendererProps<TreeNode>) {
    // node.data es nuestro TreeNode; el documento real vive en node.data.data cuando type === 'doc'
    const item = node.data as any;
    const itemData = (item && item.data) ? item.data : item;
    const type = (item?.type ?? node.type) as 'folder' | 'doc';
    const hasChildren = Array.isArray((node as any).children) && (node as any).children.length > 0;
    const canToggle = type === 'folder' && hasChildren;
    const isOpen = (node as any).isOpen;

    const displayLabel = (() => {
      if (type === 'folder') {
        return (
          (item?.nombreCarpeta as string) ??
          (item?.name as string) ??
          (node as any)?.name ??
          ''
        );
      }
      const d = itemData as Documento;
      return (
        (d?.titulo as string) ??
        (item?.name as string) ??
        (node as any)?.name ??
        ''
      );
    })();

    return (
      <div
        style={style}
        className={`${styles.nodeRow} ${type === 'doc' ? styles.nodeRowDoc : ''}`}
        onClick={() => {
          if (type === 'doc' && onOpen) onOpen(itemData as Documento);
        }}
      >
        {canToggle ? (
          <button
            onClick={(e) => { e.stopPropagation(); (node as any).toggle?.(); }}
            aria-label={isOpen ? 'Colapsar' : 'Expandir'}
            className={styles.toggleBtn}
            title={isOpen ? 'Colapsar' : 'Expandir'}
          >
            {isOpen ? <ChevronDown size={16} color={colors.textSecondary} /> : <ChevronRight size={16} color={colors.textSecondary} />}
          </button>
        ) : <span style={{ width: 24 }} />}

        <span className={styles.iconWrap} aria-hidden="true">
          {type === 'folder' ? (
            <FolderIcon size={14} color="#f59e0b" />
          ) : (
            <FileText size={14} color="#0ea5e9" />
          )}
        </span>

        <span
          className={styles.label}
          title={displayLabel}
          style={{ color: colors.text }}
        >
          {displayLabel}
        </span>

        {type === 'doc' && showLeafActions && (
          <div className={styles.leafActions}>
            <button
              title="Ver"
              onClick={(e) => { e.stopPropagation(); onOpen?.(itemData as Documento); }}
              className={styles.actionIconBtn}
            >
              <Eye size={16} color={colors.textSecondary} />
            </button>
            <button
              title="Descargar"
              onClick={(e) => { e.stopPropagation(); onDownload?.(itemData as Documento); }}
              className={styles.actionIconBtn}
            >
              <DownloadIcon size={16} color={colors.textSecondary} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ width: typeof width === 'number' ? width : '100%', height }} className={styles.treeWrapper}>
      <div className={styles.toolbar} style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
        <input
          placeholder="Buscar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
        />
      </div>

      <Tree
        ref={treeRef as any}
        data={data}
        height={height}
        width={typeof width === 'number' ? width : (containerWidth ?? undefined)}
        openByDefault={true}
        padding={8}
        indent={16}
        searchTerm={searchTerm}
        className={styles.tree}
      >
        {Node}
      </Tree>
    </div>
  );
};

export default DocumentHierarchyTree;