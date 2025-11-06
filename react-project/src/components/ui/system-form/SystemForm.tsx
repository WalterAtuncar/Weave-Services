import React, { useState, useEffect, forwardRef } from 'react';
import { AlertTriangle, Database, CheckCircle, Circle, Shield } from 'lucide-react';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { SearchableSelect } from '../searchable-select/SearchableSelect';
import { StatusBadge } from '../status-badge/StatusBadge';
import { SystemTypeIcon } from '../system-type-icon/SystemTypeIcon';
import { HierarchyIndicator } from '../hierarchy-indicator/HierarchyIndicator';
import { ChipGroup, ChipItem } from '../chip';
import { Label } from '../label';

import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Sistema, 
  CreateSistemaDto, 
  UpdateSistemaDto,
  FamiliaSistema,
  EstadoSistema,
  getEstadoSistemaOptions,
  getEstadoSistemaLabel
} from '../../../models/Sistemas';
import { 
  getServidorIcon} from '../../../models/Servidores';
import { useSystemFormData } from '../../../hooks/useSystemFormData';
import { sistemaServidorService } from '../../../services/sistema-servidor.service';
import { gobernanzaService } from '../../../services/gobernanza.service';
import { tipoEntidadService } from '../../../services/tipo-entidad.service';
import { Gobernanza, GobernanzaDto } from '../../../services/types/gobernanza.types';
import { TipoEntidad } from '../../../services/types/tipo-entidad.types';
import { TipoEntidadAsociacion } from '../../../services/types/gobernanza-entidad.types';
import { 
  validateCreateSistema, 
  validateUpdateSistema,
  validateNombreSistema,
  validateCodigoSistema,
  validateFuncionPrincipal,
  validateSistemaDepende,
  FieldValidationResult,
  sanitizeCodigoSistema
} from '../../../utils/sistemasValidation';
import styles from './SystemForm.module.css';

export interface SystemFormProps {
  /** Sistema a editar (null para crear nuevo) */
  sistema?: Sistema | null;
  /** Función llamada al enviar el formulario válido */
  onSubmit: (data: CreateSistemaDto | UpdateSistemaDto) => Promise<void>;
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
  /** Función llamada para ver la gobernanza del sistema */
  onGovernance?: (sistema: Sistema) => void;
}

interface FormData {
  nombreSistema: string;
  codigoSistema: string;
  funcionPrincipal: string;
  tipoSistema: number; // Ahora usa ID dinámico del backend
  familiaSistema: number; // Ahora usa ID dinámico del backend
  sistemaDepende?: number;
  estado: EstadoSistema;
  servidorIds: number[]; // Cambiado de servidorId a servidorIds para múltiples servidores
  tieneGobernanzaPropia: boolean; // Nueva propiedad para indicar si el sistema tiene gobernanza propia
  gobernanzaId?: number; // ID del gobierno asociado al sistema
}

interface FormErrors {
  nombreSistema?: string;
  codigoSistema?: string;
  funcionPrincipal?: string;
  sistemaDepende?: string;
  servidorIds?: string;
  gobernanzaId?: string;
  general?: string[];
}

