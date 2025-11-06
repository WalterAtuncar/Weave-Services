import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConfiguracionData } from './ConfiguracionCabecera';
import { ActividadesData } from './DefinicionActividades';
import styles from './Procesos.module.css';

interface DiagramaFlujoProps {
  isOpen: boolean;
  onClose: () => void;
  configuracionData: ConfiguracionData;
  actividadesData: ActividadesData;
}

export const DiagramaFlujo: React.FC<DiagramaFlujoProps> = ({
  isOpen,
  onClose,
  configuracionData,
  actividadesData
}) => {
  const { colors } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  const exportDiagram = () => {
    // Simular exportación del diagrama
  };

  const swimlanes = [
    { name: 'Mesa de partes', color: '#dbeafe' },
    { name: 'Analista de compras', color: '#f3e8ff' },
    { name: 'Jefe de compras', color: '#fef3c7' }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div 
        className={styles.modalContent} 
        style={{ 
          backgroundColor: colors.surface,
          maxWidth: isFullscreen ? '100vw' : '1200px',
          maxHeight: isFullscreen ? '100vh' : '90vh',
          margin: isFullscreen ? 0 : 'auto',
          borderRadius: isFullscreen ? 0 : '0.5rem'
        }}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ color: colors.text }}>
            {configuracionData.nombre}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
              Código: {configuracionData.codigo}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleZoomOut}
              className={styles.toolbarButton}
              style={{ color: colors.textSecondary }}
              title="Alejar"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleResetZoom}
              className={styles.toolbarButton}
              style={{ color: colors.textSecondary, fontSize: '0.75rem', fontWeight: '600' }}
              title="Restablecer zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className={styles.toolbarButton}
              style={{ color: colors.textSecondary }}
              title="Acercar"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={exportDiagram}
              className={styles.toolbarButton}
              style={{ color: colors.primary }}
              title="Exportar diagrama"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={styles.toolbarButton}
              style={{ color: colors.textSecondary }}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
              className={styles.closeButton}
              onClick={onClose}
              style={{ color: colors.textSecondary }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody} style={{ 
          padding: 0,
          overflow: 'auto',
          minHeight: isFullscreen ? 'calc(100vh - 120px)' : '500px'
        }}>
          <div style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            padding: '2rem',
            minWidth: `${100 / zoom}%`,
            minHeight: `${100 / zoom}%`
          }}>
            {/* BPMN Diagram */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
              width: '100%',
              minHeight: '600px',
              backgroundColor: 'white',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem'
            }}>
              {/* Pool Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: colors.background,
                borderBottom: `1px solid ${colors.border}`,
                borderTopLeftRadius: '0.5rem',
                borderTopRightRadius: '0.5rem'
              }}>
                <h3 style={{ color: colors.text, margin: 0, fontSize: '1.1rem' }}>
                  {configuracionData.nombre} - Diagrama de Flujo
                </h3>
              </div>

              {/* Swimlanes */}
              {swimlanes.map((swimlane, swimlaneIndex) => {
                const actividadesSwimlane = actividadesData.actividades.filter(actividad => 
                  actividad.quien.toLowerCase().includes(swimlane.name.toLowerCase().replace('de ', ''))
                );

                return (
                  <div key={swimlane.name} style={{ 
                    display: 'flex',
                    minHeight: '150px',
                    borderBottom: swimlaneIndex < swimlanes.length - 1 ? `1px solid ${colors.border}` : 'none'
                  }}>
                    {/* Swimlane Label */}
                    <div style={{
                      width: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: swimlane.color,
                      borderRight: `1px solid ${colors.border}`,
                      writingMode: 'vertical-rl' as const,
                      textOrientation: 'mixed' as const,
                      fontWeight: '600',
                      color: '#1f2937',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      padding: '1rem 0.5rem'
                    }}>
                      {swimlane.name}
                    </div>

                    {/* Swimlane Content */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      padding: '2rem',
                      position: 'relative'
                    }}>
                      {/* Start Event (solo en el primer swimlane) */}
                      {swimlaneIndex === 0 && (
                        <>
                          <div className={`${styles.bpmnElement} ${styles.start}`}>
                            ●
                          </div>
                          {actividadesSwimlane.length > 0 && <div className={styles.bpmnConnector}></div>}
                        </>
                      )}

                      {/* Activities for this swimlane */}
                      {actividadesSwimlane.map((actividad, index) => (
                        <React.Fragment key={actividad.id}>
                          <div className={styles.bpmnElement} title={actividad.como}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                              {actividad.que}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                              {actividad.sistema}
                            </div>
                          </div>
                          {index < actividadesSwimlane.length - 1 && <div className={styles.bpmnConnector}></div>}
                        </React.Fragment>
                      ))}

                      {/* End Event (solo en el último swimlane con actividades) */}
                      {swimlaneIndex === swimlanes.length - 1 && actividadesSwimlane.length > 0 && (
                        <>
                          <div className={styles.bpmnConnector}></div>
                          <div className={`${styles.bpmnElement} ${styles.end}`}>
                            ●
                          </div>
                        </>
                      )}

                      {/* Sequence flows between swimlanes */}
                      {swimlaneIndex < swimlanes.length - 1 && actividadesSwimlane.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-1px',
                          right: '50%',
                          width: '2px',
                          height: '20px',
                          backgroundColor: '#6b7280'
                        }}></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Process Information */}
            <div style={{
              marginTop: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                padding: '1rem',
                backgroundColor: colors.background,
                borderRadius: '0.5rem',
                border: `1px solid ${colors.border}`
              }}>
                <h4 style={{ color: colors.text, margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                  Información del Proceso
                </h4>
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: '1.4' }}>
                  <p style={{ margin: '0.25rem 0' }}>Categoría: {configuracionData.categoria}</p>
                  <p style={{ margin: '0.25rem 0' }}>Nivel: {configuracionData.nivel}</p>
                  <p style={{ margin: '0.25rem 0' }}>Criticidad: {configuracionData.criticidad}</p>
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: colors.background,
                borderRadius: '0.5rem',
                border: `1px solid ${colors.border}`
              }}>
                <h4 style={{ color: colors.text, margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                  Estadísticas
                </h4>
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: '1.4' }}>
                  <p style={{ margin: '0.25rem 0' }}>Actividades: {actividadesData.actividades.length}</p>
                  <p style={{ margin: '0.25rem 0' }}>Responsables: {new Set(actividadesData.actividades.map(a => a.quien)).size}</p>
                  <p style={{ margin: '0.25rem 0' }}>Sistemas: {new Set(actividadesData.actividades.map(a => a.sistema)).size}</p>
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: colors.background,
                borderRadius: '0.5rem',
                border: `1px solid ${colors.border}`
              }}>
                <h4 style={{ color: colors.text, margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                  Sistemas Utilizados
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {Array.from(new Set(actividadesData.actividades.map(a => a.sistema))).map(sistema => (
                    <span 
                      key={sistema}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: sistema === 'SAP' ? '#dcfce7' : '#fff7ed',
                        color: sistema === 'SAP' ? '#16a34a' : '#ea580c',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {sistema}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 