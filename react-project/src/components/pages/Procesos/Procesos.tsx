import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  GitBranch,
  BarChart3,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Server,
  RefreshCw,
  Grid3X3,
  List
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Modal } from '../../ui/modal';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ViewToggle } from '../../ui/view-toggle';
// El header de Procesos ahora replica el de Sistemas, no usamos SearchToolbar aquí
import { SearchToolbar } from '../../ui/search-toolbar';
import { EmptyState } from '../../ui/empty-state';
import { AlertService } from '../../ui/alerts';
import { ViewMode } from '../../ui/view-toggle';
import { ProcesosGrid } from '../../ui/procesos-grid';
import { ProcesoCard } from '../../ui/proceso-card';
import styles from './Procesos.module.css';
import { useAuth } from '../../../hooks/useAuth';
import { useProcesos } from '../../../hooks/useProcesos';
import { Button as HeaderButton } from '../../ui/button/button';
import { procesosService } from '../../../services/procesos.service';
import { BulkUpload } from '../../ui/bulk-upload/BulkUpload';
import { Proceso } from '../../../models/Procesos';
import { Grid as DataGrid, GridColumn, GridAction } from '../../ui/grid/Grid';
import { useChat } from '../../../contexts/ChatContext';
import { EntityFilterBar } from '../../ui/entity-filters/EntityFilterBar';
// import { ListaProcesosEnhanced } from './ListaProcesosEnhanced';
import { ProcesosMainMenu } from '../../ui/procesos-menu';
import { ProcesoStepperPage } from './ProcesoStepperPageLegacy';

export interface ProcesosProps {
  className?: string;
  onNavigate?: (page: string) => void;
}

