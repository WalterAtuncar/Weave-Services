import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Eye, EyeOff, Database, Layers, Shield, FileText, Send, Save, Info, Clock, Package } from 'lucide-react';
import { DominioDataFormData, DominioDataFormErrors, GobernanzaRef, FormMode, TipoDominioData } from '../types';
import styles from '../StepperDominioDataForm.module.css';
import sysStyles from '../../stepper-system-form/StepperSystemForm.module.css';
import { gobernanzaService } from '../../../../services';

interface Step4SummaryProps {
  formData: DominioDataFormData;
  errors: DominioDataFormErrors;
  onSubmit: (saveType: 'draft' | 'approval') => void;
  isSubmitting: boolean;
  validationResults: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    overall: boolean;
  };
  tiposDominio?: TipoDominioData[];
  gobernanzas?: GobernanzaRef[];
  // NUEVO: información para controlar habilitación de "Enviar a Aprobación"
  mode: FormMode;
  originalGovernanceId?: number;
}

interface SectionVisibility {
  basicInfo: boolean;
  subdomains: boolean;
  governance: boolean;
}

const Step4Summary: React.FC<Step4SummaryProps> = ({
  formData,
  errors,
  onSubmit,
  isSubmitting,
  validationResults,
  tiposDominio,
  gobernanzas,
  mode,
  originalGovernanceId
}) => {
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    basicInfo: true,
    subdomains: true,
    governance: true
  });

  // Función para determinar si se puede enviar a aprobación
  const canSendForApproval = (): boolean => {
    // Regla actualizada:
    // - Tanto en modo CREAR como EDITAR: se permite enviar a aprobación si el formulario es válido y hay gobernanza asignada
    if (!validationResults.overall) return false;
    return hasGovernanceAssigned();
  };

  // Cache local para nombres de gobernanza obtenidos vía servicio cuando no llegan en props
  const [gobernanzaNames, setGobernanzaNames] = useState<Record<number, string>>({});

  // Prefetch: obtener nombres de gobernanza para el dominio y subdominios cuando no están en la lista provista
  useEffect(() => {
    const ids = new Set<number>();
    const addId = (v: any) => {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) ids.add(n);
    };

    addId((formData as any)?.gobernanzaId);
    (formData?.subDominios || []).forEach((sd: any) => addId(sd?.gobernanzaId));

    if (ids.size === 0) return;

    const knownInProps = (id: number) => {
      if (!Array.isArray(gobernanzas)) return false;
      return !!gobernanzas.find(g => (g as any).gobernanzaId === id || (g as any).GobernanzaId === id || (g as any).id === id);
    };

    const toFetch = Array.from(ids).filter(id => !gobernanzaNames[id] && !knownInProps(id));
    if (toFetch.length === 0) return;

    let canceled = false;
    (async () => {
      try {
        const results = await Promise.all(
          toFetch.map(async (id) => {
            try {
              const resp = await gobernanzaService.getGobernanzaById(id);
              if (resp?.success && resp.data) {
                const nombre = (resp.data as any).nombre || (resp.data as any).Nombre || (resp.data as any).gobernanzaNombre || `Gobernanza ${id}`;
                return { id, nombre };
              }
            } catch {}
            return { id, nombre: `Gobernanza ${id}` };
          })
        );
        if (canceled) return;
        setGobernanzaNames(prev => {
          const next = { ...prev };
          results.forEach(r => { next[r.id] = r.nombre; });
          return next;
        });
      } catch {}
    })();

    return () => { canceled = true; };
  }, [formData?.gobernanzaId, JSON.stringify(formData?.subDominios || []), Array.isArray(gobernanzas) ? gobernanzas.length : 0]);

  // Función para resolver nombres de referencia
  const resolveTipoDominioName = (id: number | undefined): string => {
    if (!id || !Array.isArray(tiposDominio) || tiposDominio.length === 0) return 'No especificado';
    const tipo = tiposDominio.find(t => t.tipoDominioId === id);
    return tipo ? (tipo as any).nombre || (tipo as any).tipoDominioNombre || 'No encontrado' : 'No encontrado';
  };

  const resolveGobernanzaName = (id: number | undefined): string => {
    if (!id) return 'No especificado';

    if (Array.isArray(gobernanzas)) {
      const gobernanza = gobernanzas.find(g =>
        (g as any).gobernanzaId === id ||
        (g as any).GobernanzaId === id ||
        (g as any).id === id
      );
      if (gobernanza) {
        const nombre = (gobernanza as any).nombre ||
                       (gobernanza as any).Nombre ||
                       (gobernanza as any).gobernanzaNombre ||
                       (gobernanza as any).name;
        if (nombre) return nombre;
      }
    }

    // Si no está en props, intentar en cache (obtenido desde el servicio)
    if (gobernanzaNames[id]) return gobernanzaNames[id];

    // Fallback
    return `Gobernanza ${id}`;
  };

  // Función para alternar visibilidad de secciones
  const toggleSection = (section: keyof SectionVisibility) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Función para manejar envío
  const handleSubmit = (saveType: 'draft' | 'approval') => {
    if (isSubmitting) return;
    onSubmit(saveType);
  };

  // Función para verificar si tiene gobernanza asignada
  const hasGovernanceAssigned = (): boolean => {
    const raw = (formData as any)?.gobernanzaId || formData.governance?.gobernanzaId;
    const parsed = raw !== undefined && raw !== null ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0;
  };

  return (
    <div className={styles.stepContainer}>
      <div className={sysStyles.stepHeader}>
        <div className={sysStyles.stepIcon}>
          <FileText size={24} />
        </div>
        <div>
          <h2 className={sysStyles.stepTitle}>Resumen Final</h2>
          <p className={sysStyles.stepDescription}>Revisa la información antes de guardar</p>
        </div>
      </div>

      <div className={styles.stepContent}>
        {/* Estado de Validación */}
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          borderRadius: '8px',
          backgroundColor: validationResults.overall ? '#f0f9ff' : '#fef2f2',
          border: `1px solid ${validationResults.overall ? '#0ea5e9' : '#ef4444'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {validationResults.overall ? (
              <CheckCircle size={20} color="#0ea5e9" />
            ) : (
              <AlertTriangle size={20} color="#ef4444" />
            )}
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 600,
              color: validationResults.overall ? '#0ea5e9' : '#ef4444'
            }}>
              {validationResults.overall ? 'Formulario Válido' : 'Formulario Incompleto'}
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {validationResults.step1 ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <AlertTriangle size={16} color="#ef4444" />
              )}
              <span style={{ fontSize: '14px', color: '#374151' }}>Información Básica</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {validationResults.step2 ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <AlertTriangle size={16} color="#ef4444" />
              )}
              <span style={{ fontSize: '14px', color: '#374151' }}>Subdominios</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {validationResults.step3 ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <AlertTriangle size={16} color="#ef4444" />
              )}
              <span style={{ fontSize: '14px', color: '#374151' }}>Gobernanza</span>
            </div>
          </div>
        </div>

        {/* Sección: Información Básica */}
        <div style={{ marginBottom: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              borderBottom: sectionVisibility.basicInfo ? '1px solid #e5e7eb' : 'none'
            }}
            onClick={() => toggleSection('basicInfo')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={20} color="#6b7280" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                Información Básica
              </h3>
            </div>
            {sectionVisibility.basicInfo ? (
              <EyeOff size={16} color="#6b7280" />
            ) : (
              <Eye size={16} color="#6b7280" />
            )}
          </div>
          
          {sectionVisibility.basicInfo && (
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Nombre del Dominio
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151' }}>
                    {formData.nombreDominio || formData.basicInfo?.nombreDominio || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Código
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151' }}>
                    {formData.codigoDominio || formData.basicInfo?.codigoDominio || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tipo de Dominio
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151' }}>
                    {resolveTipoDominioName(formData.tipoDominioId || formData.basicInfo?.tipoDominioId)}
                  </p>
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Descripción
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                    {formData.descripcionDominio || formData.basicInfo?.descripcionDominio || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección: Subdominios */}
        <div style={{ marginBottom: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              borderBottom: sectionVisibility.subdomains ? '1px solid #e5e7eb' : 'none'
            }}
            onClick={() => toggleSection('subdomains')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Layers size={20} color="#6b7280" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                Subdominios ({(formData.subdominios || formData.subDominios?.subDominios)?.length || 0})
              </h3>
            </div>
            {sectionVisibility.subdomains ? (
              <EyeOff size={16} color="#6b7280" />
            ) : (
              <Eye size={16} color="#6b7280" />
            )}
          </div>
          
          {sectionVisibility.subdomains && (
            <div style={{ padding: '16px' }}>
              {(formData.subdominios || formData.subDominios?.subDominios) && (formData.subdominios || formData.subDominios?.subDominios).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(formData.subdominios || formData.subDominios?.subDominios).map((subdominio, index) => (
                    <div key={index} style={{ 
                      padding: '12px', 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                            Nombre
                          </label>
                          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#374151' }}>
                            {subdominio.nombreSubDominio}
                          </p>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                            Código
                          </label>
                          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#374151' }}>
                            {subdominio.codigoSubDominio}
                          </p>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                            Descripción
                          </label>
                          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#374151' }}>
                            {subdominio.descripcionSubDominio}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                  No se han agregado subdominios
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sección: Gobernanza */}
        <div style={{ marginBottom: '32px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              borderBottom: sectionVisibility.governance ? '1px solid #e5e7eb' : 'none'
            }}
            onClick={() => toggleSection('governance')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={20} color="#6b7280" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                Gobernanza
              </h3>
            </div>
            {sectionVisibility.governance ? (
              <EyeOff size={16} color="#6b7280" />
            ) : (
              <Eye size={16} color="#6b7280" />
            )}
          </div>
          
          {sectionVisibility.governance && (
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Gobernanza
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151' }}>
                    {hasGovernanceAssigned() ? resolveGobernanzaName((formData as any).gobernanzaId || formData.governance?.gobernanzaId) : 'Sin gobernanza asignada'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advertencia si no tiene gobernanza */}
        {!hasGovernanceAssigned() && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#fef3cd',
            border: '1px solid #f59e0b',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} color="#f59e0b" />
              <span style={{ fontSize: '14px', color: '#92400e', fontWeight: 500 }}>
                Sin gobernanza asignada solo se puede guardar como borrador
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Opción: Guardar como Borrador */}
          <div
            style={{
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              cursor: validationResults.overall ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              background: validationResults.overall ? 'white' : '#f9fafb',
              opacity: validationResults.overall ? 1 : 0.6
            }}
            onClick={() => validationResults.overall && handleSubmit('draft')}
            onMouseEnter={(e) => {
              if (validationResults.overall) {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (validationResults.overall) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }
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
                backgroundColor: '#f3f4f6',
                transition: 'background-color 0.2s ease'
              }}>
                <Save size={20} color="#6b7280" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: validationResults.overall ? '#374151' : '#9ca3af' }}>
                  Guardar como Borrador
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: validationResults.overall ? '#6b7280' : '#9ca3af' }}>
                  {validationResults.overall ? 'Guardar sin iniciar proceso de aprobación' : 'Requiere completar formulario'}
                </p>
              </div>
            </div>
            
            <div style={{ paddingLeft: '56px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <Clock size={14} color="#6b7280" />
                  <span>Estado: Borrador</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <Info size={14} color="#6b7280" />
                  <span>Solo visible para el creador</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <FileText size={14} color="#6b7280" />
                  <span>Se puede editar libremente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Opción: Enviar a Aprobación */}
          <div
            style={{
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              cursor: (validationResults.overall && canSendForApproval()) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              background: (validationResults.overall && canSendForApproval()) ? 'white' : '#f9fafb',
              opacity: (validationResults.overall && canSendForApproval()) ? 1 : 0.6
            }}
            onClick={() => (validationResults.overall && canSendForApproval()) && handleSubmit('approval')}
            onMouseEnter={(e) => {
              if (validationResults.overall && canSendForApproval()) {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (validationResults.overall && canSendForApproval()) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }
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
                backgroundColor: '#f3f4f6',
                transition: 'background-color 0.2s ease'
              }}>
                <Send size={20} color="#6b7280" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: hasGovernanceAssigned() ? '#374151' : '#9ca3af' }}>
                  Enviar a Aprobación
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: (validationResults.overall && canSendForApproval()) ? '#6b7280' : '#9ca3af' }}>
                  {!validationResults.overall ? 'Requiere completar formulario' : !canSendForApproval() ? 'Requiere gobernanza asignada' : 'Iniciar proceso de aprobación'}
                </p>
              </div>
            </div>
            
            <div style={{ paddingLeft: '56px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <Send size={14} color="#f59e0b" />
                  <span>Notifica a Owner y Sponsor</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <Clock size={14} color="#f59e0b" />
                  <span>Inicia proceso de aprobación</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                  <AlertTriangle size={14} color="#f59e0b" />
                  <span>No se puede editar hasta aprobación</span>
                </div>
              </div>
            </div>
          </div>
          {/* Mensaje informativo cuando no se puede enviar a aprobación */}
          {!canSendForApproval() && validationResults.overall && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              marginTop: '16px',
              fontSize: '14px',
              color: '#92400e'
            }}>
              <Info size={16} />
              <span>
                Este dominio de datos no tiene una gobernanza asignada. Para enviar a aprobación, debe asignar una gobernanza en el paso correspondiente.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Summary;