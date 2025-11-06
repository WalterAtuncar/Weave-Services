import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Eye, EyeOff, Shield, FileText, Send, Save, Info, Clock, Database } from 'lucide-react';
import { SubDominioFormData, SubDominioFormErrors, FormMode, GobernanzaRef } from '../types';
import styles from '../../stepper-dominio-data-form/StepperDominioDataForm.module.css';
import sysStyles from '../../stepper-system-form/StepperSystemForm.module.css';

interface Step4SummaryProps {
  formData: SubDominioFormData;
  errors: SubDominioFormErrors;
  onSubmit: (saveType: 'draft' | 'approval') => void;
  isSubmitting: boolean;
  validationResults: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    overall: boolean;
  };
  // Datos de referencia para resolver nombres
  gobernanzas?: GobernanzaRef[];
  // Información para controlar habilitación de "Enviar a Aprobación"
  mode: FormMode;
  originalGovernanceId?: number;
}

interface SectionVisibility {
  basicInfo: boolean;
  governance: boolean;
}

const Step4Summary: React.FC<Step4SummaryProps> = ({
  formData,
  errors,
  onSubmit,
  isSubmitting,
  validationResults,
  gobernanzas,
  mode,
  originalGovernanceId
}) => {
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    basicInfo: true,
    governance: true
  });

  const resolveGobernanzaNombre = (id?: number | string) => {
    const parsed = id !== undefined && id !== null ? Number(id) : NaN;
    if (!parsed || Number.isNaN(parsed)) return 'No especificada';
    const item = gobernanzas?.find(g => g.id === parsed);
    return item?.nombre || `Gobernanza ${id}`;
  };

  const toggleSection = (section: keyof SectionVisibility) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper para verificar si el subdominio tiene gobernanza asignada
  const hasGovernanceAssigned = () => {
    const anyData = formData as any;
    const raw = anyData?.gobernanzaId ?? anyData?.gobernanzaRef?.id;
    const parsed = raw !== undefined && raw !== null ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0;
  };

  // ¿Se permite enviar a aprobación según reglas de negocio?
  const canSendForApproval = (): boolean => {
    if (!validationResults.overall) return false;

    if (mode === FormMode.CREATE) {
      return hasGovernanceAssigned();
    }
    if (mode === FormMode.EDIT) {
      return (originalGovernanceId !== undefined && originalGovernanceId > 0) || hasGovernanceAssigned();
    }
    return false;
  };

  const handleSubmit = (saveType: 'draft' | 'approval') => {
    if (isSubmitting) return;
    if (saveType === 'approval' && !canSendForApproval()) return;
    if (saveType === 'draft' && !validationResults.overall) return;
    onSubmit(saveType);
  };

  return (
    <div className={styles.stepContainer}>
      {/* Header del Step (replicado del Dominio) */}
      <div className={sysStyles.stepHeader}>
        <div className={sysStyles.stepIcon}>
          <FileText size={24} />
        </div>
        <div>
          <h2 className={sysStyles.stepTitle}>Resumen y Confirmación</h2>
          <p className={sysStyles.stepDescription}>Revisa toda la información antes de guardar el subdominio</p>
        </div>
      </div>

      <div className={styles.stepContent}>
        {/* Estado de Validación (banner con colores como Dominio) */}
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
              <span style={{ fontSize: '14px', color: '#374151' }}>Paso 1: Lista de Subdominios</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {validationResults.step2 ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <AlertTriangle size={16} color="#ef4444" />
              )}
              <span style={{ fontSize: '14px', color: '#374151' }}>Paso 2: Información del Subdominio</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {validationResults.step3 ? (
                <CheckCircle size={16} color="#10b981" />
              ) : (
                <AlertTriangle size={16} color="#ef4444" />
              )}
              <span style={{ fontSize: '14px', color: '#374151' }}>Paso 3: Gobernanza</span>
            </div>
          </div>
        </div>

        {/* Sección: Información del Subdominio (card colapsable como Dominio) */}
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
                Información del Subdominio
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
                    Nombre del Subdominio
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151' }}>
                    {formData.nombreSubDominio || 'No especificado'}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Código del Subdominio
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151' }}>
                    {formData.codigoSubDominio || 'No especificado'}
                  </p>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Descripción
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                    {formData.descripcionSubDominio || 'No especificado'}
                  </p>
                </div>
              </div>
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
                    {hasGovernanceAssigned() ? resolveGobernanzaNombre(((formData as any)?.gobernanzaId ?? (formData as any)?.gobernanzaRef?.id)) : 'Sin gobernanza asignada'}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tiene Gobernanza Propia
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#374151' }}>
                    {formData.tieneGobernanzaPropia ? 'Sí' : 'No (hereda de la organización)'}
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

        {/* Opciones de guardado: replicar layout vertical del Dominio */}
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
                (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (validationResults.overall) {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
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
                (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (validationResults.overall && canSendForApproval()) {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
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
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: (validationResults.overall && canSendForApproval()) ? '#374151' : '#9ca3af' }}>
                  Enviar a Aprobación
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: (validationResults.overall && canSendForApproval()) ? '#6b7280' : '#9ca3af' }}>
                  {!validationResults.overall
                    ? 'Requiere completar formulario'
                    : !canSendForApproval()
                      ? 'Requiere gobernanza asignada'
                      : 'Iniciar proceso de aprobación'}
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
                Este subdominio no tiene una gobernanza asignada. Solo se puede guardar como borrador o editar después de asignar una gobernanza.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Summary;