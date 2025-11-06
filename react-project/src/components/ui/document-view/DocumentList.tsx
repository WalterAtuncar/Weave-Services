import React, { useMemo, useState } from 'react';
import { Eye, MoreVertical, Download, FileText, Shield, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../button';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './DocumentList.module.css';
import { Documento } from './types';
import { ContextMenu, type ContextMenuItem } from '../context-menu/ContextMenu';
import { Checkbox } from '../checkbox';
import { Avatar } from '../avatar';

export interface DocumentListProps {
  docs: Documento[];
  onOpen?: (doc: Documento) => void;
  onDownload?: (doc: Documento) => void;
  onMore?: (doc: Documento) => void;
  onGovernance?: (doc: Documento) => void;
  onEdit?: (doc: Documento) => void;
  onDelete?: (doc: Documento) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ docs, onOpen, onDownload, onMore, onGovernance, onEdit, onDelete }) => {
  const { colors } = useTheme();
  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextDoc, setContextDoc] = useState<Documento | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<'titulo' | 'propietario' | 'fecha' | 'sizeBytes'>('titulo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const contextItems: ContextMenuItem[] = useMemo(() => [
    {
      id: 'gobierno',
      label: 'Gobierno',
      icon: <Shield size={14} />,
      onClick: () => contextDoc && onGovernance?.(contextDoc)
    },
    {
      id: 'editar',
      label: 'Editar',
      icon: <Edit size={14} />,
      onClick: () => contextDoc && onEdit?.(contextDoc)
    },
    {
      id: 'eliminar',
      label: 'Eliminar',
      icon: <Trash2 size={14} />,
      onClick: () => contextDoc && onDelete?.(contextDoc)
    }
  ], [contextDoc, onGovernance, onEdit, onDelete]);

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0; let val = bytes;
    while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
    return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
  };
  const formatDate = (iso?: string) => {
    try {
      if (!iso) return '-';
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '-'; }
  };

  const sortedDocs = useMemo(() => {
    const arr = [...docs];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let res = 0;
      if (sortKey === 'sizeBytes') {
        res = (av ?? 0) as number - (bv ?? 0) as number;
      } else if (sortKey === 'fecha') {
        res = new Date(av as string).getTime() - new Date(bv as string).getTime();
      } else {
        res = String(av ?? '').localeCompare(String(bv ?? ''), 'es', { sensitivity: 'base' });
      }
      return sortDir === 'asc' ? res : -res;
    });
    return arr;
  }, [docs, sortKey, sortDir]);

  const openContextMenu = (e: React.MouseEvent, doc: Documento) => {
    e.stopPropagation();
    setContextPos({ x: e.clientX, y: e.clientY });
    setContextDoc(doc);
    setContextOpen(true);
    onMore?.(doc);
  };

  const toggleRowSelection = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSort = (key: 'titulo' | 'propietario' | 'fecha' | 'sizeBytes') => {
    setSortKey(prev => (prev === key ? prev : key));
    setSortDir(prev => (sortKey === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
  };

  return (
    <div>
      <div className={styles.headerRow} style={{ backgroundColor: '#1E293B !important', color: '#fff' }}>
        <div className={styles.headerCell}>
          <Checkbox aria-label="Seleccionar todos" checked={selectedIds.size === docs.length && docs.length > 0} onCheckedChange={(checked) => {
            setSelectedIds(checked ? new Set(docs.map(d => d.id)) : new Set());
          }} />
        </div>
        <button className={`${styles.headerCell} ${styles.headerCellClickable}`} onClick={() => toggleSort('titulo')}>
          Nombre {sortKey === 'titulo' && (sortDir === 'asc' ? <ArrowUp size={14} className={styles.sortIcon} /> : <ArrowDown size={14} className={styles.sortIcon} />)}
        </button>
        <button className={`${styles.headerCell} ${styles.headerCellClickable} ${styles.ownerHeader}`} onClick={() => toggleSort('propietario')}>
          Propietario {sortKey === 'propietario' && (sortDir === 'asc' ? <ArrowUp size={14} className={styles.sortIcon} /> : <ArrowDown size={14} className={styles.sortIcon} />)}
        </button>
        <button className={`${styles.headerCell} ${styles.headerCellClickable}`} onClick={() => toggleSort('fecha')}>
          Fecha de modificación {sortKey === 'fecha' && (sortDir === 'asc' ? <ArrowUp size={14} className={styles.sortIcon} /> : <ArrowDown size={14} className={styles.sortIcon} />)}
        </button>
        <button className={`${styles.headerCell} ${styles.headerCellClickable}`} style={{ textAlign: 'right' }} onClick={() => toggleSort('sizeBytes')}>
          Tamaño {sortKey === 'sizeBytes' && (sortDir === 'asc' ? <ArrowUp size={14} className={styles.sortIcon} /> : <ArrowDown size={14} className={styles.sortIcon} />)}
        </button>
        <div className={styles.headerCell} style={{ textAlign: 'right' }}> </div>
      </div>
      <div className={styles.table}>
        {sortedDocs.map((doc) => (
          <div
            key={doc.id}
            className={`${styles.row} ${selectedIds.has(doc.id) ? styles.rowSelected : ''}`}
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            onClick={() => toggleRowSelection(doc.id)}
          >
            <div className={styles.cell} onClick={(e) => e.stopPropagation()}>
              <Checkbox aria-label={`Seleccionar ${doc.titulo}`} checked={selectedIds.has(doc.id)} onCheckedChange={(checked) => {
                setSelectedIds(prev => {
                  const next = new Set(prev);
                  if (checked) next.add(doc.id); else next.delete(doc.id);
                  return next;
                });
              }} />
            </div>
            <div className={styles.cell}>
              <div className={styles.nameCell}>
                <FileText size={16} />
                <span className={styles.name} title={doc.titulo}>{doc.titulo}</span>
              </div>
            </div>
            <div className={`${styles.cell} ${styles.ownerCell}`} style={{ color: colors.textSecondary }}>
              <div className={styles.ownerWrapper}>
                <Avatar name={doc.propietario} size={24} />
                <span>{doc.propietario}</span>
              </div>
            </div>
            <div className={`${styles.cell} ${styles.nowrap}`} style={{ color: colors.textSecondary }}>
              {formatDate(doc.fecha)}
            </div>
            <div className={`${styles.cell} ${styles.sizeCell} ${styles.nowrap}`} style={{ color: colors.textSecondary }}>
              {formatBytes(doc.sizeBytes)}
            </div>
            <div className={styles.cell}>
              <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                <Button size="s" variant="ghost" iconName="Eye" aria-label="Ver" onClick={() => onOpen?.(doc)} />
                <Button size="s" variant="ghost" iconName="Download" aria-label="Descargar" onClick={() => onDownload?.(doc)} />
                <Button size="s" variant="ghost" iconName="MoreVertical" aria-label="Más" onClick={(e) => openContextMenu(e as unknown as React.MouseEvent, doc)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ContextMenu
        isOpen={contextOpen}
        position={contextPos}
        items={contextItems}
        onClose={() => setContextOpen(false)}
      />
    </div>
  );
};