import React, { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '../button/button';
import { 
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import * as Icons from 'lucide-react';
import './Grid.css';

// Tipos para el sorting
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string;
  direction: SortDirection;
}

// Tipos para las acciones
export interface GridAction<T = any> {
  icon: keyof typeof Icons;
  color: string;
  onClick: (row: T) => void;
  tooltip?: string;
  disabled?: (row: T) => boolean;
}

// Función para identificar el tipo de imagen
const getImageType = (src: string | null | undefined): 'base64' | 'external' | 'internal' | null => {
  if (!src) return null;
  
  // Base64
  if (src.startsWith('data:image/')) return 'base64';
  
  // URL externo (http/https)
  if (src.startsWith('http://') || src.startsWith('https://')) return 'external';
  
  // URL interno (relativo o absoluto interno)
  return 'internal';
};

export interface GridColumn<T = any> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  actions?: GridAction<T>[]; // Nueva propiedad para acciones
  type?: 'text' | 'image'; // Nueva propiedad para especificar el tipo de columna
}

export interface GridProps<T = any> {
  columns: GridColumn<T>[];
  data: T[];
  pageSize?: number;
  initialPage?: number;
  currentPage?: number; // Nueva prop para control externo
  showPagination?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  totalItems?: number; // Para paginación del servidor
  totalPages?: number; // 🔧 Total de páginas desde el servidor
  serverSide?: boolean; // Indica si la paginación es del servidor
}

export interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  showItemsInfo?: boolean;
  maxVisiblePages?: number;
}

