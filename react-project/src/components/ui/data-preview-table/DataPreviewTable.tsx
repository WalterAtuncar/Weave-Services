import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Eye, 
  EyeOff,
  Filter,
  X
} from 'lucide-react';
import { Button } from '../button/button';
import { StatusBadge } from '../status-badge/StatusBadge';
import { SystemTypeIcon } from '../system-type-icon/SystemTypeIcon';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  ParsedSistemaData, 
  ExcelSistemasParseResult 
} from '../../../utils/excelSistemasParser';
import { 
  TIPO_SISTEMA_LABELS, 
  FAMILIA_SISTEMA_LABELS 
} from '../../../models/Sistemas';
import styles from './DataPreviewTable.module.css';

export interface DataPreviewTableProps {
  /** Resultado del parsing con sistemas validados */
  parseResult: ExcelSistemasParseResult;
  /** Función llamada al seleccionar/deseleccionar sistemas */
  onSystemSelectionChange?: (selectedSystems: ParsedSistemaData[]) => void;
  /** Sistemas preseleccionados */
  selectedSystems?: ParsedSistemaData[];
  /** Solo lectura */
  readOnly?: boolean;
  /** Modo compacto */
  compact?: boolean;
  /** Máxima altura de la tabla */
  maxHeight?: number;
}

