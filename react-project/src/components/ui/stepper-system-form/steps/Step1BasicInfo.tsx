import React from 'react';
import { Building2, FileText, AlertCircle, Hash, Type, Layers } from 'lucide-react';
import { Input } from '../../input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../select';
import { Label } from '../../label';
import { SystemFormData, SystemFormErrors, TipoSistema, FamiliaSistema } from '../types';
import styles from '../StepperSystemForm.module.css';
import { sanitizeCodigoSistema } from '../../../../utils/sistemasValidation';

interface Step1BasicInfoProps {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  tiposSistema: TipoSistema[];
  familiasSistema?: FamiliaSistema[];
  loading?: boolean;
}

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  errors,
  onDataChange,
  tiposSistema = [],
  familiasSistema = [],
  loading = false
}) => {
  const handleInputChange = (field: keyof SystemFormData, value: any) => {
    onDataChange({ [field]: value });
  };

  const handleSelectChangeNumber = (field: keyof SystemFormData, value: string) => {
    const parsed = value ? parseInt(value, 10) : undefined;
    // @ts-expect-error - field es numérico en nuestro modelo
    onDataChange({ [field]: parsed });
  };

  return (
    <div className={styles.stepContainer}>
      {/* Contenido del formulario sin duplicar información del header */}
      <div className={styles.formSection}>

        <div className={`${styles.formGrid} ${styles.twoColumns}`}>
          {/* Nombre del Sistema */}
          <div className={styles.fieldGroup}>
            <Label>Nombre del Sistema *</Label>
            <Input
              icon="Building2"
              value={formData.nombreSistema || ''}
              onChange={(e) => handleInputChange('nombreSistema', e.target.value)}
              placeholder="Ingresa el nombre del sistema"
              disabled={loading}
              maxLength={200}
              requiredText={true}
            />
            {errors.nombreSistema && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.nombreSistema}
              </p>
            )}
            <p className={styles.fieldHint}>
              Nombre único e identificativo del sistema (máx. 200 caracteres)
            </p>
          </div>

          {/* Código del Sistema */}
          <div className={styles.fieldGroup}>
            <Label>Código del Sistema *</Label>
            <Input
              icon="Hash"
              value={formData.codigoSistema || ''}
              onChange={(e) => handleInputChange('codigoSistema', sanitizeCodigoSistema(e.target.value).toUpperCase())}
              placeholder="Ej: SYS001"
              disabled={loading}
              maxLength={50}
              style={{ textTransform: 'uppercase' }}
              requiredText={true}
            />
            {errors.codigoSistema && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.codigoSistema}
              </p>
            )}
            <p className={styles.fieldHint}>
              Código único alfanumérico (máx. 50 caracteres)
            </p>
          </div>

          {/* Tipo de Sistema */}
          <div className={styles.fieldGroup}>
            <Label>Tipo de Sistema *</Label>
            <Select
              value={formData.tipoSistema?.toString() ?? ''}
              onValueChange={(value) => handleSelectChangeNumber('tipoSistema', value)}
              disabled={loading}
            >
              <SelectTrigger icon="Type">
                <SelectValue placeholder="Selecciona un tipo de sistema" />
              </SelectTrigger>
              <SelectContent>
                {tiposSistema.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id.toString()}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipoSistema && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.tipoSistema}
              </p>
            )}
            <p className={styles.fieldHint}>
              Categoría que define la naturaleza del sistema
            </p>
          </div>

          {/* Familia de Sistema */}
          <div className={styles.fieldGroup}>
            <Label>Familia de Sistema *</Label>
            <Select
              value={formData.familiaSistema?.toString() ?? ''}
              onValueChange={(value) => handleSelectChangeNumber('familiaSistema', value)}
              disabled={loading}
            >
              <SelectTrigger icon="Layers">
                <SelectValue placeholder="Selecciona una familia" />
              </SelectTrigger>
              <SelectContent>
                {familiasSistema && familiasSistema.length > 0 ? (
                  familiasSistema.map((fam) => (
                    <SelectItem key={fam.id} value={fam.id.toString()}>
                      {fam.nombre}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Cargando familias...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.familiaSistema && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.familiaSistema}
              </p>
            )}
            <p className={styles.fieldHint}>
              Grupo funcional o familia del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Descripción Funcional */}
      <div className={styles.formSection}>
        <div className={styles.formGrid}>
          {/* Funcion Principal */}
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <Label>Función Principal</Label>
            <textarea
              className={`${styles.fieldInput} ${styles.fieldTextarea} ${errors.funcionPrincipal ? styles.error : ''}`}
              value={formData.funcionPrincipal || ''}
              onChange={(e) => handleInputChange('funcionPrincipal', e.target.value)}
              placeholder="Describe la función principal del sistema"
              disabled={loading}
              rows={4}
              maxLength={500}
            />
            {errors.funcionPrincipal && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.funcionPrincipal}
              </p>
            )}
            <p className={styles.fieldHint}>
              Máximo 500 caracteres
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;