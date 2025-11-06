import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { AlertService } from '../alerts/AlertService';
import { DominiosDataService } from '../../../services/dominios-data.service';
import { DominioData, TipoDominio } from '../../../models/DominiosData';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Textarea } from '../textarea/textarea';
import { Label } from '../label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectWrapper,
} from '../select/Select';
import { gobernanzaService, tipoEntidadService } from '../../../services';
import { GobernanzaDto } from '../../../services/types/gobernanza.types';
import { TipoEntidad } from '../../../services/types/tipo-entidad.types';
import styles from './FormDominioData.module.css';

// Interfaces para el formulario
interface CreateDominioDataFormDto {
  nombreDominio: string;
  codigoDominio: string;
  descripcionDominio: string;
  tipoDominioId: number;
  organizacionId: number;
  gobernanzaId?: number;

}

interface UpdateDominioDataFormDto extends CreateDominioDataFormDto {
  dominioId: number;
}


export interface FormDominioDataProps {
  /** DominioData a editar (null para crear nuevo) */
  dominioData?: DominioData | null;
  /** Función llamada al enviar el formulario válido */
  onSubmit: (data: CreateDominioDataFormDto | UpdateDominioDataFormDto) => Promise<void>;
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
  /** Función llamada para ver la gobernanza del dominio */
  onGovernance?: (dominio: DominioData, gobernanza?: GobernanzaDto | any) => void;
  /** Función llamada cuando se selecciona una gobernanza diferente */
  onGobernanzaChange?: (gobernanzaId: number) => void;
}

