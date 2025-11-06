import React, { useState } from 'react';
import { ChevronDown, Settings, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConfiguracionData } from './ConfiguracionCabecera';
import { ActividadesData } from './DefinicionActividades';
import styles from './Procesos.module.css';

interface VistaCompletadaProps {
  configuracionData: ConfiguracionData;
  actividadesData: ActividadesData;
  onEdit?: () => void;
  onDelete?: () => void;
  onClone?: () => void;
  onViewDiagram?: () => void;
}

export const VistaCompletada: React.FC<VistaCompletadaProps> = ({
  configuracionData,
  actividadesData,
  onEdit,
  onDelete,
  onClone,
  onViewDiagram
}) => {
  const { colors } = useTheme();
  const [sectionsExpanded, setSectionsExpanded] = useState({
    actividades: true,
    configuracion: false
  });

  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return '#10b981';
      case 'En proceso': return '#f59e0b';
      case 'Borrador': return '#6b7280';
      case 'Por aplicar': return '#6366f1';
      default: return colors.textSecondary;
    }
  };

  return (
    <div className={styles.container} style={{ backgroundColor: colors.background }}>
      {/* Header del proceso */}
      <div style={{ 
        backgroundColor: colors.surface,
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ color: colors.text, margin: 0, fontSize: '1.5rem' }}>
                {configuracionData.nombre}
              </h1>
              <span 
                style={{ 
                  padding: '0.25rem 0.75rem',
                  backgroundColor: getEstadoColor(configuracionData.estado) + '20',
                  color: getEstadoColor(configuracionData.estado),
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  textTransform: 'uppercase'
                }}
              >
                {configuracionData.estado}
              </span>
            </div>
            <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.875rem' }}>
              Código: {configuracionData.codigo}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onViewDiagram && (
              <button
                onClick={onViewDiagram}
                className={styles.toolbarButton}
                style={{ 
                  color: colors.primary,
                  border: `1px solid ${colors.border}`,
                  padding: '0.5rem'
                }}
                title="Ver diagrama"
              >
                <Eye size={16} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className={styles.toolbarButton}
                style={{ 
                  color: colors.primary,
                  border: `1px solid ${colors.border}`,
                  padding: '0.5rem'
                }}
                title="Editar proceso"
              >
                <Edit size={16} />
              </button>
            )}
            {onClone && (
              <button
                onClick={onClone}
                className={styles.toolbarButton}
                style={{ 
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  padding: '0.5rem'
                }}
                title="Clonar proceso"
              >
                <Copy size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className={styles.toolbarButton}
                style={{ 
                  color: '#ef4444',
                  border: `1px solid ${colors.border}`,
                  padding: '0.5rem'
                }}
                title="Eliminar proceso"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
          <div>
            <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Actividades:</span>
            <p style={{ color: colors.text, margin: '0.25rem 0', fontWeight: '500' }}>
              {actividadesData.actividades.length}
            </p>
          </div>
        </div>
      </div>

      {/* Sección de Actividades */}
      <div style={{ 
        backgroundColor: colors.surface,
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden'
      }}>
        <button
          onClick={() => toggleSection('actividades')}
          style={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            backgroundColor: colors.background,
            border: 'none',
            cursor: 'pointer',
            borderBottom: sectionsExpanded.actividades ? `1px solid ${colors.border}` : 'none'
          }}
        >
          <h2 style={{ color: colors.text, margin: 0, fontSize: '1.1rem' }}>
            Actividades
          </h2>
          <ChevronDown 
            size={20} 
            style={{ 
              color: colors.textSecondary,
              transform: sectionsExpanded.actividades ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }} 
          />
        </button>

        {sectionsExpanded.actividades && (
          <div style={{ padding: '1.5rem' }}>
            <div className={styles.activityTable}>
              <div className={styles.activityHeader}>
                <span style={{ color: colors.text }}>¿Qué?</span>
                <span style={{ color: colors.text }}>¿Quién?</span>
                <span style={{ color: colors.text }}>¿Cómo?</span>
                <span style={{ color: colors.text }}>Sistema</span>
              </div>

              {actividadesData.actividades.map((actividad, index) => (
                <div 
                  key={actividad.id}
                  className={styles.activityRow}
                  style={{ backgroundColor: colors.background }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                      <span style={{ color: colors.text, fontWeight: '500' }}>
                        {actividad.que}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span style={{ color: colors.text }}>
                      {actividad.quien}
                    </span>
                  </div>
                  
                  <div>
                    <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                      {actividad.como}
                    </span>
                  </div>
                  
                  <div>
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      backgroundColor: actividad.sistema === 'SAP' ? '#dcfce7' : '#fff7ed',
                      color: actividad.sistema === 'SAP' ? '#16a34a' : '#ea580c',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {actividad.sistema}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sección de Configuración */}
      <div style={{ 
        backgroundColor: colors.surface,
        borderRadius: '0.5rem',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden'
      }}>
        <button
          onClick={() => toggleSection('configuracion')}
          style={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            backgroundColor: colors.background,
            border: 'none',
            cursor: 'pointer',
            borderBottom: sectionsExpanded.configuracion ? `1px solid ${colors.border}` : 'none'
          }}
        >
          <h2 style={{ color: colors.text, margin: 0, fontSize: '1.1rem' }}>
            Configuración Detallada
          </h2>
          <ChevronDown 
            size={20} 
            style={{ 
              color: colors.textSecondary,
              transform: sectionsExpanded.configuracion ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }} 
          />
        </button>

        {sectionsExpanded.configuracion && (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className={styles.formGroup}>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Descripción:</span>
                <p style={{ color: colors.text, margin: '0.5rem 0', lineHeight: '1.5' }}>
                  {configuracionData.descripcion}
                </p>
              </div>

              {configuracionData.organizacion && (
                <div className={styles.formGroup}>
                  <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Organización:</span>
                  <p style={{ color: colors.text, margin: '0.5rem 0', fontWeight: '500' }}>
                    {configuracionData.organizacion}
                  </p>
                </div>
              )}

              {configuracionData.procesoPadre && (
                <div className={styles.formGroup}>
                  <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Proceso Padre:</span>
                  <p style={{ color: colors.text, margin: '0.5rem 0', fontWeight: '500' }}>
                    {configuracionData.procesoPadre}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 