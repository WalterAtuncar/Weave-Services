import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema,
  getTipoSistemaOptions,
  getFamiliaSistemaOptions,
  getEstadoSistemaOptions
} from '../../../models/Sistemas';
import { SistemasFilters } from '../../../hooks/useSistemas';
import { StatusBadge } from '../status-badge';
import { Button } from '../button';
import styles from './SystemFilters.module.css';

export interface SystemFiltersProps {
  filters: SistemasFilters;
  onFiltersChange: (filters: Partial<SistemasFilters>) => void;
  onClearFilters: () => void;
  stats?: {
    total: number;
    activos: number;
    inactivos: number;
    internos: number;
    externos: number;
    conDependencias: number;
  };
  className?: string;
}

export const SystemFilters: React.FC<SystemFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  stats,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const tipoOptions = getTipoSistemaOptions();
  const familiaOptions = getFamiliaSistemaOptions();
  const estadoOptions = getEstadoSistemaOptions();

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length;

  useEffect(() => {
    // Expandir automáticamente si hay filtros activos
    if (activeFiltersCount > 0) {
      setIsExpanded(true);
    }
  }, [activeFiltersCount]);

  const handleSelectChange = (field: keyof SistemasFilters, value: string) => {
    const parsedValue = value === '' ? undefined : parseInt(value);
    onFiltersChange({ [field]: parsedValue });
  };

  const handleCheckboxChange = (field: keyof SistemasFilters, checked: boolean) => {
    onFiltersChange({ [field]: checked ? true : undefined });
  };

  return (
    <div className={`${styles.filtersContainer} ${className}`}>
      {/* Header con toggle */}
      <div className={styles.filtersHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className={styles.toggleText}>
            Filtros Avanzados
            {activeFiltersCount > 0 && (
              <span className={styles.filterCount}>({activeFiltersCount})</span>
            )}
          </span>
          <ChevronDown 
            className={`${styles.toggleIcon} ${isExpanded ? styles.expanded : ''}`}
            size={16}
          />
        </button>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="s"
            onClick={onClearFilters}
            className={styles.clearButton}
          >
            <X size={14} />
            Limpiar
          </Button>
        )}
      </div>

      {/* Contenido de filtros */}
      {isExpanded && (
        <div className={styles.filtersContent}>
          {/* Estadísticas rápidas */}
          {stats && (
            <div className={styles.statsContainer}>
              <h4 className={styles.statsTitle}>Resumen</h4>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total</span>
                  <span className={styles.statValue}>{stats.total}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Activos</span>
                  <StatusBadge status="active" size="s" />
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Inactivos</span>
                  <StatusBadge status="inactive" size="s" />
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Internos</span>
                  <span className={styles.statValue}>{stats.internos}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Externos</span>
                  <span className={styles.statValue}>{stats.externos}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Con Dependencias</span>
                  <span className={styles.statValue}>{stats.conDependencias}</span>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className={styles.filtersGrid}>
            {/* Tipo de Sistema */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Tipo de Sistema</label>
              <select
                value={filters.tipo || ''}
                onChange={(e) => handleSelectChange('tipo', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todos los tipos</option>
                {tipoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Familia de Sistema */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Familia</label>
              <select
                value={filters.familia || ''}
                onChange={(e) => handleSelectChange('familia', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todas las familias</option>
                {familiaOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Estado</label>
              <select
                value={filters.estado !== undefined ? filters.estado.toString() : ''}
                onChange={(e) => handleSelectChange('estado', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todos los estados</option>
                {estadoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dependencias */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Dependencias</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.conDependencias === true}
                    onChange={(e) => handleCheckboxChange('conDependencias', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>Solo sistemas con dependencias</span>
                </label>
              </div>
            </div>

            {/* Gobernanza */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Gobernanza</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.tieneGobernanzaPropia === true}
                    onChange={(e) => handleCheckboxChange('tieneGobernanzaPropia', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>Solo sistemas con gobernanza propia</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};