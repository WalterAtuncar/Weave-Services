import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { TipoEntidad } from '../../../services/types/tipo-entidad.types';
import styles from './EntityTypeFilter.module.css';

interface EntityTypeFilterProps {
  tiposEntidad: TipoEntidad[];
  selectedTipoEntidadId: number | null;
  onFilterChange: (tipoEntidadId: number | null) => void;
  loading?: boolean;
  className?: string;
}

export const EntityTypeFilter: React.FC<EntityTypeFilterProps> = ({
  tiposEntidad,
  selectedTipoEntidadId,
  onFilterChange,
  loading = false,
  className = ''
}) => {
  const { colors } = useTheme();

  const handleRadioChange = (tipoEntidadId: number | null) => {
    onFilterChange(tipoEntidadId);
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSkeleton}></div>
          <div className={styles.loadingSkeleton}></div>
          <div className={styles.loadingSkeleton}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h4 className={styles.title}>Filtrar por Tipo de Entidad</h4>
      </div>
      
      <div className={styles.radioGroup}>
        {/* Opción "Todos" */}
        <label className={styles.radioItem}>
          <input
            type="radio"
            name="tipoEntidad"
            value="all"
            checked={selectedTipoEntidadId === null}
            onChange={() => handleRadioChange(null)}
            className={styles.radioInput}
          />
          <div className={styles.radioContent}>
            <div className={styles.radioButton}>
              <div className={styles.radioIndicator}></div>
            </div>
            <div className={styles.radioLabel}>
              <span className={styles.labelText}>Todos</span>
              <span className={styles.labelDescription}>
                Mostrar todas las gobernanzas
              </span>
            </div>
          </div>
        </label>

        {/* Opciones dinámicas por tipo de entidad */}
        {tiposEntidad.map((tipo) => (
          <label key={tipo.tipoEntidadId} className={styles.radioItem}>
            <input
              type="radio"
              name="tipoEntidad"
              value={tipo.tipoEntidadId}
              checked={selectedTipoEntidadId === tipo.tipoEntidadId}
              onChange={() => handleRadioChange(tipo.tipoEntidadId)}
              className={styles.radioInput}
            />
            <div className={styles.radioContent}>
              <div className={styles.radioButton}>
                <div className={styles.radioIndicator}></div>
              </div>
              <div className={styles.radioLabel}>
                <span className={styles.labelText}>
                  {tipo.tipoEntidadNombre}
                </span>
                {tipo.tipoEntidadDescripcion && (
                  <span className={styles.labelDescription}>
                    {tipo.tipoEntidadDescripcion}
                  </span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default EntityTypeFilter;