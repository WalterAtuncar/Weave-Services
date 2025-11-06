import React from 'react';
import { Clock, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConfiguracionData } from './ConfiguracionCabecera';
import { ActividadesData } from './DefinicionActividades';
import styles from './Procesos.module.css';

interface AcuerdoServicioProps {
  configuracionData: ConfiguracionData;
  actividadesData: ActividadesData;
}

export const AcuerdoServicio: React.FC<AcuerdoServicioProps> = ({
  configuracionData,
  actividadesData
}) => {
  const { colors } = useTheme();

  const metricas = {
    tiempoEjecucion: '2-4 horas',
    disponibilidad: '99.5%',
    precisionDatos: '98.2%',
    satisfaccionUsuario: '4.5/5',
    volumenTransacciones: '150/día',
    tiempoRespuesta: '< 30 min'
  };

  return (
    <div className={styles.container} style={{ backgroundColor: colors.background }}>
      <div className={styles.serviceAgreement}>
        <div className={styles.serviceTitle} style={{ color: colors.text }}>
          <Target size={24} />
          Acuerdo de Nivel de Servicio (SLA)
        </div>

        <div className={styles.serviceGrid}>
          <div className={styles.serviceSection}>
            <div className={styles.sectionTitle}>Métricas de Rendimiento</div>
            <div className={styles.sectionContent}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Tiempo de ejecución:</span>
                <span className={styles.metricValue}>{metricas.tiempoEjecucion}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Tiempo de respuesta:</span>
                <span className={styles.metricValue}>{metricas.tiempoRespuesta}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Volumen diario:</span>
                <span className={styles.metricValue}>{metricas.volumenTransacciones}</span>
              </div>
            </div>
          </div>

          <div className={styles.serviceSection}>
            <div className={styles.sectionTitle}>Calidad del Servicio</div>
            <div className={styles.sectionContent}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Disponibilidad:</span>
                <span className={styles.metricValue}>{metricas.disponibilidad}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Precisión de datos:</span>
                <span className={styles.metricValue}>{metricas.precisionDatos}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Satisfacción:</span>
                <span className={styles.metricValue}>{metricas.satisfaccionUsuario}</span>
              </div>
            </div>
          </div>

          <div className={styles.serviceSection}>
            <div className={styles.sectionTitle}>Responsabilidades</div>
            <div className={styles.sectionContent}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Responsables:</span>
                <span className={styles.metricValue}>{new Set(actividadesData.actividades.map(a => a.quien)).size}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Sistemas:</span>
                <span className={styles.metricValue}>{new Set(actividadesData.actividades.map(a => a.sistema)).size}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Actividades:</span>
                <span className={styles.metricValue}>{actividadesData.actividades.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 