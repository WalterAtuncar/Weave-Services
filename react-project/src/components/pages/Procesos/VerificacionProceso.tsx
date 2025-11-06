import React from 'react';
import { X, Eye, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConfiguracionData } from './ConfiguracionCabecera';
import { ActividadesData } from './DefinicionActividades';
import styles from './Procesos.module.css';

interface VerificacionProcesoProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  configuracionData: ConfiguracionData;
  actividadesData: ActividadesData;
}

export const VerificacionProceso: React.FC<VerificacionProcesoProps> = ({
  isOpen,
  onClose,
  onContinue,
  configuracionData,
  actividadesData
}) => {
  const { colors } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ backgroundColor: colors.surface, maxWidth: '1000px' }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ color: colors.text }}>
            <Eye size={24} />
            3.- Verifica tu proceso
          </h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            style={{ color: colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Información del proceso */}
          <div style={{ 
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: colors.background,
            borderRadius: '0.5rem',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: colors.text, margin: 0, fontSize: '1.25rem' }}>
                {configuracionData.nombre}
              </h3>
              <span style={{ 
                padding: '0.25rem 0.75rem',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase'
              }}>
                {configuracionData.estado}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Código:</span>
                <p style={{ color: colors.text, margin: '0.25rem 0', fontWeight: '500' }}>
                  {configuracionData.codigo}
                </p>
              </div>
              <div>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Categoría:</span>
                <p style={{ color: colors.text, margin: '0.25rem 0', fontWeight: '500' }}>
                  {configuracionData.categoria}
                </p>
              </div>
              <div>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Nivel:</span>
                <p style={{ color: colors.text, margin: '0.25rem 0', fontWeight: '500' }}>
                  {configuracionData.nivel}
                </p>
              </div>
              <div>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Criticidad:</span>
                <p style={{ color: colors.text, margin: '0.25rem 0', fontWeight: '500' }}>
                  {configuracionData.criticidad}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Descripción:</span>
              <p style={{ color: colors.text, margin: '0.25rem 0', lineHeight: '1.5' }}>
                {configuracionData.descripcion}
              </p>
            </div>
          </div>

          {/* Diagrama BPMN simplificado */}
          <div className={styles.diagramContainer} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'center' }}>
              {/* Swimlane vertical */}
              <div style={{ 
                writingMode: 'vertical-rl' as const,
                textOrientation: 'mixed' as const,
                background: colors.background,
                padding: '1rem 0.5rem',
                borderRadius: '0.375rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: colors.textSecondary,
                minWidth: '80px',
                textAlign: 'center'
              }}>
                Actor 1
              </div>

              {/* Elementos del proceso */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                {/* Evento de inicio */}
                <div className={`${styles.bpmnElement} ${styles.start}`}>
                  ●
                </div>

                {/* Actividades */}
                {actividadesData.actividades.map((actividad, index) => (
                  <React.Fragment key={actividad.id}>
                    <div className={styles.bpmnConnector}></div>
                    <div className={styles.bpmnElement}>
                      {actividad.que}
                    </div>
                  </React.Fragment>
                ))}

                {/* Evento de fin */}
                <div className={styles.bpmnConnector}></div>
                <div className={`${styles.bpmnElement} ${styles.end}`}>
                  ●
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de actividades */}
          <div style={{ 
            backgroundColor: colors.background,
            borderRadius: '0.5rem',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '1rem',
              borderBottom: `1px solid ${colors.border}`,
              backgroundColor: colors.surface
            }}>
              <h3 style={{ color: colors.text, margin: 0, fontSize: '1rem' }}>
                Actividades del Proceso ({actividadesData.actividades.length})
              </h3>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {actividadesData.actividades.map((actividad, index) => (
                <div 
                  key={actividad.id}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: index < actividadesData.actividades.length - 1 ? `1px solid ${colors.border}` : 'none',
                    alignItems: 'start'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        backgroundColor: colors.primary,
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {index + 1}
                      </span>
                      <h4 style={{ color: colors.text, margin: 0, fontSize: '0.875rem', fontWeight: '600' }}>
                        {actividad.que}
                      </h4>
                    </div>
                    <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.75rem', lineHeight: '1.4' }}>
                      {actividad.como}
                    </p>
                  </div>
                  
                  <div>
                    <span style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Responsable:</span>
                    <p style={{ color: colors.text, margin: '0.25rem 0', fontSize: '0.875rem', fontWeight: '500' }}>
                      {actividad.quien}
                    </p>
                  </div>
                  
                  <div>
                    <span style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>Sistema:</span>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: actividad.sistema === 'SAP' ? '#dcfce7' : '#fff7ed',
                      color: actividad.sistema === 'SAP' ? '#16a34a' : '#ea580c',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      marginTop: '0.25rem'
                    }}>
                      {actividad.sistema}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.textSecondary,
              borderColor: colors.border
            }}
          >
            Cerrar
          </button>
          
          <button
            onClick={onContinue}
            className={`${styles.actionButton} ${styles.primaryButton}`}
            style={{ 
              backgroundColor: colors.primary,
              color: 'white'
            }}
          >
            <CheckCircle size={16} />
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}; 