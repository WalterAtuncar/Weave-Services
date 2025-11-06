import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { PageHeader } from '../../ui/page-header';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertService } from '../../ui/alerts';
import { FoldersTree, type Carpeta } from '../../ui/folders/FoldersTree';
import { ArrowLeft, RefreshCw, EyeOff, Eye, RotateCcw } from 'lucide-react';
import { documentosCarpetasService } from '../../../services/documentos-carpetas.service';
import styles from './Documentos.module.css';

interface CarpetasManagerProps {
  onBack?: () => void;
}

// Helpers to read organization and user from session
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
  return 1;
};

const getUserId = (): number => {
  try {
    const raw = localStorage.getItem('userSession');
    if (raw) {
      const session = JSON.parse(raw);
      const userId = session?.usuario?.usuarioId;
      const parsed = Number(userId);
      if (Number.isFinite(parsed)) return parsed;
    }
  } catch {}
  return 1;
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
      carpetaPrivada: c?.carpetaPrivada ?? false,
      registroEliminado: c?.registroEliminado ?? c?.RegistroEliminado ?? false,
    }))
    .filter((x: any) => x?.carpetaId !== undefined && x?.nombreCarpeta);
};

export const CarpetasManager: React.FC<CarpetasManagerProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const [folders, setFolders] = useState<Carpeta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | number | null>(null);
  const [selectedRuta, setSelectedRuta] = useState<string | undefined>(undefined);

  const foldersById = useMemo(() => {
    const map = new Map<string, Carpeta>();
    folders.forEach(f => map.set(String(f.carpetaId), f));
    return map;
  }, [folders]);

  const resolvePath = (node: any): string => {
    try {
      const names: string[] = [];
      let curr: any = node;
      while (curr) {
        const nm = curr.data?.nombreCarpeta ?? curr.data?.NombreCarpeta ?? curr.name;
        if (nm) names.unshift(String(nm));
        curr = curr.parent;
      }
      return names.join('/');
    } catch {
      return String(node?.name || node?.data?.nombreCarpeta || '');
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const organizacionId = getOrganizationId();
      const userId = getUserId();
      const resp = await documentosCarpetasService.getCarpetas({ organizacionId, includeDeleted });
      const raw = resp?.success && Array.isArray(resp.data) ? resp.data : [];
      const mapped = mapResponseToFlatCarpetas(raw, userId);
      setFolders(mapped);
    } catch (error) {
      await AlertService.error('No se pudieron cargar las carpetas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [includeDeleted]);

  const handleSelectFolder = (id: string | number | null, ruta?: string) => {
    setSelectedFolderId(id);
    setSelectedRuta(ruta);
  };

  const normalizeParentId = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return Number.isFinite(val) ? val : null;
    const s = String(val).trim();
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' || s === '__REACT_ARBORIST_INTERNAL_ROOT__') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const handleRename = async ({ id, name, parentId }: { id: string | number; name: string; parentId?: string | number | null }) => {
    const organizacionId = getOrganizationId();
    const current = foldersById.get(String(id));
    const carpetaPrivada = Boolean(current?.carpetaPrivada ?? false);
    // Usar parentId si viene del árbol; si no, caer al valor actual del mapa
    const carpetaPadreId = parentId !== undefined
      ? normalizeParentId(parentId)
      : normalizeParentId(current?.carpetaPadreId);
    const loadingId = AlertService.loading('Renombrando carpeta...');
    try {
      const resp = await documentosCarpetasService.updateCarpeta(Number(id), {
        carpetaId: Number(id),
        organizacionId,
        nombreCarpeta: name,
        carpetaPadreId,
        carpetaPrivada,
      } as any);
      if (resp?.success) {
        AlertService.updateLoading(loadingId as any, 'success', 'Carpeta renombrada');
        await refresh();
      } else {
        AlertService.updateLoading(loadingId as any, 'error', resp?.message || 'Error al renombrar carpeta');
      }
    } catch (e) {
      AlertService.updateLoading(loadingId as any, 'error', 'Error al renombrar carpeta');
    }
  };

  const handleMove = async ({ dragIds, parentId }: { dragIds: (string | number)[]; parentId: string | number | null; index?: number }) => {
    const loadingId = AlertService.loading('Moviendo carpeta(s)...');
    try {
      const nuevoPadreId = parentId == null ? null : (typeof parentId === 'string' ? Number(parentId) : Number(parentId));
      for (const rawId of dragIds) {
        const idNum = typeof rawId === 'string' ? Number(rawId) : Number(rawId);
        if (!Number.isFinite(idNum)) continue;
        await documentosCarpetasService.moveCarpeta(idNum, nuevoPadreId);
      }
      AlertService.updateLoading(loadingId as any, 'success', 'Carpeta(s) movida(s)');
      await refresh();
    } catch (e) {
      AlertService.updateLoading(loadingId as any, 'error', 'Error al mover carpetas');
    }
  };

  const handleDelete = async ({ ids }: { ids: (string | number)[] }) => {
    const confirm = await AlertService.confirm('¿Eliminar carpeta(s) seleccionada(s)?', {
      title: 'Eliminar carpetas',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      position: 'top-right',
      closable: true,
    });
    if (!confirm) return;
    const loadingId = AlertService.loading('Eliminando carpeta(s)...');
    try {
      for (const rawId of ids) {
        const idNum = typeof rawId === 'string' ? Number(rawId) : Number(rawId);
        if (!Number.isFinite(idNum)) continue;
        await documentosCarpetasService.deleteCarpeta(idNum, false);
      }
      AlertService.updateLoading(loadingId as any, 'success', 'Carpeta(s) eliminada(s)');
      await refresh();
    } catch (e) {
      AlertService.updateLoading(loadingId as any, 'error', 'Error al eliminar carpetas');
    }
  };

  const handleRestore = async () => {
    if (selectedFolderId == null) return;
    const confirm = await AlertService.confirm('¿Restaurar la carpeta seleccionada?', {
      title: 'Restaurar carpeta',
      confirmText: 'Restaurar',
      cancelText: 'Cancelar',
      position: 'top-right',
      closable: true,
    });
    if (!confirm) return;
    const loadingId = AlertService.loading('Restaurando carpeta...');
    try {
      const idNum = typeof selectedFolderId === 'string' ? Number(selectedFolderId) : Number(selectedFolderId);
      const resp = await documentosCarpetasService.restoreCarpeta(idNum);
      if (resp?.success) {
        AlertService.updateLoading(loadingId as any, 'success', 'Carpeta restaurada');
        await refresh();
      } else {
        AlertService.updateLoading(loadingId as any, 'error', resp?.message || 'Error al restaurar carpeta');
      }
    } catch (e) {
      AlertService.updateLoading(loadingId as any, 'error', 'Error al restaurar carpeta');
    }
  };

  const selectedIsDeleted = useMemo(() => {
    if (selectedFolderId == null) return false;
    const f = foldersById.get(String(selectedFolderId));
    return Boolean(f?.registroEliminado);
  }, [selectedFolderId, foldersById]);

  return (
    <div className={styles.documentosContainer} style={{ backgroundColor: colors.background }}>
      <PageHeader
        title="Gestión de Carpetas"
        description="Crea, renombra, mueve o elimina carpetas"
        actions={[
          {
            label: 'Volver al menú',
            icon: <ArrowLeft size={16} />,
            variant: 'outline',
            onClick: onBack,
          },
          {
            label: 'Recargar',
            icon: <RefreshCw size={16} />,
            onClick: refresh,
          },
          includeDeleted ? {
            label: 'Ocultar eliminadas',
            icon: <EyeOff size={16} />,
            onClick: () => setIncludeDeleted(false),
          } : {
            label: 'Mostrar eliminadas',
            icon: <Eye size={16} />,
            onClick: () => setIncludeDeleted(true),
          },
          includeDeleted && selectedIsDeleted ? {
            label: 'Restaurar',
            icon: <RotateCcw size={16} />,
            variant: 'outline',
            onClick: handleRestore,
            primary: true,
          } : undefined,
        ].filter(Boolean) as any}
      />

      <div className="px-6 pb-6">
        <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <CardHeader>
            <CardTitle>Árbol de Carpetas</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ marginBottom: 8, color: colors.textSecondary }}>
              {selectedFolderId != null ? (
                <span>Seleccionado: {selectedRuta || selectedFolderId}</span>
              ) : (
                <span>Selecciona una carpeta para ver su ruta.</span>
              )}
            </div>
            <FoldersTree
              folders={folders as any}
              height={520}
              width={undefined as any}
              selectedFolderId={selectedFolderId ?? null}
              onSelectFolder={handleSelectFolder}
              resolvePath={resolvePath}
              onRename={handleRename}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CarpetasManager;