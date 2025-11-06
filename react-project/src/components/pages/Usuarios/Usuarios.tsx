import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search,   
  Mail,
  Calendar,
  Shield,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  MapPin,
  Globe,
  Building2
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { Input, InputWrapper } from '../../ui/input/index';
import { SelectContent, SelectItem, SelectWrapper } from '../../ui/select/index';
import { SearchableSelect } from '../../ui/searchable-select/SearchableSelect';
import { ImageUpload } from '../../ui/image-upload/index';
import { Grid, GridColumn, GridAction } from '../../ui/grid/Grid';
import { Stepper } from '../../ui/stepper/Stepper';
import { Modal } from '../../ui/modal/Modal';
import { FilterModal, FilterControl, FilterValue } from '../../ui/filter/FilterModal';
import { Persona, PersonaFormData, TIPOS_DOCUMENTO, ESTADOS_LABORALES } from '../../../models/Personas';
import { Usuario as UsuarioLocal, UsuarioFormData, ESTADOS_USUARIO } from '../../../models/Usuarios';
import { getDocumentValidationRules, validateDocumentNumber, formatDocumentNumber, getDocumentFormatHelp, adaptDocumentToNewType } from '../../../utils/documentValidation';
import { validateBirthDate } from '../../../utils/ageValidation';
import { AlertService } from '../../ui/alerts/AlertService';
import { ErrorHandler } from '../../../utils/errorHandler';
import { processPaginatedResponse, createEmptyPaginationState } from '../../../utils/paginationUtils';
import { useAuth } from '../../../hooks/useAuth';
import { personasService } from '../../../services/index';
import { PersonaDto, CreatePersonaConUsuarioRequest, UpdatePersonaConUsuarioRequest, UpdatePersonaRequest, DeletePersonaRequest } from '../../../services/types/personas.types';
import { usuariosService } from '../../../services/usuarios.service';
import { UsuarioDto, Usuario, CreateUsuarioRequest } from '../../../services/types/usuarios.types';
import { perfilService } from '../../../services/perfil.service';
import { Perfil } from '../../../services/types/perfil.types';
import { organizacionesService } from '../../../services/organizaciones.service';
import { OrganizacionDto } from '../../../services/types/organizaciones.types';
import { sedesService } from '../../../services/sedes.service';
import { SedeDto } from '../../../services/types/sedes.types';
import { Ubigeo, UbigeoSelection } from '../Ubigeo/Ubigeo';
import { dateToLocalString } from '../../../lib/utils';
import styles from './Usuarios.module.css';

// Funciones para normalizar fechas y evitar problemas de zona horaria
function normalizeDateForBackend(dateString: string): string | null {
  if (!dateString) return null;
  
  try {
    // Si la fecha viene en formato YYYY-MM-DD del input date
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Crear fecha a las 12:00 del mediodía para evitar problemas de zona horaria
    const normalizedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    
    // Usar la función utilitaria para evitar problemas de zona horaria
    return dateToLocalString(normalizedDate);
  } catch (error) {
    // Error normalizando fecha
    return null;
  }
}

function normalizeDateForDisplay(isoDateString: string | null): string {
  if (!isoDateString) return '';
  
  try {
    // Extraer solo la parte de fecha (YYYY-MM-DD) ignorando la hora
    const datePart = isoDateString.split('T')[0];
    return datePart;
  } catch (error) {
    // Error formateando fecha para display
    return '';
  }
}

function formatDateForUI(isoDateString: string | null): string {
  if (!isoDateString) return 'No especificada';
  
  try {
    // Extraer solo la parte de fecha (YYYY-MM-DD) ignorando la hora
    const datePart = isoDateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Crear fecha a las 12:00 del mediodía para evitar problemas de zona horaria
    const normalizedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    
    return normalizedDate.toLocaleDateString('es-PE');
  } catch (error) {
    // Error formateando fecha para UI
    return 'Fecha inválida';
  }
}

// 🔧 VALIDACIONES DE FECHAS
function validateFechaIngreso(fecha: string): string | null {
  if (!fecha) return null; // Campo no es obligatorio
  
  try {
    const fechaIngreso = new Date(fecha);
    const hoy = new Date();
    
    // Normalizar fechas para comparar solo la parte de fecha (sin hora)
    fechaIngreso.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaIngreso > hoy) {
      return 'La fecha de ingreso no puede ser una fecha futura';
    }
    
    return null; // Válida
  } catch (error) {
    return 'Fecha de ingreso inválida';
  }
}

function validateFechaExpiracion(fecha: string | null): string | null {
  if (!fecha) return null; // Campo no es obligatorio
  
  try {
    const fechaExpiracion = new Date(fecha);
    const hoy = new Date();
    
    // Normalizar fechas para comparar solo la parte de fecha (sin hora)
    fechaExpiracion.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    
    // La fecha de expiración debe ser del día siguiente en adelante
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    if (fechaExpiracion <= hoy) {
      return 'La fecha de expiración debe ser del día siguiente en adelante';
    }
    
    return null; // Válida
  } catch (error) {
    return 'Fecha de expiración inválida';
  }
}

interface StepperState {
  isOpen: boolean;
  mode: 'view' | 'create' | 'edit' | null;
  data?: PersonaDto | null;
}

interface FormState {
  personaData: PersonaFormData;
  usuarioData: UsuarioFormData;
}

export interface UsuariosProps {
  data?: any;
}

// REMOVIDO: Helper que usaba PERFILES_USUARIO hardcodeado - ya no se usa

