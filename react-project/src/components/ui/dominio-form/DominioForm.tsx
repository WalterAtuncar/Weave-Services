import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select/Select';
import { Textarea } from '../textarea/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../card';
import { AlertService } from '../alerts/AlertService';
import {
  DominioData,
  CreateDominioDataDto,
  UpdateDominioDataDto,
  EstadoDominioData,
  TipoDominioData,
  getEstadoDominioDataOptions,
  getTipoDominioDataOptions,
  getEstadoDominioDataLabel,
  getTipoDominioDataLabel
} from '../../../models/DominiosData';
import { useDominiosData } from '../../../hooks/useDominiosData';
import styles from './DominioForm.module.css';

export interface DominioFormProps {
  /** Dominio a editar (null para crear nuevo) */
  dominio?: DominioData | null;
  /** Función llamada al enviar el formulario válido */
  onSubmit: (data: CreateDominioDataDto | UpdateDominioDataDto) => Promise<void>;
  /** Función llamada al cancelar */
  onCancel: () => void;
  /** Estado de loading durante submit */
  isLoading?: boolean;
  /** Desactivar todo el formulario */
  disabled?: boolean;
  /** Mostrar/ocultar botones de acción */
  showActions?: boolean;
  /** Modo compacto */
  compact?: boolean;
  /** ID de la organización */
  organizacionId?: number;
}

interface FormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  tipo: TipoDominioData;
  dominioParentId?: number;
  estado: EstadoDominioData;
  propietarioNegocio: string;
  stewardData: string;
  politicasGobierno: string;
}

interface FormErrors {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  tipo?: string;
  dominioParentId?: string;
  estado?: string;
  propietarioNegocio?: string;
  stewardData?: string;
  politicasGobierno?: string;
  general?: string[];
}