export const FormDominioData: React.FC<FormDominioDataProps> = ({
  dominioData,
  onSubmit,
  onCancel,
  isLoading = false,
  disabled = false,
  showActions = true,
  compact = false,
  organizacionId,
  onGovernance,
  onGobernanzaChange
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();
  const isEditing = !!dominioData;
  const dominiosDataService = new DominiosDataService();

  // Obtener organizacionId del localStorage
  const getOrganizationId = (): number => {
    // Intentar con organizationInfo primero
    if (organizationInfo?.id && organizationInfo.id > 0) {
      return organizationInfo.id;
    }
    
    // Fallback a localStorage
    try {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const orgId = session?.organizacion?.organizacionId;
        if (orgId && orgId > 0) {
          return orgId;
        }
      }
    } catch (error) {
      console.error('Error al obtener organizacionId del localStorage:', error);
    }
    
    return 1; // Valor por defecto
  };

  // Estado del formulario simplificado
  const [formData, setFormData] = useState({
    nombreDominio: '',
    codigoDominio: '',
    descripcionDominio: '',
    tipoDominioId: 0,
    gobernanzaId: 0,
    tieneGobernanzaPropia: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tiposDominio, setTiposDominio] = useState<TipoDominio[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  
  // Estados para gobernanza
  const [gobernanzasDisponibles, setGobernanzasDisponibles] = useState<GobernanzaDto[]>([]);
  const [loadingGobernanzas, setLoadingGobernanzas] = useState(false);
  const [tiposEntidad, setTiposEntidad] = useState<TipoEntidad[]>([]);

  // Cargar tipos de dominio al montar el componente
  useEffect(() => {
    const loadTiposDominio = async () => {
      setLoadingTipos(true);
      try {
        const response = await dominiosDataService.getTiposDominio();
        if (response.success && response.data) {
          setTiposDominio(response.data);
        } else {
          AlertService.error('Error al cargar tipos de dominio');
        }
      } catch (error) {
        console.error('Error cargando tipos de dominio:', error);
        AlertService.error('Error al cargar tipos de dominio');
      } finally {
        setLoadingTipos(false);
      }
    };

    loadTiposDominio();
  }, []);

  // Cargar tipos de entidad al montar el componente
  useEffect(() => {
    const loadTiposEntidad = async () => {
      try {
        const organizacionId = getOrganizationId();
        const response = await tipoEntidadService.getAllTiposEntidad({
          includeDeleted: false,
          organizationId: organizacionId
        });
        
        if (response.success && response.data) {
          setTiposEntidad(response.data);
        } else {
          console.error('Error al cargar tipos de entidad:', response.message);
        }
      } catch (error) {
        console.error('Error cargando tipos de entidad:', error);
      }
    };

    loadTiposEntidad();
  }, []);

  // Cargar gobiernos filtrados por tipo de entidad 'Data'
  useEffect(() => {
    const loadGobernanzasPorTipoEntidad = async () => {
      if (tiposEntidad.length === 0) {
        setGobernanzasDisponibles([]);
        return;
      }

      setLoadingGobernanzas(true);
      try {
        const organizacionId = getOrganizationId();
        
        // Buscar el tipo de entidad 'Data' (asumiendo tipoEntidadId = 6 basado en el patrón observado)
        const tipoEntidadData = tiposEntidad.find(tipo => 
          tipo.tipoEntidadCodigo?.toLowerCase() === 'data' ||
          tipo.tipoEntidadNombre?.toLowerCase().includes('data')
        );
        
        if (!tipoEntidadData) {
          console.warn('No se encontró tipo de entidad Data');
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

  // Inicializar formulario cuando cambia el dominioData
  useEffect(() => {
    if (dominioData) {
      // Mapear correctamente las propiedades - soportar tanto API real como mock
      const formDataToSet = {
        nombreDominio: (dominioData as any).nombreDominio || dominioData.nombre || '',
        codigoDominio: (dominioData as any).codigoDominio || dominioData.codigo || '',
        descripcionDominio: (dominioData as any).descripcionDominio || dominioData.descripcion || '',
        tipoDominioId: (dominioData as any).tipoDominioId || getTipoDominioIdFromEnum(dominioData.tipo) || 0,
        gobernanzaId: (dominioData as any).gobernanzaId || 0,
        tieneGobernanzaPropia: (dominioData as any).tieneGobernanzaPropia === true
      };
      setFormData(formDataToSet);
    } else {
      setFormData({
        nombreDominio: '',
        codigoDominio: '',
        descripcionDominio: '',
        tipoDominioId: 0,
        gobernanzaId: 0,
        tieneGobernanzaPropia: false
      });
    }
    setErrors({});
  }, [dominioData, tiposDominio]);

  // Setear automáticamente el gobernanzaId cuando el dominio tenga un valor
  useEffect(() => {
    if (dominioData?.gobernanzaId && dominioData.gobernanzaId !== null && dominioData.gobernanzaId > 0) {
      setFormData(prev => ({
        ...prev,
        gobernanzaId: dominioData.gobernanzaId,
        tieneGobernanzaPropia: true
      }));
    }
  }, [dominioData?.gobernanzaId]);

  // Función auxiliar para mapear el enum de tipo a ID
  const getTipoDominioIdFromEnum = (tipoEnum?: string): number => {
    if (!tipoEnum) return 0;
    
    // Buscar en los tipos de dominio cargados
    const tipoEncontrado = tiposDominio.find(tipo => 
      tipo.tipoDominioCodigo?.toLowerCase() === tipoEnum.toLowerCase() ||
      tipo.tipoDominioNombre?.toLowerCase().includes(tipoEnum.toLowerCase())
    );
    
    return tipoEncontrado?.tipoDominioId || 0;
  };

  // Validación del formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.nombreDominio.trim()) {
      newErrors.nombreDominio = 'El nombre es requerido';
    } else if (formData.nombreDominio.trim().length < 3) {
      newErrors.nombreDominio = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombreDominio.trim().length > 100) {
      newErrors.nombreDominio = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar código
    if (!formData.codigoDominio.trim()) {
      newErrors.codigoDominio = 'El código es requerido';
    } else if (formData.codigoDominio.trim().length < 2) {
      newErrors.codigoDominio = 'El código debe tener al menos 2 caracteres';
    } else if (formData.codigoDominio.trim().length > 20) {
      newErrors.codigoDominio = 'El código no puede exceder 20 caracteres';
    }

    // Validar descripción
    if (!formData.descripcionDominio.trim()) {
      newErrors.descripcionDominio = 'La descripción es requerida';
    } else if (formData.descripcionDominio.trim().length < 10) {
      newErrors.descripcionDominio = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.descripcionDominio.trim().length > 500) {
      newErrors.descripcionDominio = 'La descripción no puede exceder 500 caracteres';
    }

    // Validar tipo de dominio
    if (!formData.tipoDominioId || formData.tipoDominioId === 0) {
      newErrors.tipoDominioId = 'Debe seleccionar un tipo de dominio';
    }

    // Validar gobernanza si aplica
    if (formData.tieneGobernanzaPropia) {
      if (!formData.gobernanzaId || formData.gobernanzaId <= 0) {
        newErrors.gobernanzaId = 'Debe seleccionar un gobierno';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Manejar cambios en los campos del formulario
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Notificar cambio de gobernanzaId si se proporciona el callback
    if (field === 'gobernanzaId' && onGobernanzaChange && value && value > 0) {
      onGobernanzaChange(value);
    }
  }, [errors, onGobernanzaChange]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || disabled) return;
    
    if (!validateForm()) {
      AlertService.error('Por favor, corrija los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const organizacionId = getOrganizationId();
      
      const submitData = isEditing
        ? {
            dominioId: dominioData!.dominioId,
            nombreDominio: formData.nombreDominio,
            codigoDominio: formData.codigoDominio,
            descripcionDominio: formData.descripcionDominio,
            tipoDominioId: formData.tipoDominioId,
            organizacionId,
            gobernanzaId: formData.tieneGobernanzaPropia ? formData.gobernanzaId : undefined,
            tieneGobernanzaPropia: formData.tieneGobernanzaPropia
          } as UpdateDominioDataFormDto
        : {
            nombreDominio: formData.nombreDominio,
            codigoDominio: formData.codigoDominio,
            descripcionDominio: formData.descripcionDominio,
            tipoDominioId: formData.tipoDominioId,
            organizacionId,
            gobernanzaId: formData.tieneGobernanzaPropia ? formData.gobernanzaId : undefined,
            tieneGobernanzaPropia: formData.tieneGobernanzaPropia
          } as CreateDominioDataFormDto;

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error en envío del formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, disabled, validateForm, isEditing, dominioData, formData, onSubmit]);

  // Opciones para el select de tipos de dominio
  const tiposDominioOptions = useMemo(() => {
    return tiposDominio.map(tipo => ({
      value: tipo.tipoDominioId,
      label: tipo.tipoDominioNombre
    }));
  }, [tiposDominio]);

  return (
    <div className={styles.formContainer}>
      <form data-form="dominio-data" onSubmit={handleSubmit} style={{ margin: 0, padding: 0 }}>
        {/* Cabecera del formulario */}
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>{isEditing ? 'Editar Dominio de Datos' : 'Nuevo Dominio de Datos'}</h3>
          <p className={styles.formSubtitle}>
            {isEditing ? 'Actualiza la información del dominio de datos seleccionado' : 'Completa los datos para crear un nuevo dominio de datos'}
          </p>
        </div>
        {/* Campos del formulario */}
        <div className={styles.formSection}>
          
          <div className={styles.twoColumnSection}>
            {/* Tipo de Dominio (antes estaba debajo) */}
            <div className={styles.fieldGroup}>
              <Label htmlFor="tipoDominioId">Tipo de Dominio *</Label>
              <Select
                value={formData.tipoDominioId && formData.tipoDominioId > 0 ? formData.tipoDominioId.toString() : undefined}
                onValueChange={(value) => handleFieldChange('tipoDominioId', value ? parseInt(value) : 0)}
                disabled={disabled || isSubmitting || loadingTipos}
              >
                <SelectTrigger icon="Database">
                  <SelectValue placeholder="Seleccione tipo de dominio" />
                </SelectTrigger>
                <SelectContent>
                  {tiposDominioOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoDominioId && (
                <span className={styles.error}>{errors.tipoDominioId}</span>
              )}
            </div>
            
            {/* Código (se mantiene a la derecha) */}
            <div className={styles.fieldGroup}>
              <Label htmlFor="codigoDominio">Código *</Label>
              <Input
                id="codigoDominio"
                value={formData.codigoDominio}
                onChange={(e) => handleFieldChange('codigoDominio', e.target.value.toUpperCase())}
                error={errors.codigoDominio}
                disabled={disabled || isSubmitting}
                placeholder="Ej: DOM_VENTAS"
                maxLength={20}
                icon="Code"
              />
            </div>
          </div>

          {/* Nombre (movido debajo de la fila superior) */}
          <div className={styles.fieldGroup}>
            <Label htmlFor="nombreDominio">Nombre *</Label>
            <Input
              id="nombreDominio"
              value={formData.nombreDominio}
              onChange={(e) => handleFieldChange('nombreDominio', e.target.value)}
              error={errors.nombreDominio}
              disabled={disabled || isSubmitting}
              placeholder="Ingrese el nombre del dominio"
              maxLength={100}
              icon="FileText"
            />
            {errors.nombreDominio && (
              <span className={styles.error}>{errors.nombreDominio}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="descripcionDominio">Descripción *</Label>
            <Textarea
              id="descripcionDominio"
              value={formData.descripcionDominio}
              onChange={(e) => handleFieldChange('descripcionDominio', e.target.value)}
              error={errors.descripcionDominio}
              disabled={disabled || isSubmitting}
              placeholder="Describa el propósito y alcance del dominio de datos"
              maxLength={500}
              rows={3}
              icon="AlignLeft"
            />
          </div>

          {/* Sección de Gobernanza */}
          <div className={styles.fieldGroup}>
            <Label htmlFor="gobernanzaId">Gobierno {formData.tieneGobernanzaPropia ? '*' : ''}</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="tieneGobernanzaPropia"
                  type="checkbox"
                  checked={!!formData.tieneGobernanzaPropia}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    handleFieldChange('tieneGobernanzaPropia', checked);
                    if (!checked) {
                      handleFieldChange('gobernanzaId', 0);
                      if (errors.gobernanzaId) {
                        setErrors(prev => ({ ...prev, gobernanzaId: undefined }));
                      }
                    }
                  }}
                  disabled={disabled || isSubmitting}
                />
                <Label htmlFor="tieneGobernanzaPropia">Este dominio tiene gobierno propio</Label>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <SelectWrapper
                    value={formData.gobernanzaId && formData.gobernanzaId > 0 ? formData.gobernanzaId.toString() : undefined}
                    onValueChange={(value) => handleFieldChange('gobernanzaId', value ? parseInt(value) : 0)}
                    disabled={disabled || isSubmitting || loadingGobernanzas || !formData.tieneGobernanzaPropia}
                    searchable
                    searchPlaceholder="Buscar gobierno..."
                    icon="Shield"
                    placeholder={loadingGobernanzas ? "Cargando gobiernos..." : (formData.tieneGobernanzaPropia ? "Seleccione un gobierno" : "Gobierno no requerido")}
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
                      // Crear un objeto dominio temporal con los datos del formulario si no existe
                      const dominioToPass = dominioData || {
                        dominioId: 0,
                        nombreDominio: formData.nombreDominio || '',
                        gobernanzaId: formData.gobernanzaId
                      } as DominioData;
                      // Usar la gobernanza ya cargada en el formulario (ver console.log en ~línea 199)
                      const selectedGov = gobernanzasDisponibles.find((g) => g.gobernanzaId === formData.gobernanzaId);
                      onGovernance(dominioToPass, selectedGov);
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
            </div>
            {errors.gobernanzaId && (
              <span className={styles.error}>{errors.gobernanzaId}</span>
            )}
          </div>
        </div>

        {/* Los botones de acción se han eliminado para usar solo los del footer del modal */}
      </form>
    </div>
  );
};

export default FormDominioData;