export const SystemForm = forwardRef<HTMLFormElement, SystemFormProps>((
  {
    sistema = null,
    onSubmit,
    onCancel,
    isLoading = false,
    disabled = false,
    showActions = true,
    compact = false,
    organizacionId,
    onGovernance
  },
  ref
) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();
  const finalOrganizacionId = organizacionId ?? organizationInfo?.id ?? 1; // Usar prop o fallback de contexto de forma segura
  const isEditing = !!sistema;

  // Hook combinado que carga todos los datos en paralelo
  const { 
    data: {
      tiposSistemaActivos,
      familiasSistemaActivas,
      servidoresActivos,
      sistemasActivos
    }, 
    loading: loadingFormData, 
    error: errorFormData,
    isReady: formDataReady
  } = useSystemFormData();

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>(() => {
    // Función de inicialización para asegurar valores válidos
    const initializeFormData = (): FormData => {
      const defaultData = {
        nombreSistema: sistema?.nombreSistema || '',
        codigoSistema: sistema?.codigoSistema || '',
        funcionPrincipal: sistema?.funcionPrincipal || '',
        tipoSistema: 1, // ✅ VALOR POR DEFECTO: 1 (INTERNO)
        familiaSistema: 1, // ✅ VALOR POR DEFECTO: 1 (ERP)
        sistemaDepende: sistema?.sistemaDepende || undefined,
        estado: sistema?.estado ?? EstadoSistema.Activo, // ✅ CORREGIDO: Usar el estado del sistema si existe
        servidorIds: [], // Inicializar con array vacío - se cargará desde el backend
        tieneGobernanzaPropia: Boolean(sistema?.tieneGobernanzaPropia), // ✅ CORREGIDO: Convertir explícitamente a boolean
        gobernanzaId: sistema?.gobernanzaId || undefined // ID del gobierno asociado
      };

      // Si hay un sistema existente, usar sus valores
      if (sistema) {
        defaultData.tipoSistema = (sistema.tipoSistema !== undefined && sistema.tipoSistema !== null) ? sistema.tipoSistema : 1;
        defaultData.familiaSistema = (sistema.familiaSistema !== undefined && sistema.familiaSistema !== null) ? sistema.familiaSistema : 1;
        // ✅ CORREGIDO: No sobrescribir el estado si ya está establecido
        // defaultData.estado = (sistema.estado !== undefined && sistema.estado !== null) ? sistema.estado : EstadoSistema.Activo;
      }


      return defaultData;
    };
    
    return initializeFormData();
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sistemas padres posibles
  const [sistemasPadres, setSistemasPadres] = useState<Sistema[]>([]);

  // Estados para gobernanza
  const [tiposEntidad, setTiposEntidad] = useState<TipoEntidad[]>([]);
  const [gobernanzasDisponibles, setGobernanzasDisponibles] = useState<GobernanzaDto[]>([]);
  const [loadingGobernanzas, setLoadingGobernanzas] = useState(false);

  // Monitor de cambios en gobernanzasDisponibles
  useEffect(() => {
    console.log('📊 [SystemForm] Estado gobernanzasDisponibles cambió:', {
      length: gobernanzasDisponibles.length,
      gobernanzas: gobernanzasDisponibles
    });
  }, [gobernanzasDisponibles]);

  // Cargar servidores del sistema cuando esté en modo edición
  useEffect(() => {
    const loadSistemaServidores = async () => {
      if (sistema?.sistemaId && formDataReady) {
        try {
          const servidoresResponse = await sistemaServidorService.getServidoresBySistema(sistema.sistemaId);
          
          if (servidoresResponse.success && servidoresResponse.data) {
            const servidoresIds = servidoresResponse.data.map(ss => ss.servidorId);
            setFormData(prev => ({
              ...prev,
              servidorIds: servidoresIds
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              servidorIds: []
            }));
          }
        } catch (error) {
          setFormData(prev => ({
            ...prev,
            servidorIds: []
          }));
        }
      }
    };

    loadSistemaServidores();
  }, [sistema?.sistemaId, formDataReady]);

  // Actualizar formData cuando el sistema cambie (especialmente útil cuando se pasa después de la inicialización)
  useEffect(() => {
    if (sistema) {
      setFormData(prev => ({
        ...prev,
        nombreSistema: sistema.nombreSistema || '',
        codigoSistema: sistema.codigoSistema || '',
        funcionPrincipal: sistema.funcionPrincipal || '',
        tipoSistema: (sistema.tipoSistema !== undefined && sistema.tipoSistema !== null) ? sistema.tipoSistema : 1, // 1 es típicamente el primer tipo válido
        familiaSistema: (sistema.familiaSistema !== undefined && sistema.familiaSistema !== null) ? sistema.familiaSistema : FamiliaSistema.ERP,
        sistemaDepende: sistema.sistemaDepende || undefined,
        estado: (sistema.estado !== undefined && sistema.estado !== null) ? sistema.estado : EstadoSistema.Activo,
        tieneGobernanzaPropia: Boolean(sistema.tieneGobernanzaPropia), // ✅ CORREGIDO: Convertir explícitamente a boolean
        gobernanzaId: sistema.gobernanzaId || undefined // ✅ AGREGADO: Actualizar también el gobernanzaId
        // No resetear servidorIds aquí, se cargan en el useEffect anterior
      }));
    }
  }, [sistema?.sistemaId, sistema?.version]); // Solo cuando cambie el ID o versión del sistema

   // Cargar sistemas padres desde el backend cuando los datos estén listos
   useEffect(() => {
     try {
       // Poblar siempre que haya lista de sistemasActivos; evitar dependencia de formDataReady
       const lista = (sistemasActivos || []).filter((s: Sistema) =>
         s && s.estado === EstadoSistema.Activo && (!sistema || s.sistemaId !== sistema.sistemaId)
       );
       setSistemasPadres(lista);
       // Strategic log: options of select dependency populated
       console.log('📚 [SystemForm] Opciones de "Sistema del que Depende" pobladas', {
         totalOpciones: lista.length,
         ejemplos: lista.slice(0, 3).map(x => ({ id: x.sistemaId, nombre: x.nombreSistema }))
       });
     } catch (error: any) {
       console.error('Error procesando sistemas padres:', error);
       setSistemasPadres([]);
     }
   }, [sistemasActivos, sistema?.sistemaId]);

  // Cargar tipos de entidad
  useEffect(() => {
    const loadTiposEntidad = async () => {
      try {
        const response = await tipoEntidadService.getAllTiposEntidad({ includeDeleted: false });
        if (response.success && response.data) {
          setTiposEntidad(response.data.filter(tipo => tipo.estado === 1)); // Solo activos
        }
      } catch (error) {
        console.error('Error cargando tipos de entidad:', error);
      }
    };

    loadTiposEntidad();
  }, []);

  // Setear automáticamente el gobernanzaId cuando el sistema tenga un valor
  useEffect(() => {
    if (sistema?.gobernanzaId && sistema.gobernanzaId !== null) {
      setFormData(prev => ({
        ...prev,
        gobernanzaId: sistema.gobernanzaId
      }));
    }
  }, [sistema?.gobernanzaId]);

  // Cargar gobiernos filtrados por tipo de entidad del sistema
  useEffect(() => {
    // Solo ejecutar cuando organizationInfo?.id esté definido para evitar múltiples llamadas
    if (!organizationInfo?.id && !organizacionId) return;
    
    const loadGobernanzas = async () => {
      setLoadingGobernanzas(true);
      try {
        const organizationId = finalOrganizacionId ?? 0;
        if (!organizationId) {
          // No organization ID found; proceeding with default 0
        }
        
        // 🔧 CORRECCIÓN: Filtrar gobernanzas por tipo de entidad "Sistema" (ID = 1)
        const response = await gobernanzaService.buscarGobernanzasConRoles({
          organizacionId: organizationId,
          tipoEntidadId: TipoEntidadAsociacion.SISTEMA, // Filtrar por tipo de entidad Sistema
          soloActivos: true
        });
        
        if (response.success && response.data) {
          console.log('🔍 [SystemForm] Datos RAW del backend:', {
            success: response.success,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data),
            dataLength: response.data?.length,
            firstItem: response.data?.[0],
            allData: response.data
          });
          
          // 🔧 Mapear correctamente para el select con gobernanzaId y nombre
          const gobernanzasActivas = response.data
            .filter(gov => {
              console.log('🔍 [SystemForm] Filtrando gobierno:', gov);
              console.log('🔍 [SystemForm] Propiedades del gobierno:', Object.keys(gov));
              console.log('🔍 [SystemForm] Estado del gobierno:', { estado: gov.estado, Estado: gov.Estado, registroEliminado: gov.registroEliminado });
              // Temporalmente aceptar todas las gobernanzas para debug
              return gov && !gov.registroEliminado;
            })
            .map(gov => {
              console.log('🔍 [SystemForm] Mapeando gobierno:', gov);
              return {
                gobernanzaId: gov.gobernanzaId || gov.GobernanzaId,
                gobernanzaNombre: gov.nombre || gov.Nombre || `Gobernanza ${gov.gobernanzaId || gov.GobernanzaId}`,
                gobernanzaCodigo: (gov.gobernanzaId || gov.GobernanzaId)?.toString(),
                tipoGobiernoNombre: gov.tipoGobierno?.nombre || gov.TipoGobierno?.Nombre || 'Sin tipo',
                estado: gov.estado || gov.Estado,
                nombre: gov.nombre || gov.Nombre
              };
            });
          
          console.log('✅ [SystemForm] Gobernanzas procesadas:', {
            total: gobernanzasActivas.length,
            tipoEntidadId: TipoEntidadAsociacion.SISTEMA,
            organizacionId,
            gobernanzas: gobernanzasActivas
          });
          
          console.log('🔄 [SystemForm] Actualizando estado gobernanzasDisponibles:', gobernanzasActivas);
          setGobernanzasDisponibles(gobernanzasActivas);
          
          // Log adicional para verificar el estado después de la actualización
          setTimeout(() => {
            console.log('⏰ [SystemForm] Estado gobernanzasDisponibles después de actualización:', gobernanzasDisponibles);
          }, 100);
        }
      } catch (error) {
        console.error('❌ [SystemForm] Error cargando gobernanzas filtradas por tipo entidad:', error);
      } finally {
        setLoadingGobernanzas(false);
      }
    };
    loadGobernanzas();
  }, [finalOrganizacionId, gobernanzaService]);

  // Funciones de validación en tiempo real
  const validateField = (field: keyof FormData, value: any): FieldValidationResult => {
    switch (field) {
      case 'nombreSistema':
        return validateNombreSistema(value, sistema?.sistemaId, sistemasActivos);
      case 'codigoSistema':
        return validateCodigoSistema(value, sistema?.sistemaId, sistemasActivos);
      case 'funcionPrincipal':
        return validateFuncionPrincipal(value);
             case 'sistemaDepende':
         return validateSistemaDepende(sistema?.sistemaId, value, finalOrganizacionId, sistemasActivos);
      case 'servidorIds':
        // Validación opcional de servidores
        return { isValid: true };
      case 'gobernanzaId':
        // Validación opcional de gobierno - solo requerido si tieneGobernanzaPropia es false
        if (!formData.tieneGobernanzaPropia && !value) {
          return { isValid: false, error: 'Debe seleccionar un gobierno si el sistema no tiene gobernanza propia' };
        }
        return { isValid: true };
      default:
        return { isValid: true };
    }
  };

  // Manejar cambios en los campos
  const handleFieldChange = (field: keyof FormData, value: any) => {
    // Strategic logs for dependency field
    if (field === 'sistemaDepende') {
      const prevValue = formData.sistemaDepende ?? null;
      console.log('🧩 [SystemForm] Cambio en "Sistema del que Depende"', {
        previo: prevValue,
        nuevo: value ?? null,
      });
    }
    
    // Log para gobernanzaId
    if (field === 'gobernanzaId') {
      const prevValue = formData.gobernanzaId ?? null;
      console.log('🏛️ [SystemForm] Cambio en "gobernanzaId"', {
        previo: prevValue,
        nuevo: value ?? null,
        formDataActual: formData
      });
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched.has(field)) {
      const validation = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: validation.isValid ? undefined : validation.error
      }));
    }
  };

  // Manejar cuando un campo pierde el foco
  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => new Set(prev).add(field));
    const validation = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? undefined : validation.error
    }));
  };

  // Función para mapear los datos del formulario a los tipos de request de la API
  const mapFormDataToApiRequest = (data: FormData, isUpdate: boolean = false): any => {
    // MAPEO CORRECTO PARA ENVIAR AL SystemModal (no a la API directamente)
    const baseRequest = {
      organizacionId: finalOrganizacionId,                           // ✅ SWAGGER: organizacionId (required, int64)
      codigoSistema: data.codigoSistema || undefined,          // ✅ SWAGGER: codigoSistema (optional, string, maxLength: 50)
      nombreSistema: data.nombreSistema,                        // ✅ SWAGGER: nombreSistema (required, string, minLength: 3, maxLength: 200)
      funcionPrincipal: data.funcionPrincipal || undefined,     // ✅ SWAGGER: funcionPrincipal (optional, string, maxLength: 500)
      sistemaDepende: data.sistemaDepende || undefined,         // ✅ SWAGGER: sistemaDepende (optional, int64)
      tipoSistema: data.tipoSistema,                           // ✅ CORREGIDO: Usar tipoSistema para el DTO
      familiaSistema: data.familiaSistema,                     // ✅ CORREGIDO: Usar familiaSistema para el DTO
      estado: data.estado,                                     // ✅ SWAGGER: estado (required, int)
      servidorIds: data.servidorIds || [],                     // ✅ SWAGGER: servidorIds (optional, array)
      tieneGobernanzaPropia: data.tieneGobernanzaPropia,       // ✅ NUEVA: tieneGobernanzaPropia (boolean)
      gobernanzaId: data.gobernanzaId || undefined             // ✅ NUEVA: gobernanzaId (optional, int64)
    };

    if (isUpdate && sistema) {
      // PARA UPDATE: agregar sistemaId y las listas de servidores
      return {
        sistemaId: sistema.sistemaId,     // ✅ SWAGGER: sistemaId (required, int64)
        version: sistema.version,         // ✅ SWAGGER: version (required, int)
        ...baseRequest,
        servidoresToDelete: [], // Se calculará en el backend
        servidoresToInsert: data.servidorIds || []
      };
    } else {
      // PARA CREATE: usar tal como está
      return baseRequest;
    }
  };

  // Validar formulario completo
  const validateForm = (): boolean => {
    // Validar que en modo edición tengamos el sistema
    if (isEditing && !sistema) {
      console.error('Error: Modo edición pero no hay sistema disponible');
      setErrors(prev => ({
        ...prev,
        general: ['Error interno: No se puede actualizar sin datos del sistema']
      }));
      return false;
    }

    const dto = isEditing 
      ? {
          sistemaId: sistema!.sistemaId,
          version: sistema!.version,
          organizacionId: finalOrganizacionId,
          nombreSistema: formData.nombreSistema.trim(),
          codigoSistema: formData.codigoSistema.trim() || undefined,
          funcionPrincipal: formData.funcionPrincipal.trim() || undefined,
          tipoSistema: formData.tipoSistema,
          familiaSistema: formData.familiaSistema,
          estado: formData.estado,
          sistemaDepende: formData.sistemaDepende,
          servidorIds: formData.servidorIds,
          tieneGobernanzaPropia: formData.tieneGobernanzaPropia,
          gobernanzaId: formData.gobernanzaId
        } as UpdateSistemaDto
      : {
          organizacionId: finalOrganizacionId,
          nombreSistema: formData.nombreSistema.trim(),
          codigoSistema: formData.codigoSistema.trim() || undefined,
          funcionPrincipal: formData.funcionPrincipal.trim() || undefined,
          tipoSistema: formData.tipoSistema,
          familiaSistema: formData.familiaSistema,
          estado: formData.estado,
          sistemaDepende: formData.sistemaDepende,
          servidorIds: formData.servidorIds,
          tieneGobernanzaPropia: formData.tieneGobernanzaPropia,
          gobernanzaId: formData.gobernanzaId
        } as CreateSistemaDto;

    const validation = isEditing 
      ? validateUpdateSistema(dto as UpdateSistemaDto, sistemasActivos)
      : validateCreateSistema(dto as CreateSistemaDto, sistemasActivos);

    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        general: validation.errors
      }));
      return false;
    }

    setErrors({});
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading || disabled) {
      return;
    }

    // Marcar todos los campos como tocados para mostrar errores
    setTouched(new Set(Object.keys(formData)));

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para la API
      const cleanedFormData = {
        ...formData,
        nombreSistema: formData.nombreSistema.trim(),
        codigoSistema: formData.codigoSistema.trim(),
        funcionPrincipal: formData.funcionPrincipal.trim()
      };

      // Crear el request apropiado para enviar al padre (SystemModal)
      const request = mapFormDataToApiRequest(cleanedFormData, isEditing);
      
      // Log del payload completo antes de enviar
      console.log('📤 [SystemForm] Payload completo a enviar:', {
        isEditing,
        formData: cleanedFormData,
        request,
        gobernanzaIdEnFormData: cleanedFormData.gobernanzaId,
        gobernanzaIdEnRequest: request.gobernanzaId
      });
      
      // Llamar al onSubmit del padre (SystemModal) que manejará toda la lógica CRUD
      await onSubmit(request);
    } catch (error: any) {
      console.error('❌ Error en envío del formulario:', error);
      // El error se maneja en el SystemModal, no aquí
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convertir servidores activos a formato ChipItem
  const getServidorChips = (): ChipItem[] => {
    return servidoresActivos.map(servidor => ({
      id: servidor.servidorId,
      label: servidor.nombreServidor,
      description: servidor.direccionIP || undefined,
      type: 'server' as const,
      color: undefined // No usar colores específicos para apariencia empresarial
    }));
  };

  // Obtener chips seleccionados
  const getSelectedServidorChips = (): ChipItem[] => {
    return getServidorChips().filter(chip => 
      formData.servidorIds.includes(chip.id as number)
    );
  };

  // Manejar selección/deselección de servidores
  const handleServidorSelection = (servidorId: string | number) => {
    const id = Number(servidorId);
    setFormData(prev => ({
      ...prev,
      servidorIds: prev.servidorIds.includes(id)
        ? prev.servidorIds.filter(sId => sId !== id)
        : [...prev.servidorIds, id]
    }));
  };

  // Manejar remoción de servidor
  const handleServidorRemove = (servidorId: string | number) => {
    const id = Number(servidorId);
    setFormData(prev => ({
      ...prev,
      servidorIds: prev.servidorIds.filter(sId => sId !== id)
    }));
  };

  // Renderizar preview del sistema padre
  const renderSistemaPadre = () => {
    if (!formData.sistemaDepende) return null;

         // Buscar el sistema padre en la lista de todos los sistemas
     const sistemaPadre = sistemasActivos?.find((s: Sistema) => s.sistemaId === formData.sistemaDepende);
    if (!sistemaPadre) return null;

    return (
      <div className={styles.sistemaPadrePreview}>
        <HierarchyIndicator type="child" showLabel />
        <div className={styles.sistemaInfo}>
          <SystemTypeIcon familia={sistemaPadre.familiaSistema} size={16} />
          <span className={styles.sistemaNombre}>{sistemaPadre.nombreSistema}</span>
                     <StatusBadge 
             variant={sistemaPadre.estado === EstadoSistema.Activo ? 'filled' : 'outline'} 
             size="s" 
             status={sistemaPadre.estado === EstadoSistema.Activo ? 'active' : 'inactive'}
             label={getEstadoSistemaLabel(sistemaPadre.estado)}
           />
        </div>
      </div>
    );
  };

  // Mostrar loading mientras cargan los datos
  if (loadingFormData) {
    return (
      <div className={`${styles.systemForm} ${compact ? styles.compact : ''}`} style={{ backgroundColor: colors.surface }}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>
            <Database size={24} />
            <span>Cargando datos del formulario...</span>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problemas cargando los datos
  if (errorFormData) {
    return (
      <div className={`${styles.systemForm} ${compact ? styles.compact : ''}`} style={{ backgroundColor: colors.surface }}>
        <div className={styles.errorContainer} style={{ borderColor: '#EF4444' }}>
          <AlertTriangle size={16} color="#EF4444" />
          <div className={styles.errorsListContainer}>
            <strong>Error cargando datos del formulario:</strong>
            <p>{errorFormData}</p>
          </div>
        </div>
        {showActions && (
          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              iconName="X"
              iconPosition="left"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Solo mostrar el formulario cuando todos los datos estén listos
  if (!formDataReady) {
    return (
      <div className={`${styles.systemForm} ${compact ? styles.compact : ''}`} style={{ backgroundColor: colors.surface }}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>
            <Database size={24} />
            <span>Preparando formulario...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form 
      ref={ref}
      onSubmit={handleSubmit} 
      className={`${styles.systemForm} ${compact ? styles.compact : ''}`}
      style={{ backgroundColor: colors.surface }}
    >
      {/* Errores generales */}
      {errors.general && errors.general.length > 0 && (
        <div className={styles.errorContainer} style={{ borderColor: '#EF4444' }}>
          <AlertTriangle size={16} color="#EF4444" />
          <div className={styles.errorsListContainer}>
            <strong>Se encontraron los siguientes errores:</strong>
            <ul className={styles.errorsList}>
              {errors.general.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sección de Información Básica */}
      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>
          <Database size={20} />
          Información Básica del Sistema
        </div>

                 <div className={styles.fieldsGrid}>
           {/* Nombre del Sistema - Campo requerido */}
           <div className={styles.fieldGroup}>
             <Label>
               Nombre del Sistema
             </Label>
             <Input
               placeholder="Ej: SAP ERP, Salesforce CRM..."
               value={formData.nombreSistema}
               onChange={(e) => handleFieldChange('nombreSistema', e.target.value)}
               onBlur={() => handleBlur('nombreSistema')}
               disabled={disabled || isSubmitting}
               maxLength={100}
             />
             {touched.has('nombreSistema') && errors.nombreSistema && (
               <div className={styles.fieldError}>
                 {errors.nombreSistema}
               </div>
             )}
           </div>

           {/* Código del Sistema - Campo opcional */}
           <div className={styles.fieldGroup}>
             <Label>
               Código del Sistema
             </Label>
             <Input
               placeholder="Ej: SAP-ERP-001"
               value={formData.codigoSistema}
               onChange={(e) => handleFieldChange('codigoSistema', sanitizeCodigoSistema(e.target.value))}
               onBlur={() => handleBlur('codigoSistema')}
               disabled={disabled || isSubmitting}
               maxLength={20}
             />
             {touched.has('codigoSistema') && errors.codigoSistema && (
               <div className={styles.fieldError}>
                 {errors.codigoSistema}
               </div>
             )}
           </div>

           {/* Tipo de Sistema */}
           <div className={styles.fieldGroup}>
             <Label>
               Tipo de Sistema
             </Label>
             <Select 
               value={(formData.tipoSistema ?? 1).toString()} 
               onValueChange={(value) => handleFieldChange('tipoSistema', parseInt(value))}
               disabled={disabled || isSubmitting}
             >
               <SelectTrigger>
                 <SelectValue placeholder="Selecciona el tipo" />
               </SelectTrigger>
               <SelectContent>
                 {!formDataReady ? (
                   <SelectItem value="loading" disabled>
                     <div className={styles.sistemaOption}>
                       <span>Cargando tipos de sistema...</span>
                     </div>
                   </SelectItem>
                 ) : (() => {
                   const todosLosTipos = tiposSistemaActivos || [];
                   
                   // Filtrar y mostrar tipos válidos
                   const tiposFiltrados = todosLosTipos.filter((tipo: any) => 
                     tipo !== null && tipo !== undefined
                   );
                   
                   return tiposFiltrados.map((tipo: any, index: number) => {
                     // Buscar propiedades de ID y nombre en el objeto
                     const id = tipo.id || tipo.tipoSistemaId || tipo.codigo || tipo.tipoId || tipo.key || index;
                     const nombre = tipo.nombre ||
                       tipo.tipoSistemaName ||
                       tipo.descripcion ||
                       tipo.name ||
                       tipo.label ||
                       tipo.titulo ||
                       tipo.texto ||
                       Object.values(tipo).join(' - ') ||
                       `Tipo ${index + 1}`;
                     
                     return (
                       <SelectItem key={id} value={id.toString()}>
                         <div className={styles.sistemaOption}>
                           <SystemTypeIcon familia={formData.familiaSistema} size={16} />
                           {nombre}
                         </div>
                       </SelectItem>
                     );
                  });
                })()}
               </SelectContent>
             </Select>
           </div>

           {/* Familia de Sistema */}
           <div className={styles.fieldGroup}>
             <Label>
               Familia de Sistema
             </Label>
             <Select 
               value={(formData.familiaSistema ?? FamiliaSistema.ERP).toString()} 
               onValueChange={(value) => handleFieldChange('familiaSistema', parseInt(value))}
               disabled={disabled || isSubmitting}
             >
               <SelectTrigger>
                 <SelectValue placeholder="Selecciona la familia" />
               </SelectTrigger>
               <SelectContent>
                 {!formDataReady ? (
                   <SelectItem value="loading" disabled>
                     <span>Cargando familias de sistema...</span>
                   </SelectItem>
                 ) : (() => {
                   const todasLasFamilias = familiasSistemaActivas || [];
                   
                   // Debug props removed
                   // Filtrar y mostrar familias válidas
                   const familiasFiltradas = todasLasFamilias.filter((familia: any) => 
                     familia !== null && familia !== undefined
                   );
                   return familiasFiltradas.map((familia: any, index: number) => {
                     // Buscar propiedades de ID y nombre en el objeto
                     const id = familia.id || familia.familiaSistemaId || familia.codigo || familia.familiaId || familia.key || index;
                     const nombre = familia.nombre || 
                       familia.familiaSistemaName || 
                       familia.descripcion || 
                       familia.name || 
                       familia.label || 
                       familia.titulo || 
                       familia.texto ||
                       Object.values(familia).join(' - ') || 
                       `Familia ${index + 1}`;
                     
                     return (
                       <SelectItem key={id} value={id.toString()}>
                         <div className={styles.sistemaOption}>
                           <SystemTypeIcon familia={id as FamiliaSistema} size={16} />
                           {nombre}
                         </div>
                       </SelectItem>
                     );
                  });
                })()}
               </SelectContent>
             </Select>
           </div>

           {/* Estado - Siempre presente, pero solo visible en modo edición */}
           <div className={styles.fieldGroup} style={{ visibility: isEditing ? 'visible' : 'hidden' }}>
             <Label>
               Estado
             </Label>
             <Select 
               value={(formData.estado ?? EstadoSistema.Activo).toString()} 
               onValueChange={(value) => handleFieldChange('estado', parseInt(value))}
               disabled={true} // ✅ DESHABILITADO: El estado se maneja desde el backend
             >
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {(getEstadoSistemaOptions() || []).filter(option => option && option.value !== undefined).map(option => (
                   <SelectItem key={option.value} value={option.value.toString()}>
                     <div className={styles.estadoOption}>
                       {option.value === EstadoSistema.Activo ? (
                         <>
                           <CheckCircle size={14} className={`${styles.estadoIcon} ${styles.active}`} />
                           <span>{option.label}</span>
                         </>
                       ) : option.value === EstadoSistema.Borrador ? (
                         <>
                           <Circle size={14} className={`${styles.estadoIcon} ${styles.draft}`} />
                           <span>{option.label}</span>
                         </>
                       ) : option.value === EstadoSistema.IniciarFlujo ? (
                         <>
                           <Circle size={14} className={`${styles.estadoIcon} ${styles.pending}`} />
                           <span>{option.label}</span>
                         </>
                       ) : option.value === EstadoSistema.Pendiente ? (
                         <>
                           <Circle size={14} className={`${styles.estadoIcon} ${styles.pending}`} />
                           <span>{option.label}</span>
                         </>
                       ) : option.value === EstadoSistema.Rechazado ? (
                         <>
                           <Circle size={14} className={`${styles.estadoIcon} ${styles.rejected}`} />
                           <span>{option.label}</span>
                         </>
                       ) : (
                         <>
                           <Circle size={14} className={`${styles.estadoIcon} ${styles.inactive}`} />
                           <span>{option.label}</span>
                         </>
                       )}
                     </div>
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

           {/* Gobernanza Propia */}
           <div className={styles.fieldGroup}>
             <div className={styles.checkboxGroup}>
               <input
                 type="checkbox"
                 id="tieneGobernanzaPropia"
                 checked={formData.tieneGobernanzaPropia}
                 onChange={(e) => {
                   handleFieldChange('tieneGobernanzaPropia', e.target.checked);
                   // Nota: Ya no se limpia automáticamente gobernanzaId para permitir flexibilidad
                 }}
                 disabled={disabled || isSubmitting}
                 className={styles.checkbox}
               />
               <Label htmlFor="tieneGobernanzaPropia" className={styles.checkboxLabel}>
                 Tiene Gobernanza Propia
               </Label>
             </div>
           </div>

           {/* Selección de Gobierno - Siempre visible */}
           <div className={styles.fieldGroup}>
             <Label>
               Gobierno <span className={styles.required}>*</span>
             </Label>
             <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
               <div style={{ flex: 1 }}>
                 {(() => {
                    const opciones = gobernanzasDisponibles.map(gobierno => ({
                      value: gobierno.gobernanzaId,
                      label: gobierno.nombre || `Gobierno ${gobierno.gobernanzaId}`
                    }));
                    console.log('[SystemForm] Opciones para SearchableSelect:', opciones);
                    return (
                      <SearchableSelect
                        value={formData.gobernanzaId || null}
                        onChange={(value) => handleFieldChange('gobernanzaId', value ? Number(value) : undefined)}
                        options={opciones}
                        placeholder={loadingGobernanzas ? "Cargando gobiernos..." : (formData.tieneGobernanzaPropia ? "Gobierno propio - Opcional" : "Seleccione un gobierno")}
                        searchPlaceholder="Buscar gobierno..."
                        disabled={disabled || isSubmitting || loadingGobernanzas || formData.tieneGobernanzaPropia}
                        noResultsText="No se encontraron gobiernos"
                      />
                    );
                  })()}
               </div>
               {formData.gobernanzaId && onGovernance && (
                 <Button
                   type="button"
                   variant="default"
                   size="s"
                   onClick={() => {
                     // Crear un objeto sistema temporal con los datos del formulario si no existe
                     const sistemaToPass = sistema || {
                       sistemaId: 0,
                       nombreSistema: formData.nombreSistema || '',
                       gobernanzaId: formData.gobernanzaId,
                       tieneGobernanzaPropia: formData.tieneGobernanzaPropia
                     } as Sistema;
                     onGovernance(sistemaToPass);
                   }}
                   disabled={disabled || isSubmitting}
                   iconName="Shield"
                   iconPosition="left"
                   title="Ver detalles de la gobernanza"
                 >
                   Ver Gobierno
                 </Button>
               )}
             </div>
             {touched.has('gobernanzaId') && errors.gobernanzaId && (
               <div className={styles.fieldError}>
                 {errors.gobernanzaId}
               </div>
             )}
           </div>
         </div>
      </div>

      {/* Secciones de Jerarquía y Servidor en 2 columnas */}
      <div className={styles.twoColumnSection}>
        {/* Sección de Jerarquía */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <HierarchyIndicator type="independent" size="lg" />
            Jerarquía y Dependencias
          </div>

          <div className={styles.fieldGroup}>
            <Label>
              Sistema del que Depende
            </Label>
            <Select 
              value={formData.sistemaDepende?.toString() || 'none'} 
              onValueChange={(value) => handleFieldChange('sistemaDepende', value === 'none' ? undefined : parseInt(value))}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ninguno (sistema independiente)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className={styles.sistemaOption}>
                    <SystemTypeIcon familia={FamiliaSistema.ERP} size={16} />
                    Ninguno (sistema independiente)
                  </div>
                </SelectItem>
                {(sistemasPadres || []).filter(padre => 
                     padre && 
                     (padre.sistemaId !== undefined && padre.sistemaId !== null) && 
                     padre.nombreSistema
                   ).map(padre => (
                     <SelectItem key={padre.sistemaId} value={padre.sistemaId.toString()}>
                       <div className={styles.sistemaOption}>
                         <SystemTypeIcon familia={padre.familiaSistema} size={16} />
                         {padre.nombreSistema}
                         {padre.codigoSistema && (
                           <span className={styles.sistemaCodigo}>
                             {padre.codigoSistema}
                           </span>
                         )}
                       </div>
                     </SelectItem>
                   ))}
                </SelectContent>
            </Select>
            {touched.has('sistemaDepende') && errors.sistemaDepende && (
              <div className={styles.fieldError}>
                {errors.sistemaDepende}
              </div>
            )}
            {renderSistemaPadre()}
          </div>


        </div>

        {/* Sección de Servidores */}
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>
            <Database size={20} />
            Asignación de Servidores
          </div>

          <div className={styles.fieldGroup}>
            <Label>
              Servidores de Despliegue
            </Label>
            
            {/* Servidores seleccionados */}
            <ChipGroup
              chips={getSelectedServidorChips()}
              showServerIcon
              removable
              variant="filled"
              onRemove={handleServidorRemove}
              disabled={disabled || isSubmitting}
              title="Servidores asignados"
            />

            {/* Selector de servidores disponibles */}
            <div className={styles.servidorSelector}>
              <label className={styles.subLabel}>
                Agregar servidor:
              </label>
              <Select 
                value="none"
                onValueChange={(value) => {
                  if (value !== 'none') {
                    handleServidorSelection(parseInt(value));
                  }
                }}
                disabled={disabled || isSubmitting || loadingFormData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servidor para agregar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    <div className={styles.servidorOption}>
                      <span className={styles.servidorIcon}>
                        <Database size={16} />
                      </span>
                      <div className={styles.servidorInfo}>
                        <div className={styles.servidorLinea1}>
                          Selecciona un servidor
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  {!formDataReady ? (
                    <SelectItem value="loading" disabled>
                      Cargando servidores...
                    </SelectItem>
                  ) : (
                  getServidorChips()
                    .filter(chip => !formData.servidorIds.includes(chip.id as number))
                    .map((chip) => (
                      <SelectItem key={chip.id} value={chip.id.toString()}>
                        <div className={styles.servidorOption}>
                          <span className={styles.servidorIcon}>
                            {getServidorIcon(servidoresActivos.find(s => s.servidorId === chip.id)?.tipoServidor || 1)}
                          </span>
                          <div className={styles.servidorInfo}>
                            <div className={styles.servidorLinea1}>
                              {chip.label}
                            </div>
                            {chip.description && (
                              <div className={styles.servidorLinea2}>
                                {chip.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {touched.has('servidorIds') && errors.servidorIds && (
              <div className={styles.fieldError}>
                {errors.servidorIds}
              </div>
            )}
            
            {loadingFormData && (
              <div className={styles.loadingMessage}>
                Cargando servidores disponibles...
              </div>
            )}
            
            {formDataReady && servidoresActivos.length === 0 && (
              <div className={styles.warningMessage}>
                No hay servidores activos disponibles. Puedes crear un servidor desde la sección de Servidores.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Descripción */}
      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>
          <Database size={20} />
          Descripción Funcional
        </div>

        <div className={styles.fieldGroup}>
          <Label>
            Función Principal
          </Label>
          <textarea
            className={styles.textArea}
            placeholder="Describe la función principal de este sistema..."
            value={formData.funcionPrincipal}
            onChange={(e) => handleFieldChange('funcionPrincipal', e.target.value)}
            onBlur={() => handleBlur('funcionPrincipal')}
            disabled={disabled || isSubmitting}
            maxLength={500}
            rows={compact ? 2 : 4}
          />
          {touched.has('funcionPrincipal') && errors.funcionPrincipal && (
            <div className={styles.fieldError}>
              {errors.funcionPrincipal}
            </div>
          )}
          <div className={styles.characterCount}>
            {formData.funcionPrincipal.length}/500 caracteres
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      {showActions && (
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={disabled || isSubmitting}
            iconName="X"
            iconPosition="left"
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            variant="default"
            disabled={disabled || isSubmitting}
            iconName="Save"
            iconPosition="left"
          >
            {isEditing ? 'Actualizar Sistema' : 'Crear Sistema'}
          </Button>
        </div>
      )}
    </form>
  );
});

SystemForm.displayName = 'SystemForm';