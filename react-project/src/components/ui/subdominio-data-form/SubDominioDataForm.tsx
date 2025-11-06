import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Textarea } from '../textarea/textarea';
import { Label } from '../label';

import { AlertService } from '../alerts/AlertService';
import { authService, gobernanzaService, tipoEntidadService } from '../../../services';
import {
  SubDominioData,
  CreateSubDominioDataDto,
  UpdateSubDominioDataDto
} from '../../../models/DominiosData';
import { GobernanzaDto } from '../../../services/types/gobernanza.types';
import { TipoEntidad } from '../../../services/types/tipo-entidad.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectWrapper,
} from '../select/Select';
import styles from './SubDominioDataForm.module.css';

// ===== INTERFACES =====

interface FormData {
  codigoSubDominio: string;
  nombreSubDominio: string;
  descripcionSubDominio: string;
  tieneGobernanzaPropia: boolean;
  gobernanzaId: number;
}

interface FormErrors {
  codigoSubDominio?: string;
  nombreSubDominio?: string;
  descripcionSubDominio?: string;
  general?: string[];
}

export interface SubDominioDataFormProps {
  /** SubDominio a editar (null para crear nuevo) */
  subDominio?: SubDominioData | null;
  /** ID del dominio padre */
  dominioId: number;
  /** Función llamada al enviar el formulario válido */
  onSubmit: (data: CreateSubDominioDataDto | UpdateSubDominioDataDto) => Promise<void>;
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
  /** Función llamada para ver la gobernanza del subdominio */
  onGovernance?: (subDominio: SubDominioData) => void;
  /** Función llamada cuando cambia la gobernanza */
  onGobernanzaChange?: (gobernanzaId: number) => void;
}

