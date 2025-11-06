import React, { useState, useEffect, useMemo } from 'react';
import { 
  GitBranch, 
  Move3D, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  RotateCcw,
  Save,
  X
} from 'lucide-react';
import { Button } from '../button/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { StatusBadge } from '../status-badge/StatusBadge';
import { SystemTypeIcon } from '../system-type-icon/SystemTypeIcon';
import { HierarchyIndicator } from '../hierarchy-indicator/HierarchyIndicator';
import { AlertService } from '../alerts/AlertService';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Sistema, 
  EstadoSistema, 
  TIPO_SISTEMA_LABELS, 
  FAMILIA_SISTEMA_LABELS 
} from '../../../models/Sistemas';
import { 
  validateHierarchy, 
  getPossibleParentSystems, 
  getSystemHierarchyLevel 
} from '../../../utils/sistemasValidation';
import styles from './HierarchyEditor.module.css';

export interface HierarchyEditorProps {
  /** Lista de sistemas para gestionar jerarquías */
  sistemas: Sistema[];
  /** ID de la organización */
  organizacionId: number;
  /** Función llamada cuando cambian las jerarquías */
  onHierarchyChange?: (updatedSystems: Sistema[]) => void;
  /** Sistema seleccionado para editar */
  selectedSistemaId?: number;
  /** Función llamada cuando se selecciona un sistema */
  onSystemSelect?: (sistemaId: number | null) => void;
  /** Estado de loading */
  loading?: boolean;
  /** Solo lectura */
  readOnly?: boolean;
  /** Mostrar estadísticas */
  showStats?: boolean;
}

interface HierarchyChange {
  sistemaId: number;
  oldParentId: number | null;
  newParentId: number | null;
  systemName: string;
}

interface HierarchyStats {
  total: number;
  independent: number;
  dependent: number;
  maxDepth: number;
  circularIssues: number;
}

