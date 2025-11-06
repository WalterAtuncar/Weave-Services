import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { PageHeader } from '../../ui/page-header';
import { SearchToolbar } from '../../ui/search-toolbar';
import { GovernanceCard } from '../../ui/governance-card';
import { FilterModal } from '../../ui/filter/FilterModal';
import { EntityTypeFilter } from '../../ui/entity-type-filter';
import { GovernanceWizard } from '../../ui/governance-wizard';
import { GobernanzaForm } from '../../ui/gobernanza-form';
import { EmptyState } from '../../ui/empty-state';
import { Spinner } from '../../ui/spinner';
import { Badge } from '../../ui/badge/badge';
import { Grid } from '../../ui/grid';
import { AlertService } from '../../ui/alerts/AlertService';
import { useGobernanza } from '../../../hooks/useGobernanza';
import { useAuth } from '../../../hooks/useAuth';
import { 
  EstadoGobernanza,
  CreateGobernanzaCommand,
  UpdateGobernanzaCommand,
  AsignarGobernanzaCommand,
  TransferirGobernanzaCommand,
  RevocarGobernanzaCommand
} from '../../../services/types/gobernanza.types';
import { gobernanzaService } from '../../../services';
import * as XLSX from 'xlsx';
import { 
  Shield, 
  Crown, 
  Users, 
  Filter, 
  Download,
  Settings,
  Edit3,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  BarChart,
  Zap,
  Target,
  TrendingUp,
  Eye,
  Database,
  Layers,
  Calendar,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import styles from './Gobernanza.module.css';

// =============================================
// INTERFACES LOCALES
// =============================================

interface GobernanzaPageState {
  selectedEntidadId: number | null;
  modalDetailOpen: boolean;
  filterModalOpen: boolean;
  configModalOpen: boolean;
  createGobernanzaModalOpen: boolean;
  editGobernanzaModalOpen: boolean;
  viewGobernanzaModalOpen: boolean;
  selectedGobernanzaId: number | null;
  selectedGobernanzaData: GobernanzaCompleta | null;
  viewMode: 'dashboard' | 'cards' | 'list';
  expandedAccordions: Set<string>;
}

// Nuevos tipos para la estructura actualizada de la API
interface RolAsignado {
  gobernanzaRolId: number;
  rolGobernanzaId: number;
  usuarioId: number;
  rolGobernanzaNombre: string;
  rolGobernanzaCodigo: string | null;
  usuarioNombre: string;
  fechaAsignacion: string;
  ordenEjecucion: number; // Orden de aprobación del rol
  puedeEditar: boolean; // Indica si el usuario puede editar la entidad
  estado: number; // ✅ CORREGIDO: Cambiado de estadoActivo: boolean a estado: number
}

interface GobernanzaCompleta {
  gobernanzaId: number;
  tipoGobiernoId: number;
  tipoEntidadId: number;
  entidadId: number;
  organizacionId?: number;
  nombre: string;
  fechaAsignacion: string;
  fechaVencimiento: string | null;
  observaciones: string | null;
  rolesAsignados: RolAsignado[];
  tipoGobiernoNombre: string;
  tipoGobiernoDescripcion: string;
  tipoEntidadNombre: string;
  tipoEntidadDescripcion: string;
  nombreEntidad?: string;
  nombreEmpresa?: string;
  version: number;
  estado: number;
  creadoPor: number;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  estadoTexto: string;
  estaVencido: boolean;
  estaProximoAVencer: boolean;
  diasParaVencimiento: number | null;
  diasDesdeLaAsignacion: number;
  estadoVencimientoTexto: string;
  descripcionCompleta: string;
}

interface MetricaCard {
  titulo: string;
  valor: number;
  valorAnterior?: number;
  icono: React.ReactNode;
  color: string;
  descripcion: string;
  formato?: 'numero' | 'porcentaje' | 'moneda';
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const Gobernanza: React.FC = () => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();
  
  // 🔧 Función para obtener organizationId con fallback a localStorage
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
      console.error('❌ [GOBERNANZA] Error reading from localStorage:', error);
    }
    
    console.warn('⚠️ [GOBERNANZA] No valid organization ID found, using 0');
    return 0;
  };
  
  // Hook principal de gobernanza
  const {
    gobernanzas,
    entidades,
    rolesGobernanza,
    tiposEntidad,
    tiposGobierno,
    loading,
    error,
    filters,
    pagination,
    stats,
    isFirstTimeSetup,
    configurationComplete,
    setFilters,
    setSearch,
    setTipoEntidadFilter,
    clearFilters,
    setPage,
    setPageSize,
    refreshData,
    asignarGobernanza,
    transferirGobernanza,
    revocarGobernanza,
    completeConfiguration
  } = useGobernanza();

  // Estado local del componente
  const [pageState, setPageState] = useState<GobernanzaPageState>({
    selectedEntidadId: null,
    modalDetailOpen: false,
    filterModalOpen: false,
    configModalOpen: false,
    createGobernanzaModalOpen: false,
    editGobernanzaModalOpen: false,
    viewGobernanzaModalOpen: false,
    selectedGobernanzaId: null,
    selectedGobernanzaData: null,
    viewMode: 'dashboard',
    expandedAccordions: new Set()
  });

  // Estado para las nuevas gobernanzas
  const [gobernanzasCompletas, setGobernanzasCompletas] = useState<any[]>([]);
  const [loadingGobernanzas, setLoadingGobernanzas] = useState(false);
  const [errorGobernanzas, setErrorGobernanzas] = useState<string | null>(null);

  // Los acordeones inician colapsados por defecto - no necesitamos useEffect para expandir

  // =============================================
  // EFECTOS
  // =============================================

  // Cargar datos iniciales cuando el componente se monte
  useEffect(() => {
    // Cargar datos iniciales sin filtros
    loadGobernanzasCompletas();
  }, []);

  // Mostrar wizard de configuración si es primera vez
  useEffect(() => {
    if (isFirstTimeSetup && !pageState.configModalOpen) {
      setPageState(prev => ({
        ...prev,
        configModalOpen: true
      }));
    }
  }, [isFirstTimeSetup, pageState.configModalOpen]);

  // =============================================
  // FUNCIONES DE CARGA DE DATOS
  // =============================================

  const loadGobernanzasCompletas = async (filtrosAplicados?: any) => {
    setLoadingGobernanzas(true);
    setErrorGobernanzas(null); // Limpiar errores previos
    try {
      // 🔧 Obtener organizacionId usando la función centralizada
      const organizacionId = getOrganizationId();
      
      // Construir parámetros de consulta
      const requestParams: any = {
        page: 1,
        pageSize: 100,
        includeDeleted: false,
        filters: {
          // ✅ SIEMPRE aplicar filtro de organización - OBLIGATORIO
          organizacionId: organizacionId
        }
      };

      // Aplicar filtros si se proporcionan
      if (filtrosAplicados) {
        // Filtro por tipoEntidadId (viene como string del FilterModal)
        if (filtrosAplicados.tipoEntidad && filtrosAplicados.tipoEntidad !== '') {
          requestParams.filters.tipoEntidadId = parseInt(filtrosAplicados.tipoEntidad);
        }

        // Mapear otros filtros
        if (filtrosAplicados.estado !== undefined && filtrosAplicados.estado !== '') {
          requestParams.filters.estado = parseInt(filtrosAplicados.estado);
        }
        
        if (filtrosAplicados.conAlertas) {
          requestParams.soloVencidas = true;
        }
        
        if (filtrosAplicados.sinPropietario) {
          requestParams.soloProximasAVencer = true;
        }
      }

      // Debug removed; // Para debug
      const response = await gobernanzaService.getGobernanzasPaginated(requestParams);
      
      // Debug removed; // Para debug
      if (response.success) {
        // Siempre actualizar el estado, incluso si data está vacío
        const datos = response.data?.data || response.data?.items || [];
        // Debug removed; // Para debug
        setGobernanzasCompletas(datos);
      } else {
        const errorMsg = response.message || 'Error desconocido al cargar gobernanzas';
        console.error('Error en respuesta:', errorMsg);
        setErrorGobernanzas(errorMsg);
        setGobernanzasCompletas([]); // Limpiar datos en caso de error
        AlertService.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión al cargar gobernanzas';
      console.error('Error al cargar gobernanzas:', error);
      setErrorGobernanzas(errorMsg);
      AlertService.error(errorMsg);
      setGobernanzasCompletas([]); // Limpiar datos en caso de error
    } finally {
      setLoadingGobernanzas(false);
    }
  };

  // =============================================
  // FUNCIONES DE VISUALIZACIÓN
  // =============================================

  const generatePieChart = (data: Array<{label: string, value: number, color: string}>, size: number = 120) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return null;

    let currentAngle = 0;
    const radius = size / 2 - 10;
    const centerX = size / 2;
    const centerY = size / 2;

    const paths = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;
      
      const startX = centerX + radius * Math.cos(currentAngle - Math.PI / 2);
      const startY = centerY + radius * Math.sin(currentAngle - Math.PI / 2);
      
      const endX = centerX + radius * Math.cos(currentAngle + angle - Math.PI / 2);
      const endY = centerY + radius * Math.sin(currentAngle + angle - Math.PI / 2);
      
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ');
      
      currentAngle += angle;
      
      return (
        <path 
          key={index} 
          d={pathData} 
          fill={item.color} 
          stroke="white" 
          strokeWidth="2"
        />
      );
    });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths}
      </svg>
    );
  };

  const generateBarChart = (data: Array<{label: string, value: number}>, width: number = 300, height: number = 100) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    if (maxValue === 0) return null;

    const barWidth = width / data.length;
    const padding = 4;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 20);
          const x = index * barWidth + padding;
          const y = height - barHeight - 10;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth - padding * 2}
                height={barHeight}
                fill={colors.primary}
                opacity={0.8}
                rx={2}
              />
              <text
                x={x + (barWidth - padding * 2) / 2}
                y={height - 2}
                textAnchor="middle"
                fontSize="10"
                fill={colors.textSecondary}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // =============================================
  // HANDLERS DE ACCIONES
  // =============================================

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  const handleFilter = async (filtros: any) => {
    // Actualizar estado local de filtros
    setFilters({
      tipoEntidad: filtros.tipoEntidad,
      estado: filtros.estado,
      conAlertas: filtros.conAlertas,
      sinPropietario: filtros.sinPropietario
    });
    
    // Cerrar modal
    setPageState(prev => ({ ...prev, filterModalOpen: false }));
    
    // Recargar datos con filtros aplicados
    await loadGobernanzasCompletas(filtros);
  };

  const handleClearFilters = async () => {
    // Limpiar estado local de filtros usando clearFilters del hook
    clearFilters();
    
    // Recargar todos los datos sin filtros
    await loadGobernanzasCompletas();
  };

  // =============================================
  // HANDLERS DE GOBERNANZA CRUD
  // =============================================

  const handleOpenCreateGobernanza = () => {
    setPageState(prev => ({ ...prev, createGobernanzaModalOpen: true }));
  };

  const handleCloseCreateGobernanza = async () => {
    setPageState(prev => ({ ...prev, createGobernanzaModalOpen: false }));
    // Recargar datos después de cerrar el modal
    await loadGobernanzasCompletas();
  };

  const handleCreateGobernanza = async (command: CreateGobernanzaCommand | UpdateGobernanzaCommand) => {
    try {
      const organizationId = getOrganizationId();
      if (!organizationId) {
        AlertService.error('No se ha configurado la organización');
        return;
      }

      // Agregar organizationId al comando
      const commandWithOrganization = {
        ...command,
        organizacionId: organizationId
      } as CreateGobernanzaCommand;

      const response = await gobernanzaService.createGobernanza(commandWithOrganization);
      
      if (response.success) {
        AlertService.success('Gobernanza creada exitosamente');
        handleCloseCreateGobernanza();
        // La recarga de datos se hace automáticamente en handleCloseCreateGobernanza
      } else {
        throw new Error(response.message || 'Error al crear la gobernanza');
      }
    } catch (error: any) {
      console.error('Error al crear gobernanza:', error);
      AlertService.error(error.message || 'Error al crear la gobernanza');
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  // =============================================
  // FUNCIONES PARA VIEW Y EDIT
  // =============================================

  const convertGobernanzaCompletaToFormData = (gobernanza: GobernanzaCompleta): any => {
    return {
      gobernanzaId: gobernanza.gobernanzaId, // ✅ AGREGADO: Campo requerido para modo edición
      tipoGobiernoId: gobernanza.tipoGobiernoId,
      tipoEntidadId: gobernanza.tipoEntidadId,
      entidadId: gobernanza.entidadId,
      nombre: gobernanza.nombre || '',
      fechaAsignacion: gobernanza.fechaAsignacion,
      fechaVencimiento: gobernanza.fechaVencimiento || '',
      observaciones: gobernanza.observaciones || '',
      gobernanzaRoles: gobernanza.rolesAsignados.map((rol, index) => ({
        id: `existing-${rol.gobernanzaRolId}`, // ✅ USAR gobernanzaRolId real para identificación única
        gobernanzaRolId: rol.gobernanzaRolId, // ✅ PRESERVAR el ID real de la base de datos
        rolGobernanzaId: rol.rolGobernanzaId,
        usuarioId: rol.usuarioId,
        fechaAsignacion: rol.fechaAsignacion,
        ordenEjecucion: rol.ordenEjecucion || 0, // Incluir orden de aprobación
        puedeEditar: rol.puedeEditar || false, // Incluir permisos de edición
        estado: rol.estado, // ✅ CORREGIDO: Cambiado de estadoActivo a estado
        isNew: false,
        isEditing: false,
        hasErrors: false
      }))
    };
  };

  const handleViewGobernanza = (gobernanza: GobernanzaCompleta) => {
    setPageState(prev => ({
      ...prev,
      selectedGobernanzaId: gobernanza.gobernanzaId,
      selectedGobernanzaData: gobernanza,
      viewGobernanzaModalOpen: true
    }));
  };

  const handleEditGobernanza = (gobernanza: GobernanzaCompleta) => {
    setPageState(prev => ({
      ...prev,
      selectedGobernanzaId: gobernanza.gobernanzaId,
      selectedGobernanzaData: gobernanza,
      editGobernanzaModalOpen: true
    }));
  };

  const handleCloseViewGobernanza = async () => {
    setPageState(prev => ({
      ...prev,
      viewGobernanzaModalOpen: false,
      selectedGobernanzaId: null,
      selectedGobernanzaData: null
    }));
    // Recargar datos después de cerrar el modal
    await loadGobernanzasCompletas();
  };

  const handleCloseEditGobernanza = async () => {
    setPageState(prev => ({
      ...prev,
      editGobernanzaModalOpen: false,
      selectedGobernanzaId: null,
      selectedGobernanzaData: null
    }));
    // Recargar datos después de cerrar el modal
    await loadGobernanzasCompletas();
  };

  const handleUpdateGobernanza = async (command: CreateGobernanzaCommand | UpdateGobernanzaCommand) => {
    try {
      if (!pageState.selectedGobernanzaId) {
        AlertService.error('No se ha seleccionado una gobernanza para actualizar');
        return;
      }

      const organizationId = getOrganizationId();
      if (!organizationId) {
        AlertService.error('No se ha configurado la organización');
        return;
      }
      // Agregar organizationId al comando
      const commandWithOrganization = {
        ...command,
        organizacionId: organizationId
      } as UpdateGobernanzaCommand;
      
      // Llamar al servicio de actualización
      const response = await gobernanzaService.updateGobernanza(commandWithOrganization);
      
      if (response.success) {
        AlertService.success('Gobernanza actualizada exitosamente');
        handleCloseEditGobernanza();
        // La recarga de datos se hace automáticamente en handleCloseEditGobernanza
      } else {
        AlertService.error(response.message || 'Error al actualizar la gobernanza');
      }
    } catch (error: any) {
      console.error('Error al actualizar gobernanza:', error);
      AlertService.error('Error al actualizar la gobernanza');
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleOpenDetail = (entidad: any) => {
    setPageState(prev => ({
      ...prev,
      selectedEntidadId: entidad.entidadId,
      modalDetailOpen: true
    }));
  };

  const handleCloseDetail = () => {
    setPageState(prev => ({
      ...prev,
      selectedEntidadId: null,
      modalDetailOpen: false
    }));
  };

  const handleOpenConfiguration = () => {
    setPageState(prev => ({ ...prev, configModalOpen: true }));
  };

  const handleCloseConfiguration = () => {
    setPageState(prev => ({ ...prev, configModalOpen: false }));
  };

  const handleCompleteConfiguration = () => {
    completeConfiguration();
    handleCloseConfiguration();
    // Refrescar listado principal después de completar la configuración
    loadGobernanzasCompletas();
    AlertService.success('Configuración de gobierno completada exitosamente');
  };

  const handleAsignarRol = async (
    rolId: number, 
    usuarioId: number, 
    fechaVencimiento?: string, 
    observaciones?: string
  ) => {
    if (!pageState.selectedEntidadId) return;

    try {
      const command: AsignarGobernanzaCommand = {
        tipoGobiernoId: tiposGobierno[0]?.tipoGobiernoId || 1, // Usar el primer tipo disponible o default
        tipoEntidadId: tiposEntidad[0]?.tipoEntidadId || 1, // Usar el primer tipo disponible o default
        entidadId: pageState.selectedEntidadId,
        rolGobernanzaId: rolId,
        usuarioId,
        fechaAsignacion: new Date().toISOString(),
        fechaVencimiento,
        observaciones
      };

      await asignarGobernanza(command);
      handleCloseDetail();
    } catch (error: any) {
      AlertService.error(error.message || 'Error al asignar rol');
    }
  };

  const handleTransferirRol = async (
    gobernanzaId: number, 
    nuevoUsuarioId: number, 
    motivoTransferencia: string
  ) => {
    try {
      const command: TransferirGobernanzaCommand = {
        gobernanzaId,
        usuarioDestinoId: nuevoUsuarioId,
        fechaTransferencia: new Date().toISOString(),
        motivoTransferencia
      };

      await transferirGobernanza(command);
    } catch (error: any) {
      AlertService.error(error.message || 'Error al transferir rol');
    }
  };

  const handleRevocarRol = async (gobernanzaId: number, motivoRevocacion: string) => {
    try {
      const command: RevocarGobernanzaCommand = {
        gobernanzaId,
        motivoRevocacion,
        fechaRevocacion: new Date().toISOString()
      };

      await revocarGobernanza(command);
    } catch (error: any) {
      AlertService.error(error.message || 'Error al revocar rol');
    }
  };

  const handleRenovarRol = async (gobernanzaId: number, nuevaFechaVencimiento: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      AlertService.success('Rol renovado exitosamente');
    } catch (error: any) {
      AlertService.error('Error al renovar rol');
    }
  };

  const handleMarcarNotificacionLeida = async (notificacionId: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      AlertService.success('Notificación marcada como leída');
    } catch (error: any) {
      AlertService.error('Error al marcar notificación');
    }
  };

  const handleExportarExcel = async () => {
    try {
      if (gobernanzasCompletas.length === 0) {
        AlertService.warning('No hay datos para exportar');
        return;
      }

      const wb = XLSX.utils.book_new();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      // ============================
      // HOJA 1: RESUMEN EJECUTIVO
      // ============================
      const totalGobernanzas = gobernanzasCompletas.length;
      const gobernanzasActivas = gobernanzasCompletas.filter((g: any) => g.estado === 1).length;
      const gobernanzasVencidas = gobernanzasCompletas.filter((g: any) => g.estaVencido).length;
      const proximasVencer = gobernanzasCompletas.filter((g: any) => g.estaProximoAVencer).length;
      const usuariosUnicos = new Set(gobernanzasCompletas.flatMap((g: any) => g.rolesAsignados?.map((r: any) => r.usuarioId) || [])).size;
      
      const resumenData = [
        ['REPORTE DE GOBERNANZA EMPRESARIAL', '', '', ''],
        [`Generado el: ${new Date().toLocaleString()}`, '', '', ''],
        ['', '', '', ''],
        ['MÉTRICAS GENERALES', '', '', ''],
        ['Total de Gobernanzas:', totalGobernanzas, '', ''],
        ['Gobernanzas Activas:', gobernanzasActivas, '', ''],
        ['Gobernanzas Vencidas:', gobernanzasVencidas, '', ''],
        ['Próximas a Vencer:', proximasVencer, '', ''],
        ['Usuarios Únicos Asignados:', usuariosUnicos, '', ''],
        ['Cobertura:', `${totalGobernanzas > 0 ? ((gobernanzasActivas / totalGobernanzas) * 100).toFixed(1) : 0}%`, '', ''],
        ['', '', '', ''],
        ['DISTRIBUCIÓN POR TIPO DE GOBIERNO', '', '', ''],
      ];

      // Agregar distribución por tipo
      const tiposDist = new Map<string, number>();
      gobernanzasCompletas.forEach((g: any) => {
        const tipo = g.tipoGobiernoNombre || 'Sin definir';
        tiposDist.set(tipo, (tiposDist.get(tipo) || 0) + 1);
      });
      
      tiposDist.forEach((count, tipo) => {
        resumenData.push([tipo, count, `${((count / totalGobernanzas) * 100).toFixed(1)}%`, '']);
      });

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      wsResumen['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsResumen, '📊 Resumen Ejecutivo');

      // ============================
      // HOJA 2: GOBERNANZAS DETALLADAS
      // ============================
      const gobernanzasDetalladas = gobernanzasCompletas.map((g: any) => ({
        'ID Gobernanza': g.gobernanzaId,
        'Nombre': g.nombre || 'Sin nombre',
        'Tipo de Gobierno': g.tipoGobiernoNombre || 'N/A',
        'Tipo de Entidad': g.tipoEntidadNombre || 'N/A',
        'Entidad ID': g.entidadId,
        'Fecha Asignación': g.fechaAsignacion ? new Date(g.fechaAsignacion).toLocaleDateString() : 'N/A',
        'Fecha Vencimiento': g.fechaVencimiento ? new Date(g.fechaVencimiento).toLocaleDateString() : 'Sin vencimiento',
        'Estado': g.estadoTexto || (g.estado === 1 ? 'Activo' : 'Inactivo'),
        'Está Vencido': g.estaVencido ? 'SÍ' : 'NO',
        'Próximo a Vencer': g.estaProximoAVencer ? 'SÍ' : 'NO',
        'Días para Vencimiento': g.diasParaVencimiento || 'N/A',
        'Total Roles Asignados': g.rolesAsignados?.length || 0,
        'Observaciones': g.observaciones || 'Sin observaciones',
        'Creado Por': g.creadoPor || 'N/A',
        'Fecha Creación': g.fechaCreacion ? new Date(g.fechaCreacion).toLocaleDateString() : 'N/A'
      }));

      const wsGobernanzas = XLSX.utils.json_to_sheet(gobernanzasDetalladas);
      wsGobernanzas['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 18 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
        { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(wb, wsGobernanzas, '🏛️ Gobernanzas');

      // ============================
      // HOJA 3: ROLES Y USUARIOS ASIGNADOS
      // ============================
      const rolesDetalle: any[] = [];
      gobernanzasCompletas.forEach((g: any) => {
        if (g.rolesAsignados && g.rolesAsignados.length > 0) {
          g.rolesAsignados.forEach((rol: any) => {
            rolesDetalle.push({
              'ID Gobernanza': g.gobernanzaId,
              'Nombre Gobernanza': g.nombre || 'Sin nombre',
              'Tipo Gobierno': g.tipoGobiernoNombre || 'N/A',
              'Rol ID': rol.rolGobernanzaId || 'N/A',
              'Rol Nombre': rol.rolGobernanzaNombre || 'N/A',
              'Rol Código': rol.rolGobernanzaCodigo || 'N/A',
              'Orden Ejecución': rol.ordenEjecucion !== undefined ? rol.ordenEjecucion : 'N/A',
              'Color Rol': rol.color || 'N/A',
              'Usuario ID': rol.usuarioId || 'N/A',
              'Usuario Nombre': rol.usuarioNombre || 'Sin asignar',
              'Usuario Email': rol.usuarioEmail || 'N/A',
              'Fecha Asignación Rol': rol.fechaAsignacion ? new Date(rol.fechaAsignacion).toLocaleDateString() : 'N/A',
              'Estado Asignación': rol.estadoTexto || 'N/A'
            });
          });
        } else {
          // Agregar fila para gobernanzas sin roles asignados
          rolesDetalle.push({
            'ID Gobernanza': g.gobernanzaId,
            'Nombre Gobernanza': g.nombre || 'Sin nombre',
            'Tipo Gobierno': g.tipoGobiernoNombre || 'N/A',
            'Rol ID': 'SIN ROLES',
            'Rol Nombre': 'SIN ROLES ASIGNADOS',
            'Rol Código': 'N/A',
            'Nivel Autoridad': 'N/A',
            'Color Rol': 'N/A',
            'Usuario ID': 'N/A',
            'Usuario Nombre': 'N/A',
            'Usuario Email': 'N/A',
            'Fecha Asignación Rol': 'N/A',
            'Estado Asignación': 'PENDIENTE'
          });
        }
      });

      const wsRoles = XLSX.utils.json_to_sheet(rolesDetalle);
      wsRoles['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 10 }, { wch: 20 },
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 },
        { wch: 30 }, { wch: 15 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(wb, wsRoles, '👥 Roles y Usuarios');

      // ============================
      // HOJA 4: ANÁLISIS POR TIPO
      // ============================
      const analisisPorTipo: any[] = [];
      
      // Análisis por Tipo de Gobierno
      const tiposGobierno = new Map<string, any>();
      gobernanzasCompletas.forEach((g: any) => {
        const tipo = g.tipoGobiernoNombre || 'Sin definir';
        if (!tiposGobierno.has(tipo)) {
          tiposGobierno.set(tipo, {
            tipo,
            cantidad: 0,
            activas: 0,
            vencidas: 0,
            sinRoles: 0,
            totalRoles: 0,
            usuariosUnicos: new Set()
          });
        }
        
        const stats = tiposGobierno.get(tipo);
        stats.cantidad++;
        if (g.estado === 1) stats.activas++;
        if (g.estaVencido) stats.vencidas++;
        if (!g.rolesAsignados || g.rolesAsignados.length === 0) stats.sinRoles++;
        stats.totalRoles += g.rolesAsignados?.length || 0;
        
        if (g.rolesAsignados) {
          g.rolesAsignados.forEach((r: any) => {
            if (r.usuarioId) stats.usuariosUnicos.add(r.usuarioId);
          });
        }
      });

      // Convertir a array para Excel
      analisisPorTipo.push(['ANÁLISIS POR TIPO DE GOBIERNO', '', '', '', '', '', '']);
      analisisPorTipo.push(['Tipo', 'Total', 'Activas', 'Vencidas', 'Sin Roles', 'Total Roles', 'Usuarios Únicos']);
      
      tiposGobierno.forEach((stats) => {
        analisisPorTipo.push([
          stats.tipo,
          stats.cantidad,
          stats.activas,
          stats.vencidas,
          stats.sinRoles,
          stats.totalRoles,
          stats.usuariosUnicos.size
        ]);
      });

      analisisPorTipo.push(['', '', '', '', '', '', '']);
      analisisPorTipo.push(['ANÁLISIS POR TIPO DE ENTIDAD', '', '', '', '', '', '']);
      analisisPorTipo.push(['Tipo', 'Total', 'Activas', 'Vencidas', 'Sin Roles', 'Total Roles', 'Usuarios Únicos']);

      // Análisis por Tipo de Entidad
      const tiposEntidad = new Map<string, any>();
      gobernanzasCompletas.forEach((g: any) => {
        const tipo = g.tipoEntidadNombre || 'Sin definir';
        if (!tiposEntidad.has(tipo)) {
          tiposEntidad.set(tipo, {
            tipo,
            cantidad: 0,
            activas: 0,
            vencidas: 0,
            sinRoles: 0,
            totalRoles: 0,
            usuariosUnicos: new Set()
          });
        }
        
        const stats = tiposEntidad.get(tipo);
        stats.cantidad++;
        if (g.estado === 1) stats.activas++;
        if (g.estaVencido) stats.vencidas++;
        if (!g.rolesAsignados || g.rolesAsignados.length === 0) stats.sinRoles++;
        stats.totalRoles += g.rolesAsignados?.length || 0;
        
        if (g.rolesAsignados) {
          g.rolesAsignados.forEach((r: any) => {
            if (r.usuarioId) stats.usuariosUnicos.add(r.usuarioId);
          });
        }
      });

      tiposEntidad.forEach((stats) => {
        analisisPorTipo.push([
          stats.tipo,
          stats.cantidad,
          stats.activas,
          stats.vencidas,
          stats.sinRoles,
          stats.totalRoles,
          stats.usuariosUnicos.size
        ]);
      });

      const wsAnalisis = XLSX.utils.aoa_to_sheet(analisisPorTipo);
      wsAnalisis['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsAnalisis, '📈 Análisis por Tipo');

      // ============================
      // HOJA 5: CONTROL DE VENCIMIENTOS
      // ============================
      const vencimientos = gobernanzasCompletas
        .filter((g: any) => g.fechaVencimiento)
        .map((g: any) => ({
          'ID Gobernanza': g.gobernanzaId,
          'Nombre': g.nombre || 'Sin nombre',
          'Tipo Gobierno': g.tipoGobiernoNombre || 'N/A',
          'Fecha Asignación': g.fechaAsignacion ? new Date(g.fechaAsignacion).toLocaleDateString() : 'N/A',
          'Fecha Vencimiento': g.fechaVencimiento ? new Date(g.fechaVencimiento).toLocaleDateString() : 'N/A',
          'Días para Vencimiento': g.diasParaVencimiento || 0,
          'Estado Vencimiento': g.estaVencido ? '🔴 VENCIDO' : g.estaProximoAVencer ? '🟡 PRÓXIMO' : '🟢 VIGENTE',
          'Propietario Principal': g.rolesAsignados?.find((r: any) => r.rolGobernanzaNombre === 'Owner')?.usuarioNombre || 'Sin asignar',
          'Email Propietario': g.rolesAsignados?.find((r: any) => r.rolGobernanzaNombre === 'Owner')?.usuarioEmail || 'N/A',
          'Total Responsables': g.rolesAsignados?.length || 0,
          'Requiere Acción': (g.estaVencido || g.estaProximoAVencer) ? 'SÍ' : 'NO'
        }))
        .sort((a, b) => (a['Días para Vencimiento'] || 0) - (b['Días para Vencimiento'] || 0));

      const wsVencimientos = XLSX.utils.json_to_sheet(vencimientos);
      wsVencimientos['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, wsVencimientos, '⏰ Vencimientos');

      // ============================
      // GUARDAR ARCHIVO
      // ============================
      XLSX.writeFile(wb, `Reporte_Gobernanza_Detallado_${timestamp}.xlsx`);
      
      AlertService.success(`Reporte Excel generado exitosamente con ${gobernanzasCompletas.length} gobernanzas en 5 hojas detalladas`);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      AlertService.error('Error al generar el reporte Excel');
    }
  };

  // Función para manejar el toggle de acordeones (solo uno abierto a la vez)
  const toggleAccordion = (tipoEntidad: string) => {
    setPageState(prev => {
      const isCurrentlyExpanded = prev.expandedAccordions.has(tipoEntidad);
      
      if (isCurrentlyExpanded) {
        // Si está abierto, lo cerramos
        return { ...prev, expandedAccordions: new Set() };
      } else {
        // Si está cerrado, cerramos todos los demás y abrimos este
        return { ...prev, expandedAccordions: new Set([tipoEntidad]) };
      }
    });
  };

  // =============================================
  // FUNCIONES DE RENDERIZADO
  // =============================================

  const formatChange = (valor: number, valorAnterior?: number) => {
    if (!valorAnterior) return null;
    
    const cambio = valor - valorAnterior;
    const porcentaje = valorAnterior > 0 ? (cambio / valorAnterior) * 100 : 0;
    
    if (cambio === 0) {
      return <Minus size={14} color={colors.textSecondary} />;
    }
    
    return (
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        color: cambio > 0 ? '#10b981' : '#ef4444',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {cambio > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {Math.abs(porcentaje).toFixed(1)}%
      </span>
    );
  };

  const renderMetricCard = (metrica: MetricaCard, index: number) => {
    const formatValue = (valor: number) => {
      switch (metrica.formato) {
        case 'porcentaje':
          return `${valor.toFixed(1)}%`;
        case 'moneda':
          return `$${valor.toLocaleString()}`;
        default:
          return valor.toLocaleString();
      }
    };

    return (
      <div
        key={index}
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 25px rgba(0, 0, 0, 0.1)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: `${metrica.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: metrica.color
            }}
          >
            {metrica.icono}
          </div>
          {formatChange(metrica.valor, metrica.valorAnterior)}
        </div>

        {/* Valor principal */}
        <div>
          <h3 style={{
            margin: '0 0 4px 0',
            fontSize: '28px',
            fontWeight: '700',
            color: colors.text,
            lineHeight: '1'
          }}>
            {formatValue(metrica.valor)}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: colors.text
          }}>
            {metrica.titulo}
          </p>
        </div>

        {/* Descripción */}
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: colors.textSecondary,
          lineHeight: '1.4'
        }}>
          {metrica.descripcion}
        </p>
      </div>
    );
  };

  const renderDashboard = () => {
    // Calcular métricas desde las gobernanzas completas
    const totalGobernanzas = gobernanzasCompletas.length;
    const gobernanzasActivas = gobernanzasCompletas.filter((g: any) => g.estado === 1).length;
    const gobernanzasVencidas = gobernanzasCompletas.filter((g: any) => g.estaVencido).length;
    const proximasVencer = gobernanzasCompletas.filter((g: any) => g.estaProximoAVencer).length;
    const totalRolesAsignados = gobernanzasCompletas.reduce((total, g: any) => total + (g.rolesAsignados?.length || 0), 0);
    const usuariosUnicos = new Set(gobernanzasCompletas.flatMap((g: any) => g.rolesAsignados?.map((r: any) => r.usuarioId) || [])).size;

    // Métricas principales
    const metricas: MetricaCard[] = [
      {
        titulo: 'Total Gobernanzas',
        valor: totalGobernanzas,
        valorAnterior: totalGobernanzas - 1,
        icono: <Shield size={24} />,
        color: colors.primary,
        descripcion: 'Gobernanzas configuradas en el sistema'
      },
      {
        titulo: 'Activas',
        valor: gobernanzasActivas,
        valorAnterior: gobernanzasActivas - 1,
        icono: <CheckCircle size={24} />,
        color: '#10b981',
        descripcion: 'Gobernanzas en estado activo'
      },
      {
        titulo: 'Cobertura',
        valor: totalGobernanzas > 0 ? (gobernanzasActivas / totalGobernanzas) * 100 : 0,
        valorAnterior: 85,
        icono: <Target size={24} />,
        color: '#3b82f6',
        descripcion: 'Porcentaje de gobernanzas activas',
        formato: 'porcentaje'
      },
      {
        titulo: 'Vencidas',
        valor: gobernanzasVencidas,
        valorAnterior: gobernanzasVencidas + 1,
        icono: <AlertTriangle size={24} />,
        color: '#ef4444',
        descripcion: 'Gobernanzas que han vencido'
      },
      {
        titulo: 'Próximas a Vencer',
        valor: proximasVencer,
        valorAnterior: proximasVencer + 2,
        icono: <Clock size={24} />,
        color: '#f59e0b',
        descripcion: 'Gobernanzas que vencen pronto'
      },
      {
        titulo: 'Usuarios Asignados',
        valor: usuariosUnicos,
        valorAnterior: usuariosUnicos - 1,
        icono: <Users size={24} />,
        color: '#8b5cf6',
        descripcion: 'Usuarios únicos con roles asignados'
      }
    ];

    // Datos para gráficos basados en gobernanzas reales
    const tiposGobiernoData = (() => {
      const tipos = new Map<string, number>();
      gobernanzasCompletas.forEach((g: any) => {
        const nombre = g.tipoGobiernoNombre;
        tipos.set(nombre, (tipos.get(nombre) || 0) + 1);
      });
      return Array.from(tipos.entries()).map(([label, value], index) => ({
        label,
        value,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
    }));
    })();

    const rolesAsignacionesData = (() => {
      const roles = new Map<string, number>();
      gobernanzasCompletas.forEach((g: any) => {
        (g.rolesAsignados || []).forEach((rol: any) => {
          const nombre = rol.rolGobernanzaNombre;
          roles.set(nombre, (roles.get(nombre) || 0) + 1);
        });
      });
      return Array.from(roles.entries()).slice(0, 5).map(([label, value]) => ({
        label: label.substring(0, 8),
        value
      }));
    })();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Métricas principales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {metricas.map((metrica, index) => renderMetricCard(metrica, index))}
        </div>

        {/* Gráficos y análisis */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Distribución por Tipo de Entidad */}
          <div style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: colors.text }}>
                Distribución por Tipo de Gobierno
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: colors.textSecondary }}>
                Gobernanzas clasificadas por tipo de gobierno
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {generatePieChart(tiposGobiernoData, 140)}
              <div style={{ flex: 1 }}>
                {tiposGobiernoData.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: index < tiposGobiernoData.length - 1 ? `1px solid ${colors.border}` : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: item.color
                      }} />
                      <span style={{ fontSize: '14px', color: colors.text }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribución por Roles */}
          <div style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: colors.text }}>
                Asignaciones por Rol
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: colors.textSecondary }}>
                Distribución de roles asignados
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {generateBarChart(rolesAsignacionesData, 350, 120)}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {rolesAsignacionesData.slice(0, 3).map((rol, index) => (
                  <Badge
                    key={index}
                    label={rol.label}
                    color={colors.primary}
                    size="s"
                    variant="subtle"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actividad reciente y alertas */}

      </div>
    );
  };

  const renderEntitiesGrid = () => {
    // Mostrar spinner mientras se cargan los datos
    if (loadingGobernanzas) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '300px' 
        }}>
          <Spinner size="large" />
          <span style={{ marginLeft: '12px', color: colors.textSecondary }}>
            Cargando gobernanzas...
          </span>
        </div>
      );
    }

    // Mostrar estado de error si hay un error
    if (errorGobernanzas) {
      return (
        <EmptyState
          title="Error al cargar gobiernos"
          description={errorGobernanzas}
          icon="AlertTriangle"
          actions={[
            {
              label: 'Reintentar',
              icon: 'RefreshCw',
              onClick: loadGobernanzasCompletas,
              primary: true
            }
          ]}
        />
      );
    }

    // Mostrar estado vacío solo si no hay datos y no se está cargando
    if (gobernanzasCompletas.length === 0) {
      return (
        <EmptyState
          title="No hay gobiernos disponibles"
          description="Los gobiernos aparecerán aquí una vez que se configuren las asignaciones."
          icon="shield"
          actions={[
            {
              label: 'Actualizar',
              icon: 'RefreshCw',
              onClick: loadGobernanzasCompletas,
              primary: true
            }
          ]}
        />
      );
    }

    // Agrupar gobernanzas por tipo de entidad
    const gobernanzasPorTipo = gobernanzasCompletas.reduce((acc, gobernanza) => {
      const tipoEntidad = gobernanza.tipoEntidadNombre || 'Sin clasificar';
      if (!acc[tipoEntidad]) {
        acc[tipoEntidad] = [];
      }
      acc[tipoEntidad].push(gobernanza);
      return acc;
    }, {} as Record<string, typeof gobernanzasCompletas>);

    // Obtener tipos de entidad ordenados
    const tiposEntidad = Object.keys(gobernanzasPorTipo).sort();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {tiposEntidad.map(tipoEntidad => {
          const gobernanzasDelTipo = gobernanzasPorTipo[tipoEntidad];
          const isExpanded = pageState.expandedAccordions.has(tipoEntidad);
          const cantidadGobernanzas = gobernanzasDelTipo.length;

          return (
            <div key={tipoEntidad} style={{
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              backgroundColor: colors.background,
              overflow: 'hidden'
            }}>
              {/* Header del acordeón */}
              <div
                onClick={() => toggleAccordion(tipoEntidad)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: colors.backgroundSecondary,
                  cursor: 'pointer',
                  borderBottom: isExpanded ? `1px solid ${colors.border}` : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: colors.primary + '20',
                    color: colors.primary
                  }}>
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: colors.textPrimary
                    }}>
                      {tipoEntidad}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: colors.textSecondary
                    }}>
                      {cantidadGobernanzas} {cantidadGobernanzas === 1 ? 'gobernanza' : 'gobernanzas'}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: colors.textSecondary
                }}>
                  <Badge
                    label={cantidadGobernanzas.toString()}
                    color={colors.primary}
                    size="s"
                    variant="subtle"
                  />
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {/* Contenido del acordeón */}
              {isExpanded && (
                <div style={{
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '12px'
                }}>
                  {gobernanzasDelTipo.map(gobernanza => {
                    // Extraer roles individuales
                    const owner = gobernanza.rolesAsignados?.find((r: any) => r.rolGobernanzaNombre === 'Owner')?.usuarioNombre;
                    const supervisor = gobernanza.rolesAsignados?.find((r: any) => r.rolGobernanzaNombre === 'Supervisor')?.usuarioNombre;
                    const ejecutor = gobernanza.rolesAsignados?.find((r: any) => r.rolGobernanzaNombre === 'Ejecutor')?.usuarioNombre;

                    return (
                      <GovernanceCard
                        key={gobernanza.gobernanzaId}
                        entidadId={gobernanza.entidadId}
                        organizacionId={gobernanza.organizacionId}
                        nombreEntidad={gobernanza.nombreEntidad}
                        nombreEmpresa={gobernanza.nombreEmpresa}
                        tipoEntidadNombre={gobernanza.tipoEntidadNombre}
                        nombre={gobernanza.nombre}
                        tipo={gobernanza.tipoGobiernoNombre}
                        codigo={`GOB-${gobernanza.gobernanzaId}`}
                        descripcion={gobernanza.observaciones || ''}
                        alertas={gobernanza.estaVencido ? 1 : 0}
                        propietario={owner || 'Sin asignar'}
                        supervisor={supervisor}
                        ejecutor={ejecutor}
                        activo={gobernanza.estado === 1}
                        tieneGobernanza={true}
                        fechaUltimaActualizacion={gobernanza.fechaCreacion}
                        vencimientoProximo={gobernanza.estaProximoAVencer}
                        onViewDetails={() => handleViewGobernanza(gobernanza)}
                        onEdit={() => handleEditGobernanza(gobernanza)}
                        onAssignGovernance={() => {}}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderEntitiesList = () => {
    // Mostrar spinner mientras se cargan los datos
    if (loadingGobernanzas) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '300px' 
        }}>
          <Spinner size="large" />
          <span style={{ marginLeft: '12px', color: colors.textSecondary }}>
            Cargando gobernanzas...
          </span>
        </div>
      );
    }

    // Mostrar estado de error si hay un error
    if (errorGobernanzas) {
      return (
        <EmptyState
          title="Error al cargar gobernanzas"
          description={errorGobernanzas}
          icon="AlertTriangle"
          actions={[
            {
              label: 'Reintentar',
              icon: 'RefreshCw',
              onClick: loadGobernanzasCompletas,
              primary: true
            }
          ]}
        />
      );
    }

    // Mostrar estado vacío solo si no hay datos y no se está cargando
    if (gobernanzasCompletas.length === 0) {
      return (
        <div>
          {/* Filtro por tipo de entidad */}
          <EntityTypeFilter
            tiposEntidad={tiposEntidad}
            selectedTipoEntidadId={filters.tipoEntidad || null}
            onFilterChange={(tipoEntidadId) => {
              setTipoEntidadFilter(tipoEntidadId);
              // También actualizar los datos locales con el filtro
              const filtrosAplicados = {
                tipoEntidad: tipoEntidadId
              };
              loadGobernanzasCompletas(filtrosAplicados);
            }}
            loading={loadingGobernanzas}
          />
          
          <EmptyState
            title="No hay gobernanzas disponibles"
            description="Las gobernanzas aparecerán aquí una vez que se configuren las asignaciones."
            icon="shield"
            actions={[
              {
                label: 'Actualizar',
                icon: 'RefreshCw',
                onClick: loadGobernanzasCompletas,
                primary: true
              }
            ]}
          />
        </div>
      );
    }

    const columns = [
      {
        id: 'gobernanzaId',
        header: 'ID',
        accessor: 'gobernanzaId' as keyof GobernanzaCompleta,
        width: '80px',
        align: 'center' as const,
        sortable: true
      },
      {
        id: 'nombre',
        header: 'Nombre',
        accessor: 'nombre' as keyof GobernanzaCompleta,
        sortable: true,
        render: (value: any, row: GobernanzaCompleta) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: '600', color: colors.text }}>{value}</span>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
              GOB-{row.gobernanzaId}
            </span>
          </div>
        )
      },
      {
        id: 'nombreEmpresa',
        header: 'Empresa',
        accessor: 'nombreEmpresa' as keyof GobernanzaCompleta,
        width: '150px',
        sortable: true,
        render: (value: any, row: GobernanzaCompleta) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '14px', color: colors.text, fontWeight: '500' }}>
              {value || 'N/A'}
            </span>
            <span style={{ fontSize: '11px', color: colors.textSecondary }}>
              ID: {row.organizacionId || 'N/A'}
            </span>
          </div>
        )
      },
      {
        id: 'nombreEntidad',
        header: 'Nombre de Entidad',
        accessor: 'nombreEntidad' as keyof GobernanzaCompleta,
        width: '180px',
        sortable: true,
        render: (value: any, row: GobernanzaCompleta) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '14px', color: colors.text, fontWeight: '500' }}>
              {value || 'N/A'}
            </span>
            <span style={{ fontSize: '11px', color: colors.textSecondary }}>
              ID: {row.entidadId}
            </span>
          </div>
        )
      },
      {
        id: 'tipoGobierno',
        header: 'Tipo de Gobierno',
        accessor: 'tipoGobiernoNombre' as keyof GobernanzaCompleta,
        sortable: true,
        render: (value: any) => (
          <Badge
            label={value || 'Sin tipo'}
            color={colors.primary}
            size="s"
            variant="subtle"
          />
        )
      },
      {
        id: 'rolesAsignados',
        header: 'Roles Asignados',
        accessor: (row: GobernanzaCompleta) => row.rolesAsignados.length,
        sortable: true,
        render: (value: any, row: GobernanzaCompleta) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: '500', color: colors.text }}>
              {value} roles
            </span>
            {row.rolesAsignados.length > 0 && (
              <span style={{ fontSize: '11px', color: colors.textSecondary }}>
                Owner: {row.rolesAsignados.find(r => r.rolGobernanzaNombre === 'Owner')?.usuarioNombre || 'Sin asignar'}
              </span>
            )}
          </div>
        )
      },
      {
        id: 'fechaAsignacion',
        header: 'Fecha Asignación',
        accessor: 'fechaAsignacion' as keyof GobernanzaCompleta,
        align: 'center' as const,
        sortable: true,
        render: (value: any) => (
          <span style={{ fontSize: '14px', color: colors.text }}>
            {new Date(value).toLocaleDateString()}
          </span>
        )
      },
      {
        id: 'vencimiento',
        header: 'Vencimiento',
        accessor: (row: GobernanzaCompleta) => row.estaVencido || row.estaProximoAVencer,
        align: 'center' as const,
        sortable: true,
        render: (value: any, row: GobernanzaCompleta) => {
          if (row.estaVencido) {
            return (
              <Badge
                label="Vencido"
                color="#ef4444"
                size="s"
              />
            );
          } else if (row.estaProximoAVencer) {
            return (
              <Badge
                label="Próximo"
                color="#f59e0b"
                size="s"
              />
            );
          } else {
            return (
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                Sin vencimiento
              </span>
            );
          }
        }
      },
      {
        id: 'estado',
        header: 'Estado',
        accessor: 'estadoTexto' as keyof GobernanzaCompleta,
        align: 'center' as const,
        sortable: true,
        render: (value: any, row: GobernanzaCompleta) => (
          <Badge
            label={value}
            color={row.estado === 1 ? '#10b981' : '#6b7280'}
            size="s"
            variant="subtle"
          />
        )
      },
      {
        id: 'acciones',
        header: 'Acciones',
        accessor: () => 'Ver detalles',
        align: 'center' as const,
        render: (value: any, row: GobernanzaCompleta) => (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewGobernanza(row);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#3b82f6'
              }}
              title="Ver detalles"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditGobernanza(row);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#F59E0B'
              }}
              title="Editar gobierno"
            >
              <Edit3 size={16} />
            </button>
          </div>
        )
      }
    ];

    return (
      <div>
        {/* Filtro por tipo de entidad */}
        <EntityTypeFilter
          tiposEntidad={tiposEntidad}
          selectedTipoEntidadId={filters.tipoEntidad || null}
          onFilterChange={(tipoEntidadId) => {
            setTipoEntidadFilter(tipoEntidadId);
            // También actualizar los datos locales con el filtro
            const filtrosAplicados = {
              tipoEntidad: tipoEntidadId
            };
            loadGobernanzasCompletas(filtrosAplicados);
          }}
          loading={loadingGobernanzas}
        />
        
        <Grid
          columns={columns}
          data={gobernanzasCompletas}
          pageSize={10}
          showPagination={true}
          loading={loadingGobernanzas}
          emptyMessage="No hay gobernanzas para mostrar"
          onRowClick={(row) => handleOpenDetail({ entidadId: row.entidadId })}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (loadingGobernanzas && gobernanzasCompletas.length === 0) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          gap: '16px'
        }}>
          <Spinner />
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            Cargando datos de gobernanza...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
          gap: '16px'
        }}>
          <AlertTriangle size={48} color={'#ef4444'} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', color: colors.text }}>
              Error al cargar datos
            </h3>
            <p style={{ margin: '0 0 16px 0', color: colors.textSecondary }}>
              {error}
            </p>
            <button
              onClick={refreshData}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    if (!configurationComplete) {
      return (
        <EmptyState
          title="Configuración Inicial Requerida"
          description="Antes de gestionar el gobierno, necesitas configurar los tipos de entidad, roles y tipos de gobierno."
          icon="settings"
          actions={[
            {
              label: 'Iniciar Configuración',
              icon: 'Settings',
              onClick: handleOpenConfiguration,
              primary: true
            }
          ]}
        />
      );
    }

    switch (pageState.viewMode) {
      case 'dashboard':
        return renderDashboard();
      case 'cards':
        return renderEntitiesGrid();
      case 'list':
        return renderEntitiesList();
      default:
        return renderDashboard();
    }
  };

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  return (
    <div className={styles.gobernanzaContainer}>
      {/* Header */}
      <PageHeader
        title="Gobierno"
        description="Gestión de responsabilidades y control de entidades"
        actions={[
          ...(configurationComplete ? [{
            label: 'Nuevo Gobierno',
            icon: 'Plus',
            onClick: handleOpenCreateGobernanza,
            variant: 'default' as const,
            primary: true
          }] : []),
          {
            label: 'Exportar Excel',
            icon: 'Download',
            onClick: handleExportarExcel,
            variant: 'default',
            excelStyle: true
          },
          {
            label: 'Configuración',
            icon: 'Settings',
            onClick: handleOpenConfiguration,
            variant: 'default'
          }
        ]}
      />

      {/* Barra de herramientas */}
      {configurationComplete && (
        <div style={{ marginBottom: '24px' }}>
          <SearchToolbar
            searchValue={filters.search}
            onSearchChange={handleSearch}
            searchPlaceholder="Buscar entidades..."
            actions={[
              {
                label: pageState.viewMode === 'dashboard' ? 'Dashboard' : pageState.viewMode === 'cards' ? 'Tarjetas' : 'Lista',
                icon: pageState.viewMode === 'dashboard' ? 'BarChart' : pageState.viewMode === 'cards' ? 'Layers' : 'List',
                onClick: () => {
                  const modes: Array<'dashboard' | 'cards' | 'list'> = ['dashboard', 'cards', 'list'];
                  const currentIndex = modes.indexOf(pageState.viewMode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  setPageState(prev => ({ ...prev, viewMode: nextMode }));
                }
              },
              {
                label: 'Filtrar',
                icon: 'Filter',
                onClick: () => setPageState(prev => ({ ...prev, filterModalOpen: true }))
              }
            ]}
          />
        </div>
      )}

      {/* Contenido principal */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '8px',
        padding: '24px',
        border: `1px solid ${colors.border}`
      }}>
        {renderContent()}
      </div>

      {/* Modal de detalle - OBSOLETO: Reemplazado por nuevos modales View/Edit */}
      {/* 
      {pageState.modalDetailOpen && pageState.selectedEntidadId && (
        <GovernanceDetailModal
          isOpen={pageState.modalDetailOpen}
          onClose={handleCloseDetail}
          entidad={{
            entidadId: pageState.selectedEntidadId,
            nombre: '',
            tipo: '',
            activo: false
          }}
          roles={[]}
          historial={[]}
          notificaciones={[]}
          usuariosDisponibles={[]}
          rolesDisponibles={rolesGobernanza}
          onAsignarRol={handleAsignarRol}
          onTransferirRol={handleTransferirRol}
          onRevocarRol={handleRevocarRol}
          onRenovarRol={handleRenovarRol}
          onMarcarNotificacionLeida={handleMarcarNotificacionLeida}
        />
      )}
      */}

      {/* Modal de filtros */}
      <FilterModal
        isOpen={pageState.filterModalOpen}
        onClose={() => setPageState(prev => ({ ...prev, filterModalOpen: false }))}
        onFilter={handleFilter}
        onExport={async () => []}
        filterControls={[
          {
            key: 'tipoEntidad',
            label: 'Tipo de Entidad',
            type: 'select',
            options: [
              { value: '', label: 'Todos' },
              ...tiposEntidad.map(tipo => ({
                value: tipo.tipoEntidadId?.toString() || '',
                label: tipo.tipoEntidadNombre || ''
              }))
            ]
          },
          {
            key: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { value: '', label: 'Todos' },
              { value: EstadoGobernanza.ACTIVO.toString(), label: 'Activo' }
            ]
          },
          {
            key: 'conAlertas',
            label: 'Con Alertas',
            type: 'checkbox'
          },
          {
            key: 'sinPropietario',
            label: 'Sin Propietario',
            type: 'checkbox'
          }
        ]}
      />

      {/* Wizard de configuración */}
      <GovernanceWizard
        isOpen={pageState.configModalOpen}
        onClose={handleCloseConfiguration}
        onComplete={handleCompleteConfiguration}
      />

      {/* Modal de crear gobernanza */}
      <GobernanzaForm
        isOpen={pageState.createGobernanzaModalOpen}
        mode="create"
        source="gobernanza"
        existingEntidadIds={gobernanzasCompletas.map((g: any) => g.entidadId).filter((id: any) => id !== null && id !== undefined)}
        onClose={handleCloseCreateGobernanza}
        onSubmit={handleCreateGobernanza}
        onCancel={handleCloseCreateGobernanza}
      />

      {/* Modal de ver gobernanza */}
      {pageState.selectedGobernanzaData && (
        <GobernanzaForm
          isOpen={pageState.viewGobernanzaModalOpen}
          mode="view"
          source="gobernanza"
          initialData={convertGobernanzaCompletaToFormData(pageState.selectedGobernanzaData)}
          onClose={handleCloseViewGobernanza}
          onSubmit={async () => {}} // No se usa en modo view
          onCancel={handleCloseViewGobernanza}
        />
      )}

      {/* Modal de editar gobernanza */}
      {pageState.selectedGobernanzaData && (
        <GobernanzaForm
          isOpen={pageState.editGobernanzaModalOpen}
          mode="edit"
          source="gobernanza"
          initialData={convertGobernanzaCompletaToFormData(pageState.selectedGobernanzaData)}
          onClose={handleCloseEditGobernanza}
          onSubmit={handleUpdateGobernanza}
          onCancel={handleCloseEditGobernanza}
        />
      )}
    </div>
  );
};