export const Usuarios: React.FC<UsuariosProps> = ({ data }) => {
  const { colors, theme } = useTheme();
  const { user, organization, organizationInfo } = useAuth();

  // Estados principales para datos
  const [personas, setPersonas] = useState<PersonaDto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioLocal[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [organizaciones, setOrganizaciones] = useState<OrganizacionDto[]>([]);
  const [sedes, setSedes] = useState<SedeDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Estados para carga
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepper, setStepper] = useState<StepperState>({ isOpen: false, mode: 'create', data: null });
  const [currentStep, setCurrentStep] = useState(0);
  
  // Estado para el modal de detalles
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    persona: null as PersonaDto | null,
    usuario: null as Usuario | null
  });
  
  // Estado para el modal de Ubigeo
  const [ubigeoModal, setUbigeoModal] = useState({
    isOpen: false,
    selectedUbigeo: null as UbigeoSelection | null
  });
  
  // Estado para el modal de filtros
  const [filterModal, setFilterModal] = useState({
    isOpen: false
  });
  const [currentFilters, setCurrentFilters] = useState<FilterValue>({});
  const [formData, setFormData] = useState<FormState>({
    personaData: {
      tipoDoc: '',
      nroDoc: '',
      codEmpleado: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: '',
      fotoUrl: null,
      estadoLaboral: 1, // ACTIVO por defecto
      fechaNacimiento: '',
      fechaIngreso: '',
      emailPersonal: '',
      celular: '',
      direccion: '',
      ubigeo: '',
      organizacionId: null, // Se asigna automáticamente según el perfil
      sedeId: null, // NUEVO: Sede seleccionada (nullable)
      estado: 'ACTIVO'
    },
          usuarioData: {
        personaId: 0,
      perfilId: 2, // Valor por defecto seguro (no Super Admin)
        nombreUsuario: '',
        hashPassword: '',
        estado: 1, // 1 = ACTIVO
        fechaExpiracion: null,
        // NUEVOS CAMPOS: Estado inicial sin datos del API
        nombrePerfil: undefined,
        descripcionPerfil: undefined,
        // CAMPOS LEGACY
        esSuperAdmin: false,
      organizacionActual: null
      // REMOVIDO: organizacionId ya no es parte de Usuario según nuevos cambios en API
      }
  });

  // Estado para manejar archivo de foto
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  
  // 🔧 Estados para errores de validación de fechas
  const [fechaIngresoError, setFechaIngresoError] = useState<string | null>(null);
  const [fechaExpiracionError, setFechaExpiracionError] = useState<string | null>(null);

  // 🔧 NUEVO: Estado para debounce de búsqueda
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // �� NUEVO: Estado para el checkbox "Es usuario"
  const [esUsuario, setEsUsuario] = useState(true); // Por defecto checked

  // Efecto simplificado: Solo manejar cambios de perfil durante la edición del stepper
  useEffect(() => {
    // Solo actuar si el stepper está abierto y las organizaciones están cargadas
    if (!stepper.isOpen || organizaciones.length === 0) {
      return;
    }

    const perfilId = formData.usuarioData.perfilId;
    
    if (perfilId !== 1) {
      // Si cambia a perfil ≠ 1, asignar automáticamente la organización del usuario
      if (organizationInfo.hasOrganization && organizationInfo.id && 
          formData.personaData.organizacionId !== organizationInfo.id) {
      setFormData(prev => ({
        ...prev,
          personaData: {
            ...prev.personaData,
          organizacionId: organizationInfo.id
        }
      }));
    }
    } else {
      // Si cambia a perfil 1 (Super Admin), limpiar para permitir selección manual
      if (formData.personaData.organizacionId && stepper.mode === 'create') {
        setFormData(prev => ({
          ...prev,
          personaData: {
            ...prev.personaData,
            organizacionId: null
          }
        }));
      }
    }
  }, [formData.usuarioData.perfilId, stepper.isOpen, organizaciones.length]);

  // Efecto para manejar la carga de sedes cuando cambia la organización
  useEffect(() => {
    const organizacionId = formData.personaData.organizacionId;
    
    // Solo cargar sedes si hay una organización seleccionada y el stepper está abierto
    if (organizacionId && stepper.isOpen) {
      // Cargar sedes de la organización seleccionada
      loadSedesByOrganizacion(organizacionId);
    } else if (stepper.isOpen) {
      // Si no hay organización seleccionada pero el stepper está abierto, limpiar sedes
      setSedes([]);
    }
  }, [formData.personaData.organizacionId, stepper.isOpen]);

  // Función para cargar personas desde el backend
  const loadPersonas = useCallback(async (searchQuery?: string, forcePageOne?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar que tengamos los datos del usuario antes de proceder
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Determinar si debe filtrar por organización según el perfil del usuario
      let organizacionIdFiltro: number | undefined = undefined;
      
      if (user.perfilId !== 1) {
        // Si el perfil no es Super Admin (perfilId !== 1), filtrar por organización del usuario logueado
        if (organizationInfo.hasOrganization && organizationInfo.id) {
          organizacionIdFiltro = organizationInfo.id;
        } else {
          // Si no tiene organización asignada, no mostrar ningún resultado
          setPersonas([]);
          setTotalCount(0);
          setTotalPages(0);
          setIsLoading(false);
          return;
        }
      } else {
        // Si es Super Admin (perfilId === 1), no filtrar por organización (ver todas las personas)
      }

      // 🔧 NUEVO: Usar página 1 si se está realizando una búsqueda o se fuerza
      const pageToUse = (searchQuery && searchQuery.trim().length >= 2) || forcePageOne ? 1 : currentPage;

      // 🔧 NUEVO: Construir request con searchTerm si se proporciona
      const request: any = {
        page: pageToUse,
        pageSize: pageSize,
        orderBy: 'fechaCreacion',
        ascending: false,
        organizacionId: organizacionIdFiltro // Filtrar solo si no es Super Admin
      };

      // 🔧 NUEVO: Agregar searchTerm si tiene longitud >= 3
      if (searchQuery && searchQuery.trim().length >= 3) {
        request.searchTerm = searchQuery.trim();
      }

      const response = await personasService.getPersonasPaginated(request);

      if (response.success && response.data) {
        // Usar el utilitario centralizado para procesar la respuesta
        const paginatedData = processPaginatedResponse<PersonaDto>(response.data as any, currentPage, pageSize);
        
        // Actualizar estados con la información procesada
        setPersonas(paginatedData.items);
        setTotalCount(paginatedData.totalCount);
        setTotalPages(paginatedData.totalPages);
        setCurrentPage(paginatedData.pageNumber);
      } else {
        setError(response.message || 'Error al cargar personas');
        await ErrorHandler.handleServiceError(
          { response: { data: { message: response.message } } }, 
          'cargar lista de personas'
        );
      }
    } catch (error) {
      setError('Error de conexión al cargar personas');
      await ErrorHandler.handleServiceError(error, 'cargar lista de personas');
    } finally {
      setIsLoading(false);
    }
  }, [user, organizationInfo, currentPage, pageSize]);

  // Función para cargar perfiles desde el backend
  const loadPerfiles = async () => {
    try {
      const response = await perfilService.getPerfiles(false);
      
      if (response.success && response.data) {
        // Mapear PerfilDto[] a Perfil[] para compatibilidad
        const perfilesFormateados = response.data.map(perfilDto => ({
          perfilId: perfilDto.perfilId,
          nombrePerfil: perfilDto.nombrePerfil,
          descripcion: perfilDto.descripcion || '',
          estado: perfilDto.estado,
          fechaCreacion: perfilDto.fechaCreacion,
          fechaActualizacion: perfilDto.fechaActualizacion,
          creadoPor: perfilDto.creadoPor,
          actualizadoPor: perfilDto.actualizadoPor,
          registroEliminado: perfilDto.registroEliminado,
          version: perfilDto.version
        }));
        setPerfiles(perfilesFormateados);
      } else {
        await ErrorHandler.handleServiceError(
          { response: { data: { message: response.message } } }, 
          'cargar lista de perfiles'
        );
      }
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'cargar lista de perfiles');
    }
  };

  // Función para cargar organizaciones desde el backend
  const loadOrganizaciones = async () => {
    try {
      const response = await organizacionesService.getOrganizaciones({ includeDeleted: false });
      
      if (response.success && response.data) {
        setOrganizaciones(response.data);
      } else {
        await ErrorHandler.handleServiceError(
          { response: { data: { message: response.message } } }, 
          'cargar lista de organizaciones'
        );
      }
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'cargar lista de organizaciones');
    }
  };

  // Función para cargar sedes según la organización seleccionada
  const loadSedesByOrganizacion = async (organizacionId: number) => {
    try {
      const response = await sedesService.getSedesPaginated({
        PageNumber: 1,
        PageSize: 100, // Cargar todas las sedes disponibles
        OrganizacionId: organizacionId
      });
      
      if (response.success && response.data) {
        // Usar el utilitario centralizado para procesar la respuesta
        const paginatedData = processPaginatedResponse<SedeDto>(response.data as any, 1, 100);
        
        setSedes(paginatedData.items);
        
        // Si solo hay una sede y no hay sede ya seleccionada, seleccionarla automáticamente
        if (paginatedData.items.length === 1 && !formData.personaData.sedeId) {
          setFormData(prev => ({
            ...prev,
            personaData: {
              ...prev.personaData,
              sedeId: paginatedData.items[0].sedeId
            }
          }));
        }
      } else {
        // Error al cargar sedes
        setSedes([]);
      }
    } catch (error) {
      // Error al cargar sedes
      setSedes([]);
    }
  };

  // Función para cargar persona completa por ID desde el backend
  const loadPersonaCompleta = async (personaId: number): Promise<PersonaDto | null> => {
    try {
      const response = await personasService.getPersonaCompleto({ personaId });
      if (response.success && response.data) {
        return response.data;
      } else {
        await ErrorHandler.handleServiceError(
          { response: { data: { message: response.message } } }, 
          'cargar datos de persona'
        );
        return null;
      }
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'cargar datos de persona');
      return null;
    }
  };

  // Función para cargar usuario por personaId desde el backend usando el nuevo endpoint específico
  const loadUsuarioByPersonaId = async (personaId: number): Promise<Usuario | null> => {
    try {
      const response = await usuariosService.getUsuarioByPersonaId({ 
        personaId,
        includeDeleted: false 
      });
      if (response.success && response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      // No mostramos error aquí porque es válido que no tenga usuario
      return null;
    }
  };

  // Función para mapear número de tipoDoc del backend a string del formulario
  const mapTipoDocFromBackend = (tipoDoc: number | null): string => {
    switch (tipoDoc) {
      case 1: return 'DNI';
      case 2: return 'CE';
      case 3: return 'PASSPORT';
      case 4: return 'RUC';
      default: return '';
    }
  };

  // Función para mapear string del formulario a número para el backend
  const mapTipoDocToBackend = (tipoDoc: string): number | null => {
    switch (tipoDoc) {
      case 'DNI': return 1;
      case 'CE': return 2;
      case 'PASSPORT': return 3;
      case 'RUC': return 4;
      default: return null;
    }
  };

  // Función para mapear PersonaDto a formato compatible con el formulario
  const mapPersonaDtoToFormData = (personaDto: PersonaDto): PersonaFormData => {
    // Convertir fechas de formato ISO a formato YYYY-MM-DD para el input date
    const fechaNacimientoFormateada = normalizeDateForDisplay(personaDto.fechaNacimiento);
    const fechaIngresoFormateada = normalizeDateForDisplay(personaDto.fechaIngreso);

    return {
      tipoDoc: mapTipoDocFromBackend(personaDto.tipoDoc),
      nroDoc: personaDto.nroDoc || '',
      codEmpleado: personaDto.codEmpleado || '',
      apellidoPaterno: personaDto.apellidoPaterno,
      apellidoMaterno: personaDto.apellidoMaterno || '',
      nombres: personaDto.nombres,
      fotoUrl: personaDto.fotoUrl,
      estadoLaboral: personaDto.estadoLaboral,
      fechaNacimiento: fechaNacimientoFormateada,
      fechaIngreso: fechaIngresoFormateada,
      emailPersonal: personaDto.emailPersonal || '',
      celular: personaDto.celular || '',
      direccion: personaDto.direccion || '',
      ubigeo: personaDto.ubigeo || '',
      organizacionId: personaDto.organizacionId || null, // NUEVO: Mapear organizacionId
      sedeId: personaDto.sedeId || null, // NUEVO: Mapear sedeId
      estado: personaDto.estado === 1 ? 'ACTIVO' : 'INACTIVO'
    };
  };

  // Función para mapear Usuario a formato compatible con el formulario
  const mapUsuarioToFormData = (usuario: Usuario): UsuarioFormData => {
    // Convertir fecha de formato ISO a formato YYYY-MM-DD para el input date
    const fechaExpiracionFormateada = normalizeDateForDisplay(usuario.fechaExpiracion);

          return {
        personaId: usuario.personaId || 0,
        perfilId: usuario.perfilId || 1,
        nombreUsuario: usuario.nombreUsuario,
        hashPassword: '', // No mostramos la contraseña
        estado: usuario.estado, // Mantener como number
        fechaExpiracion: fechaExpiracionFormateada,
        // NUEVOS CAMPOS: Incluir información del perfil desde API
        nombrePerfil: usuario.nombrePerfil,
        descripcionPerfil: usuario.descripcionPerfil,
        // CAMPOS LEGACY
        esSuperAdmin: false, // Campo no disponible en Usuario básico
        organizacionActual: null // Campo no disponible en Usuario básico
        // REMOVIDO: organizacionId ya no es parte de Usuario según nuevos cambios en API
      };
  };

  // Efecto principal para cargar datos iniciales
  // Solo se ejecuta una vez al montar el componente
  useEffect(() => {
    loadPerfiles(); // Cargar perfiles al inicio para tenerlos disponibles
    loadOrganizaciones(); // Cargar organizaciones al inicio para tenerlas disponibles
  }, []);

  // Efecto para cargar personas cuando estén disponibles todos los datos necesarios
  // Se ejecuta cuando cambian los datos del usuario, organización, página o pageSize
  useEffect(() => {

    // Solo cargar personas si tenemos los datos del usuario
    if (user) {
      // Si es Super Admin (perfilId === 1), cargar inmediatamente
      if (user.perfilId === 1) {
        loadPersonas();
      }
      // Si no es Super Admin, verificar que tenga organización asignada
      else if (organizationInfo.hasOrganization && organizationInfo.id) {
        loadPersonas();
      }
      // Si no es Super Admin y no tiene organización, mostrar mensaje
      else {
        setPersonas([]);
        setTotalCount(0);
        setTotalPages(0);
        setIsLoading(false);
      }
    }
  }, [user?.perfilId, organizationInfo.id, organizationInfo.hasOrganization, currentPage, pageSize]);

  // 🔧 NUEVO: Efecto para manejar búsqueda automática con debounce
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Si el searchTerm está vacío, cargar datos iniciales inmediatamente
    if (!searchTerm || searchTerm.trim() === '') {
      loadPersonas();
      return;
    }

    // Si el searchTerm tiene menos de 3 caracteres, no hacer búsqueda
    if (searchTerm.trim().length < 3) {
      return;
    }

    // 🔧 NUEVO: Resetear a página 1 cuando se realiza una búsqueda
    if (currentPage !== 1) {
      setCurrentPage(1);
    }

    // Crear nuevo timeout para búsqueda con debounce (500ms)
    const timeout = setTimeout(() => {
      loadPersonas(searchTerm, true); // Forzar página 1
    }, 500);

    setSearchTimeout(timeout);

    // Cleanup function
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm]); // 🔧 FIX: Removido searchTimeout de las dependencias para evitar loop infinito

  // 🔧 ACTUALIZADO: Filtros solo para filtros avanzados (la búsqueda principal ahora es del servidor)
  const filteredPersonas = useMemo(() => {
    // Asegurar que personas sea siempre un array
    if (!Array.isArray(personas)) {
      return [];
    }
    
    try {
      return personas.filter(persona => {
        // 🔧 REMOVIDO: Filtro por término de búsqueda principal (ahora se maneja en el servidor)
        // El searchTerm ya se aplica en loadPersonas() con searchTerm del servidor

        // Aplicar filtros avanzados si están activos
        if (Object.keys(currentFilters).length > 0) {
          // Filtro por búsqueda avanzada
          if (currentFilters.busqueda) {
            const advancedSearch = currentFilters.busqueda.toLowerCase();
            const matchesAdvancedSearch = 
              persona.nombres.toLowerCase().includes(advancedSearch) ||
              persona.apellidoPaterno.toLowerCase().includes(advancedSearch) ||
              (persona.apellidoMaterno?.toLowerCase().includes(advancedSearch) ?? false) ||
              (persona.nroDoc?.toLowerCase().includes(advancedSearch) ?? false);
            
            if (!matchesAdvancedSearch) return false;
          }

          // Filtro por tipo de documento
          if (currentFilters.tipoDoc) {
            const tipoDocBackend = mapTipoDocToBackend(currentFilters.tipoDoc);
            if (persona.tipoDoc !== tipoDocBackend) return false;
          }

          // Filtro por estado laboral
          if (currentFilters.estadoLaboral) {
            if (persona.estadoLaboral.toString() !== currentFilters.estadoLaboral) return false;
          }

          // Filtro por fecha de ingreso desde
          if (currentFilters.fechaIngresoDesde && persona.fechaIngreso) {
            const fechaIngreso = new Date(persona.fechaIngreso);
            const fechaDesde = new Date(currentFilters.fechaIngresoDesde);
            if (fechaIngreso < fechaDesde) return false;
          }

          // Filtro por fecha de ingreso hasta
          if (currentFilters.fechaIngresoHasta && persona.fechaIngreso) {
            const fechaIngreso = new Date(persona.fechaIngreso);
            const fechaHasta = new Date(currentFilters.fechaIngresoHasta);
            if (fechaIngreso > fechaHasta) return false;
          }

          // Filtro solo activos
          if (currentFilters.soloActivos) {
            if (persona.estado !== 1) return false; // 1 = ACTIVO
          }
        }

        return true;
      });
    } catch (error) {
      // Error en filtrado de personas
      return [];
    }
      }, [personas, currentFilters]);

  // Handlers del stepper
  const openStepper = async (mode: 'view' | 'create' | 'edit', data?: PersonaDto, usuario?: Usuario | null) => {
    setStepper({ isOpen: true, mode, data: data || null });
    setCurrentStep(0);
    
    // 🔧 Limpiar errores de validación de fechas
    setFechaIngresoError(null);
    setFechaExpiracionError(null);
    
    // Cargar perfiles y organizaciones disponibles cuando se abre el modal
    await loadPerfiles();
    await loadOrganizaciones();
    
    if (mode === 'view' && data) {
      // Modo vista: cargar datos completos de la persona
      const personaCompleta = await loadPersonaCompleta(data.personaId);
      if (personaCompleta) {
        setStepper(prev => ({ ...prev, data: personaCompleta }));
      }
      
      // Cargar usuario asociado si existe
      const usuarioAsociado = await loadUsuarioByPersonaId(data.personaId);
      setUsuarioActual(usuarioAsociado);
      
      // 🔧 NUEVO: En modo vista, el checkbox se basa en si existe usuario
      setEsUsuario(usuarioAsociado !== null);
      
    } else if (mode === 'edit' && data) {
      // Modo edición: cargar datos completos de la persona
      const personaCompleta = await loadPersonaCompleta(data.personaId);
      if (personaCompleta) {
        setStepper(prev => ({ ...prev, data: personaCompleta }));
      }
      
      // Cargar usuario asociado si existe
      const usuarioAsociado = await loadUsuarioByPersonaId(data.personaId);
      setUsuarioActual(usuarioAsociado);
      
      // 🔧 NUEVO: En modo edición, el checkbox se basa en si existe usuario
      setEsUsuario(usuarioAsociado !== null);
      
      // Mapear datos de persona al formulario
      const personaFormData = mapPersonaDtoToFormData(personaCompleta || data);
      
      // Mapear datos de usuario al formulario (si existe)
      const usuarioFormData = usuarioAsociado ? mapUsuarioToFormData(usuarioAsociado) : {
        personaId: 0,
        perfilId: 0,
        nombreUsuario: '',
        hashPassword: '',
        estado: 1, // 1 = ACTIVO
        fechaExpiracion: null,
        // NUEVOS CAMPOS: Para usuarios sin datos previos
        nombrePerfil: undefined,
        descripcionPerfil: undefined,
        // CAMPOS LEGACY
        esSuperAdmin: false,
        organizacionActual: null,
        organizacionId: null
      };

      setFormData({
        personaData: personaFormData,
        usuarioData: usuarioFormData
      });
      
      // 🔧 FIX: Limpiar fotoFile al cambiar de persona para mantener consistencia
      setFotoFile(null);
    } else if (mode === 'create') {
      // 🔧 NUEVO: En modo creación, el checkbox siempre empieza marcado
      setEsUsuario(true);
      
      // Determinar perfilId inicial según el usuario logueado
      const perfilIdInicial = user?.perfilId === 1 ? 1 : 2;
      
      // 🆕 Seleccionar automáticamente el primer tipo de documento
      const tipoDocInicial = TIPOS_DOCUMENTO.length > 0 ? TIPOS_DOCUMENTO[0].value : '';
      
      // Determinar organizacionId inicial según el perfil
      let organizacionIdInicial: number | null = null;
      if (perfilIdInicial !== 1 && organizationInfo.hasOrganization && organizationInfo.id) {
        // Si no es Super Admin, usar la organización del usuario logueado
        organizacionIdInicial = organizationInfo.id;
      } else if (perfilIdInicial === 1 && organizaciones.length > 0) {
        // 🆕 Si es Super Admin, seleccionar automáticamente la primera organización
        organizacionIdInicial = organizaciones[0].organizacionId;
      }
      
      // Resetear formulario para nuevo registro con valores correctos desde el inicio
      setFormData({
        personaData: {
          tipoDoc: tipoDocInicial,
          nroDoc: '',
          codEmpleado: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          nombres: '',
          fotoUrl: null,
          estadoLaboral: 1, // ACTIVO por defecto
          fechaNacimiento: '',
          fechaIngreso: '',
          emailPersonal: '',
          celular: '',
          direccion: '',
          ubigeo: '',
          organizacionId: organizacionIdInicial, // Asignado directamente aquí
          sedeId: null, // NUEVO: Sede inicial null
          estado: 'ACTIVO' // PersonaFormData mantiene string
        },
        usuarioData: {
          personaId: 0,
          perfilId: perfilIdInicial,
          nombreUsuario: '',
          hashPassword: '',
          estado: 1, // 1 = ACTIVO
          fechaExpiracion: null,
          // NUEVOS CAMPOS: Para usuarios sin datos previos
          nombrePerfil: undefined,
          descripcionPerfil: undefined,
          // CAMPOS LEGACY
          esSuperAdmin: false,
          organizacionActual: null
        }
      });
      
      // 🔧 FIX: Limpiar fotoFile al cambiar de persona para mantener consistencia
      setFotoFile(null);
      setUsuarioActual(null);
    }
  };

  const closeStepper = () => {
    setStepper({ isOpen: false, mode: null, data: null });
    setCurrentStep(0);
    setUsuarioActual(null); // Limpiar datos del usuario
    setFotoFile(null); // 🔧 FIX: Limpiar estado de foto al cerrar modal
    setEsUsuario(true); // 🔧 NUEVO: Resetear checkbox a estado inicial (marcado)
    
    // 🔧 Limpiar errores de validación de fechas
    setFechaIngresoError(null);
    setFechaExpiracionError(null);
  };

  const closeDetailModal = () => {
    setDetailModal({
      isOpen: false,
      persona: null,
      usuario: null
    });
  };

  // Manejar selección de Ubigeo
  const handleUbigeoSelect = (selection: UbigeoSelection) => {
    
    // Concatenar código y nombre con guión simple sin espacios
    const ubigeoValue = `${selection.codigo}-${selection.nombre}`;
    
    // Actualizar el formulario con el código y nombre concatenados
    setFormData({
      ...formData,
      personaData: { 
        ...formData.personaData, 
        ubigeo: ubigeoValue 
      }
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

  // Funciones para manejar el modal de filtros
  const openFilterModal = () => {
    setFilterModal({ isOpen: true });
  };

  const closeFilterModal = () => {
    setFilterModal({ isOpen: false });
  };

  // Definir controles de filtro principales
  const filterControls: FilterControl[] = [
    {
      key: 'busqueda',
      label: 'Buscar por nombre o documento',
      type: 'text',
      placeholder: 'Ingrese nombre, apellido o número de documento...'
    },
    {
      key: 'tipoDoc',
      label: 'Tipo de Documento',
      type: 'select',
      options: TIPOS_DOCUMENTO.map(tipo => ({
        value: tipo.value,
        label: tipo.label
      }))
    },
    {
      key: 'estadoLaboral',
      label: 'Estado Laboral',
      type: 'select',
      options: ESTADOS_LABORALES.map(estado => ({
        value: estado.value.toString(),
        label: estado.label
      }))
    },
    {
      key: 'fechaIngresoDesde',
      label: 'Fecha de ingreso desde',
      type: 'date'
    },
    {
      key: 'fechaIngresoHasta',
      label: 'Fecha de ingreso hasta',
      type: 'date'
    },
    {
      key: 'soloActivos',
      label: 'Solo empleados activos',
      type: 'checkbox',
      defaultValue: true
    }
  ];

  // Función para aplicar filtros
  const handleApplyFilters = async (filters: FilterValue, pagination: { page: number; pageSize: number }) => {
    try {
      setCurrentFilters(filters);
      setCurrentPage(pagination.page);
      setPageSize(pagination.pageSize);
      
      // Aplicar filtros localmente por ahora
      // En un futuro se podría enviar los filtros al backend
      await loadPersonas();
      
      AlertService.success('Filtros aplicados correctamente');
    } catch (error) {
      // Error al aplicar filtros
      AlertService.error('Error al aplicar los filtros');
    }
  };

  // Función para exportar datos
  const handleExportData = async (filters: FilterValue, pagination: { page: number; pageSize: number }): Promise<any[]> => {
    try {
      // Obtener datos con filtros aplicados y paginación para exportación
      const exportData = filteredPersonas.map(persona => ({
        'Código Empleado': persona.codEmpleado,
        'Tipo Doc.': persona.tipoDoc === 1 ? 'DNI' : 
                     persona.tipoDoc === 2 ? 'CE' :
                     persona.tipoDoc === 3 ? 'PASSPORT' :
                     persona.tipoDoc === 4 ? 'RUC' : 'N/A',
        'Nro. Documento': persona.nroDoc,
        'Apellido Paterno': persona.apellidoPaterno,
        'Apellido Materno': persona.apellidoMaterno,
        'Nombres': persona.nombres,
        'Email Personal': persona.emailPersonal,
        'Celular': persona.celular || '',
        'Fecha Nacimiento': persona.fechaNacimiento ? 
          new Date(persona.fechaNacimiento).toLocaleDateString('es-PE') : '',
        'Fecha Ingreso': persona.fechaIngreso ? 
          new Date(persona.fechaIngreso).toLocaleDateString('es-PE') : '',
        'Estado Laboral': ESTADOS_LABORALES.find(e => e.value === persona.estadoLaboral)?.label || 'N/A',
        'Estado': persona.estado === 1 ? 'ACTIVO' : 'INACTIVO',
        'Dirección': persona.direccion || '',
        'Fecha Creación': persona.fechaCreacion ? 
          new Date(persona.fechaCreacion).toLocaleDateString('es-PE') : ''
      }));

      return exportData;
    } catch (error) {
      // Error al exportar datos
      throw error;
    }
  };

  // Función para generar datos de precarga para el componente Ubigeo
  const getUbigeoPreloadData = () => {
    const ubigeoValue = formData.personaData.ubigeo;
    
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

  // Función para renderizar el contenido del modal de detalles
  const renderDetailModalContent = () => {
    if (!detailModal.persona) return null;

    const persona = detailModal.persona;
    const usuario = detailModal.usuario;

    return (
      <div style={{ padding: '20px' }}>
        {/* Header del modal con foto y nombre */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '20px',
          backgroundColor: colors.surface,
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: colors.background,
              border: `3px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {persona.fotoUrl ? (
                <img
                  src={persona.fotoUrl}
                  alt="Foto del empleado"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Users size={32} style={{ color: colors.textSecondary }} />
              )}
            </div>
            <div>
              <h3 style={{ 
                color: colors.text, 
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {persona.nombres} {persona.apellidoPaterno} {persona.apellidoMaterno}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: colors.textSecondary
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={16} />
                  {persona.codEmpleado}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={16} />
                  {persona.emailPersonal}
                </span>
              </div>
            </div>
          </div>
          
          {/* Sección de Organización */}
          {(persona.razonSocialOrganizacion || persona.nombreComercialOrganizacion) && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '8px',
              padding: '16px',
              backgroundColor: colors.background,
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              minWidth: '200px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: colors.textSecondary,
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <Building2 size={16} />
                Organización
              </div>
              <div style={{
                textAlign: 'right'
              }}>
                <div style={{
                  color: colors.text,
                  fontSize: '16px',
                  fontWeight: '700',
                  lineHeight: '1.2',
                  marginBottom: '2px'
                }}>
                  {persona.nombreComercialOrganizacion || persona.razonSocialOrganizacion}
                </div>
                {persona.nombreComercialOrganizacion && persona.razonSocialOrganizacion && 
                 persona.nombreComercialOrganizacion !== persona.razonSocialOrganizacion && (
                  <div style={{
                    color: colors.textSecondary,
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    {persona.razonSocialOrganizacion}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contenido en dos columnas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          {/* Columna Izquierda - Datos Personales */}
          <div style={{
            backgroundColor: colors.surface,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: `2px solid ${colors.border}`
            }}>
              <Users size={20} style={{ color: colors.primary }} />
              <h4 style={{ 
                color: colors.text, 
                margin: 0,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Datos Personales
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: colors.background,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                <Settings size={16} style={{ color: colors.textSecondary }} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.textSecondary,
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Documento
                  </div>
                  <div style={{ color: colors.text, fontWeight: '500' }}>
                    {persona.tipoDocTexto}: {persona.nroDoc}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: colors.background,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                <Calendar size={16} style={{ color: colors.textSecondary }} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.textSecondary,
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Fecha de Nacimiento
                  </div>
                  <div style={{ color: colors.text, fontWeight: '500' }}>
                    {formatDateForUI(persona.fechaNacimiento)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: colors.background,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                <Calendar size={16} style={{ color: colors.textSecondary }} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.textSecondary,
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Fecha de Ingreso
                  </div>
                  <div style={{ color: colors.text, fontWeight: '500' }}>
                    {formatDateForUI(persona.fechaIngreso)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: colors.background,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                <Settings size={16} style={{ color: colors.textSecondary }} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.textSecondary,
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Estado Laboral
                  </div>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {getEstadoLaboralBadge(persona.estadoLaboralTexto || 'ACTIVO')}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: colors.background,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                <Settings size={16} style={{ color: colors.textSecondary }} />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.textSecondary,
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Contacto
                  </div>
                  <div style={{ color: colors.text, fontWeight: '500', fontSize: '14px' }}>
                    📱 {persona.celular || 'No especificado'}
                  </div>
                  <div style={{ color: colors.text, fontWeight: '500', fontSize: '14px', marginTop: '4px' }}>
                    🏠 {persona.direccion || 'No especificada'}
                  </div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '4px' }}>
                    📍 Ubigeo: {persona.ubigeo || 'No especificado'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Datos de Usuario */}
          <div style={{
            backgroundColor: colors.surface,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: `2px solid ${colors.border}`
            }}>
              <Shield size={20} style={{ color: colors.primary }} />
              <h4 style={{ 
                color: colors.text, 
                margin: 0,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Datos de Usuario
              </h4>
            </div>

            {usuario ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: colors.background,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`
                }}>
                  <Settings size={16} style={{ color: colors.textSecondary }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: colors.textSecondary,
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Nombre de Usuario
                    </div>
                    <div style={{ 
                      color: colors.text, 
                      fontWeight: '600',
                      fontSize: '16px',
                      fontFamily: 'monospace',
                      backgroundColor: colors.surface,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginTop: '4px'
                    }}>
                      @{usuario.nombreUsuario}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: colors.background,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`
                }}>
                  <Shield size={16} style={{ color: colors.textSecondary }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: colors.textSecondary,
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Perfil de Usuario
                    </div>
                    <div style={{ 
                      color: colors.text, 
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '4px'
                    }}>
                      <span style={{
                        backgroundColor: theme === 'dark' ? '#3b82f6' : colors.primary,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {usuario.nombrePerfil || 'No especificado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: colors.background,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`
                }}>
                  <Settings size={16} style={{ color: colors.textSecondary }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: colors.textSecondary,
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Estado del Usuario
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '4px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: usuario.estado === 1 ? '#dcfce7' : '#fee2e2',
                        color: usuario.estado === 1 ? '#166534' : '#991b1b',
                        border: `1px solid ${usuario.estado === 1 ? '#bbf7d0' : '#fecaca'}`
                      }}>
                        {usuario.estado === 1 ? 
                          <CheckCircle size={14} /> : 
                          <XCircle size={14} />
                        }
                        {usuario.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: colors.background,
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`
                }}>
                  <Clock size={16} style={{ color: colors.textSecondary }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: colors.textSecondary,
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Fecha de Expiración
                    </div>
                    <div style={{ color: colors.text, fontWeight: '500' }}>
                      {usuario.fechaExpiracion ? 
                        new Date(usuario.fechaExpiracion).toLocaleDateString('es-PE') : 
                        '∞ Sin expiración'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Mensaje cuando no hay usuario
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: colors.textSecondary
              }}>
                <Shield size={48} style={{ 
                  color: colors.textSecondary, 
                  opacity: 0.5,
                  marginBottom: '16px'
                }} />
                <p style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  Sin Usuario Asignado
                </p>
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Esta persona no tiene credenciales de usuario para acceder al sistema.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handlers para las acciones del grid - Con carga de datos del backend
  const handleView = async (persona: PersonaDto) => {
    try {
      setIsLoading(true);
      // Cargar datos completos de la persona
      const personaCompleta = await loadPersonaCompleta(persona.personaId);
      if (!personaCompleta) return;
      
      // Cargar usuario relacionado
      const usuario = await loadUsuarioByPersonaId(persona.personaId);
      
      // Abrir modal de detalles en lugar del stepper
      setDetailModal({
        isOpen: true,
        persona: personaCompleta,
        usuario: usuario
      });
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'cargar datos para vista');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (persona: PersonaDto) => {
    try {
      setIsLoading(true);
      
      // Cargar datos completos de la persona
      const personaCompleta = await loadPersonaCompleta(persona.personaId);
      if (!personaCompleta) return;
      
      // Cargar usuario relacionado
      const usuario = await loadUsuarioByPersonaId(persona.personaId);
      setUsuarioActual(usuario);
      
      await openStepper('edit', personaCompleta, usuario);
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'cargar datos para edición');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (persona: PersonaDto) => {
    try {
      const confirmed = await AlertService.confirm(
        `¿Estás seguro de eliminar a ${persona.nombres} ${persona.apellidoPaterno}?`,
        {
          title: 'Confirmar Eliminación',
          confirmText: 'Sí, eliminar',
          cancelText: 'Cancelar'
        }
      );
      
      if (confirmed) {
        setIsLoading(true);
        
        // Preparar request para el backend
        const deleteRequest: DeletePersonaRequest = {
          personaId: persona.personaId,
          forceDelete: false,
          motivo: 'Eliminación desde interfaz de usuario'
        };
        
        // Llamar al servicio del backend
        const response = await personasService.deletePersona(deleteRequest);
        
        if (response.success) {
          await AlertService.success('Persona eliminada exitosamente');
          // Recargar la lista desde el backend
          await loadPersonas();
        } else {
          await ErrorHandler.handleServiceError(
            { response: { data: { message: response.message } } }, 
            'eliminar persona'
          );
        }
      }
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'eliminar persona');
    } finally {
      setIsLoading(false);
    }
  };

  // Definir las acciones del grid - Corregidas para PersonaDto
  const gridActions: GridAction<PersonaDto>[] = [
    {
      icon: 'Eye',
      color: '#3b82f6',
      onClick: (persona) => {
        handleView(persona);
      },
      tooltip: 'Ver detalles'
    },
    {
      icon: 'Edit',
      color: '#f59e0b',
      onClick: (persona) => {
        handleEdit(persona);
      },
      tooltip: 'Editar'
    },
    {
      icon: 'Trash2',
      color: '#ef4444',
      onClick: (persona) => {
        handleDelete(persona);
      },
      tooltip: 'Eliminar'
    }
  ];

  // Definir las columnas del grid - Simplificadas para funcionamiento
  const gridColumns: GridColumn<PersonaDto>[] = [
    {
      id: 'foto',
      header: 'Foto',
      accessor: 'fotoUrl',
      width: '80px',
      sortable: false,
      align: 'center',
      render: (value, row) => (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: colors.background,
          border: `2px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          margin: '0 auto'
        }}>
          {value ? (
            <img
              src={value}
              alt="Foto del empleado"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Users size={20} style={{ color: colors.textSecondary }} />
          )}
        </div>
      )
    },
    {
      id: 'codigo',
      header: 'Código',
      accessor: 'codEmpleado',
      width: '100px',
      sortable: true,
      align: 'center'
    },
    {
      id: 'nombres',
      header: 'Nombres Completos',
      accessor: 'nombreCompleto', // Usar el campo nombreCompleto que ya viene del backend
      width: '250px',
      sortable: true
    },
    {
      id: 'documento',
      header: 'Documento',
      accessor: 'tipoDocTexto', // Usar tipoDocTexto que ya viene formateado
      width: '150px',
      sortable: true,
      align: 'center',
      render: (value, row) => `${value}: ${row.nroDoc}`
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'emailPersonal',
      width: '200px',
      sortable: true
    },
    {
      id: 'estadoLaboral',
      header: 'Estado Laboral',
      accessor: 'estadoLaboralTexto', // Usar estadoLaboralTexto que ya viene formateado
      width: '140px',
      sortable: true,
      align: 'center',
      render: (value) => getEstadoLaboralBadge(value || 'INACTIVO')
    },
    {
      id: 'fechaIngreso',
      header: 'Fecha Ingreso',
      accessor: 'fechaIngreso',
      width: '120px',
      sortable: true,
      align: 'center',
      render: (value) => {
        if (!value) return 'Sin fecha';
        return new Date(value).toLocaleDateString('es-PE');
      }
    },
    {
      id: 'estadoUsuario',
      header: 'Estado Usuario',
      accessor: 'usuarioActivo',
      width: '140px',
      sortable: true,
      align: 'center',
      render: (value) => {
        if (value === -1) {
          return (
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #d1d5db'
            }}>
              Sin Usuario
            </span>
          );
        } else if (value === 1) {
          return (
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: '#dcfce7',
              color: '#166534',
              border: '1px solid #bbf7d0'
            }}>
              Usuario Activo
            </span>
          );
        } else if (value === 0) {
          return (
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca'
            }}>
              Usuario Inactivo
            </span>
          );
        }
        return 'N/A';
      }
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: 'personaId', // Usamos un campo que siempre existe
      width: '120px',
      align: 'center',
      sortable: false,
      actions: gridActions
    }
  ];

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <CheckCircle size={16} style={{ color: '#10b981' }} />;
      case 'INACTIVO':
        return <XCircle size={16} style={{ color: '#6b7280' }} />;
      case 'SUSPENDIDO':
      case 'BLOQUEADO':
        return <AlertCircle size={16} style={{ color: '#f59e0b' }} />;
      case 'VACACIONES':
        return <Calendar size={16} style={{ color: '#8b5cf6' }} />;
      case 'LICENCIA':
        return <Clock size={16} style={{ color: '#06b6d4' }} />;
      case 'CESADO':
        return <XCircle size={16} style={{ color: '#ef4444' }} />;
      default:
        return null;
    }
  };

  const getEstadoLaboralBadge = (estadoLaboral: string) => {
    const getBadgeStyle = (estado: string) => {
      const isDark = theme === 'dark';
      
      switch (estado.toUpperCase()) {
        case 'ACTIVO':
          return {
            backgroundColor: isDark ? '#22c55e20' : '#dcfce7',
            color: isDark ? '#22c55e' : '#166534',
            border: `1px solid ${isDark ? '#22c55e40' : '#bbf7d0'}`
          };
        case 'INACTIVO':
          return {
            backgroundColor: isDark ? '#6b728020' : '#f3f4f6',
            color: isDark ? '#9ca3af' : '#374151',
            border: `1px solid ${isDark ? '#6b728040' : '#d1d5db'}`
          };
        case 'SUSPENDIDO':
          return {
            backgroundColor: isDark ? '#f59e0b20' : '#fef3c7',
            color: isDark ? '#f59e0b' : '#92400e',
            border: `1px solid ${isDark ? '#f59e0b40' : '#fde68a'}`
          };
        case 'BLOQUEADO':
          return {
            backgroundColor: isDark ? '#ef444420' : '#fee2e2',
            color: isDark ? '#ef4444' : '#991b1b',
            border: `1px solid ${isDark ? '#ef444440' : '#fecaca'}`
          };
        case 'VACACIONES':
          return {
            backgroundColor: isDark ? '#8b5cf620' : '#ede9fe',
            color: isDark ? '#a855f7' : '#6b21a8',
            border: `1px solid ${isDark ? '#8b5cf640' : '#ddd6fe'}`
          };
        case 'LICENCIA':
          return {
            backgroundColor: isDark ? '#06b6d420' : '#cffafe',
            color: isDark ? '#06b6d4' : '#0e7490',
            border: `1px solid ${isDark ? '#06b6d440' : '#a5f3fc'}`
          };
        case 'CESADO':
          return {
            backgroundColor: isDark ? '#ef444420' : '#fee2e2',
            color: isDark ? '#ef4444' : '#991b1b',
            border: `1px solid ${isDark ? '#ef444440' : '#fecaca'}`
          };
        default:
          return {
            backgroundColor: isDark ? '#6b728020' : '#f9fafb',
            color: isDark ? '#9ca3af' : '#6b7280',
            border: `1px solid ${isDark ? '#6b728040' : '#e5e7eb'}`
          };
      }
    };

    const badgeStyle = getBadgeStyle(estadoLaboral);

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          ...badgeStyle
        }}
      >
        {getEstadoIcon(estadoLaboral)}
        {estadoLaboral}
      </span>
    );
  };

  // Definir los steps del stepper
  const stepperSteps = [
    {
      id: 'persona',
      label: 'Datos Personales',
      icon: Users,
      isOptional: false
    },
    {
      id: 'usuario',
      label: 'Datos Usuario',
      icon: Shield,
      isOptional: false
    },
    {
      id: 'resumen',
      label: 'Resumen',
      icon: FileText,
      isOptional: false
    }
  ];

  // Función para validar si se puede avanzar al siguiente step
  const canAdvanceToNextStep = (): boolean => {
    switch (currentStep) {
      case 0: // Datos Personales
        // Obligatorios: Nombres, Apellido Paterno, Organización, Número de Documento válido y Fecha de Nacimiento (18+ años)
        const nombresValid = formData.personaData.nombres.trim() !== '';
        const apellidoPaternoValid = formData.personaData.apellidoPaterno.trim() !== '';
        const organizacionValid = formData.personaData.organizacionId !== null && formData.personaData.organizacionId > 0;
        
        // Validar número de documento según el tipo seleccionado
        const tipoDocValid = formData.personaData.tipoDoc.trim() !== '';
        const nroDocValid = formData.personaData.nroDoc.trim() !== '' && 
                           validateDocumentNumber(formData.personaData.nroDoc, formData.personaData.tipoDoc);
        
        // Validar fecha de nacimiento (obligatoria y mayor de 18 años)
        const fechaNacimientoValid = formData.personaData.fechaNacimiento.trim() !== '';
        const edadValid = fechaNacimientoValid && validateBirthDate(formData.personaData.fechaNacimiento, 18).isValid;
        
        // 🔧 Validar fecha de ingreso (opcional, pero si está presente debe ser válida)
        const fechaIngresoValid = !formData.personaData.fechaIngreso || !validateFechaIngreso(formData.personaData.fechaIngreso);
        
        return nombresValid && apellidoPaternoValid && organizacionValid && tipoDocValid && nroDocValid && fechaNacimientoValid && edadValid && fechaIngresoValid;
        
      case 1: // Datos Usuario
        // 🔧 NUEVO: Si no es usuario, no validar campos de usuario
        if (!esUsuario) {
          return true; // Permitir avanzar sin validar campos de usuario
        }
        
        // Solo obligatorios: Nombre Usuario, Contraseña (condicional), Perfil
        const nombreUsuarioValid = formData.usuarioData.nombreUsuario.trim() !== '';
        
        // 🔧 NUEVO: Lógica condicional para validación de contraseña
        let passwordValid = true;
        if (stepper.mode === 'create') {
          // Modo creación: contraseña siempre obligatoria
          passwordValid = formData.usuarioData.hashPassword.trim() !== '';
        } else if (stepper.mode === 'edit') {
          // Modo edición: depende si es usuario existente o nuevo
          if (usuarioActual === null) {
            // Caso: Persona sin usuario -> Crear usuario nuevo (contraseña obligatoria)
            passwordValid = formData.usuarioData.hashPassword.trim() !== '';
          } else {
            // Caso: Usuario existente -> Editar usuario (contraseña opcional)
            passwordValid = true; // Siempre válida, el backend maneja si no se envía
          }
        }
        
        const perfilValid = formData.usuarioData.perfilId > 0;
        
        // 🔧 Validar fecha de expiración (opcional, pero si está presente debe ser válida)
        const fechaExpiracionValid = !formData.usuarioData.fechaExpiracion || !validateFechaExpiracion(formData.usuarioData.fechaExpiracion);
        
        return nombreUsuarioValid && passwordValid && perfilValid && fechaExpiracionValid;
        
      default:
        return true;
    }
  };

  // Handlers para navegación del stepper
  const handleStepperNext = async () => {
    // Validar campos obligatorios antes de avanzar
    if (!canAdvanceToNextStep()) {
      await AlertService.warning('Por favor complete todos los campos obligatorios antes de continuar');
      return;
    }
    
    if (currentStep < stepperSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepperPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepperFinish = async () => {
    try {
      // 🔧 Validación final de fechas antes de enviar
      const fechaIngresoError = validateFechaIngreso(formData.personaData.fechaIngreso);
      const fechaExpiracionError = validateFechaExpiracion(formData.usuarioData.fechaExpiracion);
      
      if (fechaIngresoError) {
        await AlertService.error(`Error en fecha de ingreso: ${fechaIngresoError}`);
        setCurrentStep(0); // Volver al primer paso
        return;
      }
      
      if (fechaExpiracionError) {
        await AlertService.error(`Error en fecha de expiración: ${fechaExpiracionError}`);
        setCurrentStep(1); // Volver al segundo paso
        return;
      }
      
      // Usar directamente el organizacionId del formulario (ya se asigna automáticamente via useEffect)
      const organizacionIdParaPersona = formData.personaData.organizacionId;

      if (stepper.mode === 'create') {
        // Construir objeto para POST (INSERT)
        const createPayload: CreatePersonaConUsuarioRequest = {
          // Datos del usuario (SIN organizacionId)
          crearUsuario: esUsuario, // 🔧 NUEVO: Usar el estado del checkbox
          nombreUsuario: formData.usuarioData.nombreUsuario,
          password: formData.usuarioData.hashPassword,
          tipoUsuarioId: 0, // Valor por defecto
          perfilId: formData.usuarioData.perfilId,
          fechaExpiracion: formData.usuarioData.fechaExpiracion ? 
            new Date(formData.usuarioData.fechaExpiracion).toISOString() : null,
          estadoUsuario: formData.usuarioData.estado, // 1 = ACTIVO, 0 = INACTIVO
          
          // Datos de la persona (CON organizacionId tomado del contexto del usuario logueado)
          tipoDoc: mapTipoDocToBackend(formData.personaData.tipoDoc) || 0,
          nroDoc: formData.personaData.nroDoc,
          codEmpleado: formData.personaData.codEmpleado,
          apellidoPaterno: formData.personaData.apellidoPaterno,
          apellidoMaterno: formData.personaData.apellidoMaterno,
          nombres: formData.personaData.nombres,
          fotoUrl: formData.personaData.fotoUrl || "",
          estadoLaboral: formData.personaData.estadoLaboral,
          fechaNacimiento: normalizeDateForBackend(formData.personaData.fechaNacimiento),
          fechaIngreso: normalizeDateForBackend(formData.personaData.fechaIngreso),
          emailPersonal: formData.personaData.emailPersonal,
          celular: formData.personaData.celular,
          direccion: formData.personaData.direccion,
          ubigeo: formData.personaData.ubigeo,
          organizacionId: organizacionIdParaPersona, // MOVIDO: Ahora es parte de Persona
          sedeId: formData.personaData.sedeId, // NUEVO: Sede seleccionada
          
          // 🔧 NUEVO: Flag para indicar si la persona debe tener usuario
          esUsuario: esUsuario
        };
        
        // Llamar al servicio para crear persona con usuario
        const response = await personasService.createPersonaConUsuario(createPayload);
        
        if (response.success) {
        await AlertService.success('Usuario registrado exitosamente');
          // Recargar la lista de personas
          await loadPersonas();
        } else {
          await ErrorHandler.handleServiceError(
            { response: { data: { message: response.message } } }, 
            'registrar usuario'
          );
        }
        
      } else if (stepper.mode === 'edit') {
        // Determinar si se debe actualizar usuario basado en si existe uno asociado
        const tieneUsuarioAsociado = usuarioActual !== null;

        if (tieneUsuarioAsociado) {
          // Caso 1: Persona CON usuario asociado - Usar updatePersonaConUsuario
          const updatePayload: UpdatePersonaConUsuarioRequest = {
            // Datos del usuario (SIN organizacionId)
            actualizarUsuario: esUsuario, // 🔧 NUEVO: Usar el estado del checkbox
            usuarioId: usuarioActual!.usuarioId,
            nombreUsuario: formData.usuarioData.nombreUsuario,
            password: formData.usuarioData.hashPassword || "", // Puede estar vacío si no se cambia
            tipoUsuarioId: 0, // Valor por defecto
            perfilId: formData.usuarioData.perfilId,
            fechaExpiracion: formData.usuarioData.fechaExpiracion ? 
              new Date(formData.usuarioData.fechaExpiracion).toISOString() : null,
            estadoUsuario: formData.usuarioData.estado, // 1 = ACTIVO, 0 = INACTIVO
            
            // Datos de la persona (CON organizacionId tomado del contexto del usuario logueado)
            personaId: stepper.data?.personaId || 0,
            tipoDoc: mapTipoDocToBackend(formData.personaData.tipoDoc) || 0,
            nroDoc: formData.personaData.nroDoc,
            codEmpleado: formData.personaData.codEmpleado,
            apellidoPaterno: formData.personaData.apellidoPaterno,
            apellidoMaterno: formData.personaData.apellidoMaterno,
            nombres: formData.personaData.nombres,
            fotoUrl: formData.personaData.fotoUrl || "",
            estadoLaboral: formData.personaData.estadoLaboral,
            fechaNacimiento: normalizeDateForBackend(formData.personaData.fechaNacimiento),
            fechaIngreso: normalizeDateForBackend(formData.personaData.fechaIngreso),
            emailPersonal: formData.personaData.emailPersonal,
            celular: formData.personaData.celular,
            direccion: formData.personaData.direccion,
            ubigeo: formData.personaData.ubigeo,
            organizacionId: organizacionIdParaPersona,
            sedeId: formData.personaData.sedeId, // NUEVO: Sede seleccionada
            
            // 🔧 NUEVO: Flag para indicar si la persona debe tener usuario
            esUsuario: esUsuario
          };
          
          // Llamar al servicio para actualizar persona con usuario
          const response = await personasService.updatePersonaConUsuario(updatePayload);
          
          if (response.success) {
            await AlertService.success('Persona y usuario actualizados exitosamente');
            await loadPersonas();
          } else {
            await ErrorHandler.handleServiceError(
              { response: { data: { message: response.message } } }, 
              'actualizar persona y usuario'
            );
          }
        } else {
          // Caso 2: Persona SIN usuario asociado
          // Primero: actualizar datos de la persona
          const updatePersonaPayload: UpdatePersonaRequest = {
            personaId: stepper.data?.personaId || 0,
            tipoDoc: mapTipoDocToBackend(formData.personaData.tipoDoc) || 0,
            nroDoc: formData.personaData.nroDoc,
            codEmpleado: formData.personaData.codEmpleado,
            apellidoPaterno: formData.personaData.apellidoPaterno,
            apellidoMaterno: formData.personaData.apellidoMaterno,
            nombres: formData.personaData.nombres,
            fotoUrl: formData.personaData.fotoUrl || "",
            estadoLaboral: formData.personaData.estadoLaboral,
            fechaNacimiento: normalizeDateForBackend(formData.personaData.fechaNacimiento),
            fechaIngreso: normalizeDateForBackend(formData.personaData.fechaIngreso),
            emailPersonal: formData.personaData.emailPersonal,
            celular: formData.personaData.celular,
            direccion: formData.personaData.direccion,
            ubigeo: formData.personaData.ubigeo,
            organizacionId: organizacionIdParaPersona,
            sedeId: formData.personaData.sedeId
          };

          const personaResponse = await personasService.updatePersona(updatePersonaPayload);

          if (!personaResponse.success) {
            await ErrorHandler.handleServiceError(
              { response: { data: { message: personaResponse.message } } },
              'actualizar persona'
            );
          } else {
            // Si el checkbox "Es usuario" está marcado, crear el usuario ahora
            if (esUsuario) {
              const createUsuarioPayload: CreateUsuarioRequest = {
                nombreUsuario: formData.usuarioData.nombreUsuario,
                password: formData.usuarioData.hashPassword,
                perfilId: formData.usuarioData.perfilId || null,
                personaId: stepper.data?.personaId || 0,
                tipoUsuarioId: 0,
                fechaExpiracion: formData.usuarioData.fechaExpiracion
                  ? new Date(formData.usuarioData.fechaExpiracion).toISOString()
                  : null
              };

              const usuarioResponse = await usuariosService.createUsuario(createUsuarioPayload);

              if (!usuarioResponse.success) {
                await ErrorHandler.handleServiceError(
                  { response: { data: { message: usuarioResponse.message } } },
                  'crear usuario para persona'
                );
              } else {
                await AlertService.success('Persona actualizada y usuario creado exitosamente');
                await loadPersonas();
              }
            } else {
              await AlertService.success('Persona actualizada exitosamente');
              await loadPersonas();
            }
          }
        }
      }
      closeStepper();
    } catch (error) {
      await ErrorHandler.handleServiceError(error, 'procesar solicitud');
    }
  };

  // Render del contenido del stepper
  const renderStepperContent = () => {
    if (stepper.mode === 'view' && stepper.data) {
      // Mostrar información de solo lectura
      const persona = stepper.data;
      return (
        <div className={styles.modalViewContent}>
          <div className={styles.modalViewSection}>
            <div className={styles.modalViewSectionTitle}>
              <Users size={20} />
              Información Personal
            </div>
            
            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Users size={14} />
                Código Empleado
              </div>
              <div className={styles.modalViewValue}>{persona.codEmpleado}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Users size={14} />
                Nombres Completos
              </div>
              <div className={styles.modalViewValue}>{persona.nombres} {persona.apellidoPaterno} {persona.apellidoMaterno}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Settings size={14} />
                Documento
              </div>
              <div className={styles.modalViewValue}>{persona.tipoDoc}: {persona.nroDoc}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Mail size={14} />
                Email Personal
              </div>
              <div className={styles.modalViewValue}>{persona.emailPersonal}</div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Building2 size={14} />
                Organización
              </div>
              <div className={styles.modalViewValue}>
                {(() => {
                  if (!persona.organizacionId) {
                    return 'Sin organización asignada';
                  }
                  if (organizaciones.length === 0) {
                    return 'Cargando organizaciones...';
                  }
                  const org = organizaciones.find(o => o.organizacionId === persona.organizacionId);
                  return org ? org.razonSocial : `Organización ID: ${persona.organizacionId}`;
                })()}
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Building2 size={14} />
                Sede
              </div>
              <div className={styles.modalViewValue}>
                {(() => {
                  if (!persona.sedeId) {
                    return 'Sin sede asignada';
                  }
                  if (sedes.length === 0) {
                    return 'Información no disponible';
                  }
                  const sede = sedes.find(s => s.sedeId === persona.sedeId);
                  return sede ? sede.nombre : `Sede ID: ${persona.sedeId}`;
                })()}
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Calendar size={14} />
                Fecha de Ingreso
              </div>
              <div className={styles.modalViewValue}>
                {persona.fechaIngreso 
                  ? new Date(persona.fechaIngreso).toLocaleDateString('es-PE')
                  : 'Sin fecha'
                }
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Settings size={14} />
                Estado
              </div>
              <div className={styles.modalViewValue}>
                <span className={`${styles.statusBadge} ${styles[persona.estado === 1 ? 'activo' : 'inactivo']}`}>
                  {getEstadoIcon(persona.estado === 1 ? 'ACTIVO' : 'INACTIVO')}
                  {persona.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>

            <div className={styles.modalViewItem}>
              <div className={styles.modalViewLabel}>
                <Users size={14} />
                Foto
              </div>
              <div className={styles.modalViewValue}>
                {persona.fotoUrl ? (
                  <img
                    src={persona.fotoUrl}
                    alt="Foto del empleado"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `2px solid ${colors.border}`
                    }}
                  />
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: colors.background,
                    border: `2px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textSecondary
                  }}>
                    <Users size={24} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección de información del usuario */}
          {usuarioActual && (
            <div className={styles.modalViewSection}>
              <div className={styles.modalViewSectionTitle}>
                <Shield size={20} />
                Información de Usuario
              </div>
              
              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>
                  <Shield size={14} />
                  Nombre de Usuario
                </div>
                <div className={styles.modalViewValue}>{usuarioActual.nombreUsuario}</div>
              </div>

              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>
                  <Settings size={14} />
                  Estado de Usuario
                </div>
                <div className={styles.modalViewValue}>
                  <span className={`${styles.statusBadge} ${styles[usuarioActual.estado === 1 ? 'activo' : 'inactivo']}`}>
                    {getEstadoIcon(usuarioActual.estado === 1 ? 'ACTIVO' : 'INACTIVO')}
                    {usuarioActual.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>

              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>
                  <Clock size={14} />
                  Fecha de Expiración
                </div>
                <div className={styles.modalViewValue}>
                  {usuarioActual.fechaExpiracion ? 
                    new Date(usuarioActual.fechaExpiracion).toLocaleDateString('es-PE') : 
                    'Sin expiración'
                  }
                </div>
              </div>

              <div className={styles.modalViewItem}>
                <div className={styles.modalViewLabel}>
                  <FileText size={14} />
                  Perfil ID
                </div>
                <div className={styles.modalViewValue}>{usuarioActual.perfilId}</div>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay usuario */}
          {!usuarioActual && (
            <div className={styles.modalViewSection}>
              <div className={styles.modalViewSectionTitle}>
                <Shield size={20} />
                Información de Usuario
              </div>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: colors.textSecondary,
                fontStyle: 'italic'
              }}>
                Esta persona no tiene usuario asignado
              </div>
            </div>
          )}
        </div>
      );
    }

    // Formularios para crear/editar
    switch (currentStep) {
      case 0: // Datos Personales
        return (
          <div className={styles.stepForm}>
            <div className={styles.formGrid}>
              {/* FILA 1: Documento de Identidad */}
              <div className={styles.formGroup}>
                <SelectWrapper
                  label="Tipo de Documento"
                  required={true}
                  icon="FileText"
                  value={formData.personaData.tipoDoc}
                  onValueChange={(value) => {
                    // 🔧 Al cambiar tipo de documento, validar y adaptar número existente
                    const currentNroDoc = formData.personaData.nroDoc;
                    let newNroDoc = currentNroDoc;
                    
                    // Si hay un número de documento existente, intentar adaptarlo al nuevo tipo
                    if (currentNroDoc) {
                      const adaptedDoc = adaptDocumentToNewType(currentNroDoc, value);
                      
                      if (adaptedDoc !== null) {
                        // Se pudo adaptar exitosamente
                        newNroDoc = adaptedDoc;
                      } else if (!validateDocumentNumber(currentNroDoc, value)) {
                        // No se pudo adaptar y no es válido: limpiarlo
                        newNroDoc = '';
                        const tipoLabel = TIPOS_DOCUMENTO.find(t => t.value === value)?.label || value;
                        AlertService.info(`Número de documento limpiado: el formato anterior no es válido para ${tipoLabel}`);
                      }
                    }
                    
                    setFormData({
                      ...formData,
                      personaData: { 
                        ...formData.personaData, 
                        tipoDoc: value,
                        nroDoc: newNroDoc // 🔧 Actualizar también el número de documento
                      }
                    });
                  }}
                  placeholder="Seleccione tipo de documento"
                >
                  <SelectContent style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}>
                    {TIPOS_DOCUMENTO.map(tipo => (
                      <SelectItem 
                        key={tipo.value} 
                        value={tipo.value}
                        style={{ color: colors.text }}
                      >
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWrapper>
              </div>

              <div className={styles.formGroup}>
                {(() => {
                  const docRules = getDocumentValidationRules(formData.personaData.tipoDoc);
                  return (
                    <InputWrapper
                      label="Número de Documento"
                      required={true}
                      icon="CreditCard"
                      type="text"
                      value={formData.personaData.nroDoc}
                      onValueChange={(value) => {
                        // Formatear el valor según el tipo de documento
                        const formattedValue = formatDocumentNumber(value, formData.personaData.tipoDoc);
                        setFormData({
                          ...formData,
                          personaData: { ...formData.personaData, nroDoc: formattedValue }
                        });
                      }}
                      placeholder={docRules.placeholder}
                      maxLength={docRules.maxLength}
                      pattern={docRules.pattern}
                      inputMode={docRules.inputMode}
                      title={docRules.description}
                      style={{
                        borderColor: formData.personaData.nroDoc && !validateDocumentNumber(formData.personaData.nroDoc, formData.personaData.tipoDoc) 
                          ? '#EF4444' : undefined
                      }}
                    />
                  );
                })()}
                {/* Mensaje de ayuda con formato esperado */}
                {formData.personaData.tipoDoc && (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6B7280', 
                    margin: '4px 0 0 0',
                    fontStyle: 'italic' 
                  }}>
                    {getDocumentFormatHelp(formData.personaData.tipoDoc)}
                  </p>
                )}
                {/* Mensaje de error si el formato es incorrecto */}
                {formData.personaData.nroDoc && !validateDocumentNumber(formData.personaData.nroDoc, formData.personaData.tipoDoc) && (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#EF4444', 
                    margin: '4px 0 0 0' 
                  }}>
                    {getDocumentValidationRules(formData.personaData.tipoDoc).errorMessage}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <InputWrapper
                  label="Código Empleado"
                  icon="Hash"
                  value={formData.personaData.codEmpleado}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    personaData: { ...formData.personaData, codEmpleado: value }
                  })}
                  placeholder="Código único del empleado"
                  maxLength={30}
                />
              </div>

              {/* FILA 2: Nombres y Apellidos */}
              <div className={styles.formGroup}>
                <InputWrapper
                  label="Nombres"
                  required={true}
                  icon="User"
                  value={formData.personaData.nombres}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    personaData: { ...formData.personaData, nombres: value }
                  })}
                  placeholder="Nombres completos"
                  maxLength={150}
                />
              </div>

              <div className={styles.formGroup}>
                <InputWrapper
                  label="Apellido Paterno"
                  required={true}
                  icon="Users"
                  value={formData.personaData.apellidoPaterno}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    personaData: { ...formData.personaData, apellidoPaterno: value }
                  })}
                  placeholder="Apellido paterno"
                  maxLength={100}
                />
              </div>

              <div className={styles.formGroup}>
                <InputWrapper
                  label="Apellido Materno"
                  icon="Users"
                  value={formData.personaData.apellidoMaterno}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    personaData: { ...formData.personaData, apellidoMaterno: value }
                  })}
                  placeholder="Apellido materno"
                  maxLength={100}
                />
              </div>

              {/* FILA 3: Fechas y Email */}
              <div className={styles.formGroup}>
                {(() => {
                  const birthValidation = validateBirthDate(formData.personaData.fechaNacimiento, 18);
                  
                  return (
                    <>
                      <InputWrapper
                        label="Fecha de Nacimiento"
                        icon="Calendar"
                        type="date"
                        required={true}
                        value={formData.personaData.fechaNacimiento}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          personaData: { ...formData.personaData, fechaNacimiento: value }
                        })}
                        style={{
                          borderColor: formData.personaData.fechaNacimiento && !birthValidation.isValid 
                            ? '#EF4444' : undefined
                        }}
                        title="Debe ser mayor de 18 años"
                      />
                      {/* Mensaje de ayuda */}
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6B7280', 
                        margin: '4px 0 0 0',
                        fontStyle: 'italic' 
                      }}>
                        Debe ser mayor de 18 años
                      </p>
                      {/* Mensaje de error si hay problemas de validación */}
                      {formData.personaData.fechaNacimiento && !birthValidation.isValid && (
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#EF4444', 
                          margin: '4px 0 0 0' 
                        }}>
                          {birthValidation.errorMessage}
                        </p>
                      )}
                      {/* Mostrar edad actual si es válida */}
                      {formData.personaData.fechaNacimiento && birthValidation.isValid && birthValidation.age > 0 && (
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#10B981', 
                          margin: '4px 0 0 0',
                          fontWeight: '500'
                        }}>
                          ✅ Edad: {birthValidation.age} años
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className={styles.formGroup}>
                <InputWrapper
                  label="Fecha de Ingreso"
                  icon="LogIn"
                  type="date"
                  value={formData.personaData.fechaIngreso}
                  onValueChange={(value) => {
                    // 🔧 Validar fecha de ingreso
                    const error = validateFechaIngreso(value);
                    setFechaIngresoError(error);
                    
                    setFormData({
                      ...formData,
                      personaData: { ...formData.personaData, fechaIngreso: value }
                    });
                  }}
                  error={fechaIngresoError}
                  helperText={fechaIngresoError || "La fecha de ingreso no puede ser futura"}
                />
              </div>

              <div className={styles.formGroup}>
                <InputWrapper
                  label="Email Personal"
                  icon="Mail"
                  type="email"
                  required={true}
                  value={formData.personaData.emailPersonal}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    personaData: { ...formData.personaData, emailPersonal: value }
                  })}
                  placeholder="ejemplo@correo.com"
                  maxLength={200}
                />
              </div>

              {/* FILA 4: Contacto, Estado y Organización */}
              <div className={styles.formGroup}>
                <InputWrapper
                  label="Celular"
                  icon="Phone"
                  required={false}
                  value={formData.personaData.celular}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    personaData: { ...formData.personaData, celular: value }
                  })}
                  placeholder="Número de celular"
                  maxLength={50}
                />
              </div>

              <div className={styles.formGroup}>
                <SelectWrapper
                  label="Estado Laboral"
                  icon="Briefcase"
                  value={formData.personaData.estadoLaboral.toString()}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    personaData: { ...formData.personaData, estadoLaboral: Number(value) }
                  })}
                  placeholder="Seleccione estado laboral"
                >
                  <SelectContent style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}>
                    {ESTADOS_LABORALES.map(estado => (
                      <SelectItem 
                        key={estado.value} 
                        value={estado.value.toString()}
                        style={{ color: colors.text }}
                      >
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWrapper>
              </div>

              {/* Selector de Organización - Condicional según perfil */}
              <div className={styles.formGroup}>
                
                {/* Renderizado condicional: SearchableSelect habilitado vs Input readonly */}
                {formData.usuarioData.perfilId === 1 && stepper.mode !== 'view' ? (
                  // Super Admin: SearchableSelect habilitado
                  <SearchableSelect
                    label="Organización"
                    required={true}
                    icon={Building2}
                    value={formData.personaData.organizacionId}
                    onChange={(value: string | number) => {
                      setFormData({
                        ...formData,
                        personaData: { ...formData.personaData, organizacionId: Number(value) }
                      });
                    }}
                    options={organizaciones.map(org => ({
                      value: org.organizacionId,
                      label: org.razonSocial || 'Sin nombre'
                    }))}
                    placeholder="Seleccione una organización"
                    noResultsText="No hay organizaciones disponibles"
                    searchPlaceholder="Buscar organización..."
                    disabled={false}
                  />
                ) : (
                  // Otros perfiles o modo view: Input readonly que muestra el valor
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label 
                      className="block text-sm font-medium"
                      style={{ color: colors.text }}
                    >
                      Organización <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{
                      height: '32px',
                      borderRadius: '8px',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: theme === 'dark' ? '#2d3748' : '#f8f9fa', // Adaptado al tema
                      border: `0.5px solid ${colors.border}`,
                      color: theme === 'dark' ? '#a0aec0' : colors.text, // Texto adaptado al tema
                      fontSize: '14px',
                      boxShadow: theme === 'dark' 
                        ? 'inset 0 1px 2px rgba(0, 0, 0, 0.2)' 
                        : '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09)'
                    }}>
                      <Building2 size={16} style={{ color: colors.textSecondary }} />
                      <span style={{ flex: 1 }}>
                        {(() => {
                          if (!formData.personaData.organizacionId) {
                            return 'Sin organización asignada';
                          }
                          if (organizaciones.length === 0) {
                            return 'Cargando organizaciones...';
                          }
                          const org = organizaciones.find(o => o.organizacionId === formData.personaData.organizacionId);
                          return org ? org.razonSocial : `Organización ID: ${formData.personaData.organizacionId}`;
                        })()}
                      </span>

                    </div>
                    
                    {/* Input hidden para validación HTML5 nativa */}
                    <input
                      type="text"
                      value={formData.personaData.organizacionId ? formData.personaData.organizacionId.toString() : ''}
                      onChange={() => {}} // 🔧 FIX: Agregar onChange vacío para evitar warnings
                      required
                      style={{
                        position: 'absolute',
                        left: '-9999px',
                        opacity: 0,
                        pointerEvents: 'none'
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();
                        // Validación para organización en modo readonly
                      }}
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>
                )}

              </div>

              {/* Campo de Sede - Jerárquico basado en Organización */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: colors.text }}
                  >
                    Sede
                  </label>
                  
                  {/* Selector de Sede habilitado solo si hay organización seleccionada */}
                  {formData.personaData.organizacionId ? (
                    <SearchableSelect
                      value={formData.personaData.sedeId}
                                          onChange={(value: string | number) => {
                      setFormData({
                        ...formData,
                        personaData: { ...formData.personaData, sedeId: value ? Number(value) : null }
                      });
                    }}
                                             options={sedes.map(sede => ({
                         value: sede.sedeId,
                         label: sede.ubigeo ? 
                           `${sede.nombre || 'Sin nombre'} - ${sede.ubigeo.includes('-') ? sede.ubigeo.split('-')[1] : sede.ubigeo}` : 
                           sede.nombre || 'Sin nombre'
                       }))}
                      placeholder={sedes.length > 0 ? "Seleccione una sede" : "No hay sedes disponibles"}
                      noResultsText="No hay sedes disponibles"
                      searchPlaceholder="Buscar sede..."
                      disabled={sedes.length === 0 || stepper.mode === 'view'}
                    />
                  ) : (
                    // Mostrar campo deshabilitado si no hay organización seleccionada
                    <div style={{
                      height: '32px',
                      borderRadius: '8px',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#f8f9fa',
                      border: `0.5px solid ${colors.border}`,
                      color: colors.textSecondary,
                      fontSize: '14px',
                      boxShadow: '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09)'
                    }}>
                      <Building2 size={16} style={{ color: colors.textSecondary }} />
                      <span>Seleccione una organización primero</span>
                    </div>
                  )}
                  
                  {/* Información adicional */}
                  {formData.personaData.organizacionId && sedes.length === 0 && (
                    <div style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      fontStyle: 'italic',
                      marginTop: '4px'
                    }}>
                      Esta organización no tiene sedes registradas
                    </div>
                  )}
                </div>
              </div>

              {/* FILA 5: Dirección y Ubigeo */}
              <div className={styles.direccionUbigeoRow}>
              <div className={styles.formGroup}>
                  <InputWrapper
                    label="Dirección"
                  icon="Home"
                  value={formData.personaData.direccion}
                    onValueChange={(value) => setFormData({
                    ...formData,
                      personaData: { ...formData.personaData, direccion: value }
                  })}
                  placeholder="Dirección completa"
                />
              </div>

                                 <div className={styles.formGroup}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                     <label 
                       className="block text-sm font-medium"
                       style={{ 
                         color: colors.text
                       }}
                     >
                       Ubigeo
                     </label>
                     
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
                         height: '32px', // Altura exacta del Input
                         borderRadius: '8px',
                         padding: '0 12px', // Padding exacto del Input
                         fontSize: '14px',
                         lineHeight: '1.4',
                         transition: 'all 0.2s ease-in-out',
                         outline: 'none',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px',
                         textAlign: 'left',
                         cursor: 'pointer',
                         // Estilos exactos del input-default
                         background: colors.background,
                         border: `0.5px solid ${colors.border}`,
                         boxShadow: '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09)',
                         color: colors.text
                       }}
                       onMouseEnter={(e) => {
                         const target = e.target as HTMLButtonElement;
                         target.style.borderColor = colors.primary;
                         target.style.boxShadow = '1px 1px 4px 1px rgba(196, 186, 186, 0.15)';
                       }}
                       onMouseLeave={(e) => {
                         const target = e.target as HTMLButtonElement;
                         target.style.borderColor = colors.border;
                         target.style.boxShadow = '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09)';
                       }}
                       onFocus={(e) => {
                         const target = e.target as HTMLButtonElement;
                         target.style.borderColor = colors.primary;
                         target.style.boxShadow = '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09), 0 0 0 2px rgba(22, 24, 39, 0.1)';
                       }}
                       onBlur={(e) => {
                         const target = e.target as HTMLButtonElement;
                         target.style.borderColor = colors.border;
                         target.style.boxShadow = '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09)';
                       }}
                     >
                       <MapPin size={16} style={{ color: colors.textSecondary }} />
                                               <span style={{ flex: 1 }}>
                          {formData.personaData.ubigeo || 'Seleccione ubicación geográfica'}
                        </span>
                       <Globe size={16} style={{ color: colors.primary }} />
                     </button>
                   </div>
                 </div>
              </div>

              {/* FILA 6: Foto del empleado */}
              <div className={styles.formGroup} style={{ gridColumn: '2 / 3' }}>
                <ImageUpload
                  label="Foto del Empleado"
                  value={formData.personaData.fotoUrl}
                  onChange={(file, dataUrl) => {
                    setFotoFile(file);
                    setFormData({
                      ...formData,
                      personaData: { ...formData.personaData, fotoUrl: dataUrl }
                    });
                  }}
                  placeholder="Cargar foto del empleado"
                  maxSize={5}
                  disabled={stepper.mode === 'view'}
                />
              </div>

            </div>
          </div>
        );

      case 1: // Datos Usuario
        return (
          <div className={styles.stepForm}>
            {/* 🔧 NUEVO: Checkbox para indicar si es usuario */}
            <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: colors.text,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  checked={esUsuario}
                  onChange={(e) => {
                    setEsUsuario(e.target.checked);
                    // 🔧 NUEVO: Si se desmarca, limpiar el formulario de usuario
                    if (!e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        usuarioData: {
                          ...prev.usuarioData,
                          nombreUsuario: '',
                          hashPassword: '',
                          perfilId: 0,
                          estado: 1,
                          fechaExpiracion: null
                        }
                      }));
                    }
                  }}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: colors.primary
                  }}
                />
                <span>Es usuario</span>
              </label>
              <p style={{
                fontSize: '12px',
                color: colors.textSecondary,
                margin: '4px 0 0 0',
                fontStyle: 'italic'
              }}>
                Marque esta opción si la persona necesita acceso al sistema
              </p>
            </div>

            {/* 🔧 NUEVO: Mostrar formulario de usuario solo si está marcado */}
            {esUsuario && (
              <div className={styles.formGrid}>
                {/* FILA 1: Usuario, Contraseña y Perfil */}
              <div className={styles.formGroup}>
                <InputWrapper
                  label="Nombre Usuario"
                  required={true}
                  icon="AtSign"
                  value={formData.usuarioData.nombreUsuario}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    usuarioData: { ...formData.usuarioData, nombreUsuario: value }
                  })}
                  placeholder="Nombre de usuario único"
                  maxLength={50}
                />
              </div>

              <div className={styles.formGroup}>
                <InputWrapper
                  label="Contraseña"
                  required={(() => {
                    // 🔧 NUEVO: Lógica condicional para required de contraseña
                    if (stepper.mode === 'create') {
                      return true; // Modo creación: siempre obligatoria
                    } else if (stepper.mode === 'edit') {
                      // Modo edición: depende si es usuario existente o nuevo
                      return usuarioActual === null; // Solo obligatoria si no hay usuario existente
                    }
                    return false;
                  })()}
                  icon="Lock"
                  type="password"
                  value={formData.usuarioData.hashPassword}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    usuarioData: { ...formData.usuarioData, hashPassword: value }
                  })}
                  placeholder={(() => {
                    if (stepper.mode === 'create') {
                      return "••••••••";
                    } else if (stepper.mode === 'edit') {
                      return usuarioActual === null 
                        ? "Contraseña para nuevo usuario" 
                        : "Escribir solo si desea modificar la contraseña";
                    }
                    return "••••••••";
                  })()}
                />
              </div>

              <div className={styles.formGroup}>
                <SelectWrapper
                  label="Perfil"
                  required={true}
                  icon="Shield"
                  value={formData.usuarioData.perfilId.toString()}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    usuarioData: { ...formData.usuarioData, perfilId: Number(value) }
                  })}
                  placeholder="Seleccione perfil"
                >
                  <SelectContent style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}>
                    {perfiles.map(perfil => (
                      <SelectItem 
                        key={perfil.perfilId} 
                        value={perfil.perfilId.toString()}
                        style={{ color: colors.text }}
                      >
                        {perfil.nombrePerfil}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWrapper>
              </div>

              {/* FILA 2: Estado y Fecha Expiración */}
              <div className={styles.formGroup}>
                <SelectWrapper
                  label="Estado"
                  icon="Activity"
                  value={formData.usuarioData.estado.toString()}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    usuarioData: { ...formData.usuarioData, estado: parseInt(value) }
                  })}
                  placeholder="Estado del usuario"
                >
                  <SelectContent style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}>
                    {ESTADOS_USUARIO.map(estado => (
                      <SelectItem 
                        key={estado.value} 
                        value={estado.value.toString()}
                        style={{ color: colors.text }}
                      >
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWrapper>
              </div>

              <div className={styles.formGroup}>
                <InputWrapper
                  label="Fecha Expiración"
                  icon="Clock"
                  type="date"
                  value={formData.usuarioData.fechaExpiracion || ''}
                  onValueChange={(value) => {
                    // 🔧 Validar fecha de expiración
                    const error = validateFechaExpiracion(value);
                    setFechaExpiracionError(error);
                    
                    setFormData({
                      ...formData,
                      usuarioData: { ...formData.usuarioData, fechaExpiracion: value || null }
                    });
                  }}
                  error={fechaExpiracionError}
                  helperText={fechaExpiracionError || "La fecha de expiración debe ser del día siguiente en adelante"}
                />
              </div>

              {/* ORGANIZACION REMOVIDA: Ahora se maneja internamente según el perfil del usuario logueado */}

            </div>
            )}
          </div>
        );

      case 2: // Resumen
        return (
          <div className={styles.stepForm}>
            {/* Header del resumen con foto y nombre */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              backgroundColor: colors.surface,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              marginBottom: '24px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: colors.background,
                border: `3px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {formData.personaData.fotoUrl ? (
                  <img
                    src={formData.personaData.fotoUrl}
                    alt="Foto del empleado"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Users size={32} style={{ color: colors.textSecondary }} />
                )}
              </div>
              <div>
                <h3 style={{ 
                  color: colors.text, 
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: '600'
                }}>
                  {formData.personaData.nombres} {formData.personaData.apellidoPaterno} {formData.personaData.apellidoMaterno}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: colors.textSecondary
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={16} />
                    {formData.personaData.codEmpleado}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={16} />
                    {formData.personaData.emailPersonal}
                  </span>
              </div>
              </div>
              </div>

            {/* Contenido en dos columnas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px'
            }}>
              {/* Columna Izquierda - Datos Personales */}
              <div style={{
                backgroundColor: colors.surface,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                padding: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.border}`
                }}>
                  <Users size={20} style={{ color: colors.primary }} />
                  <h4 style={{ 
                    color: colors.text, 
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    Datos Personales
                  </h4>
              </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Settings size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Documento
              </div>
                      <div style={{ color: colors.text, fontWeight: '500' }}>
                        {formData.personaData.tipoDoc}: {formData.personaData.nroDoc}
              </div>
              </div>
              </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Calendar size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Fecha de Nacimiento
              </div>
                      <div style={{ color: colors.text, fontWeight: '500' }}>
                        {formatDateForUI(formData.personaData.fechaNacimiento)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                        border: `1px solid ${colors.border}`
                  }}>
                    <Calendar size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Fecha de Ingreso
                      </div>
                      <div style={{ color: colors.text, fontWeight: '500' }}>
                        {formatDateForUI(formData.personaData.fechaIngreso)}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Settings size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Estado Laboral
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {getEstadoLaboralBadge(ESTADOS_LABORALES.find(e => e.value === formData.personaData.estadoLaboral)?.label || 'ACTIVO')}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Settings size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Contacto
                      </div>
                      <div style={{ color: colors.text, fontWeight: '500', fontSize: '14px' }}>
                        📱 {formData.personaData.celular || 'No especificado'}
                      </div>
                      <div style={{ color: colors.text, fontWeight: '500', fontSize: '14px', marginTop: '4px' }}>
                        🏠 {formData.personaData.direccion || 'No especificada'}
                      </div>
                      <div style={{ color: colors.textSecondary, fontSize: '12px', marginTop: '4px' }}>
                        📍 Ubigeo: {formData.personaData.ubigeo || 'No especificado'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha - Datos de Usuario */}
              {esUsuario ? (
                <div style={{
                  backgroundColor: colors.surface,
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  padding: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    paddingBottom: '12px',
                    borderBottom: `2px solid ${colors.border}`
                  }}>
                    <Shield size={20} style={{ color: colors.primary }} />
                    <h4 style={{ 
                      color: colors.text, 
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      Datos de Usuario
                    </h4>
                  </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Settings size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Nombre de Usuario
                      </div>
                      <div style={{ 
                        color: colors.text, 
                        fontWeight: '600',
                        fontSize: '16px',
                        fontFamily: 'monospace',
                        backgroundColor: colors.surface,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginTop: '4px'
                      }}>
                        @{formData.usuarioData.nombreUsuario}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Shield size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Perfil de Usuario
                      </div>
                      <div style={{ 
                        color: colors.text, 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px'
                      }}>
                        <span style={{
                          backgroundColor: theme === 'dark' ? '#3b82f6' : colors.primary,
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {formData.usuarioData.nombrePerfil || 
                            (() => {
                              const perfil = perfiles.find(p => p.perfilId === formData.usuarioData.perfilId);
                              return perfil?.nombrePerfil || 'No especificado';
                            })()
                          }
                </span>
                      </div>
              </div>
            </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Settings size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Estado del Usuario
              </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: formData.usuarioData.estado === 1 ? '#dcfce7' : '#fee2e2',
                          color: formData.usuarioData.estado === 1 ? '#166534' : '#991b1b',
                          border: `1px solid ${formData.usuarioData.estado === 1 ? '#bbf7d0' : '#fecaca'}`
                        }}>
                          {formData.usuarioData.estado === 1 ? 
                            <CheckCircle size={14} /> : 
                            <XCircle size={14} />
                          }
                          {formData.usuarioData.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                        </span>
              </div>
              </div>
              </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Clock size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Fecha de Expiración
                      </div>
                      <div style={{ color: colors.text, fontWeight: '500' }}>
                        {formData.usuarioData.fechaExpiracion ? 
                          new Date(formData.usuarioData.fechaExpiracion).toLocaleDateString('es-PE') : 
                          '∞ Sin expiración'
                        }
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <Building2 size={16} style={{ color: colors.textSecondary }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Organización
                      </div>
                      <div style={{ color: colors.text, fontWeight: '500' }}>
                        {formData.personaData.organizacionId ? 
                          organizaciones.find(org => org.organizacionId === formData.personaData.organizacionId)?.razonSocial || 
                          `Organización ${formData.personaData.organizacionId}` : 
                          'Sin organización asignada'
                        }
                      </div>
                      {/* Indicador de asignación automática */}
                      {formData.usuarioData.perfilId !== 1 && formData.personaData.organizacionId && (
                        <div style={{
                          marginTop: '4px',
                          fontSize: '11px',
                          color: colors.primary,
                          fontStyle: 'italic'
                        }}>
                          ✓ Asignada automáticamente
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: `${colors.primary}15`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.primary}30`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <AlertCircle size={16} style={{ color: colors.primary }} />
                      <span style={{ 
                        color: colors.primary, 
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        Información Importante
                      </span>
                    </div>
                    <p style={{
                      color: colors.text,
                      fontSize: '13px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {stepper.mode === 'create' ? 
                        'Se creará un nuevo usuario con acceso al sistema. Asegúrate de que toda la información sea correcta antes de finalizar.' :
                        'Se actualizarán los datos del usuario existente. Los cambios se aplicarán inmediatamente.'
                      }
                    </p>
                    
                    {/* Información adicional sobre la lógica de organización */}
                    {formData.usuarioData.perfilId !== 1 && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: `${colors.textSecondary}10`,
                        borderRadius: '6px',
                        border: `1px solid ${colors.textSecondary}30`
                      }}>
                        <p style={{
                          color: colors.textSecondary,
                          fontSize: '12px',
                          margin: 0,
                          lineHeight: '1.3'
                        }}>
                          <strong>Nota sobre Organización:</strong> Como el perfil seleccionado no es "Super Admin", 
                          la organización se asigna automáticamente según la organización actual del sistema. 
                          Solo usuarios con perfil "Super Admin" pueden seleccionar manualmente una organización diferente.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ) : (
                <div style={{
                  backgroundColor: colors.surface,
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    paddingBottom: '12px',
                    borderBottom: `2px solid ${colors.border}`
                  }}>
                    <XCircle size={20} style={{ color: colors.textSecondary }} />
                    <h4 style={{ 
                      color: colors.textSecondary, 
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      Sin Usuario
                    </h4>
                  </div>
                  <div style={{
                    color: colors.textSecondary,
                    fontStyle: 'italic',
                    fontSize: '14px'
                  }}>
                    Esta persona no tendrá acceso al sistema
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.usuariosContainer} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className={styles.header} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 style={{ color: colors.text }}>Gestión de Usuarios</h1>
            <p style={{ color: colors.textSecondary }}>
              Administra la información personal y laboral de los empleados
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 8px',
                backgroundColor: organizationInfo.hasOrganization ? `${colors.primary}20` : `${colors.textSecondary}20`,
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                color: organizationInfo.hasOrganization ? colors.primary : colors.textSecondary
              }}>
                {organizationInfo.displayName}
              </span>
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="default"
              size="m"
              iconName="Plus"
              onClick={() => openStepper('create')}
            >
              Nueva Persona
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className={styles.searchAndFilters}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Buscar personas por nombre, email, código o documento..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </div>
          <Button
            variant="default"
            size="m"
            iconName="Filter"
            onClick={openFilterModal}
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={styles.content}>

        
        <Grid
          columns={gridColumns}
          data={filteredPersonas}
          showPagination={true}
          serverSide={true} // 🔧 Habilitar paginación del servidor
          totalItems={totalCount} // 🔧 Total de elementos desde el backend
          totalPages={totalPages} // 🔧 Total de páginas desde el backend
          currentPage={currentPage} // 🔧 Página actual
          pageSize={pageSize} // 🔧 Tamaño de página
          onPageChange={(page) => setCurrentPage(page)} // 🔧 Manejar cambio de página
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurrentPage(1); // Reset a primera página
          }}
          loading={isLoading} // 🔧 Estado de carga
          emptyMessage={searchTerm 
            ? 'No hay personas que coincidan con tu búsqueda.'
            : 'Aún no hay personas registradas en el sistema.'}
          onRowClick={(persona) => handleView(persona)}
        />
      </div>

      {/* Stepper */}
      <Stepper
        isOpen={stepper.isOpen}
        onClose={closeStepper}
        title={
          stepper.mode === 'view' ? 'Detalles de la Persona' :
          stepper.mode === 'create' ? 'Registro de Personal' : 'Editar Persona'
        }
        subtitle={
          stepper.mode === 'view' ? 'Información completa del empleado' :
          stepper.mode === 'create' ? 'Complete todos los pasos para registrar una nueva persona y su usuario' :
          'Actualice la información según sea necesario'
        }
        steps={stepperSteps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onNext={handleStepperNext}
        onPrevious={handleStepperPrevious}
        onFinish={handleStepperFinish}
        canGoNext={canAdvanceToNextStep()}
        canGoPrevious={currentStep > 0}
        allowStepClick={false}
        showStepNumbers={false}
        forcedClose={true}
      >
        {renderStepperContent()}
      </Stepper>

      {/* Modal de Detalles */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={closeDetailModal}
        title="Detalles del Empleado"
        size="xl"
        hideFooter={true}
      >
        {renderDetailModalContent()}
      </Modal>

      {/* Modal de Ubigeo */}
      <Ubigeo
        isOpen={ubigeoModal.isOpen}
        onClose={closeUbigeoModal}
        onSelect={handleUbigeoSelect}
        title="Seleccionar Ubicación Geográfica"
        preloadData={getUbigeoPreloadData()}
      />

      {/* Modal de Filtros */}
      <FilterModal
        isOpen={filterModal.isOpen}
        onClose={closeFilterModal}
        filterControls={filterControls}
        onFilter={handleApplyFilters}
        onExport={handleExportData}
        exportFileName="usuarios"
      />

    </div>
  );
};