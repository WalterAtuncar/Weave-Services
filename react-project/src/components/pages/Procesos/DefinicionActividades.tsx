import React, { useState } from 'react';
import { X, Plus, List, Trash2, User, Settings } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './Procesos.module.css';

interface DefinicionActividadesProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: ActividadesData) => void;
  initialData?: ActividadesData;
}

export interface Actividad {
  id: string;
  que: string;
  quien: string;
  como: string;
  sistema: string;
}

export interface ActividadesData {
  actividades: Actividad[];
}

const RESPONSABLES = [
  'Mesa de Partes',
  'Analista de Compras',
  'Jefe de Compras',
  'Contador',
  'Tesorero',
  'Gerente General'
];

const SISTEMAS = [
  'SAP',
  'ERP ORACLE',
  'Manual',
  'Excel',
  'Sistema Propio'
];

export const DefinicionActividades: React.FC<DefinicionActividadesProps> = ({
  isOpen,
  onClose,
  onContinue,
  initialData
}) => {
  const { colors } = useTheme();
  const [actividadesData, setActividadesData] = useState<ActividadesData>(initialData || {
    actividades: [
      {
        id: '1',
        que: 'Recepción Factura',
        quien: 'Mesa de Partes',
        como: 'Recibir y registrar la factura en el sistema',
        sistema: 'SAP'
      },
      {
        id: '2',
        que: 'Registro Factura',
        quien: 'Mesa de Partes',
        como: 'Validar datos y registrar en el sistema contable',
        sistema: 'SAP'
      },
      {
        id: '3',
        que: 'Análisis de gasto',
        quien: 'Analista de Compras',
        como: 'Verificar presupuesto y autorización de gasto',
        sistema: 'SAP'
      }
    ]
  });

  const [errors, setErrors] = useState<{ [key: string]: Partial<Actividad> }>({});

  const handleActividadChange = (id: string, field: keyof Actividad, value: string) => {
    setActividadesData(prev => ({
      actividades: prev.actividades.map(actividad =>
        actividad.id === id ? { ...actividad, [field]: value } : actividad
      )
    }));

    if (errors[id]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined }
      }));
    }
  };

  const agregarActividad = () => {
    const newId = (actividadesData.actividades.length + 1).toString();
    const newActividad: Actividad = {
      id: newId,
      que: `Actividad ${newId}`,
      quien: RESPONSABLES[0],
      como: '',
      sistema: SISTEMAS[0]
    };

    setActividadesData(prev => ({
      actividades: [...prev.actividades, newActividad]
    }));
  };

  const eliminarActividad = (id: string) => {
    if (actividadesData.actividades.length <= 1) return;
    
    setActividadesData(prev => ({
      actividades: prev.actividades.filter(actividad => actividad.id !== id)
    }));
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: Partial<Actividad> } = {};

    actividadesData.actividades.forEach(actividad => {
      const actividadErrors: Partial<Actividad> = {};

      if (!actividad.que.trim()) {
        actividadErrors.que = 'El nombre de la actividad es requerido';
      }

      if (!actividad.como.trim()) {
        actividadErrors.como = 'La descripción del procedimiento es requerida';
      }

      if (Object.keys(actividadErrors).length > 0) {
        newErrors[actividad.id] = actividadErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onContinue(actividadesData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ backgroundColor: colors.surface, maxWidth: '1000px' }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ color: colors.text }}>
            <List size={24} />
            2.- Ingresa las actividades
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
          <div className={styles.activityTable}>
            <div className={styles.activityHeader}>
              <span style={{ color: colors.text }}>¿Qué?</span>
              <span style={{ color: colors.text }}>¿Quién?</span>
              <span style={{ color: colors.text }}>¿Cómo?</span>
              <span style={{ color: colors.text }}>Sistema</span>
              <span style={{ color: colors.text }}>Acciones</span>
            </div>

            {actividadesData.actividades.map((actividad, index) => (
              <div 
                key={actividad.id} 
                className={styles.activityRow}
                style={{ 
                  gridTemplateColumns: '2fr 1fr 2fr 1fr auto',
                  backgroundColor: colors.background 
                }}
              >
                {/* ¿Qué? */}
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    value={actividad.que}
                    onChange={(e) => handleActividadChange(actividad.id, 'que', e.target.value)}
                    className={styles.formInput}
                    style={{ 
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: errors[actividad.id]?.que ? '#ef4444' : colors.border,
                      fontSize: '0.875rem'
                    }}
                    placeholder="Nombre de la actividad"
                  />
                  {errors[actividad.id]?.que && (
                    <span className={styles.formError}>{errors[actividad.id].que}</span>
                  )}
                </div>

                {/* ¿Quién? */}
                <div className={styles.formGroup}>
                  <select
                    value={actividad.quien}
                    onChange={(e) => handleActividadChange(actividad.id, 'quien', e.target.value)}
                    className={styles.formSelect}
                    style={{ 
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                      fontSize: '0.875rem'
                    }}
                  >
                    {RESPONSABLES.map(responsable => (
                      <option key={responsable} value={responsable}>{responsable}</option>
                    ))}
                  </select>
                </div>

                {/* ¿Cómo? */}
                <div className={styles.formGroup}>
                  <textarea
                    value={actividad.como}
                    onChange={(e) => handleActividadChange(actividad.id, 'como', e.target.value)}
                    className={styles.formTextarea}
                    style={{ 
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: errors[actividad.id]?.como ? '#ef4444' : colors.border,
                      fontSize: '0.875rem',
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                    placeholder="Descripción del procedimiento"
                    rows={2}
                  />
                  {errors[actividad.id]?.como && (
                    <span className={styles.formError}>{errors[actividad.id].como}</span>
                  )}
                </div>

                {/* Sistema */}
                <div className={styles.formGroup}>
                  <select
                    value={actividad.sistema}
                    onChange={(e) => handleActividadChange(actividad.id, 'sistema', e.target.value)}
                    className={styles.formSelect}
                    style={{ 
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                      fontSize: '0.875rem'
                    }}
                  >
                    {SISTEMAS.map(sistema => (
                      <option key={sistema} value={sistema}>{sistema}</option>
                    ))}
                  </select>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', paddingTop: '0.25rem' }}>
                  <button
                    onClick={() => eliminarActividad(actividad.id)}
                    disabled={actividadesData.actividades.length <= 1}
                    className={styles.toolbarButton}
                    style={{ 
                      color: actividadesData.actividades.length <= 1 ? colors.textSecondary : '#ef4444',
                      cursor: actividadesData.actividades.length <= 1 ? 'not-allowed' : 'pointer',
                      opacity: actividadesData.actividades.length <= 1 ? 0.5 : 1
                    }}
                    title="Eliminar actividad"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={agregarActividad}
            className={styles.addActivityButton}
            style={{ 
              color: colors.primary,
              borderColor: colors.border,
              marginTop: '1rem'
            }}
          >
            <Plus size={16} />
            Agregar actividad
          </button>

          {/* Estadísticas */}
          <div style={{ 
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: colors.background,
            borderRadius: '0.5rem',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ color: colors.text, margin: '0 0 1rem 0', fontSize: '1rem' }}>
              Resumen de Actividades
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <List size={16} style={{ color: colors.primary }} />
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                  Total de actividades:
                </span>
                <span style={{ color: colors.text, fontWeight: '600' }}>
                  {actividadesData.actividades.length}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} style={{ color: colors.primary }} />
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                  Responsables únicos:
                </span>
                <span style={{ color: colors.text, fontWeight: '600' }}>
                  {new Set(actividadesData.actividades.map(a => a.quien)).size}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={16} style={{ color: colors.primary }} />
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                  Sistemas utilizados:
                </span>
                <span style={{ color: colors.text, fontWeight: '600' }}>
                  {new Set(actividadesData.actividades.map(a => a.sistema)).size}
                </span>
              </div>
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
            onClick={handleContinue}
            className={`${styles.actionButton} ${styles.primaryButton}`}
            style={{ 
              backgroundColor: colors.primary,
              color: 'white'
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}; 