import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Download, Upload, Settings, Grid, List, GitBranch, BarChart3, Server, Shield, Users, Activity, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input/input';
import { Modal } from '../../ui/modal/Modal';
import { SystemsGrid } from '../../ui/systems-grid';
import { SystemsList } from '../../ui/systems-list';
import { Grid as DataGrid, GridColumn, GridAction } from '../../ui/grid/Grid';
import { SystemCard } from '../../ui/system-card';
import { SystemTypeIcon } from '../../ui/system-type-icon';
import { HierarchyIndicator } from '../../ui/hierarchy-indicator';
import { StatusBadge } from '../../ui/status-badge';
import { SystemModal } from '../../ui/system-modal';
import { SystemDetailModal } from '../../ui/system-detail-modal';
import { DeleteConfirmationModal } from '../../ui/delete-confirmation';
import { HierarchyModal } from '../../ui/hierarchy-modal';
import { BulkUpload } from '../../ui/bulk-upload';
import { DataPreviewTable } from '../../ui/data-preview-table';
import { ImportProgressModal } from '../../ui/import-progress-modal';
import { AdvancedExport } from '../../ui/advanced-export';
import { SystemsAnalytics } from '../../ui/systems-analytics';
import { MenuCard, MenuGrid } from '../../ui/menu-card';
import { SelectorItemsModal } from '../../ui/menu-card/selector-items/SelectorItemsModal';
import { PageHeader } from '../../ui/page-header';
import { SearchToolbar } from '../../ui/search-toolbar';
import { EmptyState } from '../../ui/empty-state';
import { GobernanzaForm } from '../../ui/gobernanza-form/GobernanzaForm';
import { ApprovalTracker } from '../../ui/approval-tracker';
import { CRUDConfirmationModal } from '../../ui/crud-confirmation-modal';
import { StepperSystemForm, transformBackendDataToFormData } from '../../ui/stepper-system-form';
import { notificationService } from '../../../services/notification.service';
import { gobernanzaRolService } from '../../../services/gobernanza-rol.service';
import { gobernanzaService } from '../../../services/gobernanza.service';
import { tipoEntidadService } from '../../../services/tipo-entidad.service';
import { TipoEntidadCodigos } from '../../../services/types/tipo-entidad.types';

import { useSistemas } from '../../../hooks/useSistemas';
import { useAuth } from '../../../hooks/useAuth';
import { sistemasService } from '../../../services/sistemas.service';
import { tipoSistemaService } from '../../../services/tipo-sistema.service';
import { familiaSistemaService } from '../../../services/familia-sistema.service';
import { servidoresService } from '../../../services/servidores.service';
import { 
  Sistema, 
  CreateSistemaDto, 
  CreateModuloDto, 
  getTipoSistemaLabel,
  getFamiliaSistemaLabel,
  EstadoSistema,
  getEstadoSistemaLabel
} from '../../../models/Sistemas';
import { Sistema as SistemaDto } from '../../../services/types/sistemas.types';
import { 
  SistemaImportResult, 
  ExcelSistemasParseResult,
  ParsedSistemaData
} from '../../../utils/excelSistemasParser';
import { AlertService } from '../../ui/alerts';
import { ViewMode } from '../../ui/view-toggle';
import { retry } from '../../../utils/retry';
import styles from './Sistemas.module.css';


// Importar función de mocks para seguimiento SOE


// =============================================
// TIPOS PARA BULK IMPORT
// =============================================

// Importar tipos del service
import { 
  BulkImportRequest, 
  BulkImportSistemaRequest, 
  BulkImportModuloRequest,
  BulkImportResponseData
} from '../../../services/types/sistemas.types';

export interface SistemasProps {
  className?: string;
  onNavigate?: (page: string) => void; // Para navegaciÃ³n interna
}

