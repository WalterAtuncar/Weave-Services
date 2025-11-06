import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Modal } from '../modal';
import { Input } from '../input';
import { Textarea } from '../textarea';
import { SelectWrapper, SelectContent, SelectItem } from '../select';
import { SearchableSelect, SearchableSelectOption } from '../searchable-select/SearchableSelect';
import { Button } from '../button';
import { DatePickerComponent } from '../calendar';
import { Badge } from '../badge';
import { AlertService } from '../alerts';
import { useAuth } from '../../../hooks/useAuth';
import { 
  tipoGobiernoService,
  tipoEntidadService,
  sistemasService,
  usuariosService,
  rolGobernanzaService,
  gobernanzaRolService,
  gobernanzaService
} from '../../../services';
import {
  GobernanzaFormProps,
  GobernanzaFormState,
  GobernanzaFormData,
  GobernanzaRolFormItem,
  FormErrors,
  EntityOption,
  UserOption,
  FORM_CONFIG,
  EMPTY_FORM_DATA,
  EMPTY_ROLE_ITEM
} from './GobernanzaForm.types';
import {
  CreateGobernanzaCommand,
  UpdateGobernanzaCommand
} from '../../../services/types/gobernanza.types';
import { 
  Calendar,
  Users,
  Building,
  Crown,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Settings,
  Target,
  Shield,
  Edit,
  ChevronDown
} from 'lucide-react';
import styles from './GobernanzaForm.module.css';

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const GobernanzaForm: React.FC<GobernanzaFormProps> = ({
  isOpen,
  mode,
  initialData,
  existingEntidadIds = [],
  source = 'gobernanza',
  onClose,
  onSubmit,
  onCancel,
  onGobernanzaChange
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();

  // 🔧 DEBUG: Log source information to identify calling page
  // 🔧 DEBUG: Log organization info to understand the issue


  // 🔧 FIX: Get organization ID with fallback to localStorage
  const getOrganizationId = (): number => {
    // Try organizationInfo first
    if (organizationInfo?.id && organizationInfo.id > 0) {
  
      return organizationInfo.id;
    }
    
    // Fallback to localStorage
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
      console.error('❌ [GOBERNANZA FORM] Error reading from localStorage:', error);
    }
    
    console.warn('⚠️ [GOBERNANZA FORM] No valid organization ID found, using 0');
    return 0;
  };

  const organizationId = getOrganizationId();
  // =============================================
  // ESTADO DEL COMPONENTE
  // =============================================

  const [state, setState] = useState<GobernanzaFormState>({
    formData: EMPTY_FORM_DATA,
    tiposGobierno: [],
    tiposEntidad: [],
    entidades: [],
    rolesGobernanza: [],
    usuarios: [],
    isLoading: true,
    isLoadingEntities: false,
    isSubmitting: false,
    initialDataLoaded: false,
    errors: {},
    generalError: null,
    activeTab: (source === 'sistemas' || source === 'Data') ? 'roles' : 'cabecera',
    expandedRoles: new Set()
  });

  // Estado adicional para el dropdown de gobiernos existentes
  const [gobiernosExistentes, setGobiernosExistentes] = useState<any[]>([]);
  const [gobiernoSeleccionado, setGobiernoSeleccionado] = useState<number | undefined>(undefined);
  const [isLoadingGobiernos, setIsLoadingGobiernos] = useState(false);

  // Estados para la funcionalidad de búsqueda con autocomplete
  const [searchOptions, setSearchOptions] = useState<SearchableSelectOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGobernanza, setSelectedGobernanza] = useState<any>(null);
  const [tipoBusqueda, setTipoBusqueda] = useState<string>('NOMBRE_GOBIERNO'); // "NOMBRE_GOBIERNO" o "OWNER_SPONSOR"

  // Debug: Monitorear cambios en tipoBusqueda
  useEffect(() => {
  }, [tipoBusqueda]);



  // Log del estado inicial cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
    } else {
      // Limpiar selectedGobernanza cuando se cierre el modal
      setSelectedGobernanza(null);
      setSearchTerm('');
      setSearchOptions([]);
    }
  }, [isOpen, state.errors, state.formData]);
  
  // Limpiar selectedGobernanza cuando cambie el source
  useEffect(() => {
    setSelectedGobernanza(null);
    setSearchTerm('');
    setSearchOptions([]);
  }, [source]);

  // Permitir edición en 'view' si source es 'sistemas' o 'Data'
  const canEditInView = mode === 'view' && (source === 'sistemas' || source === 'Data');
  // Variable para determinar si los controles deben estar deshabilitados
  const isDisabled = (mode === 'view' && !canEditInView) || state.isLoading || state.isSubmitting;
  // Nota: Los controles están habilitados para source 'sistemas' y 'Data' según requerimiento del usuario

  // Función para alternar el estado de colapso de un rol
  const toggleRoleCollapse = (roleId: string) => {
    setState(prev => {
      const newExpandedRoles = new Set(prev.expandedRoles);
      if (newExpandedRoles.has(roleId)) {
        newExpandedRoles.delete(roleId);
      } else {
        newExpandedRoles.add(roleId);
      }
      return {
        ...prev,
        expandedRoles: newExpandedRoles
      };
    });
  };

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  // Función para convertir fechas al formato YYYY-MM-DD requerido por inputs de tipo date
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    try {
      // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Convertir fecha ISO o cualquier otro formato válido a YYYY-MM-DD
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida:', dateString);
        return '';
      }
      
      // Formatear a YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error al formatear fecha:', dateString, error);
      return '';
    }
  };

  // =============================================
  // EFECTOS
  // =============================================

  // SOLUCIÓN DEFINITIVA: Un solo useEffect que maneja toda la lógica de carga de entidades
  useEffect(() => {
    // Función para cargar entidades directamente aquí
    const loadEntitiesDirectly = async () => {
      const tipoEntidadId = Number(state.formData.tipoEntidadId);
      if (!tipoEntidadId || state.isLoading || state.isLoadingEntities) return;


      
      setState(prev => ({ ...prev, isLoadingEntities: true }));

      try {
        // Encontrar el tipo de entidad seleccionado
        const tipoEntidad = state.tiposEntidad.find(t => t.tipoEntidadId === tipoEntidadId);
        
        if (!tipoEntidad) {
          setState(prev => ({ ...prev, entidades: [], isLoadingEntities: false }));
          return;
        }

        let entidades: any[] = [];
        
        // Si es tipo "sistema", cargar sistemas
        const codigoTipo = tipoEntidad.tipoEntidadCodigo?.toLowerCase();
        const nombreTipo = tipoEntidad.tipoEntidadNombre?.toLowerCase();
        const esSistema = codigoTipo === 'sistema' || codigoTipo === 'sistemas' || 
                         nombreTipo?.includes('sistema') || nombreTipo?.includes('sistemas');
        
        if (esSistema) {
          const sistemasResponse = await sistemasService.getAllSistemas({
            organizacionId: organizationId || undefined,
            includeDeleted: false,
            soloConGobernanzaPropia: true
          });
          
          if (sistemasResponse.success && sistemasResponse.data) {
            const sistemasArray = Array.isArray(sistemasResponse.data) ? sistemasResponse.data : [];
            

            
            entidades = sistemasArray.map((sistema: any) => ({
              id: sistema.sistemaId || 0,
              codigo: sistema.codigoSistema || sistema.codigoCompleto || 'Sin código',
              nombre: sistema.nombreSistema || 'Sin nombre', 
              descripcion: sistema.funcionPrincipal || '',
              tipo: 'sistema' as const,
              activo: sistema.estado === 1 && !sistema.registroEliminado
            }));

            // Agregar "Todos" al inicio
            if (entidades.length > 0) {
              entidades.unshift({
                id: -1,
                codigo: 'TODOS',
                nombre: 'Todos',
                descripcion: 'Aplica a todas las entidades de este tipo',
                tipo: 'sistema' as const,
                activo: true
              });
            }
            

          } else {
            // Error al obtener sistemas
          }
        }

        setState(prev => ({
          ...prev,
          entidades,
          isLoadingEntities: false
        }));



      } catch (error: any) {
        console.error('❌ Error al cargar entidades:', error);
        setState(prev => ({
          ...prev,
          entidades: [],
          isLoadingEntities: false
        }));
      }
    };

    // Ejecutar solo si hay tipoEntidadId y los tipos están cargados
    if (state.formData.tipoEntidadId && state.tiposEntidad.length > 0) {
      loadEntitiesDirectly();
    }
  }, [state.formData.tipoEntidadId, state.tiposEntidad.length, organizationId]);

  // =============================================
  // FUNCIONES DE CARGA DE DATOS
  // =============================================

  const loadInitialData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, generalError: null }));

    try {
      // Debug: Verificar parámetros antes de cargar usuarios
      // Cargar todas las listas en paralelo
      const [
        tiposGobiernoResponse,
        tiposEntidadResponse,
        rolesResponse,
        usuariosResponse
      ] = await Promise.all([
        tipoGobiernoService.getAllTiposGobierno({ includeDeleted: false }),
        tipoEntidadService.getAllTiposEntidad({ includeDeleted: false }),
        rolGobernanzaService.getAllRolesGobernanza({ includeDeleted: false }),
        usuariosService.getUsuariosConPersonaPosicion(organizationId || 0, { includeDeleted: false })
      ]);
       
       // Debug: Verificar respuesta del servicio de usuarios
      // Procesar respuestas
      const tiposGobierno = tiposGobiernoResponse.success ? tiposGobiernoResponse.data || [] : [];
      const tiposEntidad = tiposEntidadResponse.success ? tiposEntidadResponse.data || [] : [];
      const rolesGobernanza = rolesResponse.success ? rolesResponse.data || [] : [];
      
      // Usuarios con información de persona y posición
      let usuariosData: any[] = [];
      if (usuariosResponse.success && usuariosResponse.data) {
        usuariosData = Array.isArray(usuariosResponse.data) 
          ? usuariosResponse.data 
          : (usuariosResponse.data as any)?.usuarios || [];
      }
      
      // Transformar usuarios a formato del formulario
      
      // Asegurar que usuariosData sea un array antes del map
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
      const usuarios: UserOption[] = usuariosArray.map(user => {
        // Usar el nombre completo con posición si está disponible, sino el nombre completo, sino el nombre de usuario
        const nombreCompleto = user.nombreCompletoConPosicion || 
                              user.nombreCompleto || 
                              user.nombreUsuario || 
                              'Usuario sin nombre';
        
        return {
          usuarioId: user.usuarioId,
          nombreCompleto,
          email: user.email || user.emailPersonal || '',
          cargo: user.nombrePosicion || '',
          activo: user.esActivo || user.estado === 1,
          organizacionId: user.organizacionId || 0
        };
      });
      // Inicializar datos del formulario
      let formData = { ...EMPTY_FORM_DATA };
      if (initialData) {
        // Aplicar conversión de fechas para inputs de tipo date
        formData = {
          ...initialData,
          fechaAsignacion: formatDateForInput(initialData.fechaAsignacion),
          fechaVencimiento: formatDateForInput(initialData.fechaVencimiento),
          gobernanzaRoles: initialData.gobernanzaRoles?.map(role => ({
            ...role,
            fechaAsignacion: formatDateForInput(role.fechaAsignacion)
          })) || []
        };
      }

      setState(prev => ({
        ...prev,
        tiposGobierno,
        tiposEntidad,
        rolesGobernanza,
        usuarios,
        formData,
        isLoading: false,
        // Flag para indicar que los datos iniciales están listos
        initialDataLoaded: true
      }));

    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      
      let errorMessage = 'Error al cargar los datos del formulario';
      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setState(prev => ({
        ...prev,
        generalError: errorMessage,
        isLoading: false
      }));
      AlertService.error(errorMessage);
    }
  }, [initialData, organizationId]);

  // Cargar datos iniciales al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      // Cargar gobiernos existentes si el source es 'sistemas' o 'Data'
      if (source === 'sistemas' || source === 'Data') {
        loadGobiernosExistentes();
        // Preseleccionar gobierno si viene del paso anterior o en modo edición
        if (initialData?.gobernanzaId) {
          setGobiernoSeleccionado(Number(initialData.gobernanzaId));
          // Auto-cargar detalles y roles del gobierno seleccionado para poblar el formulario
          try {
            void handleGobiernoSeleccionado(String(initialData.gobernanzaId));
          } catch (e) {
            console.warn('No se pudo cargar automáticamente la gobernanza seleccionada:', e);
          }
        }
      }
    }
  }, [isOpen, loadInitialData, source, initialData?.gobernanzaId]);

  // =============================================
  // FUNCIONES PARA GOBIERNOS EXISTENTES
  // =============================================

  const loadGobiernosExistentes = useCallback(async () => {
    if (source !== 'sistemas' && source !== 'Data') return;
    
    setIsLoadingGobiernos(true);
    try {
      // Asegurar tener los tipos de entidad disponibles
      let tipos = state.tiposEntidad;
      if (!tipos || tipos.length === 0) {
        try {
          const respTipos = await tipoEntidadService.getAllTiposEntidad({ includeDeleted: false });
          if (respTipos.success && Array.isArray(respTipos.data)) {
            tipos = respTipos.data as any[];
          } else {
            tipos = [];
          }
        } catch (e) {
          tipos = [];
        }
      }

      // Determinar tipoEntidadId objetivo según el source
      let targetTipoEntidadId: number | undefined = undefined;
      if (Array.isArray(tipos) && tipos.length > 0) {
        if (source === 'sistemas') {
          const tipoSistema = tipos.find((t: any) => {
            const codigo = t?.tipoEntidadCodigo?.toLowerCase?.();
            const nombre = t?.tipoEntidadNombre?.toLowerCase?.();
            return codigo === 'sistema' || codigo === 'sistemas' || nombre?.includes('sistema');
          });
          targetTipoEntidadId = tipoSistema?.tipoEntidadId;
        } else if (source === 'Data') {
          const tipoData = tipos.find((t: any) => {
            const codigo = t?.tipoEntidadCodigo?.toLowerCase?.();
            const nombre = t?.tipoEntidadNombre?.toLowerCase?.();
            return codigo === 'data' || nombre?.includes('data');
          });
          targetTipoEntidadId = tipoData?.tipoEntidadId;
        }
      }

      // Construir filtros para la API (preferimos filtrar en backend)
      const filtros: any = { includeDeleted: false };
      if (organizationId && organizationId > 0) filtros.organizacionId = organizationId;
      if (targetTipoEntidadId) filtros.tipoEntidadId = targetTipoEntidadId;

      const response = await gobernanzaService.getAllGobernanzas(filtros);
      if (response.success && response.data) {
        let data = response.data as any[];
        // Si no logramos obtener el tipoEntidadId, como fallback filtramos en frontend por nombre/código
        if (!targetTipoEntidadId && Array.isArray(data) && tipos && tipos.length > 0) {
          const idsTarget = tipos
            .filter((t: any) => {
              const codigo = t?.tipoEntidadCodigo?.toLowerCase?.();
              const nombre = t?.tipoEntidadNombre?.toLowerCase?.();
              return source === 'sistemas'
                ? (codigo === 'sistema' || codigo === 'sistemas' || nombre?.includes('sistema'))
                : (codigo === 'data' || nombre?.includes('data'));
            })
            .map((t: any) => t.tipoEntidadId);
          if (idsTarget.length > 0) {
            data = data.filter((g: any) => idsTarget.includes(g?.tipoEntidadId));
          }
        }
        setGobiernosExistentes(Array.isArray(data) ? data : []);
      } else {
        console.error('Error al cargar gobiernos existentes:', response.message);
        setGobiernosExistentes([]);
      }
    } catch (error) {
      console.error('Error al cargar gobiernos existentes:', error);
      setGobiernosExistentes([]);
    } finally {
      setIsLoadingGobiernos(false);
    }
  }, [source, state.tiposEntidad, organizationId, tipoBusqueda]);

  const handleGobiernoSeleccionado = useCallback(async (value: string) => {
    const gobernanzaId = Number(value);
    if (!gobernanzaId) {
      setGobiernoSeleccionado(undefined);
      setState(prev => ({
        ...prev,
        formData: { ...prev.formData, gobernanzaRoles: [] }
      }));
      return;
    }

    setGobiernoSeleccionado(gobernanzaId);

    try {
      // Cargar roles asignados desde el servicio especializado por gobernanza
      const [govResp, rolesResp] = await Promise.all([
        gobernanzaService.getGobernanzaById(gobernanzaId),
        gobernanzaRolService.getGobernanzaRolesByGobernanzaId(gobernanzaId, false, true)
      ]);

      let rolesFromGobierno: GobernanzaRolFormItem[] = [];

      if (rolesResp.success && Array.isArray(rolesResp.data)) {
        rolesFromGobierno = rolesResp.data.map(role => ({
          id: `role_${Date.now()}_${Math.random()}`,
          rolGobernanzaId: role.rolGobernanzaId,
          usuarioId: role.usuarioId,
          fechaAsignacion: formatDateForInput(role.fechaAsignacion),
          ordenEjecucion: role.ordenEjecucion ?? 0,
          observaciones: (role as any).observaciones ?? ''
        }));
      } else if (govResp.success && govResp.data && Array.isArray((govResp.data as any).gobernanzaRoles)) {
        // Fallback por si el DTO incluye gobernanzaRoles
        rolesFromGobierno = (govResp.data as any).gobernanzaRoles.map((role: any) => ({
          id: `role_${Date.now()}_${Math.random()}`,
          rolGobernanzaId: role.rolGobernanzaId,
          usuarioId: role.usuarioId,
          fechaAsignacion: formatDateForInput(role.fechaAsignacion),
          ordenEjecucion: role.ordenEjecucion ?? 0,
          observaciones: role.observaciones ?? ''
        }));
      }

      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          gobernanzaId,
          nombre: (govResp.data as any)?.nombre ?? prev.formData.nombre,
          tipoGobiernoId: (govResp.data as any)?.tipoGobiernoId ?? prev.formData.tipoGobiernoId,
          tipoEntidadId: (govResp.data as any)?.tipoEntidadId ?? prev.formData.tipoEntidadId,
          tipoFlujo: (govResp.data as any)?.tipoFlujo ?? prev.formData.tipoFlujo,
          observaciones: (govResp.data as any)?.observaciones ?? prev.formData.observaciones ?? '',
          fechaAsignacion: formatDateForInput((govResp.data as any)?.fechaAsignacion) || prev.formData.fechaAsignacion,
          fechaVencimiento: formatDateForInput((govResp.data as any)?.fechaVencimiento) || prev.formData.fechaVencimiento,
          gobernanzaRoles: rolesFromGobierno
        }
      }));

      // 🔧 NUEVO: Notificar cambio de gobernanza al componente padre
      if (onGobernanzaChange) {
        onGobernanzaChange(gobernanzaId);
      }
    } catch (error) {
      console.error('Error al cargar roles del gobierno seleccionado:', error);
      AlertService.error('Error al cargar los roles del gobierno seleccionado');
    }
  }, []);

  // =============================================
  // FUNCIONES PARA BÚSQUEDA CON AUTOCOMPLETE
  // =============================================

  const searchGobernanzas = useCallback(async (textSearch: string) => {
    if (!textSearch || textSearch.length < 2) {
      setSearchOptions([]);
      return;
    }
    setIsSearching(true);
    try {
      // Obtener tipoEntidadId según el source
      let tipoEntidadId: number | undefined = undefined;
      if (state.tiposEntidad && state.tiposEntidad.length > 0) {
        if (source === 'sistemas') {
          const tipoSistema = state.tiposEntidad.find((t: any) => {
            const codigo = t?.tipoEntidadCodigo?.toLowerCase?.();
            const nombre = t?.tipoEntidadNombre?.toLowerCase?.();
            return codigo === 'sistema' || codigo === 'sistemas' || nombre?.includes('sistema');
          });
          tipoEntidadId = tipoSistema?.tipoEntidadId;
        } else if (source === 'Data') {
          const tipoData = state.tiposEntidad.find((t: any) => {
            const codigo = t?.tipoEntidadCodigo?.toLowerCase?.();
            const nombre = t?.tipoEntidadNombre?.toLowerCase?.();
            return codigo === 'data' || nombre?.includes('data');
          });
          tipoEntidadId = tipoData?.tipoEntidadId;
        }
      }

      const searchRequest = {
        textSearch,
        organizacionId: organizationId,
        tipoEntidadId,
        soloActivos: true,
        tipoBusqueda: tipoBusqueda
      };

      const response = await gobernanzaService.buscarGobernanzasConRoles(searchRequest);
      
      if (response.success && Array.isArray(response.data)) {
        const normalizeStr = (s: any) =>
          (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const searchNorm = normalizeStr(textSearch);

        const options: SearchableSelectOption[] = response.data.map((gov: any) => {
          const id = gov.gobernanzaId || gov.GobernanzaId || gov.id || gov.Id;
          const govName = gov.nombre || gov.Nombre || `Gobierno ${id}`;

          let label = govName;

          if (tipoBusqueda === 'OWNER_SPONSOR') {
            const roles = gov.rolesAsignados || gov.RolesAsignados || [];
            const sponsorOwnerRoles = Array.isArray(roles)
              ? roles.filter((r: any) => {
                  const code = (r.rolGobernanzaCodigo || r.RolGobernanzaCodigo || '').toUpperCase();
                  return code === 'SPONSOR' || code === 'OWNER' || code === 'SP' || code === 'OW';
                })
              : [];

            const roleMatch =
              sponsorOwnerRoles.find((r: any) => {
                if (!searchNorm) return false;
                const parts = [
                  r.nombreCompleto || r.NombreCompleto || '',
                  r.nombres || r.Nombres || '',
                  r.apellidoPaterno || r.ApellidoPaterno || '',
                  r.apellidoMaterno || r.ApellidoMaterno || '',
                  r.usuarioNombre || r.UsuarioNombre || ''
                ];
                return parts.some((p: string) => normalizeStr(p).includes(searchNorm));
              }) || sponsorOwnerRoles[0];

            if (roleMatch) {
              const roleName =
                roleMatch.rolGobernanzaNombre ||
                roleMatch.RolGobernanzaNombre ||
                ((roleMatch.rolGobernanzaCodigo || roleMatch.RolGobernanzaCodigo || '').toUpperCase() === 'SPONSOR' ? 'Sponsor' : 'Owner');

              const personaNombre =
                `${roleMatch.nombres || roleMatch.Nombres || ''} ${roleMatch.apellidoPaterno || roleMatch.ApellidoPaterno || ''}`.trim() ||
                (roleMatch.nombreCompleto || roleMatch.NombreCompleto || '').trim();

              if (personaNombre && roleName) {
                label = `${personaNombre} (${roleName}) - ${govName}`;
              } else if (roleName) {
                label = `(${roleName}) - ${govName}`;
              }
            }
          }

          return {
            value: id,
            label
          } as SearchableSelectOption;
        });
        setSearchOptions(options);
      } else {
        setSearchOptions([]);
      }
    } catch (error) {
      if ((error as any)?.code === 'ERR_CANCELED' || (error as any)?.message === 'canceled' || (error as any)?.name === 'CanceledError' || (error as any)?.name === 'AbortError') {
        return; // ignorar cancelaciones
      }
      console.error('Error al buscar gobernanzas:', error);
      setSearchOptions([]);
    } finally {
      setIsSearching(false);
    }
  }, [source, state.tiposEntidad, organizationId, tipoBusqueda]);

  // Re-ejecutar búsqueda al cambiar el tipo de criterio si ya hay texto
  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      searchGobernanzas(searchTerm);
    }
  }, [tipoBusqueda, searchTerm, searchGobernanzas]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    searchGobernanzas(term);
  }, [searchGobernanzas]);

  const handleGobernanzaSelect = useCallback(async (gobernanzaId: string | number) => {
    const id = Number(gobernanzaId);
    if (!id) return;

    try {
      // Obtener la gobernanza específica por ID y sus roles
      const [govResponse, rolesResponse] = await Promise.all([
        gobernanzaService.getGobernanzaById(id),
        gobernanzaRolService.getGobernanzaRolesByGobernanzaId(id, false, true)
      ]);
      
      if (govResponse.success && govResponse.data) {
        const selectedGov = govResponse.data;
        
        // Preparar objeto para mostrar en el div con los roles cargados
        const selectedGovWithRoles = {
          ...selectedGov,
          rolesAsignados: [] // Se actualizará después de cargar los roles
        };
        setSelectedGobernanza(selectedGovWithRoles);
        
        // Preparar roles desde la respuesta específica de roles o desde la gobernanza
        let gobernanzaRoles: any[] = [];
        
        if (rolesResponse.success && Array.isArray(rolesResponse.data)) {
          gobernanzaRoles = rolesResponse.data.map((role: any) => ({
            id: `role_${Date.now()}_${Math.random()}`,
            gobernanzaRolId: role.gobernanzaRolId,
            rolGobernanzaId: role.rolGobernanzaId,
            usuarioId: role.usuarioId,
            fechaAsignacion: role.fechaAsignacion ? formatDateForInput(role.fechaAsignacion) : '',
            ordenEjecucion: role.ordenEjecucion ?? 0,
            puedeEditar: role.puedeEditar ?? false,
            estado: role.estado ?? 1,
            observaciones: role.observaciones ?? ''
          }));
        } else if (selectedGov.rolesAsignados && Array.isArray(selectedGov.rolesAsignados)) {
          // Fallback: usar roles de la gobernanza si están disponibles
          gobernanzaRoles = selectedGov.rolesAsignados.map((role: any) => ({
            id: `role_${Date.now()}_${Math.random()}`,
            gobernanzaRolId: role.gobernanzaRolId,
            rolGobernanzaId: role.rolGobernanzaId,
            usuarioId: role.usuarioId,
            fechaAsignacion: role.fechaAsignacion ? formatDateForInput(role.fechaAsignacion) : '',
            ordenEjecucion: role.ordenEjecucion ?? 0,
            puedeEditar: role.puedeEditar ?? false,
            estado: role.estado ?? 1,
            observaciones: role.observaciones ?? ''
          }));
        }
        
        // Actualizar selectedGobernanza con los roles cargados
        setSelectedGobernanza({
          ...selectedGov,
          rolesAsignados: gobernanzaRoles
        });
        
        // Cargar datos del primer tab (información básica)
        setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            nombre: selectedGov.nombre || '',
            descripcion: selectedGov.descripcion || '',
            tipoGobiernoId: selectedGov.tipoGobiernoId || undefined,
            tipoEntidadId: selectedGov.tipoEntidadId || undefined,
            entidadId: selectedGov.entidadId || undefined,
            fechaAsignacion: selectedGov.fechaAsignacion ? formatDateForInput(selectedGov.fechaAsignacion) : '',
            fechaVencimiento: selectedGov.fechaVencimiento ? formatDateForInput(selectedGov.fechaVencimiento) : '',
            observaciones: selectedGov.observaciones || '',
            // Cargar roles obtenidos
            gobernanzaRoles
          }
        }));

        // Limpiar búsqueda
        setSearchTerm('');
        setSearchOptions([]);
      }
    } catch (error) {
      console.error('Error al cargar gobernanza seleccionada:', error);
      AlertService.error('Error al cargar la gobernanza seleccionada');
    }
  }, [organizationId]);

  // =============================================
  // FUNCIONES DE VALIDACIÓN
  // =============================================

  const validateForm = useCallback((data: GobernanzaFormData): FormErrors => {
    const errors: FormErrors = {};

    // Validar campos obligatorios siempre (independientemente del source)
    if (!data.tipoGobiernoId) {
      errors.tipoGobiernoId = 'Selecciona un tipo de gobierno';
    }
    if (!data.tipoEntidadId) {
      errors.tipoEntidadId = 'Selecciona un tipo de entidad';
    }

    // Validar cabecera solo si no viene de sistemas o Data
    if (source !== 'sistemas' && source !== 'Data') {
      if (!data.nombre || data.nombre.trim() === '') {
        errors.nombre = 'El nombre es requerido';
      }
      // TEMPORALMENTE COMENTADO: Ya no se requiere entidad específica
      // if (!data.entidadId) {
      //   errors.entidadId = 'Selecciona una entidad';
      // }
      if (!data.fechaAsignacion) {
        errors.fechaAsignacion = 'La fecha de asignación es requerida';
      }
      if (data.fechaVencimiento && data.fechaAsignacion && 
          new Date(data.fechaVencimiento) <= new Date(data.fechaAsignacion)) {
        errors.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a la asignación';
      }
    }

    // Validar roles
    if (data.gobernanzaRoles.length === 0) {
      errors.general = 'Debe agregar al menos un rol y usuario';
    } else {
      // Solo validar roles si hay al menos uno
      const rolesErrors: Record<string, any> = {};
      const usedCombinations = new Set<string>();
      const rolesCounts = new Map<number, number>();

      data.gobernanzaRoles.forEach(role => {
        const roleErrors: any = {};

        if (!role.rolGobernanzaId) {
          roleErrors.rolGobernanzaId = 'Selecciona un rol';
        }
        if (!role.usuarioId) {
          roleErrors.usuarioId = 'Selecciona un usuario';
        }
        if (!role.fechaAsignacion) {
          roleErrors.fechaAsignacion = 'La fecha de asignación es requerida';
        }
        
        // Validar orden de aprobación
        if (role.ordenEjecucion === null || role.ordenEjecucion === undefined || role.ordenEjecucion < 0) {
          roleErrors.ordenEjecucion = 'El orden de aprobación debe ser mayor o igual a 0';
        } else if (role.ordenEjecucion > 999) {
          roleErrors.ordenEjecucion = 'El orden de aprobación no puede ser mayor a 999';
        }

        // Verificar duplicados
        const combination = `${role.rolGobernanzaId}-${role.usuarioId}`;
        if (usedCombinations.has(combination) && role.rolGobernanzaId && role.usuarioId) {
          roleErrors.duplicate = 'Esta combinación de rol y usuario ya existe';
        }
        usedCombinations.add(combination);

        // Contar roles por tipo (solo si el rol está seleccionado)
        if (role.rolGobernanzaId) {
          const count = rolesCounts.get(role.rolGobernanzaId) || 0;
          rolesCounts.set(role.rolGobernanzaId, count + 1);
        }

        if (Object.keys(roleErrors).length > 0) {
          rolesErrors[role.id] = roleErrors;
        }
      });

      // Validar reglas de negocio para roles (solo si hay roles válidos)
      rolesCounts.forEach((count, rolId) => {
        const rol = state.rolesGobernanza.find(r => r.rolGobernanzaId === rolId);
        if (rol && count > 1) { // Solo validar si hay más de 1 del mismo tipo
          const rolCode = rol.rolGobernanzaCodigo?.toUpperCase();
          const rolName = rol.rolGobernanzaNombre?.toLowerCase();
          
          // Regla: Solo puede haber un Owner
          if (rolCode === 'OW' || rolCode === 'OWNER' || rolName?.includes('owner')) {
            if (!errors.general) {
              errors.general = `Solo puede haber un ${rol.rolGobernanzaNombre} (máximo 1)`;
            }
          }
          
          // Regla: Solo puede haber un Sponsor
          if (rolCode === 'SP' || rolCode === 'SPONSOR' || rolName?.includes('sponsor')) {
            if (!errors.general) {
              errors.general = `Solo puede haber un ${rol.rolGobernanzaNombre} (máximo 1)`;
            }
          }
          
          // Ejecutor e Involucrado pueden ser múltiples, no se validan
          // Regla legacy: Solo puede haber un Administrador principal
          if ((rolCode === 'ADMIN' || rolCode === 'ADMINISTRADOR') && rol.nivel === 1) {
            if (!errors.general) {
              errors.general = `Solo puede haber un ${rol.rolGobernanzaNombre} principal (máximo 1)`;
            }
          }
        }
      });
      
      // Validar orden de aprobación: no debe haber duplicados entre diferentes tipos de roles
      const ordenEjecucionMap = new Map<number, { roleCode: string, roleName: string, roleId: string, rolGobernanzaId: number }>();
      
      data.gobernanzaRoles.forEach(role => {
        if (role.rolGobernanzaId && role.ordenEjecucion) {
          const roleData = state.rolesGobernanza.find(r => r.rolGobernanzaId === role.rolGobernanzaId);
          const roleCode = roleData?.rolGobernanzaCodigo?.toUpperCase();
          const roleName = roleData?.rolGobernanzaNombre || 'Rol desconocido';
          
          if (roleCode) {
            const existingRole = ordenEjecucionMap.get(role.ordenEjecucion);
            
            if (existingRole) {
              // Permitir duplicados solo entre Ejecutor (EJ) e Involucrado (IN)
              const allowedDuplicateGroups = [['EJ', 'IN']];
              let canShareOrder = false;
              
              for (const group of allowedDuplicateGroups) {
                if (group.includes(roleCode) && group.includes(existingRole.roleCode)) {
                  canShareOrder = true;
                  break;
                }
              }
              
              // No permitir duplicados entre roles de diferentes tipos (excepto EJ e IN)
              if (role.rolGobernanzaId !== existingRole.rolGobernanzaId && !canShareOrder) {
                if (!rolesErrors[role.id]) {
                  rolesErrors[role.id] = {};
                }
                rolesErrors[role.id].ordenEjecucion = `El orden de ejecución ${role.ordenEjecucion} ya está asignado al rol ${existingRole.roleName}. No se pueden asignar roles de diferentes tipos con el mismo orden de ejecución.`;
              }
            } else {
              ordenEjecucionMap.set(role.ordenEjecucion, {
                roleCode,
                roleName,
                roleId: role.id,
                rolGobernanzaId: role.rolGobernanzaId
              });
            }
          }
        }
      });

      if (Object.keys(rolesErrors).length > 0) {
        errors.gobernanzaRoles = rolesErrors;
      }
    }

    return errors;
  }, []);

  // =============================================
  // HANDLERS DE FORMULARIO
  // =============================================

  // Función para validar si una entidad ya tiene gobernanza activa (validación local)
  const validateEntityDuplication = useCallback((entidadId: number, tipoEntidadId: number) => {
    // Validar que tengamos valores válidos (incluyendo -1 para "TODOS")
    if ((entidadId !== -1 && !entidadId) || !tipoEntidadId) {
      return true;
    }
    
    // En modo edición, permitir la misma entidad (no validar contra sí mismo)
    if (mode === 'edit' && initialData?.entidadId === entidadId) {
      return true;
    }
    // Verificar si el entidadId ya existe en la lista local
    const isDuplicate = existingEntidadIds.includes(entidadId);
    
    if (isDuplicate) {
      // Mostrar alerta de warning específica para el caso
      const mensaje = entidadId === -1 
        ? 'Ya existe una gobernanza activa para "TODOS" los sistemas. No se puede crear otra gobernanza con esta selección.'
        : 'Esta entidad ya tiene una gobernanza activa. No se puede crear otra gobernanza para la misma entidad.';
      
      AlertService.warning(mensaje, {
        duration: 5000,
        position: 'top-right'
      });
      return false;
    }
    return true;
  }, [existingEntidadIds, mode, initialData?.entidadId]);

  const handleInputChange = useCallback(async (field: keyof GobernanzaFormData, value: any) => {
    // Si se está seleccionando una entidad, validar duplicación
    if (field === 'entidadId' && (value || value === -1) && mode === 'create') {
      const tipoEntidadId = Number(state.formData.tipoEntidadId);
      const entidadId = Number(value);
      // Validar tanto entidades específicas como el caso "TODOS" (-1)
      const isValid = validateEntityDuplication(entidadId, tipoEntidadId);
      if (!isValid) {
        // Resetear el select de entidad
        setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            entidadId: ''
          },
          errors: {
            ...prev.errors,
            entidadId: 'Ya existe una gobernanza para "TODOS" los sistemas'
          }
        }));
        return;
      } else {
        // Si la validación es exitosa, limpiar cualquier error de entidadId
        const newErrors = { ...state.errors };
        delete newErrors.entidadId; // Eliminar completamente la propiedad
        
        setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            entidadId: value
          },
          errors: newErrors
        }));
        return;
      }
    }

    // Limpiar error del campo eliminando la propiedad completamente
    const newErrors = { ...state.errors };
    delete newErrors[field];
    
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value !== undefined && value !== null ? value : ''
      },
      errors: newErrors
    }));
  }, [state.formData.tipoEntidadId, mode, validateEntityDuplication]);

  const handleRoleChange = useCallback((roleId: string, field: keyof GobernanzaRolFormItem, value: any) => {
    // Si se está cambiando el rol de gobernanza, validar restricciones
    if (field === 'rolGobernanzaId' && value) {
      const selectedRole = state.rolesGobernanza.find(r => r.rolGobernanzaId === Number(value));
      if (selectedRole) {
        const rolCode = selectedRole.rolGobernanzaCodigo?.toUpperCase();
        const rolName = selectedRole.rolGobernanzaNombre?.toLowerCase();
        
        // Contar roles existentes del mismo tipo (excluyendo el actual)
        const existingRolesOfSameType = state.formData.gobernanzaRoles.filter(role => 
          role.id !== roleId && role.rolGobernanzaId === Number(value)
        ).length;
        
        // Validar Owner: solo puede haber 1
        if ((rolCode === 'OW' || rolCode === 'OWNER' || rolName?.includes('owner')) && existingRolesOfSameType >= 1) {
          AlertService.error('Solo puede haber un Owner en la gobernanza');
          return;
        }
        
        // Validar Sponsor: solo puede haber 1
         if ((rolCode === 'SP' || rolCode === 'SPONSOR' || rolName?.includes('sponsor')) && existingRolesOfSameType >= 1) {
           AlertService.error('Solo puede haber un Sponsor en la gobernanza');
           return;
         }
         
         // Si es rol Involucrado, establecer orden de ejecución en 0
         if (rolCode === 'IN' || rolCode === 'INVOLUCRADO' || rolName?.includes('involucrado')) {
           // Actualizar el estado con el rol seleccionado y orden de ejecución en 0
           setState(prev => ({
             ...prev,
             formData: {
               ...prev.formData,
               gobernanzaRoles: prev.formData.gobernanzaRoles.map(role =>
                 role.id === roleId ? { ...role, rolGobernanzaId: Number(value), ordenEjecucion: 0 } : role
               )
             },
             errors: {
               ...prev.errors,
               gobernanzaRoles: {
                 ...prev.errors.gobernanzaRoles,
                 [roleId]: {
                   ...prev.errors.gobernanzaRoles?.[roleId],
                   rolGobernanzaId: undefined,
                   ordenEjecucion: undefined
                 }
               }
             }
           }));
           return;
         }
         
         // Ejecutor e Involucrado pueden ser múltiples, no hay restricción
         // Los códigos EJ (Ejecutor) e IN (Involucrado) permiten múltiples asignaciones
      }
    }
    
    // Nota: Las validaciones de orden de ejecución se realizan solo al guardar/actualizar
    // para mejorar la experiencia de usuario
    
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        gobernanzaRoles: prev.formData.gobernanzaRoles.map(role =>
          role.id === roleId ? { ...role, [field]: value ?? '' } : role
        )
      },
      errors: {
        ...prev.errors,
        gobernanzaRoles: {
          ...prev.errors.gobernanzaRoles,
          [roleId]: {
            ...prev.errors.gobernanzaRoles?.[roleId],
            [field]: undefined
          }
        }
      }
    }));
  }, [state.rolesGobernanza, state.formData.gobernanzaRoles]);

  const handleAddRole = useCallback(() => {
    const newRole: GobernanzaRolFormItem = {
      ...EMPTY_ROLE_ITEM,
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        gobernanzaRoles: [newRole, ...prev.formData.gobernanzaRoles] // Agregar al inicio
      },
      expandedRoles: new Set([...prev.expandedRoles, newRole.id])
    }));
  }, []);

  const handleRemoveRole = useCallback(async (roleId: string) => {
    // Encontrar el rol a eliminar
    const roleToRemove = state.formData.gobernanzaRoles.find(role => role.id === roleId);
    
    if (!roleToRemove) {
      AlertService.error('No se encontró el rol a eliminar');
      return;
    }

    // Si source es 'sistemas', prevenir eliminación de Owner y Sponsor
    if (source === 'sistemas' || source === 'Data' && roleToRemove.rolGobernanzaId) {
      const selectedRole = state.rolesGobernanza.find(r => r.rolGobernanzaId === roleToRemove.rolGobernanzaId);
      if (selectedRole) {
        const codigo = selectedRole.rolGobernanzaCodigo?.toUpperCase();
        if (codigo === 'OW' || codigo === 'SP') {
          AlertService.error(`No se puede eliminar el rol ${selectedRole.rolGobernanzaNombre} desde la página de sistemas`);
          return;
        }
      }
    }

    // Si es un rol existente (tiene gobernanzaRolId), eliminar del backend
    if (roleToRemove.gobernanzaRolId && mode === 'edit') {
      try {
        setState(prev => ({ ...prev, isSubmitting: true }));
        
        const response = await gobernanzaRolService.deleteGobernanzaRol(
          roleToRemove.gobernanzaRolId
        );

        if (response.success) {
          AlertService.success('Rol eliminado exitosamente');
        } else {
          AlertService.error(response.message || 'Error al eliminar el rol');
          return; // No continuar si falla la eliminación en el backend
        }
      } catch (error: any) {
        console.error('Error al eliminar rol del backend:', error);
        AlertService.error('Error al eliminar el rol del servidor');
        return; // No continuar si falla la eliminación en el backend
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    }

    // Actualizar estado local (eliminar del formulario)
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        gobernanzaRoles: prev.formData.gobernanzaRoles.filter(role => role.id !== roleId)
      },
      expandedRoles: new Set([...prev.expandedRoles].filter(id => id !== roleId)),
      errors: {
        ...prev.errors,
        gobernanzaRoles: Object.fromEntries(
          Object.entries(prev.errors.gobernanzaRoles || {}).filter(([id]) => id !== roleId)
        )
      }
    }));
  }, [state.formData.gobernanzaRoles, mode, organizationId]);

  // =============================================
  // FUNCIÓN PARA DETECTAR TIPO DE FLUJO
  // =============================================
  
  // Función para detectar automáticamente el TipoFlujo basándose en las secuencias de los ejecutores
  const detectarTipoFlujo = useCallback((gobernanzaRoles: GobernanzaRolFormItem[]): string => {
    // Obtener solo los ejecutores (buscar por código de rol "EJ" o nombre que contenga "Ejecutor")
    const ejecutores = gobernanzaRoles.filter(role => {
      // Buscar en los roles disponibles el que corresponde a este rolGobernanzaId
      const rolInfo = state.rolesGobernanza.find(r => r.rolGobernanzaId === role.rolGobernanzaId);
      return rolInfo?.rolGobernanzaCodigo === 'EJ' || rolInfo?.rolGobernanzaNombre?.toLowerCase().includes('ejecutor');
    });

    if (ejecutores.length <= 1) {
      // Si hay 0 o 1 ejecutor, es secuencial por defecto
      return 'SECUENCIAL';
    }

    // Agrupar ejecutores por orden de ejecución
    const gruposPorOrden = new Map<number, number>();
    ejecutores.forEach(ejecutor => {
      const orden = ejecutor.ordenEjecucion ?? 1;
      gruposPorOrden.set(orden, (gruposPorOrden.get(orden) || 0) + 1);
    });

    // Si algún grupo tiene más de 1 ejecutor, es paralelo
    for (const [orden, cantidad] of gruposPorOrden) {
      if (cantidad > 1) {
        return 'PARALELO';
      }
    }

    // Si todos los órdenes tienen exactamente 1 ejecutor, es secuencial
    return 'SECUENCIAL';
  }, [state.rolesGobernanza]);

  const handleSubmit = useCallback(async () => {
    // Validar formulario
    const errors = validateForm(state.formData);
    
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors }));
      AlertService.error('Por favor corrige los errores en el formulario');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      // Detectar automáticamente el tipo de flujo
      const tipoFlujoDetectado = detectarTipoFlujo(state.formData.gobernanzaRoles);
      
      if (mode === 'edit' && initialData?.gobernanzaId) {
        // Comando de actualización
        const updateCommand: UpdateGobernanzaCommand = {
          gobernanzaId: initialData.gobernanzaId,
          tipoGobiernoId: Number(state.formData.tipoGobiernoId),
          tipoEntidadId: Number(state.formData.tipoEntidadId),
          organizacionId: organizationId || 1,
          entidadId: Number(state.formData.entidadId) || -1, // -1 para "TODOS" si no hay entidad específica
          nombre: state.formData.nombre || undefined,
          fechaAsignacion: state.formData.fechaAsignacion,
          fechaVencimiento: state.formData.fechaVencimiento || undefined,
          observaciones: state.formData.observaciones || undefined,
          tipoFlujo: tipoFlujoDetectado, // Tipo de flujo detectado automáticamente
          gobernanzaRoles: state.formData.gobernanzaRoles.map(role => ({
            gobernanzaRolId: role.gobernanzaRolId || undefined,
            rolGobernanzaId: role.rolGobernanzaId,
            usuarioId: role.usuarioId,
            fechaAsignacion: new Date(role.fechaAsignacion),
            estadoActivo: role.estado || 1,
            ordenEjecucion: role.ordenEjecucion ?? 0,
            puedeEditar: role.puedeEditar || false
          })),
          actualizadoPor: organizationId || undefined
        };

        await onSubmit(updateCommand);
      } else {
        // Comando de creación
        const createCommand: CreateGobernanzaCommand = {
          tipoGobiernoId: Number(state.formData.tipoGobiernoId),
          tipoEntidadId: Number(state.formData.tipoEntidadId),
          entidadId: Number(state.formData.entidadId) || -1,
          organizacionId: organizationId || 1,
          nombre: state.formData.nombre || undefined,
          fechaAsignacion: state.formData.fechaAsignacion,
          fechaVencimiento: state.formData.fechaVencimiento || undefined,
          observaciones: state.formData.observaciones || undefined,
          tipoFlujo: tipoFlujoDetectado, // Tipo de flujo detectado automáticamente
          gobernanzaRoles: state.formData.gobernanzaRoles.map(role => ({
            gobernanzaRolId: role.gobernanzaRolId || undefined,
            rolGobernanzaId: role.rolGobernanzaId,
            usuarioId: role.usuarioId,
            fechaAsignacion: new Date(role.fechaAsignacion),
            estadoActivo: role.estado || 1,
            ordenEjecucion: role.ordenEjecucion ?? 0,
            puedeEditar: role.puedeEditar || false
          })),
          creadoPor: organizationId || undefined
        };

        await onSubmit(createCommand);
      }
      
      // Reset formulario
      setState(prev => ({
        ...prev,
        formData: EMPTY_FORM_DATA,
        errors: {},
        isSubmitting: false,
        initialDataLoaded: false,
        activeTab: 'cabecera',
        expandedRoles: new Set()
      }));

    } catch (error: any) {
      console.error('Error al enviar formulario:', error);
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        generalError: error.message || `Error al ${mode === 'edit' ? 'actualizar' : 'crear'} la gobernanza`
      }));
    }
  }, [state.formData, validateForm, onSubmit, organizationId, mode, initialData?.gobernanzaId]);

  // =============================================
  // RENDER FUNCIONES
  // =============================================

  const renderHeaderSection = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Building size={20} color={colors.primary} />
        <h3>Información Básica</h3>
      </div>

      <div className={styles.formGrid}>
        <div>
          <SelectWrapper
            label="Tipo de Gobierno *"
            requiredText={true}
            value={state.formData.tipoGobiernoId ? state.formData.tipoGobiernoId.toString() : undefined}
            onValueChange={(value) => handleInputChange('tipoGobiernoId', value ? Number(value) : undefined)}
            placeholder="Seleccionar tipo de gobierno..."
            disabled={isDisabled}
            searchable={true}
            searchPlaceholder="Buscar tipo de gobierno..."
          >
            <SelectContent>
              {state.tiposGobierno.map(tipo => (
                <SelectItem key={tipo.tipoGobiernoId} value={tipo.tipoGobiernoId.toString()}>
                  {tipo.tipoGobiernoNombre}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectWrapper>
          {state.errors.tipoGobiernoId && (
            <small style={{ color: '#EF4444', fontSize: '0.75rem' }}>
              {state.errors.tipoGobiernoId}
            </small>
          )}
          {state.tiposGobierno.length === 0 && !state.isLoading && (
            <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
              No hay tipos de gobierno disponibles
            </small>
          )}
        </div>

        <div>
          <SelectWrapper
            label="Tipo de Entidad *"
            requiredText={true}
            value={state.formData.tipoEntidadId ? state.formData.tipoEntidadId.toString() : undefined}
            onValueChange={(value) => handleInputChange('tipoEntidadId', value ? Number(value) : undefined)}
            placeholder="Seleccionar tipo de entidad..."
            disabled={isDisabled}
            searchable={true}
            searchPlaceholder="Buscar tipo de entidad..."
          >
            <SelectContent>
              {state.tiposEntidad.map(tipo => (
                <SelectItem key={tipo.tipoEntidadId} value={tipo.tipoEntidadId.toString()}>
                  {tipo.tipoEntidadNombre}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectWrapper>
          {state.errors.tipoEntidadId && (
            <small style={{ color: '#EF4444', fontSize: '0.75rem' }}>
              {state.errors.tipoEntidadId}
            </small>
          )}
          {state.tiposEntidad.length === 0 && !state.isLoading && (
            <small style={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
              No hay tipos de entidad disponibles
            </small>
          )}
        </div>

        {/* NOTA: La selección de entidad específica se eliminó según el nuevo flujo.
             Ahora solo se selecciona el tipo de entidad y la asociación con sistemas
             se hace desde el formulario de creación de sistemas. */}
      </div>

      {/* Segunda fila: Nombre, Fecha de Asignación y Fecha de Vencimiento en una sola fila */}
      <div className={styles.threeColumnRow}>
        <div>
          <Input
            label="Nombre *"
            value={state.formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Nombre descriptivo para el gobierno..."
            disabled={isDisabled}
            required
          />
          {state.errors.nombre && (
            <small style={{ color: '#EF4444', fontSize: '0.75rem' }}>
              {state.errors.nombre}
            </small>
          )}
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: colors.text, 
            marginBottom: '6px' 
          }}>
            Fecha de Asignación *
          </label>
          <input
            type="date"
            value={state.formData.fechaAsignacion}
            onChange={(e) => handleInputChange('fechaAsignacion', e.target.value)}
            disabled={isDisabled}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${state.errors.fechaAsignacion ? '#EF4444' : colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: colors.background,
              color: colors.text
            }}
          />
          {state.errors.fechaAsignacion && (
            <span style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {state.errors.fechaAsignacion}
            </span>
          )}
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            color: colors.text, 
            marginBottom: '6px' 
          }}>
            Fecha de Vencimiento (Opcional)
          </label>
          <input
            type="date"
            value={state.formData.fechaVencimiento}
            onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
            disabled={isDisabled}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${state.errors.fechaVencimiento ? '#EF4444' : colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: colors.background,
              color: colors.text
            }}
          />
          {state.errors.fechaVencimiento && (
            <span style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {state.errors.fechaVencimiento}
            </span>
          )}
        </div>
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <Textarea
          label="Observaciones (Opcional)"
          value={state.formData.observaciones}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          placeholder="Observaciones adicionales sobre el gobierno..."
          rows={3}

          disabled={isDisabled}
        />
        {state.errors.observaciones && (
          <small style={{ color: '#EF4444', fontSize: '0.75rem' }}>
            {state.errors.observaciones}
          </small>
        )}
      </div>
    </div>
  );

  const renderRolesSection = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Users size={20} color={colors.primary} />
        <h3>Asignación de Roles y Usuarios</h3>
        <Button
          variant="default"
          size="s"
          onClick={handleAddRole}
          iconName="Plus"
          disabled={isDisabled || state.formData.gobernanzaRoles.length >= FORM_CONFIG.MAX_ROLES}
        >
          Agregar Rol
        </Button>
      </div>

      {/* Dropdown de Gobiernos Existentes eliminado de esta sección; ahora está al inicio del modal */}

      {state.formData.gobernanzaRoles.length === 0 ? (
        <div className={styles.emptyRoles}>
          <Users size={48} color={colors.textSecondary} />
          <p>No hay roles asignados</p>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
            Agrega al menos un rol y usuario para crear la gobernanza
          </p>
        </div>
      ) : (
        <div className={styles.rolesList}>
          {state.formData.gobernanzaRoles.map((role, index) => {
            const selectedRole = state.rolesGobernanza.find(r => r.rolGobernanzaId === role.rolGobernanzaId);
            const selectedUser = state.usuarios.find(u => u.usuarioId === role.usuarioId);
            const hasErrors = state.errors.gobernanzaRoles?.[role.id];
            const isExpanded = state.expandedRoles.has(role.id);
            
            return (
              <div key={role.id} className={styles.roleCard} data-has-errors={!!hasErrors}>
                <div 
                  className={styles.roleHeader}
                  onClick={() => toggleRoleCollapse(role.id)}
                >
                  {/* Columna 1: Título del rol */}
                  <div className={styles.roleTitle}>
                    <Crown size={16} color={colors.primary} />
                    <span>Rol {index + 1}</span>
                  </div>
                  
                  {/* Columna 2: Información central */}
                  <div className={styles.roleHeaderInfo}>
                    <div className={styles.roleHeaderField}>
                      <div className={styles.roleHeaderLabel}>Rol de Gobierno</div>
                      <div className={styles.roleHeaderValue} title={selectedRole ? selectedRole.rolGobernanzaNombre : 'Sin asignar'}>
                        {selectedRole ? selectedRole.rolGobernanzaNombre : 'Sin asignar'}
                      </div>
                    </div>
                    <div className={styles.roleHeaderField}>
                      <div className={styles.roleHeaderLabel}>Usuario Asignado</div>
                      <div className={styles.roleHeaderValue} title={selectedUser ? selectedUser.nombreCompleto : 'Sin asignar'}>
                        {selectedUser ? selectedUser.nombreCompleto : 'Sin asignar'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Columna 3: Botones de acción */}
                  <div className={styles.roleHeaderActions}>
                    <button
                      className={styles.collapseButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRoleCollapse(role.id);
                      }}
                      title={isExpanded ? 'Colapsar' : 'Expandir'}
                    >
                      <ChevronDown 
                        size={16} 
                        style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }} 
                      />
                    </button>
                    <Button
                      variant="ghost"
                      size="s"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRole(role.id);
                      }}
                      iconName="Trash2"
                      title="Eliminar rol"
                      disabled={(() => {
                        if (source === 'sistemas' || source === 'Data') {
                          const selectedRole = state.rolesGobernanza.find(r => r.rolGobernanzaId === role.rolGobernanzaId);
                          const roleCodigo = selectedRole?.rolGobernanzaCodigo?.toUpperCase();
                          return roleCodigo === 'OW' || roleCodigo === 'SP';
                        }
                        return isDisabled;
                      })()
                      }
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.roleContentCompact}>
                  {/* Rol de Gobierno */}
                  <div className={styles.roleFieldGroup}>
                    <div className={styles.roleFieldLabel}>Rol de Gobierno</div>
                    <SelectWrapper
                      value={role.rolGobernanzaId ? role.rolGobernanzaId.toString() : undefined}
                      onValueChange={(value) => handleRoleChange(role.id, 'rolGobernanzaId', value ? Number(value) : undefined)}
                      placeholder="Seleccionar..."
                      disabled={isDisabled}
                      searchable={true}
                    >
                      <SelectContent>
                        {state.rolesGobernanza
                          .filter(rol => {
                            // Si source es 'sistemas' o 'Data', solo mostrar ejecutores e involucrados
                            if (source === 'sistemas' || source === 'Data') {
                              const codigo = rol.rolGobernanzaCodigo?.toUpperCase();
                              return codigo === 'EJ' || codigo === 'IN';
                            }
                            // Si source es 'gobernanza', mostrar todos los roles
                            return true;
                          })
                          .map(rol => (
                          <SelectItem key={rol.rolGobernanzaId} value={rol.rolGobernanzaId.toString()}>
                            {rol.rolGobernanzaNombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectWrapper>
                    {state.errors.gobernanzaRoles?.[role.id]?.rolGobernanzaId && (
                      <small style={{ color: '#F59E0B', fontSize: '0.7rem' }}>
                        {state.errors.gobernanzaRoles[role.id].rolGobernanzaId}
                      </small>
                    )}
                  </div>

                  {/* Usuario */}
                  <div className={styles.roleFieldGroup}>
                    <div className={styles.roleFieldLabel}>Usuario</div>
                    <SelectWrapper
                      value={role.usuarioId ? role.usuarioId.toString() : undefined}
                      onValueChange={(value) => handleRoleChange(role.id, 'usuarioId', value ? Number(value) : undefined)}
                      placeholder="Seleccionar..."
                      disabled={isDisabled}
                      searchable={true}
                    >
                      <SelectContent>
                        {state.usuarios.map(user => (
                          <SelectItem key={user.usuarioId} value={user.usuarioId.toString()}>
                            {user.nombreCompleto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectWrapper>
                    {state.errors.gobernanzaRoles?.[role.id]?.usuarioId && (
                      <small style={{ color: '#F59E0B', fontSize: '0.7rem' }}>
                        {state.errors.gobernanzaRoles[role.id].usuarioId}
                      </small>
                    )}
                  </div>

                  {/* Fecha de Asignación */}
                  <div className={styles.roleFieldGroup}>
                    <div className={styles.roleFieldLabel}>Fecha Asignación</div>
                    <input
                      type="date"
                      value={role.fechaAsignacion}
                      onChange={(e) => handleRoleChange(role.id, 'fechaAsignacion', e.target.value)}
                      disabled={isDisabled}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: `1px solid ${state.errors.gobernanzaRoles?.[role.id]?.fechaAsignacion ? '#F59E0B' : colors.border}`,
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                    />
                    {state.errors.gobernanzaRoles?.[role.id]?.fechaAsignacion && (
                      <small style={{ color: '#F59E0B', fontSize: '0.7rem' }}>
                        {state.errors.gobernanzaRoles[role.id].fechaAsignacion}
                      </small>
                    )}
                  </div>

                  {/* Orden de Aprobación */}
                  <div className={styles.roleFieldGroup}>
                    <div className={styles.roleFieldLabel}>Orden de Aprobación</div>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={role.ordenEjecucion}
                      onChange={(e) => handleRoleChange(role.id, 'ordenEjecucion', parseInt(e.target.value) || 0)}
                      disabled={isDisabled || (() => {
                        const selectedRole = state.rolesGobernanza.find(r => r.rolGobernanzaId === role.rolGobernanzaId);
                        const rolCode = selectedRole?.rolGobernanzaCodigo?.toUpperCase();
                        const rolName = selectedRole?.rolGobernanzaNombre?.toLowerCase();
                        return rolCode === 'IN' || rolCode === 'INVOLUCRADO' || rolName?.includes('involucrado');
                      })()}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: `1px solid ${state.errors.gobernanzaRoles?.[role.id]?.ordenEjecucion ? '#F59E0B' : colors.border}`,
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor: colors.background,
                        color: colors.text
                      }}
                    />
                    {state.errors.gobernanzaRoles?.[role.id]?.ordenEjecucion && (
                      <small style={{ color: '#F59E0B', fontSize: '0.7rem' }}>
                        {state.errors.gobernanzaRoles[role.id].ordenEjecucion}
                      </small>
                    )}
                    <small style={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
                      Define la secuencia de ejecución del rol
                    </small>
                  </div>

                  {/* Permisos */}
                  <div className={styles.rolePermissions}>
                    <div className={styles.rolePermissionItem}>
                      <input
                        type="checkbox"
                        id={`active_${role.id}`}
                        checked={role.estado === 1}
                        onChange={(e) => handleRoleChange(role.id, 'estado', e.target.checked ? 1 : 0)}
                        disabled={isDisabled}
                        style={{ width: '12px', height: '12px' }}
                      />
                      <CheckCircle size={12} color={role.estado === 1 ? "#10b981" : "#6b7280"} />
                      <span>Activo</span>
                    </div>
                    <div className={styles.rolePermissionItem}>
                      <input
                        type="checkbox"
                        id={`puedeEditar_${role.id}`}
                        checked={role.puedeEditar}
                        onChange={(e) => handleRoleChange(role.id, 'puedeEditar', e.target.checked)}
                        disabled={isDisabled}
                        style={{ width: '12px', height: '12px' }}
                      />
                      <Edit size={12} color={role.puedeEditar ? "#3b82f6" : "#6b7280"} />
                      <span>Editar</span>
                    </div>
                  </div>
                  </div>
                )}

                {/* Mostrar errores específicos del rol */}
                {state.errors.gobernanzaRoles?.[role.id]?.duplicate && (
                  <div style={{ 
                    margin: '8px 12px 0', 
                    padding: '6px 8px', 
                    backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                    border: '1px solid #F59E0B', 
                    borderRadius: '4px', 
                    color: '#F59E0B', 
                    fontSize: '0.75rem' 
                  }}>
                    {state.errors.gobernanzaRoles[role.id].duplicate}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {state.errors.general && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid #EF4444', 
          borderRadius: '6px', 
          color: '#EF4444' 
        }}>
          {state.errors.general}
        </div>
      )}
    </div>
  );

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nuevo Gobierno' : mode === 'edit' ? 'Editar Gobierno' : 'Ver Gobierno'}
      size="xl"
      onSave={(mode !== 'view' || canEditInView) ? handleSubmit : undefined}
      onCancel={(mode !== 'view' || canEditInView) ? onCancel : undefined}
      saveButtonText={mode === 'create' ? 'Crear Gobierno' : (mode === 'edit' ? 'Actualizar Gobierno' : (canEditInView ? 'Guardar Cambios' : 'Actualizar Gobierno'))}
      saveButtonLoading={state.isSubmitting}
      hideFooter={mode === 'view' && !canEditInView}
      saveDisabled={
        (() => {
          // Filtrar solo errores que realmente tienen valor
          const actualErrors = Object.entries(state.errors)
            .filter(([key, value]) => value && value.trim && value.trim() !== '')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
          const conditions = {
            isDisabled,
            noTipoGobierno: source !== 'sistemas' && source !== 'Data' && !state.formData.tipoGobiernoId,
            noTipoEntidad: source !== 'sistemas' && source !== 'Data' && !state.formData.tipoEntidadId,
            noFechaAsignacion: source !== 'sistemas' && source !== 'Data' && !state.formData.fechaAsignacion,
            noRoles: state.formData.gobernanzaRoles.length === 0,
            rolesIncompletos: state.formData.gobernanzaRoles.some(role => !role.rolGobernanzaId || !role.usuarioId),
            hasErrors: Object.keys(actualErrors).length > 0
          };
          const shouldDisable = conditions.isDisabled || 
            conditions.noTipoGobierno || 
            conditions.noTipoEntidad || 
            conditions.noFechaAsignacion ||
            conditions.noRoles ||
            conditions.rolesIncompletos ||
            conditions.hasErrors;
          return shouldDisable;
        })()
      }
    >
      <div className={styles.formContainer}>
        {state.isLoading ? (
          <div className={styles.loading}>
            <Settings size={32} className="animate-spin" />
            <p>Cargando formulario...</p>
          </div>
        ) : (
          <>
            {/* Selección de Gobierno (movido al inicio del modal) */}
            {(source === 'sistemas' || source === 'Data') && (
              <div className={styles.fieldGroup} style={{ marginBottom: '16px' }}>
                {/* Contenedor dividido en dos mitades */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingRight: '16px' }}>
                  {/* Mitad izquierda: Criterios de búsqueda */}
                  <div style={{ flex: '0 0 50%' }}>
                    <label className={styles.label} style={{ marginBottom: '12px', display: 'block' }}>
                      Criterios de búsqueda
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="tipoBusqueda"
                          value="NOMBRE_GOBIERNO"
                          checked={tipoBusqueda === 'NOMBRE_GOBIERNO'}
                          onChange={(e) => {
                            setTipoBusqueda(e.target.value);
                          }}
                          style={{ margin: 0 }}
                        />
                        Nombre de Gobierno
                      </label>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="tipoBusqueda"
                          value="OWNER_SPONSOR"
                          checked={tipoBusqueda === 'OWNER_SPONSOR'}
                          onChange={(e) => {
                            setTipoBusqueda(e.target.value);
                          }}
                          style={{ margin: 0 }}
                        />
                        Nombre/Apellido de Owner/Sponsor
                      </label>
                    </div>
                  </div>
                  
                  {/* Mitad derecha: Seleccionar Gobierno Existente */}
                  <div style={{ flex: '0 0 50%', paddingRight: '16px' }}>
                    <label className={styles.label}>
                      Seleccionar Gobierno Existente
                    </label>
                    <SearchableSelect
                      value={selectedGobernanza?.gobernanzaId || null}
                      onChange={handleGobernanzaSelect}
                      options={searchOptions}
                      placeholder={isSearching ? 'Buscando...' : `Escriba para buscar ${tipoBusqueda === 'NOMBRE_GOBIERNO' ? 'gobiernos' : 'por Owner/Sponsor'}`}
                      searchPlaceholder={tipoBusqueda === 'NOMBRE_GOBIERNO' ? 'Buscar por nombre de gobierno...' : 'Buscar por nombre/apellido de Owner/Sponsor...'}
                      disabled={isDisabled}
                      onSearchChange={handleSearchChange}
                      noResultsText={searchTerm.length < 2 ? 'Escriba al menos 2 caracteres' : 'No se encontraron gobiernos'}
                      icon={Building}
                    />
                    {isSearching && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginTop: '8px',
                        fontSize: '0.875rem',
                        color: colors.textSecondary 
                      }}>
                        <Settings size={14} className="animate-spin" />
                        Buscando gobiernos...
                      </div>
                    )}
                    {selectedGobernanza && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: colors.surface,
                        borderRadius: '4px',
                        border: `1px solid ${colors.border}`,
                        fontSize: '0.875rem'
                      }}>
                        <strong>Seleccionado:</strong> {selectedGobernanza.nombre}
                        {selectedGobernanza.rolesAsignados && selectedGobernanza.rolesAsignados.length > 0 && (
                          <div style={{ marginTop: '4px', color: colors.textSecondary }}>
                            {selectedGobernanza.rolesAsignados.length} rol(es) cargado(s)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className={styles.tabs}>
              {source !== 'sistemas' && source !== 'Data' && (
                <button
                  className={`${styles.tab} ${state.activeTab === 'cabecera' ? styles.tabActive : ''}`}
                  onClick={() => setState(prev => ({ ...prev, activeTab: 'cabecera' }))}
                >
                  <Building size={16} />
                  Información Básica
                </button>
              )}
              <button
                className={`${styles.tab} ${state.activeTab === 'roles' ? styles.tabActive : ''}`}
                onClick={() => setState(prev => ({ ...prev, activeTab: 'roles' }))}
              >
                <Users size={16} />
                Roles y Usuarios
                {state.formData.gobernanzaRoles.length > 0 && (
                  <Badge 
                    label={state.formData.gobernanzaRoles.length.toString()} 
                    color="primary" 
                    size="s" 
                  />
                )}
              </button>
            </div>

                  {/* Estado de carga de datos y progreso */}
      {!state.isLoading && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: colors.surface, 
          borderRadius: '6px', 
          marginBottom: '16px',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              📊 Datos: {state.tiposGobierno.length} tipos gobierno • {state.tiposEntidad.length} tipos entidad • {state.rolesGobernanza.length} roles • {state.usuarios.length} usuarios
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.primary }}>
              {(() => {
                let completed = 0;
                let total = 4; // campos requeridos básicos + al menos 1 rol (sin entidadId)
                
                if (state.formData.tipoGobiernoId) completed++;
                if (state.formData.tipoEntidadId) completed++;
                // if (state.formData.entidadId) completed++; // Ya no se requiere entidad específica
                if (state.formData.fechaAsignacion) completed++;
                if (state.formData.gobernanzaRoles.length > 0 && 
                    state.formData.gobernanzaRoles.every(r => r.rolGobernanzaId && r.usuarioId)) completed++;
                
                return `${completed}/${total} completado`;
              })()}
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: colors.border, 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${(() => {
                let completed = 0;
                let total = 4; // sin entidadId
                
                if (state.formData.tipoGobiernoId) completed++;
                if (state.formData.tipoEntidadId) completed++;
                // if (state.formData.entidadId) completed++; // Ya no se requiere entidad específica
                if (state.formData.fechaAsignacion) completed++;
                if (state.formData.gobernanzaRoles.length > 0 && 
                    state.formData.gobernanzaRoles.every(r => r.rolGobernanzaId && r.usuarioId)) completed++;
                
                return (completed / total) * 100;
              })()}%`, 
              height: '100%', 
              backgroundColor: colors.primary,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Contenido de la tab activa */}
      <div className={styles.tabContent}>
        {state.activeTab === 'cabecera' && source !== 'sistemas' && source !== 'Data' && renderHeaderSection()}
        {state.activeTab === 'roles' && renderRolesSection()}
      </div>

            {/* Error general */}
            {state.generalError && (
              <div className={styles.generalError}>
                <AlertCircle size={16} />
                <span>{state.generalError}</span>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};