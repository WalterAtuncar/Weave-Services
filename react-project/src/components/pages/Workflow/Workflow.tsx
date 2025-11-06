import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { SearchToolbar } from '../../ui/search-toolbar';
import { Grid, GridColumn } from '../../ui/grid';
import { FilterModal } from '../../ui/filter/FilterModal';
import { EmptyState } from '../../ui/empty-state';
import { Modal } from '../../ui/modal/Modal';
import { ApprovalTracker } from '../../ui/approval-tracker/ApprovalTracker';

import { AlertService } from '../../ui/alerts/AlertService';
import { Badge } from '../../ui/badge/badge';
import { BpmnDiagram } from './bpmnDiagram';
import styles from './Workflow.module.css';

// Importar el nuevo servicio de bandeja de tareas
import { 
  BandejaTareasDto, 
  BandejaTareasFilters, 
  bandejaTareasService 
} from '../../../services/bandeja-tareas.service';

import * as XLSX from 'xlsx';
import { 
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  User,
  Calendar
} from 'lucide-react';

// Tipos para el estado de la página
interface WorkflowState {
  tareas: BandejaTareasDto[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filtros: BandejaTareasFilters;
  filterModalOpen: boolean;
  // Paginación
  currentPage: number;
  pageSize: number;
  totalItems: number;
  // Estadísticas simplificadas
  stats: {
    total: number;
    pendientes: number;
    enProceso: number;
    completadas: number;
    rechazadas: number;
    vencidas: number;
  };
  // Modal BPMN
  bpmnModalOpen: boolean;
  selectedTaskForDiagram: BandejaTareasDto | null;
}

export const Workflow: React.FC = () => {
  const { theme, colors } = useTheme();
  
  const [state, setState] = useState<WorkflowState>({
    tareas: [],
    loading: true,
    error: null,
    searchTerm: '',
    filtros: {
      incluirPendientes: true,
      incluirEnProceso: true,
      incluirCompletadas: false,
      incluirRechazadas: false,
      ordenarPor: 'fechaInicioTarea',
      ordenDescendente: true
    },
    filterModalOpen: false,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    stats: {
      total: 0,
      pendientes: 0,
      enProceso: 0,
      completadas: 0,
      rechazadas: 0,
      vencidas: 0
    },
    bpmnModalOpen: false,
    selectedTaskForDiagram: null
  });

  // Estados para el modal de seguimiento SOE
  const [soeModalOpen, setSoeModalOpen] = useState(false);
  const [selectedSistemaId, setSelectedSistemaId] = useState<number | null>(null);
  const [selectedTareaNombre, setSelectedTareaNombre] = useState<string>('');

  // Obtener usuario ID del localStorage
  const getUserId = (): number => {
    try {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session?.usuario?.usuarioId || 1; // Fallback a 1 si no se encuentra
      }
      return 1; // Usuario por defecto
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return 1;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadTaskData();
  }, [state.currentPage, state.pageSize]);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (state.currentPage === 1) {
      loadTaskData();
    } else {
      setState(prev => ({ ...prev, currentPage: 1 }));
    }
  }, [state.filtros, state.searchTerm]);

  // Cargar datos de tareas
  const loadTaskData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const usuarioId = getUserId();
      const response = await bandejaTareasService.getBandejaTareasUsuario(usuarioId, state.filtros);
      
      if (response.success && response.data) {
        const tareas = response.data;
        
        // Filtrar por término de búsqueda si existe
        const tareasFiltradas = state.searchTerm 
          ? tareas.filter(tarea => 
              tarea.gobernanzaNombre?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              tarea.accionWork?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              tarea.tipoEntidadNombre?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              tarea.usuarioActualNombre?.toLowerCase().includes(state.searchTerm.toLowerCase())
            )
          : tareas;

        // Calcular estadísticas
        const stats = bandejaTareasService.getEstadisticasBandeja(tareasFiltradas);
      
        setState(prev => ({
          ...prev,
          tareas: tareasFiltradas,
          totalItems: tareasFiltradas.length,
          stats,
          loading: false,
          error: null
        }));
      } else {
        throw new Error(response.message || 'Error al cargar bandeja de tareas');
      }
      
    } catch (error: any) {
      console.error('Error al cargar bandeja de tareas:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Error al cargar bandeja de tareas',
        loading: false,
        tareas: [],
        totalItems: 0
      }));
      AlertService.error('Error al cargar bandeja de tareas');
    }
  };

  // Configuración de columnas para la Grid - Solo las más importantes
  const columns: GridColumn<BandejaTareasDto>[] = [
    {
      id: 'workflowEjecucionId',
      header: 'ID Tarea',
      accessor: 'workflowEjecucionId',
      width: '80px',
      align: 'center',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '12px', fontWeight: '500', color: colors.primary }}>
          #{value}
        </span>
      )
    },
    {
      id: 'estadoTarea',
      header: 'Estado',
      accessor: 'estadoTareaTexto',
      align: 'center',
      sortable: true,
      render: (_, row) => {
        const getEstadoConfig = () => {
          if (row.estaCompletada) return { color: '#10B981', label: 'Completada' };
          if (row.estaRechazada) return { color: '#EF4444', label: 'Rechazada' };
          if (row.estaEnProceso) return { color: '#3B82F6', label: 'En Proceso' };
          if (row.estaPendiente) return { color: '#F59E0B', label: 'Pendiente' };
          return { color: '#6B7280', label: 'Desconocido' };
        };
        
        const config = getEstadoConfig();
        return (
          <Badge
            label={config.label}
            color={config.color}
            size="s"
          />
        );
      }
    },
    {
      id: 'gobernanzaNombre',
      header: 'Gobierno',
      accessor: 'gobernanzaNombre',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: '500', color: colors.text, fontSize: '14px' }}>
            {value || 'Sin nombre'}
          </span>
          {row.tipoEntidadNombre && (
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
              {row.tipoEntidadNombre}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'accionWork',
      header: 'Acción',
      accessor: 'accionWork',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '14px', color: colors.text }}>
          {value || 'N/A'}
        </span>
      )
    },
    {
      id: 'usuarioActual',
      header: 'Asignado a',
      accessor: 'usuarioActualNombre',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '14px', color: colors.text }}>
            {value || 'Sin asignar'}
          </span>
          {row.rolActualNombre && (
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
              {row.rolActualNombre}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'fechaInicioTarea',
      header: 'Fecha Inicio',
      accessor: 'fechaInicioTarea',
      align: 'center',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '14px', color: colors.text }}>
              {date.toLocaleDateString()}
            </span>
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      }
    },
    {
      id: 'diasDesdeLaAsignacion',
      header: 'Días',
      accessor: 'diasDesdeLaAsignacion',
      align: 'center',
      sortable: true,
      render: (value, row) => {
        if (value === null || value === undefined) return <span>-</span>;
        
        const isVencida = value > 30 && !row.estaCompletada;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <Clock size={14} color={isVencida ? '#EF4444' : colors.textSecondary} />
            <span style={{ 
              fontSize: '14px', 
              color: isVencida ? '#EF4444' : colors.text,
              fontWeight: isVencida ? '600' : 'normal'
            }}>
              {value}
            </span>
          </div>
        );
      }
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      align: 'center',
      actions: [
        {
          icon: 'Play',
          color: '#10B981',
          tooltip: 'Procesar Tarea',
          onClick: (row) => handleProcessTask(row),
          disabled: (row) => row.estaCompletada || row.estaRechazada
        }
      ]
    }
  ];

  // Manejar búsqueda
  const handleSearch = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  };

  // Manejar filtros - Simplificado a solo 3 filtros principales
  const handleFilter = async (filtros: any) => {
    setState(prev => ({
      ...prev,
      filtros: {
        ...prev.filtros,
        fechaInicioDesde: filtros.fechaInicioDesde || undefined,
        fechaInicioHasta: filtros.fechaInicioHasta || undefined,
        incluirPendientes: filtros.incluirPendientes !== false,
        incluirEnProceso: filtros.incluirEnProceso !== false,
        incluirCompletadas: filtros.incluirCompletadas === true,
        incluirRechazadas: filtros.incluirRechazadas === true,
        accionWorkflow: filtros.accionWorkflow || undefined
      },
      filterModalOpen: false 
    }));
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setState(prev => ({
      ...prev,
      filtros: {
        incluirPendientes: true,
        incluirEnProceso: true,
        incluirCompletadas: false,
        incluirRechazadas: false,
        ordenarPor: 'fechaInicioTarea',
        ordenDescendente: true
      },
      searchTerm: ''
    }));
  };

  // Handlers para acciones de tareas
  const handleViewTask = (tarea: BandejaTareasDto) => {
    AlertService.info(`Ver detalles de tarea #${tarea.workflowEjecucionId}: ${tarea.gobernanzaNombre}`);
  };

  const handleProcessTask = (tarea: BandejaTareasDto) => {
    // Abrir modal de seguimiento SOE usando entidadId como sistemaId
    setSelectedSistemaId(tarea.entidadId);
    setSelectedTareaNombre(tarea.gobernanzaNombre || 'Sistema');
    setSoeModalOpen(true);
  };

  // Handler para cerrar el modal SOE
  const handleCloseSoeModal = () => {
    setSoeModalOpen(false);
    setSelectedSistemaId(null);
    setSelectedTareaNombre('');
    // Recargar datos para reflejar cambios
    loadTaskData();
  };

  // Handler para acciones de aprobación
  const handleApprovalAction = (sistemaId: number, accion: string, comentarios?: string) => {
    AlertService.success(`Acción "${accion}" registrada para sistema #${sistemaId}`);
    // Recargar datos después de la acción
    loadTaskData();
  };

  // Exportar a Excel
  const handleExportToExcel = () => {
    try {
      const dataToExport = state.tareas.map(tarea => ({
        'ID Tarea': tarea.workflowEjecucionId,
        'Estado': tarea.estadoTareaTexto,
        'Gobierno': tarea.gobernanzaNombre || 'Sin nombre',
        'Tipo Entidad': tarea.tipoEntidadNombre || 'N/A',
        'Acción': tarea.accionWork || 'N/A',
        'Asignado a': tarea.usuarioActualNombre || 'Sin asignar',
        'Rol': tarea.rolActualNombre || 'N/A',
        'Fecha Inicio': new Date(tarea.fechaInicioTarea).toLocaleDateString(),
        'Días desde Asignación': tarea.diasDesdeLaAsignacion || 0,
        'Completada': tarea.estaCompletada ? 'Sí' : 'No',
        'En Proceso': tarea.estaEnProceso ? 'Sí' : 'No',
        'Pendiente': tarea.estaPendiente ? 'Sí' : 'No',
        'Rechazada': tarea.estaRechazada ? 'Sí' : 'No'
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bandeja de Tareas');
      
      const fileName = `bandeja_tareas_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      AlertService.success('Archivo exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      AlertService.error('Error al exportar archivo');
    }
  };

  // Renderizar estadísticas
  const renderEstadisticas = () => (
    <div className={styles.statsContainer}>
      <div className={styles.statCard} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.statIcon} style={{ backgroundColor: '#E0F2FE' }}>
          <Activity size={20} color="#0284C7" />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue} style={{ color: colors.text }}>{state.stats.total}</span>
          <span className={styles.statLabel} style={{ color: colors.textSecondary }}>Total Tareas</span>
        </div>
      </div>

      <div className={styles.statCard} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.statIcon} style={{ backgroundColor: '#FEF3C7' }}>
          <Clock size={20} color="#F59E0B" />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue} style={{ color: colors.text }}>{state.stats.pendientes}</span>
          <span className={styles.statLabel} style={{ color: colors.textSecondary }}>Pendientes</span>
        </div>
      </div>

      <div className={styles.statCard} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.statIcon} style={{ backgroundColor: '#DBEAFE' }}>
          <Play size={20} color="#3B82F6" />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue} style={{ color: colors.text }}>{state.stats.enProceso}</span>
          <span className={styles.statLabel} style={{ color: colors.textSecondary }}>En Proceso</span>
        </div>
      </div>

      <div className={styles.statCard} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.statIcon} style={{ backgroundColor: '#D1FAE5' }}>
          <CheckCircle size={20} color="#10B981" />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue} style={{ color: colors.text }}>{state.stats.completadas}</span>
          <span className={styles.statLabel} style={{ color: colors.textSecondary }}>Completadas</span>
        </div>
      </div>

      <div className={styles.statCard} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.statIcon} style={{ backgroundColor: '#FEE2E2' }}>
          <AlertTriangle size={20} color="#EF4444" />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statValue} style={{ color: colors.text }}>{state.stats.vencidas}</span>
          <span className={styles.statLabel} style={{ color: colors.textSecondary }}>Vencidas</span>
        </div>
      </div>
    </div>
  );

  // Renderizar contenido principal
  const renderContent = () => {
    if (state.loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <span style={{ color: colors.textSecondary }}>Cargando bandeja de tareas...</span>
        </div>
      );
    }

    if (state.error) {
      return (
        <EmptyState
          icon="AlertTriangle"
          title="Error al cargar tareas"
          description={state.error}
          action={{
            label: 'Reintentar',
            onClick: loadTaskData
          }}
        />
      );
    }

    if (state.tareas.length === 0) {
      return (
        <EmptyState
          icon="Inbox"
          title="No hay tareas disponibles"
          description="No se encontraron tareas que coincidan con los filtros aplicados."
          action={{
            label: 'Limpiar Filtros',
            onClick: handleClearFilters
          }}
        />
      );
    }

    return (
      <Grid
        data={state.tareas}
        columns={columns}
        loading={state.loading}
        pagination={{
          currentPage: state.currentPage,
          pageSize: state.pageSize,
          totalItems: state.totalItems,
          onPageChange: (page) => setState(prev => ({ ...prev, currentPage: page })),
          onPageSizeChange: (size) => setState(prev => ({ ...prev, pageSize: size, currentPage: 1 }))
        }}
        emptyState={{
          icon: 'Inbox',
          title: 'No hay tareas',
          description: 'No se encontraron tareas para mostrar.'
        }}
      />
    );
  };

  return (
    <div className={styles.workflowContainer}>
      {/* Header */}
      <div className={styles.header} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 style={{ color: colors.text }}>Bandeja de Tareas</h1>
            <p style={{ color: colors.textSecondary }}>
              Gestiona y monitorea tus tareas asignadas
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="default"
              size="m"
              iconName="Download"
              onClick={handleExportToExcel}
              backgroundColor="#217346"
              textColor="#ffffff"
            >
              Exportar
            </Button>
            <Button
              variant="default"
              size="m"
              iconName="RefreshCw"
              onClick={loadTaskData}
            >
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {renderEstadisticas()}

      {/* Barra de herramientas */}
      <div className={styles.searchToolbarContainer}>
        <SearchToolbar
          searchValue={state.searchTerm}
          onSearchChange={handleSearch}
          searchPlaceholder="Buscar tareas..."
          actions={[
            {
              label: 'Filtrar',
              icon: 'Filter',
              onClick: () => setState(prev => ({ ...prev, filterModalOpen: true }))
            },
            {
              label: 'Limpiar Filtros',
              icon: 'X',
              onClick: handleClearFilters
            }
          ]}
        />
      </div>

      {/* Contenido principal */}
      <div 
        className={styles.workflowsContentContainer}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border
        }}
      >
        {renderContent()}
      </div>

      {/* Modal de filtros - Simplificado a solo 3 filtros principales */}
      <FilterModal
        isOpen={state.filterModalOpen}
        onClose={() => setState(prev => ({ ...prev, filterModalOpen: false }))}
        onFilter={handleFilter}
        onExport={handleExportToExcel}
        filterControls={[
          {
            key: 'fechaInicioDesde',
            label: 'Fecha Inicio Desde',
            type: 'date'
          },
          {
            key: 'fechaInicioHasta',
            label: 'Fecha Inicio Hasta',
            type: 'date'
          },
          {
            key: 'accionWorkflow',
            label: 'Acción de Workflow',
            type: 'text',
            placeholder: 'Filtrar por acción...'
          }
        ]}
      />

      {/* Modal de Seguimiento SOE */}
      <Modal
        isOpen={soeModalOpen}
        onClose={handleCloseSoeModal}
        title={`Seguimiento de Aprobación - ${selectedTareaNombre}`}
        size="l"
        hideFooter={true}
        className="approval-tracking-modal"
      >
        {selectedSistemaId && (
          <ApprovalTracker
            sistemaId={selectedSistemaId}
            showDetailed={true}
            onApprovalAction={handleApprovalAction}
          />
        )}
      </Modal>
    </div>
  );
};