import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Building, Plus, Edit, Trash2, Save, X, ArrowDown,
  Briefcase, User, UserPlus, Settings, Move, Check, ChevronDown, Upload,
  Hand, RotateCcw, MousePointer, ZoomIn, ZoomOut, Maximize, Navigation, Download,
  Eye, EyeOff, UserCheck, UserX, Building2
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { SearchableSelect } from '../../ui/searchable-select/SearchableSelect';
import { Modal } from '../../ui/modal/Modal';
import { Button } from '../../ui/button/button';
import styles from './ConstructorOrganigrama.module.css';
import { organizationalMockData } from '../../../mocks';
import { TIPOS_UNIDAD } from '../../../services/types/unidades-org.types';
import { CATEGORIAS_POSICIONES } from '../../../models';
import { TipoUnidad } from '../../../services/types/unidades-org.types';
import { CategoriaPosicion } from '../../../services/types/posiciones.types';
import { CargaMasiva } from './CargaMasiva';
import { NavigationPanel } from './NavigationPanel';
import { ExportPanel } from './ExportPanel';
import { ParsedOrganizationalData } from '../../../utils/excelParser';
import { OrganizationalData } from '../../../utils/exportUtils';
import { AlertService } from '../../ui/alerts/AlertService';
import { processPaginatedResponse } from '../../../utils/paginationUtils';
import { usePan } from '../../../hooks/usePan';
import { useAuth } from '../../../hooks/useAuth';
import { useLevelCoordinates } from '../../../hooks/useLevelCoordinates';
import { ErrorHandler } from '../../../utils/errorHandler';
import { organizacionesService } from '../../../services/organizaciones.service';
import { OrganizacionDto } from '../../../services/types/organizaciones.types';
import { sedesService } from '../../../services/sedes.service';
import { SedeDto } from '../../../services/types/sedes.types';
import { unidadesOrgService } from '../../../services/unidades-org.service';
import { UpdateUnidadOrgCommand, CreateUnidadOrgCommand } from '../../../services/types/unidades-org.types';
import { personaPosicionService } from '../../../services/persona-posicion.service';
import { CreatePersonaPosicionCommand, UpdatePersonaPosicionCommand } from '../../../services/types/persona-posicion.types';
import { ReactFlowOrgChart } from './ReactFlowOrgChart';

// Función helper para convertir el valor del enum TipoUnidad al texto correspondiente
// Maneja tanto strings como números que vienen del backend
const getTipoUnidadTexto = (tipoUnidad: number | string): string => {
  // Convertir a número si viene como string
  const tipoNumerico = typeof tipoUnidad === 'string' ? parseInt(tipoUnidad, 10) : tipoUnidad;
  
  switch (tipoNumerico) {
    case TipoUnidad.CORPORATIVO:
      return 'Corporativo';
    case TipoUnidad.DIVISION:
      return 'División';
    case TipoUnidad.GERENCIA:
      return 'Gerencia';
    case TipoUnidad.SUBGERENCIA:
      return 'Sub Gerencia';
    case TipoUnidad.DEPARTAMENTO:
      return 'Departamento';
    case TipoUnidad.AREA:
      return 'Área';
    case TipoUnidad.SECCION:
      return 'Sección';
    case TipoUnidad.EQUIPO:
      return 'Equipo';
    default:
      return 'Desconocido';
  }
};

// Función helper para convertir el valor del enum CategoriaPosicion al texto correspondiente
// Maneja tanto strings como números que vienen del backend
const getCategoriaPosicionTexto = (categoria: number | string): string => {
  // Convertir a número si viene como string
  const categoriaNumerico = typeof categoria === 'string' ? parseInt(categoria, 10) : categoria;
  
  switch (categoriaNumerico) {
    case CategoriaPosicion.Directivo:
      return 'Directivo';
    case CategoriaPosicion.Gerencial:
      return 'Gerencial';
    case CategoriaPosicion.Jefatura:
      return 'Jefatura';
    case CategoriaPosicion.Supervisorio:
      return 'Supervisorio';
    case CategoriaPosicion.Analista:
      return 'Analista';
    case CategoriaPosicion.Especialista:
      return 'Especialista';
    case CategoriaPosicion.Tecnico:
      return 'Técnico';
    case CategoriaPosicion.Operativo:
      return 'Operativo';
    case CategoriaPosicion.Practicante:
      return 'Practicante';
    default:
      return 'Desconocido';
  }
};

// Función helper para convertir el texto del tipo de unidad al número correspondiente
const getTipoUnidadNumero = (tipoUnidadTexto: string): number => {
  switch (tipoUnidadTexto.toUpperCase()) {
    case 'CORPORATIVO':
      return TipoUnidad.CORPORATIVO;
    case 'DIVISION':
      return TipoUnidad.DIVISION;
    case 'GERENCIA':
      return TipoUnidad.GERENCIA;
    case 'SUBGERENCIA':
      return TipoUnidad.SUBGERENCIA;
    case 'DEPARTAMENTO':
      return TipoUnidad.DEPARTAMENTO;
    case 'AREA':
      return TipoUnidad.AREA;
    case 'SECCION':
      return TipoUnidad.SECCION;
    case 'EQUIPO':
      return TipoUnidad.EQUIPO;
    default:
      return TipoUnidad.GERENCIA; // Default a GERENCIA
  }
};

export interface GestionOrganizacionalProps {
  data?: any;
}

