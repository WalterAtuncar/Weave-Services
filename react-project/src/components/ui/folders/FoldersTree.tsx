import React, { useMemo, useState, useRef } from 'react';
import { Tree, TreeApi } from 'react-arborist';
import type { NodeRendererProps } from 'react-arborist';
import { Folder as FolderIcon, Plus, FolderPlus, Trash, Pencil, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '../button';
import { Input } from '../input';
import { AlertService } from '../alerts';
import { documentosCarpetasService } from '../../../services/documentos-carpetas.service';

// Tipo de Carpeta genérico para el organismo
export interface Carpeta {
  carpetaId: string | number;
  nombreCarpeta: string;
  carpetaPadreId: string | number | null;
  carpetaPrivada?: boolean;
  version?: number;
  estado?: number;
  registroEliminado?: boolean;
  // Se permiten propiedades adicionales
  [key: string]: any;
}

// Tipado de nodo que consume react-arborist
export type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
  data: any;
};

export interface FoldersTreeProps {
  // Lista de carpetas. Puede venir plana (padreId) o jerárquica (children)
  folders: Carpeta[];
  height?: number;
  width?: number;
  // Modo de uso: 'manage' permite crear/renombrar/mover/eliminar; 'select' solo permite elegir
  mode?: 'manage' | 'select';
  // Callbacks para controlado. Si no se proveen, se manejará estado interno
  onCreate?: (args: { parentId: string | number | null; index: number; type: 'internal' | 'leaf' }) => Promise<Carpeta | Carpeta> | Carpeta | void;
  onRename?: (args: { id: string | number; name: string; parentId?: string | number | null }) => Promise<void> | void;
  onMove?: (args: { dragIds: (string | number)[]; parentId: string | number | null; index: number }) => Promise<void> | void;
  onDelete?: (args: { ids: (string | number)[] }) => Promise<void> | void;
  // Selección actual y callback para reflejar carpeta elegida
  selectedFolderId?: string | number | null;
  onSelectFolder?: (id: string | number | null, ruta?: string) => void;
  // Prop para generar ruta: recibe nodo y devuelve ruta de texto
  resolvePath?: (node: any) => string;
}

// ---- Helpers para construir jerarquía de forma flexible ----
const CHILD_KEYS = [
  'children','Children','childrens','hijos','Hijos','subcarpetas','Subcarpetas','subFolders','subfolders',
  'folders','Folders','carpetas','Carpetas','carpetasHijas','CarpetasHijas','items','Items'
];

const pickChildren = (obj: any): any[] | undefined => {
  for (const k of CHILD_KEYS) {
    const val = obj?.[k];
    if (Array.isArray(val)) return val;
  }
  return undefined;
};

const getId = (obj: any): string => {
  const raw = obj?.carpetaId ?? obj?.CarpetaId ?? obj?.id ?? obj?.ID ?? obj?.Id;
  return String(raw);
};

const getName = (obj: any): string => {
  return (
    obj?.nombreCarpeta ?? obj?.NombreCarpeta ?? obj?.name ?? obj?.Nombre ?? obj?.nombre ?? ''
  );
};

const isHierarchicalInput = (folders: any[]): boolean => {
  return folders?.some((f) => !!pickChildren(f));
};

const convertNode = (obj: any, parentId: string | null = null): TreeNode => {
  const id = getId(obj);
  const name = getName(obj);
  const rawChildren = pickChildren(obj) ?? [];
  const children = rawChildren.map((c: any) => convertNode(c, id));
  return {
    id,
    name,
    children: children.length ? children : undefined,
    data: { ...obj, carpetaId: id, carpetaPadreId: parentId },
  };
};

