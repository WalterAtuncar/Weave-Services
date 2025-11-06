import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Shield, 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Hash,
  Store,
  Tag,
  Mail,
  Phone,
  Globe,
  Settings,
  FileText,
  CalendarDays,
  Target,
  Award,
  AlertCircle,
  Loader2,
  RefreshCw,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input/input';
import { Modal } from '../../ui/modal/Modal';
import { Spinner } from '../../ui/spinner/Spinner';
import { AlertService } from '../../ui/alerts/AlertService';
import { processPaginatedResponse, createEmptyPaginationState } from '../../../utils/paginationUtils';
import { dateToLocalString } from '../../../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { SearchableSelect } from '../../ui/searchable-select/SearchableSelect';

import { Textarea } from '../../ui/textarea/textarea';
import { Checkbox } from '../../ui/checkbox';
import { ImageUpload } from '../../ui/image-upload/ImageUpload';
import { Grid, GridColumn, GridAction } from '../../ui/grid/Grid';
import { FilterModal, FilterControl, FilterValue } from '../../ui/filter/FilterModal';
import { StatusBadge } from '../../ui/status-badge/StatusBadge';
import { GestionFamiliasModal } from '../../ui/gestion-familias-modal/GestionFamiliasModal';

import { organizacionesService } from '../../../services/organizaciones.service';
import { planesSuscripcionService } from '../../../services/planes-suscripcion.service';
import { suscripcionesOrganizacionService } from '../../../services/suscripciones-organizacion.service';
import { ubigeoService } from '../../../services/ubigeo.service';
import {
  OrganizacionDto,
  CreateOrganizacionCommand,
  UpdateOrganizacionCommand,
  EstadoOrganizacion,
  EstadoLicencia,
  TipoDocumento,
  SectorEconomico,
  Industria,
  getSectorEconomicoText,
  getIndustriaText,
  GetOrganizacionesPaginatedRequest
} from '../../../services/types/organizaciones.types';
// Tipo local para paginación compatible con la estructura del componente
interface LocalPagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
import { 
  PlanSuscripcion, 
  PlanSuscripcionDto,
  CreatePlanSuscripcionCommand,
  UpdatePlanSuscripcionCommand,
  EstadoPlan,
  TipoPlan,
  TIPOS_PLAN,
  DeletePlanSuscripcionRequest,
  PlanesSuscripcionPaginatedRequest,
} from '../../../services/types/planes-suscripcion.types';
import { 
  SuscripcionOrganizacionDto,
  CreateSuscripcionOrganizacionCommand,
  UpdateSuscripcionOrganizacionCommand,
  EliminarSuscripcionRequest,
  GetSuscripcionesPaginatedRequest,

  EstadoSuscripcionEnum,
  TipoOperacionSuscripcion,
  ExtenderSuscripcionRequest,
  RenovarSuscripcionRequest
} from '../../../services/types/suscripciones-organizacion.types';
import { UbigeoDto } from '../../../services/types/ubigeo.types';
import styles from './Organizaciones.module.css';

type TabType = 'organizaciones' | 'suscripciones' | 'planes';
type ModalMode = 'view' | 'create' | 'edit' | 'extender' | 'renovar' | null;

interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
  type: TabType;
  data?: any;
}

interface LoadingState {
  organizaciones: boolean;
  suscripciones: boolean;
  planes: boolean;
  saving: boolean;
  deleting: boolean;
}

interface ErrorState {
  organizaciones: string | null;
  suscripciones: string | null;
  planes: string | null;
  general: string | null;
}

interface OrganizacionFormData {
  codigo: string;
  razonSocial: string;
  nombreComercial: string;
  tipoDocumento: number;
  numeroDocumento: string;
  sector: number | null;
  industria: number | null;
  pais: number | null;
  departamento: number | null;
  provincia: number | null;
  distrito: number | null;
  direccion: string;
  telefono: string;
  email: string;
  paginaWeb: string;
  mision: string;
  vision: string;
  valoresCorporativos: string;
  fechaConstitucion: string;
  fechaInicioOperaciones: string;
  logoUrl: string;
  colorPrimario: string;
  colorSecundario: string;
  suscripcionActualId: number | null;
  estadoLicencia: number | null;
  instancia: string;
  dominio: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  callbackPath: string;
}

interface PlanFormData {
  nombrePlan: string;
  descripcion: string;
  limiteUsuarios: number | null;
  duracionDias: number;
  precio: number;
  tipoPlan: string;
  activo: boolean;
  estado: number;
  actualizarSuscripcionesExistentes: boolean;
  notificarCambios: boolean;
  esActualizacionSignificativa: boolean;
}

interface SuscripcionFormData {
  organizacionId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  limiteUsuarios: number;
  esDemo: boolean;
  // Nuevos campos de gestión y trazabilidad
  tipoOperacion: number;
  estadoSuscripcion: number;
  motivoOperacion: string;
}

interface ExtenderSuscripcionFormData {
  suscripcionId: number;
  diasExtension: number;
  motivoOperacion: string;
}

interface RenovarSuscripcionFormData {
  suscripcionId: number;
  nuevoPlanId: number | null;
  motivoOperacion: string;
}

// Usar directamente el tipo del backend
type SuscripcionEnriquecida = SuscripcionOrganizacionDto;

export interface OrganizacionesProps {
  data?: any;
  initialTab?: TabType;
}

// Función helper para extraer el mensaje de error del backend
const extractErrorMessage = (error: any, defaultMessage: string): string => {
  // Si el error tiene response (error HTTP)
  if (error.response?.data) {
    let mainMessage = '';
    let errorDetails = '';
    
    // Obtener el mensaje principal
    if (error.response.data.message) {
      mainMessage = error.response.data.message;
    } else if (error.response.data.title) {
      mainMessage = error.response.data.title;
    } else if (typeof error.response.data === 'string') {
      mainMessage = error.response.data;
    }
    
    // Obtener los errores específicos - usar el primer error
    if (error.response.data.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
      errorDetails = error.response.data.errors[0];
    }
    
    // Combinar mensaje principal y errores específicos
    if (mainMessage && errorDetails) {
      return `${mainMessage}: ${errorDetails}`;
    } else if (errorDetails) {
      return errorDetails;
    } else if (mainMessage) {
      return mainMessage;
    }
  }
  
  // Si el error tiene userMessage (del interceptor)
  if (error.userMessage) {
    return error.userMessage;
  }
  
  // Si es un error JavaScript estándar
  if (error instanceof Error && error.message) {
    return error.message;
  }
  
  // Si tiene mensaje directo
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback al mensaje por defecto
  return defaultMessage;
};

// Función para generar código timestamp automático
const generateTimestampCode = (): string => {
  const now = new Date();
  
  // Obtener componentes de fecha
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  // Formar ddMMyyymmss (10 dígitos)
  const dateTimeBase = `${day}${month}${year}${minutes}${seconds}`;
  
  // Obtener milisegundos y completar hasta 20 dígitos
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  const microtime = Date.now().toString().slice(-3); // Últimos 3 dígitos del timestamp
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  // Combinar para formar exactamente 20 dígitos
  const fullCode = `${dateTimeBase}${milliseconds}${microtime}${randomDigits}`;
  
  // Asegurar que tenga exactamente 20 dígitos
  return fullCode.slice(0, 20);
};

