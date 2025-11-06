import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Input } from '../../input/input';
import { Textarea } from '../../textarea/textarea';
import { Label } from '../../label/Label';
import { Step2FormularioSubDominioProps, FormMode } from '../types';
import { EstadoDominioData } from '../../../../models/DominiosData';
import styles from '../StepperSubDominioForm.module.css';
import sysStyles from '../../stepper-system-form/StepperSystemForm.module.css';

const Step2FormularioSubDominio: React.FC<Step2FormularioSubDominioProps> = ({
  formData,
  onDataChange,
  errors,
  isLoading = false,
  disabled = false,
  organizacionId,
  mode,
  editingSubDominio
}) => {
  const { colors } = useTheme();

  // ===== HANDLERS =====
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    onDataChange({ [field]: value });
  };

  const isEditMode = mode === FormMode.EDIT;
  const title = isEditMode ? 'Editar Subdominio' : 'Nuevo Subdominio';
  const description = isEditMode 
    ? 'Modifica los datos del subdominio seleccionado'
    : 'Completa la información básica del nuevo subdominio';

  return (
    <div className={styles.stepContainer}>
      {/* Header del Step */}
      <div className={sysStyles.stepHeader}>
        <div className={sysStyles.stepIcon}>
          <FileText size={20} />
        </div>
        <div>
          <h2 className={sysStyles.stepTitle}>{title}</h2>
          <p className={sysStyles.stepDescription}>{description}</p>
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className={styles.formSection}>
        <div className={`${styles.formGrid} ${styles.twoColumns}`}>
          {/* Nombre del Subdominio */}
          <div className={styles.fieldGroup}>
            <Label>Nombre del Subdominio *</Label>
            <Input
              icon="Database"
              value={formData.nombreSubDominio || ''}
              onChange={(e) => handleInputChange('nombreSubDominio', e.target.value)}
              placeholder="Ingresa el nombre del subdominio"
              disabled={isLoading || disabled}
              maxLength={200}
              requiredText={true}
            />
            {errors.nombreSubDominio && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.nombreSubDominio}
              </p>
            )}
            <p className={styles.fieldHint}>
              Nombre único e identificativo del subdominio (máx. 200 caracteres)
            </p>
          </div>

          {/* Código del Subdominio */}
          <div className={styles.fieldGroup}>
            <Label>Código del Subdominio</Label>
            <Input
              icon="Hash"
              value={formData.codigoSubDominio || ''}
              onChange={(e) => handleInputChange('codigoSubDominio', e.target.value.toUpperCase())}
              placeholder="Ej: SUB001"
              disabled={isLoading || disabled}
              maxLength={50}
            />
            {errors.codigoSubDominio && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.codigoSubDominio}
              </p>
            )}
            <p className={styles.fieldHint}>
              Código único del subdominio (opcional, máx. 50 caracteres)
            </p>
          </div>
        </div>

        {/* Descripción del Subdominio */}
        <div className={styles.fieldGroup}>
          <Label>Descripción del Subdominio</Label>
          <Textarea
            value={formData.descripcionSubDominio || ''}
            onChange={(e) => handleInputChange('descripcionSubDominio', e.target.value)}
            placeholder="Describe el propósito y alcance del subdominio..."
            disabled={isLoading || disabled}
            rows={4}
            maxLength={1000}
          />
          {errors.descripcionSubDominio && (
            <p className={styles.fieldError}>
              <AlertCircle size={12} />
              {errors.descripcionSubDominio}
            </p>
          )}
          <p className={styles.fieldHint}>
            Descripción detallada del subdominio (opcional, máx. 1000 caracteres)
          </p>
        </div>

        {/* Información adicional para modo edición */}
        {isEditMode && editingSubDominio && (
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoHeader}>
                <FileText size={16} />
                <span>Información</span>
              </div>
              <div className={styles.infoContent}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ID:</span>
                  <span className={styles.infoValue}>{editingSubDominio.subDominioId || editingSubDominio.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Estado Actual:</span>
                  <span className={`${styles.infoValue} ${styles.statusBadge}`}>
                    {editingSubDominio.estado === EstadoDominioData.ACTIVO ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {editingSubDominio.fechaCreacion && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Fecha de Creación:</span>
                    <span className={styles.infoValue}>
                      {new Date(editingSubDominio.fechaCreacion).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
                {editingSubDominio.fechaActualizacion && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Última Actualización:</span>
                    <span className={styles.infoValue}>
                      {new Date(editingSubDominio.fechaActualizacion).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Errores generales */}
      {errors.general && (
        <div className={styles.errorContainer}>
          <span className={styles.fieldError}>{errors.general}</span>
        </div>
      )}
    </div>
  );
};

export default Step2FormularioSubDominio;