export const Sistemas: React.FC<SistemasProps> = ({
  className = '',
  onNavigate
}) => {
  const { colors, theme } = useTheme();
  
  // ðŸ”§ REPLICANDO CASO EXITOSO: Obtener organizationInfo desde useAuth
  const { organizationInfo, gobernanzaRol } = useAuth();
  
  const {
    sistemas,
    allSistemas,
    loading,
    error,
    filters,
    pagination,
    setPage,
    setPageSize,
    setSearch,
    refreshSistemas,
    createSistema,
    updateSistema,
    deleteSistema
  } = useSistemas();

  // ðŸ”’ PROTECCIÃ“N: Los arrays ya vienen seguros del hook
  const safeSistemas = sistemas || [];
  const safeAllSistemas = allSistemas || [];
  
  // Estados para modales
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [systemModalOpen, setSystemModalOpen] = useState(false);
  const [selectedSystemForEdit, setSelectedSystemForEdit] = useState<Sistema | null>(null);
  const [systemDetailModalOpen, setSystemDetailModalOpen] = useState(false);
  const [selectedSystemForView, setSelectedSystemForView] = useState<Sistema | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSystemForDelete, setSelectedSystemForDelete] = useState<Sistema | null>(null);
  const [hierarchyModalOpen, setHierarchyModalOpen] = useState(false);
  const [selectedSystemForHierarchy, setSelectedSystemForHierarchy] = useState<number | undefined>(undefined);
  
  // Estados para carga masiva
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [importProgressModalOpen, setImportProgressModalOpen] = useState(false);
  const [importProgressStatus, setImportProgressStatus] = useState<'loading' | 'completed'>('loading');
  const [importResult, setImportResult] = useState<BulkImportResponseData | undefined>(undefined);
  const [parseResult, setParseResult] = useState<ExcelSistemasParseResult | null>(null);
  const [selectedSystemsForImport, setSelectedSystemsForImport] = useState<ParsedSistemaData[]>([]);
  
  // Estados para analytics
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsSystems, setAnalyticsSystems] = useState<Sistema[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Estados para exportación avanzada
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [allSystemsForExport, setAllSystemsForExport] = useState<SistemaDto[]>([]);
  const [loadingAllSystems, setLoadingAllSystems] = useState(false);
  
  // Estados para jerarquÃ­a con precarga
  // Estados para menú y selector
  const [showMenu, setShowMenu] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorMode, setSelectorMode] = useState<"edit" | "delete" | "gobernanza" | null>(null);

  const openSelector = (mode: 'edit' | 'delete' | 'gobernanza') => {
    setSelectorMode(mode);
    setSelectorOpen(true);
  };

  const handleSelectorSelect = (sistema: Sistema) => {
    if (!selectorMode) return;
    if (selectorMode === 'edit') {
      // Usa el stepper de edición existente
      handleEditSystemStepper(sistema);
      setSelectorOpen(false);
      setShowMenu(false);
    } else if (selectorMode === 'delete') {
      handleDeleteSystem(sistema);
      setSelectorOpen(false);
      setShowMenu(false);
    } else if (selectorMode === 'gobernanza') {
      handleSystemGovernance(sistema);
      setSelectorOpen(false);
      setShowMenu(false);
    }
  };

  const selectorColumns: GridColumn<Sistema>[] = [
    { id: 'nombre', header: 'Nombre', accessor: 'nombreSistema', width: '40%' },
    { id: 'codigo', header: 'Código', accessor: 'codigoSistema', width: '20%' },
    { id: 'tipo', header: 'Tipo', accessor: 'tipoSistema', width: '20%', render: (v) => getTipoSistemaLabel(v as number) },
    { id: 'estado', header: 'Estado', accessor: 'estado', width: '20%', render: (v) => getEstadoSistemaLabel(v as number) }
  ];
  const [allSystemsForHierarchy, setAllSystemsForHierarchy] = useState<Sistema[]>([]);
  const [loadingAllSystemsForHierarchy, setLoadingAllSystemsForHierarchy] = useState(false);
  
  // Estados para selecciÃ³n mÃºltiple en vista de lista
  const [selectedSystemsForBatch, setSelectedSystemsForBatch] = useState<number[]>([]);
  
  // Estados para gobernanza SOE
  const [gobernanzaFormOpen, setGobernanzaFormOpen] = useState(false);
  const [selectedSystemForGovernance, setSelectedSystemForGovernance] = useState<Sistema | null>(null);
  const [gobernanzaData, setGobernanzaData] = useState<any>(null);
  const [gobernanzaMode, setGobernanzaMode] = useState<'create' | 'edit' | 'view'>('create');
  const [loadingGobernanza, setLoadingGobernanza] = useState(false);
  
  // Estados para seguimiento de aprobaciones
  const [approvalTrackingModalOpen, setApprovalTrackingModalOpen] = useState(false);
  const [selectedSystemForApproval, setSelectedSystemForApproval] = useState<Sistema | null>(null);
  
  // Estados para StepperSystemForm
  const [stepperFormOpen, setStepperFormOpen] = useState(false);
  const [stepperFormMode, setStepperFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSystemForStepper, setSelectedSystemForStepper] = useState<Sistema | null>(null);
  
  // Estados para eliminación con gobernanza SOE
  const [showCRUDDeleteModal, setShowCRUDDeleteModal] = useState(false);
  
  // =============================================
  // FUNCIONES PARA GOBERNANZA
  // =============================================

  // Función para convertir datos de gobernanza al formato del formulario
  const convertGobernanzaToFormData = (gobernanza: any) => {
    if (!gobernanza) return null;
    
    return {
      gobernanzaId: gobernanza.gobernanzaId,
      tipoGobiernoId: gobernanza.tipoGobiernoId,
      tipoEntidadId: gobernanza.tipoEntidadId,
      entidadId: gobernanza.entidadId,
      organizacionId: gobernanza.organizacionId,
      nombre: gobernanza.nombre || '',
      fechaAsignacion: gobernanza.fechaAsignacion,
      fechaVencimiento: gobernanza.fechaVencimiento || '',
      observaciones: gobernanza.observaciones || '',
      gobernanzaRoles: (gobernanza.rolesAsignados || []).map((rol: any, index: number) => ({
        id: `existing-${rol.gobernanzaRolId}`,
        gobernanzaRolId: rol.gobernanzaRolId,
        rolGobernanzaId: rol.rolGobernanzaId,
        usuarioId: rol.usuarioId,
        fechaAsignacion: rol.fechaAsignacion,
        ordenEjecucion: rol.ordenEjecucion || 0,
        puedeEditar: rol.puedeEditar || false,
        estado: rol.estado,
        isNew: false,
        isEditing: false,
        hasErrors: false
      }))
    };
  };

  // Función para cargar gobernanza existente
  const loadGobernanzaForSystem = async (sistema: Sistema) => {
    setLoadingGobernanza(true);
    try {
      const tipoEntidadId = 1; // Sistemas
      const entidadId = sistema.tieneGobernanzaPropia ? sistema.sistemaId : -1;
      
      const response = await gobernanzaService.getGobernanzasPorEntidad(tipoEntidadId, entidadId);
      
      if (response.success && response.data && response.data.length > 0) {
        // Existe gobernanza, modo edición
        const gobernanzaExistente = response.data[0];
        const formData = convertGobernanzaToFormData(gobernanzaExistente);
        setGobernanzaData(formData);
        setGobernanzaMode('edit');
      } else {
        // No existe gobernanza, modo creación
        setGobernanzaData(null);
        setGobernanzaMode('create');
      }
    } catch (error: any) {
      console.error('Error al cargar gobernanza:', error);
      AlertService.error('Error al cargar datos de gobernanza: ' + (error.message || 'Error desconocido'));
      setGobernanzaData(null);
      setGobernanzaMode('create');
    } finally {
      setLoadingGobernanza(false);
    }
  };

  // 🔧 FUNCIÓN: Determinar estado del sistema basado en rol de gobernanza
  const getSistemaEstado = (action: 'CREATE' | 'UPDATE' | 'DELETE', isBorrador: boolean = false): number => {
    // Si el rol es "EJ" (Ejecutivo)
    if (gobernanzaRol?.rolGobernanzaCodigo === 'EJ') {
      if (action === 'CREATE') {
        // Para crear: Borrador (-4) o IniciarFlujo (-3)
        return isBorrador ? EstadoSistema.Borrador : EstadoSistema.IniciarFlujo;
      } else {
        // Para editar/eliminar: siempre IniciarFlujo (-3)
        return EstadoSistema.IniciarFlujo;
      }
    }
    
    // Para otros roles (por defecto): IniciarFlujo (-3)
    return EstadoSistema.IniciarFlujo;
  };
  
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleNewSystem = () => {
    // Limpiar cualquier sistema seleccionado para edición
    setSelectedSystemForStepper(null);
    setStepperFormMode('create');
    // Abrir el StepperSystemForm en modo creación
    setStepperFormOpen(true);
  };

  const handleEditSystemStepper = (sistema: Sistema) => {
    // Función específica para editar sistemas con StepperSystemForm
    // Especialmente útil para el sistema con id=14
    setSelectedSystemForStepper(sistema);
    setStepperFormMode('edit');
    setStepperFormOpen(true);
  };

  const handleStepperFormSubmit = async (formData: any) => {
    try {
      const { saveType, ...systemData } = formData;
      
      if (stepperFormMode === 'create') {
        await createSistema(systemData);
        if (saveType === 'draft') {
          AlertService.success('Sistema guardado como borrador exitosamente');
        } else {
          AlertService.success('Sistema creado y enviado para aprobación exitosamente');
        }
      } else {
        await updateSistema(systemData);
        if (saveType === 'draft') {
          AlertService.success('Sistema actualizado como borrador exitosamente');
        } else {
          AlertService.success('Sistema actualizado y enviado para aprobación exitosamente');
        }
      }
      
      // Cerrar el formulario y refrescar datos
      setStepperFormOpen(false);
      setSelectedSystemForStepper(null);
      refreshSistemas();
    } catch (error) {
      console.error('Error al guardar sistema:', error);
      AlertService.error('Error al guardar el sistema');
    }
  };

  const handleLoadReferenceData = async () => {
    try {
      const orgId = Number(organizationInfo?.id ?? 1);
      const [tiposSistemaResponse, familiasSistemaResponse, sistemasResponse, servidoresResponse, gobernanzasResponse] = await Promise.all([
        tipoSistemaService.getAllTiposSistema({}),
        familiaSistemaService.getAllFamiliasSistema({ organizationId: orgId }),
        sistemasService.getAllSistemas({ organizacionId: orgId }),
        servidoresService.getAllServidores({ organizationId: orgId, includeDeleted: false }),
        gobernanzaService.getAllGobernanzas({
          tipoEntidadId: 1, // TipoEntidadAsociacion.SISTEMA
          organizacionId: orgId,
          includeDeleted: false
        })
      ]);

      // Transformar tipos de sistema al formato esperado (tolerante a mayúsculas/variantes)
      const tiposSistemaTransformed = tiposSistemaResponse.success && tiposSistemaResponse.data 
        ? tiposSistemaResponse.data.map((tipo: any) => ({
            id: tipo.id ?? tipo.tipoSistemaId ?? tipo.TipoSistemaId,
            nombre: tipo.nombre ?? tipo.tipoSistemaNombre ?? tipo.TipoSistemaNombre,
            descripcion: tipo.descripcion ?? tipo.tipoSistemaDescripcion ?? tipo.TipoSistemaDescripcion
          }))
        : [];

      // Transformar familias de sistema al formato esperado (tolerante a mayúsculas/variantes)
      const familiasSistemaTransformed = familiasSistemaResponse.success && familiasSistemaResponse.data 
        ? familiasSistemaResponse.data.map((familia: any) => ({
            id: familia.FamiliaSistemaId ?? familia.familiaSistemaId ?? familia.id,
            nombre: familia.FamiliaSistemaNombre ?? familia.familiaSistemaNombre ?? familia.nombre,
            descripcion: familia.FamiliaSistemaDescripcion ?? familia.familiaSistemaDescripcion ?? familia.descripcion
          }))
        : [];

      // Transformar sistemas al formato esperado (tolerante a mayúsculas/variantes)
      const sistemasTransformed = sistemasResponse.success && sistemasResponse.data 
        ? sistemasResponse.data.map((sistema: any) => ({
            id: sistema.sistemaId ?? sistema.id,
            nombre: sistema.nombreSistema ?? sistema.nombre,
            codigo: sistema.codigoSistema ?? sistema.codigo
          }))
        : [];

      // Transformar servidores al formato esperado (tolerante a mayúsculas/variantes)
      const servidoresTransformed = servidoresResponse.success && servidoresResponse.data 
        ? servidoresResponse.data.map((servidor: any) => ({
            id: servidor.servidorId ?? servidor.id,
            nombre: servidor.nombreServidor ?? servidor.nombre
          }))
        : [];

      // Transformar gobernanzas al formato esperado por Stepper (GobernanzaRef)
      const gobernanzasTransformed = gobernanzasResponse.success && gobernanzasResponse.data
        ? gobernanzasResponse.data.map((g: any) => {
            const id = g.gobernanzaId ?? g.GobernanzaId ?? g.id ?? g.Id;
            const nombre = g.nombre ?? g.Nombre ?? `Gobernanza ${id}`;
            return { id, nombre };
          })
        : [];

      const referenceData = {
        tiposSistema: tiposSistemaTransformed,
        familiasSistema: familiasSistemaTransformed,
        sistemas: sistemasTransformed,
        servidores: servidoresTransformed,
        gobernanzas: gobernanzasTransformed
      };

      console.log('📊 [Sistemas] Datos de referencia cargados:', {
        tiposSistema: tiposSistemaTransformed.length,
        familiasSistema: familiasSistemaTransformed.length,
        sistemas: sistemasTransformed.length,
        servidores: servidoresTransformed.length,
        gobernanzas: gobernanzasTransformed.length
      });

      return referenceData;
    } catch (error) {
      console.error('Error al cargar datos de referencia:', error);
      AlertService.error('Error al cargar datos de referencia');
      return {
        tiposSistema: [],
        familiasSistema: [],
        sistemas: [],
        servidores: []
      };
    }
  };

  const handleStepperFormCancel = () => {
    setStepperFormOpen(false);
    setSelectedSystemForStepper(null);
    
    // Forzar un re-render de los componentes para limpiar cualquier estado residual
    setTimeout(() => {
      // Esto ayuda a limpiar cualquier listener o estado que pueda estar interfiriendo
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  const handleServidores = () => {

    
    // âœ… NAVEGACIÃ“N INTERNA: Usar el mismo mecanismo que el sidebar
    if (onNavigate) {
      onNavigate('servidores');
    } else {
      console.warn('handleServidores: onNavigate no disponible - agregar prop al componente');
    }
  };

  const handleGobernanza = () => {
    setGobernanzaFormOpen(true);
  };

  const handleApprovalTracking = (sistema: Sistema) => {
    setSelectedSystemForApproval(sistema);
    setApprovalTrackingModalOpen(true);
  };

  // Función para manejar la gobernanza de un sistema específico
  const handleSystemGovernance = async (sistema: Sistema) => {
    try {
      // Almacenar el sistema seleccionado
      setSelectedSystemForGovernance(sistema);
      
      setLoadingGobernanza(true);
      
      // Si el sistema tiene gobernanzaId, usar getGobernanzaById directamente
      if (sistema.gobernanzaId) {
        try {
          const response = await gobernanzaService.getGobernanzaById(sistema.gobernanzaId);
          
          if (response.success && response.data) {
            // Existe gobernanza, modo edición
            const formData = convertGobernanzaToFormData(response.data);
            setGobernanzaData(formData);
            setGobernanzaMode('edit');
          } else {
            // Error al obtener gobernanza, usar método anterior como fallback
            await loadGobernanzaForSystem(sistema);
          }
        } catch (error) {
          console.warn('Error al obtener gobernanza por ID, usando método alternativo:', error);
          // Fallback al método anterior
          await loadGobernanzaForSystem(sistema);
        }
      } else {
        // No tiene gobernanzaId, usar el método anterior
        await loadGobernanzaForSystem(sistema);
      }
      
      // Abrir el modal de gobernanza
      setGobernanzaFormOpen(true);
      
      // Debug: Abriendo gobernanza para sistema
      
    } catch (error: any) {
      console.error('Error al abrir gobernanza:', error);
      AlertService.error('Error al cargar gobernanza: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoadingGobernanza(false);
    }
  };



  const handleCRUDDeleteConfirmation = async (action: 'BORRADOR' | 'NOTIFICAR') => {
    if (!selectedSystemForDelete) return;

    setShowCRUDDeleteModal(false);
    
    const actionText = action === 'BORRADOR' ? 'Guardando borrador de eliminación' : 'Procesando solicitud de eliminación';
    const loadingToastId = AlertService.loading(`${actionText}...`);

    try {
      // 🔧 NUEVA LÓGICA: Usar estado basado en rol de gobernanza
      const estado = getSistemaEstado('DELETE', action === 'BORRADOR');
      
      // Actualizar el sistema con el nuevo estado
      const sistemaActualizado = {
        ...selectedSystemForDelete,
        estado: estado,
        // ✅ Flags para que el backend identifique la intención de eliminación
        esEliminacion: true,
        registroEliminadoSolicitado: action === 'NOTIFICAR'
      };

      // Llamar al servicio para actualizar el sistema
      await updateSistema(sistemaActualizado);

      if (action === 'BORRADOR') {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          '¡Borrador de eliminación guardado! El sistema está en estado borrador.',
          3000
        );
      } else {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          '⚠️ Solicitud de eliminación enviada. El sistema está en proceso de aprobación.',
          5000
        );
      }

      // Limpiar estado
      setSelectedSystemForDelete(null);
      
      // Refrescar la lista de sistemas
      refreshSistemas();

    } catch (error) {
      console.error('Error al procesar eliminación:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado al procesar la solicitud';

      AlertService.updateLoading(
        loadingToastId,
        'error',
        `Error: ${errorMessage}`,
        5000
      );
    }
  };

  const handleCRUDDeleteCancel = () => {
    setShowCRUDDeleteModal(false);
    setSelectedSystemForDelete(null);
  };



  const handleHierarchyManagement = async (sistemaId?: number) => {
    // ðŸ”’ PROTECCIÃ“N: Verificar que tenemos organizationId
    if (!organizationInfo?.id) {
              AlertService.error('No se pudo obtener la información de la organización para gestión de jerarquías');
      return;
    }

    try {
      setLoadingAllSystemsForHierarchy(true);
      
      // ðŸ“Š PRECARGA: Obtener TODOS los sistemas de la organizaciÃ³n para jerarquÃ­as
      const response = await sistemasService.getSistemasPaginated({
        organizacionId: organizationInfo.id,
        page: 1,
        pageSize: 1000, // Obtener mÃ¡ximo 1000 sistemas
        includeDeleted: false
      });

      if (response.success && response.data) {
        const responseData: any = response.data || {};
        
        // Extraer sistemas del array principal
        const sistemasArray = Array.isArray(responseData.items) ? responseData.items : 
                             Array.isArray(responseData.data) ? responseData.data : 
                             Array.isArray(responseData) ? responseData : [];

        // Mapear a modelo local usando la misma funciÃ³n que useSistemas
        const sistemasLocal = sistemasArray.map((sistemaAPI: any) => ({
          sistemaId: sistemaAPI.sistemaId || sistemaAPI.id,
          organizacionId: sistemaAPI.organizacionId || 1,
          codigoSistema: sistemaAPI.codigoSistema || sistemaAPI.codigo || null,
          nombreSistema: sistemaAPI.nombreSistema || sistemaAPI.nombre,
          funcionPrincipal: sistemaAPI.funcionPrincipal || sistemaAPI.descripcion || null,
          sistemaDepende: sistemaAPI.sistemaDepende || sistemaAPI.sistemaParentId || null,
          tipoSistema: sistemaAPI.tipoSistemaId || sistemaAPI.tipoSistema || 1,
          familiaSistema: sistemaAPI.familiaSistemaId || sistemaAPI.familiaSistema || 1,
          version: sistemaAPI.version || 1,
          estado: sistemaAPI.estado !== undefined ? sistemaAPI.estado : 1,
          creadoPor: sistemaAPI.creadoPor || null,
          fechaCreacion: sistemaAPI.fechaCreacion || new Date().toISOString(),
          actualizadoPor: sistemaAPI.actualizadoPor || null,
          fechaActualizacion: sistemaAPI.fechaActualizacion || null,
          registroEliminado: sistemaAPI.registroEliminado || false,
          modulos: sistemaAPI.modulos || [],
          url: sistemaAPI.url || null,
          idServidor: sistemaAPI.idServidor || null
        })).filter(Boolean);
        
        setAllSystemsForHierarchy(sistemasLocal);
        // Configurar sistema seleccionado y abrir modal
        // Si no se especifica un sistema, usar el primer sistema disponible
        const targetSystemId = sistemaId || sistemasLocal[0]?.sistemaId;
        
        if (!targetSystemId) {
          AlertService.error('No hay sistemas disponibles para gestión de jerarquías');
          return;
        }
        
        setSelectedSystemForHierarchy(targetSystemId);
        setHierarchyModalOpen(true);
        

        
        AlertService.success(`Datos cargados: ${sistemasLocal.length} sistemas disponibles para jerarquías`);
      } else {
        console.error('âŒ Error al precargar sistemas para jerarquÃ­as:', response.errors || response.message);
        AlertService.error('Error al cargar los datos para gestión de jerarquías');
      }
    } catch (error) {
      console.error('ðŸ’¥ Error inesperado al precargar sistemas para jerarquÃ­as:', error);
      AlertService.error('Error inesperado al cargar los datos. Intenta nuevamente.');
    } finally {
      setLoadingAllSystemsForHierarchy(false);
    }
  };

  const handleImport = () => {
    setBulkUploadModalOpen(true);
  };

  // Manejar validaciÃ³n exitosa del archivo Excel
  const handleBulkUploadValidationComplete = (result: ExcelSistemasParseResult) => {
    setParseResult(result);
    setBulkUploadModalOpen(false);
    setPreviewModalOpen(true);
    
    // Pre-seleccionar sistemas vÃ¡lidos (sin errores)
    const sistemasResult = result.sistemas || [];
    const validSystems = sistemasResult.filter(s => {
      const errors = s.errors || [];
      return Array.isArray(errors) && errors.length === 0;
    });
    setSelectedSystemsForImport(validSystems);
    
    // 🔍 Mostrar los datos parseados del Excel
    console.log('📊 Datos parseados del Excel:', JSON.stringify(result, null, 2));
    console.log('✅ Sistemas válidos seleccionados:', validSystems.length, 'de', sistemasResult.length);
  };

  // Cancelar carga masiva
  const handleBulkUploadCancel = () => {
    setBulkUploadModalOpen(false);
    setParseResult(null);
    setSelectedSystemsForImport([]);
  };

  // Cancelar preview
  const handlePreviewCancel = () => {
    setPreviewModalOpen(false);
    // Volver al upload
    setBulkUploadModalOpen(true);
  };

  // Confirmar importaciÃ³n
  const handleConfirmImport = async () => {
    const systemsToImport = selectedSystemsForImport || [];
    if (systemsToImport.length === 0) {
      AlertService.warning('Selecciona al menos un sistema para importar');
      return;
    }

    // ðŸ”’ PROTECCIÃ“N: Verificar que tenemos organizationId
    if (!organizationInfo?.id) {
              AlertService.error('No se pudo obtener la información de la organización');
      return;
    }

    try {
      // Construir objeto para bulk import al backend
      const bulkImportData = buildBulkImportObject(systemsToImport, organizationInfo.id);
      
      // Cerrar modal de preview y mostrar progreso
      setPreviewModalOpen(false);
      setImportProgressModalOpen(true);
      setImportProgressStatus('loading');
      setImportResult(undefined);

      // ðŸš€ LLAMADA REAL AL BACKEND
      const response = await sistemasService.bulkImport(bulkImportData);
      
      if (response.success) {
        const data = response.data;
        
        // Actualizar estado del modal con resultados
        setImportProgressStatus('completed');
        setImportResult(data);
        
        // Mostrar resumen de Ã©xito
        AlertService.success(
          `✅ Importación completada: ${data.sistemasCreados}/${data.totalSistemasProcesados} sistemas creados, ${data.modulosCreados} módulos creados`
        );
        
        // âœ… REFRESH: Actualizar la grilla despuÃ©s de importaciÃ³n exitosa
        refreshSistemas();
        
        // 🔧 NUEVO: Cerrar todos los modales de carga masiva automáticamente después del éxito
        setTimeout(() => {
          setImportProgressModalOpen(false);
          setImportProgressStatus('loading');
          setImportResult(undefined);
          
          // También cerrar modales de upload y preview si están abiertos
          setBulkUploadModalOpen(false);
          setPreviewModalOpen(false);
        }, 2000); // Esperar 2 segundos para que el usuario vea el mensaje de éxito
        
        // Limpiar estados de selecciÃ³n
        setParseResult(null);
        setSelectedSystemsForImport([]);
        
      } else {
        // Manejo de errores del backend
        const errorMessage = response.errors?.join(', ') || response.message || 'Error desconocido en la importación';
        AlertService.error(`âŒ Error en la importación: ${errorMessage}`);
        
        // En caso de error, cerrar el modal
        setImportProgressModalOpen(false);
        setImportProgressStatus('loading');
        setImportResult(undefined);
      }
      
    } catch (error) {
      console.error('ðŸ’¥ Error inesperado en bulk import:', error);
      AlertService.error('âŒ Error inesperado durante la importación. Revisa la consola para más detalles.');
      setImportProgressModalOpen(false);
    }
  };

  // FunciÃ³n para construir el objeto de bulk import
  const buildBulkImportObject = (systemsData: ParsedSistemaData[], organizacionId: number): BulkImportRequest => {
    const bulkData: BulkImportRequest = {
      organizacionId,
      sistemas: systemsData.map(sistema => {
        // Construir mÃ³dulos primero
        const modulosRequest: BulkImportModuloRequest[] = sistema.modulos.map(moduloString => {
          // Los mÃ³dulos vienen como string: "SAP FI - MÃ³dulo Financiero"
          const parts = moduloString.split(' - ');
          const nombreModulo = parts[0]?.trim() || moduloString;
          const funcionModulo = parts[1]?.trim() || nombreModulo;

          return {
            nombreModulo,
            funcionModulo,
            estado: 1, // Activo por defecto
            creadoPor: 1 // Usuario actual (temporal - se deberÃ­a obtener del contexto de auth)
          };
        });

        // Construir sistema segÃºn estructura del backend
        const sistemaRequest: BulkImportSistemaRequest = {
          codigo: sistema.sistema.codigoSistema || `SYS-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          nombre: sistema.sistema.nombreSistema,
          descripcion: sistema.sistema.funcionPrincipal || undefined,
          version: '1.0',
          familiaSistemaId: sistema.sistema.familiaSistema,
          tipoSistemaId: sistema.sistema.tipoSistema, // âœ… Nuevo campo requerido
          codigoSistemaDepende: sistema.sistema.sistemaDepende || undefined, // âœ… Mapear sistemaDepende del Excel
          tieneGobernanzaPropia: false, // Por defecto false en carga masiva
          idServidor: undefined, // Se podrÃ­a obtener del Excel si se aÃ±ade la columna
          estado: 1, // Activo por defecto
          creadoPor: 1, // âœ… Nuevo campo requerido
          modulos: modulosRequest
        };

        return sistemaRequest;
      })
    };

    console.log('🔍 Resultado del mapeo de carga masiva:', JSON.stringify(bulkData, null, 2));
    return bulkData;
  };



  // Cerrar modal de progreso
  const handleImportProgressClose = () => {
    setImportProgressModalOpen(false);
    setImportProgressStatus('loading');
    setImportResult(undefined);
    // Limpiar estados restantes si no se hizo antes
    setParseResult(null);
    setSelectedSystemsForImport([]);
  };

  // Funciones para crear sistemas y mÃ³dulos (conectar con API real)
  const handleCreateSistemaForImport = async (data: CreateSistemaDto) => {
    // Convertir CreateSistemaDto al formato esperado por useSistemas
    const sistemaData = {
      organizacionId: data.organizacionId,
      nombreSistema: data.nombreSistema,
      codigoSistema: data.codigoSistema || null,
      funcionPrincipal: data.funcionPrincipal || null,
      tipoSistema: data.tipoSistema,
      familiaSistema: data.familiaSistema,
      sistemaDepende: data.sistemaDepende || null,
      estado: EstadoSistema.ACTIVO,
      creadoPor: 1, // ID del usuario actual
      actualizadoPor: null,
      fechaActualizacion: null
    };
    return await createSistema(sistemaData);
  };

  const handleCreateModuloForImport = async (data: CreateModuloDto) => {
    // TODO: Implementar createModulo en el hook useSistemas
    return { sistemaModuloId: Date.now(), ...data };
  };

  const handleExport = async () => {
    // ðŸ”’ PROTECCIÃ“N: Verificar que tenemos organizationId
    if (!organizationInfo?.id) {
              AlertService.error('No se pudo obtener la información de la organización para la exportación');
      return;
    }

    try {
      setLoadingAllSystems(true);
      
      // ðŸ“Š PRECARGA: Obtener TODOS los sistemas de la organizaciÃ³n para la exportaciÃ³n
      const response = await sistemasService.getSistemasPaginated({
        organizacionId: organizationInfo.id,
        page: 1,
        pageSize: 1000, // Obtener mÃ¡ximo 1000 sistemas
        includeDeleted: false
      });

      if (response.success && response.data) {
        const allSystems = response.data.data || [];
        setAllSystemsForExport(allSystems);
        // Abrir modal solo despuÃ©s de cargar los datos
        setExportModalOpen(true);
        
        AlertService.success(`Datos cargados: ${allSystems.length} sistemas listos para exportar`);
      } else {
        console.error('âŒ Error al precargar sistemas:', response.errors || response.message);
        AlertService.error('Error al cargar los datos para exportación');
      }
    } catch (error) {
      console.error('ðŸ’¥ Error inesperado al precargar sistemas:', error);
      AlertService.error('Error inesperado al cargar los datos. Intenta nuevamente.');
    } finally {
      setLoadingAllSystems(false);
    }
  };

  const handleExportExecute = async (config?: any) => {
    // La exportaciÃ³n ya se maneja dentro del AdvancedExport
    // Solo necesitamos cerrar el modal despuÃ©s de una exportaciÃ³n exitosa
    if (config) {
      // Cerrar modal despuÃ©s de exportaciÃ³n exitosa
      setTimeout(() => {
        setExportModalOpen(false);
        // Limpiar datos de exportaciÃ³n para liberar memoria
        setAllSystemsForExport([]);
      }, 2000); // 2 segundos para que el usuario vea el mensaje de Ã©xito
    }
  };

  const handleEditSystem = (sistema: Sistema) => {
    setSelectedSystemForEdit(sistema);
    setSystemModalOpen(true);
  };

  const handleDeleteSystem = async (sistema: Sistema) => {
    try {
      // Resolver dinámicamente el TipoEntidad para Sistemas (evitar hardcode 1)
      const tipoEntidadResp = await tipoEntidadService.getTipoEntidadByCodigo(TipoEntidadCodigos.Sistema);
      const tipoEntidadId = tipoEntidadResp.success ? tipoEntidadResp.data?.tipoEntidadId : undefined;

      if (!tipoEntidadId) {
        // Fallback: intentar buscar por nombre si no se obtuvo por código
        const tiposResp = await tipoEntidadService.getAllTiposEntidad({ includeDeleted: false });
        const tipoSistema = tiposResp.success ? (tiposResp.data || []).find(t => 
          t.tipoEntidadCodigo?.toUpperCase() === TipoEntidadCodigos.Sistema ||
          t.tipoEntidadNombre?.toLowerCase()?.includes('sistema')
        ) : undefined;
        if (!tipoSistema?.tipoEntidadId) {
          AlertService.error('No se pudo determinar el tipo de entidad SISTEMA.');
          return;
        }
        
        // Usar el id encontrado
        const response = await retry(() => gobernanzaService.tieneGobernanzaActiva(
          sistema.sistemaId,
          tipoSistema.tipoEntidadId,
          organizationInfo?.id
        ), { retries: 2, delayMs: 500 });

        const tieneGobernanza = response.success && response.data?.tieneGobernanza;
        if (!tieneGobernanza) {
          AlertService.error('No hay gobernanza activa para este sistema. Configure la gobernanza primero.');
          return;
        }
      } else {
        // Verificar gobernanza activa considerando la organización
        const response = await retry(() => gobernanzaService.tieneGobernanzaActiva(
          sistema.sistemaId,
          tipoEntidadId,
          organizationInfo?.id
        ), { retries: 2, delayMs: 500 });

        const tieneGobernanza = response.success && response.data?.tieneGobernanza;
        if (!tieneGobernanza) {
          AlertService.error('No hay gobernanza activa para este sistema. Configure la gobernanza primero.');
          return;
        }
      }

      // Establecer datos para eliminación y mostrar modal CRUD
      setSelectedSystemForDelete(sistema);
      setShowCRUDDeleteModal(true);
    } catch (error) {
      console.error('Error al verificar gobernanza para eliminar sistema:', error);
      AlertService.error('Error al verificar gobernanza. Intenta nuevamente.');
    }
  };

  const handleDuplicateSystem = (sistema: Sistema) => {
    // TODO: Implementar duplicaciÃ³n de sistema
            AlertService.info('Función de duplicación en desarrollo', {
          title: 'Próximamente'
    });
  };

  const handleViewSystem = (sistema: Sistema) => {
    setSelectedSystemForView(sistema);
    setSystemDetailModalOpen(true);
  };

  const handleRefresh = () => {
    refreshSistemas();
  };

  const handleAnalytics = async () => {
    if (!organizationInfo?.id) {
      AlertService.error('No se pudo obtener la información de la organización para el dashboard');
      return;
    }

    const mapSistemaFromAPIForAnalytics = (sistemaAPI: any): Sistema => ({
      sistemaId: sistemaAPI.sistemaId ?? sistemaAPI.id,
      organizacionId: sistemaAPI.organizacionId ?? organizationInfo.id,
      codigoSistema: sistemaAPI.codigoSistema ?? sistemaAPI.codigo ?? null,
      nombreSistema: sistemaAPI.nombreSistema ?? sistemaAPI.nombre,
      funcionPrincipal: sistemaAPI.funcionPrincipal ?? sistemaAPI.descripcion ?? null,
      sistemaDepende: sistemaAPI.sistemaDepende ?? sistemaAPI.sistemaParentId ?? null,
      tipoSistema: sistemaAPI.tipoSistemaId ?? sistemaAPI.tipoSistema ?? 1,
      familiaSistema: sistemaAPI.familiaSistemaId ?? sistemaAPI.familiaSistema ?? 1,
      tieneGobernanzaPropia: Boolean(sistemaAPI.tieneGobernanzaPropia),
      gobernanzaId: sistemaAPI.gobernanzaId ?? null,
      version: sistemaAPI.version ?? 1,
      estado: sistemaAPI.estado ?? EstadoSistema.Activo,
      creadoPor: sistemaAPI.creadoPor ?? null,
      fechaCreacion: sistemaAPI.fechaCreacion ?? new Date().toISOString(),
      actualizadoPor: sistemaAPI.actualizadoPor ?? null,
      fechaActualizacion: sistemaAPI.fechaActualizacion ?? null,
      registroEliminado: (sistemaAPI.registroEliminado ?? false) || (sistemaAPI.estado_registro === 0),
      url: sistemaAPI.url ?? null,
      servidorIds: sistemaAPI.servidorIds ?? (sistemaAPI.idServidor ? [sistemaAPI.idServidor] : []),
      modulos: Array.isArray(sistemaAPI.modulos)
        ? sistemaAPI.modulos
        : (sistemaAPI.modulosActivos ? Array(sistemaAPI.modulosActivos).fill({}) : [])
    });

    try {
      setLoadingAnalytics(true);
      const response = await sistemasService.getSistemasPaginated({
        organizacionId: organizationInfo.id,
        page: 1,
        pageSize: 1000,
        includeDeleted: false
      });

      if (response.success && response.data) {
        const items = (response.data.data ?? response.data.items ?? []);
        const mapped: Sistema[] = (Array.isArray(items) ? items : []).map(mapSistemaFromAPIForAnalytics);
        setAnalyticsSystems(mapped);
        setAnalyticsModalOpen(true);
      } else {
        console.error('Error al cargar datos para analytics:', (response as any).errors || response.message);
        AlertService.error('Error al cargar los datos para el dashboard');
      }
    } catch (error) {
      console.error('Error inesperado al cargar analytics:', error);
      AlertService.error('Ocurrió un error al cargar el dashboard. Intenta nuevamente.');
    } finally {
      setLoadingAnalytics(false);
    }
  };


  


  // Manejar Ã©xito en operaciones CRUD
  const handleSystemSuccess = (sistema: Sistema) => {
    const isEdit = selectedSystemForEdit !== null;
    setSystemModalOpen(false);
    setSelectedSystemForEdit(null);
    
    // âœ… REFRESH: Actualizar la grilla despuÃ©s de crear/editar
    refreshSistemas();
    
    if (isEdit) {
      AlertService.success(`Sistema ${sistema.nombreSistema} actualizado exitosamente`);
    } else {
      AlertService.success(`Sistema ${sistema.nombreSistema} creado exitosamente`);
    }
  };

  const handleDeleteSuccess = (sistemaId: number) => {
    setDeleteModalOpen(false);
    setSelectedSystemForDelete(null);
    
    // âœ… REFRESH: Actualizar la grilla despuÃ©s de eliminar
    refreshSistemas();
    
    const sistemaNombre = selectedSystemForDelete?.nombreSistema || 'Sistema';
    AlertService.success(`${sistemaNombre} eliminado exitosamente`);
  };

  // Cerrar modal de jerarquÃ­a
  const handleHierarchyClose = () => {
    setHierarchyModalOpen(false);
    setSelectedSystemForHierarchy(undefined);
    
    // Limpiar datos precargados para liberar memoria
    setAllSystemsForHierarchy([]);
  };

  // Manejar errores en operaciones CRUD
  const handleCRUDError = (error: string) => {
    console.error('Error en operaciÃ³n CRUD:', error);
  };

  // Grid actions para la vista de lista
  const gridActions: GridAction<Sistema>[] = [
    {
      icon: 'Eye',
      color: '#3b82f6',
      onClick: (sistema) => handleViewSystem(sistema),
      tooltip: 'Ver detalles'
    },

    {
      icon: 'Edit',
      color: '#f59e0b',
      onClick: (sistema) => handleEditSystemStepper(sistema),
      tooltip: 'Editar'
    },
    {
      icon: 'Trash2',
      color: '#ef4444',
      onClick: (sistema) => handleDeleteSystem(sistema),
      tooltip: 'Eliminar'
    }
  ];

  // Grid columns para la vista de lista
  const gridColumns: GridColumn<Sistema>[] = [
    {
      id: 'jerarquia',
      header: 'Jerarquía',
      accessor: 'sistemaId',
      width: '100px',
      align: 'center',
      sortable: false,
      render: (value, row) => (
        <HierarchyIndicator
          type={row.sistemaDepende ? 'child' : 'independent'}
          dependencyName={row.sistemaDepende?.toString()}
          size="sm"
        />
      )
    },
    {
      id: 'tipo',
      header: 'Tipo',
      accessor: 'tipoSistema',
      width: '80px',
      align: 'center',
      sortable: false,
      render: (value, row) => (
        <SystemTypeIcon
          familia={row.familiaSistema}
          size={16}
        />
      )
    },
    {
      id: 'codigo',
      header: 'Código',
      accessor: 'codigoSistema',
      width: '120px',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      id: 'nombre',
      header: 'Nombre del Sistema',
      accessor: 'nombreSistema',
      width: '250px',
      sortable: true
    },
    {
      id: 'tipoTexto',
      header: 'Tipo de Sistema',
      accessor: 'tipoSistema',
      width: '150px',
      sortable: true,
      render: (value) => getTipoSistemaLabel(value)
    },
    {
      id: 'familia',
      header: 'Familia',
      accessor: 'familiaSistema',
      width: '140px',
      sortable: true,
      render: (value) => getFamiliaSistemaLabel(value)
    },
    {
      id: 'estado',
      header: 'Estado',
      accessor: 'estado',
      width: '100px',
      align: 'center',
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value === EstadoSistema.Activo ? 'active' : 'inactive'}
          variant={value === EstadoSistema.Activo ? 'filled' : 'outline'}
          label={getEstadoSistemaLabel(value)}
        />
      )
    },
    {
      id: 'gobernanza',
      header: 'Gobernanza Propia',
      accessor: 'tieneGobernanzaPropia',
      width: '130px',
      align: 'center',
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          variant={value ? 'filled' : 'outline'}
          label={value ? 'Sí' : 'No'}
          size="s"
        />
      )
    },
    {
      id: 'modulos',
      header: 'Módulos',
      accessor: 'modulos',
      width: '100px',
      align: 'center',
      sortable: false,
      render: (value) => (
        <span style={{ 
          color: colors.primary,
          fontWeight: '600',
          fontSize: '14px'
        }}>
          {value?.length || 0}
        </span>
      )
    },
    {
      id: 'fechaCreacion',
      header: 'Fecha Creación',
      accessor: 'fechaCreacion',
      width: '120px',
      align: 'center',
      sortable: true,
      render: (value) => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleDateString('es-PE');
      }
    },
    {
      id: 'creadoPor',
      header: 'Creado Por',
      accessor: 'nombreUsuarioCreador',
      width: '140px',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      id: 'actualizadoPor',
      header: 'Actualizado Por',
      accessor: 'nombreUsuarioActualizador',
      width: '140px',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: 'sistemaId',
      width: '140px',
      align: 'center',
      sortable: false,
      actions: gridActions
    }
  ];

  // FunciÃ³n para manejar click en fila
  const handleRowClick = (sistema: Sistema) => {
    handleViewSystem(sistema);
  };

  return (
    <div className={styles.sistemasContainer} style={{ backgroundColor: colors.background }}>
      {/* Header (oculto cuando el menú está activo) */}
      {!showMenu && (
      <div className={styles.header} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 style={{ color: colors.text }}>Gestión de Sistemas</h1>
            <p style={{ color: colors.textSecondary }}>
              Administra la arquitectura de sistemas y sus componentes
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
            {!showMenu && (
              <Button
                variant="outline"
                size="m"
                iconName="ArrowLeft"
                onClick={() => setShowMenu(true)}
                style={{ borderColor: colors.border, marginRight: '0.5rem' }}
              >
                Volver al menú
              </Button>
            )}
            <Button
              variant="default"
              size="m"
              iconName="Plus"
              onClick={handleNewSystem}
            >
              Nuevo Sistema
            </Button>
            <Button
              variant="action"
              size="m"
              iconName="Server"
              onClick={handleServidores}
              backgroundColor={theme === 'dark' ? '#10b98120' : '#f0fdf4'}
              textColor="#10b981"
              borderColor="#10b981"
            >
              Servidores
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className={styles.searchAndFilters}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Buscar sistemas o módulos..."
              className={styles.searchInput}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }}
            />
          </div>
          <div className={styles.actionButtons}>
            <Button
              variant="action"
              size="m"
              iconName="GitBranch"
              onClick={() => handleHierarchyManagement()}
              disabled={loadingAllSystemsForHierarchy}
              backgroundColor={theme === 'dark' ? '#8b5cf620' : '#f3f4f6'}
              textColor="#8b5cf6"
              borderColor="#8b5cf6"
            >
              {loadingAllSystemsForHierarchy ? 'Cargando...' : 'Jerarquía'}
            </Button>
            <Button
              variant="action"
              size="m"
              iconName="Upload"
              onClick={handleImport}
              backgroundColor={theme === 'dark' ? '#10b98120' : '#f0fdf4'}
              textColor="#10b981"
              borderColor="#10b981"
            >
              Importar
            </Button>
            <Button
              variant="action"
              size="m"
              iconName="Download"
              onClick={handleExport}
              backgroundColor={theme === 'dark' ? '#3b82f620' : '#eff6ff'}
              textColor="#3b82f6"
              borderColor="#3b82f6"
            >
              Exportar
            </Button>
            <Button
              variant="action"
              size="m"
              iconName="BarChart3"
              onClick={handleAnalytics}
              backgroundColor={theme === 'dark' ? '#f9731620' : '#fff7ed'}
              textColor="#f97316"
              borderColor="#f97316"
            >
              Analytics
            </Button>
            <Button
              variant="action"
              size="m"
              iconName="Settings"
              onClick={handleRefresh}
              backgroundColor={colors.surface}
              textColor={colors.textSecondary}
              borderColor={colors.border}
            >
              Actualizar
            </Button>
          </div>
          <div className={styles.viewToggle}>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="s"
              iconName="Grid"
              onClick={() => setViewMode('grid')}
            />
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="s"
              iconName="List"
              onClick={() => setViewMode('list')}
            />
          </div>
        </div>
      </div>
      )}

      <div className={styles.content}>
        {showMenu ? (
          <MenuGrid title="Gestión de Sistemas" titleIconName="Server" columns={4}>
            <MenuCard
              title="Navegar sistemas"
              description="Elige la vista y entra al listado"
              icon={<Grid />}
              actions={[
                { label: 'Vista Cards', icon: <Grid size={16} />, variant: 'primary', onClick: () => { setViewMode('grid'); setShowMenu(false); } },
                { label: 'Vista Lista', icon: <List size={16} />, onClick: () => { setViewMode('list'); setShowMenu(false); } },
              ]}
            />
            <MenuCard
              title="Crear sistema"
              description="Abre el asistente de creación"
              icon={<Plus />}
              expandable={false}
              onCardClick={() => { handleNewSystem(); setShowMenu(false); }}
            />
            <MenuCard
              title="Editar sistema"
              description="Selecciona un sistema y edítalo"
              icon={<Edit />}
              expandable={false}
              onCardClick={() => openSelector('edit')}
            />
            <MenuCard
              title="Eliminar sistema"
              description="Selecciona y elimina un sistema"
              icon={<Trash2 />}
              expandable={false}
              onCardClick={() => openSelector('delete')}
            />
            <MenuCard
              title="Gobernanza"
              description="Gestiona la gobernanza del sistema"
              icon={<Shield />}
              expandable={false}
              onCardClick={() => openSelector('gobernanza')}
            />
            <MenuCard
              title="Servidores"
              description="Administrar servidores relacionados"
              icon={<Server />}
              expandable={false}
              onCardClick={() => { handleServidores(); setShowMenu(false); }}
            />
            <MenuCard
              title="Importar sistemas"
              description="Carga desde Excel con vista previa"
              icon={<Upload />}
              expandable={false}
              onCardClick={() => { handleImport(); setShowMenu(false); }}
            />
            <MenuCard
              title="Exportar sistemas"
              description="Exporta el conjunto actual"
              icon={<Download />}
              expandable={false}
              onCardClick={() => { handleExport(); setShowMenu(false); }}
            />
            <MenuCard
              title="Analytics"
              description="Abre el dashboard de sistemas"
              icon={<BarChart3 />}
              expandable={false}
              onCardClick={() => { handleAnalytics(); setShowMenu(false); }}
            />
          </MenuGrid>
        ) : loading && safeSistemas.length === 0 ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando sistemas...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>Error: {error}</p>
            <Button
              variant="outline"
              size="m"
              onClick={handleRefresh}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Reintentar
            </Button>
          </div>
        ) : safeSistemas.length === 0 ? (
          <EmptyState
            title="No hay sistemas registrados"
            description="Comienza creando tu primer sistema o importa sistemas existentes para gestionar tu organización."
            icon="package"
            actions={[
              {
                label: 'Crear Sistema',
                icon: 'Plus',
                onClick: handleNewSystem,
                primary: true
              },
              {
                label: 'Importar Sistemas',
                icon: 'Upload',
                onClick: handleImport,
                variant: 'outline'
              }
            ]}
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <SystemsGrid
                sistemas={safeSistemas}
                loading={loading}
                error={error}
                pagination={pagination}
                onEdit={handleEditSystemStepper}
                onDelete={handleDeleteSystem}
                onView={handleViewSystem}
                onGovernance={handleSystemGovernance}
                onApprovalTracking={handleApprovalTracking}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            ) : (
              <DataGrid
                columns={gridColumns}
                data={safeSistemas}
                loading={loading}
                showPagination={true}
                pageSize={pagination.pageSize}
                currentPage={pagination.page}
                totalItems={pagination.total}
                totalPages={pagination.totalPages} // 🔧 Agregar totalPages
                serverSide={true}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onRowClick={handleRowClick}
                emptyMessage={filters.search 
                                  ? 'No hay sistemas que coincidan con tu búsqueda.'
                : 'Aún no hay sistemas registrados en el sistema.'
                }
              />
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <SystemModal
        isOpen={systemModalOpen}
        onClose={() => {
          setSystemModalOpen(false);
          setSelectedSystemForEdit(null);
        }}
        sistema={selectedSystemForEdit}
        organizacionId={organizationInfo?.id || 1}
        gobernanzaRol={gobernanzaRol}
        onSuccess={handleSystemSuccess}
        onError={handleCRUDError}
        onGovernance={handleSystemGovernance}
      />

      <SystemDetailModal
        isOpen={systemDetailModalOpen}
        onClose={() => setSystemDetailModalOpen(false)}
        sistema={selectedSystemForView}
        organizacionId={organizationInfo?.id || 1}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        sistema={selectedSystemForDelete}
        onSuccess={handleDeleteSuccess}
        onError={handleCRUDError}
      />

      {hierarchyModalOpen && (() => {
        // Buscar el sistema seleccionado en los datos precargados o en los datos actuales
        const selectedSistema = allSystemsForHierarchy.find(s => s.sistemaId === selectedSystemForHierarchy) || 
                               safeSistemas.find(s => s.sistemaId === selectedSystemForHierarchy);
        
        // Solo renderizar si encontramos el sistema
        if (!selectedSistema) {
          
          // Intentar usar el primer sistema disponible como fallback
          const fallbackSistema = allSystemsForHierarchy[0] || safeSistemas[0];
          if (!fallbackSistema) {
            return null;
          }
          
          // Actualizar el sistema seleccionado con el fallback
          setSelectedSystemForHierarchy(fallbackSistema.sistemaId);
          
          return (
            <HierarchyModal
              isOpen={hierarchyModalOpen}
              onClose={handleHierarchyClose}
              sistema={fallbackSistema}
              sistemas={allSystemsForHierarchy.length > 0 ? allSystemsForHierarchy : safeSistemas}
            />
          );
        }
        
        return (
          <HierarchyModal
            isOpen={hierarchyModalOpen}
            onClose={handleHierarchyClose}
            sistema={selectedSistema}
            sistemas={allSystemsForHierarchy.length > 0 ? allSystemsForHierarchy : safeSistemas}
          />
        );
      })()}

      {/* Modales de Carga Masiva */}
      <Modal
        isOpen={bulkUploadModalOpen}
        onClose={handleBulkUploadCancel}
        title="Importación Masiva de Sistemas"
        size="l"
        onCancel={handleBulkUploadCancel}
        cancelButtonText="Cancelar"
        hideFooter={true}
      >
        <BulkUpload
          organizacionId={organizationInfo?.id || 0}
          onValidationComplete={handleBulkUploadValidationComplete}
          sistemasExistentes={safeSistemas.map(s => ({ 
            nombre: s.nombreSistema, 
            codigo: s.codigoSistema || undefined 
          }))}
        />
      </Modal>

      <Modal
        isOpen={previewModalOpen}
        onClose={handlePreviewCancel}
        title="Vista Previa de Importación"
        size="xl"
        onCancel={handlePreviewCancel}
        onSave={handleConfirmImport}
        cancelButtonText="Volver"
        saveButtonText={`Importar ${selectedSystemsForImport?.length || 0} Sistema${(selectedSystemsForImport?.length || 0) !== 1 ? 's' : ''}`}
        saveDisabled={!selectedSystemsForImport || selectedSystemsForImport.length === 0}
      >
        {parseResult && (
          <div className={styles.vistaPreviaModalContent}>
            <DataPreviewTable
              parseResult={parseResult}
              onSystemSelectionChange={setSelectedSystemsForImport}
              selectedSystems={selectedSystemsForImport}
            />
          </div>
        )}
      </Modal>

      <ImportProgressModal
        isOpen={importProgressModalOpen}
        onClose={handleImportProgressClose}
        status={importProgressStatus}
        importResult={importResult}
      />

      {/* Modal de Analytics */}
      <Modal
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
        title="Dashboard de Sistemas"
        size="xl"
        hideFooter={true}
      >
        <SystemsAnalytics
          sistemas={analyticsSystems}
          organizacionId={organizationInfo?.id || 1}
          periodDays={30}
        />
      </Modal>

      {/* Selector modal para editar/eliminar/gobernanza */}
      <SelectorItemsModal<Sistema>
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        title={
          selectorMode === 'edit' ? 'Selecciona sistema a editar' :
          selectorMode === 'delete' ? 'Selecciona sistema a eliminar' :
          selectorMode === 'gobernanza' ? 'Selecciona sistema para gobernanza' : 'Selecciona sistema'
        }
        description={selectorMode === 'delete' ? 'Busca y elige el sistema para eliminar' : undefined}
        data={safeSistemas}
        columns={selectorColumns}
        getRowId={(row) => row.sistemaId as number}
        onSelect={handleSelectorSelect}
      />

      {/* Modal de Exportación Avanzada */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Exportación Avanzada"
        size="m"
        hideFooter={true}
      >
        <AdvancedExport
          sistemas={allSystemsForExport}
          organizacionId={organizationInfo?.id || 1}
          onExport={handleExportExecute}
        />
      </Modal>

      {/* Modal de Gobernanza Form */}
       <GobernanzaForm
         isOpen={gobernanzaFormOpen}
         mode={gobernanzaMode}
         source="sistemas"
         initialData={gobernanzaData || {
           tipoGobiernoId: '',
           tipoEntidadId: 1, // Sistemas
           entidadId: selectedSystemForGovernance ? 
             (selectedSystemForGovernance.tieneGobernanzaPropia ? selectedSystemForGovernance.sistemaId : -1) 
             : '',
           organizacionId: organizationInfo?.id || '',
           nombre: selectedSystemForGovernance?.nombreSistema || '',
           fechaAsignacion: new Date().toISOString().split('T')[0],
           fechaVencimiento: '',
           observaciones: '',
           gobernanzaRoles: []
         }}
         onGobernanzaChange={(newGobernanzaId) => {
           // Actualizar el gobernanzaId del sistema seleccionado
           if (selectedSystemForGovernance) {
             setSelectedSystemForGovernance(prev => prev ? {
               ...prev,
               gobernanzaId: newGobernanzaId
             } : null);
           }
         }}
         
         onClose={async () => {
           // Si el gobernanzaId cambió, actualizar el sistema
           if (selectedSystemForGovernance && selectedSystemForGovernance.gobernanzaId !== (gobernanzaData?.gobernanzaId || null)) {
             try {
               // Crear el comando de actualización del sistema
               const updateCommand = {
                 sistemaId: selectedSystemForGovernance.sistemaId,
                 version: selectedSystemForGovernance.version,
                 organizacionId: selectedSystemForGovernance.organizacionId,
                 codigoSistema: selectedSystemForGovernance.codigoSistema,
                 nombreSistema: selectedSystemForGovernance.nombreSistema,
                 funcionPrincipal: selectedSystemForGovernance.funcionPrincipal,
                 tipoSistema: selectedSystemForGovernance.tipoSistema,
                 familiaSistema: selectedSystemForGovernance.familiaSistema,
                 sistemaDepende: selectedSystemForGovernance.sistemaDepende,
                 estado: selectedSystemForGovernance.estado,
                 tieneGobernanzaPropia: selectedSystemForGovernance.tieneGobernanzaPropia,
                 gobernanzaId: selectedSystemForGovernance.gobernanzaId,
                 servidoresToDelete: [],
                 servidoresToInsert: selectedSystemForGovernance.servidorIds || []
               };
               
               await sistemasService.updateSistema(selectedSystemForGovernance.sistemaId, updateCommand);
               AlertService.success('Sistema actualizado con nueva gobernanza');
               
               // Refrescar la lista de sistemas
               await refreshSistemas();
             } catch (error: any) {
               console.error('Error al actualizar sistema:', error);
               AlertService.error('Error al actualizar el sistema: ' + (error.message || 'Error desconocido'));
             }
           }
           
           setGobernanzaFormOpen(false);
           setSelectedSystemForGovernance(null);
           setGobernanzaData(null);
           setGobernanzaMode('create');
         }}
         onSubmit={async (data) => {
           try {
             if (gobernanzaMode === 'edit' && gobernanzaData?.gobernanzaId) {
               // Actualizar gobernanza existente
               await gobernanzaService.updateGobernanza(gobernanzaData.gobernanzaId, data);
               AlertService.success('Gobernanza actualizada exitosamente');
             } else {
               // Crear nueva gobernanza
               await gobernanzaService.createGobernanza(data);
               AlertService.success('Gobernanza creada exitosamente');
             }
             
             setGobernanzaFormOpen(false);
             setSelectedSystemForGovernance(null);
             setGobernanzaData(null);
             setGobernanzaMode('create');
             
             // Refrescar la lista de sistemas
             await refreshSistemas();
           } catch (error: any) {
             console.error('Error al guardar gobernanza:', error);
             AlertService.error('Error al guardar la gobernanza: ' + (error.message || 'Error desconocido'));
           }
         }}
         onCancel={async () => {
           // Si el gobernanzaId cambió, actualizar el sistema
           if (selectedSystemForGovernance && selectedSystemForGovernance.gobernanzaId !== (gobernanzaData?.gobernanzaId || null)) {
             try {
               // Crear el comando de actualización del sistema
               const updateCommand = {
                 sistemaId: selectedSystemForGovernance.sistemaId,
                 version: selectedSystemForGovernance.version,
                 organizacionId: selectedSystemForGovernance.organizacionId,
                 codigoSistema: selectedSystemForGovernance.codigoSistema,
                 nombreSistema: selectedSystemForGovernance.nombreSistema,
                 funcionPrincipal: selectedSystemForGovernance.funcionPrincipal,
                 tipoSistema: selectedSystemForGovernance.tipoSistema,
                 familiaSistema: selectedSystemForGovernance.familiaSistema,
                 sistemaDepende: selectedSystemForGovernance.sistemaDepende,
                 estado: selectedSystemForGovernance.estado,
                 tieneGobernanzaPropia: selectedSystemForGovernance.tieneGobernanzaPropia,
                 gobernanzaId: selectedSystemForGovernance.gobernanzaId,
                 servidoresToDelete: [],
                 servidoresToInsert: selectedSystemForGovernance.servidorIds || []
               };
               
               await sistemasService.updateSistema(selectedSystemForGovernance.sistemaId, updateCommand);
               AlertService.success('Sistema actualizado con nueva gobernanza');
               
               // Refrescar la lista de sistemas
               await refreshSistemas();
             } catch (error: any) {
               console.error('Error al actualizar sistema:', error);
               AlertService.error('Error al actualizar el sistema: ' + (error.message || 'Error desconocido'));
             }
           }
           
           setGobernanzaFormOpen(false);
           setSelectedSystemForGovernance(null);
           setGobernanzaData(null);
           setGobernanzaMode('create');
         }}
       />

              {/* Modal de Seguimiento de Aprobaciones */}
      <Modal
        isOpen={approvalTrackingModalOpen}
        onClose={() => {
          setApprovalTrackingModalOpen(false);
          setSelectedSystemForApproval(null);
        }}
        title={`Seguimiento de Aprobación - ${selectedSystemForApproval?.nombreSistema || 'Sistema'}`}
        size="l"
        hideFooter={true}
        className="approval-tracking-modal"
      >
        {selectedSystemForApproval && (
          <ApprovalTracker
            sistemaId={selectedSystemForApproval.sistemaId}
            showDetailed={true}
            onApprovalAction={(sistemaId, accion, comentarios) => {
              AlertService.info(`Acción "${accion}" registrada para sistema #${sistemaId}`);
            }}
          />
        )}
      </Modal>

      {/* StepperSystemForm */}
      {stepperFormOpen && (
        <StepperSystemForm
          isOpen={stepperFormOpen}
          mode={stepperFormMode}
          initialData={selectedSystemForStepper ? transformBackendDataToFormData({ id: selectedSystemForStepper.sistemaId, ...selectedSystemForStepper }) : undefined}
          onSubmit={handleStepperFormSubmit}
          onClose={handleStepperFormCancel}
          onLoadData={handleLoadReferenceData}
        />
      )}

      {/* Modal de Confirmación CRUD para Eliminación */}
      <CRUDConfirmationModal
        isOpen={showCRUDDeleteModal}
        tipoOperacion="ELIMINAR"
        entidadNombre={selectedSystemForDelete?.nombreSistema || 'Sistema'}
        entidadTipo="Sistema"
        datosEntidad={selectedSystemForDelete ? {
          'Nombre Sistema': selectedSystemForDelete.nombreSistema,
          'Código': selectedSystemForDelete.codigoSistema || 'No especificado',
          'Tipo Sistema': selectedSystemForDelete.tipoSistema || 'Por definir',
          'Familia Sistema': selectedSystemForDelete.familiaSistema || 'Por definir',
          'Función Principal': selectedSystemForDelete.funcionPrincipal || 'Sin descripción',
          'Estado': '⚠️ SERÁ ELIMINADO'
        } : {}}
        onClose={handleCRUDDeleteCancel}
        onConfirm={handleCRUDDeleteConfirmation}
        onCancel={handleCRUDDeleteCancel}
      />

    </div>
  );
};