export const Procesos: React.FC<ProcesosProps> = ({
  className = '',
  onNavigate
}) => {
  const { colors, theme } = useTheme();
  const { organizationInfo, user } = useAuth();
  const { openChat } = useChat();
  
  const [listFilters, setListFilters] = useState<{ search?: string; categoria?: string; estado?: string; conDependencias?: boolean; tieneGobernanzaPropia?: boolean }>({ search: '' });
// Usar el hook useProcesos para manejar el estado
  const {
    procesos,
    loading,
    error,
    filters,
    pagination,
    stats,
    setSearch,
    setFilters,
    setPage,
    setPageSize,
    refreshProcesos,
    createProceso,
    updateProceso,
    deleteProceso
  } = useProcesos();
  
  // Estados para UI
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showMenu, setShowMenu] = useState<boolean>(true);
  
  // Estados para modales
  const [procesoModalOpen, setProcesoModalOpen] = useState(false);
  const [selectedProcesoForEdit, setSelectedProcesoForEdit] = useState<Proceso | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProcesoForDelete, setSelectedProcesoForDelete] = useState<Proceso | null>(null);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);

  // Funciones de manejo de eventos
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  // Funciones de manejo
  const handleNewProceso = () => {
    setSelectedProcesoForEdit(null);
    setProcesoModalOpen(true);
  };

  const handleEditProceso = (proceso: Proceso) => {
    setSelectedProcesoForEdit(proceso);
    setProcesoModalOpen(true);
  };

  const handleDeleteProceso = (proceso: Proceso) => {
    setSelectedProcesoForDelete(proceso);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProceso = async () => {
    if (selectedProcesoForDelete) {
      await deleteProceso(selectedProcesoForDelete.procesoId);
      setDeleteModalOpen(false);
      setSelectedProcesoForDelete(null);
    }
  };

  const handleBulkUploadCancel = () => {
    setBulkUploadModalOpen(false);
  };

  // Estado para almacenar los datos validados del Excel
  const [validatedData, setValidatedData] = useState<any>(null);

  // Handler para cuando se completa la validación del Excel
  const handleBulkUploadValidationComplete = (result: any) => {
    setValidatedData(result);
  };

  // Handler para el botón Grabar - ACTUALIZADO PARA MODELO JERárQUICO
  const handleBulkUploadSave = async () => {
    console.log('Estado de validatedData:', validatedData);
    
    if (!validatedData || !validatedData.payload) {
    console.log('=== ERROR: NO HAY DATOS VÁLIDOS O PAYLOAD ===');
      AlertService.error('No hay datos válidos para guardar. Por favor, carga y valida un archivo Excel primero.');
      return;
    }
  
    // Transformar el payload del parser al formato esperado por el backend
    const bulkRequest = {
      organizacionId: validatedData.payload.organizacionId,
      procesos: validatedData.payload.procesos.map((proceso: any) => ({
        tempId: proceso.tempId,
        padreTempId: null, // Se calculará en el backend basado en padreCodigoProceso
        padreCodigoProceso: proceso.padreCodigoProceso,
        tipoProcesoId: proceso.tipoProcesoId,
        codigoProceso: proceso.codigoProceso,
        nombreProceso: proceso.nombreProceso,
        descripcionProceso: proceso.descripcionProceso,
        versionProceso: proceso.versionProceso || '1.0',
        ordenProceso: proceso.ordenProceso || 0,
        estadoId: 1, // Estado por defecto (Borrador)
        creadoPor: user?.usuarioId || 0
      })),
      ejecutadoPor: user?.usuarioId || 0,
      validarDuplicados: true,
      continuarConErrores: false,
      procesarEnLotes: false
    };
  
    console.log('=== PAYLOAD PROCESOS LISTO PARA BACKEND ===');
    console.log('Payload completo:', bulkRequest);
    console.log('OrganizacionId:', bulkRequest.organizacionId);
    console.log('EjecutadoPor:', bulkRequest.ejecutadoPor);
    console.log('Procesos:', bulkRequest.procesos);
    console.log('Total procesos:', bulkRequest.procesos.length);
  
    // Mostrar estructura detallada por niveles
    const procesosPorNivel = bulkRequest.procesos.reduce((acc: any, proceso: any) => {
      const nivel = validatedData.payload.procesos.find((p: any) => p.tempId === proceso.tempId)?.nivel || 1;
      if (!acc[nivel]) acc[nivel] = [];
      acc[nivel].push(proceso);
      return acc;
    }, {} as Record<number, any[]>);
  
    Object.keys(procesosPorNivel).forEach(nivel => {
      console.log(`Nivel ${nivel} (${procesosPorNivel[nivel].length} procesos):`, procesosPorNivel[nivel]);
    });
    
    try {
      // Llamar al servicio de importación masiva
      const loadingToastId = AlertService.loading('Importando procesos...');
      
      const response = await procesosService.bulkImport(bulkRequest);
      
      if (response.success && response.data) {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          `¡Importación exitosa! ${response.data.procesosCreados} procesos creados.`,
          4000
        );
        
        console.log('=== RESPUESTA DEL BACKEND ===');
        console.log('Procesos creados:', response.data.procesosCreados);
        console.log('Total procesados:', response.data.totalProcesosProcesados);
        console.log('Resultados:', response.data.resultados);
        console.log('Mapeo TempId a ProcesoId:', response.data.mapeoTempIdAProcesoId);
        
        // Refrescar la lista de procesos
        refreshProcesos();
        
      } else {
        AlertService.updateLoading(
          loadingToastId,
          'error',
          response.message || 'Error en la importación masiva',
          5000
        );
        
        if (response.errors && response.errors.length > 0) {
          console.error('Errores de importación:', response.errors);
        }
      }
      
    } catch (error) {
      console.error('Error al importar procesos:', error);
      AlertService.error(error instanceof Error ? error.message : 'Error desconocido al importar procesos');
    } finally {
      // Cerrar modal y limpiar datos
      setBulkUploadModalOpen(false);
      setValidatedData(null);
    }
  };

  // Eliminar la función confirmDelete duplicada ya que tenemos confirmDeleteProceso

  const getEstadoBadge = (estado: number) => {
    switch (estado) {
      case 1:
        return <Badge variant="success" icon={<CheckCircle />}>Activo</Badge>;
      case 0:
        return <Badge variant="secondary" icon={<AlertCircle />}>Inactivo</Badge>;
      case -1:
        return <Badge variant="danger" icon={<AlertCircle />}>Rechazado</Badge>;
      default:
        return <Badge variant="secondary" icon={<Clock />}>Desconocido</Badge>;
    }
  };

  const getTipoProcesoLabel = (tipo: number) => {
    switch (tipo) {
        case 1: return 'Estratégico';
      case 2: return 'Operativo';
      case 3: return 'Soporte';
      default: return 'No definido';
    }
  };

  const getCategoriaProcesoLabel = (categoria: number) => {
    switch (categoria) {
        case 1: return 'Gestión';
      case 2: return 'Control';
      case 3: return 'Mejora';
      default: return 'No definida';
    }
  };

  // Configuración de columnas para el Grid atómico (tabla)
  const gridColumns: GridColumn<Proceso>[] = [
    {
      id: 'proceso',
      header: 'Proceso',
      accessor: (row: Proceso) => row.nombreProceso,
      render: (value, row) => (
        <div className={styles.procesoInfo}>
          <h4>{row.nombreProceso}</h4>
          {row.codigoProceso && (
            <span className={styles.codigo}>{row.codigoProceso}</span>
          )}
          {(row as any).descripcionProceso || row.objetivos ? (
            <p className={styles.descripcionList}>{(row as any).descripcionProceso || row.objetivos}</p>
          ) : null}
        </div>
      )
    },
    {
      id: 'tipo',
      header: 'Tipo',
      accessor: (row: Proceso) => row.nombreTipoProceso || getTipoProcesoLabel(row.tipoProceso)
    },
    {
      id: 'descripcion',
      header: 'Descripción',
      accessor: (row: Proceso) => (row as any).descripcionProceso || row.objetivos || 'Sin descripción'
    },
    {
      id: 'responsable',
      header: 'Responsable',
      accessor: (row: Proceso) => row.responsable || 'No asignado'
    },
    {
      id: 'estado',
      header: 'Estado',
      accessor: (row: Proceso) => row.estado,
      render: (value, row) => getEstadoBadge(row.estado)
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: () => null,
      actions: [
        {
          icon: 'Edit',
          color: '#2563eb',
          onClick: (row: Proceso) => handleEditProceso(row),
          tooltip: 'Editar proceso'
        },
        {
          icon: 'Trash2',
          color: '#ef4444',
          onClick: (row: Proceso) => handleDeleteProceso(row),
          tooltip: 'Eliminar proceso'
        }
      ]
    }
  ];

  // Renderizar vista de grid (cards)
  const renderGridView = () => {
    // Transformar la paginaciÃ³n al formato esperado por ProcesosGrid
    const paginationForGrid = pagination ? {
      paginaActual: pagination.page,
      tamanoPagina: pagination.pageSize,
      totalElementos: pagination.total,
      totalPaginas: pagination.totalPages,
      tienePaginaAnterior: pagination.page > 1,
      tienePaginaSiguiente: pagination.page < pagination.totalPages
    } : undefined;

    return (
      <ProcesosGrid
        procesos={procesos}
        loading={loading}
        error={error}
        pagination={paginationForGrid}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEditProceso}
        onDelete={handleDeleteProceso}
        onGovernance={(proceso) => {
          // Manejar navegaciÃ³n a gobernanza
          console.log('Navegar a gobernanza:', proceso);
        }}
        onApprovalTracking={(proceso) => {
          // Manejar seguimiento de aprobaciÃ³n
          console.log('Seguimiento de aprobaciÃ³n:', proceso);
        }}
      />
    );
  };

  // Renderizar vista de lista con Grid atómica
  const renderListView = () => (
    <div>
      <DataGrid
        columns={gridColumns}
        data={procesos}
        pageSize={pagination.pageSize}
        currentPage={pagination.page}
        totalItems={pagination.total}
        totalPages={pagination.totalPages}
        serverSide={true}
        showPagination={true}
        loading={loading}
        emptyMessage="No hay procesos para mostrar"
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando procesos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} />
        <h3>Error al cargar procesos</h3>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={`${styles.procesosContainer} ${className}`} style={{ backgroundColor: colors.background }}>
        {/* Header oculto cuando se muestra el menú principal */}
      {!showMenu && (
        <div className={styles.header} style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div className={styles.headerContent}>
            <div className={styles.headerInfo}>
            <h1 style={{ color: colors.text }}>Gestión de Procesos</h1>
              <p style={{ color: colors.textSecondary }}>
                Administra los procesos de negocio y sus componentes
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 8px',
                  backgroundColor: organizationInfo.hasOrganization ? `${colors.primary}20` : `${colors.textSecondary}20`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: organizationInfo.hasOrganization ? colors.primary : colors.textSecondary
                }}>
                  {organizationInfo.displayName}
                </span>
              </p>
            </div>
            <div className={styles.headerActions}>
              {!showMenu && (
                <HeaderButton
                  variant="action"
                  size="m"
                  iconName="ArrowLeft"
                  onClick={() => setShowMenu(true)}
                  backgroundColor={theme === 'dark' ? '#6b728020' : '#f9fafb'}
                  textColor="#6b7280"
                  borderColor="#d1d5db"
                >
                  Volver al menú
                </HeaderButton>
              )}
              <HeaderButton
                variant="default"
                size="m"
                iconName="Plus"
                onClick={handleNewProceso}
              >
                Nuevo Proceso
              </HeaderButton>
              <HeaderButton
                variant="action"
                size="m"
                iconName="Server"
                onClick={() => AlertService.info('Servidores en desarrollo')}
                backgroundColor={theme === 'dark' ? '#6b728020' : '#f9fafb'}
                textColor="#6b7280"
                borderColor="#d1d5db"
              >
                Servidores
              </HeaderButton>
              <HeaderButton
                variant="action"
                size="m"
                iconName="MessageSquare"
                onClick={openChat}
                backgroundColor={theme === 'dark' ? '#3b82f620' : '#eff6ff'}
                textColor={colors.primary}
                borderColor={colors.primary}
              >
                Chat IA
              </HeaderButton>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className={styles.searchAndFilters}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Buscar procesos o módulos..."
                className={styles.searchInput}
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }}
              />
            </div>
            <div className={styles.actionButtons}>
              <HeaderButton
                variant="action"
                size="m"
                iconName="GitBranch"
                onClick={() => AlertService.info('Jerarquía en desarrollo')}
                backgroundColor={theme === 'dark' ? '#8b5cf620' : '#f3f4f6'}
                textColor="#8b5cf6"
                borderColor="#8b5cf6"
              >
                Jerarquía
              </HeaderButton>
              <HeaderButton
                variant="action"
                size="m"
                iconName="Download"
                onClick={() => setBulkUploadModalOpen(true)}
                backgroundColor={theme === 'dark' ? '#10b98120' : '#f0fdf4'}
                textColor="#10b981"
                borderColor="#10b981"
              >
                Importar
              </HeaderButton>
              <HeaderButton
                variant="action"
                size="m"
                iconName="Upload"
                onClick={() => AlertService.info('Función de exportación en desarrollo')}
                backgroundColor={theme === 'dark' ? '#3b82f620' : '#eff6ff'}
                textColor="#3b82f6"
                borderColor="#3b82f6"
              >
                Exportar
              </HeaderButton>
              <HeaderButton
                variant="action"
                size="m"
                iconName="BarChart3"
                onClick={() => AlertService.info('Analytics en desarrollo')}
                backgroundColor={theme === 'dark' ? '#f9731620' : '#fff7ed'}
                textColor="#f97316"
                borderColor="#f97316"
              >
                Analytics
              </HeaderButton>
              <HeaderButton
                variant="action"
                size="m"
                iconName="RefreshCw"
                onClick={refreshProcesos}
                backgroundColor={theme === 'dark' ? '#6b728020' : '#f9fafb'}
                textColor="#6b7280"
                borderColor="#d1d5db"
              >
              </HeaderButton>
            </div>
            <div className={styles.viewToggle}>
              <ViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {procesoModalOpen ? (
          // Render inline del Stepper cuando está activo
          <ProcesoStepperPage />
        ) : showMenu ? (
          <ProcesosMainMenu
            onExploreGrid={() => { setViewMode('grid'); setShowMenu(false); }}
            onExploreList={() => { setViewMode('list'); setShowMenu(false); }}
            onCreate={() => { setShowMenu(false); handleNewProceso(); }}
            onUpdate={() => { setViewMode('list'); setShowMenu(false); }}
            onDelete={() => { setViewMode('list'); setShowMenu(false); }}
            onImport={() => { setBulkUploadModalOpen(true); setShowMenu(false); }}
            onExport={() => AlertService.info('Función de exportación en desarrollo')}
            onGovernance={() => AlertService.info('Gobernanza en desarrollo')}
            onApproval={() => AlertService.info('Aprobación en desarrollo')}
            onAnalytics={() => AlertService.info('Analytics en desarrollo')}
          />
        ) : (
          procesos.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No hay procesos"
              description="No se encontraron procesos que coincidan con tu búsqueda"
              action={
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={handleNewProceso}
                >
                  Crear primer proceso
                </Button>
              }
            />
          ) : (
            <div className={styles.cardsContainer}>
              {viewMode === 'grid' ? renderGridView() : renderListView()}
              {/* Paginación: la Grid atómica ya incluye paginator para lista */}
            </div>
          )
        )}
      </div>

      {/* Modales */}
      {/* El Stepper de Proceso ahora se renderiza inline arriba; se eliminó el Modal */}



            <Modal
              isOpen={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              title="Confirmar eliminación"
        size="s"
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <AlertCircle size={48} color={colors.danger} style={{ marginBottom: '16px' }} />
                <p>¿Estás seguro de que deseas eliminar este proceso?</p>
          {selectedProcesoForDelete && (
            <p><strong>{selectedProcesoForDelete.nombreProceso}</strong></p>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeleteProceso}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

       {/* Modal de ImportaciÃ³n Masiva de Procesos */}
            <Modal
              isOpen={bulkUploadModalOpen}
              onClose={handleBulkUploadCancel}
              title="Importación Masiva de Procesos"
         size="l"
         onCancel={handleBulkUploadCancel}
         cancelButtonText="Cancelar"
         hideFooter={false}
         onSave={handleBulkUploadSave}
         saveButtonText="Guardar"
       >
         <BulkUpload 
           organizacionId={organizationInfo?.id || 0} 
           disabled={false}
           templateType="procesos"
           title="Carga Masiva de Procesos"
                description="Descarga la plantilla Excel con ejemplos e importa múltiples procesos y subprocesos."
           onValidationComplete={handleBulkUploadValidationComplete}
         />
       </Modal>
    </div>
  );
};