export const DominioForm: React.FC<DominioFormProps> = ({
  dominio,
  onSubmit,
  onCancel,
  isLoading = false,
  disabled = false,
  showActions = true,
  compact = false,
  organizacionId = 1
}) => {
  const { colors } = useTheme();
  const { dominios } = useDominiosData();
  const isEditing = !!dominio;

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    codigo: '',
    descripcion: '',
    tipo: TipoDominioData.OPERACIONAL,
    dominioParentId: undefined,
    estado: EstadoDominioData.BORRADOR,
    propietarioNegocio: '',
    stewardData: '',
    politicasGobierno: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulario cuando cambia el dominio
  useEffect(() => {
    if (dominio) {
      setFormData({
        nombre: dominio.nombre || '',
        codigo: dominio.codigo || '',
        descripcion: dominio.descripcion || '',
        tipo: dominio.tipo,
        dominioParentId: dominio.dominioParentId,
        estado: dominio.estado,
        propietarioNegocio: dominio.propietarioNegocio || '',
        stewardData: dominio.stewardData || '',
        politicasGobierno: dominio.politicasGobierno || ''
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        tipo: TipoDominioData.OPERACIONAL,
        dominioParentId: undefined,
        estado: EstadoDominioData.BORRADOR,
        propietarioNegocio: '',
        stewardData: '',
        politicasGobierno: ''
      });
    }
    setErrors({});
  }, [dominio]);

  // Opciones para dominios padre (solo dominios activos, excluyendo el actual)
  const dominiosPadreOptions = useMemo(() => {
    return dominios
      .filter(d => 
        d.estado === EstadoDominioData.ACTIVO && 
        (!dominio || d.dominioId !== dominio.dominioId)
      )
      .map(d => ({
        value: d.dominioId,
        label: `${d.codigo} - ${d.nombre}`
      }));
  }, [dominios, dominio]);

  // Validación del formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar código
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (!/^[A-Za-z0-9 _-]+$/.test(formData.codigo.trim())) {
      newErrors.codigo = 'El código puede contener letras, números, espacios, guiones y guiones bajos';
    } else if (formData.codigo.trim().length < 3) {
      newErrors.codigo = 'El código debe tener al menos 3 caracteres';
    } else if (formData.codigo.trim().length > 20) {
      newErrors.codigo = 'El código no puede exceder 20 caracteres';
    }

    // Validar código único
    const codigoExistente = dominios.find(d => 
      d.codigo.toLowerCase() === formData.codigo.trim().toLowerCase() &&
      (!dominio || d.dominioId !== dominio.dominioId)
    );
    if (codigoExistente) {
      newErrors.codigo = 'Ya existe un dominio con este código';
    }

    // Validar descripción
    if (formData.descripcion.trim().length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Validar propietario de negocio
    if (formData.propietarioNegocio.trim().length > 100) {
      newErrors.propietarioNegocio = 'El propietario de negocio no puede exceder 100 caracteres';
    }

    // Validar steward de data
    if (formData.stewardData.trim().length > 100) {
      newErrors.stewardData = 'El steward de data no puede exceder 100 caracteres';
    }

    // Validar políticas de gobierno
    if (formData.politicasGobierno.trim().length > 1000) {
      newErrors.politicasGobierno = 'Las políticas de gobierno no pueden exceder 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, dominios, dominio]);

  // Manejar cambios en los campos
  const handleFieldChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled || isSubmitting) return;

    if (!validateForm()) {
      AlertService.error('Por favor, corrija los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto = isEditing
        ? {
            dominioId: dominio!.dominioId,
            organizacionId,
            nombre: formData.nombre.trim(),
            codigo: formData.codigo.trim(),
            descripcion: formData.descripcion.trim() || undefined,
            tipo: formData.tipo,
            dominioParentId: formData.dominioParentId || undefined,
            estado: formData.estado,
            propietarioNegocio: formData.propietarioNegocio.trim() || undefined,
            stewardData: formData.stewardData.trim() || undefined,
            politicasGobierno: formData.politicasGobierno.trim() || undefined
          } as UpdateDominioDataDto
        : {
            organizacionId,
            nombre: formData.nombre.trim(),
            codigo: formData.codigo.trim(),
            descripcion: formData.descripcion.trim() || undefined,
            tipo: formData.tipo,
            dominioParentId: formData.dominioParentId || undefined,
            estado: formData.estado,
            propietarioNegocio: formData.propietarioNegocio.trim() || undefined,
            stewardData: formData.stewardData.trim() || undefined,
            politicasGobierno: formData.politicasGobierno.trim() || undefined
          } as CreateDominioDataDto;

      await onSubmit(dto);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      const msg = (error as any)?.response?.data?.message
        || (error as any)?.response?.data?.error
        || (error as any)?.message
        || 'Error al guardar el dominio';
      AlertService.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [disabled, isSubmitting, validateForm, isEditing, dominio, organizacionId, formData, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={`${styles.dominioForm} ${compact ? styles.compact : ''}`}>
      <div className={styles.formContent}>
        {/* Información básica */}
        <Card>
          {/* Título "Información Básica" eliminado según solicitud */}
          <CardContent className={styles.contentTopPad}>
            <div className={styles.formGrid}>
              {/* Nombre */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Nombre <span className={styles.required}>*</span>
                </label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => handleFieldChange('nombre', e.target.value)}
                  placeholder="Nombre del dominio"
                  disabled={disabled || isSubmitting}
                  maxLength={100}
                  error={!!errors.nombre}
                />
                {errors.nombre && (
                  <span className={styles.fieldError}>{errors.nombre}</span>
                )}
              </div>

              {/* Código */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Código <span className={styles.required}>*</span>
                </label>
                <Input
                  value={formData.codigo}
                  onChange={(e) => handleFieldChange('codigo', e.target.value)}
                  placeholder="DOM-001"
                  disabled={disabled || isSubmitting}
                  maxLength={20}
                  error={!!errors.codigo}
                  style={{ fontFamily: 'monospace' }}
                />
                {errors.codigo && (
                  <span className={styles.fieldError}>{errors.codigo}</span>
                )}
              </div>

              {/* Tipo */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tipo <span className={styles.required}>*</span>
                </label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => handleFieldChange('tipo', value as TipoDominioData)}
                  disabled={disabled || isSubmitting}
                >
                  <SelectTrigger error={!!errors.tipo}>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTipoDominioDataOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <span className={styles.fieldError}>{errors.tipo}</span>
                )}
              </div>

              {/* Estado */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Estado <span className={styles.required}>*</span>
                </label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleFieldChange('estado', value as EstadoDominioData)}
                  disabled={disabled || isSubmitting}
                >
                  <SelectTrigger error={!!errors.estado}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {getEstadoDominioDataOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <span className={styles.fieldError}>{errors.estado}</span>
                )}
              </div>

              {/* Dominio Padre */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Dominio Padre
                </label>
                <Select
                  value={formData.dominioParentId != null ? formData.dominioParentId.toString() : 'none'}
                  onValueChange={(value) => handleFieldChange('dominioParentId', value === 'none' ? undefined : parseInt(value))}
                  disabled={disabled || isSubmitting}
                >
                  <SelectTrigger error={!!errors.dominioParentId}>
                    <SelectValue placeholder="Sin dominio padre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin dominio padre</SelectItem>
                    {dominiosPadreOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dominioParentId && (
                  <span className={styles.fieldError}>{errors.dominioParentId}</span>
                )}
              </div>

              {/* Descripción */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Descripción
                </label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                  placeholder="Descripción del dominio"
                  disabled={disabled || isSubmitting}
                  maxLength={500}
                  rows={3}
                  error={!!errors.descripcion}
                />
                {errors.descripcion && (
                  <span className={styles.fieldError}>{errors.descripcion}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección de Responsabilidades eliminada según solicitud */}

        {/* Errores generales */}
        {errors.general && errors.general.length > 0 && (
          <div className={styles.generalErrors}>
            {errors.general.map((error, index) => (
              <div key={index} className={styles.generalError}>
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Botones de acción */}
        {showActions && (
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={disabled || isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={disabled || isSubmitting}
              loading={isSubmitting}
            >
              {isEditing ? 'Actualizar Dominio' : 'Crear Dominio'}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default DominioForm;