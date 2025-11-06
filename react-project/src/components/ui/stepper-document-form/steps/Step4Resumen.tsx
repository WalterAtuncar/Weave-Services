import React, { useEffect, useState } from 'react';
import { CheckCircle, Save, Send, Info, AlertTriangle, Clock, EyeOff } from 'lucide-react';
import styles from '../../stepper-system-form/StepperSystemForm.module.css';
import { DocumentFormData, DocumentFormErrors, TipoDocumento, Proceso, CarpetaRef } from '../types';
import { gobernanzaService } from '../../../../services/gobernanza.service';
import { useTiposEntidad } from '../../../../hooks/useTiposEntidad';
import { useEntidadesPorTipo } from '../../../../hooks/useEntidadesPorTipo';

interface Props {
  formData: DocumentFormData;
  errors: DocumentFormErrors;
  onDataChange: (data: Partial<DocumentFormData>) => void;
  onErrorChange: (errors: Partial<DocumentFormErrors>) => void;
  onSubmit: (saveType: 'draft' | 'approval') => Promise<void> | void;
  isSubmitting?: boolean;
  validationResults: any;
  tiposDocumento: TipoDocumento[];
  procesos: Proceso[];
  carpetas?: CarpetaRef[];
  mode: 'create' | 'edit';
}

