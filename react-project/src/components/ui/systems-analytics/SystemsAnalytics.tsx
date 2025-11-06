import React, { useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity, 
  Users, 
  Database,
  GitBranch,
  Calendar,
  AlertCircle,
  CheckCircle,
  Package,
  Layers
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  Sistema, 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema,
  getTipoSistemaLabel,
  getFamiliaSistemaLabel,
  getEstadoSistemaLabel
} from '../../../models/Sistemas';
import styles from './SystemsAnalytics.module.css';

export interface SystemsAnalyticsProps {
  /** Lista de sistemas para analizar */
  sistemas: Sistema[];
  /** ID de la organización */
  organizacionId: number;
  /** Período de análisis en días */
  periodDays?: number;
  /** Modo compacto */
  compact?: boolean;
}

interface SystemMetrics {
  total: number;
  active: number;
  inactive: number;
  withDependencies: number;
  withoutDependencies: number;
  totalModules: number;
  avgModulesPerSystem: number;
  recentlyCreated: number;
  recentlyUpdated: number;
}

interface DistributionData {
  tipoSistema: Array<{ label: string; value: number; percentage: number }>;
  familiaSistema: Array<{ label: string; value: number; percentage: number }>;
  estadoSistema: Array<{ label: string; value: number; percentage: number }>;
}

interface TrendData {
  label: string;
  created: number;
  updated: number;
  date: string;
}

interface DependencyAnalysis {
  totalDependencies: number;
  dependentSystems: number;
  independentSystems: number;
  maxDependencyDepth: number;
  circularDependencies: number;
}

