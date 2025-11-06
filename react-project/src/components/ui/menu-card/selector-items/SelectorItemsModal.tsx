import React, { useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Modal } from '../../modal';
import { Button } from '../../button';
import { Input } from '../../input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel } from '../../select';
import { Grid as DataGrid, type GridColumn, type GridAction } from '../../grid/Grid';
import styles from './SelectorItemsModal.module.css';

export interface SelectorItemsModalProps<T extends Record<string, any>> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  data: T[];
  columns: GridColumn<T>[];
  getRowId?: (row: T) => string | number;
  loading?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onSelect?: (row: T) => void;
}

export const SelectorItemsModal = <T extends Record<string, any>>({
  isOpen,
  onClose,
  title = 'Seleccionar elemento',
  description,
  data,
  columns,
  getRowId,
  loading = false,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
  onEdit,
  onDelete,
  onSelect,
}: SelectorItemsModalProps<T>) => {
  const { colors, theme } = useTheme();
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const normalizedGetRowId = (row: T): string | number => {
    if (getRowId) return getRowId(row);
    // fallback: busca id o codigo
    return (row.id as any) ?? (row.codigo as any) ?? JSON.stringify(row);
  };

  const filteredData = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, search]);

  const selectionColumn: GridColumn<T> = {
    id: 'seleccionar',
    header: 'Seleccionar',
    accessor: () => null,
    width: '90px',
    align: 'center',
    sortable: false,
    render: (_v, row) => {
      const rid = normalizedGetRowId(row);
      const checked = selectedId === rid;
      return (
        <div className={styles.radioCell}>
          <input
            type="radio"
            name="selector-items-radio"
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedId(rid);
            }}
          />
        </div>
      );
    }
  };

  const actionsColumn: GridColumn<T> | null = (onEdit || onDelete) ? {
    id: 'acciones',
    header: 'Acciones',
    accessor: () => null,
    width: '120px',
    align: 'center',
    sortable: false,
    actions: [
      ...(onEdit ? [{ icon: 'Edit', color: '#f59e0b', onClick: (row: T) => onEdit(row), tooltip: 'Editar' } as GridAction<T>] : []),
      ...(onDelete ? [{ icon: 'Trash2', color: '#ef4444', onClick: (row: T) => onDelete(row), tooltip: 'Eliminar' } as GridAction<T>] : []),
    ]
  } : null;

  const augmentedColumns: GridColumn<T>[] = useMemo(() => {
    const base = [selectionColumn, ...columns];
    return actionsColumn ? [...base, actionsColumn] : base;
  }, [columns, selectedId, actionsColumn]);

  const handleConfirm = () => {
    if (!onSelect || selectedId === null) return;
    const row = filteredData.find((r) => normalizedGetRowId(r) === selectedId);
    if (row) onSelect(row);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      saveButtonText="Seleccionar"
      cancelButtonText="Cerrar"
      onSave={handleConfirm}
      saveDisabled={selectedId === null}
    >
      {/* Descripción opcional */}
      {description && (
        <div style={{ marginBottom: 8 }}>
          <span className={styles.helperText} style={{ color: colors.textSecondary }}>{description}</span>
        </div>
      )}

      {/* Barra de filtros */}
      <div
        className={styles.filtersBar}
        style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
      >
        <div className={styles.filtersLeft}>
          <Input
            label="Buscar"
            placeholder="Filtrar por cualquier campo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon="Search"
          />
        </div>
        <div className={styles.filtersRight}>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger style={{ minWidth: 140 }}>
              <SelectValue placeholder="Items por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Items por página</SelectLabel>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de resultados */}
      <div style={{ marginTop: 12 }}>
        <DataGrid
          columns={augmentedColumns}
          data={filteredData}
          loading={loading}
          showPagination={true}
          pageSize={pageSize}
          emptyMessage={search ? 'Sin resultados para el filtro' : 'No hay datos disponibles'}
        />
      </div>
    </Modal>
  );
};

export default SelectorItemsModal;