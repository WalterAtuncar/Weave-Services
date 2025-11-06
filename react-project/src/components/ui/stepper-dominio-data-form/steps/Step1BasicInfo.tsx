import React from 'react';
import { Database, FileText, AlertCircle, Hash, Type, Layers } from 'lucide-react';
import { Input } from '../../input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../select';
import { Label } from '../../label';
import { DominioDataFormData, DominioDataFormErrors, TipoDominioData } from '../types';
import styles from '../StepperDominioDataForm.module.css';
import { Textarea } from '../../textarea/textarea';

interface Step1BasicInfoProps {
  formData: DominioDataFormData;
  errors: DominioDataFormErrors;
  onDataChange: (data: Partial<DominioDataFormData>) => void;
  tiposDominio: TipoDominioData[];
  loading?: boolean;
  onErrorChange?: (errors: Partial<DominioDataFormErrors>) => void;
}

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  formData,
  errors,
  onDataChange,
  tiposDominio = [],
  loading = false,
  onErrorChange
}) => {
  const handleInputChange = (field: keyof DominioDataFormData, value: any) => {
    onDataChange({ [field]: value });
  };

  const handleSelectChangeNumber = (field: keyof DominioDataFormData, value: string) => {
    const parsed = value ? parseInt(value, 10) : undefined;
    // @ts-expect-error - field es numérico en nuestro modelo
    onDataChange({ [field]: parsed });
  };

  const handleDescripcionBlur = (value: string) => {
    const trimmed = (value ?? '').trim();
    if (!onErrorChange) return;
    if (trimmed.length > 0 && trimmed.length < 10) {
      onErrorChange({ descripcionDominio: 'La descripción debe tener al menos 10 caracteres' });
    } else {
      onErrorChange({ descripcionDominio: undefined });
    }
  };

  return (
    <div className={styles.stepContainer}>
      {/* Contenido del formulario sin duplicar información del header */}
      <div className={styles.formSection}>

        <div className={`${styles.formGrid} ${styles.twoColumns}`}>
          {/* Nombre del Dominio */}
          <div className={styles.fieldGroup}>
            <Label>Nombre del Dominio *</Label>
            <Input
              icon="Database"
              value={formData.nombreDominio || ''}
              onChange={(e) => handleInputChange('nombreDominio', e.target.value)}
              placeholder="Ingresa el nombre del dominio de datos"
              disabled={loading}
              maxLength={200}
              requiredText={true}
            />
            {errors.nombreDominio && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.nombreDominio}
              </p>
            )}
            <p className={styles.fieldHint}>
              Nombre único e identificativo del dominio de datos (máx. 200 caracteres)
            </p>
          </div>

          {/* Código del Dominio */}
          <div className={styles.fieldGroup}>
            <Label>Código del Dominio *</Label>
          <Input
            icon="Hash"
            value={formData.codigoDominio || ''}
            onChange={(e) => handleInputChange('codigoDominio', e.target.value)}
            placeholder="Ej: DOM-001"
            disabled={loading}
            maxLength={50}
            style={{ textTransform: 'none' }}
            requiredText={true}
          />
            {errors.codigoDominio && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.codigoDominio}
              </p>
            )}
            <p className={styles.fieldHint}>
              Código único alfanumérico (máx. 50 caracteres)
            </p>
          </div>

          {/* Tipo de Dominio */}
          <div className={styles.fieldGroup}>
            <Label>Tipo de Dominio *</Label>
            <Select
              value={formData.tipoDominioId && formData.tipoDominioId > 0 ? formData.tipoDominioId.toString() : ''}
              onValueChange={(value) => handleSelectChangeNumber('tipoDominioId', value)}
              disabled={loading}
            >
              <SelectTrigger icon="Type">
                <SelectValue placeholder="Selecciona un tipo de dominio" />
              </SelectTrigger>
              <SelectContent>
                {tiposDominio.map((tipo) => (
                  <SelectItem key={tipo.tipoDominioId} value={tipo.tipoDominioId.toString()}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipoDominioId && (
              <p className={styles.fieldError}>
                <AlertCircle size={12} />
                {errors.tipoDominioId}
              </p>
            )}
            <p className={styles.fieldHint}>
              Categoría que define la naturaleza del dominio de datos
            </p>
          </div>

          {/* Campo de nivel eliminado: el backend calcula Nivel automáticamente */}
        </div>
      </div>

      {/* Descripción del Dominio */}
      <div className={styles.formSection}>
        <div className={styles.formGrid}>
          {/* Descripción del Dominio */}
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <Label>Descripción del Dominio</Label>
            <Textarea
              value={formData.descripcionDominio || ''}
              onChange={(e) => handleInputChange('descripcionDominio', e.target.value)}
              onBlur={(e) => handleDescripcionBlur(e.target.value)}
              placeholder="Describe el propósito y alcance del dominio de datos"
              disabled={loading}
              rows={3}
              maxLength={500}
              icon="AlignLeft"
              error={errors.descripcionDominio}
              helperText={!errors.descripcionDominio ? 'Máximo 500 caracteres' : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;