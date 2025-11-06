import React, { useState, useMemo } from 'react';
import { 
  Edit2, 
  Trash2, 
  Copy, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal,
  CheckSquare,
  Square,
  Filter,
  Search,
  X
} from 'lucide-react';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { StatusBadge } from '../status-badge/StatusBadge';
import { SystemTypeIcon } from '../system-type-icon/SystemTypeIcon';
import { HierarchyIndicator } from '../hierarchy-indicator/HierarchyIndicator';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Sistema, 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema,
  getTipoSistemaLabel,
  getFamiliaSistemaLabel
} from '../../../models/Sistemas';
import styles from './SystemsList.module.css';

export interface SystemsListProps {
  /** Lista de sistemas */
  sistemas: Sistema[];
  /** Estado de carga */
  loading?: boolean;
  /** Error si lo hay */
  error?: string | null;
  /** Paginación */
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
  /** Función para editar sistema */
  onEdit?: (sistema: Sistema) => void;
  /** Función para eliminar sistema */
  onDelete?: (sistema: Sistema) => void;
  /** Función para duplicar sistema */
  onDuplicate?: (sistema: Sistema) => void;
  /** Función para ver detalles */
  onView?: (sistema: Sistema) => void;
  /** Función para cambiar página */
  onPageChange?: (page: number) => void;
  /** Función para cambiar tamaño de página */
  onPageSizeChange?: (pageSize: number) => void;
  /** Sistemas seleccionados */
  selectedSystems?: number[];
  /** Función para cambiar selección */
  onSelectionChange?: (selectedIds: number[]) => void;
  /** Permitir selección múltiple */
  allowMultiSelect?: boolean;
  /** Solo lectura */
  readOnly?: boolean;
}

type SortField = 'nombreSistema' | 'codigoSistema' | 'tipoSistema' | 'familiaSistema' | 'estado' | 'fechaCreacion';
type SortDirection = 'asc' | 'desc';

interface ColumnFilter {
  nombreSistema: string;
  codigoSistema: string;
  tipoSistema: string;
  familiaSistema: string;
  estado: string;
}