export const SystemsAnalytics: React.FC<SystemsAnalyticsProps> = ({
  sistemas,
  organizacionId,
  periodDays = 30,
  compact = true
}) => {
  const { colors } = useTheme();

  // Calcular métricas generales
  const metrics = useMemo((): SystemMetrics => {
    const now = new Date();
    const periodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    const totalModules = sistemas.reduce((sum, s) => {
      const ma = (s as any).modulosActivos;
      if (typeof ma === 'number') {
        return sum + ma;
      }
      const mods = Array.isArray(s.modulos) ? s.modulos : [];
      // Contabilizar solo módulos no eliminados como aproximación a "activos"
      const activeCount = mods.length > 0 ? mods.filter((m: any) => !m?.registroEliminado).length : 0;
      return sum + activeCount;
    }, 0);

    return {
      total: sistemas.length,
      active: sistemas.filter(s => s.estado === EstadoSistema.Activo).length,
      inactive: sistemas.filter(s => s.estado === EstadoSistema.Inactivo).length,
      withDependencies: sistemas.filter(s => s.sistemaDepende !== null).length,
      withoutDependencies: sistemas.filter(s => s.sistemaDepende === null).length,
      totalModules,
      avgModulesPerSystem: sistemas.length > 0 ? totalModules / sistemas.length : 0,
      recentlyCreated: sistemas.filter(s => new Date(s.fechaCreacion) >= periodStart).length,
      recentlyUpdated: sistemas.filter(s => s.fechaActualizacion && new Date(s.fechaActualizacion) >= periodStart).length
    };
  }, [sistemas, periodDays]);

  // Calcular distribuciones
  const distributions = useMemo((): DistributionData => {
    const tipoCount = new Map<TipoSistema, number>();
    const familiaCount = new Map<FamiliaSistema, number>();
    const estadoCount = new Map<EstadoSistema, number>();

    sistemas.forEach(sistema => {
      tipoCount.set(sistema.tipoSistema, (tipoCount.get(sistema.tipoSistema) || 0) + 1);
      familiaCount.set(sistema.familiaSistema, (familiaCount.get(sistema.familiaSistema) || 0) + 1);
      estadoCount.set(sistema.estado, (estadoCount.get(sistema.estado) || 0) + 1);
    });

    const total = sistemas.length;

    return {
      tipoSistema: Array.from(tipoCount.entries()).map(([tipo, count]) => ({
        label: getTipoSistemaLabel(tipo),
        value: count,
        percentage: total > 0 ? (count / total) * 100 : 0
      })),
      familiaSistema: Array.from(familiaCount.entries()).map(([familia, count]) => ({
        label: getFamiliaSistemaLabel(familia),
        value: count,
        percentage: total > 0 ? (count / total) * 100 : 0
      })),
      estadoSistema: Array.from(estadoCount.entries()).map(([estado, count]) => ({
        label: getEstadoSistemaLabel(estado),

        value: count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
    };
  }, [sistemas]);

  // Calcular tendencias por semana
  const trends = useMemo((): TrendData[] => {
    const weeks = 8; // Últimas 8 semanas
    const now = new Date();
    const weeklyData: TrendData[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));

      const created = sistemas.filter(s => {
        const date = new Date(s.fechaCreacion);
        return date >= weekStart && date < weekEnd;
      }).length;

      const updated = sistemas.filter(s => {
        if (!s.fechaActualizacion) return false;
        const date = new Date(s.fechaActualizacion);
        return date >= weekStart && date < weekEnd;
      }).length;

      weeklyData.push({
        label: `Sem ${weeks - i}`,
        created,
        updated,
        date: weekStart.toISOString().split('T')[0]
      });
    }

    return weeklyData;
  }, [sistemas]);

  // Análisis de dependencias
  const dependencyAnalysis = useMemo((): DependencyAnalysis => {
    const dependencyMap = new Map<number, number[]>();
    let maxDepth = 0;
    let circularCount = 0;

    // Construir mapa de dependencias
    sistemas.forEach(sistema => {
      if (sistema.sistemaDepende) {
        const deps = dependencyMap.get(sistema.sistemaDepende) || [];
        deps.push(sistema.sistemaId);
        dependencyMap.set(sistema.sistemaDepende, deps);
      }
    });

    // Calcular profundidad máxima y detectar ciclos
    const calculateDepth = (sistemaId: number, visited: Set<number> = new Set()): number => {
      if (visited.has(sistemaId)) {
        circularCount++;
        return 0; // Circular dependency
      }

      visited.add(sistemaId);
      const dependents = dependencyMap.get(sistemaId) || [];
      
      if (dependents.length === 0) return 1;
      
      const depths = dependents.map(depId => calculateDepth(depId, new Set(visited)));
      return 1 + Math.max(...depths);
    };

    sistemas.forEach(sistema => {
      if (!sistema.sistemaDepende) { // Root systems
        const depth = calculateDepth(sistema.sistemaId);
        maxDepth = Math.max(maxDepth, depth);
      }
    });

    return {
      totalDependencies: dependencyMap.size,
      dependentSystems: metrics.withDependencies,
      independentSystems: metrics.withoutDependencies,
      maxDependencyDepth: maxDepth,
      circularDependencies: circularCount
    };
  }, [sistemas, metrics]);

  // Renderizar tarjeta de métrica
  const renderMetricCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    subtitle?: string,
    trend?: 'up' | 'down' | 'stable',
    color?: string
  ) => (
    <div className={styles.metricCard} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      <div className={styles.metricIcon} style={{ color: color || colors.primary }}>
        {icon}
      </div>
      <div className={styles.metricContent}>
        <div className={styles.metricValue} style={{ color: colors.text }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className={styles.metricTitle} style={{ color: colors.textSecondary }}>
          {title}
        </div>
        {subtitle && (
          <div className={styles.metricSubtitle} style={{ color: colors.textSecondary }}>
            {subtitle}
          </div>
        )}
        {trend && (
          <div className={`${styles.metricTrend} ${styles[trend]}`}>
            <TrendingUp size={12} />
          </div>
        )}
      </div>
    </div>
  );

  // Paleta de colores del theme con degradados
  const getThemeColors = () => [
    '#3B82F6', // Blue - Primary
    '#10B981', // Emerald - Success  
    '#F59E0B', // Amber - Warning
    '#EF4444', // Red - Danger
    '#8B5CF6', // Violet - Info
    '#06B6D4', // Cyan - Info Secondary
    '#84CC16', // Lime - Success Secondary
    '#F97316', // Orange - Warning Secondary
  ];

  // Renderizar gráfico de pastel (pie chart)
  const renderPieChart = (
    title: string,
    data: Array<{ label: string; value: number; percentage: number }>
  ) => {
    const colors_palette = getThemeColors();
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    // Crear segmentos SVG
    const segments = data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
      
      // Calcular coordenadas del arco
      const startAngleRad = (startAngle - 90) * (Math.PI / 180);
      const endAngleRad = (endAngle - 90) * (Math.PI / 180);
      const largeArcFlag = percentage > 50 ? 1 : 0;
      
      const x1 = 50 + 40 * Math.cos(startAngleRad);
      const y1 = 50 + 40 * Math.sin(startAngleRad);
      const x2 = 50 + 40 * Math.cos(endAngleRad);
      const y2 = 50 + 40 * Math.sin(endAngleRad);
      
      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      cumulativePercentage += percentage;
      
      return {
        ...item,
        pathData,
        color: colors_palette[index % colors_palette.length],
        percentage
      };
    });

    return (
      <div className={styles.chartContainer} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <h3 className={styles.chartTitle} style={{ color: colors.text }}>{title}</h3>
        <div className={styles.pieChartContainer}>
          <svg className={styles.pieChart} viewBox="0 0 100 100">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                stroke={colors.surface}
                strokeWidth="0.5"
                className={styles.pieSegment}
              />
            ))}
          </svg>
          <div className={styles.pieChartLegend}>
            {segments.map((segment, index) => (
              <div key={index} className={styles.legendItem}>
                <div 
                  className={styles.legendColor} 
                  style={{ backgroundColor: segment.color }}
                />
                <span style={{ color: colors.textSecondary }}>
                  {segment.label}: {segment.value} ({segment.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar gráfico de dona (donut chart) 
  const renderDonutChart = (
    title: string,
    data: Array<{ label: string; value: number; percentage: number }>
  ) => {
    const colors_palette = getThemeColors();
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    // Crear segmentos SVG para dona
    const segments = data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
      
      // Calcular coordenadas del arco para dona (radio exterior e interior)
      const startAngleRad = (startAngle - 90) * (Math.PI / 180);
      const endAngleRad = (endAngle - 90) * (Math.PI / 180);
      const largeArcFlag = percentage > 50 ? 1 : 0;
      
      // Radio exterior: 40, Radio interior: 25
      const outerRadius = 40;
      const innerRadius = 25;
      
      const x1Outer = 50 + outerRadius * Math.cos(startAngleRad);
      const y1Outer = 50 + outerRadius * Math.sin(startAngleRad);
      const x2Outer = 50 + outerRadius * Math.cos(endAngleRad);
      const y2Outer = 50 + outerRadius * Math.sin(endAngleRad);
      
      const x1Inner = 50 + innerRadius * Math.cos(startAngleRad);
      const y1Inner = 50 + innerRadius * Math.sin(startAngleRad);
      const x2Inner = 50 + innerRadius * Math.cos(endAngleRad);
      const y2Inner = 50 + innerRadius * Math.sin(endAngleRad);
      
      const pathData = `
        M ${x1Outer} ${y1Outer} 
        A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}
        L ${x2Inner} ${y2Inner}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}
        Z
      `;
      
      cumulativePercentage += percentage;
      
      return {
        ...item,
        pathData,
        color: colors_palette[index % colors_palette.length],
        percentage
      };
    });

    return (
      <div className={styles.chartContainer} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <h3 className={styles.chartTitle} style={{ color: colors.text }}>{title}</h3>
        <div className={styles.donutChartContainer}>
          <div className={styles.donutChartWrapper}>
            <svg className={styles.donutChart} viewBox="0 0 100 100">
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={segment.pathData}
                  fill={segment.color}
                  stroke={colors.surface}
                  strokeWidth="0.5"
                  className={styles.donutSegment}
                />
              ))}
            </svg>
            <div className={styles.donutCenter} style={{ color: colors.text }}>
              <div className={styles.donutCenterValue}>{total}</div>
              <div className={styles.donutCenterLabel} style={{ color: colors.textSecondary }}>
                Total
              </div>
            </div>
          </div>
          <div className={styles.donutChartLegend}>
            {segments.map((segment, index) => (
              <div key={index} className={styles.legendItem}>
                <div 
                  className={styles.legendColor} 
                  style={{ backgroundColor: segment.color }}
                />
                <span style={{ color: colors.textSecondary }}>
                  {segment.label}: {segment.value} ({segment.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar sparklines mini (últimas 4 semanas)
  const renderSparklines = () => {
    // Tomar solo las últimas 4 semanas
    const last4Weeks = trends.slice(-4);
    
    // Crear paths para sparklines
    const createSparklinePath = (data: number[], width: number = 100, height: number = 30) => {
      if (data.length === 0) return '';
      
      const maxValue = Math.max(...data, 1); // Evitar división por 0
      const stepX = width / (data.length - 1);
      
      let path = '';
      data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - (value / maxValue) * height;
        
        if (index === 0) {
          path += `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      });
      
      return path;
    };

    const createdData = last4Weeks.map(w => w.created);
    const updatedData = last4Weeks.map(w => w.updated);
    
    const createdPath = createSparklinePath(createdData);
    const updatedPath = createSparklinePath(updatedData);
    
    // Calcular totales y tendencias
    const totalCreated = createdData.reduce((sum, val) => sum + val, 0);
    const totalUpdated = updatedData.reduce((sum, val) => sum + val, 0);
    
    const createdTrend = createdData.length > 1 ? 
      (createdData[createdData.length - 1] - createdData[0]) >= 0 ? 'up' : 'down' : 'stable';
    const updatedTrend = updatedData.length > 1 ? 
      (updatedData[updatedData.length - 1] - updatedData[0]) >= 0 ? 'up' : 'down' : 'stable';

    return (
      <div className={styles.chartContainer} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <h3 className={styles.chartTitle} style={{ color: colors.text }}>Tendencias Semanales</h3>
        
        <div className={styles.sparklinesContainer}>
          {/* Sparkline para Creados */}
          <div className={styles.sparklineItem}>
            <div className={styles.sparklineHeader}>
              <div className={styles.sparklineLabel} style={{ color: colors.text }}>
                Sistemas Creados
              </div>
              <div className={styles.sparklineValue} style={{ color: '#10B981' }}>
                {totalCreated}
                <span className={`${styles.sparklineTrend} ${styles[createdTrend]}`}>
                  {createdTrend === 'up' ? '↗' : createdTrend === 'down' ? '↘' : '→'}
                </span>
              </div>
            </div>
            <div className={styles.sparklineChart}>
              <svg width="100" height="30" className={styles.sparklineSvg}>
                <path
                  d={createdPath}
                  stroke="#10B981"
                  strokeWidth="2"
                  fill="none"
                  className={styles.sparklinePath}
                />
                {/* Puntos en los extremos */}
                {createdData.length > 0 && (
                  <>
                    <circle cx="0" cy={30 - (createdData[0] / Math.max(...createdData, 1)) * 30} r="2" fill="#10B981" opacity="0.6" />
                    <circle cx="100" cy={30 - (createdData[createdData.length - 1] / Math.max(...createdData, 1)) * 30} r="2" fill="#10B981" />
                  </>
                )}
              </svg>
            </div>
            <div className={styles.sparklineSubtext} style={{ color: colors.textSecondary }}>
              Últimas 4 semanas
            </div>
          </div>

          {/* Sparkline para Actualizados */}
          <div className={styles.sparklineItem}>
            <div className={styles.sparklineHeader}>
              <div className={styles.sparklineLabel} style={{ color: colors.text }}>
                Sistemas Actualizados
              </div>
              <div className={styles.sparklineValue} style={{ color: '#3B82F6' }}>
                {totalUpdated}
                <span className={`${styles.sparklineTrend} ${styles[updatedTrend]}`}>
                  {updatedTrend === 'up' ? '↗' : updatedTrend === 'down' ? '↘' : '→'}
                </span>
              </div>
            </div>
            <div className={styles.sparklineChart}>
              <svg width="100" height="30" className={styles.sparklineSvg}>
                <path
                  d={updatedPath}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  className={styles.sparklinePath}
                />
                {/* Puntos en los extremos */}
                {updatedData.length > 0 && (
                  <>
                    <circle cx="0" cy={30 - (updatedData[0] / Math.max(...updatedData, 1)) * 30} r="2" fill="#3B82F6" opacity="0.6" />
                    <circle cx="100" cy={30 - (updatedData[updatedData.length - 1] / Math.max(...updatedData, 1)) * 30} r="2" fill="#3B82F6" />
                  </>
                )}
              </svg>
            </div>
            <div className={styles.sparklineSubtext} style={{ color: colors.textSecondary }}>
              Últimas 4 semanas
            </div>
          </div>
        </div>

        {/* Período de análisis */}
        <div className={styles.sparklinesPeriod} style={{ color: colors.textSecondary }}>
          {last4Weeks.length > 0 && (
            <>
              {last4Weeks[0].label} - {last4Weeks[last4Weeks.length - 1].label}
            </>
          )}
        </div>
      </div>
    );
  };

  // Renderizar insights y recomendaciones
  const renderInsights = () => {
    const insights = [];

    if (metrics.inactive > metrics.active * 0.2) {
      insights.push({
        type: 'warning',
        message: `Tienes ${metrics.inactive} sistemas inactivos (${(metrics.inactive / metrics.total * 100).toFixed(1)}%). Considera revisar si son necesarios.`
      });
    }

    if (dependencyAnalysis.circularDependencies > 0) {
      insights.push({
        type: 'error',
        message: `Se detectaron ${dependencyAnalysis.circularDependencies} dependencias circulares. Esto puede causar problemas.`
      });
    }

    if (metrics.avgModulesPerSystem < 2) {
      insights.push({
        type: 'info',
        message: `Promedio de ${metrics.avgModulesPerSystem.toFixed(1)} módulos por sistema. Considera modularizar mejor los sistemas grandes.`
      });
    }

    if (metrics.recentlyCreated > 5) {
      insights.push({
        type: 'success',
        message: `¡Excelente! ${metrics.recentlyCreated} sistemas creados en los últimos ${periodDays} días.`
      });
    }

    return (
      <div className={styles.insightsContainer} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <h3 className={styles.chartTitle} style={{ color: colors.text }}>Insights y Recomendaciones</h3>
        {insights.length > 0 ? (
          <div className={styles.insightsList}>
            {insights.map((insight, index) => (
              <div key={index} className={`${styles.insightItem} ${styles[insight.type]}`}>
                <div className={styles.insightIcon}>
                  {insight.type === 'error' && <AlertCircle size={16} />}
                  {insight.type === 'warning' && <AlertCircle size={16} />}
                  {insight.type === 'success' && <CheckCircle size={16} />}
                  {insight.type === 'info' && <Activity size={16} />}
                </div>
                <span style={{ color: colors.text }}>{insight.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: colors.textSecondary }}>Todo se ve bien. No hay recomendaciones en este momento.</p>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.systemsAnalytics} ${compact ? styles.compact : ''}`}>
      {/* Métricas principales */}
      <div className={styles.metricsGrid}>
        {renderMetricCard(
          <Database size={24} />, 
          'Total de Sistemas', 
          metrics.total, 
          `${metrics.active} activos, ${metrics.inactive} inactivos`
        )}
        {renderMetricCard(
          <Package size={24} />, 
          'Total de Módulos', 
          metrics.totalModules, 
          `${metrics.avgModulesPerSystem.toFixed(1)} promedio por sistema`,
          undefined,
          '#10B981'
        )}
        {renderMetricCard(
          <GitBranch size={24} />, 
          'Con Dependencias', 
          metrics.withDependencies, 
          `${metrics.withoutDependencies} independientes`,
          undefined,
          '#F59E0B'
        )}
        {renderMetricCard(
          <Calendar size={24} />, 
          'Actividad Reciente', 
          metrics.recentlyCreated, 
          `${metrics.recentlyUpdated} actualizados`,
          metrics.recentlyCreated > 0 ? 'up' : 'stable',
          '#3B82F6'
        )}
      </div>

      {/* Gráficos de distribución */}
      <div className={styles.chartsGrid}>
        {renderPieChart('Distribución por Tipo', distributions.tipoSistema)}
        {renderDonutChart('Distribución por Familia', distributions.familiaSistema)}
        {renderSparklines()}
        <div className={styles.dependencyAnalysis} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <h3 className={styles.chartTitle} style={{ color: colors.text }}>Análisis de Dependencias</h3>
          <div className={styles.dependencyMetrics}>
            <div className={styles.dependencyMetric}>
              <span style={{ color: colors.textSecondary }}>Profundidad máxima:</span>
              <strong style={{ color: colors.text }}>{dependencyAnalysis.maxDependencyDepth} niveles</strong>
            </div>
            <div className={styles.dependencyMetric}>
              <span style={{ color: colors.textSecondary }}>Sistemas dependientes:</span>
              <strong style={{ color: colors.text }}>{dependencyAnalysis.dependentSystems}</strong>
            </div>
            <div className={styles.dependencyMetric}>
              <span style={{ color: colors.textSecondary }}>Sistemas independientes:</span>
              <strong style={{ color: colors.text }}>{dependencyAnalysis.independentSystems}</strong>
            </div>
            {dependencyAnalysis.circularDependencies > 0 && (
              <div className={styles.dependencyMetric}>
                <span style={{ color: '#EF4444' }}>Dependencias circulares:</span>
                <strong style={{ color: '#EF4444' }}>{dependencyAnalysis.circularDependencies}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};