export const GestionOrganizacional: React.FC<GestionOrganizacionalProps> = ({ data }) => {
  const { colors } = useTheme();
  const { user, organization, organizationInfo } = useAuth();
  
  // Hook para funcionalidad de Pan y Zoom
  const {
    panState,
    isPanMode,
    setPanMode,
    resetPan,
    zoomIn,
    zoomOut,
    resetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    panStyle,
    fitToScreen,
    fitContentToScreen,
    centerOnElement,
    panToPosition,
    setPanState
  } = usePan();
  
  const [currentMode, setCurrentMode] = useState('build'); // build, assign, view
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCargaMasiva, setShowCargaMasiva] = useState(false);
  const [cargaMasivaResetTrigger, setCargaMasivaResetTrigger] = useState(0); // 🔧 AGREGADO: Para limpiar file upload
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [hiddenUnitActions, setHiddenUnitActions] = useState<Set<number>>(new Set());
  const [hiddenPositionActions, setHiddenPositionActions] = useState<Set<number>>(new Set());
  const [showPanIndicator, setShowPanIndicator] = useState(true);
  const [showOnlyPositions, setShowOnlyPositions] = useState(false);
  const [isAssigningPerson, setIsAssigningPerson] = useState(false);

  // Vista alternativa con React Flow
  const [useReactFlowView, setUseReactFlowView] = useState(true);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [organizationalLayout, setOrganizationalLayout] = useState<any>(null);
  const [reactFlowNodes, setReactFlowNodes] = useState<any[]>([]);
  const [reactFlowEdges, setReactFlowEdges] = useState<any[]>([]);

  // Callback para recibir cambios de nodos y edges de React Flow
  const handleNodesEdgesChange = useCallback((nodes: any[], edges: any[]) => {
    setReactFlowNodes(nodes);
    setReactFlowEdges(edges);
  }, []);

  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Estados para filtrado de unidades
  const [filteredUnits, setFilteredUnits] = useState<Set<number>>(new Set());
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Estados para la información de la empresa
  const [organizacionActual, setOrganizacionActual] = useState<any>(null);


  const [isLoadingOrganization, setIsLoadingOrganization] = useState(true);
  const [organizationError, setOrganizationError] = useState<string | null>(null);

  // Estados iniciales vacíos para construcción desde cero
  const [unidades, setUnidades] = useState<any[]>([]);
  const [posiciones, setPosiciones] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [personaPosiciones, setPersonaPosiciones] = useState<any[]>([]);
  const [sedes, setSedes] = useState<SedeDto[]>([]);
  
  // Estado para controlar si se debe cargar desde API
  const [shouldLoadFromAPI, setShouldLoadFromAPI] = useState(true);

  // 🔧 AGREGADO: Hook para rastrear coordenadas de niveles (DESPUÉS de que las variables estén definidas)
  const {
    levelCoordinates,
    updateLevelCoordinates,
    navigateToLevel,
    clearLevelCoordinates
  } = useLevelCoordinates(unidades, isFilterActive, filteredUnits);

  // Estado para organizaciones disponibles (solo para Super Admin)
  const [organizacionesDisponibles, setOrganizacionesDisponibles] = useState<OrganizacionDto[]>([]);

  // 🔧 NUEVO: Estado para preservar la posición del organigrama
  const [preservePanPosition, setPreservePanPosition] = useState(false);
  const [lastPanState, setLastPanState] = useState(panState);

  // 🔧 AGREGADO: Actualizar coordenadas y centrar automáticamente cuando cambie el modo de visualización o se renderice
  useEffect(() => {
    if (unidades.length > 0) {
      // Delay para permitir que el DOM se actualice completamente
      const timeout = setTimeout(() => {
        updateLevelCoordinates();
        
        // 🎯 FIX: Centrado automático después del renderizado
        // Delay adicional para asegurar que las coordenadas estén actualizadas
        setTimeout(() => {
          fitToScreen();
        }, 100);
      }, 200);
      
      return () => clearTimeout(timeout);
    }
  }, [currentMode, unidades.length, isFilterActive, updateLevelCoordinates, fitToScreen]);



  // Función para cargar organizaciones disponibles
  const loadOrganizacionesDisponibles = async () => {
    try {
      const response = await organizacionesService.getOrganizaciones({ includeDeleted: false });
      
      if (response.success && response.data) {
        setOrganizacionesDisponibles(response.data);
      } else {
        console.error('Error al cargar organizaciones:', response.message);
      }
    } catch (error) {
      console.error('Error al cargar organizaciones:', error);
    }
  };

  // Función para manejar la selección de organización (solo para Super Admin)
  const handleOrganizacionChange = async (organizacionId: string | number) => {
    try {
      const organizacionSeleccionada = organizacionesDisponibles.find(
        org => org.organizacionId === Number(organizacionId)
      );
      
      if (organizacionSeleccionada) {
        setOrganizacionActual(organizacionSeleccionada);
        
        // Cargar la estructura de la organización seleccionada
        setShouldLoadFromAPI(true);
        setIsLoadingOrganization(true);
        const estructuraCargada = await cargarEstructuraDesdeAPI(organizacionSeleccionada.organizacionId);
        
        if (!estructuraCargada) {
          // Si no hay estructura, limpiar los datos
          setUnidades([]);
          setPosiciones([]);
          setPersonaPosiciones([]);
        }
        
        setIsLoadingOrganization(false);
        
        AlertService.info(`Organización cambiada a: ${organizacionSeleccionada.razonSocial}`);
      }
    } catch (error) {
      console.error('Error al cambiar organización:', error);
      setIsLoadingOrganization(false);
      AlertService.error('Error al cambiar la organización');
    }
  };

  // Efecto para mostrar el indicador cuando se activa el modo pan
  useEffect(() => {
    if (isPanMode) {
      setShowPanIndicator(true);
    }
  }, [isPanMode]);

  // Efecto para cargar sedes cuando se abre el modal de unidad
  useEffect(() => {
    if (showUnitModal && organizacionActual) {
      loadSedesByOrganizacion(organizacionActual.organizacionId);
    } else {
    }
  }, [showUnitModal, organizacionActual]);

  // Función para cargar sedes por organización
  const loadSedesByOrganizacion = async (organizacionId: number) => {
    try {
      const response = await sedesService.getSedesPaginated({
        PageNumber: 1,
        PageSize: 100,
        OrganizacionId: organizacionId
      });
      if (response.success && response.data) {
        // Usar el utilitario centralizado para procesar la respuesta
        const processedData = processPaginatedResponse<SedeDto>(response.data as any, 1, 100);
        setSedes(processedData.items);
        
        // Auto-selección si solo hay una sede Y no estamos en modo edición
        if (processedData.items.length === 1 && !isEditMode) {
          setUnitForm(prev => ({ ...prev, sedeId: processedData.items[0].sedeId }));
        } else if (isEditMode) {
        }
      } else {
        setSedes([]);
      }
    } catch (error) {
      console.error('❌ [SEDES UNIDADES] Error al cargar sedes:', error);
      setSedes([]);
    }
  };

  // Función para cargar estructura organizacional desde API
  const cargarEstructuraDesdeAPI = async (organizationId: number) => {
    try {
      // 🔄 NUEVO: Cargar tanto la estructura como el layout en paralelo
      const [estructura, layoutResponse] = await Promise.all([
        organizacionesService.getEstructuraOrganizacionalParaOrganigrama(organizationId),
        organizacionesService.getOrganizationalLayout(organizationId)
      ]);

      // Procesar layout si existe
      const layout = layoutResponse?.success && layoutResponse.data ? layoutResponse.data : null;
      if (estructura) {
        // Mapear correctamente los campos de la respuesta de la API
        const unidadesFromAPI = (estructura as any).unidades || [];
        const posicionesFromAPI = estructura.posiciones || [];
        const personasFromAPI = estructura.personas || [];
        const asignacionesFromAPI = (estructura as any).personaPosiciones || [];
        // Corregir el mapeo de IDs de unidades padre
        // Ahora soportamos tanto IDs reales como índices secuenciales provenientes de versiones antiguas del API
        const idSet = new Set(unidadesFromAPI.map((u: any) => u.unidadesOrgId));
        const unidadesCorregidas = unidadesFromAPI.map((unidad: any) => {
          const parseNum = (v: any): number | null => {
            if (v === null || v === undefined) return null;
            const n = typeof v === 'string' ? Number(v) : v;
            return typeof n === 'number' && !Number.isNaN(n) ? n : null;
          };

          let unidadPadreIdCorregido: number | null = null;
          const candidato = parseNum(unidad.unidadPadreId);

          if (candidato && idSet.has(candidato)) {
            // API ya entrega IDs reales de unidades
            unidadPadreIdCorregido = candidato;
          } else if (candidato && !idSet.has(candidato)) {
            // Compatibilidad: podría ser un índice 1-based
            const indiceUnidadPadre = candidato - 1; // Convertir a índice basado en 0
            if (indiceUnidadPadre >= 0 && indiceUnidadPadre < unidadesFromAPI.length) {
              const posibleId = unidadesFromAPI[indiceUnidadPadre].unidadesOrgId;
              unidadPadreIdCorregido = idSet.has(posibleId) ? posibleId : null;
            }
          } else {
            unidadPadreIdCorregido = null;
          }

          const estadoNormalizado =
            unidad.estado === '1' || unidad.estado === 1 || unidad.estado === true || unidad.estado === 'ACTIVO'
              ? 'ACTIVO'
              : 'INACTIVO';

          return {
            ...unidad,
            unidadPadreId: unidadPadreIdCorregido,
            estado: estadoNormalizado
          };
        });
        
        // Normalizar posiciones
        const posicionesCorregidas = posicionesFromAPI.map((posicion: any) => ({
          ...posicion,
          estado:
            posicion.estado === '1' || posicion.estado === 1 || posicion.estado === true || posicion.estado === 'ACTIVO'
              ? 'ACTIVO'
              : 'INACTIVO'
        }));
        
        // Normalizar personas
        const personasCorregidas = personasFromAPI.map((persona: any) => ({
          ...persona,
          estado:
            persona.estado === '1' || persona.estado === 1 || persona.estado === true || persona.estado === 'ACTIVO'
              ? 'ACTIVO'
              : 'INACTIVO'
        }));
        
        // Normalizar asignaciones
        const asignacionesCorregidas = asignacionesFromAPI.map((asignacion: any) => ({
          ...asignacion,
          estado: 'ACTIVO',
          version: 1
        }));
        // Cargar todos los datos en los estados
        setOrganizacionActual(estructura.organizacion);
        setUnidades(unidadesCorregidas);
        setPosiciones(posicionesCorregidas);
        setPersonas(personasCorregidas);
        setPersonaPosiciones(asignacionesCorregidas);
        setOrganizationalLayout(layout);
        
        // Marcar que ya no necesitamos cargar desde API
        setShouldLoadFromAPI(false);
        
        // 🎯 FIX: Centrado automático después de cargar desde API
        // Delay para permitir que React actualice el DOM completamente
        setTimeout(() => {
          fitToScreen();
        }, 500); // Delay mayor para carga desde API
        
        AlertService.success(`Organigrama cargado: ${unidadesCorregidas.length} unidades, ${posicionesCorregidas.length} posiciones, ${personasCorregidas.length} personas`);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ [API ESTRUCTURA] Error al cargar estructura desde API:', error);
      return false;
    }
  };

  // Efecto para cargar información de la organización y estructura
  useEffect(() => {
    // Evitar ejecuciones si ya tenemos la organización cargada y no necesitamos cargar desde API
    if (organizacionActual && !shouldLoadFromAPI) {
      setIsLoadingOrganization(false);
      return;
    }

    // Evitar ejecuciones si no tenemos usuario
    if (!user) {
      setIsLoadingOrganization(false);
      return;
    }

    // Evitar ejecuciones múltiples si ya está cargando
    if (isLoadingOrganization) {
      return;
    }

    const loadOrganizationData = async () => {
      try {
        setIsLoadingOrganization(true);
        setOrganizationError(null);

        // Verificar si el usuario tiene organización asignada
        if (!organizationInfo.hasOrganization) {
          // Si es Super Admin sin organización específica, usar datos mock como fallback
          if (user?.perfilId === 1) {
            setOrganizacionActual(organizationalMockData.organizacion);
            setUnidades(organizationalMockData.unidadesOrganizacionales);
            setPosiciones(organizationalMockData.posiciones);
            setPersonas(organizationalMockData.personas);
            setPersonaPosiciones(organizationalMockData.personaPosiciones);
            setShouldLoadFromAPI(false);
            
            // Centrar automáticamente después de cargar datos mock
            setTimeout(() => {
              fitToScreen();
            }, 500);
            
            AlertService.success('Organigrama de ejemplo cargado para Super Admin.');
          } else {
            throw new Error('Usuario sin organización asignada. Contacte al administrador.');
          }
        } else {
          // Verificar que tenemos un ID de organización válido
          if (!organizationInfo.id) {
            throw new Error('ID de organización no disponible');
          }
          
          // Intentar cargar estructura desde API primero
          const estructuraCargada = await cargarEstructuraDesdeAPI(organizationInfo.id as number);
          
          if (!estructuraCargada) {
            // Si no se pudo cargar desde API, usar datos mock como ejemplo
            const organizacionData = {
              organizacionId: organizationInfo.id,
              codigo: organizationInfo.code,
              razonSocial: organizationInfo.name,
              nombreComercial: organizationInfo.displayName,
              numeroDocumento: organizationInfo.document,
              direccion: organizationInfo.address,
              ubicacionCompleta: organizationInfo.location,
              email: null,
              telefono: null,
              paginaWeb: null,
              estado: 'ACTIVO',
              fechaCreacion: new Date().toISOString(),
              version: 1
            };

            // Cargar datos mock adaptados a la organización actual
            const unidadesMock = organizationalMockData.unidadesOrganizacionales.map(u => ({
              ...u,
              organizacionId: organizationInfo.id
            }));
            
            const posicionesMock = organizationalMockData.posiciones.map(p => ({
              ...p,
              organizacionId: organizationInfo.id
            }));

            setOrganizacionActual(organizacionData);
            setUnidades(unidadesMock);
            setPosiciones(posicionesMock);
            setPersonas(organizationalMockData.personas);
            setPersonaPosiciones(organizationalMockData.personaPosiciones);
            setShouldLoadFromAPI(false);
            
            // Centrar automáticamente después de cargar datos mock
            setTimeout(() => {
              fitToScreen();
            }, 500);
            
            AlertService.success('Organigrama de ejemplo cargado. Puedes editarlo, usar carga masiva o cargar desde el servidor.');
          }
        }

      } catch (error) {
        console.error('❌ [ORGANIZACIÓN] Error al cargar datos de la organización:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar la organización';
        setOrganizationError(errorMessage);
        
        await ErrorHandler.handleServiceError(error, 'cargar información de la organización');
        
        // Como fallback, usar datos mock completos
        setOrganizacionActual(organizationalMockData.organizacion);
        setUnidades(organizationalMockData.unidadesOrganizacionales);
        setPosiciones(organizationalMockData.posiciones);
        setPersonas(organizationalMockData.personas);
        setPersonaPosiciones(organizationalMockData.personaPosiciones);
        setShouldLoadFromAPI(false);
        
        // Centrar automáticamente después de cargar datos mock
        setTimeout(() => {
          fitToScreen();
        }, 500);
        
        AlertService.success('Organigrama de ejemplo cargado como respaldo.');
        
      } finally {
        setIsLoadingOrganization(false);
      }
    };

    // Ejecutar la carga
    loadOrganizationData();
  }, [user?.perfilId, organizationInfo.id, organizationInfo.hasOrganization, shouldLoadFromAPI]);

  // Efecto para cargar organizaciones disponibles (solo para Super Admin)
  useEffect(() => {
    if (user?.perfilId === 1) {
      loadOrganizacionesDisponibles();
    }
  }, [user?.perfilId]);

  // Formularios
  const [unitForm, setUnitForm] = useState({
    nombre: '',
    nombreCorto: '',
    tipoUnidad: TipoUnidad.GERENCIA, // Usar el enum en lugar de string
    objetivo: '',
    unidadPadreId: null as number | null,
    sedeId: null as number | null
  });

  const [positionForm, setPositionForm] = useState({
    nombre: '',
    categoria: 'GERENCIAL',
    objetivo: '',
    ordenImpresion: 1
  });

  // 🔧 NUEVO: Efecto para validar y limpiar unidad padre cuando cambie el tipo de unidad
  useEffect(() => {
    if (unitForm.unidadPadreId && unitForm.tipoUnidad) {
      const tipoUnidadActual = Number(unitForm.tipoUnidad);
      const unidadPadre = unidades.find(u => u.unidadesOrgId === unitForm.unidadPadreId);
      
      // Si la unidad padre actual no es válida para el nuevo tipo, limpiarla
      if (unidadPadre && unidadPadre.tipoUnidad >= tipoUnidadActual) {
        setUnitForm(prev => ({
          ...prev,
          unidadPadreId: null
        }));
        
        AlertService.warning(`La unidad padre "${unidadPadre.nombre}" no es válida para una unidad de tipo "${getTipoUnidadTexto(tipoUnidadActual)}". Se ha limpiado la selección.`);
      }
    }
  }, [unitForm.tipoUnidad, unidades]);

  // Funciones para manejar unidades
  const handleCreateUnit = async () => {
    if (!organizacionActual) {
      AlertService.error('No se puede crear la unidad. Información de la organización no disponible.');
      return;
    }

    try {
      // 🔧 NUEVO: Validación de jerarquía en el frontend
      if (unitForm.unidadPadreId && unitForm.tipoUnidad) {
        const tipoUnidadActual = Number(unitForm.tipoUnidad);
        const unidadPadre = unidades.find(u => u.unidadesOrgId === unitForm.unidadPadreId);
        
        if (unidadPadre && tipoUnidadActual <= unidadPadre.tipoUnidad) {
          AlertService.error(`No se puede hacer que una unidad de tipo "${getTipoUnidadTexto(tipoUnidadActual)}" sea hija de una unidad de tipo "${getTipoUnidadTexto(unidadPadre.tipoUnidad)}". La jerarquía organizacional debe respetarse.`);
          return;
        }
      }
      
      // 🔧 NUEVO: Preservar la posición actual del organigrama
      setPreservePanPosition(true);
      setLastPanState({ ...panState });
      
      // Construir el comando de creación
      const createCommand: CreateUnidadOrgCommand = {
        organizacionId: organizacionActual.organizacionId,
        sedeId: unitForm.sedeId,
        tipoUnidad: Number(unitForm.tipoUnidad), // 🔧 FIX: Convertir a número explícitamente
        nombre: unitForm.nombre,
        unidadPadreId: unitForm.unidadPadreId,
        nombreCorto: unitForm.nombreCorto || null,
        objetivo: unitForm.objetivo || null,
        posicionCategoria: null,
        centroCosto: null,
        creadoPor: user?.personaId || null
      };
      // Llamar al servicio del backend
      const response = await unidadesOrgService.createUnidadOrg(createCommand);
      if (response.success && response.data) {
        // Crear la nueva unidad con el ID devuelto por el backend
        const newUnit = {
          unidadesOrgId: response.data, // ID devuelto por el backend
          organizacionId: organizacionActual.organizacionId,
          sedeId: unitForm.sedeId,
          unidadPadreId: unitForm.unidadPadreId,
          nombre: unitForm.nombre,
          nombreCorto: unitForm.nombreCorto,
          tipoUnidad: unitForm.tipoUnidad, // Ya es un número del enum
          objetivo: unitForm.objetivo,
          estado: 'ACTIVO',
          version: 1,
          fechaCreacion: new Date().toISOString(),
          creadoPor: user?.personaId || null
        };
        // 🔧 OPTIMIZADO: Actualizar estado sin causar re-renderizado completo
        setUnidades(prev => {
          const newUnidades = [...prev, newUnit];
          return newUnidades;
        });
        
        setUnitForm({
          nombre: '',
          nombreCorto: '',
          tipoUnidad: TipoUnidad.GERENCIA, // Usar el enum en lugar de string
          objetivo: '',
          unidadPadreId: null,
          sedeId: null
        });
        setShowUnitModal(false);
        
        // 🔧 NUEVO: Restaurar la posición del organigrama después de un breve delay
        setTimeout(() => {
          if (preservePanPosition && lastPanState) {
            setPanState(lastPanState);
            setPreservePanPosition(false);
          }
        }, 100);
        
        AlertService.success(`Unidad "${newUnit.nombre}" creada exitosamente en el servidor.`);
      } else {
        console.error('❌ [UNIDAD] Error en la respuesta del servidor:', response);
        AlertService.error(response.message || 'Error al crear la unidad en el servidor.');
      }
    } catch (error) {
      console.error('❌ [UNIDAD] Error al crear unidad:', error);
      await ErrorHandler.handleServiceError(error, 'crear la unidad');
    } finally {
      // 🔧 NUEVO: Asegurar que se desactive la preservación de posición
      setPreservePanPosition(false);
    }
  };

  const handleEditUnit = async () => {
    if (!selectedUnit || !organizacionActual) {
      AlertService.error('No se puede editar la unidad. Información no disponible.');
      return;
    }

    try {
      // 🔧 NUEVO: Validación de jerarquía en el frontend
      if (unitForm.unidadPadreId && unitForm.tipoUnidad) {
        const tipoUnidadActual = Number(unitForm.tipoUnidad);
        const unidadPadre = unidades.find(u => u.unidadesOrgId === unitForm.unidadPadreId);
        
        if (unidadPadre && tipoUnidadActual <= unidadPadre.tipoUnidad) {
          AlertService.error(`No se puede hacer que una unidad de tipo "${getTipoUnidadTexto(tipoUnidadActual)}" sea hija de una unidad de tipo "${getTipoUnidadTexto(unidadPadre.tipoUnidad)}". La jerarquía organizacional debe respetarse.`);
          return;
        }
      }
      
      // 🔧 NUEVO: Preservar la posición actual del organigrama
      setPreservePanPosition(true);
      setLastPanState({ ...panState });
      
      // Construir el comando de actualización
      const updateCommand: UpdateUnidadOrgCommand = {
        unidadesOrgId: selectedUnit.unidadesOrgId,
        organizacionId: organizacionActual.organizacionId,
        sedeId: unitForm.sedeId,
        unidadPadreId: unitForm.unidadPadreId,
        tipoUnidad: Number(unitForm.tipoUnidad), // 🔧 FIX: Convertir a número explícitamente
        nombre: unitForm.nombre,
        nombreCorto: unitForm.nombreCorto || null,
        objetivo: unitForm.objetivo || null,
        
        // Flags de control de actualización
        actualizarOrganizacion: false, // No cambiaremos la organización
        actualizarUnidadPadre: true,
        actualizarTipo: true,
        actualizarInformacionBasica: true,
        actualizarObjetivo: true,
        actualizarCentroCosto: false,
        validarJerarquia: true,
        permitirCambioOrganizacion: false,
        
        actualizadoPor: user?.personaId || null,
        motivoModificacion: 'Actualización desde gestión organizacional'
      };
      // Llamar al servicio del backend
      const response = await unidadesOrgService.updateUnidadOrg(selectedUnit.unidadesOrgId, updateCommand);
      if (response.success && response.data) {
        // Actualizar la unidad en el estado local de manera optimizada
        const updatedUnit = {
          ...selectedUnit,
          nombre: unitForm.nombre,
          nombreCorto: unitForm.nombreCorto,
          tipoUnidad: unitForm.tipoUnidad, // Ya es un número del enum
          objetivo: unitForm.objetivo,
          sedeId: unitForm.sedeId,
          unidadPadreId: unitForm.unidadPadreId,
          version: (selectedUnit.version || 0) + 1,
          fechaActualizacion: new Date().toISOString()
        };
        // 🔧 OPTIMIZADO: Actualizar estado sin causar re-renderizado completo
        setUnidades(prev => {
          const newUnidades = prev.map(u => 
            u.unidadesOrgId === selectedUnit.unidadesOrgId ? updatedUnit : u
          );
          return newUnidades;
        });
        
        // Limpiar formulario y estados
        setUnitForm({
          nombre: '',
          nombreCorto: '',
          tipoUnidad: TipoUnidad.GERENCIA, // Usar el enum en lugar de string
          objetivo: '',
          unidadPadreId: null,
          sedeId: null
        });
        setSelectedUnit(null);
        setIsEditMode(false);
        setShowUnitModal(false);
        
        // 🔧 NUEVO: Restaurar la posición del organigrama después de un breve delay
        setTimeout(() => {
          if (preservePanPosition && lastPanState) {
            setPanState(lastPanState);
            setPreservePanPosition(false);
          }
        }, 100);
        
        AlertService.success(`Unidad "${updatedUnit.nombre}" actualizada exitosamente en el servidor.`);
      } else {
        console.error('❌ [UNIDAD] Error en la respuesta del servidor:', response);
        AlertService.error(response.message || 'Error al actualizar la unidad en el servidor.');
      }
    } catch (error) {
      console.error('❌ [UNIDAD] Error al actualizar unidad:', error);
      await ErrorHandler.handleServiceError(error, 'actualizar la unidad');
    } finally {
      // 🔧 NUEVO: Asegurar que se desactive la preservación de posición
      setPreservePanPosition(false);
    }
  };

  const handleUnitCardClick = (unidad: any) => {
    // Solo permitir edición en modo build
    if (currentMode !== 'build') return;
    // Poblar formulario con datos existentes
    const formData = {
      nombre: unidad.nombre,
      nombreCorto: unidad.nombreCorto || '',
      tipoUnidad: Number(unidad.tipoUnidad), // 🔧 FIX: Convertir a número explícitamente
      objetivo: unidad.objetivo || '',
      unidadPadreId: unidad.unidadPadreId,
      sedeId: unidad.sedeId || null
    };
    setUnitForm(formData);
    setSelectedUnit(unidad);
    setIsEditMode(true);
    setShowUnitModal(true);
  };

  const handleCreatePosition = () => {
    if (!selectedUnit) return;

    // 🔧 NUEVO: Preservar la posición actual del organigrama
    setPreservePanPosition(true);
    setLastPanState({ ...panState });

    const newPosition = {
      posicionId: Date.now(),
      unidadesOrgId: selectedUnit.unidadesOrgId,
      nombre: positionForm.nombre,
      categoria: positionForm.categoria,
      objetivo: positionForm.objetivo,
      ordenImpresion: positionForm.ordenImpresion,
      estado: 'ACTIVO',
      version: 1
    };

    // 🔧 OPTIMIZADO: Actualizar estado sin causar re-renderizado completo
    setPosiciones(prev => {
      const newPosiciones = [...prev, newPosition];
      return newPosiciones;
    });
    
    setPositionForm({
      nombre: '',
      categoria: 'GERENCIAL',
      objetivo: '',
      ordenImpresion: 1
    });
    setShowPositionModal(false);
    
    // 🔧 NUEVO: Restaurar la posición del organigrama después de un breve delay
    setTimeout(() => {
      if (preservePanPosition && lastPanState) {
        setPanState(lastPanState);
        setPreservePanPosition(false);
      }
    }, 100);
  };

  const handleRemoveAssignment = async (posicionId: number) => {
    // 🔧 NUEVO: Preservar la posición actual del organigrama
    setPreservePanPosition(true);
    setLastPanState({ ...panState });
    
    setIsAssigningPerson(true);
    
    try {
      // Buscar la asignación actual para esta posición
      const currentAssignment = personaPosiciones.find(pp => pp.posicionId === posicionId);
      
      // 🔧 SIMPLIFICADO: Usar fecha actual (sin conflictos)
      const fechaInicio = new Date().toISOString().split('T')[0];
      
      if (currentAssignment) {
        // Usar DELETE con finalizarEnLugarDeEliminar = true y forceDelete = true para evitar conflictos de concurrencia
        const deleteResponse = await personaPosicionService.deletePersonaPosicion(
          currentAssignment.personaId, 
          posicionId, 
          {
            finalizarEnLugarDeEliminar: true,
            forceDelete: true, // 🔧 AGREGADO: Forzar eliminación para dejar vacante
            fechaFinalizacion: fechaInicio, // 🔧 SIMPLIFICADO: Usar fecha actual
            motivo: `Posición dejada vacante por el usuario - Finalizada el ${fechaInicio}`
          }
        );
        
        if (!deleteResponse.success) {
          throw new Error(`Error al finalizar asignación: ${deleteResponse.message}`);
        }
      }
      
      // 🔧 OPTIMIZADO: Actualizar estado sin causar re-renderizado completo
      setPersonaPosiciones(prev => prev.filter(pp => pp.posicionId !== posicionId));
      setShowAssignModal(false);
      
      // 🔧 NUEVO: Restaurar la posición del organigrama después de un breve delay
      setTimeout(() => {
        if (preservePanPosition && lastPanState) {
          setPanState(lastPanState);
          setPreservePanPosition(false);
        }
      }, 100);
      
      AlertService.success('Posición dejada vacante exitosamente');
      
    } catch (error) {
      console.error('❌ [REMOVER ASIGNACIÓN] Error:', error);
      AlertService.error(`Error al dejar vacante la posición: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsAssigningPerson(false);
      // 🔧 NUEVO: Asegurar que se desactive la preservación de posición
      setPreservePanPosition(false);
    }
  };

  const handleAssignPerson = async (posicionId: number, personaId: string) => {
    // 🔧 NUEVO: Preservar la posición actual del organigrama
    setPreservePanPosition(true);
    setLastPanState({ ...panState });
    
    setIsAssigningPerson(true);
    
    try {
      const personaIdInt = parseInt(personaId);
      
      // 🔧 AGREGADO: Debug de IDs para verificar mapeo correcto
      // 🔧 SIMPLIFICADO: Usar fecha actual para todo (sin conflictos)
      const fechaInicio = new Date().toISOString().split('T')[0];
      // 1. Finalizar asignación actual de la posición (si existe)
      const existingAssignment = personaPosiciones.find(pp => pp.posicionId === posicionId);
      if (existingAssignment) {
        // Usar DELETE con finalizarEnLugarDeEliminar = true y forceDelete = true para evitar conflictos de concurrencia
        const deleteResponse = await personaPosicionService.deletePersonaPosicion(
          existingAssignment.personaId, 
          posicionId, 
          {
            finalizarEnLugarDeEliminar: true,
            forceDelete: true, // 🔧 AGREGADO: Forzar eliminación para reasignaciones
            fechaFinalizacion: fechaInicio, // 🔧 SIMPLIFICADO: Usar fecha actual
            motivo: `Reasignación a nueva persona (ID: ${personaIdInt}) - Finalizada el ${fechaInicio}`
          }
        );
        
        if (!deleteResponse.success) {
          throw new Error(`Error al finalizar asignación actual: ${deleteResponse.message}`);
        }
      }
      
      // 2. Crear nueva asignación
      const createCommand: CreatePersonaPosicionCommand = {
        PersonaId: personaIdInt,
        PosicionId: posicionId,
        FechaInicio: fechaInicio
      };
      
      // 🔧 AGREGADO: Debug para verificar comando enviado
      const createResponse = await personaPosicionService.createPersonaPosicion(createCommand);
      
      if (!createResponse.success) {
        throw new Error(`Error al crear asignación: ${createResponse.message}`);
      }
      
      // 3. Si la persona ya está asignada a otra posición, finalizar esa asignación
      const currentAssignment = personaPosiciones.find(pp => pp.personaId === personaIdInt);
      if (currentAssignment && currentAssignment.posicionId !== posicionId) {
        // Usar DELETE con finalizarEnLugarDeEliminar = true y forceDelete = true para evitar conflictos de concurrencia
        const deletePersonResponse = await personaPosicionService.deletePersonaPosicion(
          personaIdInt, 
          currentAssignment.posicionId, 
          {
            finalizarEnLugarDeEliminar: true,
            forceDelete: true, // 🔧 AGREGADO: Forzar eliminación para reasignaciones
            fechaFinalizacion: fechaInicio, // 🔧 SIMPLIFICADO: Usar fecha actual
            motivo: `Reasignación a nueva posición (ID: ${posicionId}) - Finalizada el ${fechaInicio}`
          }
        );
        
        if (!deletePersonResponse.success) {
          console.warn('⚠️ [ASIGNAR PERSONA] No se pudo finalizar la asignación anterior de la persona:', deletePersonResponse.message);
        }
      }
      
      // 4. 🔧 OPTIMIZADO: Actualizar estado sin causar re-renderizado completo
      setPersonaPosiciones(prev => {
        // Remover asignación anterior de esta posición
        let updated = prev.filter(pp => pp.posicionId !== posicionId);
        
        // Remover asignación anterior de la persona (si existe)
        updated = updated.filter(pp => pp.personaId !== personaIdInt);
        
        // Agregar nueva asignación
        const newAssignment = {
          personaId: personaIdInt,
          posicionId: posicionId,
          fechaInicio: fechaInicio,
          fechaFin: null,
          estado: 'ACTIVO',
          version: 1
        };
        updated.push(newAssignment);
        return updated;
      });
      
      setShowAssignModal(false);
      
      // 🔧 NUEVO: Restaurar la posición del organigrama después de un breve delay
      setTimeout(() => {
        if (preservePanPosition && lastPanState) {
          setPanState(lastPanState);
          setPreservePanPosition(false);
        }
      }, 100);
      
      // Mostrar mensaje informativo
      const persona = personas.find(p => p.personaId === personaIdInt);
      if (persona) {
        AlertService.success(`Persona asignada exitosamente: ${persona.nombres} ${persona.apellidoPaterno}`);
      }
      
    } catch (error) {
      console.error('❌ [ASIGNAR PERSONA] Error:', error);
      AlertService.error(`Error al asignar persona: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsAssigningPerson(false);
      // 🔧 NUEVO: Asegurar que se desactive la preservación de posición
      setPreservePanPosition(false);
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    const confirmed = await AlertService.confirm('¿Eliminar esta unidad y todas sus posiciones?', {
      title: 'Confirmar eliminación',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    
    if (confirmed) {
      // 🔧 NUEVO: Preservar la posición actual del organigrama
      setPreservePanPosition(true);
      setLastPanState({ ...panState });
      
      // Eliminar posiciones de la unidad
      setPosiciones(prev => prev.filter(p => p.unidadesOrgId !== unitId));
      // Eliminar unidades hijas
      const getChildUnits = (parentId: number) => {
        return unidades.filter(u => u.unidadPadreId === parentId);
      };
      const deleteRecursive = (unitId: number) => {
        const children = getChildUnits(unitId);
        children.forEach(child => {
          setPosiciones(prev => prev.filter(p => p.unidadesOrgId !== child.unidadesOrgId));
          deleteRecursive(child.unidadesOrgId);
        });
      };
      deleteRecursive(unitId);
      // Eliminar la unidad
      setUnidades(prev => prev.filter(u => u.unidadesOrgId !== unitId));
      
      // 🔧 NUEVO: Restaurar la posición del organigrama después de un breve delay
      setTimeout(() => {
        if (preservePanPosition && lastPanState) {
          setPanState(lastPanState);
          setPreservePanPosition(false);
        }
      }, 100);
      
      AlertService.success('Unidad eliminada exitosamente');
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    const confirmed = await AlertService.confirm('¿Eliminar esta posición?', {
      title: 'Confirmar eliminación',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    
    if (confirmed) {
      // 🔧 NUEVO: Preservar la posición actual del organigrama
      setPreservePanPosition(true);
      setLastPanState({ ...panState });
      
      setPosiciones(prev => prev.filter(p => p.posicionId !== positionId));
      setPersonaPosiciones(prev => prev.filter(pp => pp.posicionId !== positionId));
      
      // 🔧 NUEVO: Restaurar la posición del organigrama después de un breve delay
      setTimeout(() => {
        if (preservePanPosition && lastPanState) {
          setPanState(lastPanState);
          setPreservePanPosition(false);
        }
      }, 100);
      
      AlertService.success('Posición eliminada exitosamente');
    }
  };

  // Funciones utilitarias
  const buildHierarchy = useCallback(() => {
    const unidadesMap = new Map();
    const hierarchy: any[] = [];

    // Helper: obtener cadena de padres, preservando jerarquía en filtros
    const getAllParentUnits = (unitId: number, visited = new Set()): number[] => {
      if (visited.has(unitId)) return [];
      visited.add(unitId);
      const unit = unidades.find(u => u.unidadesOrgId === unitId);
      if (!unit || unit.unidadPadreId == null) return [unitId];
      return [...getAllParentUnits(unit.unidadPadreId, visited), unitId];
    };

    // NUEVO: Helper para obtener todos los descendientes de una unidad (subárbol completo)
    const getAllDescendantUnits = (unitId: number, visited = new Set<number>()): number[] => {
      if (visited.has(unitId)) return [];
      visited.add(unitId);
      const directChildren = unidades
        .filter(u => u.unidadPadreId === unitId)
        .map(u => u.unidadesOrgId);
      const allDescendants = directChildren.flatMap(childId => getAllDescendantUnits(childId, visited));
      return [unitId, ...directChildren, ...allDescendants];
    };

    // Universo base considerando filtros
    let universe: any[];
    if (isFilterActive && filteredUnits.size > 0) {
      const necessaryUnitIds = new Set<number>();
      filteredUnits.forEach(id => necessaryUnitIds.add(id));
      filteredUnits.forEach(id => getAllParentUnits(id).forEach(p => necessaryUnitIds.add(p)));
      // Incluir descendientes para que se dibujen los hijos correctamente en el organigrama
      filteredUnits.forEach(id => getAllDescendantUnits(id).forEach(d => necessaryUnitIds.add(d)));
      universe = unidades.filter(u => necessaryUnitIds.has(u.unidadesOrgId));
    } else {
      universe = unidades;
    }

    // Sólo unidades activas
    const unidadesToUse = universe.filter(u => (
      u?.estado === 'ACTIVO' || u?.estado === 1 || u?.estado === true || u?.estado === '1'
    ));

    // Ranking de categoría flexible (numérico o string)
    const catRank = (cat: any) => {
      if (typeof cat === 'number') return cat;
      if (cat == null) return 999;
      const c = String(cat).toUpperCase();
      const map: Record<string, number> = {
        DIRECTIVA: 1, DIRECTIVO: 1,
        GERENCIAL: 2, GERENTE: 2,
        JEFATURA: 3, JEFE: 3,
        COORDINACION: 4, COORDINADOR: 4,
        ESPECIALISTA: 5,
        TECNICO: 6, 'TÉCNICO': 6,
        ANALISTA: 7,
        OPERATIVO: 8,
        APOYO: 9,
        EXTERNO: 10
      };
      return map[c] ?? 999;
    };

    // Construir mapa con posiciones activas ordenadas
    unidadesToUse.forEach(unidad => {
      const isDirectlyFiltered = filteredUnits.has(unidad.unidadesOrgId);
      const isParentOfFiltered = isFilterActive && filteredUnits.size > 0 && !isDirectlyFiltered;

      const posicionesDeUnidad = posiciones
        .filter(p => (
          p.unidadesOrgId === unidad.unidadesOrgId &&
          (p?.estado === 'ACTIVO' || p?.estado === 1 || p?.estado === true || p?.estado === '1')
        ))
        .slice()
        .sort((a: any, b: any) => {
          // Priorizar el orden proveniente del backend si existe
          const oa = typeof a.ordenImpresion === 'number' ? a.ordenImpresion : parseInt(String(a.ordenImpresion ?? NaN), 10);
          const ob = typeof b.ordenImpresion === 'number' ? b.ordenImpresion : parseInt(String(b.ordenImpresion ?? NaN), 10);
          if (!Number.isNaN(oa) && !Number.isNaN(ob) && oa !== ob) return oa - ob;
          if (!Number.isNaN(oa) && Number.isNaN(ob)) return -1;
          if (Number.isNaN(oa) && !Number.isNaN(ob)) return 1;

          // Fallback: categoría y nombre
          const ra = catRank(a.categoria);
          const rb = catRank(b.categoria);
          if (ra !== rb) return ra - rb;
          return String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es', { sensitivity: 'base' });
        });

      unidadesMap.set(unidad.unidadesOrgId, {
        ...unidad,
        children: [],
        posiciones: posicionesDeUnidad,
        // Metadatos para el filtrado
        isDirectlyFiltered,
        isParentOfFiltered,
        // Tamaño del subárbol (se actualizará luego)
        subtreeSize: 1
      });
    });

    // Enlazar hijos con padres; si el padre no existe en el universo, considerar raíz
    unidadesToUse.forEach(unidad => {
      const unidadConDatos = unidadesMap.get(unidad.unidadesOrgId);
      const padre = unidad.unidadPadreId != null ? unidadesMap.get(unidad.unidadPadreId) : null;
      if (padre) {
        padre.children.push(unidadConDatos);
      } else {
        hierarchy.push(unidadConDatos);
      }
    });

    // Orden por ID de backend para respetar jerarquía natural (id/idPadre)
    const sortNodes = (a: any, b: any) => {
      // Usar unidadesOrgId si existe; fallback a id
      const idA = typeof (a.unidadesOrgId ?? a.id) === 'string'
        ? parseInt(String(a.unidadesOrgId ?? a.id), 10)
        : Number(a.unidadesOrgId ?? a.id ?? NaN);
      const idB = typeof (b.unidadesOrgId ?? b.id) === 'string'
        ? parseInt(String(b.unidadesOrgId ?? b.id), 10)
        : Number(b.unidadesOrgId ?? b.id ?? NaN);

      if (!Number.isNaN(idA) && !Number.isNaN(idB) && idA !== idB) return idA - idB;

      // Fallback: nombre para estabilidad visual cuando IDs sean iguales/indefinidos
      return String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es', { sensitivity: 'base' });
    };

    const sortTree = (node: any) => {
      if (!node?.children) return;
      node.children.sort(sortNodes);
      node.children.forEach((child: any) => sortTree(child));
    };

    hierarchy.sort(sortNodes);
    hierarchy.forEach(n => sortTree(n));

    // Calcular tamaño del subárbol para cada nodo (número de hojas bajo cada rama)
    const computeSubtreeSize = (node: any): number => {
      if (!node || !Array.isArray(node.children) || node.children.length === 0) {
        node.subtreeSize = 1;
        return node.subtreeSize;
      }
      const total = node.children.reduce((acc: number, child: any) => acc + computeSubtreeSize(child), 0);
      node.subtreeSize = Math.max(1, total);
      return node.subtreeSize;
    };
    hierarchy.forEach(root => computeSubtreeSize(root));

    return hierarchy;
  }, [unidades, posiciones, isFilterActive, filteredUnits]);

  // Funciones de filtrado
  const handleFilterUnits = (unitIds: Set<number>) => {
    setFilteredUnits(unitIds);
    setIsFilterActive(unitIds.size > 0);
  };

  const handleClearFilters = () => {
    setFilteredUnits(new Set());
    setIsFilterActive(false);
  };

  const getPersonaByPosicion = (posicionId: number) => {
    const assignment = personaPosiciones.find(pp => pp.posicionId === posicionId);
    return assignment ? personas.find(p => p.personaId === assignment.personaId) : null;
  };

  // Nuevo: obtener todas las personas asignadas a una posición (activas)
  const getPersonasByPosicion = (posicionId: number) => {
    const assignments = personaPosiciones.filter(pp => pp.posicionId === posicionId && !pp.fechaFin);
    return assignments
      .map(pp => personas.find(p => p.personaId === pp.personaId))
      .filter((p): p is NonNullable<typeof personas[number]> => Boolean(p));
  };

  const getAvailableParentUnits = () => {
    // Obtener el tipo de unidad actual si estamos editando
    const tipoUnidadActual = selectedUnit ? Number(selectedUnit.tipoUnidad) : null;
    
    // Filtrar unidades activas, excluir la unidad actual si estamos editando,
    // y aplicar filtro de jerarquía si estamos editando
    return unidades.filter(u => {
      // Unidad debe estar activa
      if (u.estado !== 'ACTIVO') return false;
      
      // Excluir la unidad actual si estamos editando
      if (selectedUnit && u.unidadesOrgId === selectedUnit.unidadesOrgId) return false;
      
      // 🔧 NUEVO: Aplicar filtro de jerarquía si estamos editando
      if (tipoUnidadActual && u.tipoUnidad >= tipoUnidadActual) {
        return false; // No mostrar unidades de tipo igual o superior
      }
      
      return true;
    });
  };

  // Función para verificar si las acciones de una unidad están ocultas
  const areUnitActionsHidden = (unitId: number) => {
    return hiddenUnitActions.has(unitId);
  };

  // Funciones para mostrar/ocultar todas las acciones
  const hideAllUnitActions = () => {
    const allUnitIds = new Set(unidades.map(u => u.unidadesOrgId));
    setHiddenUnitActions(allUnitIds);
  };

  const showAllUnitActions = () => {
    setHiddenUnitActions(new Set());
  };

  // Funciones para mostrar/ocultar todas las acciones de posiciones
  const hideAllPositionActions = () => {
    const allPositionIds = new Set(posiciones.map(p => p.posicionId));
    setHiddenPositionActions(allPositionIds);
  };

  const showAllPositionActions = () => {
    setHiddenPositionActions(new Set());
  };

  // Función para verificar si las acciones de una posición están ocultas
  const arePositionActionsHidden = (positionId: number) => {
    return hiddenPositionActions.has(positionId);
  };

  // Atajos de teclado para navegación
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar si el usuario está escribiendo en un input, textarea o elemento editable
      const target = e.target as HTMLElement;
      const isEditableElement = target.tagName === 'INPUT' || 
                               target.tagName === 'TEXTAREA' || 
                               target.tagName === 'SELECT' ||
                               target.isContentEditable ||
                               target.getAttribute('contenteditable') === 'true' ||
                               target.getAttribute('role') === 'textbox' ||
                               target.closest('input, textarea, [contenteditable="true"], [role="textbox"]') !== null;
      
      // Si el usuario está escribiendo en un elemento editable, no ejecutar atajos
      if (isEditableElement) {
        return;
      }
      
      // Abrir panel de navegación con tecla N
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowNavigationPanel(prev => !prev);
      }
      
      // Abrir panel de exportación con tecla E
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setShowExportPanel(prev => !prev);
      }
      
      // Mostrar todas las acciones con tecla S (Show)
      if ((e.key === 's' || e.key === 'S') && currentMode === 'build' && unidades.length > 0) {
        e.preventDefault();
        showAllUnitActions();
      }
      
      // Ocultar todas las acciones con tecla D (Hide)
      if ((e.key === 'd' || e.key === 'D') && currentMode === 'build' && unidades.length > 0) {
        e.preventDefault();
        hideAllUnitActions();
      }
      
      // Mostrar todas las acciones de posiciones con tecla P (Positions Show)
      if ((e.key === 'p' || e.key === 'P') && currentMode === 'build' && posiciones.length > 0) {
        e.preventDefault();
        showAllPositionActions();
      }
      
      // Ocultar todas las acciones de posiciones con tecla O (pOsitions Hide)
      if ((e.key === 'o' || e.key === 'O') && currentMode === 'build' && posiciones.length > 0) {
        e.preventDefault();
        hideAllPositionActions();
      }
      
      // Alternar vista de solo posiciones con tecla V (View)
      if ((e.key === 'v' || e.key === 'V') && unidades.length > 0 && posiciones.length > 0) {
        e.preventDefault();
        setShowOnlyPositions(prev => !prev);
      }
      
      // Limpiar filtros con tecla C (Clear)
      if ((e.key === 'c' || e.key === 'C') && isFilterActive && filteredUnits.size > 0) {
        e.preventDefault();
        handleClearFilters();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, unidades.length, posiciones.length, showAllUnitActions, hideAllUnitActions, showAllPositionActions, hideAllPositionActions]);

  // Función auxiliar para calcular posiciones de conectores con precisión matemática
  const calculateConnectorPositions = (items: any[]) => {
    if (items.length === 0) return { hasItems: false };
    if (items.length === 1) return { hasItems: true, single: true };
    
    // Si los elementos tienen subtreeSize, distribuir por pesos
    const hasWeights = items.some((it: any) => typeof it?.subtreeSize === 'number' && it.subtreeSize > 0);
    if (hasWeights) {
      const weights = items.map((it: any) => Math.max(1, Number(it?.subtreeSize ?? 1)));
      const total = weights.reduce((a: number, b: number) => a + b, 0);
      let acc = 0;
      const positions = weights.map((w: number) => {
        const center = ((acc + w / 2) / total) * 100;
        acc += w;
        return center;
      });
      const leftPosition = (weights[0] / 2) / total * 100;
      const rightPosition = 100 - (weights[weights.length - 1] / 2) / total * 100;
      const lineWidth = rightPosition - leftPosition;
      
      return {
        hasItems: true,
        single: false,
        count: items.length,
        positions,
        leftPosition,
        rightPosition,
        lineWidth,
        lineLeft: leftPosition,
        lineStyle: {
          left: `${leftPosition}%`,
          width: `${lineWidth}%`
        }
      };
    }
    
    // Fallback: distribución equitativa
    const positions = items.map((_: any, index: number) => {
      const elementCenter = ((index * 2) + 1) / (items.length * 2) * 100;
      return elementCenter;
    });
    const leftPosition = positions[0];
    const rightPosition = positions[positions.length - 1];
    const lineWidth = rightPosition - leftPosition;
    
    return {
      hasItems: true,
      single: false,
      count: items.length,
      positions,
      leftPosition,
      rightPosition,
      lineWidth,
      lineLeft: leftPosition,
      lineStyle: {
        left: `${leftPosition}%`,
        width: `${lineWidth}%`
      }
    };
  };

  // Función para cargar datos desde Excel
  const handleLoadMassiveData = async (data: ParsedOrganizationalData) => {
    try {
      // Cargar unidades
      setUnidades(data.unidades);
      
      // Cargar posiciones
      setPosiciones(data.posiciones);
      
      // Cargar personas
      setPersonas(data.personas);
      
      // Cargar asignaciones persona-posición
      setPersonaPosiciones(data.personaPosiciones);
      
      // 🎯 FIX: Centrado automático después de carga masiva local
      setTimeout(() => {
        fitToScreen();
      }, 300);
      
      // Mostrar mensaje de éxito
      AlertService.success(
        `¡Carga masiva exitosa! Se cargaron ${data.unidades.length} unidades, ${data.posiciones.length} posiciones, ${data.personas.length} personas y ${data.personaPosiciones.length} asignaciones de personal.`
      );
      
      // Después de la carga masiva exitosa, cargar automáticamente desde la API
      if (organizationInfo.hasOrganization && organizationInfo.id) {
        // Mostrar mensaje informativo
        AlertService.info('Refrescando organigrama desde el servidor...');
        
        // Ejecutar carga desde API automáticamente
        const estructuraCargada = await cargarEstructuraDesdeAPI(organizationInfo.id as number);
        
        if (estructuraCargada) {
          AlertService.success('¡Organigrama actualizado exitosamente desde el servidor!');
        } else {
          AlertService.warning('Carga masiva completada. No se pudo sincronizar con el servidor, pero los datos locales están cargados.');
        }
      } else {
      }
      
    } catch (error) {
      console.error('Error al cargar datos masivos:', error);
      AlertService.error(
        'Error en la carga masiva. Ocurrió un error al procesar los datos. Por favor, verifica el formato del archivo e intenta nuevamente.'
      );
    }
  };

  // 🔧 AGREGADO: Helper para limpiar file upload del modal CargaMasiva
  const triggerCargaMasivaReset = () => {
    setCargaMasivaResetTrigger(prev => prev + 1);
  };

  // 🔧 AGREGADO: Función para cerrar modal de carga masiva con limpieza
  const handleCloseCargaMasiva = () => {
    // Limpiar file upload antes de cerrar
    triggerCargaMasivaReset();
    
    // Cerrar modal
    setShowCargaMasiva(false);
  };

  const handleClearData = async () => {
    const confirmed = await AlertService.confirm(
      'Esta acción solo limpiará la vista actual. Los datos del servidor no se modificarán y seguirán disponibles al usar "Ver Organigrama".', 
      {
        title: 'Confirmar Limpieza de Vista',
        confirmText: 'Limpiar Vista',
        cancelText: 'Cancelar'
      }
    );
    
    if (confirmed) {
      setUnidades([]);
      setPosiciones([]);
      setPersonas([]);
      setPersonaPosiciones([]);
      
      // 🔧 AGREGADO: Limpiar file upload del modal
      triggerCargaMasivaReset();
      
      AlertService.success('Vista limpiada exitosamente.');
    }
  };

  const handleDeleteEstructuraOrganizacional = async () => {
    if (!organizacionActual?.organizacionId) {
      AlertService.error('No se puede eliminar: ID de organización no disponible');
      return;
    }

    const confirmed = await AlertService.confirm(
      `Esta acción eliminará completamente la estructura organizacional de "${organizacionActual.razonSocial}".

Se eliminarán todas las unidades, posiciones y asignaciones de personas de forma permanente en el servidor.

Esta acción no se puede deshacer.`,
      {
        title: 'Eliminar Estructura Organizacional',
        confirmText: 'Eliminar Todo',
        cancelText: 'Cancelar'
      }
    );

    if (!confirmed) {
      return;
    }

    try {
      // Llamar al servicio con los parámetros requeridos por el API
      const response = await organizacionesService.deleteEstructuraOrganizacional(
        organizacionActual.organizacionId, 
        true, // confirmarEliminacionFisica
        'ELIMINAR_ESTRUCTURA_FISICA' // textoConfirmacion requerido por el API
      );
      
      if (response.success && response.data) {
        // Limpiar todos los estados locales
        setUnidades([]);
        setPosiciones([]);
        setPersonaPosiciones([]);
        
        // 🔧 AGREGADO: Limpiar file upload del modal
        triggerCargaMasivaReset();
        
        AlertService.success(`Estructura organizacional de "${organizacionActual.razonSocial}" eliminada exitosamente del servidor. El organigrama está ahora vacío.`);
        
      } else {
        throw new Error(response.message || 'Error desconocido al eliminar la estructura');
      }
      
    } catch (error) {
      console.error('❌ [DELETE ESTRUCTURA] Error al eliminar estructura:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      AlertService.error(`No se pudo eliminar la estructura organizacional: ${errorMessage}`);
    }
  };

// Preparar datos para exportación (respetando filtros activos)
const getExportData = (): OrganizationalData => {
  if (isFilterActive && filteredUnits.size > 0) {
    // Exportar solo las unidades filtradas y sus datos relacionados
    const filteredUnidadesData = unidades.filter(unidad => filteredUnits.has(unidad.unidadesOrgId));
    const filteredPosicionesData = posiciones.filter(posicion => filteredUnits.has(posicion.unidadesOrgId));
    const filteredPersonaPosicionesData = personaPosiciones.filter(pp => {
      const posicion = posiciones.find(p => p.posicionId === pp.posicionId);
      return posicion && filteredUnits.has(posicion.unidadesOrgId);
    });
    const filteredPersonasData = personas.filter(persona => 
      filteredPersonaPosicionesData.some(pp => pp.personaId === persona.personaId)
    );

    return {
      organizacion: organizacionActual,
      unidades: filteredUnidadesData,
      posiciones: filteredPosicionesData,
      personas: filteredPersonasData,
      personaPosiciones: filteredPersonaPosicionesData
    };
  }

  // Exportar todos los datos si no hay filtro activo
  return {
    organizacion: organizacionActual,
    unidades,
    posiciones,
    personas,
    personaPosiciones
  };
};

  // Renderizado de cards jerárquicos
  const renderPositionCard = (posicion: any, isInUnit = false) => {
    const persona = getPersonaByPosicion(posicion.posicionId);
    const isAssigned = !!persona;

    return (
      <div 
        key={posicion.posicionId}
        className={`${styles.positionCard} ${isAssigned ? styles.positionCardAssigned : styles.positionCardVacant}`}
      >
        <div className={styles.positionCardContent}>
          {/* Header con acciones */}
          <div className={styles.positionCardHeader}>
            <div className={styles.positionCardInfo}>
              <div className={styles.positionCardTitle}>
                <Briefcase className={styles.textAccent} size={12} />
                <h4 className={styles.textPrimary}>{posicion.nombre}</h4>
              </div>
              <p className={`${styles.positionCardCategory} ${styles.textSecondary}`}>
                {getCategoriaPosicionTexto(posicion.categoria)}
              </p>
            </div>
            {/* Iconos de asignar y eliminar ocultos por solicitud del usuario */}
            {/* {currentMode === 'build' && !arePositionActionsHidden(posicion.posicionId) && (
              <div className={styles.positionCardActions}>
                <button
                  onClick={() => {
                    setSelectedPosition(posicion);
                    setShowAssignModal(true);
                  }}
                  className={`${styles.positionActionButton} ${styles.textAccent}`}
                  title="Asignar persona"
                >
                  <UserPlus size={12} />
                </button>
                <button
                  onClick={() => handleDeletePosition(posicion.posicionId)}
                  className={`${styles.positionActionButton} ${styles.textDanger}`}
                  title="Eliminar posición"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )} */}
          </div>

          {/* Información de la persona */}
          {isAssigned ? (
            <div className={styles.personAssigned}>
              <div className={styles.personAvatar}>
                {persona.nombres.charAt(0)}{persona.apellidoPaterno.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className={styles.personName}>{persona.nombres}</p>
                <p className={styles.personLastName}>{persona.apellidoPaterno}</p>
              </div>
            </div>
          ) : (
            <div className={`${styles.positionVacant} ${styles.bgBackground}`}>
              <User className={`${styles.vacantIcon} ${styles.textSecondary}`} size={16} />
              <p className={`${styles.vacantText} ${styles.textSecondary}`}>
                Vacante
              </p>
              {/* Botón de asignar oculto por solicitud del usuario */}
              {/* {currentMode === 'build' && !arePositionActionsHidden(posicion.posicionId) && (
                <button
                  onClick={() => {
                    setSelectedPosition(posicion);
                    setShowAssignModal(true);
                  }}
                  className={styles.assignButton}
                >
                  Asignar
                </button>
              )} */}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUnitCard = (unidad: any, level = 0) => {
    const hasChildren = unidad.children && unidad.children.length > 0;
    const hasPositions = unidad.posiciones && unidad.posiciones.length > 0;
    const isRoot = level === 0;
    const isDirectlyFiltered = unidad.isDirectlyFiltered;
    const isParentOfFiltered = unidad.isParentOfFiltered;

    return (
      <div 
        key={unidad.unidadesOrgId} 
        id={`unit-${unidad.unidadesOrgId}`}
        className={`${styles.hierarchyContainer} ${styles[`orgLevel${Math.min(level, 3)}`]} ${styles.connectorSystem}`}
      >
        {/* Card de la unidad */}
        <div 
          className={styles.unitCard}
          onClick={() => handleUnitCardClick(unidad)}
          style={{ cursor: currentMode === 'build' ? 'pointer' : 'default' }}
          title={currentMode === 'build' ? `Clic para editar: ${unidad.nombre}` : ''}
          ref={(el) => {
            if (el) {
              // Aplicar estilo diferente según el tipo de filtrado
              if (isFilterActive && filteredUnits.size > 0) {
                if (isDirectlyFiltered) {
                  // Unidad directamente seleccionada - mantener opacidad normal
                  el.style.setProperty('opacity', '1', 'important');
                } else if (isParentOfFiltered) {
                  // Unidad padre necesaria - opacidad sutil
                  el.style.setProperty('opacity', '0.7', 'important');
                }
              } else {
                // Sin filtro - opacidad normal
                el.style.setProperty('opacity', '1', 'important');
              }
            }
          }}
        >
          <div className={styles.unitCardHeader}>
            <div className={styles.unitCardInfo}>
              <div className={styles.unitCardTitle}>
                <Building size={20} style={{ color: '#FFFFFF' }} />
                <div>
                  <h3 style={{ color: '#FFFFFF' }}>{unidad.nombre}</h3>
                  <p className={styles.unitCardType} style={{ color: '#FFFFFF', opacity: 0.9 }}>{getTipoUnidadTexto(unidad.tipoUnidad)}</p>
                </div>
              </div>
              <p className={styles.unitCardObjective} style={{ color: '#FFFFFF', opacity: 0.8 }}>{unidad.objetivo}</p>
            </div>
            

            
            {currentMode === 'build' && !areUnitActionsHidden(unidad.unidadesOrgId) && (
              <div className={styles.unitCardActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUnit(unidad);
                    setShowPositionModal(true);
                  }}
                  className={styles.unitActionButton}
                  title="Agregar posición"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUnit(unidad);
                    setUnitForm({
                      ...unitForm,
                      unidadPadreId: unidad.unidadesOrgId
                    });
                    setIsEditMode(false);
                    setShowUnitModal(true);
                  }}
                  className={styles.unitActionButton}
                  title="Agregar sub-unidad"
                >
                  <Building size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUnit(unidad.unidadesOrgId);
                  }}
                  className={`${styles.unitActionButton} ${styles.unitDeleteButton}`}
                  title="Eliminar unidad"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conector principal hacia abajo */}
        {(hasPositions || hasChildren) && (
          <div className={styles.connectorParentDown}></div>
        )}

        {/* Posiciones de la unidad */}
        {hasPositions && (
          <div className={styles.positionsRow}>
            {renderConnectors('positions', unidad.posiciones)}
            
            {unidad.posiciones.map((posicion: any) => (
              <div 
                key={posicion.posicionId} 
                id={`position-${posicion.posicionId}`}
                className={styles.positionWrapper}
              >
                <div id={`person-${getPersonaByPosicion(posicion.posicionId)?.personaId || 'vacant'}`}>
                  {renderPositionCard(posicion, true)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unidades hijas */}
        {hasChildren && (
          <div className={`${styles.childUnitsRow} ${hasChildren ? styles.connectorMultiple : ''}`}>
            {renderConnectors('units', unidad.children)}
            
            {unidad.children.map((child: any) => (
              <div 
                key={child.unidadesOrgId} 
                id={`child-unit-${child.unidadesOrgId}`}
                className={styles.childUnitWrapper}
                style={{ flexGrow: Math.max(1, Number(child?.subtreeSize ?? 1)), flexBasis: 0 }}
              >
                {renderUnitCard(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Modales
  const renderUnitModal = () => {
    if (!showUnitModal) return null;

    return (
      <Modal
        isOpen={showUnitModal}
        onClose={() => {
          setShowUnitModal(false);
          setIsEditMode(false);
          setSelectedUnit(null);
          setUnitForm({
            nombre: '',
            nombreCorto: '',
            tipoUnidad: TipoUnidad.GERENCIA,
            objetivo: '',
            unidadPadreId: null,
            sedeId: null
          });
        }}
        title={isEditMode 
          ? 'Editar Unidad' 
          : (unitForm.unidadPadreId ? 'Agregar Sub-Unidad' : 'Crear Nueva Unidad')}
        size="l"
        cancelButtonText="Cancelar"
        saveButtonText={isEditMode ? 'Actualizar Unidad' : 'Crear Unidad'}
        onCancel={() => {
          setShowUnitModal(false);
          setIsEditMode(false);
          setSelectedUnit(null);
          setUnitForm({
            nombre: '',
            nombreCorto: '',
            tipoUnidad: TipoUnidad.GERENCIA,
            objetivo: '',
            unidadPadreId: null,
            sedeId: null
          });
        }}
        onSave={isEditMode ? handleEditUnit : handleCreateUnit}
        saveDisabled={!unitForm.nombre}
      >
        <div>
          {isEditMode && selectedUnit && (
            <div className={`${styles.formInfo} ${styles.formInfoStandard}`}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                <strong>Editando:</strong> {selectedUnit.nombre}
                {selectedUnit.nombreCorto && (
                  <span className={styles.textSecondary}> ({selectedUnit.nombreCorto})</span>
                )}
              </p>
              <p className={styles.textSecondary} style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                {getTipoUnidadTexto(selectedUnit.tipoUnidad)} • ID: {selectedUnit.unidadesOrgId}
              </p>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Nombre de la Unidad *
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={unitForm.nombre}
              onChange={(e) => setUnitForm({...unitForm, nombre: e.target.value})}
              placeholder="Ej: Gerencia de Tecnología"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Nombre Corto
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={unitForm.nombreCorto}
              onChange={(e) => setUnitForm({...unitForm, nombreCorto: e.target.value})}
              placeholder="Ej: GT"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Tipo de Unidad
            </label>
            <select
              className={styles.formSelect}
              value={unitForm.tipoUnidad}
              onChange={(e) => setUnitForm({...unitForm, tipoUnidad: parseInt(e.target.value)})}
            >
              {TIPOS_UNIDAD.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Sede
            </label>
            {organizacionActual ? (
              sedes.length > 0 ? (
                <select
                  className={styles.formSelect}
                  value={unitForm.sedeId || ''}
                  onChange={(e) => setUnitForm({...unitForm, sedeId: e.target.value ? parseInt(e.target.value) : null})}
                >
                  <option value="">-- Seleccionar sede --</option>
                  {sedes.map(sede => (
                    <option key={sede.sedeId} value={sede.sedeId}>
                      {sede.ubigeo ? 
                        `${sede.nombre} - ${sede.ubigeo.includes('-') ? sede.ubigeo.split('-')[1] : sede.ubigeo}` : 
                        sede.nombre
                      }
                    </option>
                  ))}
                </select>
              ) : (
                <div 
                  className={`${styles.formInput} ${styles.textSecondary} ${styles.italic}`}
                >
                  No hay sedes disponibles para esta organización
                </div>
              )
            ) : (
              <div className={styles.formInput}>
                <span className={`${styles.textSecondary} ${styles.italic}`}>Cargando sedes...</span>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Objetivo
            </label>
            <textarea
              className={styles.formTextarea}
              value={unitForm.objetivo}
              onChange={(e) => setUnitForm({...unitForm, objetivo: e.target.value})}
              placeholder="Descripción del objetivo de la unidad"
              rows={3}
            />
          </div>

          {unidades.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Unidad Padre (Opcional)
              </label>
              <select
                className={styles.formSelect}
                value={unitForm.unidadPadreId || ''}
                onChange={(e) => setUnitForm({...unitForm, unidadPadreId: e.target.value ? parseInt(e.target.value) : null})}
              >
                <option value="">-- Sin unidad padre --</option>
                {(isEditMode ? getAvailableParentUnits() : getAvailableParentUnitsForCreation(Number(unitForm.tipoUnidad))).map(unit => (
                  <option key={unit.unidadesOrgId} value={unit.unidadesOrgId}>
                    {unit.nombre} ({getTipoUnidadTexto(unit.tipoUnidad)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Acciones movidas al footer estándar del Modal */}
      </Modal>
    );
  };

  const renderPositionModal = () => {
    if (!showPositionModal || !selectedUnit) return null;

    return (
      <Modal
        isOpen={showPositionModal}
        onClose={() => setShowPositionModal(false)}
        title="Agregar Posición"
        size="l"
        cancelButtonText="Cancelar"
        saveButtonText="Crear Posición"
        onCancel={() => setShowPositionModal(false)}
        onSave={handleCreatePosition}
        saveDisabled={!positionForm.nombre}
      >
        <div className={`${styles.formInfo} ${styles.formInfoStandard}`}>
          <p className={styles.textSecondary} style={{ margin: 0 }}>
            <strong>Unidad:</strong> {selectedUnit.nombre}
          </p>
        </div>

        <div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Nombre del Cargo *
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={positionForm.nombre}
              onChange={(e) => setPositionForm({...positionForm, nombre: e.target.value})}
              placeholder="Ej: Jefe de Desarrollo"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Categoría
            </label>
            <select
              className={styles.formSelect}
              value={positionForm.categoria}
              onChange={(e) => setPositionForm({...positionForm, categoria: e.target.value})}
            >
              {CATEGORIAS_POSICIONES.map((categoria: { value: string; label: string }) => (
                <option key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Objetivo del Cargo
            </label>
            <textarea
              className={styles.formTextarea}
              value={positionForm.objetivo}
              onChange={(e) => setPositionForm({...positionForm, objetivo: e.target.value})}
              placeholder="Descripción de las responsabilidades"
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Orden de Impresión
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className={styles.formInput}
              value={positionForm.ordenImpresion}
              onChange={(e) => setPositionForm({...positionForm, ordenImpresion: parseInt(e.target.value)})}
            />
          </div>
        </div>

        {/* Acciones movidas al footer estándar del Modal */}
      </Modal>
    );
  };

  const renderAssignModal = () => {
    if (!showAssignModal || !selectedPosition) return null;

    const currentPersona = getPersonaByPosicion(selectedPosition.posicionId);
    
    // 🔧 CORREGIDO: Solo excluir a la persona actualmente asignada a esta posición específica
    // No excluir a todas las personas asignadas a otras posiciones
    const currentPersonaId = currentPersona?.personaId;
    
    // 🔧 AGREGADO: Debug para ver qué está pasando con las personas
    const availablePersonas = personas.filter(p => 
      p.estado === 'ACTIVO' && p.personaId !== currentPersonaId
    );
    return (
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={'Asignar Persona a Posición'}
        size="l"
        hideFooter={true}
      >
        <div className={`${styles.formInfo} ${styles.formInfoStandard}`}>
          <p className={styles.textSecondary} style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>
            {selectedPosition.nombre}
          </p>
          <p className={styles.textSecondary} style={{ fontSize: '0.75rem', margin: 0 }}>
            {selectedPosition.categoria}
          </p>
        </div>

        {currentPersona && (
          <div className={`${styles.formInfo} ${styles.formInfoWarning}`}>
            <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>
              Actualmente asignado a:
            </p>
            <p style={{ margin: 0 }}>
              {currentPersona.nombres} {currentPersona.apellidoPaterno}
            </p>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Seleccionar persona:
          </label>
          <p className={styles.formHelpText}>
            💡 Puedes reasignar personas desde otras posiciones. La persona será desasignada automáticamente de su posición actual.
          </p>
          
          {/* 🔧 AGREGADO: SearchableSelect para mejor experiencia de usuario */}
          <SearchableSelect
            value={null} // Siempre null para permitir nueva selección
            onChange={async (value: string | number) => {
              if (value === 'remove') {
                // Desasignar - también guardar en base de datos
                await handleRemoveAssignment(selectedPosition.posicionId);
              } else if (value) {
                await handleAssignPerson(selectedPosition.posicionId, value.toString());
              }
            }}
            options={[
              // Opción para dejar vacante
              { value: 'remove', label: 'Dejar vacante' },
              // Opciones de personas disponibles
              ...availablePersonas.map(persona => {
                // Verificar si la persona está asignada a otra posición
                const currentAssignment = personaPosiciones.find(pp => pp.personaId === persona.personaId);
                const isAssignedElsewhere = currentAssignment && currentAssignment.posicionId !== selectedPosition.posicionId;
                
                let displayText = `${persona.nombres} ${persona.apellidoPaterno} - ${persona.nroDoc}`;
                if (isAssignedElsewhere) {
                  const currentPosition = posiciones.find(p => p.posicionId === currentAssignment.posicionId);
                  displayText += ` (Reasignar desde: ${currentPosition?.nombre || 'Posición desconocida'})`;
                }
                
                return {
                  value: persona.personaId,
                  label: displayText
                };
              })
            ]}
            placeholder={isAssigningPerson ? "Procesando asignación..." : "Buscar y seleccionar persona..."}
            noResultsText="No se encontraron personas disponibles"
            searchPlaceholder="Buscar por nombre o documento..."
            icon={User}
            disabled={isAssigningPerson}
          />
        </div>

        <div className={styles.modalActions}>
          <Button
            variant="custom"
            size="m"
            onClick={() => setShowAssignModal(false)}
            disabled={isAssigningPerson}
            backgroundColor="#6B7280"
            textColor="#FFFFFF"
            iconName="X"
            iconPosition="left"
          >
            {isAssigningPerson ? 'Procesando...' : 'Cancelar'}
          </Button>
        </div>
      </Modal>
    );
  };

  // Modal de detalle para ver tarjeta clásica de la posición
  const renderDetailModal = () => {
    if (!showDetailModal) return null;
    const positionToShow = selectedPosition || (selectedUnit ? posiciones.find(p => p.unidadesOrgId === selectedUnit.unidadesOrgId) || null : null);
    const personasAsignadas = positionToShow ? getPersonasByPosicion(positionToShow.posicionId) : [];
    const hasMultiplePeople = personasAsignadas.length > 1;
    return (
      <Modal
        title="Detalle de la posición"
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        size={hasMultiplePeople ? 'm' : 's'}
        hideFooter={true}
      >
        {positionToShow ? (
          hasMultiplePeople ? (
            <div className={`${styles.positionCard} ${styles.positionCardAssigned}`}>
              <div className={styles.positionCardContent}>
                <div className={styles.positionCardHeader}>
                  <div className={styles.positionCardInfo}>
                    <div className={styles.positionCardTitle}>
                      <Briefcase className={styles.textAccent} size={12} />
                      <h4 className={styles.textPrimary}>{positionToShow.nombre}</h4>
                    </div>
                    <p className={`${styles.positionCardCategory} ${styles.textSecondary}`}>
                      {getCategoriaPosicionTexto(positionToShow.categoria)}
                    </p>
                  </div>
                </div>
                <div className={styles.personGrid}>
                  {personasAsignadas.map((persona) => (
                    <div key={persona.personaId} className={styles.personAssigned}>
                      <div className={styles.personAvatar}>
                        {persona.nombres.charAt(0)}{persona.apellidoPaterno.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className={styles.personName}>{persona.nombres}</p>
                        <p className={styles.personLastName}>{persona.apellidoPaterno}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 360 }}>{renderPositionCard(positionToShow, true)}</div>
          )
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.textSecondary}>Esta unidad no tiene posiciones para mostrar.</p>
          </div>
        )}
      </Modal>
    );
  };

  // Renderizar conectores con precisión matemática mejorada
  const renderConnectors = (type: 'units' | 'positions', items: any[]) => {
    if (!items || items.length === 0) return null;
    
    const connectorInfo = calculateConnectorPositions(items);
    
    if (!connectorInfo.hasItems) return null;
    
    if (connectorInfo.single) {
      // Un solo elemento - no necesita conectores horizontales
      return null;
    }
    
    // Múltiples elementos - sistema de conectores precisos
    return (
      <div className={styles.connectorGroup}>
        {/* Línea horizontal principal */}
        <div 
          className={`${styles.connectorHorizontal} ${type === 'units' ? styles.connectorHorizontalUnits : styles.connectorHorizontalPositions}`}
          style={connectorInfo.lineStyle}
        ></div>
        
        {/* Conectores verticales individuales */}
        {connectorInfo.positions?.map((position: number, index: number) => (
          <div
            key={`connector-${index}`}
            className={`${styles.connectorVertical} ${type === 'units' ? styles.connectorVerticalUnits : styles.connectorVerticalPositions}`}
            style={{ 
              left: `${position}%`
            }}
          ></div>
        ))}
      </div>
    );
  };

  // Función para renderizar vista de solo posiciones manteniendo jerarquía
  const renderPositionOnlyView = (unidad: any, level = 0) => {
    const hasChildren = unidad.children && unidad.children.length > 0;
    const hasPositions = unidad.posiciones && unidad.posiciones.length > 0;
    
    return (
      <div 
        key={`positions-only-${unidad.unidadesOrgId}`}
        className={`${styles.hierarchyContainer} ${styles[`orgLevel${Math.min(level, 3)}`]} ${styles.connectorSystem}`}
      >
        {/* Solo renderizar posiciones si la unidad las tiene */}
        {hasPositions && (
          <>
            {/* Título de grupo de posiciones (basado en la unidad) */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: colors.surface,
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
              maxWidth: '320px',
              margin: '0 auto 1rem auto'
            }}>
              <h4 style={{ 
                color: colors.text, 
                margin: 0, 
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                {unidad.nombre}
              </h4>
              <p style={{ 
                color: colors.textSecondary, 
                margin: '0.25rem 0 0 0', 
                fontSize: '0.75rem',
                opacity: 0.8
              }}>
                {getTipoUnidadTexto(unidad.tipoUnidad)}
              </p>
            </div>
            
            {/* Conector hacia abajo */}
            <div className={styles.connectorParentDown}></div>
            
            {/* Posiciones de la unidad */}
            <div className={styles.positionsRow}>
              {renderConnectors('positions', unidad.posiciones)}
              
              {unidad.posiciones.map((posicion: any) => (
                <div 
                  key={posicion.posicionId} 
                  id={`position-only-${posicion.posicionId}`}
                  className={styles.positionWrapper}
                >
                  <div id={`person-only-${getPersonaByPosicion(posicion.posicionId)?.personaId || 'vacant'}`}>
                    {renderPositionCard(posicion, true)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Renderizar posiciones de unidades hijas */}
        {hasChildren && (
          <div className={`${styles.childUnitsRow} ${hasChildren ? styles.connectorMultiple : ''}`}>
            {/* Solo conectores para unidades hijas que tengan posiciones */}
            {renderConnectors('units', unidad.children.filter((child: any) => child.posiciones && child.posiciones.length > 0))}
            
            {unidad.children.map((child: any) => (
              <div 
                key={`child-positions-${child.unidadesOrgId}`} 
                id={`child-positions-${child.unidadesOrgId}`}
                className={styles.childUnitWrapper}
                style={{ flexGrow: Math.max(1, Number(child?.subtreeSize ?? 1)), flexBasis: 0 }}
              >
                {renderPositionOnlyView(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Renderizar controles de Pan y Zoom
  const renderPanControls = () => (
    <div className={styles.panControls}>
      {/* Botón de Pan */}
      <button
        onClick={() => {
          setPanMode(!isPanMode);
          // Mostrar el indicador cuando se activa el modo pan
          if (!isPanMode) {
            setShowPanIndicator(true);
          }
        }}
        className={`${styles.panButton} ${isPanMode ? styles.panButtonActive : styles.panButtonInactive}`}
        title={isPanMode ? "Desactivar modo arrastrar (H)" : "Activar modo arrastrar (H)"}
      >
        {isPanMode ? <Hand size={18} /> : <MousePointer size={18} />}
      </button>
      
      {/* Separador visual */}
      <div className={styles.panSeparator}></div>
      
      {/* Controles de Zoom */}
      <button
        onClick={zoomIn}
        disabled={panState.zoom >= 3}
        className={`${styles.panButton} ${styles.panButtonInactive}`}
        title="Acercar zoom (Ctrl + +)"
      >
        <ZoomIn size={18} />
      </button>
      
      <div className={styles.zoomIndicator}>
        {Math.round(panState.zoom * 100)}%
      </div>
      
      <button
        onClick={zoomOut}
        disabled={panState.zoom <= 0.15} // Deshabilitar cuando zoom <= 15%
        className={`${styles.panButton} ${styles.panButtonInactive}`}
        title="Alejar zoom (Ctrl + -)"
      >
        <ZoomOut size={18} />
      </button>
      
      {/* Separador visual */}
      <div className={styles.panSeparator}></div>
      
      {/* Controles de Visibilidad Global - Unidades */}
      {currentMode === 'build' && unidades.length > 0 && (
        <>
          <button
            onClick={showAllUnitActions}
            className={`${styles.panButton} ${styles.panButtonInactive}`}
            title="Mostrar todas las acciones de unidades (S)"
          >
            <Eye size={18} />
          </button>
          
          <button
            onClick={hideAllUnitActions}
            className={`${styles.panButton} ${styles.panButtonInactive}`}
            title="Ocultar todas las acciones de unidades (D)"
          >
            <EyeOff size={18} />
          </button>
          
          {/* Separador visual */}
          <div className={styles.panSeparator}></div>
        </>
      )}
      
      {/* Controles de Visibilidad Global - Posiciones */}
      {currentMode === 'build' && posiciones.length > 0 && (
        <>
          <button
            onClick={showAllPositionActions}
            className={`${styles.panButton} ${styles.panButtonInactive}`}
            title="Mostrar todas las acciones de posiciones (P)"
          >
            <UserCheck size={18} />
          </button>
          
          <button
            onClick={hideAllPositionActions}
            className={`${styles.panButton} ${styles.panButtonInactive}`}
            title="Ocultar todas las acciones de posiciones (O)"
          >
            <UserX size={18} />
          </button>
          
          {/* Separador visual */}
          <div className={styles.panSeparator}></div>
        </>
      )}
      
      {/* Control de Vista - Solo Posiciones */}
      {unidades.length > 0 && posiciones.length > 0 && (
        <>
          <button
            onClick={() => setShowOnlyPositions(!showOnlyPositions)}
            className={`${styles.panButton} ${showOnlyPositions ? styles.panButtonActive : styles.panButtonInactive}`}
            title={showOnlyPositions ? "Mostrar vista completa (unidades + posiciones) (V)" : "Mostrar solo posiciones (V)"}
          >
            {showOnlyPositions ? <Building size={18} /> : <Briefcase size={18} />}
          </button>
          
          {/* Separador visual */}
          <div className={styles.panSeparator}></div>
        </>
      )}
      
      {/* Botones de Reset */}
      <button
        onClick={fitContentToScreen}
        className={`${styles.panButton} ${styles.panButtonInactive}`}
        title="Ajustar contenido a pantalla (F)"
      >
        <Maximize size={18} />
      </button>
      
      <button
        onClick={resetZoom}
        className={`${styles.panButton} ${styles.panButtonInactive}`}
        title="Restablecer zoom (Ctrl + 0)"
      >
        <RotateCcw size={18} />
      </button>
      
      {isPanMode && (
        <button
          onClick={resetPan}
          className={`${styles.panButton} ${styles.panButtonInactive}`}
          title="Centrar vista (R)"
        >
          <Move size={18} />
        </button>
      )}
    </div>
  );

  const hierarchy = buildHierarchy();

  // Mostrar estado de carga mientras se obtiene la información de la organización
  if (isLoadingOrganization && !organizacionActual) {
    return (
      <div className={styles.orgChartContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h3 className={styles.textPrimary}>Cargando información de la organización...</h3>
          <p className={styles.textSecondary}>
            {organizationInfo.hasOrganization 
              ? `Cargando datos de ${organizationInfo.displayName}...`
              : 'Verificando datos de la organización...'
            }
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar la organización
  if (organizationError && !organizacionActual) {
    return (
      <div className={styles.orgChartContainer}>
        <div className={styles.errorContainer}>
          <Building className={styles.textSecondary} size={64} />
          <h3 className={styles.textPrimary}>Error al cargar la organización</h3>
          <p className={styles.textSecondary}>{organizationError}</p>
          <button
            onClick={() => window.location.reload()}
            className={`${styles.createUnitButton} ${styles.buttonNeutral}`}
            style={{ marginTop: '1rem' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Verificar que tengamos la información de la organización antes de renderizar
  if (!organizacionActual) {
    return (
      <div className={styles.orgChartContainer}>
        <div className={styles.errorContainer}>
          <Building className={styles.textSecondary} size={64} />
          <h3 className={styles.textPrimary}>Información de organización no disponible</h3>
          <p className={styles.textSecondary}>
            No se pudo obtener la información de la organización. Contacte al administrador.
          </p>
        </div>
      </div>
    );
  }

  const getAvailableParentUnitsForCreation = (tipoUnidad: number) => {
    // Filtrar unidades activas y aplicar filtro de jerarquía según el tipo de unidad que se está creando
    return unidades.filter(u => {
      // Unidad debe estar activa
      if (u.estado !== 'ACTIVO') return false;
      
      // 🔧 NUEVO: Aplicar filtro de jerarquía
      if (u.tipoUnidad >= tipoUnidad) {
        return false; // No mostrar unidades de tipo igual o superior
      }
      
      return true;
    });
  };

  return (
    <div className={styles.orgChartContainer}>
      {/* Header */}
      <div className={styles.orgChartHeader}>
        <div className={styles.orgChartHeaderContent}>
          <div className={styles.orgChartHeaderInfo}>
            <h1 className={styles.textPrimary}>
              <Building className={styles.textAccent} size={32} />
              Constructor de Organigrama
            </h1>
            <div>
              {user?.perfilId === 1 ? (
                // Super Admin: SearchableSelect para seleccionar organización
                <div style={{ minWidth: '300px', maxWidth: '400px' }}>
                  <SearchableSelect
                    value={organizacionActual?.organizacionId || null}
                    onChange={handleOrganizacionChange}
                    options={organizacionesDisponibles.map(org => ({
                      value: org.organizacionId,
                      label: org.razonSocial || 'Sin nombre'
                    }))}
                    placeholder="Seleccione una organización"
                    noResultsText="No hay organizaciones disponibles"
                    searchPlaceholder="Buscar organización..."
                    disabled={isLoadingOrganization}
                  />
                </div>
              ) : (
                // Otros usuarios: mostrar organización actual como texto
                <p className={styles.textSecondary} style={{ margin: '0.25rem 0 0 0' }}>
                  {organizacionActual?.razonSocial}
                </p>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className={styles.orgChartStats}>
              {isFilterActive && filteredUnits.size > 0 ? (
                <span className={styles.statValue}>
                  {filteredUnits.size} de {unidades.length} unidades | {posiciones.filter(p => 
                    unidades.some(u => filteredUnits.has(u.unidadesOrgId) && u.unidadesOrgId === p.unidadesOrgId)
                  ).length} posiciones
                </span>
              ) : (
                <span className={styles.statValue}>
                  {unidades.length} unidades | {posiciones.length} posiciones | {personas.length} personas
                </span>
              )}
              {showOnlyPositions && (
                <span className={styles.viewModePill}>
                  • Vista: Solo Posiciones
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {organizationInfo.hasOrganization && organizationInfo.id && (
                    <button
                      onClick={async () => {
                        setShouldLoadFromAPI(true);
                        setIsLoadingOrganization(true);
                        const estructuraCargada = await cargarEstructuraDesdeAPI(organizationInfo.id as number);
                        if (!estructuraCargada) {
                          AlertService.warning('No se encontró estructura organizacional en el servidor para esta empresa');
                        }
                        setIsLoadingOrganization(false);
                      }}
                      className={styles.createUnitButton}
                      title="Ver organigrama desde el servidor"
                      disabled={isLoadingOrganization}
                      ref={(el) => {
                        if (el) {
                          // Usar estilos por variables (evitar forzar fondo plano)
                          el.style.removeProperty('background-color');
                          el.style.removeProperty('border-color');
                          el.style.removeProperty('color');
                        }
                      }}
                    >
                      <Building size={20} />
                      {isLoadingOrganization ? 'Cargando...' : 'Ver Organigrama'}
                    </button>
                  )}
                  
                  {user?.perfilId !== 1 && (
                    <button
                      onClick={() => setShowCargaMasiva(true)}
                      className={styles.createUnitButton}
                      title="Cargar estructura desde Excel"
                      ref={(el) => {
                        if (el) {
                          el.style.removeProperty('background-color');
                          el.style.removeProperty('border');
                          el.style.removeProperty('border-color');
                          el.style.removeProperty('color');
                        }
                      }}
                    >
                      <Upload size={20} />
                      Carga Masiva
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setSelectedUnit(null);
                      setUnitForm({
                        nombre: '',
                        nombreCorto: '',
                        tipoUnidad: TipoUnidad.GERENCIA, // Usar el enum en lugar de string
                        objetivo: '',
                        unidadPadreId: null,
                        sedeId: null
                      });
                      setShowUnitModal(true);
                    }}
                    className={styles.createUnitButton}
                    title="Crear nueva unidad organizacional"
                    ref={(el) => {
                      if (el) {
                        el.style.removeProperty('background-color');
                        el.style.removeProperty('border-color');
                        el.style.removeProperty('color');
                      }
                    }}
                  >
                    <Plus size={20} />
                    Nueva Unidad
                  </button>
                  
                  {unidades.length > 0 && (
                    <>
                      <button
                        onClick={handleClearData}
                        className={styles.createUnitButton}
                        title="Limpiar Vista Local: Solo limpia la visualización actual, mantiene los datos del servidor."
                        ref={(el) => {
                          if (el) {
                            el.style.removeProperty('background-color');
                            el.style.removeProperty('border-color');
                            el.style.removeProperty('color');
                          }
                        }}
                      >
                        <RotateCcw size={20} />
                        Limpiar Vista
                      </button>
                      
                      {organizationInfo.hasOrganization && organizationInfo.id && (
                        <button
                          onClick={handleDeleteEstructuraOrganizacional}
                          className={styles.createUnitButton}
                          title="ELIMINAR estructura organizacional del servidor (PERMANENTE)"
                          ref={(el) => {
                            if (el) {
                              el.style.removeProperty('background-color');
                              el.style.removeProperty('border-color');
                              el.style.removeProperty('color');
                            }
                          }}
                        >
                          <Trash2 size={20} />
                          Eliminar
                        </button>
                      )}
                    </>
                  )}
              
              <button
                onClick={() => setShowNavigationPanel(true)}
                className={`${styles.createUnitButton} ${styles.buttonNeutral}`}
                title="Panel de navegación"
              >
                <Navigation size={20} />
                Navegación
              </button>
              
              <button
                onClick={() => setShowExportPanel(true)}
                className={`${styles.createUnitButton} ${styles.buttonNeutral}`}
                title="Exportar organigrama"
              >
                <Download size={20} />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle de vista: Clásico / React Flow - OCULTO */}
      {/* 
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem 1rem', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setUseReactFlowView(v => !v)}
          className={`${styles.createUnitButton} ${styles.buttonNeutral}`}
          title={useReactFlowView ? 'Cambiar a vista clásica' : 'Cambiar a vista React Flow'}
        >
          {useReactFlowView ? <Eye size={18} /> : <EyeOff size={18} />}
          {useReactFlowView ? 'Vista Clásica' : 'Vista React Flow'}
        </button>
      </div>
      */}

      {/* Contenido principal */}
      <div className={styles.orgChartContent}>
        {useReactFlowView ? (
          <ReactFlowOrgChart 
            data={{ data: { unidadesOrg: unidades, personas, organizacion: organizacionActual } }} 
            layout={organizationalLayout}
            onViewDetail={(unitId) => {
              const unidad = unidades.find(u => u.unidadesOrgId === unitId);
              if (unidad) {
                setSelectedUnit(unidad);
                // En el detalle mostraremos la primera posición si existe
                const unitPositions = posiciones.filter(p => p.unidadesOrgId === unitId);
                setSelectedPosition(unitPositions[0] || null);
                setShowDetailModal(true);
              }
            }}
            onEditUnit={(unitId) => {
              const unidad = unidades.find(u => u.unidadesOrgId === unitId);
              if (unidad) {
                handleUnitCardClick(unidad);
              }
            }}
            onCreatePosition={(unitId) => {
              const unidad = unidades.find(u => u.unidadesOrgId === unitId);
              if (unidad) {
                setSelectedUnit(unidad);
                setShowPositionModal(true);
              }
            }}
            onCreateSubunit={(unitId) => {
              const unidad = unidades.find(u => u.unidadesOrgId === unitId);
              if (unidad) {
                setSelectedUnit(unidad);
                setUnitForm({
                  ...unitForm,
                  unidadPadreId: unidad.unidadesOrgId,
                });
                setIsEditMode(false);
                setShowUnitModal(true);
              }
            }}
            onAssignPerson={(unitId) => {
              const unidad = unidades.find(u => u.unidadesOrgId === unitId);
              const unitPositions = posiciones.filter(p => p.unidadesOrgId === unitId);
              if (unitPositions.length === 0) {
                // Si no hay posiciones, abrir modal para crear una posición en esta unidad
                if (unidad) {
                  setSelectedUnit(unidad);
                  setShowPositionModal(true);
                }
                return;
              }
              // Si hay varias posiciones, por ahora seleccionar la primera
              setSelectedPosition(unitPositions[0]);
              setShowAssignModal(true);
            }}
            onDeleteUnit={(unitId) => {
              handleDeleteUnit(unitId);
            }}
            onReactFlowInit={setReactFlowInstance}
            onNodesEdgesChange={handleNodesEdgesChange}
          />
        ) : unidades.length === 0 ? (
          <div className={styles.emptyState}>
            <Building size={64} />
            <h3>
              Comienza creando tu organigrama
            </h3>
            <p>
              {organizationInfo.hasOrganization && organizationInfo.id 
                ? 'Ve el organigrama desde el servidor, usa carga masiva o crea la primera unidad'
                : 'Crea la primera unidad organizacional para empezar a construir la estructura'
              }
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {organizationInfo.hasOrganization && organizationInfo.id && (
                <button
                  onClick={async () => {
                    setShouldLoadFromAPI(true);
                    setIsLoadingOrganization(true);
                    const estructuraCargada = await cargarEstructuraDesdeAPI(organizationInfo.id as number);
                    if (!estructuraCargada) {
                      AlertService.warning('No se encontró estructura organizacional en el servidor para esta empresa');
                    }
                    setIsLoadingOrganization(false);
                  }}
                  className={styles.createFirstUnitButton}
                  disabled={isLoadingOrganization}
                >
                  <Building size={24} />
                  {isLoadingOrganization ? 'Cargando...' : 'Ver Organigrama'}
                </button>
              )}
              
              {user?.perfilId !== 1 && (
                <button
                  onClick={() => setShowCargaMasiva(true)}
                  className={`${styles.createFirstUnitButton} ${styles.createFirstUnitButtonOutline}`}
                >
                  <Upload size={24} />
                  Carga Masiva
                </button>
              )}
              
              <button
                onClick={() => {
                  setUnitForm({
                    nombre: '',
                    nombreCorto: '',
                    tipoUnidad: TipoUnidad.GERENCIA, // Usar el enum en lugar de string
                    objetivo: '',
                    unidadPadreId: null,
                    sedeId: null
                  });
                  setShowUnitModal(true);
                }}
                className={styles.createFirstUnitButton}
              >
                <Plus size={24} />
                Crear Primera Unidad
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={`${styles.orgChartView} ${isPanMode ? styles.orgChartViewPan : ''} orgChartView`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          >
            {renderPanControls()}
            
            <div 
              className={`${styles.orgChartInner} orgChartInner`}
              style={panStyle}
            >
              {showOnlyPositions 
                ? hierarchy.map(unidad => renderPositionOnlyView(unidad))
                : hierarchy.map(unidad => renderUnitCard(unidad))
              }
            </div>
            
            {showPanIndicator && (
              <div className={styles.panIndicator}>
                <div className={styles.panIndicatorContent}>
                  <Hand size={14} />
                  <span>Modo Pan activo - Arrastra para navegar</span>
                  <button
                    onClick={() => setShowPanIndicator(false)}
                    className={`${styles.panIndicatorClose} ${styles.textSecondary}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {renderUnitModal()}
      {renderPositionModal()}
      {renderAssignModal()}
      {renderDetailModal()}
      
      {/* Modal de Carga Masiva */}
      <CargaMasiva
        isOpen={showCargaMasiva}
        onClose={handleCloseCargaMasiva}
        onDataLoaded={handleLoadMassiveData}
        organizacionActual={organizacionActual}
        resetTrigger={cargaMasivaResetTrigger}
      />

      {/* Panel de Navegación Avanzada */}
      <NavigationPanel
        isOpen={showNavigationPanel}
        onClose={() => setShowNavigationPanel(false)}
        unidades={unidades}
        posiciones={posiciones}
        personas={personas}
        personaPosiciones={personaPosiciones}
        fitToScreen={fitToScreen}
        fitContentToScreen={fitContentToScreen}
        centerOnElement={centerOnElement}
        panToPosition={panToPosition}
        panState={panState}
        filteredUnits={filteredUnits}
        onFilterUnits={handleFilterUnits}
        onClearFilters={handleClearFilters}
        levelCoordinates={levelCoordinates}
        navigateToLevel={navigateToLevel}
        updateLevelCoordinates={updateLevelCoordinates}
        useReactFlowView={useReactFlowView}
        reactFlowInstance={reactFlowInstance}
        reactFlowNodes={reactFlowNodes}
        reactFlowEdges={reactFlowEdges}
      />

      {/* Panel de Exportación */}
      <ExportPanel
        isOpen={showExportPanel}
        onClose={() => setShowExportPanel(false)}
        data={getExportData()}
        reactFlowInstance={useReactFlowView ? reactFlowInstance : undefined}
      />

    </div>
  );
};