export const HierarchyEditor: React.FC<HierarchyEditorProps> = ({
  sistemas,
  organizacionId,
  onHierarchyChange,
  selectedSistemaId,
  onSystemSelect,
  loading = false,
  readOnly = false,
  showStats = true
}) => {
  const { colors } = useTheme();

  // Estados locales
  const [localSistemas, setLocalSistemas] = useState<Sistema[]>(sistemas);
  const [pendingChanges, setPendingChanges] = useState<HierarchyChange[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['independent']));

  // Sincronizar sistemas externos
  useEffect(() => {
    setLocalSistemas(sistemas);
    setPendingChanges([]);
  }, [sistemas]);

  // Calcular jerarquías y grupos
  const hierarchyData = useMemo(() => {
    const sistemasActivos = localSistemas.filter(s => 
      s.organizacionId === organizacionId && 
      s.estado === EstadoSistema.ACTIVO && 
      !s.registroEliminado
    );

    // Separar sistemas independientes y dependientes
    const independents = sistemasActivos.filter(s => !s.sistemaDepende);
    const dependents = sistemasActivos.filter(s => s.sistemaDepende);

    // Construir árbol jerárquico
    const buildHierarchy = (parentId: number | null): Sistema[] => {
      return sistemasActivos
        .filter(s => s.sistemaDepende === parentId)
        .map(sistema => ({
          ...sistema,
          sistemasHijos: buildHierarchy(sistema.sistemaId)
        }));
    };

    const hierarchy = buildHierarchy(null);

    // Calcular estadísticas
    const stats: HierarchyStats = {
      total: sistemasActivos.length,
      independent: independents.length,
      dependent: dependents.length,
      maxDepth: Math.max(...sistemasActivos.map(s => getSystemHierarchyLevel(s, sistemasActivos))),
      circularIssues: sistemasActivos.filter(s => {
        if (!s.sistemaDepende) return false;
        const validation = validateHierarchy(s.sistemaId, s.sistemaDepende, sistemasActivos);
        return !validation.isValid && validation.error?.includes('circular');
      }).length
    };

    return {
      hierarchy,
      independents,
      dependents,
      stats,
      sistemasActivos
    };
  }, [localSistemas, organizacionId]);

  // Manejar cambio de dependencia
  const handleDependencyChange = (sistemaId: number, newParentId: number | null) => {
    if (readOnly) return;

    const sistema = localSistemas.find(s => s.sistemaId === sistemaId);
    if (!sistema) return;

    // Validar la nueva jerarquía
    if (newParentId !== null) {
      const validation = validateHierarchy(sistemaId, newParentId, localSistemas);
      if (!validation.isValid) {
        AlertService.error(validation.error || 'Jerarquía inválida');
        return;
      }
    }

    // Crear el cambio pendiente
    const change: HierarchyChange = {
      sistemaId,
      oldParentId: sistema.sistemaDepende,
      newParentId,
      systemName: sistema.nombreSistema
    };

    // Actualizar sistema localmente
    const updatedSistemas = localSistemas.map(s => 
      s.sistemaId === sistemaId 
        ? { 
            ...s, 
            sistemaDepende: newParentId,
            sistemaDepende_Nombre: newParentId 
              ? localSistemas.find(parent => parent.sistemaId === newParentId)?.nombreSistema
              : undefined
          } 
        : s
    );

    setLocalSistemas(updatedSistemas);
    setPendingChanges(prev => {
      // Remover cambios previos para el mismo sistema
      const filtered = prev.filter(c => c.sistemaId !== sistemaId);
      // Solo agregar si hay un cambio real
      if (change.oldParentId !== change.newParentId) {
        return [...filtered, change];
      }
      return filtered;
    });
  };

  // Guardar cambios
  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) return;

    setIsSubmitting(true);
    const loadingToastId = AlertService.loading(`Guardando ${pendingChanges.length} cambios jerárquicos...`);

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Notificar cambios al componente padre
      if (onHierarchyChange) {
        onHierarchyChange(localSistemas);
      }

      setPendingChanges([]);
      
      AlertService.updateLoading(
        loadingToastId,
        'success',
        '¡Jerarquías actualizadas exitosamente!',
        3000
      );

    } catch (error) {
      console.error('Error al guardar jerarquías:', error);
      AlertService.updateLoading(
        loadingToastId,
        'error',
        'Error al guardar los cambios',
        4000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revertir cambios
  const handleRevertChanges = () => {
    setLocalSistemas(sistemas);
    setPendingChanges([]);
    AlertService.info('Cambios revertidos');
  };

  // Toggle grupo expandido
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Renderizar sistema individual
  const renderSystem = (sistema: Sistema, level: number = 0) => {
    const isSelected = selectedSistemaId === sistema.sistemaId;
    const hasChanges = pendingChanges.some(c => c.sistemaId === sistema.sistemaId);
    const possibleParents = getPossibleParentSystems(organizacionId, sistema.sistemaId, hierarchyData.sistemasActivos);
    
    return (
      <div key={sistema.sistemaId} className={styles.systemItem} style={{ marginLeft: `${level * 20}px` }}>
        <div 
          className={`${styles.systemCard} ${isSelected ? styles.selected : ''} ${hasChanges ? styles.hasChanges : ''}`}
          onClick={() => onSystemSelect?.(sistema.sistemaId)}
          style={{ 
            backgroundColor: isSelected ? colors.primary + '10' : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border
          }}
        >
          <div className={styles.systemInfo}>
            <div className={styles.systemHeader}>
              <SystemTypeIcon 
                familia={sistema.familiaSistema} 
                size={16}
              />
              
              <h4 className={styles.systemName} style={{ color: colors.text }}>
                {sistema.nombreSistema}
              </h4>
              
              <StatusBadge
                status={sistema.estado === EstadoSistema.ACTIVO ? 'active' : 'inactive'}
                size="s"
              />

              {hasChanges && (
                <div className={styles.changeIndicator} style={{ color: '#F59E0B' }}>
                  <AlertTriangle size={14} />
                </div>
              )}
            </div>

            <div className={styles.systemMeta}>
              <span style={{ color: colors.textSecondary }}>
                {TIPO_SISTEMA_LABELS[sistema.tipoSistema]} • {FAMILIA_SISTEMA_LABELS[sistema.familiaSistema]}
              </span>
              
              <HierarchyIndicator
                type={sistema.sistemaDepende ? 'child' : 'independent'}
                label={sistema.sistemaDepende ? `Depende de: ${sistema.sistemaDepende_Nombre}` : 'Sistema independiente'}
                size="sm"
              />
            </div>
          </div>

          {!readOnly && (
            <div className={styles.dependencyControl}>
              <Select
                value={sistema.sistemaDepende?.toString() || 'none'}
                onValueChange={(value) => handleDependencyChange(
                  sistema.sistemaId, 
                  value === 'none' ? null : parseInt(value)
                )}
                disabled={loading || isSubmitting}
              >
                <SelectTrigger className={styles.dependencySelect}>
                  <SelectValue placeholder="Sin dependencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin dependencia</SelectItem>
                  {possibleParents.map(parent => (
                    <SelectItem key={parent.sistemaId} value={parent.sistemaId.toString()}>
                      {parent.nombreSistema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Renderizar sistemas hijos */}
        {sistema.sistemasHijos && sistema.sistemasHijos.length > 0 && (
          <div className={styles.childrenContainer}>
            {sistema.sistemasHijos.map(child => renderSystem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.hierarchyEditor}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <GitBranch size={20} color={colors.primary} />
          <h3 className={styles.title} style={{ color: colors.text }}>
            Editor de Jerarquías
          </h3>
          {pendingChanges.length > 0 && (
            <span className={styles.changesBadge} style={{ backgroundColor: '#F59E0B', color: 'white' }}>
              {pendingChanges.length} cambios pendientes
            </span>
          )}
        </div>

        {/* Acciones */}
        {!readOnly && pendingChanges.length > 0 && (
          <div className={styles.actions}>
            <Button
              variant="outline"
              size="s"
              onClick={handleRevertChanges}
              disabled={isSubmitting}
              icon={<RotateCcw size={14} />}
            >
              Revertir
            </Button>
            <Button
              variant="primary"
              size="s"
              onClick={handleSaveChanges}
              disabled={isSubmitting}
              loading={isSubmitting}
              icon={<Save size={14} />}
            >
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {showStats && (
        <div className={styles.stats} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: colors.text }}>
              {hierarchyData.stats.total}
            </span>
            <span className={styles.statLabel} style={{ color: colors.textSecondary }}>
              Total de sistemas
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: colors.text }}>
              {hierarchyData.stats.independent}
            </span>
            <span className={styles.statLabel} style={{ color: colors.textSecondary }}>
              Independientes
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: colors.text }}>
              {hierarchyData.stats.dependent}
            </span>
            <span className={styles.statLabel} style={{ color: colors.textSecondary }}>
              Dependientes
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: colors.text }}>
              {hierarchyData.stats.maxDepth}
            </span>
            <span className={styles.statLabel} style={{ color: colors.textSecondary }}>
              Niveles máximos
            </span>
          </div>
          {hierarchyData.stats.circularIssues > 0 && (
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: '#EF4444' }}>
                {hierarchyData.stats.circularIssues}
              </span>
              <span className={styles.statLabel} style={{ color: '#EF4444' }}>
                Problemas circulares
              </span>
            </div>
          )}
        </div>
      )}

      {/* Lista jerárquica */}
      <div className={styles.hierarchyList}>
        {hierarchyData.hierarchy.length === 0 ? (
          <div className={styles.emptyState} style={{ color: colors.textSecondary }}>
            <GitBranch size={32} />
            <p>No hay sistemas configurados para mostrar jerarquías</p>
          </div>
        ) : (
          hierarchyData.hierarchy.map(sistema => renderSystem(sistema))
        )}
      </div>

      {/* Cambios pendientes */}
      {pendingChanges.length > 0 && (
        <div className={styles.pendingChanges} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <h4 style={{ color: colors.text }}>Cambios Pendientes:</h4>
          <ul>
            {pendingChanges.map((change, index) => (
              <li key={index} className={styles.changeItem} style={{ color: colors.textSecondary }}>
                <ArrowRight size={14} />
                <span>
                  <strong>{change.systemName}</strong>: 
                  {change.oldParentId 
                    ? ` dependía de "${localSistemas.find(s => s.sistemaId === change.oldParentId)?.nombreSistema}"` 
                    : ' era independiente'
                  }
                  {change.newParentId 
                    ? ` → ahora depende de "${localSistemas.find(s => s.sistemaId === change.newParentId)?.nombreSistema}"` 
                    : ' → ahora es independiente'
                  }
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};