const Paginator: React.FC<PaginatorProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showItemsInfo = true,
  maxVisiblePages = 7
}) => {
  const { colors, theme } = useTheme();

  // Calcular el rango de elementos mostrados
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generar números de página visibles
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Ajustar si no hay suficientes páginas al final
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    // Agregar primera página y ellipsis si es necesario
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Agregar páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Agregar ellipsis y última página si es necesario
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalItems === 0) return null;

  return (
    <div 
      className="grid-paginator" 
      style={{
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        color: colors.text
      }}
    >
      <div className="paginator-info">
        {showItemsInfo && (
          <span className="page-info" style={{ color: colors.textSecondary }}>
            Mostrando {startItem.toLocaleString()} - {endItem.toLocaleString()} de {totalItems.toLocaleString()} elementos
          </span>
        )}
        
        {showPageSizeSelector && (
          <div className="page-size-selector">
            <label style={{ color: colors.textSecondary }}>
              Elementos por página:
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="paginator-controls">
        {/* Botón Primera Página */}
        <Button
          variant="outline"
          size="s"
          iconName="ChevronsLeft"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="paginator-button"
        />

        {/* Botón Página Anterior */}
        <Button
          variant="outline"
          size="s"
          iconName="ChevronLeft"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="paginator-button"
        />

        {/* Números de Página */}
        <div className="page-numbers">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="page-ellipsis" style={{ color: colors.textSecondary }}>
                  <MoreHorizontal size={16} />
                </span>
              ) : (
                <button
                  className={`page-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => onPageChange(page as number)}
                  style={{
                    backgroundColor: currentPage === page 
                      ? (theme === 'dark' ? '#414976' : colors.primary)
                      : colors.surface,
                    color: currentPage === page ? '#ffffff' : colors.text,
                    borderColor: colors.border
                  }}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botón Página Siguiente */}
        <Button
          variant="outline"
          size="s"
          iconName="ChevronRight"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="paginator-button"
        />

        {/* Botón Última Página */}
        <Button
          variant="outline"
          size="s"
          iconName="ChevronsRight"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="paginator-button"
        />
      </div>

      <div className="paginator-summary">
        <span style={{ color: colors.textSecondary }}>
          Página {currentPage} de {totalPages}
        </span>
      </div>
    </div>
  );
};

// Componente para imagen circular
const ImageCell: React.FC<{ src: string | null | undefined; alt?: string }> = ({ src, alt }) => {
  const { colors, theme } = useTheme();
  const [hasError, setHasError] = React.useState(false);
  
  const imageType = getImageType(src);

  const containerStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    margin: '0 auto' // Centrar en la celda
  };

  // Si no hay imagen o hay error, mostrar ícono de usuario
  if (!src || imageType === null || hasError) {
    const UserIcon = Icons.User as React.ComponentType<{ size?: number }>;
    return (
      <div 
        style={{
          ...containerStyle,
          backgroundColor: theme === 'dark' ? '#4F46E5' : colors.primary, // Color más visible para dark theme
          color: '#ffffff'
        }}
      >
        <UserIcon size={16} />
      </div>
    );
  }

  // Renderizar imagen
  return (
    <div style={containerStyle}>
      <img
        src={src}
        alt={alt || 'Avatar'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%'
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export const Grid = <T extends Record<string, any>>({
  columns,
  data,
  pageSize = 5,
  initialPage = 1,
  currentPage: externalCurrentPage,
  showPagination = true,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  className = '',
  onRowClick,
  onPageChange,
  onPageSizeChange,
  totalItems,
  totalPages: externalTotalPages, // 🔧 Total páginas externo
  serverSide = false
}: GridProps<T>) => {
  const { colors, theme } = useTheme();
  const [internalCurrentPage, setInternalCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // Usar currentPage externo si está disponible, sino usar el interno
  const currentPage = externalCurrentPage ?? internalCurrentPage;
  
  // Sincronizar pageSize interno con prop externa
  React.useEffect(() => {
    setCurrentPageSize(pageSize);
  }, [pageSize]);
  
  // Usar directamente data en lugar de originalData para que se actualice con nuevos datos
  const originalData = data;

  // Función para obtener el valor de una celda
  const getCellValue = (row: T, accessor: keyof T | ((row: T) => React.ReactNode)): any => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor];
  };

  // Función para determinar el tipo de dato
  const getValueType = (value: any): 'number' | 'date' | 'string' => {
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
      // Verificar si es una fecha en formato string
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime()) && value.includes('-')) return 'date';
      // Verificar si es un número en formato string
      const numValue = parseFloat(value.replace(/[$,]/g, ''));
      if (!isNaN(numValue) && isFinite(numValue)) return 'number';
    }
    return 'string';
  };

  // Función de comparación
  const compareValues = (a: any, b: any, type: 'number' | 'date' | 'string'): number => {
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;

    switch (type) {
      case 'number':
        const numA = typeof a === 'number' ? a : parseFloat(String(a).replace(/[$,]/g, ''));
        const numB = typeof b === 'number' ? b : parseFloat(String(b).replace(/[$,]/g, ''));
        return numA - numB;
      
      case 'date':
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      
      case 'string':
      default:
        // Asegurar que ambos valores sean strings antes de llamar toLowerCase
        const strA = a != null ? String(a) : '';
        const strB = b != null ? String(b) : '';
        return strA.toLowerCase().localeCompare(strB.toLowerCase());
    }
  };

  // Función para renderizar las acciones
  const renderActions = (actions: GridAction<T>[], row: T) => {
    //// Debug removed;
    
    return (
      <div 
        className="actions-container"
        onClick={(e) => {
          //// Debug removed;
          e.stopPropagation();
        }}
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {actions.map((action, index) => {
          const IconComponent = Icons[action.icon] as React.ComponentType<{ size?: number }>;
          const isDisabled = action.disabled ? action.disabled(row) : false;
          
          //// Debug removed;
          
          return (
            <button
              key={index}
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  action.onClick(row);
                }
              }}
              disabled={isDisabled}
              title={action.tooltip}
              style={{
                background: 'none',
                border: 'none',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isDisabled ? 0.5 : 1,
                color: action.color,
                transition: 'all 0.2s ease'
              }}
            >
              <IconComponent size={16} />
            </button>
          );
        })}
      </div>
    );
  };

  // Renderizar imagen circular
  const renderImageColumn = (src: string | null | undefined, alt?: string) => {
    return <ImageCell src={src} alt={alt} />;
  };

  // Datos ordenados
  const sortedData = useMemo(() => {
    if (!sortConfig) return originalData;

    const { key, direction } = sortConfig;
    const column = columns.find(col => col.id === key);
    if (!column) return originalData;

    const sorted = [...originalData].sort((a, b) => {
      const aValue = getCellValue(a, column.accessor);
      const bValue = getCellValue(b, column.accessor);
      
      const type = getValueType(aValue);
      const result = compareValues(aValue, bValue, type);
      
      return direction === 'asc' ? result : -result;
    });

    return sorted;
  }, [originalData, sortConfig, columns]);

  // Manejar click en header para sorting
  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    setSortConfig(prev => {
      if (!prev || prev.key !== columnId) {
        // Primera vez o columna diferente: ascendente
        return { key: columnId, direction: 'asc' };
      } else if (prev.direction === 'asc') {
        // Segunda vez: descendente
        return { key: columnId, direction: 'desc' };
      } else {
        // Tercera vez: volver al orden original
        return null;
      }
    });
    
    // Resetear a primera página cuando se ordena
    if (externalCurrentPage !== undefined) {
      onPageChange?.(1);
    } else {
      setInternalCurrentPage(1);
    }
  };

  // Obtener ícono de sorting
  const getSortIcon = (columnId: string) => {
    if (!sortConfig || sortConfig.key !== columnId) {
      return <ArrowUpDown size={14} className="sort-icon" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp size={14} className="sort-icon active" />;
    } else {
      return <ArrowDown size={14} className="sort-icon active" />;
    }
  };

  // Datos paginados (solo para paginación del cliente)
  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    
    const dataToUse = sortedData;
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return dataToUse.slice(startIndex, endIndex);
  }, [sortedData, currentPage, currentPageSize, serverSide, data]);

  // Cálculos de paginación
  const effectiveTotalItems = totalItems ?? sortedData.length;
  
  // 🔧 Usar totalPages externo si está disponible y es serverSide, sino calcular
  const totalPages = (serverSide && externalTotalPages !== undefined) 
    ? externalTotalPages 
    : Math.ceil(effectiveTotalItems / currentPageSize);

  // Debug logging para paginación - REMOVIDO para evitar spam en consola

  const handlePageChange = (page: number) => {
    if (externalCurrentPage !== undefined) {
      onPageChange?.(page);
    } else {
      setInternalCurrentPage(page);
    onPageChange?.(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    if (externalCurrentPage !== undefined) {
      onPageChange?.(1); // Resetear a la primera página
    } else {
      setInternalCurrentPage(1);
    }
    onPageSizeChange?.(newPageSize);
  };

  const handleRowClick = (row: T, index: number) => {
    onRowClick?.(row, index);
  };

  const renderCell = (row: T, column: GridColumn<T>, rowIndex: number) => {
    const value = getCellValue(row, column.accessor);
    
    // Si la columna tiene acciones, renderizar las acciones
    if (column.actions && column.actions.length > 0) {
      return renderActions(column.actions, row);
    }

    // Si la columna es de tipo imagen, renderizar imagen circular
    if (column.type === 'image') {
      return renderImageColumn(value, `Imagen de ${column.header}`);
    }
    
    if (column.render) {
      return column.render(value, row, rowIndex);
    }
    
    return value;
  };

  return (
    <div 
      className={`grid-container ${className}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border
      }}
    >
      {/* Tabla */}
      <div className="grid-table-container">
        <table className="grid-table" style={{ backgroundColor: colors.surface }}>
          {/* Header */}
          <thead>
            <tr 
              className="grid-header-row" 
              style={{ 
                backgroundColor: theme === 'dark' ? '#0f172a' : colors.primary 
              }}
            >
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="grid-header-cell"
                  style={{
                    width: column.width,
                    color: '#ffffff'
                  }}
                >
                  <div className="header-content">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <button className="sort-button" onClick={() => handleSort(column.id)}>
                        {getSortIcon(column.id)}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="grid-loading"
                  style={{ backgroundColor: colors.surface }}
                >
                  <div className="loading-content">
                    <div 
                      className="loading-spinner"
                      style={{
                        borderColor: `${colors.border} transparent transparent transparent`,
                        borderTopColor: colors.primary
                      }}
                    ></div>
                    <span style={{ color: colors.textSecondary }}>Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="grid-empty"
                  style={{ backgroundColor: colors.surface }}
                >
                  <div className="empty-content" style={{ color: colors.textSecondary }}>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`grid-body-row ${onRowClick ? 'clickable' : ''}`}
                  onClick={() => handleRowClick(row, rowIndex)}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border 
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`grid-body-cell ${column.type === 'image' ? 'image-cell' : ''}`}
                      style={{
                        textAlign: column.align || 'left',
                        color: colors.text,
                        borderRightColor: colors.border
                      }}
                    >
                      {renderCell(row, column, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      {showPagination && !loading && (
        (serverSide ? effectiveTotalItems > 0 : paginatedData.length > 0)
      ) && (
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={effectiveTotalItems}
          pageSize={currentPageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};