type FilterType = 'all' | 'valid' | 'invalid' | 'warnings';

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  parseResult,
  onSystemSelectionChange,
  selectedSystems = [],
  readOnly = false,
  compact = false,
  maxHeight = 500
}) => {
  const { colors } = useTheme();

  // Estados locales
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [showModules, setShowModules] = useState(true);
  const [localSelection, setLocalSelection] = useState<Set<number>>(
    new Set(selectedSystems.map(s => s.rowNumber))
  );


  // Filtrar sistemas según el filtro activo
  const filteredSystems = useMemo(() => {
    switch (currentFilter) {
      case 'valid':
        return parseResult.sistemas.filter(s => s.errors.length === 0);
      case 'invalid':
        return parseResult.sistemas.filter(s => s.errors.length > 0);
      case 'warnings':
        return parseResult.sistemas.filter(s => s.warnings.length > 0);
      default:
        return parseResult.sistemas;
    }
  }, [parseResult.sistemas, currentFilter]);

  // Manejar expansión de filas
  const toggleRowExpansion = (rowNumber: number) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(rowNumber)) {
      newExpanded.delete(rowNumber);
    } else {
      newExpanded.add(rowNumber);
    }
    setExpandedRows(newExpanded);
  };



  // Manejar selección de sistemas
  const toggleSystemSelection = (sistema: ParsedSistemaData) => {
    if (readOnly) return;
    
    const newSelection = new Set(localSelection);
    if (localSelection.has(sistema.rowNumber)) {
      newSelection.delete(sistema.rowNumber);
    } else {
      newSelection.add(sistema.rowNumber);
    }
    
    setLocalSelection(newSelection);
    
    // Notificar cambios
    const selectedSystemsData = parseResult.sistemas.filter(s => 
      newSelection.has(s.rowNumber)
    );
    onSystemSelectionChange?.(selectedSystemsData);
  };

  // Seleccionar/deseleccionar todos los válidos
  const toggleSelectAllValid = () => {
    if (readOnly) return;
    
    const validSystems = filteredSystems.filter(s => s.errors.length === 0);
    const allValidSelected = validSystems.every(s => localSelection.has(s.rowNumber));
    
    const newSelection = new Set(localSelection);
    
    if (allValidSelected) {
      // Deseleccionar todos los válidos
      validSystems.forEach(s => newSelection.delete(s.rowNumber));
    } else {
      // Seleccionar todos los válidos
      validSystems.forEach(s => newSelection.add(s.rowNumber));
    }
    
    setLocalSelection(newSelection);
    
    const selectedSystemsData = parseResult.sistemas.filter(s => 
      newSelection.has(s.rowNumber)
    );
    onSystemSelectionChange?.(selectedSystemsData);
  };

  // Obtener status del sistema
  const getSystemStatus = (sistema: ParsedSistemaData) => {
    if (sistema.errors.length > 0) return 'error';
    if (sistema.warnings.length > 0) return 'warning';
    return 'success';
  };

  // Renderizar indicador de status
  const renderStatusIndicator = (sistema: ParsedSistemaData) => {
    const status = getSystemStatus(sistema);
    
    switch (status) {
      case 'error':
        return (
          <div className={styles.statusIndicator} title={`${sistema.errors.length} errores`}>
            <AlertTriangle size={16} color="#DC2626" />
            <span className={styles.statusCount}>{sistema.errors.length}</span>
          </div>
        );
      case 'warning':
        return (
          <div className={styles.statusIndicator} title={`${sistema.warnings.length} advertencias`}>
            <AlertTriangle size={16} color="#D97706" />
            <span className={styles.statusCount}>{sistema.warnings.length}</span>
          </div>
        );
      default:
        return (
          <div className={styles.statusIndicator} title="Sistema válido">
            <CheckCircle size={16} color="#10B981" />
          </div>
        );
    }
  };



  // Renderizar fila expandida con detalles
  const renderExpandedRow = (sistema: ParsedSistemaData) => {
    return (
      <tr key={`${sistema.rowNumber}-expanded`} className={styles.expandedRow}>
        <td colSpan={compact ? 6 : 8} className={styles.expandedContent}>
          <div className={styles.detailsContainer}>
            {/* Errores */}
            {sistema.errors.length > 0 && (
              <div className={styles.errorSection}>
                <h4 className={styles.sectionTitle}>
                  <AlertTriangle size={16} color="#DC2626" />
                  Errores ({sistema.errors.length})
                </h4>
                <ul className={styles.errorList}>
                  {sistema.errors.map((error, index) => (
                    <li key={index} className={styles.errorItem}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Advertencias */}
            {sistema.warnings.length > 0 && (
              <div className={styles.warningSection}>
                <h4 className={styles.sectionTitle}>
                  <AlertTriangle size={16} color="#D97706" />
                  Advertencias ({sistema.warnings.length})
                </h4>
                <ul className={styles.warningList}>
                  {sistema.warnings.map((warning, index) => (
                    <li key={index} className={styles.warningItem}>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Módulos */}
            {showModules && sistema.modulos.length > 0 && (
              <div className={styles.modulesSection}>
                <h4 className={styles.sectionTitle}>
                  <Info size={16} color={colors.primary} />
                  Módulos ({sistema.modulos.length})
                </h4>
                <div className={styles.modulesList}>
                  {sistema.modulos.map((modulo, index) => (
                    <span key={index} className={styles.moduleChip}>
                      {modulo}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Renderizar filtros
  const renderFilters = () => {
    const filterOptions = [
      { key: 'all', label: 'Todos', count: parseResult.sistemas.length },
      { key: 'valid', label: 'Válidos', count: parseResult.summary.validSystems },
      { key: 'invalid', label: 'Con errores', count: parseResult.summary.invalidSystems },
      { key: 'warnings', label: 'Con advertencias', count: parseResult.sistemas.filter(s => s.warnings.length > 0).length }
    ];

    return (
      <div className={styles.filtersContainer}>
        <div className={styles.filterButtons}>
          {filterOptions.map(option => (
            <button
              key={option.key}
              className={`${styles.filterButton} ${currentFilter === option.key ? styles.active : ''}`}
              onClick={() => setCurrentFilter(option.key as FilterType)}
              style={{
                backgroundColor: currentFilter === option.key ? colors.primary + '10' : 'transparent',
                color: currentFilter === option.key ? colors.primary : colors.text,
                borderColor: currentFilter === option.key ? colors.primary : colors.border
              }}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
        
        <div className={styles.viewOptions}>
          <Button
            variant="ghost"
            size="s"
            onClick={() => setShowModules(!showModules)}
            iconName={showModules ? 'EyeOff' : 'Eye'}
            iconPosition="left"
          >
            {showModules ? 'Ocultar' : 'Mostrar'} Módulos
          </Button>
        </div>
      </div>
    );
  };

  const validSystemsInFilter = filteredSystems.filter(s => s.errors.length === 0);
  const allValidSelected = validSystemsInFilter.length > 0 && 
    validSystemsInFilter.every(s => localSelection.has(s.rowNumber));

  return (
    <div className={`${styles.dataPreviewTable} ${compact ? styles.compact : ''}`}>
      {/* Header con filtros y acciones */}
      <div className={styles.tableHeader}>
        <div className={styles.headerInfo}>
          <h3 className={styles.title} style={{ color: colors.text }}>
            Vista Previa de Datos
          </h3>
          <p className={styles.subtitle} style={{ color: colors.textSecondary }}>
            {filteredSystems.length} de {parseResult.sistemas.length} sistemas
          </p>
        </div>
        
        {!readOnly && validSystemsInFilter.length > 0 && (
          <Button
            variant="outline"
            size="s"
            onClick={toggleSelectAllValid}
            iconName={allValidSelected ? 'X' : 'CheckCircle'}
            iconPosition="left"
          >
            {allValidSelected ? 'Deseleccionar' : 'Seleccionar'} Válidos
          </Button>
        )}
      </div>

      {/* Filtros */}
      {renderFilters()}

      {/* Tabla */}
      <div 
        className={styles.tableContainer}
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {!readOnly && <th className={styles.checkboxColumn}></th>}
              <th className={styles.statusColumn}>Estado</th>
              <th className={styles.expandColumn}></th>
              <th>Fila</th>
              <th>Nombre del Sistema</th>
              {!compact && <th>Código</th>}
              <th>Tipo</th>
              <th>Familia</th>
              {!compact && <th>Módulos</th>}
            </tr>
          </thead>
          <tbody>
            {filteredSystems.length === 0 ? (
              <tr>
                <td 
                  colSpan={compact ? 6 : 8} 
                  className={styles.emptyState}
                  style={{ color: colors.textSecondary }}
                >
                  No hay sistemas que coincidan con el filtro seleccionado
                </td>
              </tr>
            ) : (
              filteredSystems.map(sistema => [
                // Fila principal
                <tr 
                  key={sistema.rowNumber}
                  className={`${styles.tableRow} ${getSystemStatus(sistema) === 'error' ? styles.errorRow : ''}`}
                  style={{ 
                    backgroundColor: localSelection.has(sistema.rowNumber) ? colors.primary + '05' : 'transparent'
                  }}
                >
                  {/* Checkbox */}
                  {!readOnly && (
                    <td className={styles.checkboxCell}>
                      {sistema.errors.length === 0 && (
                        <input
                          type="checkbox"
                          checked={localSelection.has(sistema.rowNumber)}
                          onChange={() => toggleSystemSelection(sistema)}
                          className={styles.checkbox}
                        />
                      )}
                    </td>
                  )}
                  
                  {/* Estado */}
                  <td className={styles.statusCell}>
                    {renderStatusIndicator(sistema)}
                  </td>
                  
                  {/* Expandir */}
                  <td className={styles.expandCell}>
                    <button
                      className={styles.expandButton}
                      onClick={() => toggleRowExpansion(sistema.rowNumber)}
                      disabled={sistema.errors.length === 0 && sistema.warnings.length === 0 && sistema.modulos.length === 0}
                    >
                      {expandedRows.has(sistema.rowNumber) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </td>
                  
                  {/* Fila */}
                  <td className={styles.rowNumberCell}>
                    <span className={styles.rowNumber}>{sistema.rowNumber}</span>
                  </td>
                  
                  {/* Nombre */}
                  <td className={styles.nameCell}>
                    <span 
                      className={styles.systemName}
                      style={{ color: colors.text }}
                    >
                      {sistema.sistema.nombreSistema || 'Sin nombre'}
                    </span>
                  </td>
                  
                  {/* Código */}
                  {!compact && (
                    <td className={styles.codeCell}>
                      <span style={{ color: colors.textSecondary }}>
                        {sistema.sistema.codigoSistema || '-'}
                      </span>
                    </td>
                  )}
                  
                  {/* Tipo */}
                  <td className={styles.typeCell}>
                    <span style={{ color: colors.textSecondary }}>
                      {TIPO_SISTEMA_LABELS[sistema.sistema.tipoSistema as keyof typeof TIPO_SISTEMA_LABELS] || '-'}
                    </span>
                  </td>
                  
                  {/* Familia */}
                  <td className={styles.familyCell}>
                    <div className={styles.familyInfo}>
                      <SystemTypeIcon familia={sistema.sistema.familiaSistema} size={16} />
                      <span style={{ color: colors.textSecondary }}>
                        {FAMILIA_SISTEMA_LABELS[sistema.sistema.familiaSistema as keyof typeof FAMILIA_SISTEMA_LABELS] || '-'}
                      </span>
                    </div>
                  </td>
                  
                  {/* Módulos */}
                  {!compact && (
                    <td className={styles.modulesCell}>
                      <span className={styles.moduleCount} style={{ color: colors.textSecondary }}>
                        {sistema.modulos.length > 0 ? `${sistema.modulos.length} módulos` : '-'}
                      </span>
                    </td>
                  )}
                </tr>,
                
                // Fila expandida
                ...(expandedRows.has(sistema.rowNumber) ? [renderExpandedRow(sistema)] : [])
              ])
            )}
          </tbody>
        </table>
      </div>
      
      {/* Información de selección */}
      {!readOnly && localSelection.size > 0 && (
        <div className={styles.selectionInfo}>
          <span style={{ color: colors.text }}>
            {localSelection.size} sistema{localSelection.size > 1 ? 's' : ''} seleccionado{localSelection.size > 1 ? 's' : ''} para importar
          </span>
        </div>
      )}
    </div>
  );
};