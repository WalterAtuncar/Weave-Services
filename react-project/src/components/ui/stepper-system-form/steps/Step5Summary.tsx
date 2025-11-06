import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Eye, EyeOff, Building2, Network, Shield, FileText, Send, Save, Info, Clock, Package } from 'lucide-react';
import { SystemFormData, SystemFormErrors, TipoSistema, FamiliaSistema, Sistema, Servidor, GobernanzaRef, FormMode } from '../types';
import styles from '../StepperSystemForm.module.css';
import { getEstadoSistemaLabel, EstadoSistema } from '../../../../models/Sistemas';

interface Step5SummaryProps {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onSubmit: (saveType: 'draft' | 'approval') => void;
  isSubmitting: boolean;
  validationResults: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
    overall: boolean;
  };
  // Datos de referencia para resolver nombres
  tiposSistema?: TipoSistema[];
  familiasSistema?: FamiliaSistema[];
  sistemas?: Sistema[];
  servidores?: Servidor[];
  gobernanzas?: GobernanzaRef[];
  // NUEVO: información para controlar habilitación de "Enviar a Aprobación"
  mode: FormMode;
  originalGovernanceId?: number;
}

interface SectionVisibility {
  basicInfo: boolean;
  hierarchy: boolean;
  modules: boolean;
  governance: boolean;
}

