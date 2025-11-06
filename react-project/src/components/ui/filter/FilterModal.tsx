import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Filter, Download, Search, Calendar, ChevronDown } from 'lucide-react';
import { Modal } from '../modal';
import { Button } from '../button';
import { Input } from '../input';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './FilterModal.module.css';

// Tipos de controles de filtro
export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterControl {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'checkbox' | 'number';
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: any;
  required?: boolean;
}

export interface FilterValue {
  [key: string]: any;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (filters: FilterValue, pagination: { page: number; pageSize: number }) => Promise<void>;
  onExport?: (filters: FilterValue, pagination: { page: number; pageSize: number }) => Promise<any[]>;
  filterControls: FilterControl[];
  title?: string;
  initialFilters?: FilterValue;
  showExport?: boolean;
  showPagination?: boolean;
  initialPageSize?: number;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onFilter,
  onExport,
  filterControls,
  title = 'Filtros',
  initialFilters = {},
  showExport = true,
  showPagination = true,
  initialPageSize = 10
}) => {
  const { theme, colors } = useTheme();
  const [filters, setFilters] = useState<FilterValue>(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, pageSize: initialPageSize });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Ref para evitar loop infinito con initialFilters
  const initialFiltersRef = useRef<FilterValue>(initialFilters);
  const initialPageSizeRef = useRef<number>(initialPageSize);

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    initialFiltersRef.current = initialFilters;
    initialPageSizeRef.current = initialPageSize;
  }, [JSON.stringify(initialFilters), initialPageSize]);

  // Resetear filtros cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFiltersRef.current);
      setPagination({ page: 1, pageSize: initialPageSizeRef.current });
    }
  }, [isOpen]);

  // Manejar cambios en los filtros
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Aplicar filtros
  const handleApplyFilters = async () => {
    try {
      setIsLoading(true);
      await onFilter(filters, pagination);
      onClose();
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar datos
  const handleExport = async () => {
    if (!onExport) return;
    
    try {
      setIsExporting(true);
      await onExport(filters, pagination);
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Limpiar filtros
  const handleClearFilters = useCallback(() => {
    const clearedFilters: FilterValue = {};
    filterControls.forEach(control => {
      if (control.defaultValue !== undefined) {
        clearedFilters[control.key] = control.defaultValue;
      } else {
        clearedFilters[control.key] = control.type === 'checkbox' ? false : '';
      }
    });
    setFilters(clearedFilters);
  }, [filterControls]);

  // Renderizar control de filtro
  const renderFilterControl = (control: FilterControl) => {
    const value = filters[control.key] ?? control.defaultValue ?? (control.type === 'checkbox' ? false : '');

    switch (control.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={control.type}
            placeholder={control.placeholder}
            value={value}
            onChange={(e) => handleFilterChange(control.key, e.target.value)}
            required={control.required}
          />
        );

      case 'select':
        return (
          <div className={styles.selectWrapper}>
            <select
              value={value}
              onChange={(e) => handleFilterChange(control.key, e.target.value)}
              className={styles.select}
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }}
              required={control.required}
            >
              <option value="">Seleccionar...</option>
              {control.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.selectIcon} size={16} />
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(control.key, e.target.value)}
            required={control.required}
          />
        );

      case 'checkbox':
        return (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleFilterChange(control.key, e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>{control.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="m"
      hideFooter={true}
    >
      <div className={styles.filterModal}>
        {/* Controles de filtro */}
        <div className={styles.filtersGrid}>
          {filterControls.map(control => (
            <div key={control.key} className={styles.filterGroup}>
              {control.type !== 'checkbox' && (
                <label className={styles.filterLabel} style={{ color: colors.text }}>
                  {control.label}
                  {control.required && <span className={styles.required}>*</span>}
                </label>
              )}
              {renderFilterControl(control)}
            </div>
          ))}
        </div>

        {/* Paginación */}
        {showPagination && (
          <div className={styles.paginationSection}>
            <h4 className={styles.sectionTitle} style={{ color: colors.text }}>Paginación</h4>
            <div className={styles.paginationControls}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} style={{ color: colors.text }}>Página</label>
                <Input
                  type="number"
                  min="1"
                  value={pagination.page}
                  onChange={(e) => setPagination(prev => ({ ...prev, page: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} style={{ color: colors.text }}>Elementos por página</label>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value) }))}
                  className={styles.select}
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              disabled={isLoading || isExporting}
            >
              Limpiar
            </Button>
          </div>
          <div className={styles.rightActions}>
            {showExport && onExport && (
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isLoading || isExporting}
                iconName="Download"
                iconPosition="left"
              >
                {isExporting ? 'Exportando...' : 'Exportar'}
              </Button>
            )}
            <Button
              variant="default"
              onClick={handleApplyFilters}
              disabled={isLoading || isExporting}
              iconName="Filter"
              iconPosition="left"
            >
              {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
export { FilterModal };
export type { FilterModalProps, FilterControl, FilterValue, FilterOption };