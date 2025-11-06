import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Calendar,
  Users,
  Hash,
  Tag,
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Heart,
  Settings,
  Package,
  Shield,
  FileText
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/card';
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input/input';
import { Textarea } from '../../ui/textarea/textarea';
import { Label } from '../../ui/label';
import { Grid, GridColumn, GridAction } from '../../ui/grid/Grid';
import { Modal } from '../../ui/modal/Modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { AlertService } from '../../ui/alerts/AlertService';
import { processPaginatedResponse, createEmptyPaginationState } from '../../../utils/paginationUtils';
import { organizacionesService } from '../../../services/organizaciones.service';
import { sedesService } from '../../../services/sedes.service';
import { planesSuscripcionService } from '../../../services/planes-suscripcion.service';
import { ubigeoService } from '../../../services/ubigeo.service';
import { OrganizacionDto } from '../../../services/types/organizaciones.types';
import { 
  Sede, 
  SedeDto,
  CreateSedeCommand, 
  UpdateSedeCommand 
} from '../../../services/types/sedes.types';
import { PlanSuscripcion } from '../../../services/types/planes-suscripcion.types';
import { UbigeoDto } from '../../../services/types/ubigeo.types';
import { 
  UpdateOrganizacionCommand,
  TipoDocumento,
  EstadoLicencia,
  SectorEconomico,
  Industria,
  getSectorEconomicoText,
  getIndustriaText
} from '../../../services/types/organizaciones.types';
import { Ubigeo, UbigeoSelection } from '../Ubigeo/Ubigeo';
import styles from './MiOrganizacion.module.css';

type ModalMode = 'view' | 'create' | 'edit' | null;

interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
  data?: SedeDto | null;
}

interface LoadingState {
  organizacion: boolean;
  sedes: boolean;
  saving: boolean;
  deleting: boolean;
}