export const SubDominioDataForm: React.FC<SubDominioDataFormProps> = ({
  subDominio,
  dominioId,
  onSubmit,
  onCancel,
  isLoading = false,
  disabled = false,
  showActions = true,
  compact = false,
  onGovernance,
  onGobernanzaChange
}) => {
  const { colors } = useTheme();
  const isEditing = !!subDominio;

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    codigoSubDominio: '',
    nombreSubDominio: '',
    descripcionSubDominio: '',
    gobernanzaId: 0
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para gobernanza
  const [gobernanzasDisponibles, setGobernanzasDisponibles] = useState<GobernanzaDto[]>([]);
  const [loadingGobernanzas, setLoadingGobernanzas] = useState(false);
  const [tiposEntidad, setTiposEntidad] = useState<TipoEntidad[]>([]);

  // Cargar tipos de entidad al montar el componente
  useEffect(() => {
    const loadTiposEntidad = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const organizacionId = currentUser?.organizacionId;
        
        if (!organizacionId) {
          console.error('No se pudo obtener organizacionId');
          return;
        }

        const response = await tipoEntidadService.getAllTiposEntidad(organizacionId);
        if (response.success && response.data) {
          setTiposEntidad(response.data);
        }
      } catch (error) {
        console.error('Error cargando tipos de entidad:', error);
      }
    };

    loadTiposEntidad();
  }, []);

  // Cargar gobiernos filtrados por tipo de entidad 'Data' (igual que FormDominioData)
  useEffect(() => {
    const loadGobernanzasPorTipoEntidad = async () => {
      if (tiposEntidad.length === 0) {
        setGobernanzasDisponibles([]);
        return;
      }

      setLoadingGobernanzas(true);
      try {
        const currentUser = authService.getCurrentUser();
        const organizacionId = currentUser?.organizacionId;
        
        if (!organizacionId) {
          console.error('No se pudo obtener organizacionId');
          return;
        }

        // Buscar el tipo de entidad 'Data' (igual lógica que FormDominioData)
        const tipoEntidadData = tiposEntidad.find(tipo => 
          tipo.tipoEntidadCodigo?.toLowerCase() === 'data' ||
          tipo.tipoEntidadNombre?.toLowerCase().includes('data')
        );
        
        if (!tipoEntidadData) {
          console.warn('No se encontró tipo de entidad Data en SubDominioDataForm');
          setGobernanzasDisponibles([]);
          return;
        }

        const filtros = {
          tipoEntidadId: tipoEntidadData.tipoEntidadId,
          organizacionId: organizacionId,
          includeDeleted: false
        };
        const response = await gobernanzaService.getAllGobernanzas(filtros);

        if (response.success && response.data) {
          // Filtrar solo gobernanzas activas (soportar distintas estructuras de API)
          const gobernanzasActivas = response.data.filter((g: any) => {
            const estaActiva = (g.activo === true) || (g.estado === 1) || (typeof g.estado === 'string' && g.estado.toLowerCase() === 'activo');
            const noEliminada = (g.registroEliminado === false) || (g.registroEliminado === 0) || (g.registroEliminado === null) || (typeof g.registroEliminado === 'undefined');
            return estaActiva && noEliminada;
          });
          setGobernanzasDisponibles(gobernanzasActivas);
        } else {
          console.error('Error al cargar gobernanzas:', response.message);
          setGobernanzasDisponibles([]);
        }
      } catch (error) {
        console.error('Error cargando gobernanzas:', error);
        setGobernanzasDisponibles([]);
      } finally {
        setLoadingGobernanzas(false);
      }
    };

    loadGobernanzasPorTipoEntidad();
  }, [tiposEntidad]);

  // Inicializar formulario cuando cambia el subdominio
  useEffect(() => {
    if (subDominio) {
      setFormData({
        codigoSubDominio: subDominio.codigo || subDominio.codigoSubDominio || '',
        nombreSubDominio: subDominio.nombre || subDominio.nombreSubDominio || '',
        descripcionSubDominio: subDominio.descripcion || subDominio.descripcionSubDominio || '',
        tieneGobernanzaPropia: subDominio.tieneGobernanzaPropia || false,
        gobernanzaId: (subDominio as any).gobernanzaId || 0
      });
    } else {
      setFormData({
        codigoSubDominio: '',
        nombreSubDominio: '',
        descripcionSubDominio: '',
        tieneGobernanzaPropia: false,
        gobernanzaId: 0
      });
    }
    setErrors({});
  }, [subDominio]);

  // Setear automáticamente el gobernanzaId cuando el subdominio tenga un valor
  useEffect(() => {
    if ((subDominio as any)?.gobernanzaId && (subDominio as any).gobernanzaId !== null && (subDominio as any).gobernanzaId > 0) {
      setFormData(prev => ({
        ...prev,
        gobernanzaId: (subDominio as any).gobernanzaId,
        tieneGobernanzaPropia: true
      }));
    }
  }, [(subDominio as any)?.gobernanzaId]);



  // Manejar cambios en los campos
  const handleFieldChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Notificar cambio de gobernanzaId si se proporciona el callback
    if (field === 'gobernanzaId' && onGobernanzaChange && typeof value === 'number' && value > 0) {
      onGobernanzaChange(value);
    }
  }, [errors, onGobernanzaChange]);

  // Validación del formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.nombreSubDominio.trim()) {
      newErrors.nombreSubDominio = 'El nombre es requerido';
    } else if (formData.nombreSubDominio.trim().length < 3) {
      newErrors.nombreSubDominio = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombreSubDominio.trim().length > 200) {
      newErrors.nombreSubDominio = 'El nombre no puede exceder 200 caracteres';
    }

    // Validar código (opcional, sin patrón)
    if (formData.codigoSubDominio.trim()) {
      if (formData.codigoSubDominio.trim().length > 50) {
        newErrors.codigoSubDominio = 'El código no puede exceder 50 caracteres';
      }
    }

    // Validar descripción (opcional)
    if (formData.descripcionSubDominio.trim() && formData.descripcionSubDominio.trim().length > 1000) {
      newErrors.descripcionSubDominio = 'La descripción no puede exceder 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Verificar si hay errores
  const hasErrors = Object.keys(errors).some(key => errors[key as keyof FormErrors]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled || isSubmitting) {
      return;
    }
    if (!validateForm()) {
      AlertService.error('Por favor, corrija los errores en el formulario');
      return;
    }
    setIsSubmitting(true);
    try {
      // Obtener el ID del usuario actual
      const currentUser = authService.getCurrentUser();
      const currentUserId = currentUser?.usuarioId || 0;
      const dto = isEditing
        ? {
            subDominioDataId: subDominio!.subDominioId,
            dominioDataId: dominioId,
            codigoSubDominio: formData.codigoSubDominio.trim(),
            nombreSubDominio: formData.nombreSubDominio.trim(),
            descripcionSubDominio: formData.descripcionSubDominio.trim() || undefined,
            tieneGobernanzaPropia: formData.tieneGobernanzaPropia,
            gobernanzaId: formData.tieneGobernanzaPropia ? formData.gobernanzaId : undefined,
            actualizadoPor: currentUserId
          } as UpdateSubDominioDataDto
        : {
            dominioDataId: dominioId,
            codigoSubDominio: formData.codigoSubDominio.trim(),
            nombreSubDominio: formData.nombreSubDominio.trim(),
            descripcionSubDominio: formData.descripcionSubDominio.trim() || undefined,
            tieneGobernanzaPropia: formData.tieneGobernanzaPropia,
            gobernanzaId: formData.tieneGobernanzaPropia ? formData.gobernanzaId : undefined,
            creadoPor: currentUserId
          } as CreateSubDominioDataDto;
      await onSubmit(dto);
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      const msg = (error as any)?.response?.data?.message
        || (error as any)?.response?.data?.error
        || (error as any)?.message
        || 'Error al guardar el subdominio';
      AlertService.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [disabled, isSubmitting, validateForm, isEditing, subDominio, dominioId, formData, onSubmit]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${styles.subDominioForm} ${compact ? styles.compact : ''}`}
      data-form="subdominio-data"
    >
      <div className={styles.formContent}>
        {/* Información básica */}
        <div className={styles.formGrid}>
          {/* Nombre */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Nombre <span className={styles.required}>*</span>
            </label>
            <Input
              value={formData.nombreSubDominio}
              onChange={(e) => handleFieldChange('nombreSubDominio', e.target.value)}
              placeholder="Nombre del subdominio"
              disabled={disabled || isSubmitting}
              maxLength={200}
              error={!!errors.nombreSubDominio}
            />
            {errors.nombreSubDominio && (
              <span className={styles.fieldError}>{errors.nombreSubDominio}</span>
            )}
          </div>

          {/* Código */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Código</label>
            <Input
              value={formData.codigoSubDominio}
              onChange={(e) => handleFieldChange('codigoSubDominio', e.target.value)}
              placeholder="Código del subdominio (opcional)"
              disabled={disabled || isSubmitting}
              maxLength={50}
              error={!!errors.codigoSubDominio}
            />
            {errors.codigoSubDominio && (
              <span className={styles.fieldError}>{errors.codigoSubDominio}</span>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Descripción</label>
          <Textarea
            value={formData.descripcionSubDominio}
            onChange={(e) => handleFieldChange('descripcionSubDominio', e.target.value)}
            placeholder="Descripción del subdominio (opcional)"
            disabled={disabled || isSubmitting}
            maxLength={1000}
            rows={3}
            error={!!errors.descripcionSubDominio}
          />
          {errors.descripcionSubDominio && (
            <span className={styles.fieldError}>{errors.descripcionSubDominio}</span>
          )}
        </div>

        {/* Dropdown de Gobierno */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Gobierno</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <SelectWrapper
                value={formData.gobernanzaId && formData.gobernanzaId > 0 ? formData.gobernanzaId.toString() : undefined}
                onValueChange={(value) => handleFieldChange('gobernanzaId', value ? parseInt(value) : 0)}
                disabled={disabled || isSubmitting || loadingGobernanzas}
                searchable
                searchPlaceholder="Buscar gobierno..."
                icon="Shield"
                placeholder={loadingGobernanzas ? "Cargando gobiernos..." : "Seleccione un gobierno"}
              >
                <SelectContent>
                  {gobernanzasDisponibles.map((gobernanza) => (
                    <SelectItem key={gobernanza.gobernanzaId} value={gobernanza.gobernanzaId.toString()}>
                      {gobernanza.nombre || `Gobierno ${gobernanza.gobernanzaId}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectWrapper>
            </div>
            {(formData.gobernanzaId && formData.gobernanzaId > 0 && onGovernance) ? (
              <Button
                type="button"
                variant="default"
                size="s"
                onClick={() => {
                  // Crear un objeto subdominio temporal con los datos del formulario si no existe
                  const subDominioToPass = subDominio || {
                    subDominioId: 0,
                    nombreSubDominio: formData.nombreSubDominio || '',
                    gobernanzaId: formData.gobernanzaId,
                    dominioId: dominioId
                  } as SubDominioData;
                  onGovernance(subDominioToPass);
                }}
                disabled={disabled || isSubmitting}
                iconName="Shield"
                iconPosition="left"
                title="Ver detalles de la gobernanza"
              >
                Ver Gobierno
              </Button>
            ) : null}
          </div>
          {errors.gobernanzaId && (
            <span className={styles.fieldError}>{errors.gobernanzaId}</span>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      {showActions && (
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={disabled || isSubmitting || hasErrors}
            loading={isSubmitting}
          >
            {isEditing ? 'Actualizar' : 'Crear'} Subdominio
          </Button>
        </div>
      )}
    </form>
  );
};

export default SubDominioDataForm;