export const Organizaciones: React.FC<OrganizacionesProps> = ({ data, initialTab }) => {
  const { colors, theme } = useTheme();

  // Estados principales de datos
  const [organizaciones, setOrganizaciones] = useState<OrganizacionDto[]>([]);
  const [suscripciones, setSuscripciones] = useState<SuscripcionOrganizacionDto[]>([]);
  const [planes, setPlanes] = useState<PlanSuscripcion[]>([]);
  
  // Estados de catálogos
  const [paises, setPaises] = useState<UbigeoDto[]>([]);
  const [departamentos, setDepartamentos] = useState<UbigeoDto[]>([]);
  const [provincias, setProvincias] = useState<UbigeoDto[]>([]);
  const [distritos, setDistritos] = useState<UbigeoDto[]>([]);

  // Estados de UI
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'organizaciones');
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    mode: null,
    type: 'organizaciones'
  });

  // Estados de loading
  const [loading, setLoading] = useState<LoadingState>({
    organizaciones: false,
    suscripciones: false,
    planes: false,
    saving: false,
    deleting: false
  });

  // Estados de error
  const [errors, setErrors] = useState<ErrorState>({
    organizaciones: null,
    suscripciones: null,
    planes: null,
    general: null
  });

  // Estado para paginación del servidor
  const [organizacionesPaginadas, setOrganizacionesPaginadas] = useState<LocalPagedResult<OrganizacionDto>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Estado del modal de filtros para organizaciones
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValue>({});

  // Estado del modal de filtros para planes
  const [isFilterModalOpenPlanes, setIsFilterModalOpenPlanes] = useState(false);
  const [activeFiltersPlanes, setActiveFiltersPlanes] = useState<FilterValue>({});

  // Estado para paginación del servidor de planes
  const [planesPaginados, setPlanesPaginados] = useState<LocalPagedResult<PlanSuscripcionDto>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Estado del modal de filtros para suscripciones
  const [isFilterModalOpenSuscripciones, setIsFilterModalOpenSuscripciones] = useState(false);
  const [activeFiltersSuscripciones, setActiveFiltersSuscripciones] = useState<FilterValue>({});

  // Estado del modal de gestión de familias de sistemas
  const [isGestionFamiliasModalOpen, setIsGestionFamiliasModalOpen] = useState(false);
  const [selectedOrganizacionForFamilias, setSelectedOrganizacionForFamilias] = useState<OrganizacionDto | null>(null);

  // Estado para paginación del servidor de suscripciones (reutilizando el tipo de organizaciones)
  const [suscripcionesPaginadas, setSuscripcionesPaginadas] = useState<LocalPagedResult<SuscripcionOrganizacionDto>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Estados para manejar pageSize actual de cada Grid
  const [currentPageSizeOrganizaciones, setCurrentPageSizeOrganizaciones] = useState(10);
  const [currentPageSizePlanes, setCurrentPageSizePlanes] = useState(10);
  const [currentPageSizeSuscripciones, setCurrentPageSizeSuscripciones] = useState(10);

  // Estado del formulario
  const [organizacionForm, setOrganizacionForm] = useState<OrganizacionFormData>({
    codigo: '',
    razonSocial: '',
    nombreComercial: '',
    tipoDocumento: TipoDocumento.RUC,
    numeroDocumento: '',
    sector: null,
    industria: null,
    pais: 1, // Perú por defecto
    departamento: null,
    provincia: null,
    distrito: null,
    direccion: '',
    telefono: '',
    email: '',
    paginaWeb: '',
    mision: '',
    vision: '',
    valoresCorporativos: '',
    fechaConstitucion: '',
    fechaInicioOperaciones: '',
    logoUrl: '',
    colorPrimario: '#414976',
    colorSecundario: '#6B7280',
    suscripcionActualId: null,
    estadoLicencia: EstadoLicencia.Activa,
    instancia: '',
    dominio: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    callbackPath: ''
  });

  // Estado del formulario de planes
  const [planForm, setPlanForm] = useState<PlanFormData>({
    nombrePlan: '',
    descripcion: '',
    limiteUsuarios: 1,
    duracionDias: 30,
    precio: 0,
    tipoPlan: TipoPlan.BASICO,
    activo: true,
    estado: EstadoPlan.ACTIVO,
    actualizarSuscripcionesExistentes: false,
    notificarCambios: false,
    esActualizacionSignificativa: false
  });

  // Estado del formulario de suscripciones
  const [suscripcionForm, setSuscripcionForm] = useState<SuscripcionFormData>({
    organizacionId: 0,
    planId: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días después
    limiteUsuarios: 0,
    esDemo: false,
    tipoOperacion: TipoOperacionSuscripcion.NUEVA,
    estadoSuscripcion: EstadoSuscripcionEnum.NUEVA,
    motivoOperacion: ''
  });

  // Estado del formulario de extender suscripción
  const [extenderForm, setExtenderForm] = useState<ExtenderSuscripcionFormData>({
    suscripcionId: 0,
    diasExtension: 30,
    motivoOperacion: ''
  });

  // Estado del formulario de renovar suscripción
  const [renovarForm, setRenovarForm] = useState<RenovarSuscripcionFormData>({
    suscripcionId: 0,
    nuevoPlanId: null,
    motivoOperacion: ''
  });

  // Los datos ya vienen enriquecidos del backend (SuscripcionOrganizacionDto)

  // Funciones de carga de datos
  const loadOrganizacionesPaginadas = useCallback(async (page: number = 1, pageSize: number = 10, searchTerm: string = '', filters: FilterValue = {}) => {
    try {

      setLoading(prev => ({ ...prev, organizaciones: true }));
      setErrors(prev => ({ ...prev, organizaciones: null }));

      const params: GetOrganizacionesPaginatedRequest = {
        Page: page,
        PageSize: pageSize,
        OrderBy: 'fechaCreacion',
        OrderDescending: true
      };

      // Agregar filtros de búsqueda si hay término de búsqueda
      if (searchTerm && searchTerm.trim() !== '') {
        params.RazonSocial = searchTerm.trim();
        params.NombreComercial = searchTerm.trim();
      }

      // Agregar filtros avanzados
      if (filters.razonSocial) {
        params.RazonSocial = filters.razonSocial;
      }
      if (filters.numeroDocumento) {
        params.NumeroDocumento = filters.numeroDocumento;
      }
      if (filters.fechaConstitucionDesde) {
        params.FechaConstitucionDesde = filters.fechaConstitucionDesde;
      }
      if (filters.fechaConstitucionHasta) {
        params.FechaConstitucionHasta = filters.fechaConstitucionHasta;
      }
      if (filters.soloConSuscripcionVigente) {
        params.SoloConSuscripcionVigente = filters.soloConSuscripcionVigente;
      }
      if (filters.soloConSuscripcionPorVencer) {
        params.SoloConSuscripcionPorVencer = filters.soloConSuscripcionPorVencer;
      }

      const response = await organizacionesService.getOrganizacionesPaginated(params as any);
      
      if (response.success && response.data) {
        // Usar el utilitario centralizado para procesar la respuesta
        const adaptedData = processPaginatedResponse<OrganizacionDto>(response.data as any, page, pageSize);
        
        setOrganizacionesPaginadas(adaptedData);
        
        // Mantener compatibilidad con código existente
        setOrganizaciones(adaptedData.items);
        
        // Mostrar alerta informativa solo si es la primera carga o si hay pocas organizaciones
        if (adaptedData.totalCount === 0) {
          AlertService.info('No hay clientes registrados aún', {
            title: 'Lista vacía'
          });
        }
      } else {
        const errorMsg = response.message || 'Error al cargar organizaciones';
        console.error('❌ [ORGANIZACIONES] Error en respuesta:', response);
        setErrors(prev => ({ ...prev, organizaciones: errorMsg }));
        AlertService.error(errorMsg, {
          title: 'Error al cargar clientes'
        });
        
        // Establecer estado de fallback seguro
        setOrganizacionesPaginadas(createEmptyPaginationState<OrganizacionDto>(pageSize));
        setOrganizaciones([]);
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al cargar organizaciones');
      console.error('❌ [ORGANIZACIONES] Error:', errorMessage);
      setErrors(prev => ({ ...prev, organizaciones: errorMessage }));
      AlertService.error(errorMessage, {
        title: 'Error de conexión'
      });
      console.error('Error loading organizaciones:', error);
      
      // Establecer estado de fallback seguro en caso de error
      setOrganizacionesPaginadas(createEmptyPaginationState<OrganizacionDto>(pageSize));
      setOrganizaciones([]);
    } finally {
      setLoading(prev => ({ ...prev, organizaciones: false }));
    }
  }, []);

  // Función wrapper para compatibilidad con código existente
  const loadOrganizaciones = useCallback(async () => {
    await loadOrganizacionesPaginadas(organizacionesPaginadas.pageNumber, organizacionesPaginadas.pageSize, searchTerm, activeFilters);
  }, [loadOrganizacionesPaginadas, organizacionesPaginadas.pageNumber, organizacionesPaginadas.pageSize, searchTerm, activeFilters]);

  const loadSuscripciones = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, suscripciones: true }));
      setErrors(prev => ({ ...prev, suscripciones: null }));

      // Usar getSuscripcionesPaginated para obtener datos completos con información enriquecida
      const response = await suscripcionesOrganizacionService.getSuscripcionesPaginated({
        PageSize: 100, // Obtener hasta 100 suscripciones
        IncludeDeleted: false
      });
      
      if (response.success && response.data?.data) {
        // Debug: Verificar datos originales antes del mapeo
        // Mapear datos del backend con nombres de campos correctos
        const suscripcionesMapeadas = response.data.data.map((item: any, index: number) => {
          const originalDiasRestantes = item.diasRestantes;
          const backendDiasRestantes = (item as any).diasRestantesSuscripcion;
          const originalEstaVigente = item.estaVigente;
          const backendEstaVigente = (item as any).suscripcionVigente;
          
          // Debug: Log para los primeros items
          if (index < 2) {
          }
          
          return {
            ...item,
            // Mapear campos con nombres diferentes del backend
            diasRestantes: originalDiasRestantes ?? backendDiasRestantes ?? 0,
            estaVigente: originalEstaVigente ?? backendEstaVigente ?? false,
            estaPorVencer: item.estaPorVencer ?? false
          };
        });
        
        // Debug: Verificar datos mapeados
        setSuscripciones(suscripcionesMapeadas);
        
        // Verificar suscripciones por vencer (usar datos mapeados)
        const suscripcionesPorVencer = suscripcionesMapeadas.filter((s: any) => {
          return s.estaVigente && s.estaPorVencer && s.diasRestantes <= 7 && s.diasRestantes > 0;
        });
        
        if (suscripcionesPorVencer.length > 0) {
          AlertService.warning(
            `Hay ${suscripcionesPorVencer.length} suscripción(es) que vence(n) en los próximos 7 días`, 
            {
              title: 'Suscripciones por vencer'
            }
          );
        }
      } else {
        const errorMsg = response.message || 'Error al cargar suscripciones';
        setErrors(prev => ({ ...prev, suscripciones: errorMsg }));
        AlertService.error(errorMsg, {
          title: 'Error al cargar suscripciones'
        });
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al cargar suscripciones');
      console.error('❌ [SUSCRIPCIONES] Error:', errorMessage);
      setErrors(prev => ({ ...prev, suscripciones: errorMessage }));
      AlertService.error(errorMessage, {
        title: 'Error de conexión'
      });
      console.error('Error loading suscripciones:', error);
    } finally {
      setLoading(prev => ({ ...prev, suscripciones: false }));
    }
  }, []);

  const loadPlanes = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, planes: true }));
      setErrors(prev => ({ ...prev, planes: null }));

      const response = await planesSuscripcionService.getPlanesSuscripcion();
      
      if (response.success && response.data) {
        setPlanes(response.data);
        
        // Verificar planes inactivos
        const planesInactivos = response.data.filter(p => !p.activo);
        if (planesInactivos.length > 0) {
          AlertService.info(
            `Hay ${planesInactivos.length} plan(es) inactivo(s) que no están disponibles para nuevas suscripciones`, 
            {
              title: 'Planes inactivos'
            }
          );
        }
      } else {
        const errorMsg = response.message || 'Error al cargar planes';
        setErrors(prev => ({ ...prev, planes: errorMsg }));
        AlertService.error(errorMsg, {
          title: 'Error al cargar planes'
        });
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al cargar planes');
      console.error('❌ [PLANES] Error:', errorMessage);
      setErrors(prev => ({ ...prev, planes: errorMessage }));
      AlertService.error(errorMessage, {
        title: 'Error de conexión'
      });
      console.error('Error loading planes:', error);
    } finally {
      setLoading(prev => ({ ...prev, planes: false }));
    }
  }, []);

  // Función para cargar planes con paginación del servidor
  const loadPlanesPaginadas = useCallback(async (page: number = 1, pageSize: number = 10, searchTerm: string = '', filters: FilterValue = {}) => {
    try {
      setLoading(prev => ({ ...prev, planes: true }));
      setErrors(prev => ({ ...prev, planes: null }));

      const params: PlanesSuscripcionPaginatedRequest = {
        Page: page,
        PageSize: pageSize,
        OrderBy: 'fechaCreacion',
        OrderDescending: true
      };

      // Agregar filtros de búsqueda si hay término de búsqueda
      if (searchTerm && searchTerm.trim() !== '') {
        params.NombrePlan = searchTerm.trim();
      }

      // Agregar filtros avanzados
      if (filters.nombrePlan) {
        params.NombrePlan = filters.nombrePlan;
      }
      if (filters.tipoPlan) {
        params.TipoPlan = filters.tipoPlan;
      }
      if (filters.esPlanGratuito !== undefined) {
        params.EsPlanGratuito = filters.esPlanGratuito;
      }
      const response = await planesSuscripcionService.getPlanesPaginated(params);
      if (response.success && response.data) {
        // Usar el utilitario centralizado para procesar la respuesta
        const adaptedData = processPaginatedResponse<PlanSuscripcionDto>(response.data as any, page, pageSize);
        setPlanesPaginados(adaptedData);
      } else {
        const errorMessage = response.message || 'Error al cargar planes paginados';
        console.error('❌ [PLANES] Error en respuesta:', errorMessage);
        setErrors(prev => ({ ...prev, planes: errorMessage }));
        
        // Establecer estado de fallback seguro
        setPlanesPaginados(createEmptyPaginationState<PlanSuscripcionDto>(pageSize));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar planes paginados';
      console.error('💥 [PLANES] Error en loadPlanesPaginadas:', error);
      setErrors(prev => ({ ...prev, planes: errorMessage }));
      
      // Establecer estado de fallback seguro
      setPlanesPaginados(createEmptyPaginationState<PlanSuscripcionDto>(pageSize));
    } finally {
      setLoading(prev => ({ ...prev, planes: false }));
    }
  }, []);

  // Función para cargar suscripciones con paginación del servidor
  const loadSuscripcionesPaginadas = useCallback(async (page: number = 1, pageSize: number = 10, searchTerm: string = '', filters: FilterValue = {}) => {
    try {
      setLoading(prev => ({ ...prev, suscripciones: true }));
      setErrors(prev => ({ ...prev, suscripciones: null }));

      const params: GetSuscripcionesPaginatedRequest = {
        PageNumber: page,
        PageSize: pageSize,
        OrderBy: 'fechaCreacion',
        OrderDescending: true
      };

      // Agregar filtros de búsqueda si hay término de búsqueda
      if (searchTerm && searchTerm.trim() !== '') {
        params.SearchTerm = searchTerm.trim();
      }

      // Agregar filtros avanzados
      if (filters.organizacionId) {
        params.OrganizacionId = filters.organizacionId;
      }
      if (filters.planId) {
        params.PlanId = filters.planId;
      }
      if (filters.esDemo !== undefined) {
        params.EsDemo = filters.esDemo;
      }
      if (filters.soloVigentes !== undefined) {
        params.SoloVigentes = filters.soloVigentes;
      }
      const response = await suscripcionesOrganizacionService.getSuscripcionesPaginated(params);
      if (response.success && response.data) {
        // Usar el utilitario centralizado para procesar la respuesta
        const adaptedData = processPaginatedResponse<SuscripcionOrganizacionDto>(response.data as any, page, pageSize);
        // Debug: Verificar datos originales antes del mapeo
        // Mapear datos del backend con nombres de campos correctos
        const suscripcionesMapeadas = adaptedData.items.map((item, index) => {
          const originalDiasRestantes = item.diasRestantes;
          const backendDiasRestantes = (item as any).diasRestantesSuscripcion;
          const originalEstaVigente = item.estaVigente;
          const backendEstaVigente = (item as any).suscripcionVigente;
          
          // Debug: Log para los primeros items
          if (index < 2) {
          }
          
          return {
            ...item,
            // Mapear campos con nombres diferentes del backend
            diasRestantes: originalDiasRestantes ?? backendDiasRestantes ?? 0,
            estaVigente: originalEstaVigente ?? backendEstaVigente ?? false,
            estaPorVencer: item.estaPorVencer ?? false
          };
        });
        
        // Debug: Verificar datos mapeados
        // Actualizar la paginación con datos mapeados
        setSuscripcionesPaginadas({
          ...adaptedData,
          items: suscripcionesMapeadas
        });
        
        // Mantener compatibilidad con código existente
        setSuscripciones(suscripcionesMapeadas);
      } else {
        const errorMessage = response.message || 'Error al cargar suscripciones paginadas';
        console.error('❌ [SUSCRIPCIONES] Error en respuesta:', errorMessage);
        setErrors(prev => ({ ...prev, suscripciones: errorMessage }));
        
        // Establecer estado de fallback seguro
        setSuscripcionesPaginadas(createEmptyPaginationState<SuscripcionOrganizacionDto>(pageSize));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar suscripciones paginadas';
      console.error('💥 [SUSCRIPCIONES] Error en loadSuscripcionesPaginadas:', error);
      setErrors(prev => ({ ...prev, suscripciones: errorMessage }));
      
      // Establecer estado de fallback seguro
      setSuscripcionesPaginadas(createEmptyPaginationState<SuscripcionOrganizacionDto>(pageSize));
    } finally {
      setLoading(prev => ({ ...prev, suscripciones: false }));
    }
  }, []);

  // Función para cargar países
  const loadPaises = useCallback(async () => {
    try {
      const response = await ubigeoService.getPaises();
      setPaises(response);
    } catch (error) {
      console.error('Error loading países:', error);
    }
  }, []);

  // Función para cargar departamentos
  const loadDepartamentos = useCallback(async () => {
    try {
      const response = await ubigeoService.getDepartamentos();
      setDepartamentos(response);
    } catch (error) {
      console.error('Error loading departamentos:', error);
    }
  }, []);

  // Función para cargar provincias por departamento
  const loadProvinciasByDepartamento = useCallback(async (departamentoId: number) => {
    try {
      const response = await ubigeoService.getUbigeosHijos(departamentoId);
      setProvincias(response);
    } catch (error) {
      console.error('Error loading provincias:', error);
    }
  }, []);

  // Función para cargar distritos por provincia
  const loadDistritosByProvincia = useCallback(async (provinciaId: number) => {
    try {
      const response = await ubigeoService.getUbigeosHijos(provinciaId);
      setDistritos(response);
    } catch (error) {
      console.error('Error loading distritos:', error);
    }
  }, []);

  // Efecto para manejar cambios en la prop initialTab
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Efecto para cargar datos iniciales (catálogos necesarios para los formularios)
  useEffect(() => {
    loadPlanes(); // Necesario para los selects de planes en formularios
    loadPaises();
    loadDepartamentos();
  }, [loadPlanes, loadPaises, loadDepartamentos]);

  // Efecto para cargar organizaciones (separado para evitar dependencias circulares)
  useEffect(() => {
    loadOrganizacionesPaginadas(); // Cargar primera página por defecto
  }, []);

  // Efecto para cargar planes paginados (separado para evitar dependencias circulares)
  useEffect(() => {
    loadPlanesPaginadas(); // Cargar primera página por defecto
  }, []);

  // Efecto para cargar suscripciones paginadas (separado para evitar dependencias circulares)
  useEffect(() => {
    loadSuscripcionesPaginadas(); // Cargar primera página por defecto
  }, []);

  // Efecto para búsqueda con debounce en organizaciones
  useEffect(() => {
    if (activeTab === 'organizaciones') {
      const timer = setTimeout(() => {
        loadOrganizacionesPaginadas(1, currentPageSizeOrganizaciones, searchTerm, activeFilters);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, activeTab, currentPageSizeOrganizaciones, activeFilters, loadOrganizacionesPaginadas]);

  // Efecto para búsqueda con debounce en planes
  useEffect(() => {
    if (activeTab === 'planes') {
      const timer = setTimeout(() => {
        loadPlanesPaginadas(1, currentPageSizePlanes, searchTerm, activeFiltersPlanes);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, activeTab, currentPageSizePlanes, activeFiltersPlanes, loadPlanesPaginadas]);

  // Efecto para búsqueda con debounce en suscripciones
  useEffect(() => {
    if (activeTab === 'suscripciones') {
      const timer = setTimeout(() => {
        loadSuscripcionesPaginadas(1, currentPageSizeSuscripciones, searchTerm, activeFiltersSuscripciones);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, activeTab, currentPageSizeSuscripciones, activeFiltersSuscripciones, loadSuscripcionesPaginadas]);

  // Efecto para mostrar mensaje informativo sobre datos de demostración
  useEffect(() => {
    if (organizaciones.length > 0) {
      console.info('📊 Mostrando datos de demostración. Para usar datos reales, configure el API en environment.ts');
    }
  }, [organizaciones]);

  // Funciones de filtrado
  const filteredOrganizaciones = useMemo(() => {
    if (!searchTerm) return organizaciones;
    
    const searchLower = searchTerm.toLowerCase();
    return organizaciones.filter(org =>
      org.nombreComercial?.toLowerCase().includes(searchLower) ||
      org.razonSocial?.toLowerCase().includes(searchLower) ||
      org.codigo?.toLowerCase().includes(searchLower) ||
      org.numeroDocumento?.toLowerCase().includes(searchLower) ||
      org.email?.toLowerCase().includes(searchLower)
    );
  }, [organizaciones, searchTerm]);

  const filteredSuscripciones = useMemo(() => {
    if (!searchTerm) return suscripciones;
    
    const searchLower = searchTerm.toLowerCase();
    return suscripciones.filter((sus: SuscripcionOrganizacionDto) =>
      sus.razonSocial?.toLowerCase().includes(searchLower) ||
      sus.codigoOrganizacion?.toLowerCase().includes(searchLower) ||
      sus.emailOrganizacion?.toLowerCase().includes(searchLower) ||
      sus.nombrePlan?.toLowerCase().includes(searchLower) ||
      sus.tipoPlan?.toLowerCase().includes(searchLower)
    );
  }, [suscripciones, searchTerm]);

  const filteredPlanes = useMemo(() => {
    if (!searchTerm) return planes;
    
    const searchLower = searchTerm.toLowerCase();
    return planes.filter(plan =>
      plan.nombrePlan?.toLowerCase().includes(searchLower) ||
      plan.descripcion?.toLowerCase().includes(searchLower)
    );
  }, [planes, searchTerm]);

  // Debug: Log para verificar los datos de planes
  // Handlers del modal
  const openModal = useCallback((mode: ModalMode, type: TabType, data?: any) => {
    setModal({ isOpen: true, mode, type, data });
    // Limpiar todos los errores cuando se abre el modal
    setErrors({
      organizaciones: null,
      suscripciones: null,
      planes: null,
      general: null
    });
    
    if (mode === 'edit' && data && type === 'organizaciones') {
      // Mapear datos de OrganizacionDto a OrganizacionFormData
      setOrganizacionForm({
        codigo: data.codigo || '',
        razonSocial: data.razonSocial || '',
        nombreComercial: data.nombreComercial || '',
        tipoDocumento: data.tipoDocumento || TipoDocumento.RUC,
        numeroDocumento: data.numeroDocumento || '',
        sector: data.sector,
        industria: data.industria,
        pais: data.pais || 1,
        departamento: data.departamento,
        provincia: data.provincia,
        distrito: data.distrito,
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        email: data.email || '',
        paginaWeb: data.paginaWeb || '',
        mision: data.mision || '',
        vision: data.vision || '',
        valoresCorporativos: data.valoresCorporativos || '',
        fechaConstitucion: formatDateForInput(data.fechaConstitucion),
        fechaInicioOperaciones: formatDateForInput(data.fechaInicioOperaciones),
        logoUrl: data.logoUrl || '',
        colorPrimario: data.colorPrimario || '#414976',
        colorSecundario: data.colorSecundario || '#6B7280',
        suscripcionActualId: data.suscripcionActualId,
        estadoLicencia: data.estadoLicencia || EstadoLicencia.Activa,
        instancia: data.instancia || '',
        dominio: data.dominio || '',
        tenantId: data.tenantId || '',
        clientId: data.clientId || '',
        clientSecret: data.clientSecret || '',
        callbackPath: data.callbackPath || ''
      });
    } else if (mode === 'edit' && data && type === 'planes') {
      // Mapear datos de PlanSuscripcion a PlanFormData
      setPlanForm({
        nombrePlan: data.nombrePlan || '',
        descripcion: data.descripcion || '',
        limiteUsuarios: data.limiteUsuarios,
        duracionDias: data.duracionDias || 30,
        precio: data.precio || 0,
        tipoPlan: data.tipoPlan || TipoPlan.BASICO,
        activo: data.activo !== undefined ? data.activo : true,
        estado: data.estado || EstadoPlan.ACTIVO,
        actualizarSuscripcionesExistentes: data.actualizarSuscripcionesExistentes || false,
        notificarCambios: data.notificarCambios || false,
        esActualizacionSignificativa: data.esActualizacionSignificativa || false
      });
    } else if (mode === 'create' && type === 'organizaciones') {
      // Resetear formulario para crear organización
      setOrganizacionForm({
        codigo: generateTimestampCode(), // Generar código automáticamente
        razonSocial: '',
        nombreComercial: '',
        tipoDocumento: TipoDocumento.RUC,
        numeroDocumento: '',
        sector: null,
        industria: null,
        pais: 1,
        departamento: null,
        provincia: null,
        distrito: null,
        direccion: '',
        telefono: '',
        email: '',
        paginaWeb: '',
        mision: '',
        vision: '',
        valoresCorporativos: '',
        fechaConstitucion: '',
        fechaInicioOperaciones: '',
        logoUrl: '',
        colorPrimario: '#414976',
        colorSecundario: '#6B7280',
        suscripcionActualId: null,
        estadoLicencia: EstadoLicencia.Activa,
        instancia: '',
        dominio: '',
        tenantId: '',
        clientId: '',
        clientSecret: '',
        callbackPath: ''
      });
    } else if (mode === 'create' && type === 'planes') {
      // Resetear formulario para crear plan
      setPlanForm({
        nombrePlan: '',
        descripcion: '',
        limiteUsuarios: 1,
        duracionDias: 30,
        precio: 0,
        tipoPlan: TipoPlan.BASICO,
        activo: true,
        estado: EstadoPlan.ACTIVO,
        actualizarSuscripcionesExistentes: false,
        notificarCambios: false,
        esActualizacionSignificativa: false
      });
    } else if (mode === 'edit' && data && type === 'suscripciones') {
      // Mapear datos de SuscripcionOrganizacionDto a SuscripcionFormData
      setSuscripcionForm({
        organizacionId: data.organizacionId,
        planId: data.planId,
        fechaInicio: data.fechaInicio.split('T')[0], // Solo la fecha
        fechaFin: data.fechaFin.split('T')[0], // Solo la fecha
        limiteUsuarios: data.limiteUsuarios,
        esDemo: data.esDemo || false,
        tipoOperacion: data.tipoOperacion || TipoOperacionSuscripcion.RENOVACION,
        estadoSuscripcion: data.estadoSuscripcion || EstadoSuscripcionEnum.ACTIVA,
        motivoOperacion: data.motivoOperacion || ''
      });
    } else if (mode === 'create' && type === 'suscripciones') {
      // Resetear formulario para crear suscripción
      setSuscripcionForm({
        organizacionId: 0,
        planId: 0,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        limiteUsuarios: 0,
        esDemo: false,
        tipoOperacion: TipoOperacionSuscripcion.NUEVA,
        estadoSuscripcion: EstadoSuscripcionEnum.NUEVA,
        motivoOperacion: ''
      });
    } else if (mode === 'extender' && data && type === 'suscripciones') {
      // Inicializar formulario para extender suscripción
      setExtenderForm({
        suscripcionId: data.suscripcionId,
        diasExtension: 30,
        motivoOperacion: ''
      });
    } else if (mode === 'renovar' && data && type === 'suscripciones') {
      // Inicializar formulario para renovar suscripción
      setRenovarForm({
        suscripcionId: data.suscripcionId,
        nuevoPlanId: null, // Por defecto, mantener el mismo plan
        motivoOperacion: ''
      });
    }
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, mode: null, type: 'organizaciones' });
    // Limpiar todos los errores cuando se cierra el modal
    setErrors({
      organizaciones: null,
      suscripciones: null,
      planes: null,
      general: null
    });
  }, []);

  // Función para abrir el modal de gestión de familias de sistemas
  const openGestionFamiliasModal = useCallback((organizacion: OrganizacionDto) => {
    setSelectedOrganizacionForFamilias(organizacion);
    setIsGestionFamiliasModalOpen(true);
  }, []);

  // Función para cerrar el modal de gestión de familias de sistemas
  const closeGestionFamiliasModal = useCallback(() => {
    setIsGestionFamiliasModalOpen(false);
    setSelectedOrganizacionForFamilias(null);
  }, []);



  // Función para validar el formulario de organización
  const validateOrganizacionForm = (form: OrganizacionFormData): string[] => {
    const errors: string[] = [];

    // ==========================================
    // VALIDACIONES REQUERIDAS
    // ==========================================
    if (!form.razonSocial.trim()) {
      errors.push('La razón social es requerida');
    }

    // ==========================================
    // VALIDACIONES DE LONGITUD
    // ==========================================
    if (form.razonSocial.length > 300) {
      errors.push('La razón social no puede exceder 300 caracteres');
    }

    if (form.nombreComercial && form.nombreComercial.length > 200) {
      errors.push('El nombre comercial no puede exceder 200 caracteres');
    }

    if (form.numeroDocumento && form.numeroDocumento.length > 50) {
      errors.push('El número de documento no puede exceder 50 caracteres');
    }

    if (form.direccion && form.direccion.length > 500) {
      errors.push('La dirección no puede exceder 500 caracteres');
    }

    if (form.telefono && form.telefono.length > 50) {
      errors.push('El teléfono no puede exceder 50 caracteres');
    }

    if (form.email && form.email.length > 200) {
      errors.push('El email no puede exceder 200 caracteres');
    }

    if (form.paginaWeb && form.paginaWeb.length > 300) {
      errors.push('La página web no puede exceder 300 caracteres');
    }

    if (form.logoUrl && form.logoUrl.length > 300) {
      errors.push('La URL del logo no puede exceder 300 caracteres');
    }

    if (form.colorPrimario && form.colorPrimario.length > 10) {
      errors.push('El color primario no puede exceder 10 caracteres');
    }

    if (form.colorSecundario && form.colorSecundario.length > 10) {
      errors.push('El color secundario no puede exceder 10 caracteres');
    }

    if (form.instancia && form.instancia.length > 300) {
      errors.push('La instancia no puede exceder 300 caracteres');
    }

    if (form.dominio && form.dominio.length > 300) {
      errors.push('El dominio no puede exceder 300 caracteres');
    }

    if (form.tenantId && form.tenantId.length > 50) {
      errors.push('El TenantId no puede exceder 50 caracteres');
    }

    if (form.clientId && form.clientId.length > 50) {
      errors.push('El ClientId no puede exceder 50 caracteres');
    }

    if (form.clientSecret && form.clientSecret.length > 50) {
      errors.push('El ClientSecret no puede exceder 50 caracteres');
    }

    if (form.callbackPath && form.callbackPath.length > 150) {
      errors.push('El CallbackPath no puede exceder 150 caracteres');
    }

    // ==========================================
    // VALIDACIONES DE FORMATO
    // ==========================================
    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errors.push('El formato del email no es válido');
      }
    }

    if (form.paginaWeb && form.paginaWeb.trim()) {
      try {
        new URL(form.paginaWeb);
      } catch {
        errors.push('El formato de la página web no es válido');
      }
    }

    // ==========================================
    // VALIDACIONES PERSONALIZADAS
    // ==========================================
    if (form.fechaConstitucion) {
      const fechaConstitucion = new Date(form.fechaConstitucion);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999); // Incluir todo el día de hoy
      if (fechaConstitucion > hoy) {
        errors.push('La fecha de constitución no puede ser futura');
      }
    }

    if (form.fechaInicioOperaciones) {
      const fechaInicioOperaciones = new Date(form.fechaInicioOperaciones);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999); // Incluir todo el día de hoy
      if (fechaInicioOperaciones > hoy) {
        errors.push('La fecha de inicio de operaciones no puede ser futura');
      }
    }

    if (form.dominio && form.dominio.trim()) {
      // Validar formato básico de dominio
      const dominioRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
      if (!dominioRegex.test(form.dominio)) {
        errors.push('El formato del dominio no es válido');
      }
    }

    if (form.callbackPath && form.callbackPath.trim()) {
      if (!form.callbackPath.startsWith('/')) {
        errors.push('El CallbackPath debe comenzar con \'/\'');
      }
    }

    // Validaciones de ClientId y ClientSecret
    if (form.clientId && form.clientId.trim() && (!form.clientSecret || !form.clientSecret.trim())) {
      errors.push('Si se especifica ClientId, ClientSecret es requerido');
    }

    if (form.clientSecret && form.clientSecret.trim() && (!form.clientId || !form.clientId.trim())) {
      errors.push('Si se especifica ClientSecret, ClientId es requerido');
    }

    return errors;
  };

  // Handler para guardar organización
  const handleSaveOrganizacion = useCallback(async () => {
    let loadingToastId: string | undefined;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors(prev => ({ ...prev, general: null }));

      // Validar formulario usando las mismas validaciones del backend
      const validationErrors = validateOrganizacionForm(organizacionForm);
      
      if (validationErrors.length > 0) {
        // Mostrar todas las validaciones juntas
        const errorMessage = validationErrors.join('\n• ');
        AlertService.warning(`Por favor corrige los siguientes errores:\n\n• ${errorMessage}`, {
          title: 'Errores de validación',
          duration: 5000 // 🔧 FIX: 5 segundos estándar
        });
        return;
      }

      // Mostrar alerta de loading
      const actionText = modal.mode === 'create' ? 'Creando' : 'Actualizando';
      loadingToastId = AlertService.loading(`${actionText} cliente...`);

      if (modal.mode === 'create') {
        const command: CreateOrganizacionCommand = {
          codigo: organizacionForm.codigo || null,
          razonSocial: organizacionForm.razonSocial,
          nombreComercial: organizacionForm.nombreComercial || null,
          tipoDocumento: organizacionForm.tipoDocumento,
          numeroDocumento: organizacionForm.numeroDocumento || null,
          sector: organizacionForm.sector,
          industria: organizacionForm.industria,
          pais: organizacionForm.pais,
          departamento: organizacionForm.departamento,
          provincia: organizacionForm.provincia,
          distrito: organizacionForm.distrito,
          direccion: organizacionForm.direccion || null,
          telefono: organizacionForm.telefono || null,
          email: organizacionForm.email || null,
          paginaWeb: organizacionForm.paginaWeb || null,
          mision: organizacionForm.mision || null,
          vision: organizacionForm.vision || null,
          valoresCorporativos: organizacionForm.valoresCorporativos || null,
          fechaConstitucion: organizacionForm.fechaConstitucion || null,
          fechaInicioOperaciones: organizacionForm.fechaInicioOperaciones || null,
          logoUrl: organizacionForm.logoUrl || null,
          colorPrimario: organizacionForm.colorPrimario || null,
          colorSecundario: organizacionForm.colorSecundario || null,
          suscripcionActualId: organizacionForm.suscripcionActualId,
          estadoLicencia: organizacionForm.estadoLicencia,
          instancia: organizacionForm.instancia || null,
          dominio: organizacionForm.dominio || null,
          tenantId: organizacionForm.tenantId || null,
          clientId: organizacionForm.clientId || null,
          clientSecret: organizacionForm.clientSecret || null,
          callbackPath: organizacionForm.callbackPath || null
        };

        const response = await organizacionesService.createOrganizacion(command);
        
        if (response.success) {
          // Actualizar loading toast a success
          AlertService.updateLoading(loadingToastId, 'success', `Cliente "${organizacionForm.nombreComercial || organizacionForm.razonSocial}" creado exitosamente`);
          await loadOrganizacionesPaginadas(organizacionesPaginadas.pageNumber, organizacionesPaginadas.pageSize, searchTerm, activeFilters); // Recargar lista con parámetros actuales
          closeModal();
        } else {
          // Manejar errores específicos del backend
          let errorMsg = response.message || 'Error al crear el cliente';
          
          // Si hay errores específicos, concatenarlos al mensaje principal
          if (response.errors && response.errors.length > 0) {
            errorMsg = `${errorMsg}: ${response.errors.join(', ')}`;
          }
          
          AlertService.updateLoading(loadingToastId, 'error', errorMsg);
        }
      } else if (modal.mode === 'edit' && modal.data) {
        const command: UpdateOrganizacionCommand = {
          organizacionId: modal.data.organizacionId,
          codigo: organizacionForm.codigo || null,
          razonSocial: organizacionForm.razonSocial,
          nombreComercial: organizacionForm.nombreComercial || null,
          tipoDocumento: organizacionForm.tipoDocumento,
          numeroDocumento: organizacionForm.numeroDocumento || null,
          sector: organizacionForm.sector,
          industria: organizacionForm.industria,
          pais: organizacionForm.pais,
          departamento: organizacionForm.departamento,
          provincia: organizacionForm.provincia,
          distrito: organizacionForm.distrito,
          direccion: organizacionForm.direccion || null,
          telefono: organizacionForm.telefono || null,
          email: organizacionForm.email || null,
          paginaWeb: organizacionForm.paginaWeb || null,
          mision: organizacionForm.mision || null,
          vision: organizacionForm.vision || null,
          valoresCorporativos: organizacionForm.valoresCorporativos || null,
          fechaConstitucion: organizacionForm.fechaConstitucion || null,
          fechaInicioOperaciones: organizacionForm.fechaInicioOperaciones || null,
          logoUrl: organizacionForm.logoUrl || null,
          colorPrimario: organizacionForm.colorPrimario || null,
          colorSecundario: organizacionForm.colorSecundario || null,
          suscripcionActualId: organizacionForm.suscripcionActualId,
          estadoLicencia: organizacionForm.estadoLicencia,
          instancia: organizacionForm.instancia || null,
          dominio: organizacionForm.dominio || null,
          tenantId: organizacionForm.tenantId || null,
          clientId: organizacionForm.clientId || null,
          clientSecret: organizacionForm.clientSecret || null,
          callbackPath: organizacionForm.callbackPath || null
        };

        const response = await organizacionesService.updateOrganizacion(modal.data.organizacionId, command);
        
        if (response.success) {
          // Actualizar loading toast a success
          AlertService.updateLoading(loadingToastId, 'success', `Cliente "${organizacionForm.nombreComercial || organizacionForm.razonSocial}" actualizado exitosamente`);
          await loadOrganizacionesPaginadas(organizacionesPaginadas.pageNumber, organizacionesPaginadas.pageSize, searchTerm, activeFilters); // Recargar lista con parámetros actuales
          closeModal();
        } else {
          // Manejar errores específicos del backend
          let errorMsg = response.message || 'Error al actualizar el cliente';
          
          // Si hay errores específicos, concatenarlos al mensaje principal
          if (response.errors && response.errors.length > 0) {
            errorMsg = `${errorMsg}: ${response.errors.join(', ')}`;
          }
          
          AlertService.updateLoading(loadingToastId, 'error', errorMsg);
        }
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al guardar cliente');
      
      if (loadingToastId) {
        AlertService.updateLoading(loadingToastId, 'error', errorMessage);
      } else {
        AlertService.error(errorMessage, {
          title: 'Error del sistema'
        });
      }
      
      console.error('Error saving organización:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [modal, organizacionForm, loadOrganizaciones, closeModal]);

  // Handler para eliminar organización
  const handleDeleteOrganizacion = useCallback(async (org: OrganizacionDto) => {
    let loadingToastId: string | undefined;
    
    try {
      // Verificar si tiene suscripciones activas antes de mostrar confirmación
      const suscripcionesActivas = suscripciones.filter(s => 
        s.organizacionId === org.organizacionId && s.estaVigente
      );
      
      if (suscripcionesActivas.length > 0) {
        AlertService.warning(
          `No se puede eliminar "${org.nombreComercial || org.razonSocial}" porque tiene ${suscripcionesActivas.length} suscripción(es) activa(s). Para eliminar este cliente, primero debe cancelar o vencer todas sus suscripciones activas.`, 
          {
            title: 'Eliminación no permitida'
          }
        );
        return;
      }

      // Mostrar confirmación con información detallada
      const confirmed = await AlertService.confirm(
        `¿Estás seguro de eliminar el cliente "${org.nombreComercial || org.razonSocial}"? Esta acción no se puede deshacer. Se eliminará toda la información relacionada con este cliente.`, 
        {
      title: 'Confirmar eliminación',
          confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
        }
      );
    
    if (!confirmed) {
        AlertService.info('Eliminación cancelada', {
          title: 'Operación cancelada'
        });
      return;
    }

      setLoading(prev => ({ ...prev, deleting: true }));
      
      // Mostrar loading toast
      loadingToastId = AlertService.loading(`Eliminando cliente "${org.nombreComercial || org.razonSocial}"...`);
      
      const response = await organizacionesService.deleteOrganizacion(org.organizacionId);
      
      if (response.success) {
        // Actualizar loading a success
        AlertService.updateLoading(
          loadingToastId, 
          'success', 
          `Cliente "${org.nombreComercial || org.razonSocial}" eliminado exitosamente`
        );
        await loadOrganizacionesPaginadas(organizacionesPaginadas.pageNumber, organizacionesPaginadas.pageSize, searchTerm, activeFilters); // Recargar lista con parámetros actuales
      } else {
        // Manejar errores específicos del backend
        let errorMsg = response.message || 'Error al eliminar el cliente';
        
        // Si hay errores específicos, concatenarlos al mensaje principal
        if (response.errors && response.errors.length > 0) {
          errorMsg = `${errorMsg}: ${response.errors.join(', ')}`;
        }
        
        AlertService.updateLoading(loadingToastId, 'error', errorMsg);
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al eliminar cliente');
      
      if (loadingToastId) {
        AlertService.updateLoading(loadingToastId, 'error', errorMessage);
      } else {
        AlertService.error(errorMessage, {
          title: 'Error del sistema'
        });
      }
      
      console.error('Error deleting organización:', error);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [loadOrganizaciones, suscripciones]);

  // Función para validar el formulario de plan
  const validatePlanForm = (form: PlanFormData): string[] => {
    const errors: string[] = [];

    // ==========================================
    // VALIDACIONES REQUERIDAS
    // ==========================================
    if (!form.nombrePlan || form.nombrePlan.trim() === '') {
      errors.push('El nombre del plan es requerido');
    }

    if (form.nombrePlan && form.nombrePlan.length > 100) {
      errors.push('El nombre del plan no puede exceder 100 caracteres');
    }

    if (form.limiteUsuarios === null || form.limiteUsuarios === undefined) {
      errors.push('El límite de usuarios es requerido');
    }

    if (form.limiteUsuarios !== null && (form.limiteUsuarios < 1 || form.limiteUsuarios > 10000)) {
      errors.push('El límite de usuarios debe estar entre 1 y 10,000');
    }

    if (!form.duracionDias) {
      errors.push('La duración en días es requerida');
    }

    if (form.duracionDias && (form.duracionDias < 1 || form.duracionDias > 3650)) {
      errors.push('La duración debe estar entre 1 y 3,650 días (10 años)');
    }

    // ==========================================
    // VALIDACIONES OPCIONALES
    // ==========================================
    if (form.descripcion && form.descripcion.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    if (form.precio !== null && form.precio !== undefined && (form.precio < 0 || form.precio > 999999.99)) {
      errors.push('El precio debe estar entre 0 y 999,999.99');
    }

    if (form.tipoPlan && form.tipoPlan.length > 20) {
      errors.push('El tipo de plan no puede exceder 20 caracteres');
    }

    // ==========================================
    // VALIDACIONES PERSONALIZADAS
    // ==========================================
    if (form.tipoPlan && form.tipoPlan.trim() !== '') {
      const tiposValidos = ['basico', 'estandar', 'premium', 'empresarial', 'demo'];
      if (!tiposValidos.includes(form.tipoPlan.toLowerCase())) {
        errors.push('El tipo de plan debe ser uno de: Básico, Estándar, Premium, Empresarial, Demo');
      }
    }

    // Validar duraciones estándar permitidas
    const duracionesPermitidas = [7, 15, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 365, 730, 1095, 1460, 1825, 2190, 2555, 2920, 3285, 3650];
    if (form.duracionDias && !duracionesPermitidas.includes(form.duracionDias)) {
      errors.push('La duración debe ser un valor estándar permitido (7, 15, 30, 60, 90, 180, 365 días, etc.)');
    }

    return errors;
  };

  // Handler para guardar plan
  const handleSavePlan = useCallback(async () => {
    let loadingToastId: string | undefined;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors(prev => ({ ...prev, general: null }));

      // Validar formulario usando las mismas validaciones del backend
      const validationErrors = validatePlanForm(planForm);
      
      if (validationErrors.length > 0) {
        // Mostrar todas las validaciones juntas
        const errorMessage = validationErrors.join('\n• ');
        AlertService.warning(`Por favor corrige los siguientes errores:\n\n• ${errorMessage}`, {
          title: 'Errores de validación',
          duration: 5000 // 🔧 FIX: 5 segundos estándar
        });
        return;
      }
      // Mostrar alerta de loading
      const actionText = modal.mode === 'create' ? 'Creando' : 'Actualizando';
      loadingToastId = AlertService.loading(`${actionText} plan "${planForm.nombrePlan}"...`);
      
      if (modal.mode === 'edit') {
        // Verificar si el plan tiene suscripciones activas y se está cambiando a demo
        if (planForm.tipoPlan === TipoPlan.DEMO && modal.data?.tipoPlan !== TipoPlan.DEMO) {
          const suscripcionesActivas = suscripciones.filter(s => 
            s.planId === modal.data?.planId && s.estaVigente
          );
          
          if (suscripcionesActivas.length > 0) {
            AlertService.updateLoading(
              loadingToastId, 
              'error', 
              'No se puede cambiar a plan demo un plan que tiene suscripciones activas'
            );
            return;
          }
        }
        
        // Enviar solo las propiedades absolutamente necesarias
        const updateCommand: any = {
          planId: modal.data?.planId,
          nombrePlan: planForm.nombrePlan.trim(),
          limiteUsuarios: planForm.limiteUsuarios || 10000, // 10000 = ilimitado
          duracionDias: planForm.duracionDias,
          version: modal.data?.version || 1,
          actualizarSuscripcionesExistentes: planForm.actualizarSuscripcionesExistentes,
          notificarCambios: false,
          esActualizacionSignificativa: false,
          estado: planForm.estado
        };

        // Solo agregar propiedades opcionales si tienen valor
        if (planForm.descripcion.trim()) {
          updateCommand.descripcion = planForm.descripcion.trim();
        }
        if (planForm.precio > 0) {
          updateCommand.precio = planForm.precio;
        }
        if (planForm.tipoPlan) {
          updateCommand.tipoPlan = planForm.tipoPlan;
        }
        if (planForm.activo !== undefined) {
          updateCommand.activo = true;
        }
        const response = await planesSuscripcionService.updatePlanSuscripcion(modal.data?.planId, updateCommand);
        
        if (response.success) {
          // Actualizar loading toast a success
          AlertService.updateLoading(loadingToastId, 'success', `Plan "${planForm.nombrePlan}" actualizado exitosamente`);
          await loadPlanesPaginadas(planesPaginados.pageNumber, planesPaginados.pageSize, searchTerm, activeFiltersPlanes); // Recargar lista con parámetros actuales
          closeModal();
      } else {
          // Manejar errores específicos del backend
          let errorMsg = response.message || 'Error al actualizar el plan';
          
          // Si hay errores específicos, concatenarlos al mensaje principal
          if (response.errors && response.errors.length > 0) {
            errorMsg = `${errorMsg}: ${response.errors.join(', ')}`;
          }
          
          AlertService.updateLoading(loadingToastId, 'error', errorMsg);
        }
      } else {
        const createCommand: CreatePlanSuscripcionCommand = {
          nombrePlan: planForm.nombrePlan.trim(),
          descripcion: planForm.descripcion.trim() || null,
          limiteUsuarios: planForm.limiteUsuarios || 10000, // 10000 = ilimitado
          duracionDias: planForm.duracionDias,
          precio: planForm.precio || null,
          tipoPlan: planForm.tipoPlan || null,
          activo: true,
          creadoPor: null,
          estado: planForm.estado
        };
        const response = await planesSuscripcionService.createPlanSuscripcion(createCommand);
        
        if (response.success) {
          // Actualizar loading toast a success
          AlertService.updateLoading(loadingToastId, 'success', `Plan "${planForm.nombrePlan}" creado exitosamente`);
          await loadPlanesPaginadas(planesPaginados.pageNumber, planesPaginados.pageSize, searchTerm, activeFiltersPlanes); // Recargar lista con parámetros actuales
          closeModal();
        } else {
          // Manejar errores específicos del backend
          let errorMsg = response.message || 'Error al crear el plan';
          
          // Si hay errores específicos, concatenarlos al mensaje principal
          if (response.errors && response.errors.length > 0) {
            errorMsg = `${errorMsg}: ${response.errors.join(', ')}`;
          }
          
          AlertService.updateLoading(loadingToastId, 'error', errorMsg);
        }
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al guardar plan');
      
      if (loadingToastId) {
        AlertService.updateLoading(loadingToastId, 'error', errorMessage);
      } else {
        AlertService.error(errorMessage, {
          title: 'Error del sistema'
        });
      }
      
      console.error('❌ Error saving plan:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [modal, planForm, loadPlanes, closeModal, suscripciones]);

  // Función para validar el formulario de suscripción
  const validateSuscripcionForm = (form: SuscripcionFormData): string[] => {
    const errors: string[] = [];

    // ==========================================
    // VALIDACIONES REQUERIDAS
    // ==========================================
    if (form.organizacionId <= 0) {
      errors.push('El ID de la organización debe ser mayor a cero');
    }

    if (form.planId <= 0) {
      errors.push('El ID del plan debe ser mayor a cero');
    }

    if (!form.fechaInicio || form.fechaInicio.trim() === '') {
      errors.push('La fecha de inicio es requerida');
    }

    if (!form.fechaFin || form.fechaFin.trim() === '') {
      errors.push('La fecha de fin es requerida');
    }

    if (form.limiteUsuarios <= 0) {
      errors.push('El límite de usuarios debe ser mayor a cero');
    }

    // ==========================================
    // VALIDACIONES DE GESTIÓN Y TRAZABILIDAD
    // ==========================================
    if (!form.tipoOperacion || form.tipoOperacion <= 0) {
      errors.push('El tipo de operación es requerido');
    }

    if (!form.estadoSuscripcion || form.estadoSuscripcion <= 0) {
      errors.push('El estado de la suscripción es requerido');
    }

    if (form.motivoOperacion && form.motivoOperacion.length > 500) {
      errors.push('El motivo de la operación no puede exceder los 500 caracteres');
    }

    // ==========================================
    // VALIDACIONES DE FECHAS
    // ==========================================
    if (form.fechaInicio && form.fechaFin) {
      const fechaInicio = new Date(form.fechaInicio);
      const fechaFin = new Date(form.fechaFin);
      const hoy = new Date();
      
      // Validar que las fechas sean válidas
      if (isNaN(fechaInicio.getTime())) {
        errors.push('La fecha de inicio no es válida');
      }
      
      if (isNaN(fechaFin.getTime())) {
        errors.push('La fecha de fin no es válida');
      }
      
      if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
        // Validar que la fecha de fin sea posterior a la fecha de inicio
        if (fechaFin <= fechaInicio) {
          errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
        }
        
        // Validar que la fecha de inicio no sea muy antigua (máximo 30 días atrás)
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        
        if (fechaInicio < hace30Dias) {
          errors.push('La fecha de inicio no puede ser muy antigua (máximo 30 días atrás)');
        }
        
        // Validar duración razonable (entre 1 día y 10 años)
        const duracionMs = fechaFin.getTime() - fechaInicio.getTime();
        const duracionDias = Math.ceil(duracionMs / (1000 * 60 * 60 * 24));
        
        if (duracionDias < 1) {
          errors.push('La duración de la suscripción debe ser de al menos 1 día');
        }
        
        if (duracionDias > 3650) { // 10 años
          errors.push('La duración de la suscripción no puede exceder 10 años');
        }
      }
    }

    return errors;
  };

  // Función para validar el formulario de extender suscripción
  const validateExtenderForm = (form: ExtenderSuscripcionFormData): string[] => {
    const errors: string[] = [];

    // Validar ID de suscripción
    if (!form.suscripcionId || form.suscripcionId <= 0) {
      errors.push('ID de suscripción inválido');
    }

    // Validar días de extensión
    if (!form.diasExtension || form.diasExtension <= 0) {
      errors.push('Los días de extensión deben ser mayor a cero');
    }

    if (form.diasExtension > 1825) { // Máximo 5 años
      errors.push('La extensión no puede ser mayor a 5 años (1825 días)');
    }

    // Validar motivo de operación
    if (!form.motivoOperacion || form.motivoOperacion.trim() === '') {
      errors.push('El motivo de la extensión es requerido');
    }

    if (form.motivoOperacion && form.motivoOperacion.length > 500) {
      errors.push('El motivo de la extensión no puede exceder los 500 caracteres');
    }

    return errors;
  };

  // Función para validar el formulario de renovar suscripción
  const validateRenovarForm = (form: RenovarSuscripcionFormData): string[] => {
    const errors: string[] = [];

    // Validar ID de suscripción
    if (!form.suscripcionId || form.suscripcionId <= 0) {
      errors.push('ID de suscripción inválido');
    }

    // Validar nuevo plan (opcional pero si se especifica debe ser válido)
    if (form.nuevoPlanId !== null && form.nuevoPlanId <= 0) {
      errors.push('El nuevo plan especificado no es válido');
    }

    // Validar motivo de operación
    if (!form.motivoOperacion || form.motivoOperacion.trim() === '') {
      errors.push('El motivo de la renovación es requerido');
    }

    if (form.motivoOperacion && form.motivoOperacion.length > 500) {
      errors.push('El motivo de la renovación no puede exceder los 500 caracteres');
    }

    return errors;
  };

  // Handler para guardar suscripción
  const handleSaveSuscripcion = useCallback(async () => {
    let loadingToastId: string | undefined;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors(prev => ({ ...prev, general: null }));

      // Validar formulario usando las mismas validaciones del backend
      const validationErrors = validateSuscripcionForm(suscripcionForm);
      
      if (validationErrors.length > 0) {
        // Mostrar todas las validaciones juntas
        const errorMessage = validationErrors.join('\n• ');
        AlertService.warning(`Por favor corrige los siguientes errores:\n\n• ${errorMessage}`, {
          title: 'Errores de validación',
          duration: 5000 // 🔧 FIX: 5 segundos estándar
        });
        return;
      }
      // Obtener datos para el mensaje de loading
      const organizacion = organizaciones.find(org => org.organizacionId === suscripcionForm.organizacionId);
      const plan = planes.find(p => p.planId === suscripcionForm.planId);
      const actionText = modal.mode === 'create' ? 'Creando' : 'Actualizando';
      
      // Mostrar alerta de loading
      loadingToastId = AlertService.loading(`${actionText} suscripción para "${organizacion?.nombreComercial || organizacion?.razonSocial}"...`);
      
      if (modal.mode === 'edit') {
        const updateCommand: UpdateSuscripcionOrganizacionCommand = {
          suscripcionId: modal.data?.suscripcionId,
          organizacionId: suscripcionForm.organizacionId,
          planId: suscripcionForm.planId,
          fechaInicio: new Date(suscripcionForm.fechaInicio).toISOString(),
          fechaFin: new Date(suscripcionForm.fechaFin).toISOString(),
          limiteUsuarios: suscripcionForm.limiteUsuarios,
          esDemo: suscripcionForm.esDemo,
          tipoOperacion: suscripcionForm.tipoOperacion,
          estadoSuscripcion: suscripcionForm.estadoSuscripcion,
          motivoOperacion: suscripcionForm.motivoOperacion || null
        };
        const response = await suscripcionesOrganizacionService.updateSuscripcionOrganizacion(modal.data?.suscripcionId, updateCommand);
        
        if (response.success) {
          // Actualizar loading toast a success
          AlertService.updateLoading(
            loadingToastId, 
            'success', 
            `Suscripción actualizada exitosamente para "${organizacion?.nombreComercial || organizacion?.razonSocial}" - Plan: ${plan?.nombrePlan}`
          );
          await loadSuscripcionesPaginadas(suscripcionesPaginadas.pageNumber, suscripcionesPaginadas.pageSize, searchTerm, activeFiltersSuscripciones); // Recargar lista con parámetros actuales
          closeModal();
        } else {
          // Manejar errores específicos del backend
          let errorMsg = response.message || 'Error al actualizar la suscripción';
          
          // Si hay errores específicos, concatenarlos al mensaje principal
          if (response.errors && response.errors.length > 0) {
            errorMsg = `${errorMsg}: ${response.errors.join(', ')}`;
          }
          
          AlertService.updateLoading(loadingToastId, 'error', errorMsg);
        }
      } else {
        // Verificar que no existe una suscripción activa para la misma organización
        const suscripcionActiva = suscripciones.find(s => 
          s.organizacionId === suscripcionForm.organizacionId && s.estaVigente
        );
        
        if (suscripcionActiva) {
          AlertService.updateLoading(
            loadingToastId, 
            'error', 
            `La organización "${organizacion?.nombreComercial || organizacion?.razonSocial}" ya tiene una suscripción activa. Debe esperar a que venza o cancelar la suscripción actual.`
          );
          return;
        }
        
        const createCommand: CreateSuscripcionOrganizacionCommand = {
          organizacionId: suscripcionForm.organizacionId,
          planId: suscripcionForm.planId,
          fechaInicio: new Date(suscripcionForm.fechaInicio).toISOString(),
          fechaFin: new Date(suscripcionForm.fechaFin).toISOString(),
          limiteUsuarios: suscripcionForm.limiteUsuarios,
          esDemo: suscripcionForm.esDemo,
          tipoOperacion: suscripcionForm.tipoOperacion,
          estadoSuscripcion: suscripcionForm.estadoSuscripcion,
          motivoOperacion: suscripcionForm.motivoOperacion || null
        };
        const response = await suscripcionesOrganizacionService.createSuscripcionOrganizacion(createCommand);
        
        if (response.success) {
          // Actualizar loading toast a success
          AlertService.updateLoading(
            loadingToastId, 
            'success', 
            `Suscripción creada exitosamente para "${organizacion?.nombreComercial || organizacion?.razonSocial}" - Plan: ${plan?.nombrePlan}`
          );
          await loadSuscripcionesPaginadas(suscripcionesPaginadas.pageNumber, suscripcionesPaginadas.pageSize, searchTerm, activeFiltersSuscripciones); // Recargar lista con parámetros actuales
          closeModal();
        } else {
          // Manejar errores específicos del backend
          let errorMsg = response.message || 'Error al crear la suscripción';
          
          // Si hay errores específicos, concatenarlos al mensaje principal
          if (response.errors && response.errors.length > 0) {
            errorMsg = `${errorMsg}: ${response.errors.join(', ')}`;
          }
          
          AlertService.updateLoading(loadingToastId, 'error', errorMsg);
        }
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al guardar suscripción');
      
      if (loadingToastId) {
        AlertService.updateLoading(loadingToastId, 'error', errorMessage);
      } else {
        AlertService.error(errorMessage, {
          title: 'Error del sistema'
        });
      }
      
      console.error('❌ Error saving suscripción:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [modal, suscripcionForm, loadSuscripciones, closeModal, organizaciones, planes, suscripciones]);

  // Handler para eliminar suscripción
  const handleDeleteSuscripcion = useCallback(async (suscripcion: SuscripcionOrganizacionDto) => {
    let loadingToastId: string | undefined;
    
    try {
      const organizacionNombre = suscripcion.nombreComercial || suscripcion.razonSocial || 'Cliente';
      
      // Verificar si es una suscripción activa
      if (suscripcion.estaVigente) {
        const confirmed = await AlertService.confirm(
          `¿Estás seguro de eliminar la suscripción activa de "${organizacionNombre}"? Esta acción cancelará inmediatamente el acceso del cliente al sistema.`, 
          {
            title: 'Cancelar Suscripción Activa',
            confirmText: 'Sí, cancelar suscripción',
            cancelText: 'No cancelar'
          }
        );
        
        if (!confirmed) {
          AlertService.info('Cancelación de suscripción cancelada', {
            title: 'Operación cancelada'
          });
          return;
        }
      } else {
        const confirmed = await AlertService.confirm(
          `¿Estás seguro de eliminar la suscripción de "${organizacionNombre}"?`, 
          {
            title: 'Confirmar eliminación',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar'
          }
        );
        
        if (!confirmed) {
          return;
        }
      }

      setLoading(prev => ({ ...prev, deleting: true }));
      
      // Mostrar loading toast
      loadingToastId = AlertService.loading(`Eliminando suscripción de "${organizacionNombre}"...`);
      
      const response = await suscripcionesOrganizacionService.deleteSuscripcionOrganizacion({
        id: suscripcion.suscripcionId,
        forceDelete: false,
        motivoEliminacion: suscripcion.estaVigente ? 'Cancelación de suscripción activa por solicitud del usuario' : 'Eliminación de suscripción vencida'
      });
      
      if (response.success) {
        // Actualizar loading a success
        AlertService.updateLoading(
          loadingToastId, 
          'success', 
          `Suscripción de "${organizacionNombre}" eliminada exitosamente`
        );
        await loadSuscripcionesPaginadas(suscripcionesPaginadas.pageNumber, suscripcionesPaginadas.pageSize, searchTerm, activeFiltersSuscripciones); // Recargar lista con parámetros actuales
      } else {
        // Manejar errores específicos del backend
        let errorMsg = response.message || 'Error al eliminar la suscripción';
        
        // Si hay errores específicos, concatenarlos al mensaje principal
        if (response.errors && response.errors.length > 0) {
          errorMsg = `${errorMsg}: ${response.errors.join(', ')}`;
        }
        
        AlertService.updateLoading(loadingToastId, 'error', errorMsg);
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al eliminar suscripción');
      
      if (loadingToastId) {
        AlertService.updateLoading(loadingToastId, 'error', errorMessage);
      } else {
        AlertService.error(errorMessage, {
          title: 'Error del sistema'
        });
      }
      
      console.error('Error deleting suscripción:', error);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [loadSuscripciones]);

  // Handler para eliminar plan
  const handleDeletePlan = useCallback(async (plan: PlanSuscripcionDto) => {
    let loadingToastId: string | undefined;
    
    try {
      // Verificar si el plan tiene suscripciones asociadas
      const suscripcionesAsociadas = suscripciones.filter(s => s.planId === plan.planId);
      
      if (suscripcionesAsociadas.length > 0) {
        AlertService.warning(
          `No se puede eliminar el plan "${plan.nombrePlan}" porque tiene ${suscripcionesAsociadas.length} suscripción(es) asociada(s). Para eliminar este plan, primero debe eliminar o reasignar todas las suscripciones.`, 
          {
            title: 'Eliminación no permitida'
          }
        );
        return;
      }

      // Mostrar confirmación
      const confirmed = await AlertService.confirm(
        `¿Estás seguro de eliminar el plan "${plan.nombrePlan}"? Esta acción no se puede deshacer.`, 
        {
          title: 'Confirmar eliminación',
          confirmText: 'Sí, eliminar',
          cancelText: 'Cancelar'
        }
      );
      
      if (!confirmed) {
        AlertService.info('Eliminación cancelada', {
          title: 'Operación cancelada'
        });
        return;
      }

      setLoading(prev => ({ ...prev, deleting: true }));
      
      // Mostrar loading toast
      loadingToastId = AlertService.loading(`Eliminando plan "${plan.nombrePlan}"...`);
      
      const response = await planesSuscripcionService.deletePlanSuscripcion({
        planId: plan.planId,
        forceDelete: false,
        desactivarEnLugarDeEliminar: false,
        migrarSuscripcionesExistentes: false,
        motivo: 'Eliminación de plan por solicitud del usuario'
      });
      
      if (response.success) {
        // Actualizar loading a success
        AlertService.updateLoading(
          loadingToastId, 
          'success', 
          `Plan "${plan.nombrePlan}" eliminado exitosamente`
        );
        await loadPlanesPaginadas(planesPaginados.pageNumber, planesPaginados.pageSize, searchTerm, activeFiltersPlanes); // Recargar lista con parámetros actuales
      } else {
        // Manejar errores específicos del backend
        const errorMsg = response.message || 'Error al eliminar el plan';
        AlertService.updateLoading(loadingToastId, 'error', errorMsg);
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al eliminar plan');
      
      if (loadingToastId) {
        AlertService.updateLoading(loadingToastId, 'error', errorMessage);
      } else {
        AlertService.error(errorMessage, {
          title: 'Error del sistema'
        });
      }
      
      console.error('Error deleting plan:', error);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [loadPlanes, suscripciones]);

  // Handler para extender suscripción
  const handleExtenderSuscripcion = useCallback(async () => {
    let loadingToastId: string | undefined;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors(prev => ({ ...prev, general: null }));

      // Validar formulario
      const validationErrors = validateExtenderForm(extenderForm);
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join('\n• ');
        AlertService.warning(`Por favor corrige los siguientes errores:\n\n• ${errorMessage}`, {
          title: 'Errores de validación',
          duration: 5000
        });
        return;
      }

      // Obtener datos de la suscripción para el mensaje
      const suscripcion = suscripciones.find(s => s.suscripcionId === extenderForm.suscripcionId);
      const organizacionNombre = suscripcion?.nombreComercial || suscripcion?.razonSocial || 'Cliente';
      
      // Mostrar alerta de loading
      loadingToastId = AlertService.loading(`Extendiendo suscripción de "${organizacionNombre}" por ${extenderForm.diasExtension} días...`);
      
      const request: ExtenderSuscripcionRequest = {
        id: extenderForm.suscripcionId,
        diasExtension: extenderForm.diasExtension,
        motivoOperacion: extenderForm.motivoOperacion
      };

      const response = await suscripcionesOrganizacionService.extenderSuscripcion(request);
      
      if (response.success) {
        AlertService.updateLoading(
          loadingToastId, 
          'success', 
          `Suscripción extendida exitosamente para "${organizacionNombre}"`
        );
        await loadSuscripcionesPaginadas(suscripcionesPaginadas.pageNumber, suscripcionesPaginadas.pageSize, searchTerm, activeFiltersSuscripciones);
        closeModal();
      } else {
        const errorMsg = response.message || 'Error al extender la suscripción';
        AlertService.updateLoading(loadingToastId, 'error', errorMsg);
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al extender suscripción');
      
      if (loadingToastId) {
        AlertService.updateLoading(loadingToastId, 'error', errorMessage);
      } else {
        AlertService.error(errorMessage, {
          title: 'Error del sistema'
        });
      }
      
      console.error('Error extendiendo suscripción:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [extenderForm, suscripciones, loadSuscripcionesPaginadas, suscripcionesPaginadas, searchTerm, activeFiltersSuscripciones, closeModal]);

  // Handler para renovar suscripción
  const handleRenovarSuscripcion = useCallback(async () => {
    let loadingToastId: string | undefined;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors(prev => ({ ...prev, general: null }));

      // Validar formulario
      const validationErrors = validateRenovarForm(renovarForm);
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join('\n• ');
        AlertService.warning(`Por favor corrige los siguientes errores:\n\n• ${errorMessage}`, {
          title: 'Errores de validación',
          duration: 5000 // 🔧 FIX: 5 segundos estándar
        });
        return;
      }

      // Obtener datos de la suscripción para el mensaje
      const suscripcion = suscripciones.find(s => s.suscripcionId === renovarForm.suscripcionId);
      const organizacionNombre = suscripcion?.nombreComercial || suscripcion?.razonSocial || 'Cliente';
      const planNombre = renovarForm.nuevoPlanId ? 
        planes.find(p => p.planId === renovarForm.nuevoPlanId)?.nombrePlan : 
        'mismo plan';
      
      // Mostrar alerta de loading
      loadingToastId = AlertService.loading(`Renovando suscripción de "${organizacionNombre}" con ${planNombre}...`);
      
      const request: RenovarSuscripcionRequest = {
        id: renovarForm.suscripcionId,
        nuevoPlanId: renovarForm.nuevoPlanId || undefined,
        motivoOperacion: renovarForm.motivoOperacion
      };

      const response = await suscripcionesOrganizacionService.renovarSuscripcion(request);
      
      if (response.success) {
        AlertService.updateLoading(
          loadingToastId, 
          'success', 
          `Suscripción renovada exitosamente para "${organizacionNombre}"`
        );
        await loadSuscripcionesPaginadas(suscripcionesPaginadas.pageNumber, suscripcionesPaginadas.pageSize, searchTerm, activeFiltersSuscripciones);
        closeModal();
      } else {
        const errorMsg = response.message || 'Error al renovar la suscripción';
        AlertService.updateLoading(loadingToastId, 'error', errorMsg);
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Error desconocido al renovar suscripción');
      
      if (loadingToastId) {
        AlertService.updateLoading(loadingToastId, 'error', errorMessage);
      } else {
        AlertService.error(errorMessage, {
          title: 'Error del sistema'
        });
      }
      
      console.error('Error renovando suscripción:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [renovarForm, suscripciones, planes, loadSuscripcionesPaginadas, suscripcionesPaginadas, searchTerm, activeFiltersSuscripciones, closeModal]);

  // Funciones de utilidad
  const getProgressPercentage = (usado: number, limite: number) => Math.min((usado / limite) * 100, 100);
  const getProgressClass = (percentage: number) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return '';
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  // Función para convertir fecha al formato de input date (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return dateToLocalString(date);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price);

  // Configuración de controles de filtro
  const filterControls: FilterControl[] = [
    {
      key: 'razonSocial',
      label: 'Razón Social',
      type: 'text',
      placeholder: 'Buscar por razón social...'
    },
    {
      key: 'numeroDocumento',
      label: 'Número de Documento',
      type: 'text',
      placeholder: 'Buscar por número de documento...'
    },
    {
      key: 'fechaConstitucionDesde',
      label: 'Fecha Constitución (Desde)',
      type: 'date',
      placeholder: 'Fecha desde...'
    },
    {
      key: 'fechaConstitucionHasta',
      label: 'Fecha Constitución (Hasta)',
      type: 'date',
      placeholder: 'Fecha hasta...'
    },
    {
      key: 'soloConSuscripcionVigente',
      label: 'Solo con suscripción vigente',
      type: 'checkbox',
      defaultValue: false
    },
    {
      key: 'soloConSuscripcionPorVencer',
      label: 'Solo con suscripción por vencer',
      type: 'checkbox',
      defaultValue: false
    }
  ];

  // Funciones del FilterModal
  const handleFilter = useCallback(async (filters: FilterValue, pagination: { page: number; pageSize: number }) => {
    setActiveFilters(filters);
    await loadOrganizacionesPaginadas(pagination.page, pagination.pageSize, searchTerm, filters);
  }, [loadOrganizacionesPaginadas, searchTerm]);

  const handleClearFilters = useCallback(() => {
    setActiveFilters({});
    setIsFilterModalOpen(false);
    loadOrganizacionesPaginadas(1, 10, searchTerm, {});
  }, [loadOrganizacionesPaginadas, searchTerm]);

  // Configuración de controles de filtro para planes
  const filterControlsPlanes: FilterControl[] = [
    {
      key: 'nombrePlan',
      label: 'Nombre del Plan',
      type: 'text',
      placeholder: 'Buscar por nombre del plan...'
    },
    {
      key: 'tipoPlan',
      label: 'Tipo de Plan',
      type: 'select',
      placeholder: 'Seleccionar tipo...',
      options: TIPOS_PLAN.map(tipo => ({
        value: tipo.value,
        label: tipo.label
      }))
    },
    {
      key: 'esPlanGratuito',
      label: 'Solo planes gratuitos',
      type: 'checkbox',
      defaultValue: false
    }
  ];

  // Configuración de controles de filtro para suscripciones
  const filterControlsSuscripciones: FilterControl[] = [
    {
      key: 'organizacionId',
      label: 'Organización',
      type: 'select',
      placeholder: 'Seleccionar organización...',
      options: organizaciones.map(org => ({
        value: org.organizacionId.toString(),
        label: `${org.nombreComercial || org.razonSocial} (${org.codigo})`
      }))
    },
    {
      key: 'planId',
      label: 'Plan',
      type: 'select',
      placeholder: 'Seleccionar plan...',
      options: planes.map(plan => ({
        value: plan.planId.toString(),
        label: `${plan.nombrePlan} - ${plan.tipoPlan}`
      }))
    },
    {
      key: 'esDemo',
      label: 'Solo suscripciones demo',
      type: 'checkbox',
      defaultValue: false
    },
    {
      key: 'soloVigentes',
      label: 'Solo suscripciones vigentes',
      type: 'checkbox',
      defaultValue: false
    }
  ];

  // Funciones del FilterModal para planes
  const handleFilterPlanes = useCallback(async (filters: FilterValue, pagination: { page: number; pageSize: number }) => {
    setActiveFiltersPlanes(filters);
    await loadPlanesPaginadas(pagination.page, pagination.pageSize, searchTerm, filters);
  }, [loadPlanesPaginadas, searchTerm]);

  const handleExportPlanes = useCallback(async (filters: FilterValue, pagination: { page: number; pageSize: number }) => {
    // Cargar todos los planes con los filtros aplicados
    const response = await planesSuscripcionService.getPlanesPaginated({
      Page: 1,
      PageSize: pagination.pageSize,
      OrderBy: 'fechaCreacion',
      OrderDescending: true,
      NombrePlan: filters.nombrePlan,
      TipoPlan: filters.tipoPlan,
      EsPlanGratuito: filters.esPlanGratuito
    });

    if (response.success && response.data) {
      const backendData = response.data as any;
      let items: PlanSuscripcionDto[] = [];
      
      if (Array.isArray(backendData.data)) {
        items = backendData.data;
      } else if (Array.isArray(backendData.items)) {
        items = backendData.items;
      } else if (Array.isArray(backendData)) {
        items = backendData;
      }

      // Formatear datos para exportación
      return items.map(plan => ({
        'ID Plan': plan.planId,
        'Nombre del Plan': plan.nombrePlan || '-',
        'Descripción': plan.descripcion || '-',
        'Tipo de Plan': plan.tipoPlanTexto || plan.tipoPlan || '-',
        'Límite Usuarios': plan.limiteUsuarios || 0,
        'Duración (días)': plan.duracionDias || 0,
        'Duración': plan.duracionTexto || `${plan.duracionDias} días`,
        'Precio': plan.precio ? formatPrice(plan.precio) : 'Gratuito',
        'Estado': plan.activo ? 'ACTIVO' : 'INACTIVO',
        'Es Plan Gratuito': plan.esPlanGratuito ? 'Sí' : 'No',
        'Es Plan Premium': plan.esPlanPremium ? 'Sí' : 'No',
        'Es Plan Popular': plan.esPlanPopular ? 'Sí' : 'No',
        'Total Suscripciones': plan.totalSuscripciones || 0,
        'Suscripciones Activas': plan.suscripcionesActivas || 0,
        'Suscripciones Vencidas': plan.suscripcionesVencidas || 0,
        'Organizaciones Suscritas': plan.organizacionesSuscritas || 0,
        'Fecha Creación': plan.fechaCreacion ? formatDate(plan.fechaCreacion) : '-',
        'Creado Por': plan.nombreUsuarioCreador || '-'
      }));
    }

    return [];
  }, [formatDate, formatPrice]);

  const handleClearFiltersPlanes = useCallback(() => {
    setActiveFiltersPlanes({});
    setIsFilterModalOpenPlanes(false);
    loadPlanesPaginadas(1, 10, searchTerm, {});
  }, [loadPlanesPaginadas, searchTerm]);

  // Funciones del FilterModal para suscripciones
  const handleFilterSuscripciones = useCallback(async (filters: FilterValue, pagination: { page: number; pageSize: number }) => {
    setActiveFiltersSuscripciones(filters);
    await loadSuscripcionesPaginadas(pagination.page, pagination.pageSize, searchTerm, filters);
  }, [loadSuscripcionesPaginadas, searchTerm]);

  const handleExportSuscripciones = useCallback(async (filters: FilterValue, pagination: { page: number; pageSize: number }) => {
    // Cargar todas las suscripciones con los filtros aplicados
    const response = await suscripcionesOrganizacionService.getSuscripcionesPaginated({
      PageNumber: 1,
      PageSize: pagination.pageSize,
      OrderBy: 'fechaCreacion',
      OrderDescending: true,
      SearchTerm: filters.searchTerm,
      OrganizacionId: filters.organizacionId ? parseInt(filters.organizacionId) : undefined,
      PlanId: filters.planId ? parseInt(filters.planId) : undefined,
      EsDemo: filters.esDemo,
      SoloVigentes: filters.soloVigentes
    });

    if (response.success && response.data) {
      const backendData = response.data as any;
      let items: SuscripcionOrganizacionDto[] = [];
      
      if (Array.isArray(backendData.data)) {
        items = backendData.data;
      } else if (Array.isArray(backendData.items)) {
        items = backendData.items;
      } else if (Array.isArray(backendData)) {
        items = backendData;
      }

      // Formatear datos para exportación
      return items.map(suscripcion => ({
        'ID Suscripción': suscripcion.suscripcionId,
        'Organización': suscripcion.nombreComercial || suscripcion.razonSocial || '-',
        'Código Organización': suscripcion.codigoOrganizacion || '-',
        'Email Organización': suscripcion.emailOrganizacion || '-',
        'Plan': suscripcion.nombrePlan || '-',
        'Tipo Plan': suscripcion.tipoPlan || '-',
        'Precio Plan': suscripcion.precioPlan ? formatPrice(suscripcion.precioPlan) : '-',
        'Duración Plan': `${suscripcion.duracionDiasPlan || 0} días`,
        'Fecha Inicio': suscripcion.fechaInicio ? formatDate(suscripcion.fechaInicio) : '-',
        'Fecha Fin': suscripcion.fechaFin ? formatDate(suscripcion.fechaFin) : '-',
        'Límite Usuarios': suscripcion.limiteUsuarios || 0,
        'Es Demo': suscripcion.esDemo ? 'Sí' : 'No',
        'Estado': suscripcion.estaVigente ? 'VIGENTE' : 'VENCIDA',
        'Días Restantes': suscripcion.diasRestantes || 0,
        'Está por Vencer': suscripcion.estaPorVencer ? 'Sí' : 'No',
        'Fecha Creación': suscripcion.fechaCreacion ? formatDate(suscripcion.fechaCreacion) : '-',
        'Versión': suscripcion.version || 0
      }));
    }

    return [];
  }, [formatDate, formatPrice]);

  const handleClearFiltersSuscripciones = useCallback(() => {
    setActiveFiltersSuscripciones({});
    setIsFilterModalOpenSuscripciones(false);
    loadSuscripcionesPaginadas(1, 10, searchTerm, {});
  }, [loadSuscripcionesPaginadas, searchTerm]);

  // Configuración de columnas para el Grid de organizaciones
  const organizacionesGridColumns: GridColumn<OrganizacionDto>[] = [
    {
      id: 'organizacion',
      header: 'Organización',
      accessor: (row) => row.razonSocial,
      width: '250px',
      sortable: true,
      render: (value, row) => (
                          <div className={styles.organizacionInfo}>
                            <div className={styles.organizacionLogo}>
            {row.logoUrl && row.logoUrl.trim() !== '' ? (
              <img
                src={row.logoUrl}
                alt={`Logo de ${row.nombreComercial || row.razonSocial}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                onError={(e) => {
                  // Si la imagen falla al cargar, mostrar las iniciales
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = (row.nombreComercial || row.razonSocial || 'OR').substring(0, 2).toUpperCase();
                  }
                }}
              />
            ) : (
              (row.nombreComercial || row.razonSocial || 'OR').substring(0, 2).toUpperCase()
            )}
                            </div>
                            <div className={styles.organizacionDetails}>
            <h4>{row.nombreComercial || row.razonSocial}</h4>
            <p>{row.codigo} • {row.email}</p>
                            </div>
                          </div>
      )
    },
    {
      id: 'plan',
      header: 'Plan Actual',
      accessor: (row) => row.nombrePlanActual,
      width: '150px',
      sortable: true,
      render: (value, row) => (
        row.nombrePlanActual ? (
                            <div className={styles.planInfo}>
            <span className={styles.planName}>{row.nombrePlanActual}</span>
                              <span className={styles.planType}>
              {row.suscripcionVigente ? 'VIGENTE' : 'VENCIDO'}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: colors.textSecondary }}>Sin plan</span>
        )
      )
    },
    {
      id: 'usuarios',
      header: 'Usuarios',
      accessor: (row) => row.totalUsuarios,
      width: '120px',
      sortable: true,
      render: (value, row) => {
        const usedUsers = row.totalUsuarios || 0;
        const limitUsers = row.limiteUsuarios || 0;
        const progressPercentage = limitUsers > 0 ? getProgressPercentage(usedUsers, limitUsers) : 0;
        
        return limitUsers > 0 ? (
                            <div className={styles.progressContainer}>
                              <div className={styles.progressInfo}>
                                <span>{usedUsers}</span>
                                <span>{limitUsers}</span>
                              </div>
                              <div className={styles.progressBar}>
                                <div 
                                  className={`${styles.progressFill} ${styles[getProgressClass(progressPercentage)]}`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span>-</span>
        );
      }
    },
    {
      id: 'estado',
      header: 'Estado Licencia',
      accessor: (row) => row.estadoLicencia,
      width: '120px',
      sortable: true,
      render: (value, row) => (
        <span className={`${styles.statusBadge} ${styles[getEstadoLicenciaClass(row.estadoLicencia)]}`}>
          {getEstadoLicenciaText(row.estadoLicencia)}
                          </span>
      )
    },
    {
      id: 'vencimiento',
      header: 'Vencimiento',
      accessor: (row) => row.fechaFinSuscripcion,
      width: '120px',
      sortable: true,
      render: (value, row) => (
        row.fechaFinSuscripcion ? (
                            <span className={styles.fechaVencimiento}>
            {formatDate(row.fechaFinSuscripcion)}
                            </span>
                          ) : (
                            <span>-</span>
        )
      )
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      width: '100px',
      actions: [
        {
          icon: 'Eye',
          color: '#10b981',
          onClick: (row) => openModal('view', 'organizaciones', row),
          tooltip: 'Ver detalles',
          disabled: (row) => loading.deleting
        },
        {
          icon: 'Edit',
          color: '#f59e0b',
          onClick: (row) => openModal('edit', 'organizaciones', row),
          tooltip: 'Editar',
          disabled: (row) => loading.deleting
        },
        {
          icon: 'Settings',
          color: '#6366f1',
          onClick: (row) => openGestionFamiliasModal(row),
          tooltip: 'Gestionar Familias de Sistemas',
          disabled: (row) => loading.deleting
        },
        {
          icon: 'Trash2',
          color: '#ef4444',
          onClick: (row) => handleDeleteOrganizacion(row),
          tooltip: 'Eliminar',
          disabled: (row) => loading.deleting
        }
      ]
    }
  ];

  // Configuración de columnas para el Grid de planes
  const planesGridColumns: GridColumn<PlanSuscripcionDto>[] = [
    {
      id: 'plan',
      header: 'Plan',
      accessor: (row) => row.nombrePlan,
      width: '250px',
      sortable: true,
      render: (value, row) => (
        <div className={styles.organizacionInfo}>
          <div className={styles.organizacionLogo} style={{
            backgroundColor: row.activo ? '#10b981' : '#6b7280',
            color: 'white'
          }}>
            {(row.nombrePlan || 'PL').substring(0, 2).toUpperCase()}
                          </div>
          <div className={styles.organizacionDetails}>
            <h4>{row.nombrePlan || 'Sin nombre'}</h4>
            <p>{row.descripcion || 'Sin descripción'}</p>
          </div>
            </div>
      )
    },
    {
      id: 'tipo',
      header: 'Tipo',
      accessor: (row) => row.tipoPlan,
      width: '120px',
      sortable: true,
      render: (value, row) => {
        const tipoPlan = row.tipoPlanTexto || row.tipoPlan || 'ESTÁNDAR';
        
        // Mapear tipos de plan a variantes de badge
        const getVariantForTipoPlan = (tipo: string) => {
          const tipoLower = tipo.toLowerCase();
          
          // Básico
          if (tipoLower === 'básico' || tipoLower === 'basico') {
            return 'success';
          }
          
          // Premium
          if (tipoLower === 'premium') {
            return 'warning';
          }
          
          // Empresarial
          if (tipoLower === 'empresarial' || tipoLower === 'enterprise') {
            return 'error';
          }
          
          // Demostración
          if (tipoLower === 'demostración' || tipoLower === 'demostracion' || tipoLower === 'demo') {
            return 'inactive';
          }
          
          // Estándar (default)
          return 'pending';
        };

        const variant = getVariantForTipoPlan(tipoPlan);
        
        // Renderizar badge custom para tipo de plan
        const badgeColors = {
          success: '#10b981',
          warning: '#f59e0b', 
          error: '#ef4444',
          inactive: '#6b7280',
          pending: '#8b5cf6'
        };
        
        const color = badgeColors[variant] || badgeColors.pending;

        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            borderRadius: '0.375rem',
            backgroundColor: color + '20',
            color: color,
            border: `1px solid ${color}40`,
            whiteSpace: 'nowrap'
          }}>
            <span style={{
              width: '0.375rem',
              height: '0.375rem',
              borderRadius: '50%',
              backgroundColor: color,
              flexShrink: 0
            }}></span>
            {String(tipoPlan)}
          </span>
        );
      }
    },
    {
      id: 'usuarios',
      header: 'Límite Usuarios',
      accessor: (row) => row.limiteUsuarios,
      width: '120px',
      sortable: true,
      render: (value, row) => (
        <div className={styles.limiteUsuarios}>
          <Users size={16} />
          <span>{row.limiteUsuarios || 'Ilimitado'}</span>
              </div>
      )
    },
    {
      id: 'precio',
      header: 'Precio',
      accessor: (row) => row.precio,
      width: '120px',
      sortable: true,
      render: (value, row) => (
        <div className={styles.precio}>
          <DollarSign size={16} />
          <span>{row.precio ? formatPrice(row.precio) : 'Gratuito'}</span>
          <small>/{row.duracionDias || 30} días</small>
        </div>
      )
    },
    {
      id: 'duracion',
      header: 'Duración',
      accessor: (row) => row.duracionDias,
      width: '120px',
      sortable: true,
      render: (value, row) => (
        <div className={styles.duracion}>
          <Calendar size={16} />
          <span>{row.duracionTexto || `${row.duracionDias || 30} días`}</span>
        </div>
      )
    },
    {
      id: 'estado',
      header: 'Estado',
      accessor: (row) => row.activo,
      width: '100px',
      sortable: true,
      render: (value, row) => {
        const isActive = Boolean(row.activo);
        
        // Renderizar badge custom para estado
        const badgeColors = {
          active: '#10b981',
          inactive: '#6b7280'
        };
        
        const variant = isActive ? 'active' : 'inactive';
        const label = isActive ? 'ACTIVO' : 'INACTIVO';
        const color = badgeColors[variant];
                    
                    return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            borderRadius: '0.375rem',
            backgroundColor: color + '20',
            color: color,
            border: `1px solid ${color}40`,
            whiteSpace: 'nowrap'
          }}>
            <span style={{
              width: '0.375rem',
              height: '0.375rem',
              borderRadius: '50%',
              backgroundColor: color,
              flexShrink: 0
            }}></span>
            {label}
          </span>
        );
      }
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      width: '100px',
      actions: [
        {
          icon: 'Eye',
          color: '#10b981',
          onClick: (row) => openModal('view', 'planes', row),
          tooltip: 'Ver detalles',
          disabled: (row) => loading.deleting
        },
        {
          icon: 'Edit',
          color: '#f59e0b',
          onClick: (row) => openModal('edit', 'planes', row),
          tooltip: 'Editar',
          disabled: (row) => loading.deleting
        },
        {
          icon: 'Trash2',
          color: '#ef4444',
          onClick: (row) => handleDeletePlan(row),
          tooltip: 'Eliminar',
          disabled: (row) => loading.deleting
        }
      ]
    }
  ];

  // Configuración de columnas para el Grid de suscripciones
  const suscripcionesGridColumns: GridColumn<SuscripcionOrganizacionDto>[] = [
    {
      id: 'cliente',
      header: 'Cliente',
      accessor: (row) => row.nombreComercial || row.razonSocial,
      width: '250px',
      sortable: true,
      render: (value, row) => (
                          <div className={styles.organizacionInfo}>
          <div className={styles.organizacionLogo} style={{
            backgroundColor: row.estaVigente ? '#10b981' : '#6b7280',
            color: 'white'
          }}>
            {(row.nombreComercial || row.razonSocial || 'CL').substring(0, 2).toUpperCase()}
                            </div>
                            <div className={styles.organizacionDetails}>
            <h4>{row.nombreComercial || row.razonSocial}</h4>
            <p>{row.codigoOrganizacion} • {row.emailOrganizacion}</p>
                            </div>
                          </div>
      )
    },
    {
      id: 'plan',
      header: 'Plan',
      accessor: (row) => row.nombrePlan,
      width: '180px',
      sortable: true,
      render: (value, row) => (
                          <div className={styles.planInfo}>
          <span className={styles.planName}>{row.nombrePlan}</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.125rem 0.375rem',
            fontSize: '0.625rem',
            fontWeight: '500',
            borderRadius: '0.25rem',
            backgroundColor: row.esDemo ? '#8b5cf6' + '20' : '#10b981' + '20',
            color: row.esDemo ? '#8b5cf6' : '#10b981',
            border: `1px solid ${row.esDemo ? '#8b5cf6' : '#10b981'}40`,
            whiteSpace: 'nowrap'
          }}>
            {row.esDemo ? 'DEMO' : 'COMERCIAL'}
                            </span>
                          </div>
      )
    },
    {
      id: 'vigencia',
      header: 'Vigencia',
      accessor: (row) => row.fechaFin,
      width: '180px',
      sortable: true,
      render: (value, row) => {
        const fechaInicio = formatDate(row.fechaInicio);
        const fechaFin = formatDate(row.fechaFin);
        
        // Usar los datos ya mapeados del backend
        const diasRestantes = row.diasRestantes;
        const estaPorVencer = row.estaPorVencer;
        const estaVencida = diasRestantes <= 0;
        
        return (
                          <div className={styles.vigenciaInfo}>
                            <div className={styles.fechas}>
                              <span className={styles.fechaInicio}>
                                <Calendar size={12} />
                {fechaInicio}
                              </span>
                              <span className={styles.fechaFin}>
                                <CalendarDays size={12} />
                {fechaFin}
                              </span>
                            </div>
                            <div className={styles.diasRestantes}>
                              {diasRestantes > 0 ? (
                <span style={{
                  color: estaPorVencer ? '#f59e0b' : '#10b981',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                                  <Clock size={12} />
                                  {diasRestantes} días restantes
                                </span>
                              ) : (
                <span style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                                  <AlertCircle size={12} />
                                  Vencida hace {Math.abs(diasRestantes)} días
                                </span>
                              )}
                            </div>
                          </div>
        );
      }
    },
    {
      id: 'estado',
      header: 'Estado',
      accessor: (row) => row.estaVigente,
      width: '120px',
      sortable: true,
      render: (value, row) => {
        // Usar los datos ya mapeados del backend  
        const diasRestantes = row.diasRestantes;
        const estaPorVencer = row.estaPorVencer;
        const estaVencida = diasRestantes <= 0;
        
        const estado = estaVencida ? 'vencida' : estaPorVencer ? 'warning' : 'activa';
        const label = estaVencida ? 'VENCIDA' : estaPorVencer ? 'POR VENCER' : 'VIGENTE';
        const colors = {
          activa: '#10b981',
          warning: '#f59e0b', 
          vencida: '#ef4444'
        };
        
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            borderRadius: '0.375rem',
            backgroundColor: colors[estado] + '20',
            color: colors[estado],
            border: `1px solid ${colors[estado]}40`,
            whiteSpace: 'nowrap'
          }}>
            <span style={{
              width: '0.375rem',
              height: '0.375rem',
              borderRadius: '50%',
              backgroundColor: colors[estado],
              flexShrink: 0
            }}></span>
            {label}
                          </span>
        );
      }
    },
    {
      id: 'usuarios',
      header: 'Usuarios',
      accessor: (row) => row.limiteUsuarios,
      width: '120px',
      sortable: true,
      render: (value, row) => (
                          <div className={styles.limiteUsuarios}>
                            <Users size={16} />
          <span>{row.limiteUsuarios || 'Ilimitado'}</span>
                          </div>
      )
    },
    {
      id: 'precio',
      header: 'Precio',
      accessor: (row) => row.precioPlan,
      width: '120px',
      sortable: true,
      render: (value, row) => (
                          <div className={styles.precio}>
                            <DollarSign size={16} />
          <span>{formatPrice(row.precioPlan || 0)}</span>
          <small>/{row.duracionDiasPlan} días</small>
                          </div>
      )
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      width: '150px',
      actions: [
        {
          icon: 'Eye',
          color: '#10b981',
          onClick: (row) => openModal('view', 'suscripciones', row),
          tooltip: 'Ver detalles',
          disabled: (row) => loading.deleting
        },
        {
          icon: 'Edit',
          color: '#f59e0b',
          onClick: (row) => openModal('edit', 'suscripciones', row),
          tooltip: 'Editar',
          disabled: (row) => loading.deleting
        },
        {
          icon: 'Clock',
          color: '#3b82f6',
          onClick: (row) => openModal('extender', 'suscripciones', row),
          tooltip: 'Extender',
          disabled: (row) => loading.deleting || !row.estaVigente
        },
        {
          icon: 'RefreshCw',
          color: '#8b5cf6',
          onClick: (row) => openModal('renovar', 'suscripciones', row),
          tooltip: 'Renovar',
          disabled: (row) => loading.deleting
        },
        {
          icon: 'Trash2',
          color: '#ef4444',
          onClick: (row) => handleDeleteSuscripcion(row),
          tooltip: 'Eliminar',
          disabled: (row) => loading.deleting
        }
      ]
    }
  ];

  const getEstadoLicenciaText = (estado: number | null) => {
    switch (estado) {
      case EstadoLicencia.Activa: return 'ACTIVA';
      case EstadoLicencia.Suspendida: return 'SUSPENDIDA';
      case EstadoLicencia.Vencida: return 'VENCIDA';
      default: return 'INACTIVA';
    }
  };

  const handleExport = useCallback(async (filters: FilterValue, pagination: { page: number; pageSize: number }) => {
    // Cargar todas las organizaciones con los filtros aplicados
    const response = await organizacionesService.getOrganizacionesPaginated({
      Page: 1,
      PageSize: pagination.pageSize,
      OrderBy: 'fechaCreacion',
      OrderDescending: true,
      RazonSocial: filters.razonSocial,
      NumeroDocumento: filters.numeroDocumento,
      FechaConstitucionDesde: filters.fechaConstitucionDesde,
      FechaConstitucionHasta: filters.fechaConstitucionHasta,
      SoloConSuscripcionVigente: filters.soloConSuscripcionVigente,
      SoloConSuscripcionPorVencer: filters.soloConSuscripcionPorVencer
    } as any);

    if (response.success && response.data) {
      const backendData = response.data as any;
      let items: OrganizacionDto[] = [];
      
      if (Array.isArray(backendData.data)) {
        items = backendData.data;
      } else if (Array.isArray(backendData.items)) {
        items = backendData.items;
      } else if (Array.isArray(backendData)) {
        items = backendData;
      }

      // Formatear datos para exportación
      return items.map(org => ({
        'Código': org.codigo,
        'Razón Social': org.razonSocial,
        'Nombre Comercial': org.nombreComercial || '-',
        'Tipo Documento': org.tipoDocumentoTexto,
        'Número Documento': org.numeroDocumento,
        'Email': org.email,
        'Teléfono': org.telefono || '-',
        'Página Web': org.paginaWeb || '-',
        'Dirección': org.direccion || '-',
        'Fecha Constitución': org.fechaConstitucion ? formatDate(org.fechaConstitucion) : '-',
        'Plan Actual': org.nombrePlanActual || 'Sin plan',
        'Estado Licencia': getEstadoLicenciaText(org.estadoLicencia),
        'Usuarios': org.totalUsuarios || 0,
        'Límite Usuarios': org.limiteUsuarios || 0,
        'Fecha Vencimiento': org.fechaFinSuscripcion ? formatDate(org.fechaFinSuscripcion) : '-'
      }));
    }

    return [];
  }, [formatDate, getEstadoLicenciaText]);

  const getEstadoLicenciaClass = (estado: number | null) => {
    switch (estado) {
      case EstadoLicencia.Activa: return 'activa';
      case EstadoLicencia.Suspendida: return 'suspendida';
      case EstadoLicencia.Vencida: return 'vencida';
      default: return 'inactiva';
    }
  };

  // Función para cambiar de tab y limpiar búsqueda
  const handleTabChange = useCallback((newTab: TabType) => {
    // Cambiar el tab activo
    setActiveTab(newTab);
    
    // Limpiar el término de búsqueda
    setSearchTerm('');
    
    // Limpiar filtros activos del tab anterior
    if (activeTab === 'organizaciones') {
      setActiveFilters({});
    } else if (activeTab === 'planes') {
      setActiveFiltersPlanes({});
    } else if (activeTab === 'suscripciones') {
      setActiveFiltersSuscripciones({});
    }
  }, [activeTab]);

  // Datos para tabs
  const tabsData = [
    { id: 'organizaciones' as TabType, label: 'Clientes', icon: Building2, count: organizacionesPaginadas?.totalCount || 0 },
    { id: 'planes' as TabType, label: 'Planes', icon: Package, count: planesPaginados?.totalCount || 0 },
    { id: 'suscripciones' as TabType, label: 'Suscripciones', icon: Shield, count: suscripcionesPaginadas?.totalCount || 0 }
  ];

  // Render del contenido de tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'organizaciones':
        if (loading.organizaciones) {
          return (
            <div className={styles.loadingContainer}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p>Cargando organizaciones...</p>
                          </div>
          );
        }

        if (errors.organizaciones) {
          return (
            <div className={styles.errorContainer}>
              <AlertCircle size={48} />
              <h3>Error al cargar organizaciones</h3>
              <p>{errors.organizaciones}</p>
              <Button
                variant="default"
                size="m"
                iconName="RefreshCw"
                onClick={() => loadOrganizacionesPaginadas(organizacionesPaginadas.pageNumber, organizacionesPaginadas.pageSize, searchTerm, activeFilters)}
              >
                Reintentar
              </Button>
          </div>
        );
        }

        return (
          <Grid
            columns={organizacionesGridColumns}
            data={organizacionesPaginadas?.items || []}
            loading={loading.organizaciones}
            emptyMessage="No hay clientes que coincidan con tu búsqueda"
            serverSide={true}
            totalItems={organizacionesPaginadas?.totalCount || 0}
            totalPages={organizacionesPaginadas?.totalPages || 0} // 🔧 Agregar totalPages
            pageSize={currentPageSizeOrganizaciones}
            initialPage={organizacionesPaginadas?.pageNumber || 1}
            onPageChange={(page) => loadOrganizacionesPaginadas(page, currentPageSizeOrganizaciones, searchTerm)}
            onPageSizeChange={(pageSize) => {
              setCurrentPageSizeOrganizaciones(pageSize);
              loadOrganizacionesPaginadas(1, pageSize, searchTerm);
            }}
          />
        );

      case 'suscripciones':
        if (loading.suscripciones) {
          return (
            <div className={styles.loadingContainer}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p>Cargando suscripciones...</p>
            </div>
          );
        }

        if (errors.suscripciones) {
          return (
            <div className={styles.errorContainer}>
              <AlertCircle size={48} />
              <h3>Error al cargar suscripciones</h3>
              <p>{errors.suscripciones}</p>
              <Button
                variant="default"
                size="m"
                iconName="RefreshCw"
                onClick={() => loadSuscripcionesPaginadas(suscripcionesPaginadas.pageNumber, suscripcionesPaginadas.pageSize, searchTerm, activeFiltersSuscripciones)}
              >
                Reintentar
              </Button>
            </div>
          );
        }

        return (
          <Grid
            columns={suscripcionesGridColumns}
            data={suscripcionesPaginadas?.items || []}
            loading={loading.suscripciones}
            emptyMessage="No hay suscripciones que coincidan con tu búsqueda"
            serverSide={true}
            totalItems={suscripcionesPaginadas?.totalCount || 0}
            totalPages={suscripcionesPaginadas?.totalPages || 0} // 🔧 Agregar totalPages
            pageSize={currentPageSizeSuscripciones}
            initialPage={suscripcionesPaginadas?.pageNumber || 1}
            onPageChange={(page) => loadSuscripcionesPaginadas(page, currentPageSizeSuscripciones, searchTerm, activeFiltersSuscripciones)}
            onPageSizeChange={(pageSize) => {
              setCurrentPageSizeSuscripciones(pageSize);
              loadSuscripcionesPaginadas(1, pageSize, searchTerm, activeFiltersSuscripciones);
            }}
          />
        );

      case 'planes':
          return (
          <Grid
            columns={planesGridColumns}
            data={planesPaginados.items || []}
            loading={loading.planes}
            emptyMessage="No hay planes disponibles"
            serverSide={true}
            totalItems={planesPaginados.totalCount}
            totalPages={planesPaginados.totalPages} // 🔧 Agregar totalPages
            pageSize={currentPageSizePlanes}
            initialPage={planesPaginados.pageNumber}
            onPageChange={(page) => loadPlanesPaginadas(page, currentPageSizePlanes, searchTerm, activeFiltersPlanes)}
            onPageSizeChange={(pageSize) => {
              setCurrentPageSizePlanes(pageSize);
              loadPlanesPaginadas(1, pageSize, searchTerm, activeFiltersPlanes);
            }}
          />
        );

      default:
        return null;
    }
  };

  // Render del contenido del modal
  const renderModalContent = () => {
    if (modal.mode === 'view' && modal.type === 'organizaciones') {
      const org = modal.data as OrganizacionDto;
      
      // Convertir datos para mostrar en formato de formulario
      const viewForm: OrganizacionFormData = {
        codigo: org.codigo || '',
        razonSocial: org.razonSocial || '',
        nombreComercial: org.nombreComercial || '',
        tipoDocumento: org.tipoDocumento || TipoDocumento.RUC,
        numeroDocumento: org.numeroDocumento || '',
        sector: org.sector || null,
        industria: org.industria || null,
        pais: org.pais || null,
        departamento: org.departamento || null,
        provincia: org.provincia || null,
        distrito: org.distrito || null,
        direccion: org.direccion || '',
        telefono: org.telefono || '',
        email: org.email || '',
        paginaWeb: org.paginaWeb || '',
        mision: org.mision || '',
        vision: org.vision || '',
        valoresCorporativos: org.valoresCorporativos || '',
        fechaConstitucion: org.fechaConstitucion || '',
        fechaInicioOperaciones: org.fechaInicioOperaciones || '',
        logoUrl: org.logoUrl || '',
        colorPrimario: org.colorPrimario || '#6366f1',
        colorSecundario: org.colorSecundario || '#f1f5f9',
        suscripcionActualId: org.suscripcionActualId || null,
        estadoLicencia: org.estadoLicencia || null,
        instancia: org.instancia || '',
        dominio: org.dominio || '',
        tenantId: org.tenantId || '',
        clientId: org.clientId || '',
        clientSecret: (org as any).clientSecret || '',
        callbackPath: org.callbackPath || '',
      };

      return (
        <div className={styles.modalForm}>
          {/* Información Principal */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Building2 size={20} />
              Información Principal
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Código
              </label>
              <Input
                type="text"
                value={viewForm.codigo}
                placeholder="Generado automáticamente"
                icon="Hash"
                disabled={true}
              />
              <div className={styles.formHint}>
                Código único identificador generado automáticamente
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Razón Social <span className={styles.required}>*</span>
              </label>
              <Input
                type="text"
                value={viewForm.razonSocial}
                placeholder="Razón social completa de la empresa"
                icon="Building2"
                disabled={true}
              />
              <div className={styles.formHint}>
                {viewForm.razonSocial.length}/300 caracteres
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Nombre Comercial
              </label>
              <Input
                type="text"
                value={viewForm.nombreComercial}
                placeholder="Nombre comercial público"
                icon="Store"
                disabled={true}
              />
              <div className={styles.formHint}>
                Nombre con el que es conocida la empresa
                {viewForm.nombreComercial && (
                  <span style={{ marginLeft: '8px' }}>
                    ({viewForm.nombreComercial.length}/200 caracteres)
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Tipo de Documento
              </label>
              <Select
                value={viewForm.tipoDocumento?.toString() || TipoDocumento.RUC.toString()}
                disabled={true}
              >
                <SelectTrigger icon="FileText">
                  <SelectValue placeholder="Seleccionar tipo de documento..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoDocumento.RUC.toString()}>RUC</SelectItem>
                  <SelectItem value={TipoDocumento.DNI.toString()}>DNI</SelectItem>
                  <SelectItem value={TipoDocumento.Pasaporte.toString()}>Pasaporte</SelectItem>
                  <SelectItem value={TipoDocumento.CarnetExtranjeria.toString()}>Carnet de Extranjería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Número de Documento
              </label>
              <Input
                type="text"
                value={viewForm.numeroDocumento}
                placeholder="Número de documento"
                icon="Hash"
                disabled={true}
              />
              {viewForm.numeroDocumento && (
                <div className={styles.formHint}>
                  {viewForm.numeroDocumento.length}/50 caracteres
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Sector Económico
              </label>
              <SearchableSelect
                value={viewForm.sector?.toString() || ''}
                options={[
                  { value: '', label: 'Seleccionar sector...' },
                  ...Object.values(SectorEconomico).filter(v => typeof v === 'number').map(sector => ({
                    value: sector.toString(),
                    label: getSectorEconomicoText(sector as number)
                  }))
                ]}
                placeholder="Buscar sector..."
                icon={Tag}
                disabled={true}
              />
          </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Industria
              </label>
              <SearchableSelect
                value={viewForm.industria?.toString() || ''}
                options={[
                  { value: '', label: 'Seleccionar industria...' },
                  ...Object.values(Industria).filter(v => typeof v === 'number').map(industria => ({
                    value: industria.toString(),
                    label: getIndustriaText(industria as number)
                  }))
                ]}
                placeholder="Buscar industria..."
                icon={Tag}
                disabled={true}
              />
            </div>
          </div>

          {/* Información de Contacto */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Mail size={20} />
              Información de Contacto
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Email Corporativo <span className={styles.required}>*</span>
              </label>
              <Input
                type="email"
                value={viewForm.email}
                placeholder="contacto@empresa.com"
                icon="Mail"
                disabled={true}
              />
              <div className={styles.formHint}>
                Email principal para comunicaciones oficiales
                {viewForm.email && (
                  <span style={{ marginLeft: '8px' }}>
                    ({viewForm.email.length}/200 caracteres)
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Teléfono
              </label>
              <Input
                type="tel"
                value={viewForm.telefono}
                placeholder="+51 1 234-5678"
                icon="Phone"
                disabled={true}
              />
              {viewForm.telefono && (
                <div className={styles.formHint}>
                  {viewForm.telefono.length}/50 caracteres
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Página Web
              </label>
              <Input
                type="url"
                value={viewForm.paginaWeb}
                placeholder="https://www.empresa.com"
                icon="Globe"
                disabled={true}
              />
              {viewForm.paginaWeb && (
                <div className={styles.formHint}>
                  {viewForm.paginaWeb.length}/300 caracteres
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Dirección
              </label>
              <Textarea
                value={viewForm.direccion}
                placeholder="Dirección completa de la empresa"
                rows={3}
                disabled={true}
              />
              {viewForm.direccion && (
                <div className={styles.formHint}>
                  {viewForm.direccion.length}/500 caracteres
                </div>
              )}
            </div>
          </div>

          {/* Ubicación Geográfica */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Globe size={20} />
              Ubicación Geográfica
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                País
              </label>
              <SearchableSelect
                value={viewForm.pais?.toString() || ''}
                options={paises.map(pais => ({
                  value: pais.ubigeoId.toString(),
                  label: pais.nombre
                }))}
                placeholder="Seleccionar país..."
                icon={Globe}
                disabled={true}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Departamento
              </label>
              <SearchableSelect
                value={viewForm.departamento?.toString() || ''}
                options={departamentos.map(dep => ({
                  value: dep.ubigeoId.toString(),
                  label: dep.nombre
                }))}
                placeholder="Seleccionar departamento..."
                icon={Building2}
                disabled={true}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Provincia
              </label>
              <SearchableSelect
                value={viewForm.provincia?.toString() || ''}
                options={provincias.map(prov => ({
                  value: prov.ubigeoId.toString(),
                  label: prov.nombre
                }))}
                placeholder="Seleccionar provincia..."
                icon={Building2}
                disabled={true}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Distrito
              </label>
              <SearchableSelect
                value={viewForm.distrito?.toString() || ''}
                options={distritos.map(dist => ({
                  value: dist.ubigeoId.toString(),
                  label: dist.nombre
                }))}
                placeholder="Seleccionar distrito..."
                icon={Building2}
                disabled={true}
              />
            </div>
          </div>

          {/* Información Corporativa */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Target size={20} />
              Información Corporativa
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Misión
              </label>
              <Textarea
                value={viewForm.mision}
                placeholder="Misión de la empresa"
                rows={3}
                disabled={true}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Visión
              </label>
              <Textarea
                value={viewForm.vision}
                placeholder="Visión de la empresa"
                rows={3}
                disabled={true}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Valores Corporativos
              </label>
              <Textarea
                value={viewForm.valoresCorporativos}
                placeholder="Valores corporativos de la empresa"
                rows={3}
                disabled={true}
              />
            </div>
          </div>

          {/* Fechas Importantes e Identidad Visual */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalFormColumnLeft}>
              {/* Fechas Importantes */}
              <div className={styles.modalFormSection}>
                <div className={styles.modalSectionTitle}>
                  <CalendarDays size={20} />
                  Fechas Importantes
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <CalendarDays size={16} />
                    Fecha de Constitución
                  </label>
                  <Input
                    type="date"
                    value={viewForm.fechaConstitucion}
                    placeholder="Seleccionar fecha de constitución..."
                    icon="CalendarDays"
                    disabled={true}
                  />
                  <div className={styles.formHint}>Fecha de constitución legal de la empresa</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <CalendarDays size={16} />
                    Fecha de Inicio de Operaciones
                  </label>
                  <Input
                    type="date"
                    value={viewForm.fechaInicioOperaciones}
                    placeholder="Seleccionar fecha de inicio de operaciones..."
                    icon="CalendarDays"
                    disabled={true}
                  />
                  <div className={styles.formHint}>Fecha de inicio real de operaciones comerciales</div>
                </div>
              </div>

              {/* Identidad Visual */}
              <div className={styles.modalFormSection}>
                <div className={styles.modalSectionTitle}>
                  <Award size={20} />
                  Identidad Visual
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Logotipo
                  </label>
                  <div className={styles.logoContainer}>
                    {viewForm.logoUrl ? (
                      <img src={viewForm.logoUrl} alt="Logo" className={styles.logoPreview} />
                    ) : (
                      <div className={styles.logoPlaceholder}>Sin logo</div>
                    )}
                  </div>
                  <div className={styles.formHint}>Logotipo de la empresa</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Color Primario
                  </label>
                  <div className={styles.colorInputContainer}>
                    <Input
                      type="color"
                      value={viewForm.colorPrimario}
                      icon="Settings"
                      disabled={true}
                    />
                    <div className={styles.colorPreview}>
                      <div 
                        className={styles.colorCircle}
                        style={{ backgroundColor: viewForm.colorPrimario }}
                      ></div>
                      <span className={styles.colorValue}>{viewForm.colorPrimario}</span>
                    </div>
                  </div>
                  <div className={styles.formHint}>Color principal de la marca</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Color Secundario
                  </label>
                  <div className={styles.colorInputContainer}>
                    <Input
                      type="color"
                      value={viewForm.colorSecundario}
                      icon="Settings"
                      disabled={true}
                    />
                    <div className={styles.colorPreview}>
                      <div 
                        className={styles.colorCircle}
                        style={{ backgroundColor: viewForm.colorSecundario }}
                      ></div>
                      <span className={styles.colorValue}>{viewForm.colorSecundario}</span>
                    </div>
                  </div>
                  <div className={styles.formHint}>Color secundario de la marca</div>
                </div>
              </div>
            </div>
          </div>

          {/* Acceso Corporativo */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalFormColumnLeft}>
              <div className={styles.modalFormSection}>
                <div className={styles.modalSectionTitle}>
                  <Settings size={20} />
                  Acceso Corporativo - Credenciales de Usuario
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Instancia del Sistema
                  </label>
                  <Input
                    type="text"
                    value={viewForm.instancia}
                    placeholder="Ej: prod, dev, test"
                    icon="Settings"
                    disabled={true}
                  />
                  <div className={styles.formHint}>Entorno donde operará el acceso de usuarios (producción, desarrollo, pruebas)</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Dominio Corporativo
                  </label>
                  <Input
                    type="text"
                    value={viewForm.dominio}
                    placeholder="empresa.com"
                    icon="Globe"
                    disabled={true}
                  />
                  <div className={styles.formHint}>
                    Dominio de la empresa para el login de usuarios (ej: usuario@empresa.com)
                    {viewForm.dominio && (
                      <span style={{ marginLeft: '8px' }}>
                        ({viewForm.dominio.length}/300 caracteres)
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    ID del Tenant (Azure AD)
                  </label>
                  <Input
                    type="text"
                    value={viewForm.tenantId}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    icon="Hash"
                    disabled={true}
                  />
                  <div className={styles.formHint}>
                    Identificador del directorio de Azure AD donde están los usuarios corporativos
                    {viewForm.tenantId && (
                      <span style={{ marginLeft: '8px' }}>
                        ({viewForm.tenantId.length}/50 caracteres)
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    ID de Aplicación (Client ID)
                  </label>
                  <Input
                    type="text"
                    value={viewForm.clientId}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    icon="Hash"
                    disabled={true}
                  />
                  <div className={styles.formHint}>
                    ID de la aplicación registrada en Azure AD para el acceso de usuarios
                    {viewForm.clientId && (
                      <span style={{ marginLeft: '8px' }}>
                        ({viewForm.clientId.length}/50 caracteres)
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Ruta de Callback
                  </label>
                  <Input
                    type="text"
                    value={viewForm.callbackPath}
                    placeholder="/signin-oidc"
                    icon="Hash"
                    disabled={true}
                  />
                  <div className={styles.formHint}>
                    URL donde Azure AD redirige a los usuarios después del login exitoso
                    {viewForm.callbackPath && (
                      <span style={{ marginLeft: '8px' }}>
                        ({viewForm.callbackPath.length}/150 caracteres)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (modal.mode === 'view' && modal.type === 'planes') {
      const plan = modal.data as PlanSuscripcion;
      return (
        <div className={styles.modalViewContent}>
          <div className={styles.modalViewSection}>
            <div className={styles.modalViewSectionTitle}>
              <Package size={20} />
              Información del Plan
            </div>
            
            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Tag size={14} />
                Nombre del Plan
              </div>
              <div className={styles.modalViewValue}>{plan.nombrePlan}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <FileText size={14} />
                Descripción
              </div>
              <div className={styles.modalViewValue}>{plan.descripcion || 'No especificada'}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Settings size={14} />
                Tipo de Plan
              </div>
              <div className={styles.modalViewValue}>
                <span className={`${styles.planType} ${plan.tipoPlan?.toLowerCase()}`}>
                  {plan.tipoPlan || 'ESTÁNDAR'}
                </span>
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Users size={14} />
                Límite de Usuarios
              </div>
              <div className={styles.modalViewValue}>
                {plan.limiteUsuarios ? `${plan.limiteUsuarios} usuarios` : 'Ilimitado'}
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Calendar size={14} />
                Duración
              </div>
              <div className={styles.modalViewValue}>{plan.duracionDias || 30} días</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <DollarSign size={14} />
                Precio
              </div>
              <div className={styles.modalViewValue}>{formatPrice(plan.precio || 0)}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Settings size={14} />
                Estado
              </div>
              <div className={styles.modalViewValue}>
                <span className={`${styles.statusBadge} ${plan.activo ? 'activa' : 'inactiva'}`}>
                  {plan.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.modalViewSection}>
            <div className={styles.modalViewSectionTitle}>
              <Clock size={20} />
              Información de Auditoría
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <CalendarDays size={14} />
                Fecha de Creación
              </div>
              <div className={styles.modalViewValue}>{formatDate(plan.fechaCreacion)}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <CalendarDays size={14} />
                Última Actualización
              </div>
              <div className={styles.modalViewValue}>{formatDate(plan.fechaActualizacion)}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Hash size={14} />
                Versión
              </div>
              <div className={styles.modalViewValue}>{plan.version || 1}</div>
            </div>
          </div>
        </div>
      );
    } else if (modal.mode === 'view' && modal.type === 'suscripciones') {
      const suscripcion = modal.data as SuscripcionEnriquecida;
      // Usar valores del backend en lugar de recalcular
      const diasRestantes = suscripcion.diasRestantes;
      const estaPorVencer = suscripcion.estaPorVencer;
      const estaVencida = diasRestantes <= 0;
      
      return (
        <div className={styles.modalViewContent}>
          <div className={styles.modalViewSection}>
            <div className={styles.modalViewSectionTitle}>
              <Shield size={20} />
              Información de la Suscripción
            </div>
            
            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Hash size={14} />
                ID Suscripción
              </div>
              <div className={styles.modalViewValue}>{suscripcion.suscripcionId}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Building2 size={14} />
                Cliente
              </div>
              <div className={styles.modalViewValue}>
                <div>
                  <strong>{suscripcion.razonSocial}</strong>
                  <br />
                  <small>{suscripcion.codigoOrganizacion} • {suscripcion.emailOrganizacion}</small>
                </div>
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Package size={14} />
                Plan
              </div>
              <div className={styles.modalViewValue}>
                <div>
                  <strong>{suscripcion.nombrePlan}</strong>
                  <br />
                  <span className={`${styles.planType} ${suscripcion.tipoPlan?.toLowerCase()}`}>
                    {suscripcion.esDemo ? 'DEMO' : suscripcion.tipoPlan}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Settings size={14} />
                Estado
              </div>
              <div className={styles.modalViewValue}>
                <span className={`${styles.statusBadge} ${
                  estaVencida ? 'vencida' : 
                  estaPorVencer ? 'warning' : 
                  'activa'
                }`}>
                  {estaVencida ? 'VENCIDA' : 
                   estaPorVencer ? 'POR VENCER' : 
                   'VIGENTE'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.modalViewSection}>
            <div className={styles.modalViewSectionTitle}>
              <Calendar size={20} />
              Información de Vigencia
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Calendar size={14} />
                Fecha de Inicio
              </div>
              <div className={styles.modalViewValue}>{formatDate(suscripcion.fechaInicio)}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <CalendarDays size={14} />
                Fecha de Fin
              </div>
              <div className={styles.modalViewValue}>{formatDate(suscripcion.fechaFin)}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Clock size={14} />
                Días Restantes
              </div>
              <div className={styles.modalViewValue}>
                {diasRestantes > 0 ? (
                  <span className={estaPorVencer ? styles.porVencer : styles.vigente}>
                    {diasRestantes} días restantes
                  </span>
                ) : (
                  <span className={styles.vencida}>
                    Vencida hace {Math.abs(diasRestantes)} días
                  </span>
                )}
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Users size={14} />
                Límite de Usuarios
              </div>
              <div className={styles.modalViewValue}>
                {suscripcion.limiteUsuarios || 'Ilimitado'}
              </div>
            </div>
          </div>

          <div className={styles.modalViewSection}>
            <div className={styles.modalViewSectionTitle}>
              <DollarSign size={20} />
              Información Comercial
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <DollarSign size={14} />
                Precio del Plan
              </div>
              <div className={styles.modalViewValue}>
                {formatPrice(suscripcion.precioPlan)}
                <small> / {suscripcion.duracionDiasPlan} días</small>
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Tag size={14} />
                Tipo de Suscripción
              </div>
              <div className={styles.modalViewValue}>
                {suscripcion.esDemo ? 'Demostración' : 'Comercial'}
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <CalendarDays size={14} />
                Fecha de Creación
              </div>
              <div className={styles.modalViewValue}>{formatDate(suscripcion.fechaCreacion)}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Hash size={14} />
                Versión
              </div>
              <div className={styles.modalViewValue}>{suscripcion.version}</div>
            </div>
          </div>
        </div>
      );
    } else if ((modal.mode === 'create' || modal.mode === 'edit') && modal.type === 'organizaciones') {
      return (
        <div className={styles.modalForm}>
          {/* Información Principal */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Building2 size={20} />
              Información Principal
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Código
              </label>
              <Input
                type="text"
                value={organizacionForm.codigo}
                onChange={(e) => setOrganizacionForm({...organizacionForm, codigo: e.target.value})}
                placeholder="Generado automáticamente"
                icon="Hash"
                disabled={true} // Siempre deshabilitado
              />
              <div className={styles.formHint}>
                Código único identificador generado automáticamente
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Razón Social <span className={styles.required}>*</span>
              </label>
              <Input
                type="text"
                value={organizacionForm.razonSocial}
                onChange={(e) => setOrganizacionForm({...organizacionForm, razonSocial: e.target.value})}
                placeholder="Razón social completa de la empresa"
                icon="Building2"
                required
              />
              <div className={styles.formHint}>
                {organizacionForm.razonSocial.length}/300 caracteres
                {organizacionForm.razonSocial.length > 300 && (
                  <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                    ⚠️ Excede el límite de caracteres
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Nombre Comercial
              </label>
              <Input
                type="text"
                value={organizacionForm.nombreComercial}
                onChange={(e) => setOrganizacionForm({...organizacionForm, nombreComercial: e.target.value})}
                placeholder="Nombre comercial público"
                icon="Store"
              />
              <div className={styles.formHint}>
                Nombre con el que es conocida la empresa
                {organizacionForm.nombreComercial && (
                  <span style={{ marginLeft: '8px' }}>
                    ({organizacionForm.nombreComercial.length}/200 caracteres)
                    {organizacionForm.nombreComercial.length > 200 && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Tipo de Documento
              </label>
              <Select
                value={organizacionForm.tipoDocumento?.toString() || TipoDocumento.RUC.toString()}
                onValueChange={(value) => setOrganizacionForm({...organizacionForm, tipoDocumento: parseInt(value)})}
              >
                <SelectTrigger icon="FileText">
                  <SelectValue placeholder="Seleccionar tipo de documento..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoDocumento.RUC.toString()}>RUC</SelectItem>
                  <SelectItem value={TipoDocumento.DNI.toString()}>DNI</SelectItem>
                  <SelectItem value={TipoDocumento.Pasaporte.toString()}>Pasaporte</SelectItem>
                  <SelectItem value={TipoDocumento.CarnetExtranjeria.toString()}>Carnet de Extranjería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Número de Documento
              </label>
              <Input
                type="text"
                value={organizacionForm.numeroDocumento}
                onChange={(e) => setOrganizacionForm({...organizacionForm, numeroDocumento: e.target.value})}
                placeholder="Número de documento"
                icon="Hash"
              />
              {organizacionForm.numeroDocumento && (
                <div className={styles.formHint}>
                  {organizacionForm.numeroDocumento.length}/50 caracteres
                  {organizacionForm.numeroDocumento.length > 50 && (
                    <span style={{ color: '#ef4444', marginLeft: '8px' }}>⚠️ Excede el límite</span>
                  )}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Sector Económico
              </label>
              <SearchableSelect
                value={organizacionForm.sector?.toString() || ''}
                onChange={(value: string | number) => setOrganizacionForm({...organizacionForm, sector: value ? parseInt(value.toString()) : null})}
                options={[
                  { value: '', label: 'Seleccionar sector...' },
                  ...Object.values(SectorEconomico).filter(v => typeof v === 'number').map(sector => ({
                    value: sector.toString(),
                    label: getSectorEconomicoText(sector as number)
                  }))
                ]}
                placeholder="Buscar sector..."
                icon={Tag}
              />
          </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Industria
              </label>
              <SearchableSelect
                value={organizacionForm.industria?.toString() || ''}
                onChange={(value: string | number) => setOrganizacionForm({...organizacionForm, industria: value ? parseInt(value.toString()) : null})}
                options={[
                  { value: '', label: 'Seleccionar industria...' },
                  ...Object.values(Industria).filter(v => typeof v === 'number').map(industria => ({
                    value: industria.toString(),
                    label: getIndustriaText(industria as number)
                  }))
                ]}
                placeholder="Buscar industria..."
                icon={Tag}
              />
            </div>
          </div>

          {/* Información de Contacto */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Mail size={20} />
              Información de Contacto
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Email Corporativo <span className={styles.required}>*</span>
              </label>
              <Input
                type="email"
                value={organizacionForm.email}
                onChange={(e) => setOrganizacionForm({...organizacionForm, email: e.target.value})}
                placeholder="contacto@empresa.com"
                icon="Mail"
                required
              />
              <div className={styles.formHint}>
                Email principal para comunicaciones oficiales
                {organizacionForm.email && (
                  <span style={{ marginLeft: '8px' }}>
                    ({organizacionForm.email.length}/200 caracteres)
                    {organizacionForm.email.length > 200 && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Teléfono
              </label>
              <Input
                type="tel"
                value={organizacionForm.telefono}
                onChange={(e) => setOrganizacionForm({...organizacionForm, telefono: e.target.value})}
                placeholder="+51 1 234-5678"
                icon="Phone"
              />
              {organizacionForm.telefono && (
                <div className={styles.formHint}>
                  {organizacionForm.telefono.length}/50 caracteres
                  {organizacionForm.telefono.length > 50 && (
                    <span style={{ color: '#ef4444', marginLeft: '8px' }}>⚠️ Excede el límite</span>
                  )}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Página Web
              </label>
              <Input
                type="url"
                value={organizacionForm.paginaWeb}
                onChange={(e) => setOrganizacionForm({...organizacionForm, paginaWeb: e.target.value})}
                placeholder="https://www.empresa.com"
                icon="Globe"
              />
              {organizacionForm.paginaWeb && (
                <div className={styles.formHint}>
                  {organizacionForm.paginaWeb.length}/300 caracteres
                  {organizacionForm.paginaWeb.length > 300 && (
                    <span style={{ color: '#ef4444', marginLeft: '8px' }}>⚠️ Excede el límite</span>
                  )}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Dirección
              </label>
              <Textarea
                value={organizacionForm.direccion}
                onChange={(e) => setOrganizacionForm({...organizacionForm, direccion: e.target.value})}
                placeholder="Dirección completa de la empresa"
                rows={3}
              />
              {organizacionForm.direccion && (
                <div className={styles.formHint}>
                  {organizacionForm.direccion.length}/500 caracteres
                  {organizacionForm.direccion.length > 500 && (
                    <span style={{ color: '#ef4444', marginLeft: '8px' }}>⚠️ Excede el límite</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ubicación Geográfica */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Globe size={20} />
              Ubicación Geográfica
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                País
              </label>
              <SearchableSelect
                value={organizacionForm.pais?.toString() || ''}
                onChange={(value: string | number) => setOrganizacionForm({...organizacionForm, pais: value ? parseInt(value.toString()) : null})}
                options={paises.map(pais => ({
                  value: pais.ubigeoId.toString(),
                  label: pais.nombre
                }))}
                placeholder="Seleccionar país..."
                icon={Globe}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Departamento
              </label>
              <SearchableSelect
                value={organizacionForm.departamento?.toString() || ''}
                onChange={(value: string | number) => {
                  const depId = value ? parseInt(value.toString()) : null;
                  setOrganizacionForm({
                    ...organizacionForm, 
                    departamento: depId,
                    provincia: null,
                    distrito: null
                  });
                  if (depId) {
                    loadProvinciasByDepartamento(depId);
                  }
                }}
                options={departamentos.map(dep => ({
                  value: dep.ubigeoId.toString(),
                  label: dep.nombre
                }))}
                placeholder="Seleccionar departamento..."
                icon={Building2}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Provincia
              </label>
              <SearchableSelect
                value={organizacionForm.provincia?.toString() || ''}
                onChange={(value: string | number) => {
                  const provId = value ? parseInt(value.toString()) : null;
                  setOrganizacionForm({
                    ...organizacionForm, 
                    provincia: provId,
                    distrito: null
                  });
                  if (provId) {
                    loadDistritosByProvincia(provId);
                  }
                }}
                options={provincias.map(prov => ({
                  value: prov.ubigeoId.toString(),
                  label: prov.nombre
                }))}
                placeholder="Seleccionar provincia..."
                icon={Building2}
                disabled={!organizacionForm.departamento}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Distrito
              </label>
              <SearchableSelect
                value={organizacionForm.distrito?.toString() || ''}
                onChange={(value: string | number) => setOrganizacionForm({...organizacionForm, distrito: value ? parseInt(value.toString()) : null})}
                options={distritos.map(dist => ({
                  value: dist.ubigeoId.toString(),
                  label: dist.nombre
                }))}
                placeholder="Seleccionar distrito..."
                icon={Building2}
                disabled={!organizacionForm.provincia}
              />
            </div>
          </div>

          {/* Información Corporativa */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Target size={20} />
              Información Corporativa
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Misión
              </label>
              <Textarea
                value={organizacionForm.mision}
                onChange={(e) => setOrganizacionForm({...organizacionForm, mision: e.target.value})}
                placeholder="Misión de la empresa"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Visión
              </label>
              <Textarea
                value={organizacionForm.vision}
                onChange={(e) => setOrganizacionForm({...organizacionForm, vision: e.target.value})}
                placeholder="Visión de la empresa"
                //icon="Award"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Valores Corporativos
              </label>
              <Textarea
                value={organizacionForm.valoresCorporativos}
                onChange={(e) => setOrganizacionForm({...organizacionForm, valoresCorporativos: e.target.value})}
                placeholder="Valores corporativos de la empresa"
                //icon="Settings"
                rows={3}
              />
            </div>
          </div>

                    {/* Todo en solo dos columnas */}
          <div className={styles.modalFormSection}>
            {/* Columna izquierda: Fechas Importantes + Identidad Visual */}
            <div className={styles.modalFormColumnLeft}>
              {/* Fechas Importantes */}
              <div className={styles.modalFormSection}>
                <div className={styles.modalSectionTitle}>
                  <CalendarDays size={20} />
                  Fechas Importantes
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <CalendarDays size={16} />
                    Fecha de Constitución
                  </label>
                  <Input
                    type="date"
                    value={organizacionForm.fechaConstitucion}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, fechaConstitucion: e.target.value})}
                    placeholder="Seleccionar fecha de constitución..."
                    icon="CalendarDays"
                  />
                  <div className={styles.formHint}>Fecha de constitución legal de la empresa</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <CalendarDays size={16} />
                    Fecha de Inicio de Operaciones
                  </label>
                  <Input
                    type="date"
                    value={organizacionForm.fechaInicioOperaciones}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, fechaInicioOperaciones: e.target.value})}
                    placeholder="Seleccionar fecha de inicio de operaciones..."
                    icon="CalendarDays"
                  />
                  <div className={styles.formHint}>Fecha de inicio real de operaciones comerciales</div>
                </div>
              </div>

              {/* Identidad Visual */}
              <div className={styles.modalFormSection}>
                <div className={styles.modalSectionTitle}>
                  <Award size={20} />
                  Identidad Visual
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Logo de la Empresa
                  </label>
                  <Input
                    type="url"
                    value={organizacionForm.logoUrl}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, logoUrl: e.target.value})}
                    placeholder="https://ejemplo.com/logo.png"
                    icon="Award"
                  />
                  <div className={styles.formHint}>
                    URL del logo de la empresa (formato: jpg, png, svg)
                    {organizacionForm.logoUrl && (
                      <span style={{ marginLeft: '8px' }}>
                        ({organizacionForm.logoUrl.length}/300 caracteres)
                        {organizacionForm.logoUrl.length > 300 && (
                          <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                        )}
                      </span>
                    )}
                  </div>
                  
                  {/* Preview del logo */}
                  {organizacionForm.logoUrl && (
                    <div className={styles.logoPreview}>
                      <div className={styles.logoPreviewLabel}>Vista previa:</div>
                      <div className={styles.logoImageContainer}>
                        <img
                          src={organizacionForm.logoUrl}
                          alt="Logo preview"
                          className={styles.logoImage}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = target.nextElementSibling as HTMLElement;
                            if (errorDiv) errorDiv.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                            const errorDiv = target.nextElementSibling as HTMLElement;
                            if (errorDiv) errorDiv.style.display = 'none';
                          }}
                        />
                        <div className={styles.logoError} style={{display: 'none'}}>
                          <AlertCircle size={16} />
                          <span>No se pudo cargar la imagen. Verifica la URL.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Color Primario
                  </label>
                  <div className={styles.colorInputContainer}>
                    <Input
                      type="color"
                      value={organizacionForm.colorPrimario}
                      onChange={(e) => setOrganizacionForm({...organizacionForm, colorPrimario: e.target.value})}
                      icon="Settings"
                    />
                    <div className={styles.colorPreview}>
                      <div 
                        className={styles.colorCircle}
                        style={{ backgroundColor: organizacionForm.colorPrimario }}
                      ></div>
                      <span className={styles.colorValue}>{organizacionForm.colorPrimario}</span>
                    </div>
                  </div>
                  <div className={styles.formHint}>Color principal de la marca</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Color Secundario
                  </label>
                  <div className={styles.colorInputContainer}>
                    <Input
                      type="color"
                      value={organizacionForm.colorSecundario}
                      onChange={(e) => setOrganizacionForm({...organizacionForm, colorSecundario: e.target.value})}
                      icon="Settings"
                    />
                    <div className={styles.colorPreview}>
                      <div 
                        className={styles.colorCircle}
                        style={{ backgroundColor: organizacionForm.colorSecundario }}
                      ></div>
                      <span className={styles.colorValue}>{organizacionForm.colorSecundario}</span>
                    </div>
                  </div>
                  <div className={styles.formHint}>Color secundario de la marca</div>
                </div>
              </div>
            </div>

            
          </div>
          <div className={styles.modalFormSection}>
{/* Columna derecha: Acceso Corporativo */}
<div className={styles.modalFormColumnLeft}>
              <div className={styles.modalFormSection}>
                <div className={styles.modalSectionTitle}>
                  <Settings size={20} />
                  Acceso Corporativo - Credenciales de Usuario
                </div>
                

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Instancia del Sistema
                  </label>
                  <Input
                    type="text"
                    value={organizacionForm.instancia}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, instancia: e.target.value})}
                    placeholder="Ej: prod, dev, test"
                    icon="Settings"
                  />
                  <div className={styles.formHint}>Entorno donde operará el acceso de usuarios (producción, desarrollo, pruebas)</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Dominio Corporativo
                  </label>
                  <Input
                    type="text"
                    value={organizacionForm.dominio}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, dominio: e.target.value})}
                    placeholder="empresa.com"
                    icon="Globe"
                  />
                  <div className={styles.formHint}>
                    Dominio de la empresa para el login de usuarios (ej: usuario@empresa.com)
                    {organizacionForm.dominio && (
                      <span style={{ marginLeft: '8px' }}>
                        ({organizacionForm.dominio.length}/300 caracteres)
                        {organizacionForm.dominio.length > 300 && (
                          <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    ID del Tenant (Azure AD)
                  </label>
                  <Input
                    type="text"
                    value={organizacionForm.tenantId}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, tenantId: e.target.value})}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    icon="Hash"
                  />
                  <div className={styles.formHint}>
                    Identificador del directorio de Azure AD donde están los usuarios corporativos
                    {organizacionForm.tenantId && (
                      <span style={{ marginLeft: '8px' }}>
                        ({organizacionForm.tenantId.length}/50 caracteres)
                        {organizacionForm.tenantId.length > 50 && (
                          <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    ID de Aplicación (Client ID)
                  </label>
                  <Input
                    type="text"
                    value={organizacionForm.clientId}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, clientId: e.target.value})}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    icon="Hash"
                  />
                  <div className={styles.formHint}>
                    ID de la aplicación registrada en Azure AD para el acceso de usuarios
                    {organizacionForm.clientId && (
                      <span style={{ marginLeft: '8px' }}>
                        ({organizacionForm.clientId.length}/50 caracteres)
                        {organizacionForm.clientId.length > 50 && (
                          <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>


                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Ruta de Callback
                  </label>
                  <Input
                    type="text"
                    value={organizacionForm.callbackPath}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, callbackPath: e.target.value})}
                    placeholder="/signin-oidc"
                    icon="Hash"
                  />
                  <div className={styles.formHint}>
                    URL donde Azure AD redirige a los usuarios después del login exitoso
                    {organizacionForm.callbackPath && (
                      <span style={{ marginLeft: '8px' }}>
                        ({organizacionForm.callbackPath.length}/150 caracteres)
                        {organizacionForm.callbackPath.length > 150 && (
                          <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if ((modal.mode === 'create' || modal.mode === 'edit') && modal.type === 'planes') {
      return (
        <div className={styles.modalForm}>
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Package size={20} />
              Información del Plan
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Nombre del Plan <span className={styles.required}>*</span>
              </label>
              <Input
                type="text"
                value={planForm.nombrePlan}
                onChange={(e) => setPlanForm({...planForm, nombrePlan: e.target.value})}
                placeholder="Ej: Plan Básico"
                icon="Tag"
                required
              />
              <div className={styles.formHint}>
                Nombre descriptivo del plan
                {planForm.nombrePlan && (
                  <span style={{ marginLeft: '8px' }}>
                    ({planForm.nombrePlan.length}/100 caracteres)
                    {planForm.nombrePlan.length > 100 && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Descripción
              </label>
              <Textarea
                value={planForm.descripcion}
                onChange={(e) => setPlanForm({...planForm, descripcion: e.target.value})}
                placeholder="Descripción detallada del plan"
                //icon="FileText"
                rows={3}
              />
              <div className={styles.formHint}>
                Descripción de las características del plan
                {planForm.descripcion && (
                  <span style={{ marginLeft: '8px' }}>
                    ({planForm.descripcion.length}/500 caracteres)
                    {planForm.descripcion.length > 500 && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Settings size={16} />
                Tipo de Plan
              </label>
              <Select
                value={planForm.tipoPlan}
                onValueChange={(value) => setPlanForm({...planForm, tipoPlan: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoPlan.BASICO}>Básico</SelectItem>
                  <SelectItem value={TipoPlan.ESTANDAR}>Estándar</SelectItem>
                  <SelectItem value={TipoPlan.PREMIUM}>Premium</SelectItem>
                  <SelectItem value={TipoPlan.EMPRESARIAL}>Empresarial</SelectItem>
                  <SelectItem value={TipoPlan.DEMO}>Demo</SelectItem>
                </SelectContent>
              </Select>
              <div className={styles.formHint}>
                Categoría del plan - máximo 20 caracteres
                {planForm.tipoPlan && (
                  <span style={{ marginLeft: '8px' }}>
                    ({planForm.tipoPlan.length}/20 caracteres)
                    {planForm.tipoPlan.length > 20 && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Límite de Usuarios <span className={styles.required}>*</span>
              </label>
              <Input
                type="number"
                value={planForm.limiteUsuarios || ''}
                onChange={(e) => setPlanForm({...planForm, limiteUsuarios: e.target.value ? parseInt(e.target.value) : null})}
                placeholder="Ej: 50"
                icon="Users"
                min={1}
                max={10000}
                required
              />
              <div className={styles.formHint}>
                Número máximo de usuarios permitidos (entre 1 y 10,000)
                {planForm.limiteUsuarios && (
                  <span style={{ marginLeft: '8px' }}>
                    {planForm.limiteUsuarios < 1 || planForm.limiteUsuarios > 10000 ? (
                      <span style={{ color: '#ef4444' }}>⚠️ Debe estar entre 1 y 10,000</span>
                    ) : (
                      <span style={{ color: '#22c55e' }}>✓ Valor válido</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <DollarSign size={20} />
              Configuración de Precio y Duración
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Precio
              </label>
              <Input
                type="number"
                value={planForm.precio}
                onChange={(e) => setPlanForm({...planForm, precio: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                icon="DollarSign"
                min={0}
                max={999999.99}
                step="0.01"
              />
              <div className={styles.formHint}>
                Precio del plan en soles (PEN) - entre 0 y 999,999.99
                {planForm.precio !== null && planForm.precio !== undefined && (
                  <span style={{ marginLeft: '8px' }}>
                    {planForm.precio < 0 || planForm.precio > 999999.99 ? (
                      <span style={{ color: '#ef4444' }}>⚠️ Debe estar entre 0 y 999,999.99</span>
                    ) : (
                      <span style={{ color: '#22c55e' }}>✓ Valor válido</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Calendar size={16} />
                Duración (días) <span className={styles.required}>*</span>
              </label>
              <Select
                value={planForm.duracionDias.toString()}
                onValueChange={(value) => setPlanForm({...planForm, duracionDias: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar duración..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 días (1 semana)</SelectItem>
                  <SelectItem value="15">15 días (2 semanas)</SelectItem>
                  <SelectItem value="30">30 días (1 mes)</SelectItem>
                  <SelectItem value="60">60 días (2 meses)</SelectItem>
                  <SelectItem value="90">90 días (3 meses)</SelectItem>
                  <SelectItem value="120">120 días (4 meses)</SelectItem>
                  <SelectItem value="150">150 días (5 meses)</SelectItem>
                  <SelectItem value="180">180 días (6 meses)</SelectItem>
                  <SelectItem value="210">210 días (7 meses)</SelectItem>
                  <SelectItem value="240">240 días (8 meses)</SelectItem>
                  <SelectItem value="270">270 días (9 meses)</SelectItem>
                  <SelectItem value="300">300 días (10 meses)</SelectItem>
                  <SelectItem value="330">330 días (11 meses)</SelectItem>
                  <SelectItem value="365">365 días (1 año)</SelectItem>
                  <SelectItem value="730">730 días (2 años)</SelectItem>
                  <SelectItem value="1095">1095 días (3 años)</SelectItem>
                  <SelectItem value="1460">1460 días (4 años)</SelectItem>
                  <SelectItem value="1825">1825 días (5 años)</SelectItem>
                  <SelectItem value="3650">3650 días (10 años)</SelectItem>
                </SelectContent>
              </Select>
              <div className={styles.formHint}>
                Vigencia del plan - entre 1 y 3,650 días (10 años)
                {planForm.duracionDias && (
                  <span style={{ marginLeft: '8px' }}>
                    {planForm.duracionDias < 1 || planForm.duracionDias > 3650 ? (
                      <span style={{ color: '#ef4444' }}>⚠️ Debe estar entre 1 y 3,650 días</span>
                    ) : (
                      <span style={{ color: '#22c55e' }}>✓ Duración válida</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Settings size={16} />
                Estado del Plan <span className={styles.required}>*</span>
              </label>
              <Select
                value={planForm.estado.toString()}
                onValueChange={(value) => setPlanForm({...planForm, estado: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EstadoPlan.ACTIVO.toString()}>Activo</SelectItem>
                  <SelectItem value={EstadoPlan.INACTIVO.toString()}>Inactivo</SelectItem>
                  <SelectItem value={EstadoPlan.SUSPENDIDO.toString()}>Suspendido</SelectItem>
                  <SelectItem value={EstadoPlan.ELIMINADO.toString()}>Eliminado</SelectItem>
                </SelectContent>
              </Select>
              <div className={styles.formHint}>Estado operativo del plan</div>
            </div>

            {/* Configuración Avanzada (solo en modo edición) */}
            {modal.mode === 'edit' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Settings size={16} />
                  Configuración Avanzada
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Checkbox
                    id="actualizarSuscripcionesExistentes"
                    checked={planForm.actualizarSuscripcionesExistentes}
                    onCheckedChange={(checked) => setPlanForm({...planForm, actualizarSuscripcionesExistentes: checked === true})}
                  />
                  <label htmlFor="actualizarSuscripcionesExistentes" style={{ margin: 0, cursor: 'pointer' }}>
                    Actualizar suscripciones existentes automáticamente
                </label>
              </div>
            </div>
            )}

          </div>
        </div>
      );
    } else if ((modal.mode === 'create' || modal.mode === 'edit') && modal.type === 'suscripciones') {
      return (
        <div className={styles.modalForm}>
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Shield size={20} />
              Información de la Suscripción
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Building2 size={16} />
                Cliente <span className={styles.required}>*</span>
              </label>
              <Select
                value={suscripcionForm.organizacionId.toString()}
                onValueChange={(value) => setSuscripcionForm({...suscripcionForm, organizacionId: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Seleccionar cliente...</SelectItem>
                {organizaciones.map(org => {
                  const suscripcionActiva = suscripciones.find(s => 
                    s.organizacionId === org.organizacionId && s.estaVigente
                  );
                  
                  return (
                    <SelectItem 
                      key={org.organizacionId} 
                      value={org.organizacionId.toString()}
                      disabled={modal.mode === 'create' && suscripcionActiva ? true : false}
                    >
                      {org.nombreComercial || org.razonSocial} ({org.codigo})
                      {suscripcionActiva && ' - ⚠️ Tiene suscripción activa'}
                    </SelectItem>
                  );
                })}
                </SelectContent>
              </Select>
              <div className={styles.formHint}>
                Seleccione el cliente para esta suscripción
                {suscripcionForm.organizacionId > 0 && (() => {
                  const organizacionSeleccionada = organizaciones.find(org => org.organizacionId === suscripcionForm.organizacionId);
                  const suscripcionActiva = suscripciones.find(s => 
                    s.organizacionId === suscripcionForm.organizacionId && s.estaVigente
                  );
                  
                  if (organizacionSeleccionada) {
                    if (suscripcionActiva && modal.mode === 'create') {
                      return (
                        <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                          ⚠️ Este cliente ya tiene una suscripción activa que vence el {formatDate(suscripcionActiva.fechaFin)}
                        </span>
                      );
                    } else if (suscripcionActiva && modal.mode === 'edit') {
                      return (
                        <span style={{ color: '#f59e0b', marginLeft: '8px' }}>
                          ℹ️ Este cliente tiene una suscripción activa hasta el {formatDate(suscripcionActiva.fechaFin)}
                        </span>
                      );
                    } else {
                      return (
                        <span style={{ color: '#10b981', marginLeft: '8px' }}>
                          ✓ Cliente: {organizacionSeleccionada.nombreComercial || organizacionSeleccionada.razonSocial}
                        </span>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Package size={16} />
                Plan <span className={styles.required}>*</span>
              </label>
              <Select
                value={suscripcionForm.planId.toString()}
                onValueChange={(value) => {
                  const planId = parseInt(value);
                  const planSeleccionado = planes.find(p => p.planId === planId);
                  
                  // Calcular fechas automáticamente basándose en la duración del plan
                  let nuevaFechaFin = suscripcionForm.fechaFin;
                  if (planSeleccionado && planSeleccionado.duracionDias && suscripcionForm.fechaInicio) {
                    const fechaInicio = new Date(suscripcionForm.fechaInicio);
                    const fechaFin = new Date(fechaInicio);
                    fechaFin.setDate(fechaInicio.getDate() + planSeleccionado.duracionDias);
                    nuevaFechaFin = fechaFin.toISOString().split('T')[0];
                  }
                  
                  setSuscripcionForm({
                    ...suscripcionForm, 
                    planId,
                    limiteUsuarios: planSeleccionado?.limiteUsuarios || 0,
                    fechaFin: nuevaFechaFin
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Seleccionar plan...</SelectItem>
                {planes.filter(p => p.activo).map(plan => (
                    <SelectItem key={plan.planId} value={plan.planId.toString()}>
                    {plan.nombrePlan} - {formatPrice(plan.precio || 0)} ({plan.duracionDias} días)
                    </SelectItem>
                ))}
                </SelectContent>
              </Select>
              <div className={styles.formHint}>
                Seleccione el plan de suscripción
                {suscripcionForm.planId > 0 && (() => {
                  const planSeleccionado = planes.find(p => p.planId === suscripcionForm.planId);
                  if (planSeleccionado) {
                    return (
                      <span style={{ color: '#10b981', marginLeft: '8px' }}>
                        ✓ Plan: {planSeleccionado.nombrePlan} - Duración estándar: {planSeleccionado.duracionDias} días
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Users size={16} />
                Límite de Usuarios <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={styles.formInput}
                value={suscripcionForm.limiteUsuarios}
                onChange={(e) => setSuscripcionForm({...suscripcionForm, limiteUsuarios: parseInt(e.target.value) || 0})}
                placeholder="Límite de usuarios"
                min="1"
                required
              />
              <div className={styles.formHint}>
                Número máximo de usuarios permitidos para esta suscripción
                {suscripcionForm.limiteUsuarios > 0 && (() => {
                  const planSeleccionado = planes.find(p => p.planId === suscripcionForm.planId);
                  if (planSeleccionado && planSeleccionado.limiteUsuarios) {
                    if (suscripcionForm.limiteUsuarios > planSeleccionado.limiteUsuarios) {
                      return (
                        <span style={{ color: '#f59e0b', marginLeft: '8px' }}>
                          ⚠️ Excede el límite del plan ({planSeleccionado.limiteUsuarios} usuarios)
                        </span>
                      );
                    } else {
                      return (
                        <span style={{ color: '#10b981', marginLeft: '8px' }}>
                          ✓ Dentro del límite del plan ({planSeleccionado.limiteUsuarios} usuarios máximo)
                        </span>
                      );
                    }
                  } else if (suscripcionForm.limiteUsuarios <= 0) {
                    return (
                      <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                        ⚠️ El límite debe ser mayor a cero
                      </span>
                    );
                  }
                  return (
                    <span style={{ color: '#10b981', marginLeft: '8px' }}>
                      ✓ {suscripcionForm.limiteUsuarios} usuarios configurados
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Calendar size={20} />
              Configuración de Vigencia
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Calendar size={16} />
                Fecha de Inicio <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                className={styles.formInput}
                value={suscripcionForm.fechaInicio}
                onChange={(e) => setSuscripcionForm({...suscripcionForm, fechaInicio: e.target.value})}
                required
              />
              <div className={styles.formHint}>
                Fecha en que inicia la vigencia de la suscripción
                {suscripcionForm.fechaInicio && (() => {
                  const fechaInicio = new Date(suscripcionForm.fechaInicio);
                  const hoy = new Date();
                  const hace30Dias = new Date();
                  hace30Dias.setDate(hoy.getDate() - 30);
                  
                  if (fechaInicio < hace30Dias) {
                    return (
                      <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                        ⚠️ La fecha no puede ser muy antigua (máximo 30 días atrás)
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <CalendarDays size={16} />
                Fecha de Fin <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                className={styles.formInput}
                value={suscripcionForm.fechaFin}
                onChange={(e) => setSuscripcionForm({...suscripcionForm, fechaFin: e.target.value})}
                required
              />
              <div className={styles.formHint}>
                Fecha en que expira la suscripción
                {suscripcionForm.fechaInicio && suscripcionForm.fechaFin && (() => {
                  const fechaInicio = new Date(suscripcionForm.fechaInicio);
                  const fechaFin = new Date(suscripcionForm.fechaFin);
                  
                  if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
                    const duracionMs = fechaFin.getTime() - fechaInicio.getTime();
                    const duracionDias = Math.ceil(duracionMs / (1000 * 60 * 60 * 24));
                    
                    if (duracionDias <= 0) {
                      return (
                        <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                          ⚠️ La fecha de fin debe ser posterior a la fecha de inicio
                        </span>
                      );
                    } else if (duracionDias > 3650) {
                      return (
                        <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                          ⚠️ La duración no puede exceder 10 años
                        </span>
                      );
                    } else {
                      const años = Math.floor(duracionDias / 365);
                      const meses = Math.floor((duracionDias % 365) / 30);
                      const dias = duracionDias % 30;
                      
                      let duracionTexto = '';
                      if (años > 0) duracionTexto += `${años} año${años > 1 ? 's' : ''}`;
                      if (meses > 0) duracionTexto += `${duracionTexto ? ', ' : ''}${meses} mes${meses > 1 ? 'es' : ''}`;
                      if (dias > 0 || duracionTexto === '') duracionTexto += `${duracionTexto ? ', ' : ''}${dias} día${dias !== 1 ? 's' : ''}`;
                      
                      return (
                        <span style={{ color: '#10b981', marginLeft: '8px' }}>
                          ✓ Duración: {duracionTexto} ({duracionDias} días)
                        </span>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Settings size={16} />
                Tipo de Suscripción
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="esDemo"
                  checked={suscripcionForm.esDemo}
                  onChange={(e) => setSuscripcionForm({...suscripcionForm, esDemo: e.target.checked})}
                />
                <label htmlFor="esDemo" style={{ margin: 0, cursor: 'pointer' }}>
                  Suscripción de demostración
                </label>
              </div>
              <div className={styles.formHint}>Las suscripciones demo tienen funcionalidades limitadas</div>
            </div>
          </div>

          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Settings size={20} />
              Gestión y Trazabilidad
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Tag size={16} />
                Tipo de Operación <span className={styles.required}>*</span>
              </label>
              <Select
                value={suscripcionForm.tipoOperacion.toString()}
                onValueChange={(value) => setSuscripcionForm({...suscripcionForm, tipoOperacion: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de operación..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoOperacionSuscripcion.NUEVA.toString()}>Nueva</SelectItem>
                  <SelectItem value={TipoOperacionSuscripcion.RENOVACION.toString()}>Renovación</SelectItem>
                  <SelectItem value={TipoOperacionSuscripcion.EXTENSION.toString()}>Extensión</SelectItem>
                  <SelectItem value={TipoOperacionSuscripcion.MIGRACION.toString()}>Migración</SelectItem>
                  <SelectItem value={TipoOperacionSuscripcion.REACTIVACION.toString()}>Reactivación</SelectItem>
                </SelectContent>
              </Select>
              <div className={styles.formHint}>Tipo de operación que se está realizando en la suscripción</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Shield size={16} />
                Estado de Suscripción <span className={styles.required}>*</span>
              </label>
              <Select
                value={suscripcionForm.estadoSuscripcion.toString()}
                onValueChange={(value) => setSuscripcionForm({...suscripcionForm, estadoSuscripcion: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EstadoSuscripcionEnum.NUEVA.toString()}>Nueva</SelectItem>
                  <SelectItem value={EstadoSuscripcionEnum.ACTIVA.toString()}>Activa</SelectItem>
                  <SelectItem value={EstadoSuscripcionEnum.VENCIDA.toString()}>Vencida</SelectItem>
                  <SelectItem value={EstadoSuscripcionEnum.SUSPENDIDA.toString()}>Suspendida</SelectItem>
                  <SelectItem value={EstadoSuscripcionEnum.CANCELADA.toString()}>Cancelada</SelectItem>
                  <SelectItem value={EstadoSuscripcionEnum.RENOVADA.toString()}>Renovada</SelectItem>
                </SelectContent>
              </Select>
              <div className={styles.formHint}>Estado actual de la suscripción</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FileText size={16} />
                Motivo de la Operación
              </label>
              <Textarea
                value={suscripcionForm.motivoOperacion}
                onChange={(e) => setSuscripcionForm({...suscripcionForm, motivoOperacion: e.target.value})}
                placeholder="Describe el motivo de esta operación..."
                //icon="FileText"
                rows={3}
              />
              <div className={styles.formHint}>
                Motivo o justificación de la operación realizada
                {suscripcionForm.motivoOperacion && (
                  <span style={{ marginLeft: '8px' }}>
                    ({suscripcionForm.motivoOperacion.length}/500 caracteres)
                    {suscripcionForm.motivoOperacion.length > 500 && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (modal.mode === 'extender' && modal.type === 'suscripciones') {
      const suscripcion = modal.data as SuscripcionOrganizacionDto;
      return (
        <div className={styles.modalFormContent}>
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Clock size={20} />
              Extender Suscripción
            </div>
            
            {/* Información de la suscripción actual */}
            <div className={styles.modalViewSection} style={{ marginBottom: '24px' }}>
              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>Cliente</div>
                <div className={styles.modalViewValue}>
                  {suscripcion.nombreComercial || suscripcion.razonSocial}
                </div>
              </div>
              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>Plan Actual</div>
                <div className={styles.modalViewValue}>{suscripcion.nombrePlan}</div>
              </div>
              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>Fecha Fin Actual</div>
                <div className={styles.modalViewValue}>{formatDate(suscripcion.fechaFin)}</div>
              </div>
              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>Días Restantes</div>
                <div className={styles.modalViewValue}>
                  <span style={{ color: suscripcion.diasRestantes <= 7 ? '#ef4444' : '#10b981' }}>
                    {suscripcion.diasRestantes} días
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Días de Extensión <span className={styles.required}>*</span>
              </label>
                             <Input
                 type="number"
                 value={extenderForm.diasExtension}
                 onChange={(e) => setExtenderForm({...extenderForm, diasExtension: parseInt(e.target.value) || 0})}
                 placeholder="Número de días a extender"
                 icon="Calendar"
                 min={1}
                 max={1825}
               />
              <div className={styles.formHint}>
                Cantidad de días a agregar a la suscripción (máximo 5 años)
                {extenderForm.diasExtension > 0 && (
                  <div style={{ marginTop: '4px', color: '#10b981' }}>
                    ✓ Nueva fecha de fin: {new Date(new Date(suscripcion.fechaFin).getTime() + extenderForm.diasExtension * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE')}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Motivo de la Extensión <span className={styles.required}>*</span>
              </label>
              <Textarea
                value={extenderForm.motivoOperacion}
                onChange={(e) => setExtenderForm({...extenderForm, motivoOperacion: e.target.value})}
                placeholder="Describe el motivo de esta extensión..."
                //icon="FileText"
                rows={3}
              />
              <div className={styles.formHint}>
                Justificación para extender la suscripción
                {extenderForm.motivoOperacion && (
                  <span style={{ marginLeft: '8px' }}>
                    ({extenderForm.motivoOperacion.length}/500 caracteres)
                    {extenderForm.motivoOperacion.length > 500 && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (modal.mode === 'renovar' && modal.type === 'suscripciones') {
      const suscripcion = modal.data as SuscripcionOrganizacionDto;
      return (
        <div className={styles.modalFormContent}>
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <RefreshCw size={20} />
              Renovar Suscripción
            </div>
            
            {/* Información de la suscripción actual */}
            <div className={styles.modalViewSection} style={{ marginBottom: '24px' }}>
              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>Cliente</div>
                <div className={styles.modalViewValue}>
                  {suscripcion.nombreComercial || suscripcion.razonSocial}
                </div>
              </div>
              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>Plan Actual</div>
                <div className={styles.modalViewValue}>{suscripcion.nombrePlan}</div>
              </div>
              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>Estado</div>
                <div className={styles.modalViewValue}>
                  <span style={{ color: suscripcion.estaVigente ? '#10b981' : '#ef4444' }}>
                    {suscripcion.estaVigente ? 'VIGENTE' : 'VENCIDA'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Nuevo Plan (Opcional)
              </label>
                             <Select
                 value={renovarForm.nuevoPlanId?.toString() || '0'}
                 onValueChange={(value) => setRenovarForm({...renovarForm, nuevoPlanId: value === '0' ? null : parseInt(value)})}
              >
                <SelectTrigger icon="Package">
                  <SelectValue placeholder="Mantener plan actual..." />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="0">Mantener plan actual</SelectItem>
                                     {planes.filter(p => p.activo).map(plan => (
                     <SelectItem key={plan.planId} value={plan.planId.toString()}>
                       {plan.nombrePlan} - {plan.tipoPlan} ({formatPrice(plan.precio || 0)})
                     </SelectItem>
                   ))}
                </SelectContent>
              </Select>
              <div className={styles.formHint}>
                Si no seleccionas nada, se mantendrá el plan actual
                {renovarForm.nuevoPlanId && (
                  <div style={{ marginTop: '4px', color: '#10b981' }}>
                    ✓ Plan seleccionado: {planes.find(p => p.planId === renovarForm.nuevoPlanId)?.nombrePlan}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Motivo de la Renovación <span className={styles.required}>*</span>
              </label>
              <Textarea
                value={renovarForm.motivoOperacion}
                onChange={(e) => setRenovarForm({...renovarForm, motivoOperacion: e.target.value})}
                placeholder="Describe el motivo de esta renovación..."
                //icon="FileText"
                rows={3}
              />
              <div className={styles.formHint}>
                Justificación para renovar la suscripción
                {renovarForm.motivoOperacion && (
                  <span style={{ marginLeft: '8px' }}>
                    ({renovarForm.motivoOperacion.length}/500 caracteres)
                    {renovarForm.motivoOperacion.length > 500 && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Título del modal dinámico
  const getModalTitle = () => {
    const typeLabel = modal.type === 'organizaciones' ? 'Cliente' :
                     modal.type === 'suscripciones' ? 'Suscripción' : 'Plan';
    
    if (modal.mode === 'view') return `Ver ${typeLabel}`;
    if (modal.mode === 'create') return `Nuevo ${typeLabel}`;
    if (modal.mode === 'edit') return `Editar ${typeLabel}`;
    if (modal.mode === 'extender') return `Extender Suscripción`;
    if (modal.mode === 'renovar') return `Renovar Suscripción`;
    return typeLabel;
  };

  return (
    <div className={styles.organizacionesContainer} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className={styles.header} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 style={{ color: colors.text }}>Gestión de Clientes</h1>
            <p style={{ color: colors.textSecondary }}>
              Administra clientes, suscripciones y planes de manera integral
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {tabsData.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <tab.icon className={styles.tabIcon} />
            <span>{tab.label}</span>
            <span className={styles.tabCounter}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <div className={styles.tabContent} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.contentHeader}>
          <div className={styles.searchAndFilters}>
            <div className={styles.searchContainer}>
              <Input
                type="text"
                placeholder={`Buscar ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="Search"
              />
            </div>
            <Button
              variant="default"
              size="m"
              iconName="Filter"
              onClick={() => {
                if (activeTab === 'organizaciones') {
                  setIsFilterModalOpen(true);
                } else if (activeTab === 'planes') {
                  setIsFilterModalOpenPlanes(true);
                } else if (activeTab === 'suscripciones') {
                  setIsFilterModalOpenSuscripciones(true);
                }
              }}
            >
              Filtros
            </Button>
          </div>
          
          <Button
            variant="default"
            size="m"
            iconName="Plus"
            onClick={() => openModal('create', activeTab)}
          >
            Nuevo {activeTab === 'organizaciones' ? 'Cliente' : activeTab === 'suscripciones' ? 'Suscripción' : 'Plan'}
          </Button>
        </div>

        {/* Error general */}
        {errors.general && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{errors.general}</span>
          </div>
        )}

        {renderTabContent()}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={getModalTitle()}
        size="l"
        onSave={modal.mode !== 'view' ? (
          modal.mode === 'extender' ? handleExtenderSuscripcion :
          modal.mode === 'renovar' ? handleRenovarSuscripcion :
          modal.type === 'organizaciones' ? handleSaveOrganizacion :
          modal.type === 'suscripciones' ? handleSaveSuscripcion :
          handleSavePlan
        ) : undefined}
        hideFooter={modal.mode === 'view'}
        saveButtonText={
          modal.mode === 'create' ? 'Crear' :
          modal.mode === 'extender' ? 'Extender' :
          modal.mode === 'renovar' ? 'Renovar' :
          'Actualizar'
        }
        saveButtonDisabled={loading.saving}
        saveButtonLoading={loading.saving}
      >
        {renderModalContent()}
      </Modal>

      {/* FilterModal para organizaciones */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filterControls={filterControls}
        onFilter={handleFilter}
        onExport={handleExport}
        exportFileName="organizaciones"
      />

      {/* FilterModal para planes */}
      <FilterModal
        isOpen={isFilterModalOpenPlanes}
        onClose={() => setIsFilterModalOpenPlanes(false)}
        filterControls={filterControlsPlanes}
        onFilter={handleFilterPlanes}
        onExport={handleExportPlanes}
        exportFileName="planes"
      />

      {/* FilterModal para suscripciones */}
      <FilterModal
        isOpen={isFilterModalOpenSuscripciones}
        onClose={() => setIsFilterModalOpenSuscripciones(false)}
        filterControls={filterControlsSuscripciones}
        onFilter={handleFilterSuscripciones}
        onExport={handleExportSuscripciones}
        exportFileName="suscripciones"
      />

      {/* Modal de Gestión de Familias de Sistemas */}
      <GestionFamiliasModal
        isOpen={isGestionFamiliasModalOpen}
        onClose={closeGestionFamiliasModal}
        organizacion={selectedOrganizacionForFamilias}
        onUpdate={() => {
          // Opcional: recargar datos si es necesario
        }}
      />

    </div>
  );
};