const Step4Resumen: React.FC<Props> = ({ formData, onSubmit, isSubmitting, tiposDocumento, procesos, carpetas, validationResults, mode }) => {
  const [gobernanzaNombre, setGobernanzaNombre] = useState<string>('-');
  const { tiposEntidad } = useTiposEntidad();

  const tipoNombre = tiposDocumento.find(t => t.id === formData.tipo)?.nombre || '-';
  // Se descarta la sección de Proceso en el resumen final

  useEffect(() => {
    const loadGobernanzaNombre = async () => {
      try {
        if (formData.gobernanzaId) {
          const response = await gobernanzaService.getGobernanzaById(Number(formData.gobernanzaId));
          const nombre = response?.data?.nombre || response?.data?.codigo || `ID ${formData.gobernanzaId}`;
          setGobernanzaNombre(nombre || '-');
        } else {
          setGobernanzaNombre('-');
        }
      } catch {
        setGobernanzaNombre(formData.gobernanzaId ? `ID ${formData.gobernanzaId}` : '-');
      }
    };
    loadGobernanzaNombre();
  }, [formData.gobernanzaId]);

  const carpetaNombre = (() => {
    if (formData.carpetaRuta) return formData.carpetaRuta;
    const c = carpetas?.find(c => String(c.carpetaId) === String(formData.carpetaId));
    return c?.nombreCarpeta || '-';
  })();

  const AssignedEntitiesSummary: React.FC<{ tipoId: string | number; entityIds: (string | number)[]; tipoNombre?: string }> = ({ tipoId, entityIds, tipoNombre }) => {
    const { entidades } = useEntidadesPorTipo(tipoId);
    const displayNames = React.useMemo(() => {
      const idsSet = new Set((entityIds || []).map(id => String(id)));
      const matched = (entidades || []).filter(e => idsSet.has(String(e.id)));
      const names = matched.map(e => e.nombre || String(e.id));
      return names;
    }, [entidades, entityIds]);

    return (
      <div>
        <div className="text-sm text-gray-600 mb-1">{tipoNombre || `Tipo ${tipoId}`}</div>
        <div>{displayNames.length ? displayNames.join(', ') : '-'}</div>
      </div>
    );
  };

  const renderEntidadesAsignadas = () => {
    const entidades = formData.entidadesRelacionadas || {};
    const tipoIds = Object.keys(entidades);
    if (tipoIds.length === 0) return <div>-</div>;

    return (
      <div className="grid grid-cols-1 gap-2">
        {tipoIds.map(tipoId => {
          const ids = (entidades as any)[Number(tipoId)] || (entidades as any)[tipoId] || [];
          const tipo = tiposEntidad?.find(t => String(t.id) === String(tipoId));
          const tipoNombre = tipo?.nombre || undefined;
          return (
            <AssignedEntitiesSummary
              key={tipoId}
              tipoId={tipoId}
              entityIds={ids}
              tipoNombre={tipoNombre}
            />
          );
        })}
      </div>
    );
  };

  const renderThumbnail = () => {
    if (formData.miniaturaBase64 && formData.miniaturaMimeType) {
      const src = `data:${formData.miniaturaMimeType};base64,${formData.miniaturaBase64}`;
      const width = formData.miniaturaAncho || 180;
      const height = formData.miniaturaAlto || undefined;
      return (
        <img 
          src={src}
          alt={formData.titulo || 'Miniatura del documento'}
          style={{
            width,
            height,
            objectFit: 'cover',
            border: '1px solid #e5e7eb',
            borderRadius: 6
          }}
        />
      );
    }
    return <div className="text-gray-500">Miniatura no generada</div>;
  };

  const hasGovernanceAssigned = () => {
    return !!(formData.gobernanzaId !== null && formData.gobernanzaId !== undefined && formData.gobernanzaId !== '');
  };

  const canSendForApproval = (): boolean => {
    if (!validationResults?.overall) return false;
    // Reglas similares a sistemas: exigir gobernanza asignada
    return hasGovernanceAssigned();
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepContainer}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}><CheckCircle size={20} /></div>
          <div>
            <h3 className={styles.stepTitle}>Resumen</h3>
            <p className={styles.stepDescription}>Verifica la información antes de finalizar</p>
          </div>
        </div>

        {/* Estado de Validación General */}
        <div className={`${styles.formSection} ${validationResults?.overall ? '' : 'border-red-500'}`}>
          <div className={styles.sectionHeader}>
            {validationResults?.overall ? (
              <CheckCircle size={16} style={{ color: '#10b981' }} />
            ) : (
              <span style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444', display: 'inline-block' }} />
            )}
            <div>
              <h3 className={styles.sectionTitle}>
                Estado de Validación: {validationResults?.overall ? 'Completo' : 'Incompleto'}
              </h3>
              <p className={styles.sectionDescription}>
                {validationResults?.overall
                  ? 'Todos los campos requeridos están completos. El documento está listo.'
                  : 'Hay campos requeridos incompletos. Revisa los pasos anteriores.'}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={`${styles.formGrid} ${styles.threeColumns}`}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Título</label>
              <div>{formData.titulo || '-'}</div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Tipo</label>
              <div>{tipoNombre}</div>
            </div>
            {/* Sección Proceso removida según solicitud */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Objetivo</label>
              <div>{formData.objetivo || '-'}</div>
            </div>
          </div>
        </div>

        <div
          className="items-start"
          style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 12 }}
        >
          <div className={styles.formSection}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Gobierno</label>
                <div>{gobernanzaNombre}</div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Carpeta</label>
                <div>{carpetaNombre}</div>
              </div>
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel}>Entidades asignadas</label>
                {renderEntidadesAsignadas()}
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Miniatura</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                  {renderThumbnail()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ¿Cómo desea proceder? */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <Info size={16} />
            <div>
              <h3 className={styles.sectionTitle}>¿Cómo desea proceder?</h3>
              <p className={styles.sectionDescription}>
                Seleccione si desea guardar como borrador o iniciar el proceso de aprobación.
              </p>
            </div>
          </div>

          {/* Advertencia cuando no se puede enviar a aprobación */}
          {!canSendForApproval() && validationResults?.overall && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              marginTop: '8px',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#92400e'
            }}>
              <AlertTriangle size={16} />
              <span>
                Este documento no tiene una gobernanza asignada. Solo se puede guardar como borrador.
              </span>
            </div>
          )}

          <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Guardar como Borrador */}
            <div
              style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                cursor: !!isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                background: 'white'
              }}
              onClick={() => !isSubmitting && onSubmit('draft')}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6'
                }}>
                  <Save size={20} color="#6b7280" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                    Guardar como Borrador
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    Guardar sin iniciar proceso de aprobación
                  </p>
                </div>
              </div>
              <div style={{ paddingLeft: '56px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <Info size={14} color="#6b7280" />
                    <span>Estado: Borrador</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <EyeOff size={14} color="#6b7280" />
                    <span>Solo visible para el creador</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <Info size={14} color="#6b7280" />
                    <span>Se puede editar libremente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enviar a Aprobación */}
            <div
              style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                cursor: canSendForApproval() && !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                background: canSendForApproval() ? 'white' : '#f9fafb',
                opacity: canSendForApproval() ? 1 : 0.6
              }}
              onClick={() => canSendForApproval() && !isSubmitting && onSubmit('approval')}
              onMouseEnter={(e) => {
                if (canSendForApproval() && !isSubmitting) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6'
                }}>
                  <Send size={20} color="#6b7280" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: canSendForApproval() ? '#374151' : '#9ca3af' }}>
                    Enviar a Aprobación
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: canSendForApproval() ? '#6b7280' : '#9ca3af' }}>
                    {canSendForApproval() ? 'Iniciar proceso de aprobación' : 'Disponible cuando el documento tiene gobernanza asignada'}
                  </p>
                </div>
              </div>
              <div style={{ paddingLeft: '56px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <Info size={14} color="#6b7280" />
                    <span>Se notifica a Owner y Sponsor</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <Clock size={14} color="#6b7280" />
                    <span>Inicia proceso de aprobación</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <AlertTriangle size={14} color="#6b7280" />
                    <span>No se puede editar hasta aprobación</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Resumen;