interface ErrorState {
  organizacion: string | null;
  sedes: string | null;
  general: string | null;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface SedeFormData {
  organizacionId: number;
  nombre: string;
  descripcion: string;
  ubigeo: string;
}

interface OrganizacionFormData {
  organizacionId: number;
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

export interface MiOrganizacionProps {
  data?: any;
}

export const MiOrganizacion: React.FC<MiOrganizacionProps> = ({ data }) => {
  const { colors, theme } = useTheme();
  const { organizationInfo } = useAuth();

  // Estados principales de datos
  const [organizacion, setOrganizacion] = useState<OrganizacionDto | null>(null);
  const [sedes, setSedes] = useState<SedeDto[]>([]);
  
  // Estados de catálogos
  const [paises, setPaises] = useState<UbigeoDto[]>([]);
  const [departamentos, setDepartamentos] = useState<UbigeoDto[]>([]);
  const [provincias, setProvincias] = useState<UbigeoDto[]>([]);
  const [distritos, setDistritos] = useState<UbigeoDto[]>([]);
  const [planes, setPlanes] = useState<PlanSuscripcion[]>([]);

  // Estado de paginación
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0
  });

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    mode: null,
    data: null
  });

  // Estados de loading
  const [loading, setLoading] = useState<LoadingState>({
    organizacion: false,
    sedes: false,
    saving: false,
    deleting: false
  });

  // Estados de error
  const [errors, setErrors] = useState<ErrorState>({
    organizacion: null,
    sedes: null,
    general: null
  });

  // Estado para error de carga de logo
  const [logoError, setLogoError] = useState(false);

  // Estado del formulario de sede
  const [sedeForm, setSedeForm] = useState<SedeFormData>({
    organizacionId: organizationInfo.id || 0,
    nombre: '',
    descripcion: '',
    ubigeo: ''
  });

  // Estado para el modal de Ubigeo
  const [ubigeoModal, setUbigeoModal] = useState({
    isOpen: false,
    selectedUbigeo: null as UbigeoSelection | null
  });

  // Estado para el modal de edición de organización
  const [organizacionModalOpen, setOrganizacionModalOpen] = useState(false);
  const [organizacionForm, setOrganizacionForm] = useState<OrganizacionFormData>({
    organizacionId: organizationInfo.id || 0,
    codigo: '',
    razonSocial: '',
    nombreComercial: '',
    tipoDocumento: TipoDocumento.RUC,
    numeroDocumento: '',
    sector: null,
    industria: null,
    pais: null,
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
    colorPrimario: '#6366f1',
    colorSecundario: '#8b5cf6',
    suscripcionActualId: null,
    estadoLicencia: null,
    instancia: '',
    dominio: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    callbackPath: ''
  });

  // Función para cargar datos de la organización
  const loadOrganizacion = useCallback(async () => {
    if (!organizationInfo.id) {
      setErrors(prev => ({ ...prev, organizacion: 'No hay organización seleccionada' }));
      return;
    }

    try {
      setLoading(prev => ({ ...prev, organizacion: true }));
      setErrors(prev => ({ ...prev, organizacion: null }));

      const response = await organizacionesService.getOrganizacionById({ 
        id: organizationInfo.id 
      });
      
      if (response.success && response.data) {
        setOrganizacion(response.data);
        setLogoError(false); // Resetear error de logo cuando se carga nueva organización
      } else {
        throw new Error(response.message || 'Error al cargar la organización');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [MI ORGANIZACIÓN] Error:', errorMessage);
      setErrors(prev => ({ ...prev, organizacion: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, organizacion: false }));
    }
  }, [organizationInfo.id]);

  // Función para cargar sedes con paginación
  const loadSedes = useCallback(async (pageNumber?: number, pageSize?: number) => {
    if (!organizationInfo.id) {
      setErrors(prev => ({ ...prev, sedes: 'No hay organización seleccionada' }));
      return;
    }

    const currentPageNumber = pageNumber || pagination.currentPage;
    const currentPageSize = pageSize || pagination.pageSize;

    try {
      setLoading(prev => ({ ...prev, sedes: true }));
      setErrors(prev => ({ ...prev, sedes: null }));

      const response = await sedesService.getSedesPaginated({
        OrganizacionId: organizationInfo.id,
        PageNumber: currentPageNumber,
        PageSize: currentPageSize
      });
      
      if (response.success && response.data) {
        // El backend devuelve una estructura diferente a la esperada
        // Estructura real: { data: SedeDto[], pagination: { ... } }
        // Estructura esperada: { items: SedeDto[], totalCount: number, ... }
        
        let sedes: SedeDto[] = [];
        let paginationData = {
          currentPage: 1,
          pageSize: pagination.pageSize,
          totalItems: 0,
          totalPages: 1
        };

        // Usar el utilitario centralizado para procesar la respuesta
        const processedData = processPaginatedResponse<SedeDto>(response.data as any, currentPageNumber, currentPageSize);
        
        // Adaptar al formato local del estado PaginationState
        paginationData = {
          currentPage: processedData.pageNumber,
          pageSize: processedData.pageSize,
          totalItems: processedData.totalCount,
          totalPages: processedData.totalPages
        };

        setSedes(processedData.items);
        setPagination(paginationData);
      } else {
        throw new Error(response.message || 'Error al cargar las sedes');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [SEDES] Error:', errorMessage);
      setErrors(prev => ({ ...prev, sedes: errorMessage }));
      
      // Usar el utilitario para el estado de fallback
      const emptyState = createEmptyPaginationState<SedeDto>(pagination.pageSize);
      setSedes(emptyState.items);
      setPagination({
        currentPage: emptyState.pageNumber,
        pageSize: emptyState.pageSize,
        totalItems: emptyState.totalCount,
        totalPages: emptyState.totalPages
      });
    } finally {
      setLoading(prev => ({ ...prev, sedes: false }));
    }
  }, [organizationInfo.id, pagination.currentPage, pagination.pageSize]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (organizationInfo.id) {
      loadOrganizacion();
      loadSedes();
    }
  }, [loadOrganizacion, loadSedes, organizationInfo.id]);

  // Handlers para paginación
  const handlePageChange = useCallback((page: number) => {
    loadSedes(page, pagination.pageSize);
  }, [loadSedes, pagination.pageSize]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    // Al cambiar el tamaño de página, volver a la página 1
    loadSedes(1, newPageSize);
  }, [loadSedes]);

  // TODO: Implementar búsqueda del servidor
  // Por ahora aplicamos filtro solo sobre los datos actuales de la página
  const filteredSedes = useMemo(() => {
    if (!searchTerm) return sedes;
    
    const searchLower = searchTerm.toLowerCase();
    return sedes.filter(sede =>
      sede.nombre?.toLowerCase().includes(searchLower) ||
      sede.descripcion?.toLowerCase().includes(searchLower) ||
      sede.ubicacionCompleta?.toLowerCase().includes(searchLower) ||
      sede.nombreDepartamento?.toLowerCase().includes(searchLower) ||
      sede.nombreProvincia?.toLowerCase().includes(searchLower) ||
      sede.nombreDistrito?.toLowerCase().includes(searchLower)
    );
  }, [sedes, searchTerm]);

  // Mostrar información sobre búsqueda local vs paginación
  const isSearchActive = searchTerm.length > 0;
  const showingFilteredResults = isSearchActive && filteredSedes.length !== sedes.length;

  // Handlers del modal
  const openModal = useCallback((mode: ModalMode, data?: SedeDto) => {
    setModal({ isOpen: true, mode, data: data || null });
    setErrors(prev => ({ ...prev, general: null }));
    
    if (mode === 'edit' && data) {
      setSedeForm({
        organizacionId: data.organizacionId || organizationInfo.id || 0,
        nombre: data.nombre || '',
        descripcion: data.descripcion || '',
        ubigeo: data.ubigeo || ''
      });
    } else if (mode === 'create') {
        setSedeForm({
          organizacionId: organizationInfo.id || 0,
          nombre: '',
          descripcion: '',
          ubigeo: ''
        });
      }
  }, [organizationInfo.id]);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, mode: null, data: null });
    setErrors(prev => ({ ...prev, general: null }));
  }, []);

  // Handler para guardar sede
  const handleSaveSede = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors(prev => ({ ...prev, general: null }));

      // Validaciones básicas
      if (!sedeForm.nombre.trim()) {
        throw new Error('El nombre de la sede es requerido');
      }

      if (modal.mode === 'create') {
        const command: CreateSedeCommand = {
          organizacionId: sedeForm.organizacionId,
          nombre: sedeForm.nombre,
          descripcion: sedeForm.descripcion.trim() || null,
          ubigeo: sedeForm.ubigeo.trim() || null
        };

        const response = await sedesService.createSede(command);
        
        if (response.success) {
          // Al crear una nueva sede, ir a la primera página para verla
          await loadSedes(1, pagination.pageSize);
          closeModal();
          AlertService.success('Sede creada exitosamente');
        } else {
          throw new Error(response.message || 'Error al crear sede');
        }
      } else if (modal.mode === 'edit' && modal.data) {
        const command: UpdateSedeCommand = {
          sedeId: modal.data.sedeId,
          organizacionId: sedeForm.organizacionId || null,
          nombre: sedeForm.nombre || null,
          descripcion: sedeForm.descripcion.trim() || null,
          ubigeo: sedeForm.ubigeo.trim() || null,
          actualizarOrganizacion: false,
          actualizarInformacionBasica: true,
          actualizarUbicacion: true,
          permitirCambioOrganizacion: false
        };

        const response = await sedesService.updateSede(modal.data.sedeId, command);
        
        if (response.success) {
          // Al editar, mantener la página actual
          await loadSedes(pagination.currentPage, pagination.pageSize);
          closeModal();
          AlertService.success('Sede actualizada exitosamente');
        } else {
          throw new Error(response.message || 'Error al actualizar sede');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error saving sede:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [modal, sedeForm, loadSedes, closeModal]);

  // Handler para eliminar sede
  const handleDeleteSede = useCallback(async (sede: SedeDto) => {
    const confirmed = await AlertService.confirm(
      `¿Estás seguro de eliminar la sede "${sede.nombre}"?`,
      {
        title: 'Confirmar eliminación',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    );
    
    if (!confirmed) return;

    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      
      const response = await sedesService.deleteSede({ 
        id: sede.sedeId,
        reasignarUnidades: false 
      });
      
      if (response.success) {
        // Al eliminar, verificar si debemos ir a la página anterior
        const itemsEnPaginaActual = sedes.length;
        let paginaACargar = pagination.currentPage;
        
        // Si solo queda 1 elemento en la página actual y no es la primera página,
        // ir a la página anterior
        if (itemsEnPaginaActual === 1 && pagination.currentPage > 1) {
          paginaACargar = pagination.currentPage - 1;
        }
        
        await loadSedes(paginaACargar, pagination.pageSize);
        AlertService.success('Sede eliminada exitosamente');
      } else {
        throw new Error(response.message || 'Error al eliminar sede');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      AlertService.error(`Error al eliminar sede: ${errorMessage}`);
      console.error('Error deleting sede:', error);
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [loadSedes]);

  // Función para cargar planes de suscripción
  const loadPlanes = useCallback(async () => {
    try {
      const response = await planesSuscripcionService.getPlanesSuscripcion();
      
      if (response.success && response.data) {
        setPlanes(response.data);
      } else {
        console.error('❌ [PLANES] Error al cargar planes:', response.message);
      }
    } catch (error) {
      console.error('❌ [PLANES] Error:', error);
    }
  }, []);

  // Funciones para el modal de organización
  const openOrganizacionModal = () => {
    if (organizacion) {
      // Cargar planes si no están cargados
      if (planes.length === 0) {
        loadPlanes();
      }
      
      setOrganizacionForm({
        organizacionId: organizacion.organizacionId,
        codigo: organizacion.codigo || '',
        razonSocial: organizacion.razonSocial || '',
        nombreComercial: organizacion.nombreComercial || '',
        tipoDocumento: (organizacion as any).tipoDocumento || TipoDocumento.RUC,
        numeroDocumento: organizacion.numeroDocumento || '',
        sector: (organizacion as any).sector || null,
        industria: (organizacion as any).industria || null,
        pais: (organizacion as any).pais || null,
        departamento: (organizacion as any).departamento || null,
        provincia: (organizacion as any).provincia || null,
        distrito: (organizacion as any).distrito || null,
        direccion: organizacion.direccion || '',
        telefono: organizacion.telefono || '',
        email: organizacion.email || '',
        paginaWeb: organizacion.paginaWeb || '',
        mision: organizacion.mision || '',
        vision: organizacion.vision || '',
        valoresCorporativos: organizacion.valoresCorporativos || '',
        fechaConstitucion: organizacion.fechaConstitucion ? organizacion.fechaConstitucion.split('T')[0] : '',
        fechaInicioOperaciones: organizacion.fechaInicioOperaciones ? organizacion.fechaInicioOperaciones.split('T')[0] : '',
        logoUrl: organizacion.logoUrl || '',
        colorPrimario: (organizacion as any).colorPrimario || '#6366f1',
        colorSecundario: (organizacion as any).colorSecundario || '#8b5cf6',
        suscripcionActualId: (organizacion as any).suscripcionActualId || null,
        estadoLicencia: (organizacion as any).estadoLicencia || null,
        instancia: (organizacion as any).instancia || '',
        dominio: (organizacion as any).dominio || '',
        tenantId: (organizacion as any).tenantId || '',
        clientId: (organizacion as any).clientId || '',
        clientSecret: (organizacion as any).clientSecret || '',
        callbackPath: (organizacion as any).callbackPath || ''
      });
      setOrganizacionModalOpen(true);
    }
  };

  const closeOrganizacionModal = () => {
    setOrganizacionModalOpen(false);
    setErrors(prev => ({ ...prev, general: null }));
  };

  // Handler para guardar la organización
  const handleSaveOrganizacion = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors(prev => ({ ...prev, general: null }));

      // Validaciones básicas
      if (!organizacionForm.razonSocial.trim()) {
        throw new Error('La razón social es requerida');
      }

      const command: UpdateOrganizacionCommand = {
        organizacionId: organizacionForm.organizacionId,
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

      const response = await organizacionesService.updateOrganizacion(organizacionForm.organizacionId, command);
      
      if (response.success) {
        // Recargar los datos de la organización
        await loadOrganizacion();
        closeOrganizacionModal();
        AlertService.success('Organización actualizada exitosamente');
      } else {
        throw new Error(response.message || 'Error al actualizar organización');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, general: errorMessage }));
      console.error('Error updating organizacion:', error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [organizacionForm, loadOrganizacion]);

  // Funciones para manejar el modal de Ubigeo
  const handleUbigeoSelect = (selection: UbigeoSelection) => {
    // Concatenar código y nombre con guión simple sin espacios
    const ubigeoValue = `${selection.codigo}-${selection.nombre}`;
    
    // Actualizar el formulario con el código y nombre concatenados
    setSedeForm({
      ...sedeForm,
      ubigeo: ubigeoValue 
    });
    
    // Guardar la selección completa para mostrar información adicional
    setUbigeoModal({
      isOpen: false,
      selectedUbigeo: selection
    });
  };

  const openUbigeoModal = () => {
    const preloadData = getUbigeoPreloadData();
    setUbigeoModal({
      ...ubigeoModal,
      isOpen: true
    });
  };

  const closeUbigeoModal = () => {
    setUbigeoModal({
      ...ubigeoModal,
      isOpen: false
    });
  };

  // Función para generar datos de precarga para el componente Ubigeo
  const getUbigeoPreloadData = () => {
    const ubigeoValue = sedeForm.ubigeo;
    
    if (!ubigeoValue) return undefined;
    
    // Si el ubigeo tiene el formato "codigo-nombre", extraer ambos
    const parts = ubigeoValue.split('-');
    if (parts.length === 2) {
      return {
        pais: undefined,
        departamento: undefined,
        provincia: undefined,
        distrito: undefined,
        codigo: parts[0].trim(),
        nombre: parts[1].trim()
      };
    }
    
    // Si no tiene el formato esperado, retornar undefined para que no haga precarga
    return undefined;
  };

  // Configuración de columnas del grid (simplificada)
  const sedesColumns: GridColumn<SedeDto>[] = [
    {
      id: 'nombre',
      header: 'Nombre',
      accessor: 'nombre',
      sortable: true,
      width: '25%',
      render: (value, row) => (
        <div className={styles.sedeBasic}>
          <Building2 size={16} style={{ color: '#6366f1' }} />
          <span className={styles.sedeNombre}>{value || 'Sin nombre'}</span>
        </div>
      )
    },
    {
      id: 'descripcion',
      header: 'Descripción',
      accessor: 'descripcion',
      width: '30%',
      render: (value, row) => (
        <span className={styles.sedeDescripcion}>
          {value || 'Sin descripción'}
        </span>
      )
    },
    {
      id: 'ubigeo',
      header: 'Ubigeo',
      accessor: 'ubigeo',
      width: '25%',
      render: (value, row) => (
        <div className={styles.ubigeoInfo}>
          <MapPin size={14} style={{ color: '#059669' }} />
          <span>{value || 'No especificado'}</span>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Acciones',
      accessor: () => '',
      width: '20%',
      actions: [
        {
          icon: 'Eye',
          color: '#6366f1',
          onClick: (sede) => {
            openModal('view', sede);
          },
          tooltip: 'Ver detalles'
        },
        {
          icon: 'Edit',
          color: '#059669',
          onClick: (sede) => {
            openModal('edit', sede);
          },
          tooltip: 'Editar sede'
        },
        {
          icon: 'Trash2',
          color: '#dc2626',
          onClick: (sede) => {
            handleDeleteSede(sede);
          },
          tooltip: 'Eliminar sede',
          disabled: (sede) => loading.deleting
        }
      ]
    }
  ];

  // Funciones de utilidad
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price);

  // Render del contenido del modal
  const renderModalContent = () => {
    if (modal.mode === 'view' && modal.data) {
      const sede = modal.data;
      return (
        <div className={styles.modalViewContent}>
          <div className={styles.modalViewSection}>
            <div className={styles.modalViewSectionTitle}>
              <Building2 size={20} />
              Información de la Sede
            </div>
            
            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Hash size={14} />
                ID de Sede
              </div>
              <div className={styles.modalViewValue}>{sede.sedeId}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Building2 size={14} />
                Nombre
              </div>
              <div className={styles.modalViewValue}>{sede.nombre}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Tag size={14} />
                Descripción
              </div>
              <div className={styles.modalViewValue}>{sede.descripcion || 'No especificada'}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <MapPin size={14} />
                Ubicación Completa
              </div>
              <div className={styles.modalViewValue}>{sede.ubicacionCompleta || 'No especificada'}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Hash size={14} />
                Código Ubigeo
              </div>
              <div className={styles.modalViewValue}>{sede.ubigeo || 'No especificado'}</div>
            </div>
          </div>

          <div className={styles.modalViewSection}>
            <div className={styles.modalViewSectionTitle}>
              <Users size={20} />
              Estadísticas
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Building2 size={14} />
                Unidades Organizacionales
              </div>
              <div className={styles.modalViewValue}>{sede.cantidadUnidadesOrg}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Tag size={14} />
                Posiciones
              </div>
              <div className={styles.modalViewValue}>{sede.cantidadPosiciones}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Users size={14} />
                Personas
              </div>
              <div className={styles.modalViewValue}>{sede.cantidadPersonas}</div>
            </div>
          </div>
        </div>
      );
    } else if ((modal.mode === 'create' || modal.mode === 'edit')) {
      return (
        <div className={styles.modalForm}>

          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Building2 size={20} />
              Información de la Sede
            </div>
            
            <div className={styles.formGroup}>
              <Input
                label="Nombre de la Sede *"
                icon="Building2"
                value={sedeForm.nombre}
                onChange={(e) => setSedeForm({...sedeForm, nombre: e.target.value})}
                placeholder="Ej: Sede Principal Lima"
                required
              />
              <Label variant="caption" size="sm">Nombre descriptivo de la sede</Label>
            </div>

            <div className={styles.formGroup}>
              <Textarea
                label="Descripción"
                value={sedeForm.descripcion}
                onChange={(e) => setSedeForm({...sedeForm, descripcion: e.target.value})}
                placeholder="Descripción detallada de la sede"
              />
              <Label variant="caption" size="sm">Descripción opcional de la sede</Label>
            </div>

            <div className={styles.formGroup}>
              <Label variant="default" size="sm">Código Ubigeo</Label>
              
              {/* Botón que imita exactamente el estilo del Input */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openUbigeoModal();
                }}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '36px', // Altura similar a formInput
                  borderRadius: '6px',
                  padding: '0 12px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  transition: 'all 0.2s ease-in-out',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  // Estilos similares al formInput
                  background: colors.background,
                  border: `1px solid ${colors.border}`,
                  color: colors.text
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.borderColor = colors.border;
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.borderColor = colors.primary;
                  target.style.boxShadow = `0 0 0 2px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.borderColor = colors.border;
                  target.style.boxShadow = 'none';
                }}
              >
                <MapPin size={16} style={{ color: colors.textSecondary }} />
                <span style={{ flex: 1 }}>
                  {sedeForm.ubigeo || 'Seleccione ubicación geográfica'}
                </span>
                <Globe size={16} style={{ color: colors.primary }} />
              </button>
              
              <Label variant="caption" size="sm">Seleccione la ubicación geográfica (ubigeo)</Label>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Título del modal dinámico
  const getModalTitle = () => {
    if (modal.mode === 'view') return 'Ver Sede';
    if (modal.mode === 'create') return 'Nueva Sede';
    if (modal.mode === 'edit') return 'Editar Sede';
    return 'Sede';
  };

  if (!organizationInfo.hasOrganization) {
    return (
      <div className={`${styles.container} ${theme === 'dark' ? 'dark' : ''}`} style={{ backgroundColor: colors.background }}>
        <div className={styles.errorContainer}>
          <AlertCircle size={48} />
          <h3>No hay organización seleccionada</h3>
          <p>Para acceder a esta sección necesitas tener una organización configurada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${theme === 'dark' ? 'dark' : ''}`} style={{ backgroundColor: colors.background }}>
      {/* Card de información de la organización */}
      <div className={styles.organizacionSection}>
        <Card className={styles.organizacionCard}>
          <CardHeader>
            <div className={styles.cardHeaderWithActions}>
              <div>
                <CardTitle>
                  <Building2 size={24} />
                  Información de la Organización
                </CardTitle>
                <CardDescription>
                  Datos principales de tu organización
                </CardDescription>
              </div>
              {organizacion && (
                <Button
                  variant="default"
                  size="m"
                  iconName="Edit"
                  iconPosition="left"
                  onClick={openOrganizacionModal}
                  disabled={loading.organizacion}
                >
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading.organizacion ? (
              <div className={styles.loadingCard}>
                <Loader2 size={24} className="animate-spin" />
                <span>Cargando información...</span>
              </div>
            ) : errors.organizacion ? (
              <div className={styles.errorCard}>
                <AlertCircle size={24} />
                <div>
                  <h4>Error al cargar la organización</h4>
                  <p>{errors.organizacion}</p>
                  <Button
                    variant="outline"
                    size="s"
                    iconName="RefreshCw"
                    onClick={loadOrganizacion}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : organizacion ? (
              <div className={styles.organizacionInfoContainer}>
                {/* Header con logo y datos principales */}
                <div className={styles.organizacionHeader}>
                  <div className={styles.organizacionLogo}>
                    {organizacion.logoUrl && !logoError ? (
                      <img 
                        src={organizacion.logoUrl} 
                        alt="Logo de la organización"
                        className={styles.logoImage}
                        onError={() => setLogoError(true)}
                        onLoad={() => setLogoError(false)}
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>
                        <Building2 size={32} />
                      </div>
                    )}
                  </div>
                  <div className={styles.organizacionTitleSection}>
                    <Label variant="h2" >
                      {organizacion.nombreComercial || organizacion.razonSocial}
                    </Label>
                    {organizacion.nombreComercial && organizacion.razonSocial && organizacion.nombreComercial !== organizacion.razonSocial && (
                      <p className={styles.razonSocial}>{organizacion.razonSocial}</p>
                    )}
                    <div className={styles.organizacionCodes}>
                      <span className={styles.documentoChip}>
                        <Tag size={14} />
                        {organizacion.numeroDocumento || 'Sin RUC'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid de información organizada en secciones */}
                <div className={styles.organizacionGrid}>
                  {/* Sección de Contacto */}
                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>
                      <Mail size={18} />
                      Información de Contacto
                    </h3>
                    <div className={styles.sectionContent}>
                      {organizacion.email && (
                        <div className={styles.infoItem}>
                          <Mail size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Email Corporativo</span>
                            <span className={styles.infoValue}>{organizacion.email}</span>
                          </div>
                        </div>
                      )}
                      {organizacion.telefono && (
                        <div className={styles.infoItem}>
                          <Phone size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Teléfono</span>
                            <span className={styles.infoValue}>{organizacion.telefono}</span>
                          </div>
                        </div>
                      )}
                      {organizacion.paginaWeb && (
                        <div className={styles.infoItem}>
                          <Globe size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Sitio Web</span>
                            <a 
                              href={organizacion.paginaWeb} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.infoLink}
                            >
                              {organizacion.paginaWeb}
                            </a>
                          </div>
                        </div>
                      )}
                      {organizacion.ubicacionCompleta && (
                        <div className={styles.infoItem}>
                          <MapPin size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Ubicación</span>
                            <span className={styles.infoValue}>{organizacion.ubicacionCompleta}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sección Corporativa */}
                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>
                      <Building2 size={18} />
                      Identidad Corporativa
                    </h3>
                    <div className={styles.sectionContent}>
                      {organizacion.mision && (
                        <div className={styles.infoItem}>
                          <Target size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Misión</span>
                            <p className={styles.infoText}>{organizacion.mision}</p>
                          </div>
                        </div>
                      )}
                      {organizacion.vision && (
                        <div className={styles.infoItem}>
                          <Eye size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Visión</span>
                            <p className={styles.infoText}>{organizacion.vision}</p>
                          </div>
                        </div>
                      )}
                      {organizacion.valoresCorporativos && (
                        <div className={styles.infoItem}>
                          <Heart size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Valores Corporativos</span>
                            <p className={styles.infoText}>{organizacion.valoresCorporativos}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sección de Fechas Importantes */}
                  <div className={styles.infoSection}>
                    <h3 className={styles.sectionTitle}>
                      <Calendar size={18} />
                      Fechas Importantes
                    </h3>
                    <div className={styles.sectionContent}>
                      {organizacion.fechaConstitucion && (
                        <div className={styles.infoItem}>
                          <Calendar size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Fecha de Constitución</span>
                            <span className={styles.infoValue}>{formatDate(organizacion.fechaConstitucion)}</span>
                          </div>
                        </div>
                      )}
                      {organizacion.fechaInicioOperaciones && (
                        <div className={styles.infoItem}>
                          <Clock size={16} />
                          <div className={styles.infoDetails}>
                            <span className={styles.infoLabel}>Inicio de Operaciones</span>
                            <span className={styles.infoValue}>{formatDate(organizacion.fechaInicioOperaciones)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sección de Estadísticas (si hay datos disponibles) */}
                  {(organizacion.totalUsuarios || organizacion.limiteUsuarios) && (
                    <div className={styles.infoSection}>
                      <h3 className={styles.sectionTitle}>
                        <Users size={18} />
                        Estadísticas
                      </h3>
                      <div className={styles.sectionContent}>
                        {organizacion.totalUsuarios !== undefined && (
                          <div className={styles.infoItem}>
                            <Users size={16} />
                            <div className={styles.infoDetails}>
                              <span className={styles.infoLabel}>Usuarios Activos</span>
                              <span className={styles.infoValue}>{organizacion.totalUsuarios}</span>
                            </div>
                          </div>
                        )}
                        {organizacion.limiteUsuarios && (
                          <div className={styles.infoItem}>
                            <Users size={16} />
                            <div className={styles.infoDetails}>
                              <span className={styles.infoLabel}>Límite de Usuarios</span>
                              <span className={styles.infoValue}>{organizacion.limiteUsuarios}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Sección de sedes */}
      <div className={styles.sedesSection}>
        <Card className={styles.sedesCard}>
          <CardHeader>
            <div className={styles.sedesHeader}>
              <div>
                <CardTitle>
                  <Building2 size={24} />
                  Sedes de la Organización
                </CardTitle>
                <CardDescription>
                  Gestiona las sedes y ubicaciones de tu organización
                </CardDescription>
              </div>
              <Button
                variant="default"
                size="m"
                iconName="Plus"
                onClick={() => openModal('create')}
                disabled={loading.sedes}
              >
                Nueva Sede
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.sedesControls}>
              <div className={styles.searchContainer}>
                <Input
                  type="text"
                  placeholder="Buscar sedes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="Search"
                />
              </div>
              <Button
                variant="default"
                size="m"
                iconName="Filter"
              >
                Filtros
              </Button>
            </div>

            {/* Alerta de búsqueda local */}
            {showingFilteredResults && (
              <div className={styles.infoAlert}>
                <AlertCircle size={16} />
                <span>
                  Búsqueda local: mostrando {filteredSedes.length} resultado(s) de {sedes.length} elementos en esta página.
                  Para buscar en todas las sedes, utiliza los filtros avanzados.
                </span>
              </div>
            )}

            {/* Error general */}
            {errors.general && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            )}



            <Grid
              columns={sedesColumns}
              data={filteredSedes}
              loading={loading.sedes}
              emptyMessage="No hay sedes registradas en tu organización"
              pageSize={pagination.pageSize}
              initialPage={pagination.currentPage}
              showPagination={true}
              serverSide={true}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages} // 🔧 Agregar totalPages
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              className={styles.sedesGrid}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal de Organización */}
      <Modal
        isOpen={organizacionModalOpen}
        onClose={closeOrganizacionModal}
        title="Editar Información de la Organización"
        size="xl"
        onSave={handleSaveOrganizacion}
        saveButtonText="Actualizar Organización"
        saveButtonDisabled={loading.saving}
        saveButtonLoading={loading.saving}
      >
        <div className={styles.organizacionModalForm}>
          {errors.general && (
            <div className={styles.errorAlert}>
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Información Principal */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Building2 size={20} />
              Información Principal
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="Código"
                  icon="Hash"
                  requiredText={true}
                  value={organizacionForm.codigo}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, codigo: e.target.value})}
                  placeholder="Código único de la organización"
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="Razón Social"
                  icon="Building2"
                  requiredText={true}
                  value={organizacionForm.razonSocial}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, razonSocial: e.target.value})}
                  placeholder="Razón social de la organización"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="Nombre Comercial"
                  icon="Tag"
                  value={organizacionForm.nombreComercial}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, nombreComercial: e.target.value})}
                  placeholder="Nombre comercial"
                />
              </div>

              <div className={styles.formGroup}>
                <Label>
                  Tipo de Documento
                </Label>
                <Select
                  value={organizacionForm.tipoDocumento.toString()}
                  onValueChange={(value) => setOrganizacionForm({...organizacionForm, tipoDocumento: parseInt(value)})}
                >
                  <SelectTrigger icon="Hash">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TipoDocumento.RUC.toString()}>RUC</SelectItem>
                    <SelectItem value={TipoDocumento.DNI.toString()}>DNI</SelectItem>
                    <SelectItem value={TipoDocumento.CarnetExtranjeria.toString()}>Carnet de Extranjería</SelectItem>
                    <SelectItem value={TipoDocumento.Pasaporte.toString()}>Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="Número de Documento"
                  icon="Tag"
                  value={organizacionForm.numeroDocumento}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, numeroDocumento: e.target.value})}
                  placeholder="RUC u otro documento"
                />
              </div>

              <div className={styles.formGroup}>
                <Label>
                  Sector Económico
                </Label>
                <Select
                  value={organizacionForm.sector?.toString() || '0'}
                  onValueChange={(value) => setOrganizacionForm({...organizacionForm, sector: value !== '0' ? parseInt(value) : null})}
                >
                  <SelectTrigger icon="Building2">
                    <SelectValue placeholder="Seleccione sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin sector</SelectItem>
                    {Object.entries(SectorEconomico).filter(([key, value]) => !isNaN(Number(value))).map(([key, value]) => (
                      <SelectItem key={key} value={Number(value).toString()}>{getSectorEconomicoText(Number(value))}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Label>
                  Industria
                </Label>
                <Select
                  value={organizacionForm.industria?.toString() || '0'}
                  onValueChange={(value) => setOrganizacionForm({...organizacionForm, industria: value !== '0' ? parseInt(value) : null})}
                >
                  <SelectTrigger icon="Building2">
                    <SelectValue placeholder="Seleccione industria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin industria</SelectItem>
                    {Object.entries(Industria).filter(([key, value]) => !isNaN(Number(value))).map(([key, value]) => (
                      <SelectItem key={key} value={Number(value).toString()}>{getIndustriaText(Number(value))}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="Dirección"
                  icon="MapPin"
                  value={organizacionForm.direccion}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, direccion: e.target.value})}
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Mail size={20} />
              Información de Contacto
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  type="email"
                  label="Email Corporativo"
                  icon="Mail"
                  value={organizacionForm.email}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, email: e.target.value})}
                  placeholder="email@organizacion.com"
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="tel"
                  label="Teléfono"
                  icon="Phone"
                  value={organizacionForm.telefono}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, telefono: e.target.value})}
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  type="url"
                  label="Página Web"
                  icon="Globe"
                  value={organizacionForm.paginaWeb}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, paginaWeb: e.target.value})}
                  placeholder="https://www.organizacion.com"
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="url"
                  label="URL del Logo"
                  icon="Building2"
                  value={organizacionForm.logoUrl}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, logoUrl: e.target.value})}
                  placeholder="https://ejemplo.com/logo.png"
                />
                {organizacionForm.logoUrl && (
                  <div className={styles.logoPreview}>
                    <div className={styles.logoContainer}>
                      <img 
                        src={organizacionForm.logoUrl} 
                        alt="Logo de la organización"
                        className={styles.logoImage}
                        onError={() => setLogoError(true)}
                        onLoad={() => setLogoError(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Identidad Corporativa */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Building2 size={20} />
              Identidad Corporativa
            </div>
            
            <div className={styles.formGroup}>
              <Textarea
                label="Misión"
                value={organizacionForm.mision}
                onChange={(e) => setOrganizacionForm({...organizacionForm, mision: e.target.value})}
                placeholder="Misión de la organización"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <Textarea
                label="Visión"
                value={organizacionForm.vision}
                onChange={(e) => setOrganizacionForm({...organizacionForm, vision: e.target.value})}
                placeholder="Visión de la organización"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <Textarea
                label="Valores Corporativos"
                value={organizacionForm.valoresCorporativos}
                onChange={(e) => setOrganizacionForm({...organizacionForm, valoresCorporativos: e.target.value})}
                placeholder="Valores corporativos de la organización"
                rows={3}
              />
            </div>
          </div>

          {/* Fechas Importantes */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Calendar size={20} />
              Fechas Importantes
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Label>
                  Fecha de Constitución
                </Label>
                <Input
                  type="date"
                  label="Fecha de Constitución"
                  icon="Calendar"
                  value={organizacionForm.fechaConstitucion}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, fechaConstitucion: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <Label>
                  Inicio de Operaciones
                </Label>
                <Input
                  type="date"
                  label="Inicio de Operaciones"
                  icon="Clock"
                  value={organizacionForm.fechaInicioOperaciones}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, fechaInicioOperaciones: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Identidad Visual */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Building2 size={20} />
              Identidad Visual
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <div className={styles.colorInputContainer}>
                  <Input
                    type="color"
                    label="Color Primario"
                    icon="Palette"
                    value={organizacionForm.colorPrimario}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, colorPrimario: e.target.value})}
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
                <div className={styles.colorInputContainer}>
                  <Input
                    type="color"
                    label="Color Secundario"
                    icon="Palette"
                    value={organizacionForm.colorSecundario}
                    onChange={(e) => setOrganizacionForm({...organizacionForm, colorSecundario: e.target.value})}
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

          {/* Configuración de Suscripción */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Package size={20} />
              Configuración de Suscripción
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Label>
                  Plan de Suscripción Actual
                </Label>
                <Select
                  value={organizacionForm.suscripcionActualId?.toString() || '0'}
                  onValueChange={(value) => setOrganizacionForm({...organizacionForm, suscripcionActualId: value !== '0' ? parseInt(value) : null})}
                  disabled={true}
                >
                  <SelectTrigger icon="Package">
                    <SelectValue placeholder="Sin suscripción asignada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin suscripción asignada</SelectItem>
                    {planes.map(plan => (
                      <SelectItem key={plan.planId} value={plan.planId.toString()}>
                        {plan.nombrePlan} - {formatPrice(plan.precio || 0)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.formGroup}>
                <Label>
                  Estado de Licencia
                </Label>
                <Select
                  value={organizacionForm.estadoLicencia?.toString() || EstadoLicencia.Activa.toString()}
                  onValueChange={(value) => setOrganizacionForm({...organizacionForm, estadoLicencia: parseInt(value)})}
                  disabled={true}
                >
                  <SelectTrigger icon="Shield">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EstadoLicencia.Activa.toString()}>Activa</SelectItem>
                    <SelectItem value={EstadoLicencia.Inactiva.toString()}>Inactiva</SelectItem>
                    <SelectItem value={EstadoLicencia.Suspendida.toString()}>Suspendida</SelectItem>
                    <SelectItem value={EstadoLicencia.Vencida.toString()}>Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Configuración de Acceso Corporativo */}
          <div className={styles.modalFormSection}>
            <div className={styles.modalSectionTitle}>
              <Settings size={20} />
              Acceso Corporativo - Credenciales de Usuario
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="Instancia del Sistema"
                  icon="Settings"
                  value={organizacionForm.instancia}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, instancia: e.target.value})}
                  placeholder="Ej: prod, dev, test"
                />
                <div className={styles.formHint}>Entorno donde operará el acceso de usuarios (producción, desarrollo, pruebas)</div>
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="Dominio Corporativo"
                  icon="Globe"
                  value={organizacionForm.dominio}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, dominio: e.target.value})}
                  placeholder="empresa.com"
                />
                <div className={styles.formHint}>Dominio de la empresa para el login de usuarios (ej: usuario@empresa.com)</div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="ID del Tenant (Azure AD)"
                  icon="Hash"
                  value={organizacionForm.tenantId}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, tenantId: e.target.value})}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
                <div className={styles.formHint}>Identificador del directorio de Azure AD donde están los usuarios corporativos</div>
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="ID de Aplicación (Client ID)"
                  icon="Hash"
                  value={organizacionForm.clientId}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, clientId: e.target.value})}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
                <div className={styles.formHint}>ID de la aplicación registrada en Azure AD para el acceso de usuarios</div>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  type="password"
                  label="Secreto de Aplicación (Client Secret)"
                  icon="Hash"
                  value={organizacionForm.clientSecret}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, clientSecret: e.target.value})}
                  placeholder="Secreto de la aplicación"
                />
                <div className={styles.formHint}>Clave secreta para validar el acceso de usuarios desde Azure AD</div>
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="text"
                  label="Ruta de Callback"
                  icon="Hash"
                  value={organizacionForm.callbackPath}
                  onChange={(e) => setOrganizacionForm({...organizacionForm, callbackPath: e.target.value})}
                  placeholder="/signin-oidc"
                />
                <div className={styles.formHint}>URL donde Azure AD redirige a los usuarios después del login exitoso</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Sedes */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={getModalTitle()}
        size="l"
        onSave={modal.mode !== 'view' ? handleSaveSede : undefined}
        hideFooter={modal.mode === 'view'}
        saveButtonText={modal.mode === 'create' ? 'Crear Sede' : 'Actualizar Sede'}
        saveButtonDisabled={loading.saving}
        saveButtonLoading={loading.saving}
      >
        {renderModalContent()}
      </Modal>

      {/* Modal de Ubigeo */}
      <Ubigeo
        isOpen={ubigeoModal.isOpen}
        onClose={closeUbigeoModal}
        onSelect={handleUbigeoSelect}
        title="Seleccionar Ubicación Geográfica"
        preloadData={getUbigeoPreloadData()}
      />
    </div>
  );
};