export const SystemsList: React.FC<SystemsListProps> = ({
  sistemas,
  loading = false,
  error = null,
  pagination,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  onPageChange,
  onPageSizeChange,
  selectedSystems = [],
  onSelectionChange,
  allowMultiSelect = true,
  readOnly = false
}) => {
  const { colors } = useTheme();

  // Estados para ordenamiento
  const [sortField, setSortField] = useState<SortField>('nombreSistema');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Estados para filtros de columna
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({
    nombreSistema: '',
    codigoSistema: '',
    tipoSistema: '',
    familiaSistema: '',
    estado: ''
  });

  // Estado para mostrar/ocultar filtros
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros y ordenamiento
  const filteredAndSortedSistemas = useMemo(() => {
    let result = [...sistemas];

    // Aplicar filtros de columna
    if (columnFilters.nombreSistema) {
      result = result.filter(s => 
        s.nombreSistema.toLowerCase().includes(columnFilters.nombreSistema.toLowerCase())
      );
    }
    if (columnFilters.codigoSistema) {
      result = result.filter(s => 
        s.codigoSistema?.toLowerCase().includes(columnFilters.codigoSistema.toLowerCase())
      );
    }
    if (columnFilters.tipoSistema) {
      result = result.filter(s => 
        getTipoSistemaLabel(s.tipoSistema).toLowerCase().includes(columnFilters.tipoSistema.toLowerCase())
      );
    }
    if (columnFilters.familiaSistema) {
      result = result.filter(s => 
        getFamiliaSistemaLabel(s.familiaSistema).toLowerCase().includes(columnFilters.familiaSistema.toLowerCase())
      );
    }
    if (columnFilters.estado) {
      result = result.filter(s => 
        (s.estado === EstadoSistema.Activo ? 'activo' : 'inactivo').includes(columnFilters.estado.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'nombreSistema':
          aValue = a.nombreSistema.toLowerCase();
          bValue = b.nombreSistema.toLowerCase();
          break;
        case 'codigoSistema':
          aValue = a.codigoSistema?.toLowerCase() || '';
          bValue = b.codigoSistema?.toLowerCase() || '';
          break;
        case 'tipoSistema':
          aValue = getTipoSistemaLabel(a.tipoSistema);
          bValue = getTipoSistemaLabel(b.tipoSistema);
          break;
        case 'familiaSistema':
          aValue = getFamiliaSistemaLabel(a.familiaSistema);
          bValue = getFamiliaSistemaLabel(b.familiaSistema);
          break;
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
          break;
        case 'fechaCreacion':
          aValue = new Date(a.fechaCreacion);
          bValue = new Date(b.fechaCreacion);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [sistemas, columnFilters, sortField, sortDirection]);

  // Manejar ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Manejar filtro de columna
  const handleColumnFilter = (field: keyof ColumnFilter, value: string) => {
    setColumnFilters(prev => ({ ...prev, [field]: value }));
  };

  // Limpiar filtros
  const clearColumnFilters = () => {
    setColumnFilters({
      nombreSistema: '',
      codigoSistema: '',
      tipoSistema: '',
      familiaSistema: '',
      estado: ''
    });
  };

  // Manejar selección individual
  const handleRowSelect = (sistemaId: number) => {
    if (!allowMultiSelect || !onSelectionChange) return;

    const newSelection = selectedSystems.includes(sistemaId)
      ? selectedSystems.filter(id => id !== sistemaId)
      : [...selectedSystems, sistemaId];
    
    onSelectionChange(newSelection);
  };

  // Seleccionar todos
  const handleSelectAll = () => {
    if (!allowMultiSelect || !onSelectionChange) return;

    const allIds = filteredAndSortedSistemas.map(s => s.sistemaId);
    const isAllSelected = allIds.every(id => selectedSystems.includes(id));
    
    onSelectionChange(isAllSelected ? [] : allIds);
  };

  // Renderizar encabezado de columna con ordenamiento
  const renderColumnHeader = (
    field: SortField,
    label: string,
    sortable: boolean = true
  ) => (
    <th 
      className={`${styles.columnHeader} ${sortable ? styles.sortable : ''}`}
      onClick={sortable ? () => handleSort(field) : undefined}
      style={{ borderColor: colors.border }}
    >
      <div className={styles.columnHeaderContent}>
        <span>{label}</span>
        {sortable && sortField === field && (
          <span className={styles.sortIcon}>
            {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </div>
    </th>
  );

  // Renderizar filtro de columna
  const renderColumnFilter = (field: keyof ColumnFilter, placeholder: string) => (
    <Input
      placeholder={placeholder}
      value={columnFilters[field]}
      onChange={(e) => handleColumnFilter(field, e.target.value)}
      className={styles.columnFilter}
      icon="Search"
    />
  );

  // Renderizar acciones de fila
  const renderRowActions = (sistema: Sistema) => (
    <div className={styles.rowActions}>
      {onView && (
        <Button
          variant="ghost"
          size="s"
          onClick={() => onView(sistema)}
          title="Ver detalles"
          iconName="Eye"
        />
      )}
      {!readOnly && onEdit && (
        <Button
          variant="ghost"
          size="s"
          onClick={() => onEdit(sistema)}
          title="Editar"
          iconName="Edit2"
        />
      )}
      {!readOnly && onDuplicate && (
        <Button
          variant="ghost"
          size="s"
          onClick={() => onDuplicate(sistema)}
          title="Duplicar"
          iconName="Copy"
        />
      )}
      {!readOnly && onDelete && (
        <Button
          variant="ghost"
          size="s"
          onClick={() => onDelete(sistema)}
          title="Eliminar"
          iconName="Trash2"
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.skeleton}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer} style={{ color: '#EF4444' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const isAllSelected = filteredAndSortedSistemas.length > 0 && 
    filteredAndSortedSistemas.every(s => selectedSystems.includes(s.sistemaId));
  const isSomeSelected = selectedSystems.length > 0 && !isAllSelected;

  return (
    <div className={styles.systemsList}>
      {/* Toolbar */}
      <div className={styles.listToolbar}>
        <div className={styles.toolbarLeft}>
          <Button
            variant="outline"
            size="s"
            onClick={() => setShowFilters(!showFilters)}
            iconName="Filter"
            iconPosition="left"
          >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          
          {Object.values(columnFilters).some(filter => filter) && (
            <Button
              variant="ghost"
              size="s"
              onClick={clearColumnFilters}
              iconName="X"
              iconPosition="left"
            >
              Limpiar Filtros
            </Button>
          )}
        </div>

        <div className={styles.toolbarRight}>
          {allowMultiSelect && selectedSystems.length > 0 && (
            <span className={styles.selectionInfo} style={{ color: colors.textSecondary }}>
              {selectedSystems.length} seleccionado{selectedSystems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.tableContainer}>
        <table className={styles.table} style={{ backgroundColor: colors.surface }}>
          <thead>
            <tr style={{ backgroundColor: colors.surface, borderBottomColor: colors.border }}>
              {allowMultiSelect && (
                <th className={styles.checkboxColumn}>
                  <Button
                    variant="ghost"
                    size="s"
                    onClick={handleSelectAll}
                    iconName={isAllSelected ? "CheckSquare" : isSomeSelected ? "Square" : "Square"}
                  />
                </th>
              )}
              {renderColumnHeader('nombreSistema', 'Sistema')}
              {renderColumnHeader('codigoSistema', 'Código')}
              {renderColumnHeader('tipoSistema', 'Tipo')}
              {renderColumnHeader('familiaSistema', 'Familia')}
              {renderColumnHeader('estado', 'Estado')}
              <th className={styles.columnHeader}>Gobernanza Propia</th>
                             <th className={styles.columnHeader}>Dependencias</th>
               <th className={styles.columnHeader}>Módulos</th>
               {renderColumnHeader('fechaCreacion', 'Creación')}
               <th className={styles.actionsColumn}>Acciones</th>
            </tr>
            
            {/* Fila de filtros */}
            {showFilters && (
              <tr className={styles.filtersRow}>
                {allowMultiSelect && <th></th>}
                <th>{renderColumnFilter('nombreSistema', 'Filtrar por nombre...')}</th>
                <th>{renderColumnFilter('codigoSistema', 'Filtrar por código...')}</th>
                <th>{renderColumnFilter('tipoSistema', 'Filtrar por tipo...')}</th>
                <th>{renderColumnFilter('familiaSistema', 'Filtrar por familia...')}</th>
                <th>{renderColumnFilter('estado', 'Filtrar por estado...')}</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            )}
          </thead>
          
          <tbody>
            {filteredAndSortedSistemas.map(sistema => (
              <tr 
                key={sistema.sistemaId} 
                className={`${styles.tableRow} ${selectedSystems.includes(sistema.sistemaId) ? styles.selected : ''}`}
                style={{ borderColor: colors.border }}
              >
                {allowMultiSelect && (
                  <td className={styles.checkboxCell}>
                    <Button
                      variant="ghost"
                      size="s"
                      onClick={() => handleRowSelect(sistema.sistemaId)}
                      iconName={selectedSystems.includes(sistema.sistemaId) ? "CheckSquare" : "Square"}
                    />
                  </td>
                )}
                
                <td className={styles.nameCell}>
                  <div className={styles.systemName}>
                    <SystemTypeIcon familia={sistema.familiaSistema} size={16} />
                    <span style={{ color: colors.text }}>{sistema.nombreSistema}</span>
                  </div>
                  {sistema.funcionPrincipal && (
                    <div className={styles.systemDescription} style={{ color: colors.textSecondary }}>
                      {sistema.funcionPrincipal.substring(0, 80)}
                      {sistema.funcionPrincipal.length > 80 && '...'}
                    </div>
                  )}
                </td>
                
                <td>
                  <code className={styles.systemCode} style={{ color: colors.textSecondary }}>
                    {sistema.codigoSistema || '-'}
                  </code>
                </td>
                
                <td>
                  <span style={{ color: colors.text }}>
                    {getTipoSistemaLabel(sistema.tipoSistema)}
                  </span>
                </td>
                
                <td>
                  <span style={{ color: colors.text }}>
                    {getFamiliaSistemaLabel(sistema.familiaSistema)}
                  </span>
                </td>
                
                <td>
                  <StatusBadge
                    status={sistema.estado === EstadoSistema.Activo ? 'active' : 'inactive'}
                    size="s"
                  />
                </td>
                
                <td>
                  <StatusBadge
                    status={sistema.tieneGobernanzaPropia ? 'active' : 'inactive'}
                    variant={sistema.tieneGobernanzaPropia ? 'filled' : 'outline'}
                    label={sistema.tieneGobernanzaPropia ? 'Sí' : 'No'}
                    size="s"
                  />
                </td>
                
                <td>
                  {sistema.sistemaDepende ? (
                    <div className={styles.dependency}>
                      <HierarchyIndicator type="child" size="sm" />
                      <span style={{ color: colors.textSecondary }}>
                        {sistema.sistemaDepende_Nombre}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: colors.textSecondary }}>-</span>
                  )}
                </td>
                
                <td>
                  <span style={{ color: colors.textSecondary }}>
                    {sistema.modulos?.length || 0} módulo{(sistema.modulos?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </td>
                
                <td>
                  <span style={{ color: colors.textSecondary }}>
                    {new Date(sistema.fechaCreacion).toLocaleDateString()}
                  </span>
                </td>
                
                <td>
                  {renderRowActions(sistema)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedSistemas.length === 0 && (
          <div className={styles.emptyState}>
            <p style={{ color: colors.textSecondary }}>
              {Object.values(columnFilters).some(filter => filter) 
                ? 'No se encontraron sistemas que coincidan con los filtros'
                : 'No hay sistemas para mostrar'
              }
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {pagination && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo} style={{ color: colors.textSecondary }}>
            Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} de {pagination.totalItems} sistemas
          </div>
          
          <div className={styles.paginationControls}>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => onPageSizeChange?.(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="25">25 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
                <SelectItem value="100">100 por página</SelectItem>
              </SelectContent>
            </Select>
            
            <div className={styles.pageButtons}>
              <Button
                variant="outline"
                size="s"
                onClick={() => onPageChange?.(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Anterior
              </Button>
              
              <span style={{ color: colors.text }}>
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="s"
                onClick={() => onPageChange?.(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};