const Step5Summary: React.FC<Step5SummaryProps> = ({
  formData,
  errors,
  onSubmit,
  isSubmitting,
  validationResults,
  tiposSistema,
  familiasSistema,
  sistemas,
  servidores,
  gobernanzas,
  mode,
  originalGovernanceId
}) => {
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    basicInfo: true,
    hierarchy: true,
    modules: true,
    governance: true
  });

  const resolveTipoNombre = (id?: number) => {
    if (!id) return 'No especificado';
    const item = tiposSistema?.find(t => t.id === id);
    return item?.nombre || `ID ${id}`;
  };

  const resolveFamiliaNombre = (id?: number) => {
    if (!id) return 'No especificado';
    const item = familiasSistema?.find(f => f.id === id);
    return item?.nombre || `ID ${id}`;
  };

  const resolveSistemaNombre = (id?: number) => {
    if (!id) return 'Sistema raíz (sin padre)';
    const item = sistemas?.find(s => s.id === id);
    return item?.nombre || `ID ${id}`;
  };

  const resolveServidorNombre = (id: number) => {
    const item = servidores?.find(s => s.id === id);
    return item?.nombre || `ID ${id}`;
  };

  const resolveGobernanzaNombre = (id?: number | string) => {
    const parsed = id !== undefined && id !== null ? Number(id) : NaN;
    if (!parsed || Number.isNaN(parsed)) return 'No asignada';
    const item = gobernanzas?.find(g => g.id === parsed);
    return item?.nombre || `ID ${id}`;
  };

  const toggleSection = (section: keyof SectionVisibility) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper para verificar si el sistema tiene gobernanza asignada (estado ACTUAL del formulario)
  const hasGovernanceAssigned = () => {
    return formData.gobernanzaId && formData.gobernanzaId !== null && formData.gobernanzaId !== '';
  };

  // NUEVO: ¿Se permite enviar a aprobación según reglas de negocio solicitadas?
  const canSendForApproval = (): boolean => {
    // Primero verificar que el formulario esté completo
    if (!validationResults.overall) {
      return false;
    }

    // En modo creación: permitir si hay gobernanza asignada
    if (mode === 'create') {
      return hasGovernanceAssigned();
    }

    // En modo edición: permitir si el sistema original tenía gobernanza O si ahora tiene gobernanza
    if (mode === 'edit') {
      return originalGovernanceId !== undefined || hasGovernanceAssigned();
    }

    return false;
  };

  const handleSubmit = (saveType: 'draft' | 'approval') => {
    // Si no cumple la regla, no permitir enviar a aprobación
    if (saveType === 'approval' && !canSendForApproval()) {
      return;
    }

    if (saveType === 'draft' || (validationResults.overall && canSendForApproval())) {
      onSubmit(saveType);
    }
  };

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle size={16} style={{ color: '#10b981' }} />
    ) : (
      <AlertTriangle size={16} style={{ color: '#ef4444' }} />
    );
  };

  const getValidationStatus = (isValid: boolean) => {
    return isValid ? 'Completo' : 'Incompleto';
  };

  const getEstadoBadge = (estado?: number) => {
    const label = typeof estado === 'number' ? getEstadoSistemaLabel(estado as EstadoSistema) : '-';
    const isActivo = estado === EstadoSistema.Activo;
    const isInactivo = estado === EstadoSistema.Inactivo;
    const bg = isActivo ? '#10b981' : isInactivo ? '#ef4444' : '#6b7280';
    return (
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '4px', 
        fontSize: '12px', 
        fontWeight: '500',
        backgroundColor: bg,
        color: 'white'
      }}>
        {label}
      </span>
    );
  };

  return (
    <div className={styles.stepContainer}>
      {/* Header del Step */}
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <CheckCircle size={20} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>Resumen y Confirmación</h2>
          <p className={styles.stepDescription}>
            Revisa toda la información antes de guardar el sistema
          </p>
        </div>
      </div>

      {/* Estado de Validación General */}
      <div className={`${styles.formSection} ${validationResults.overall ? '' : 'border-red-500'}`}>
        <div className={styles.sectionHeader}>
          {getValidationIcon(validationResults.overall)}
          <div>
            <h3 className={styles.sectionTitle}>
              Estado de Validación: {getValidationStatus(validationResults.overall)}
            </h3>
            <p className={styles.sectionDescription}>
              {validationResults.overall 
                ? 'Todos los campos requeridos están completos. El sistema está listo para ser guardado.'
                : 'Hay campos requeridos incompletos. Revisa las secciones marcadas en rojo.'
              }
            </p>
          </div>
        </div>

        {/* Resumen de validación por pasos */}
        <div className={`${styles.formGrid} ${styles.twoColumns}`}>
          <div className={styles.fieldGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getValidationIcon(validationResults.step1)}
              <span>Paso 1: Información Básica - {getValidationStatus(validationResults.step1)}</span>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getValidationIcon(validationResults.step2)}
              <span>Paso 2: Jerarquía y Servidores - {getValidationStatus(validationResults.step2)}</span>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getValidationIcon(validationResults.step3)}
              <span>Paso 3: Módulos - {getValidationStatus(validationResults.step3)}</span>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getValidationIcon(validationResults.step4)}
              <span>Paso 4: Gobierno - {getValidationStatus(validationResults.step4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Información Básica */}
      <div className={styles.formSection}>
        <div className={styles.sectionHeader} style={{ cursor: 'pointer' }} onClick={() => toggleSection('basicInfo')}>
          <Building2 size={16} />
          <div style={{ flex: 1 }}>
            <h3 className={styles.sectionTitle}>Información Básica del Sistema</h3>
            <p className={styles.sectionDescription}>
              Datos fundamentales de identificación
            </p>
          </div>
          {sectionVisibility.basicInfo ? <EyeOff size={16} /> : <Eye size={16} />}
        </div>

        {sectionVisibility.basicInfo && (
          <div className={`${styles.formGrid} ${styles.twoColumns}`}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Nombre del Sistema</label>
              <p style={{ margin: 0, padding: '8px 0', fontWeight: '500' }}>
                {formData.nombreSistema || 'No especificado'}
              </p>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Código del Sistema</label>
              <p style={{ margin: 0, padding: '8px 0', fontWeight: '500' }}>
                {formData.codigoSistema || 'No especificado'}
              </p>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Función Principal</label>
              <p style={{ margin: 0, padding: '8px 0' }}>
                {formData.funcionPrincipal || 'No especificado'}
              </p>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Tipo de Sistema</label>
              <p style={{ margin: 0, padding: '8px 0' }}>
                {resolveTipoNombre(formData.tipoSistema)}
              </p>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Familia de Sistema</label>
              <p style={{ margin: 0, padding: '8px 0' }}>
                {resolveFamiliaNombre(formData.familiaSistema)}
              </p>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Estado</label>
              <p style={{ margin: 0, padding: '8px 0' }}>{getEstadoBadge(formData.estado)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Sección: Jerarquía y Servidores */}
      <div className={styles.formSection}>
        <div className={styles.sectionHeader} style={{ cursor: 'pointer' }} onClick={() => toggleSection('hierarchy')}>
          <Network size={16} />
          <div style={{ flex: 1 }}>
            <h3 className={styles.sectionTitle}>Jerarquía y Servidores</h3>
            <p className={styles.sectionDescription}>
              Relación con otros sistemas y su infraestructura
            </p>
          </div>
          {sectionVisibility.hierarchy ? <EyeOff size={16} /> : <Eye size={16} />}
        </div>

        {sectionVisibility.hierarchy && (
          <div className={`${styles.formGrid} ${styles.twoColumns}`}>
            {/* Sistema Padre */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Sistema Padre</label>
              <p style={{ margin: 0, padding: '8px 0' }}>
                {resolveSistemaNombre(formData.sistemaDepende)}
              </p>
            </div>

            {/* Servidores */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Listado de Servidores</label>
              {formData.servidorIds && formData.servidorIds.length > 0 ? (
                <div className={styles.chipGroup}>
                  {formData.servidorIds.map((id) => (
                    <div key={id} className={styles.chip}>{resolveServidorNombre(id)}</div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, padding: '8px 0', opacity: 0.7 }}>Sin servidores asignados</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sección: Módulos */}
      <div className={styles.formSection}>
        <div className={styles.sectionHeader} style={{ cursor: 'pointer' }} onClick={() => toggleSection('modules')}>
          <Package size={16} />
          <div style={{ flex: 1 }}>
            <h3 className={styles.sectionTitle}>Módulos</h3>
            <p className={styles.sectionDescription}>
              Componentes funcionales del sistema
            </p>
          </div>
          {sectionVisibility.modules ? <EyeOff size={16} /> : <Eye size={16} />}
        </div>

        {sectionVisibility.modules && (
          <div>
            {formData.modulos && formData.modulos.length > 0 ? (
              <div className={styles.itemList}>
                {formData.modulos
                  .filter((mod) => !mod._deleted)
                  .map((mod, index) => (
                    <div key={index} className={styles.itemRow}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} />
                          <strong>{mod.nombre || `Módulo ${index + 1}`}</strong>
                          <span
                            style={{
                              marginLeft: '8px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: mod.activo ? '#10b981' : '#ef4444',
                              color: 'white'
                            }}
                          >
                            {mod.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </div>
                        <p className={styles.itemDescription}>
                          Versión: {mod.version || '-'} | {mod.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p style={{ margin: 0, padding: '8px 0', opacity: 0.7 }}>Sin módulos configurados</p>
            )}
          </div>
        )}
      </div>


      {/* Sección: Gobierno */}
      <div className={styles.formSection}>
        <div className={styles.sectionHeader} style={{ cursor: 'pointer' }} onClick={() => toggleSection('governance')}>
          <Shield size={16} />
          <div style={{ flex: 1 }}>
            <h3 className={styles.sectionTitle}>Gobierno y Aprobación</h3>
            <p className={styles.sectionDescription}>
              Estructura de gobierno y flujos de aprobación
            </p>
          </div>
          {sectionVisibility.governance ? <EyeOff size={16} /> : <Eye size={16} />}
        </div>

        {sectionVisibility.governance && (
          <div>
            {/* Configuración General */}
            <div className={`${styles.formGrid} ${styles.twoColumns}`}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Gobierno Asignado</label>
                <p style={{ margin: 0, padding: '8px 0' }}>
                  {resolveGobernanzaNombre(formData.gobernanzaId)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ¿Cómo desea proceder? */}
      <div className={styles.formSection}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#374151' }}>
          ¿Cómo desea proceder?
        </h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
          Seleccione si desea guardar como borrador o iniciar el proceso de aprobación:
        </p>
        
        {/* Advertencia si no hay gobernanza en el estado ACTUAL */}
        {!hasGovernanceAssigned() && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <span style={{ fontSize: '14px', color: '#92400e' }}>
              <strong>Atención:</strong> Este sistema no tiene una gobernanza asignada. Solo se puede guardar como borrador.
            </span>
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
                  {validationResults.overall ? 'Guardar sin iniciar proceso de aprobación' : 'Complete el formulario para habilitar esta opción'}
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
              cursor: canSendForApproval() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              background: canSendForApproval() ? 'white' : '#f9fafb',
              opacity: canSendForApproval() ? 1 : 0.6
            }}
            onClick={() => canSendForApproval() && handleSubmit('approval')}
            onMouseEnter={(e) => {
              if (canSendForApproval()) {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (canSendForApproval()) {
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
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: canSendForApproval() ? '#374151' : '#9ca3af' }}>
                  Enviar a Aprobación
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: canSendForApproval() ? '#6b7280' : '#9ca3af' }}>
                  {canSendForApproval() ? 'Iniciar proceso de aprobación' : 'Disponible solo en edición y si el sistema original ya tenía gobernanza'}
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
  );
};


export default Step5Summary;