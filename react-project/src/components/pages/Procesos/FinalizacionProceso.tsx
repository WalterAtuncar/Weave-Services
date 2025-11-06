import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConfiguracionData } from './ConfiguracionCabecera';
import styles from './Procesos.module.css';

interface FinalizacionProcesoProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalizar: (nuevoEstado: string) => void;
  configuracionData: ConfiguracionData;
}

const ESTADOS_FINALES = [
  { valor: 'Activo', label: 'Activo', descripcion: 'El proceso está listo para usar en producción', color: '#10b981' },
  { valor: 'Por aplicar', label: 'Por aplicar', descripcion: 'El proceso está configurado pero pendiente de activación', color: '#f59e0b' },
  { valor: 'En proceso', label: 'En proceso', descripcion: 'El proceso requiere revisiones adicionales', color: '#6366f1' }
];

export const FinalizacionProceso: React.FC<FinalizacionProcesoProps> = ({
  isOpen,
  onClose,
  onFinalizar,
  configuracionData
}) => {
  const { colors } = useTheme();
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Por aplicar');
  const [isLoading, setIsLoading] = useState(false);

  const handleFinalizar = async () => {
    setIsLoading(true);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onFinalizar(estadoSeleccionado);
    setIsLoading(false);
  };

  const estadoActual = ESTADOS_FINALES.find(e => e.valor === estadoSeleccionado);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ backgroundColor: colors.surface }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ color: colors.text }}>
            <CheckCircle size={24} />
            3.- Al terminar, actualiza el estado
          </h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            style={{ color: colors.textSecondary }}
            disabled={isLoading}
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
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
              <h3 style={{ color: colors.text, margin: 0, fontSize: '1.25rem' }}>
                ¡Proceso configurado exitosamente!
              </h3>
              <p style={{ color: colors.textSecondary, margin: '0.5rem 0 0', fontSize: '0.875rem' }}>
                Tu proceso "{configuracionData.nombre}" ha sido creado y está listo para su activación.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              textAlign: 'center',
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: colors.surface,
              borderRadius: '0.375rem'
            }}>
              <div>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Código</span>
                <p style={{ color: colors.text, margin: '0.25rem 0', fontWeight: '600', fontSize: '1.1rem' }}>
                  {configuracionData.codigo}
                </p>
              </div>
              <div>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Categoría</span>
                <p style={{ color: colors.text, margin: '0.25rem 0', fontWeight: '600', fontSize: '1.1rem' }}>
                  {configuracionData.categoria}
                </p>
              </div>
              <div>
                <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>Criticidad</span>
                <p style={{ color: colors.text, margin: '0.25rem 0', fontWeight: '600', fontSize: '1.1rem' }}>
                  {configuracionData.criticidad}
                </p>
              </div>
            </div>
          </div>

          {/* Selección de estado final */}
          <div style={{ 
            marginBottom: '2rem'
          }}>
            <h4 style={{ color: colors.text, marginBottom: '1rem', fontSize: '1rem' }}>
              Selecciona el estado final del proceso:
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ESTADOS_FINALES.map((estado) => (
                <label 
                  key={estado.valor}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: estadoSeleccionado === estado.valor ? colors.background : colors.surface,
                    border: `2px solid ${estadoSeleccionado === estado.valor ? colors.primary : colors.border}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="estado"
                    value={estado.valor}
                    checked={estadoSeleccionado === estado.valor}
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                    style={{ marginRight: '1rem' }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem',
                        backgroundColor: estado.color + '20',
                        color: estado.color,
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        textTransform: 'uppercase'
                      }}>
                        {estado.label}
                      </span>
                    </div>
                    <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.875rem' }}>
                      {estado.descripcion}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Advertencia */}
          {estadoSeleccionado === 'Activo' && (
            <div style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={20} style={{ color: '#f59e0b', marginTop: '0.125rem' }} />
              <div>
                <h5 style={{ color: '#92400e', margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                  Activación inmediata
                </h5>
                <p style={{ color: '#92400e', margin: 0, fontSize: '0.875rem', lineHeight: '1.4' }}>
                  Al seleccionar "Activo", el proceso estará disponible inmediatamente para su uso en producción. 
                  Asegúrate de que toda la configuración sea correcta.
                </p>
              </div>
            </div>
          )}
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
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleFinalizar}
            className={`${styles.actionButton} ${styles.primaryButton}`}
            style={{ 
              backgroundColor: colors.primary,
              color: 'white',
              opacity: isLoading ? 0.7 : 1
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className={styles.loadingSpinner} style={{ width: '16px', height: '16px', margin: 0 }}></div>
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Finalizar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 