// Utilidad: transformar plano -> jerárquico si hace falta (soporta entrada jerárquica)
const buildTreeData = (folders: Carpeta[]): TreeNode[] => {
  // Fallback defensivo: si no hay datos válidos, retornar árbol vacío
  if (!Array.isArray(folders) || folders.length === 0) return [];
  // Si ya viene jerárquico, convertir recursivamente respetando children
  if (isHierarchicalInput(folders as any)) {
    return (folders as any[]).map((f) => convertNode(f, null));
  }

  // Si viene plano, construir con mapa por carpetaPadreId
  const map: Record<string, TreeNode> = {};
  const roots: TreeNode[] = [];
  for (const f of folders) {
    const rawId = (f as any).carpetaId ?? (f as any).CarpetaId ?? (f as any).id;
    if (rawId === undefined || rawId === null) continue; // ignorar entradas inválidas
    const nameVal = (f as any).nombreCarpeta ?? (f as any).NombreCarpeta ?? (f as any).name ?? (f as any).nombre ?? (f as any).Nombre ?? '';
    if (!nameVal) continue; // ignorar si no hay nombre
    const id = String(rawId);
    const rawParentId = (f as any).carpetaPadreId ?? (f as any).CarpetaPadreId ?? (f as any).parentId ?? null;
    const parentId = rawParentId == null || rawParentId === '' ? null : String(rawParentId);
    map[id] = {
      id,
      name: String(nameVal),
      children: [],
      data: { ...f, carpetaId: id, carpetaPadreId: parentId },
    };
  }
  for (const id in map) {
    const node = map[id];
    const pId = node.data.carpetaPadreId;
    if (pId == null) {
      roots.push(node);
    } else if (map[pId]) {
      map[pId].children ??= [];
      map[pId].children!.push(node);
    } else {
      // Si no existe el padre, lo consideramos raíz para no perder nodos
      roots.push(node);
    }
  }
  return roots;
};

// ===== Helpers de entorno: obtener organización y usuario desde localStorage =====
const getOrganizationId = (): number => {
  try {
    const raw = localStorage.getItem('userSession');
    if (raw) {
      const session = JSON.parse(raw);
      const orgId = session?.organizacion?.organizacionId;
      if (typeof orgId === 'number') return orgId;
      if (typeof orgId === 'string') {
        const parsed = Number(orgId);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  } catch {}
  return 1; // Fallback
};

const getUserId = (): number => {
  try {
    const raw = localStorage.getItem('userSession');
    if (raw) {
      const session = JSON.parse(raw);
      const userId = session?.usuario?.usuarioId;
      if (typeof userId === 'number') return userId;
      if (typeof userId === 'string') {
        const parsed = Number(userId);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  } catch {}
  return 1; // Fallback
};

const mapResponseToFlatCarpetas = (items: any[], userId: number): Carpeta[] => {
  const filtered = items.filter((c: any) => {
    const esPrivada = c?.carpetaPrivada === true || c?.carpetaPrivada === 'true';
    if (!esPrivada) return true;
    const creadoPor = c?.creadoPor ?? c?.CreadoPor ?? c?.creado_por ?? null;
    if (creadoPor === null || creadoPor === undefined) return false;
    const creadoNum = Number(creadoPor);
    return Number.isFinite(creadoNum) && creadoNum === userId;
  });
  return filtered
    .map((c: any) => ({
      carpetaId: c?.carpetaId ?? c?.CarpetaId ?? c?.Id,
      nombreCarpeta: c?.nombreCarpeta ?? c?.NombreCarpeta ?? c?.name,
      carpetaPadreId: c?.carpetaPadreId ?? c?.CarpetaPadreId ?? null,
    }))
    .filter((x: any) => x?.carpetaId !== undefined && x?.nombreCarpeta);
};

export const FoldersTree: React.FC<FoldersTreeProps> = ({
  folders,
  height = 420,
  width,
  mode = 'manage',
  onCreate,
  onRename,
  onMove,
  onDelete,
  selectedFolderId,
  onSelectFolder,
  resolvePath,
}) => {
  // Estado interno cuando no hay callbacks (modo no controlado)
  const [internalData, setInternalData] = useState<any[]>(() => Array.isArray(folders) ? buildTreeData(folders) : []);
  // Considerar el árbol "controlado" solo si el padre provee onCreate.
  // Si no hay onCreate, usamos datos internos para que las acciones del toolbar funcionen.
  const useControlled = !!onCreate;
  const treeRef = useRef<TreeApi<TreeNode> | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSelectedId, setLastSelectedId] = useState<string | number | null>(selectedFolderId ?? null);
  // Medir ancho del contenedor para pasar valor numérico al Tree
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setContainerWidth(Math.round(rect.width));
    });
    ro.observe(el);
    // Inicial
    setContainerWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  // Mantener sincronizado el estado interno con las props cuando NO es controlado
  React.useEffect(() => {
    if (!useControlled) {
      const next = Array.isArray(folders) ? buildTreeData(folders) : [];
      setInternalData(next);
    }
  }, [folders, useControlled]);

  // Utilidades para expandir/colapsar todo el árbol
  const expandAll = () => {
    const api = treeRef.current as any;
    if (!api) return;
    if (typeof api.openAll === 'function') { api.openAll(); return; }
    const walk = (n: any) => { n.open?.(); (n.children ?? []).forEach(walk); };
    (api.root?.children ?? []).forEach(walk);
  };
  const collapseAll = () => {
    const api = treeRef.current as any;
    if (!api) return;
    if (typeof api.closeAll === 'function') { api.closeAll(); return; }
    const walk = (n: any) => { n.close?.(); (n.children ?? []).forEach(walk); };
    (api.root?.children ?? []).forEach(walk);
  };

  const data = useMemo(() => {
    return useControlled ? (Array.isArray(folders) ? buildTreeData(folders) : []) : internalData;
  }, [folders, internalData, useControlled]);

  async function refreshTreeFromBackend() {
    try {
      const organizacionId = getOrganizationId();
      const userId = getUserId();
      const resp = await documentosCarpetasService.getCarpetas({ organizacionId, includeDeleted: false });
      const carpetasRaw = resp?.success && Array.isArray(resp.data) ? resp.data : [];
      const carpetas = mapResponseToFlatCarpetas(carpetasRaw, userId);
      setInternalData(buildTreeData(carpetas));
    } catch (error) {
      // Fallback: ante error, vaciar árbol para evitar estados inconsistentes
      setInternalData([]);
      AlertService.error('Error al actualizar las carpetas.');
    }
  }

  function Node({ node, style, dragHandle }: NodeRendererProps<TreeNode>) {
    const isSelected = String(selectedFolderId ?? "") === String(node.id);
    const initialName = String(
      node.data?.nombreCarpeta ??
      (node.data as any)?.NombreCarpeta ??
      node.name ??
      (node.data as any)?.name ??
      (node.data as any)?.nombre ??
      (node.data as any)?.Nombre ??
      ""
    );
    const [draft, setDraft] = useState<string>(initialName);
    // Mostrar chevron solo si la carpeta tiene hijos
    const hasChildren = Array.isArray((node as any).children) && (node as any).children.length > 0;
    const canToggle = hasChildren;
    const isOpen = (node as any).isOpen;

    React.useEffect(() => {
      if (node.isEditing) {
        const nameForEdit = String(
          node.data?.nombreCarpeta ??
          (node.data as any)?.NombreCarpeta ??
          node.name ??
          (node.data as any)?.name ??
          (node.data as any)?.nombre ??
          (node.data as any)?.Nombre ??
          ""
        );
        setDraft(nameForEdit);
      }
    }, [node.isEditing]);

    const commitRename = async () => {
      const next = (draft || "").trim();
      const fallback = String(
        node.data?.nombreCarpeta ??
        (node.data as any)?.NombreCarpeta ??
        node.name ??
        (node.data as any)?.name ??
        (node.data as any)?.nombre ??
        (node.data as any)?.Nombre ??
        ""
      );
      const finalName = next.length ? next : fallback;

      // Evitar crear/renombrar con nombre vacío
      if (!finalName || !finalName.trim()) {
        AlertService.error('Ingrese un nombre de carpeta válido');
        (node as any).reset?.();
        return;
      }

      // Determinar si es un nodo recién creado (temporal) ANTES de hacer submit
      const isNewTemp = Boolean(node.data?.__isTempNew) || String(node.id).startsWith('temp-');

      node.submit(finalName);

      // Si es un nodo temporal recién creado, pedir confirmación simple y persistir como pública
      if (isNewTemp && !node.data?.__creatingHandled) {
        node.data.__creatingHandled = true;

        const confirmed = await AlertService.confirm('¿Está seguro de crear la carpeta?', {
          title: 'Confirmación',
          confirmText: 'Crear',
          cancelText: 'Cancelar',
          position: 'top-right',
          closable: true,
        });

        if (!confirmed) {
          // Si se cancela, revertimos la edición y refrescamos desde backend para limpiar el nodo temporal
          (node as any).reset?.();
          await refreshTreeFromBackend();
          return;
        }

        const loadingId = AlertService.loading('Creando carpeta...');
        try {
          const organizacionId = getOrganizationId();
          const selectedFromTree = Array.from(treeRef.current?.selectedIds ?? [])[0] ?? null;
          const parentFromNodeParent = (node as any)?.parent?.id ?? (node as any)?.parent?.data?.carpetaId ?? null;
          let rawParent = node.data?.carpetaPadreId
            ?? parentFromNodeParent
            ?? (selectedFolderId ?? lastSelectedId ?? selectedFromTree ?? treeRef.current?.mostRecentNode?.id ?? null);
          if (typeof rawParent === 'string' && rawParent.startsWith('temp-')) {
            rawParent = (selectedFolderId ?? lastSelectedId ?? selectedFromTree ?? null) as any;
          }
          // Mapear raíz interna de react-arborist a null para API
          if (rawParent === '__REACT_ARBORIST_INTERNAL_ROOT__') {
            rawParent = null as any;
          }
          const parentId = rawParent == null
            ? null
            : (typeof rawParent === 'string'
                ? (/^\d+$/.test(rawParent) ? Number(rawParent) : null)
                : (typeof rawParent === 'number' ? rawParent : null));
          console.log('[FoldersTree] commit createCarpeta parentId:', parentId);

           const resp = await documentosCarpetasService.createCarpeta({
             organizacionId,
             nombreCarpeta: finalName,
             carpetaPadreId: parentId,
             carpetaPrivada: false
           } as any);

          if (resp?.success) {
            AlertService.updateLoading(loadingId as any, 'success', 'Carpeta creada correctamente');
            await refreshTreeFromBackend();
          } else {
            AlertService.updateLoading(loadingId as any, 'error', resp?.message || 'Error al crear carpeta');
            await refreshTreeFromBackend();
          }
        } catch (e) {
          AlertService.updateLoading(loadingId as any, 'error', 'Error al crear carpeta');
          await refreshTreeFromBackend();
        }
      }
    };

    if (mode === 'manage' && node.isEditing) {
      return (
        <div
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 6,
            background: "var(--color-primary-50, #f8fafc)",
          }}
          ref={mode === 'manage' ? (dragHandle as any) : undefined}
        >
          {canToggle ? (
            <button
              onClick={(e) => { e.stopPropagation(); (node as any).toggle?.(); }}
              aria-label={isOpen ? "Colapsar" : "Expandir"}
              style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : <span style={{ width: 16 }} />}
          <FolderIcon size={16} color="#f59e0b" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") (node as any).reset?.();
            }}
            aria-label="Renombrar carpeta"
            style={{
              flex: 1,
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: "2px 6px",
              height: 24,
            }}
          />
        </div>
      );
    }

    return (
      <div
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 6,
          background: isSelected ? "var(--color-primary-100, #eef6ff)" : "transparent",
          cursor: "pointer",
        }}
        ref={mode === 'manage' ? (dragHandle as any) : undefined}
        onClick={() => {
          const ruta = resolvePath ? resolvePath(node) : undefined;
          const idOut = node.data?.carpetaId ?? node.id;
          const idOutNorm = typeof idOut === "string" && /^\d+$/.test(idOut) ? Number(idOut) : idOut;
          console.log('[FoldersTree] click carpeta id:', idOutNorm);
          setLastSelectedId(idOutNorm as any);
          treeRef.current?.select(String(idOutNorm));
          onSelectFolder?.(idOutNorm as any, ruta);
        }}
        onDoubleClick={mode === 'manage' ? () => node.edit() : undefined}
      >
        {canToggle ? (
          <button
            onClick={(e) => { e.stopPropagation(); (node as any).toggle?.(); }}
            aria-label={isOpen ? "Colapsar" : "Expandir"}
            style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : <span style={{ width: 16 }} />}
        <FolderIcon size={16} color="#f59e0b" />
        <span>{node.data?.nombreCarpeta ?? node.data?.name ?? (node.data as any)?.NombreCarpeta ?? (node.data as any)?.nombre ?? (node.data as any)?.Nombre}</span>
      </div>
    );
  }

  // Handlers por defecto para modo no controlado (optimista)
  const defaultHandlers = {
    onCreate: ({ parentId, index, type }: any) => {
      const tempId = `temp-${Date.now()}`;
      const newNode = { id: tempId, name: '', children: [], data: { carpetaId: tempId, nombreCarpeta: '', carpetaPadreId: parentId, __isTempNew: true } };
      // Insertar en internalData
      setInternalData(prev => {
        const clone = structuredClone(prev);
        const insertAt = (list: any[], pId: any) => {
          if (pId == null) {
            list.splice(index ?? list.length, 0, newNode);
            return true;
          }
          for (const item of list) {
            if (String(item.id) === String(pId)) {
              item.children ??= [];
              item.children.splice(index ?? 0, 0, newNode);
              return true;
            }
            if (item.children?.length && insertAt(item.children, pId)) return true;
          }
          return false;
        };
        insertAt(clone, parentId);
        return clone;
      });
      // Abrir edición inmediatamente
      setTimeout(() => treeRef.current?.edit(tempId), 0);
    },
    onRename: ({ id, name }: any) => {
      setInternalData(prev => {
        const update = (list: any[]): boolean => {
          for (const item of list) {
            if (String(item.id) === String(id)) { item.name = name; item.data.nombreCarpeta = name; return true; }
            if (item.children?.length && update(item.children)) return true;
          }
          return false;
        };
        const clone = structuredClone(prev);
        update(clone);
        return clone;
      });
    },
    onMove: ({ dragIds, parentId, index }: any) => {
      setInternalData(prev => {
        const clone = structuredClone(prev);
        // Extraer nodos por ids
        const extracted: any[] = [];
        const removeById = (list: any[], ids: any[]) => {
          for (let i = list.length - 1; i >= 0; i--) {
            const item = list[i];
            if (ids.map(String).includes(String(item.id))) { extracted.push(item); list.splice(i, 1); continue; }
            if (item.children?.length) removeById(item.children, ids);
          }
        };
        removeById(clone, dragIds);
        const insertAt = (list: any[], pId: any) => {
          if (pId == null) { list.splice(index ?? list.length, 0, ...extracted); return true; }
          for (const item of list) {
            if (String(item.id) === String(pId)) { item.children ??= []; item.children.splice(index ?? 0, 0, ...extracted); return true; }
            if (item.children?.length && insertAt(item.children, pId)) return true;
          }
          return false;
        };
        insertAt(clone, parentId);
        return clone;
      });
    },
    onDelete: ({ ids }: any) => {
      setInternalData(prev => {
        const clone = structuredClone(prev);
        const removeById = (list: any[], ids2: any[]) => {
          for (let i = list.length - 1; i >= 0; i--) {
            const item = list[i];
            if (ids2.map(String).includes(String(item.id))) { list.splice(i, 1); continue; }
            if (item.children?.length) removeById(item.children, ids2);
          }
        };
        removeById(clone, ids);
        return clone;
      });
    }
  };

  const toolbar = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        gap: 8,
        width: '100%',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      {mode === 'manage' ? (
        <div style={{ display: 'flex', gap: 8, flex: '1 1 auto', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="m"
            iconName="Plus"
            title="Nueva carpeta en raíz"
            onClick={() => {
              const idx = (treeRef.current?.root.children?.length ?? 0);
              treeRef.current?.create({ type: 'internal', parentId: null, index: idx });
            }}
          >
            Crear raíz
          </Button>
          <Button
            variant="action"
            size="m"
            iconName="FolderPlus"
            title="Nueva subcarpeta"
            onClick={() => {
              const selectedFromTree = Array.from(treeRef.current?.selectedIds ?? [])[0] ?? null;
              const fallbackId = treeRef.current?.mostRecentNode?.id ?? null;
              const effectiveId = (selectedFolderId ?? lastSelectedId ?? selectedFromTree ?? fallbackId) as any;
              const parentId = effectiveId == null ? null : String(effectiveId);
              const idx = 0;
              treeRef.current?.create({ type: 'internal', parentId, index: idx });
            }}
          >
            Subcarpeta
          </Button>
          <Button
            variant="primary"
            size="m"
            iconName="Pencil"
            title="Renombrar selección"
            onClick={() => {
              const id = selectedFolderId == null ? treeRef.current?.mostRecentNode?.id ?? null : String(selectedFolderId);
              if (id) treeRef.current?.edit(id);
            }}
          >
            Renombrar
          </Button>
          <Button
            variant="action"
            size="m"
            iconName="Trash"
            title="Eliminar selección"
            onClick={() => {
              const ids = Array.from(treeRef.current?.selectedIds ?? []);
              if (ids.length) treeRef.current?.delete(ids);
            }}
          >
            Eliminar
          </Button>
          <Button
            variant="primary"
            size="m"
            iconName="ChevronDown"
            title="Expandir todo"
            onClick={expandAll}
          >
            Expandir todo
          </Button>
          <Button
            variant="action"
            size="m"
            iconName="ChevronRight"
            title="Colapsar todo"
            onClick={collapseAll}
          >
            Colapsar todo
          </Button>
        </div>
      ) : (
        <div style={{ flex: '1 1 auto' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 320px' }}>
        <Input
          icon="Search"
          placeholder="Buscar carpeta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );

  // Wrappers: ejecutan handlers del padre y actualizan estado interno para feedback inmediato
  const isTempOrNonNumeric = (id: string | number): boolean => {
    if (id == null) return true;
    if (typeof id === 'number') return !Number.isFinite(id);
    const s = String(id);
    if (s.startsWith('temp-')) return true;
    return !/^\d+$/.test(s);
  };

  const wrappedOnRename = mode === 'manage'
    ? ((args: { id: string | number; name: string }) => {
        // Evitar PUT al backend cuando el id es temporal o no numérico (creación)
        try {
          if (!isTempOrNonNumeric(args.id)) {
            // Calcular parentId leyendo el árbol actual
            const findParentId = (nodes: TreeNode[], targetId: string, parentId: string | null = null): string | null => {
              for (const n of nodes) {
                if (String(n.id) === targetId) return parentId;
                const children = n.children ?? [];
                if (children.length) {
                  const res = findParentId(children, targetId, String(n.id));
                  if (res !== null) return res;
                }
              }
              return null;
            };
            const computedParentId = findParentId(data, String(args.id));
            onRename?.({ id: args.id, name: args.name, parentId: computedParentId });
          }
        } finally {
          defaultHandlers.onRename(args as any);
        }
      })
    : undefined;

  const wrappedOnMove = mode === 'manage'
    ? ((args: { dragIds: (string | number)[]; parentId: string | number | null; index?: number }) => {
        try { onMove?.(args); } finally { defaultHandlers.onMove(args as any); }
      })
    : undefined;

  const wrappedOnDelete = mode === 'manage'
    ? ((args: { ids: (string | number)[] }) => {
        try { onDelete?.(args); } finally { defaultHandlers.onDelete(args as any); }
      })
    : undefined;

  return (
    <div ref={wrapperRef} style={{ width: typeof width === 'number' ? width : '100%', height }}>
      {toolbar}
      <Tree
        ref={treeRef as any}
        data={data}
        height={height}
        width={typeof width === 'number' ? width : (containerWidth ?? undefined)}
        // Si se desea abrir todo por defecto
        openByDefault={true}
        padding={8}
        indent={16}
        selection={selectedFolderId == null ? null : String(selectedFolderId)}
        searchTerm={searchTerm}
        onCreate={mode === 'manage' ? (onCreate ?? defaultHandlers.onCreate) : undefined}
        onRename={wrappedOnRename}
        onMove={wrappedOnMove}
        onDelete={wrappedOnDelete}
      >
        {Node}
      </Tree>
    </div>
  );
};