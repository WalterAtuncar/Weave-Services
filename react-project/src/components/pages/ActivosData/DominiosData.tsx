/**
 * Página principal para gestión de Dominios de Data
 * Basada en Sistemas.tsx pero adaptada para dominios y sub-dominios de datos
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Database,
  Settings,
  Activity
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input/input';
import { Grid, GridColumn, GridAction } from '../../ui/grid/Grid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select/Select';
import { AlertService } from '../../ui/alerts/AlertService';
import { CRUDConfirmationModal } from '../../ui/crud-confirmation-modal/CRUDConfirmationModal';
import { SubDominiosModal } from '../../ui/subdominios-modal';
import { DominiosHierarchyModal } from '../../ui/dominios-hierarchy-modal';
import { GobernanzaForm } from '../../ui/gobernanza-form/GobernanzaForm';
import { StepperDominioDataForm } from '../../ui/stepper-dominio-data-form';
import StepperSubDominioForm from '../../ui/stepper-subdominio-form/StepperSubDominioForm';
import { ApprovalTracker } from '../../ui/approval-tracker';
import { Modal } from '../../ui/modal/Modal';
import {
  DominioData,
  EstadoDominioData,
  getEstadoDominioDataLabel,
  getTipoDominioDataLabel
} from '../../../models/DominiosData';
import { GobernanzaDto } from '../../../services/types/gobernanza.types';
import { useDominiosData } from '../../../hooks/useDominiosData';
import { useAuth } from '../../../hooks/useAuth';
import { gobernanzaService } from '../../../services';
import styles from './DominiosData.module.css';
import { EmptyState } from '../../ui/empty-state/EmptyState';
import { StatusBadge } from '../../ui/status-badge';
import { DominioViewModal } from '../../ui/dominio-view-modal';

const DominiosData: React.FC = () => {
  const { colors, theme } = useTheme();
  const { user } = useAuth();
  const {
    dominios,
    loading,
    error,
    filters,
    pagination,
    refresh,
    setSearchTerm,
    setPage,
    setPageSize,
    deleteDominio,
    selectDominio,
    updateDominio,
    loadSubDominiosData
  } = useDominiosData();

  // ===== ESTADOS LOCALES =====
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingDominioForStepper, setEditingDominioForStepper] = useState<any | null>(null);
  const [deletingDominio, setDeletingDominio] = useState<DominioData | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  // Estado para menú contextual (3 puntos)
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);
  // Estados para modal de subdominios
  const [showSubDominiosModal, setShowSubDominiosModal] = useState(false);
  const [selectedDominioForSubDominios, setSelectedDominioForSubDominios] = useState<DominioData | null>(null);
  // Estado para modal de jerarquía
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);
  // Estado para modal de vista (solo lectura)
  const [showDominioViewModal, setShowDominioViewModal] = useState(false);
  const [selectedDominioForView, setSelectedDominioForView] = useState<DominioData | null>(null);
  // Estados para gobernanza
  const [showGobernanzaForm, setShowGobernanzaForm] = useState(false);
  // Estados para seguimiento de aprobación
  const [showApprovalTrackingModal, setShowApprovalTrackingModal] = useState(false);
  const [selectedDominioForApproval, setSelectedDominioForApproval] = useState<DominioData | null>(null);
  const [selectedDominioForGovernance, setSelectedDominioForGovernance] = useState<DominioData | null>(null);
  const [gobernanzaData, setGobernanzaData] = useState<GobernanzaDto | null>(null);
  // Estado para stepper de dominio
  const [showStepperModal, setShowStepperModal] = useState(false);
  // Estado para stepper de subdominios
  const [showSubDominioStepperModal, setShowSubDominioStepperModal] = useState(false);
  const [selectedDominioForSubDominioStepper, setSelectedDominioForSubDominioStepper] = useState<DominioData | null>(null);

  // ===== HANDLERS =====
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, [setSearchTerm]);

  // Clic en una acción del menú contextual: evita burbuja, ejecuta acción y cierra menú
  const handleActionClick = useCallback((e: React.MouseEvent, action: () => void) => {
    console.log('🔧 handleActionClick ejecutado');
    e.stopPropagation();
    action();
    setOpenActionsId(null);
  }, []);

  const handleNewDominioStepper = useCallback(() => {
    setEditingDominioForStepper(null);
    setShowStepperModal(true);
  }, []);

  const handleShowHierarchy = useCallback(() => {
    setShowHierarchyModal(true);
  }, []);

  const handleEditDominio = useCallback((dominio: DominioData) => {
    console.log('🔧 [EDIT DOMINIO] Iniciando edición:', {
      dominio,
      dominioId: dominio.dominioId,
      nombre: dominio.nombre,
      codigo: dominio.codigo,
      descripcion: dominio.descripcion,
      tipoDominioId: dominio.tipoDominioId,
      gobernanzaId: dominio.gobernanzaId,
      subDominios: dominio.subDominios
    });
    
    // Abrir el stepper con la entidad completa para edición
    console.log('🔧 [EDIT DOMINIO] Dominio seleccionado para edición:', dominio);
    console.log('🔍 [EDIT DOMINIO] gobernanzaId del dominio:', dominio.gobernanzaId, typeof dominio.gobernanzaId);
    setEditingDominioForStepper(dominio);
    setShowStepperModal(true);
    
    console.log('🔧 [EDIT DOMINIO] Estado actualizado - editingDominioForStepper seteado');
  }, []);

  const handleViewDominio = useCallback((dominio: DominioData) => {
    setSelectedDominioForView(dominio);
    setShowDominioViewModal(true);
  }, []);

  const handleDeleteDominio = useCallback((dominio: DominioData) => {
    setDeletingDominio(dominio);
    setShowDeleteConfirmation(true);
  }, []);

  const handleSeguimientoDominio = useCallback((dominio: DominioData) => {
    console.log('🔍 [SEGUIMIENTO DOMINIO] Abriendo seguimiento para:', dominio);
    setSelectedDominioForApproval(dominio);
    setShowApprovalTrackingModal(true);
  }, []);

  const handleViewSubDominios = useCallback((dominio: DominioData) => {
    setSelectedDominioForSubDominios(dominio);
    setShowSubDominiosModal(true);
  }, []);

  // Handler para stepper de subdominios
  const handleSubDominiosStepper = useCallback((dominio: DominioData) => {
    console.log('🔧 handleSubDominiosStepper ejecutado con dominio:', dominio);
    setSelectedDominioForSubDominioStepper(dominio);
    setShowSubDominioStepperModal(true);
    console.log('🔧 Estado del modal actualizado a true');
  }, []);

  // Handler para gobernanza
  const handleDominioGovernance = useCallback(async (dominio: DominioData, gobernanza?: GobernanzaDto | any) => {
    try {
      setSelectedDominioForGovernance(dominio);

      // Si recibimos la gobernanza seleccionada (por ejemplo, desde FormDominioData cuando source='Data'), usarla directamente
      if (gobernanza && gobernanza.gobernanzaId) {
        setGobernanzaData(gobernanza as GobernanzaDto);
        setShowGobernanzaForm(true);
        return;
      }
      
      // Si no recibimos gobernanza, y el dominio tiene gobernanzaId, intentar obtener los datos desde el servicio
      if (dominio.gobernanzaId) {
        try {
          const response = await gobernanzaService.getGobernanzaById(dominio.gobernanzaId);
          if (response.success && response.data) {
            setGobernanzaData(response.data);
          } else {
            console.warn('No se pudo cargar la gobernanza: respuesta inválida', response);
            setGobernanzaData(null);
          }
        } catch (error) {
          console.warn('No se pudo cargar la gobernanza:', error);
          setGobernanzaData(null);
        }
      } else {
        setGobernanzaData(null);
      }
      
      setShowGobernanzaForm(true);
    } catch (error) {
      console.error('Error al abrir gobernanza:', error);
    }
  }, []);

  // Confirmar eliminación de dominio
  const handleConfirmDelete = useCallback(async () => {
    if (!deletingDominio) return;

    try {
      await deleteDominio(deletingDominio.dominioId);
      AlertService.success('Dominio eliminado exitosamente');
      setShowDeleteConfirmation(false);
      setDeletingDominio(null);
      refresh();
    } catch (error: any) {
      console.error('Error eliminando dominio:', error);
      AlertService.error(error?.message || 'Error al eliminar el dominio');
    }
  }, [deletingDominio, deleteDominio, refresh]);

  // Cancelar eliminación
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
    setDeletingDominio(null);
  }, []);

  // Handlers para el stepper
  const handleStepperComplete = useCallback(async (formData: any, saveType: 'draft' | 'approval') => {
    try {
      // Aquí se procesaría la creación del dominio usando los datos del stepper
      console.log('Datos del stepper:', formData, 'Tipo de guardado:', saveType);
      
      // Por ahora, simplemente cerramos el modal y refrescamos
      setShowStepperModal(false);
      refresh();
      
      const effectiveSaveType = (saveType ?? formData?.saveType) as 'draft' | 'approval';
      const message = effectiveSaveType === 'draft' 
        ? 'Dominio guardado como borrador exitosamente'
        : 'Dominio enviado para aprobación exitosamente';
      AlertService.success(message);
    } catch (error: any) {
      console.error('Error en stepper:', error);
      AlertService.error(error?.message || 'Error al procesar el dominio');
    }
  }, [refresh]);

  const handleStepperCancel = useCallback(() => {
    setShowStepperModal(false);
    setEditingDominioForStepper(null);
  }, []);

  // Handlers para el stepper de subdominios
  const handleSubDominioStepperComplete = useCallback(async (formData: any, saveType: 'draft' | 'approval') => {
    try {
      console.log('Datos del stepper de subdominios:', formData, 'Tipo de guardado:', saveType);

      // Cerrar el modal del stepper y limpiar selección
      setShowSubDominioStepperModal(false);
      const dominioIdToRefresh = selectedDominioForSubDominioStepper?.dominioId;
      setSelectedDominioForSubDominioStepper(null);

      // Refrescar la grilla principal de dominios
      refresh();

      // Ya no recargamos subdominios al completar el stepper

      const effectiveSaveType = (saveType ?? formData?.saveType) as 'draft' | 'approval';
      const message = effectiveSaveType === 'draft'
        ? 'Subdominio guardado como borrador exitosamente'
        : 'Subdominio enviado para aprobación exitosamente';
      AlertService.success(message);
    } catch (error: any) {
      console.error('Error en stepper de subdominios:', error);
      AlertService.error(error?.message || 'Error al procesar el subdominio');
    }
  }, [refresh, loadSubDominiosData, selectedDominioForSubDominioStepper]);

  const handleSubDominioStepperCancel = useCallback(() => {
    setShowSubDominioStepperModal(false);
    setSelectedDominioForSubDominioStepper(null);
  }, []);

  // Helper: mapear estado de Dominio a StatusBadge
  const mapEstadoToBadge = useCallback((estado: EstadoDominioData) => {
    switch (estado) {
      case EstadoDominioData.ACTIVO: return 'active';
      case EstadoDominioData.INACTIVO: return 'inactive';
      case EstadoDominioData.PENDIENTE: return 'pending';
      case EstadoDominioData.RECHAZADO: return 'error';
      case EstadoDominioData.INICIAR_FLUJO: return 'running';
      case EstadoDominioData.BORRADOR: default: return 'info';
    }
  }, []);

  // ===== CONFIGURACIÓN DE GRID =====
  const gridActions: GridAction[] = useMemo(() => [
    {
      icon: 'Eye',
      color: colors.primary,
      tooltip: 'Ver detalles',
      onClick: (row) => handleViewDominio(row as DominioData)
    },
    {
      icon: 'Edit',
      color: colors.primary,
      tooltip: 'Editar',
      onClick: (row) => handleEditDominio(row as DominioData)
    },
    {
      icon: 'Trash2',
      color: '#EF4444',
      tooltip: 'Eliminar',
      onClick: (row) => handleDeleteDominio(row as DominioData)
    }
  ], [handleViewDominio, handleEditDominio, handleDeleteDominio, colors.primary]);

  const gridColumns: GridColumn[] = useMemo(() => [
    {
      id: 'codigo',
      header: 'Código',
      accessor: 'codigo',
      width: 120,
      render: (value) => (
        <span style={{ fontFamily: 'monospace' }}>
          {value || 'N/A'}
        </span>
      )
    },
    {
      id: 'nombre',
      header: 'Nombre',
      accessor: 'nombre',
      width: 200,
      sortable: true
    },
    {
      id: 'descripcion',
      header: 'Descripción',
      accessor: 'descripcion',
      width: 300,
      render: (value) => (
        <span title={value}>
          {value && value.length > 50 ? `${value.substring(0, 50)}...` : value || 'Sin descripción'}
        </span>
      )
    },
    {
      id: 'tipoDominio',
      header: 'Tipo',
      accessor: 'tipo',
      width: 120,
      render: (value) => (
        <span style={{
           padding: '4px 8px',
           borderRadius: '4px',
           backgroundColor: colors.primary + '20',
           color: colors.primary,
           fontSize: '12px'
         }}>
           {getTipoDominioDataLabel(value)}
         </span>
      )
    },
    {
      id: 'estado',
      header: 'Estado',
      accessor: 'estado',
      width: 100,
      render: (value) => {
        const getStatusColor = (status: EstadoDominioData) => {
          const estadoNum = typeof status === 'string' ? parseInt(status) : status;
          switch (estadoNum) {
            case 1: return '#10B981'; // green - Activo
            case 0: return '#EF4444'; // red - Inactivo
            case -2: return '#F59E0B'; // amber - Pendiente
            case -4: return '#3B82F6'; // blue - Borrador
            default: return colors.textSecondary;
          }
        };
        
        const statusColor = getStatusColor(value);
        return (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: statusColor + '20',
            color: statusColor,
            fontSize: '12px'
          }}>
            {getEstadoDominioDataLabel(value)}
          </span>
        );
      }
    },
    {
      id: 'fechaCreacion',
      header: 'Fecha Creación',
      accessor: 'fechaCreacion',
      width: 120,
      render: (value) => value ? new Date(value).toLocaleDateString('es-ES') : 'N/A'
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: () => null,
      width: 120,
      align: 'center',
      actions: gridActions
    }
  ], [colors, gridActions]);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
        <h3 className={styles.errorText}>Error al cargar dominios</h3>
        <p style={{ color: colors.textSecondary, marginBottom: '16px' }}>{error}</p>
        <Button onClick={refresh} variant="outline" size="m" iconName="RefreshCw" iconPosition="left">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.dominiosContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1>Gestión de Dominios de Data</h1>
            <p>Administra la jerarquía de dominios y sub-dominios de datos</p>
          </div>
          <div className={styles.headerActions}>
            <Button 
              variant="default" 
              onClick={handleNewDominioStepper} 
              size="m" 
              iconName="Plus"
            >
              Nuevo Dominio
            </Button>
            <Button 
              variant="action" 
              size="m"
              iconName="GitBranch"
              backgroundColor={theme === 'dark' ? '#8b5cf620' : '#f3f4f6'}
              textColor="#8b5cf6"
              borderColor="#8b5cf6"
              onClick={handleShowHierarchy}
            >
              Jerarquía
            </Button>
          </div>
        </div>

        {/* Toolbar de búsqueda */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchContainer}>
              <Input
                placeholder="Buscar dominios..."
                value={filters.searchTerm || ''}
                onChange={handleSearchChange}
                icon="Search"
              />
            </div>
          </div>

          <div className={styles.toolbarRight}>
            <Button 
              variant="action" 
              size="m" 
              onClick={refresh} 
              loading={loading}
              iconName="Settings"
              className={styles.actionButton}
              backgroundColor={colors.surface}
              textColor={colors.textSecondary}
              borderColor={colors.border}
            >
              Actualizar
            </Button>
            <div className={styles.viewToggle}>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="s"
                onClick={() => setViewMode('grid')}
                iconName="Grid"
                className={styles.viewButton}
              />
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="s"
                onClick={() => setViewMode('list')}
                iconName="List"
                className={styles.viewButton}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas eliminadas por solicitud */}

      {/* Contenido principal */}
      {loading && dominios.length === 0 ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p style={{ color: colors.textSecondary }}>Cargando dominios...</p>
        </div>
      ) : dominios.length === 0 ? (
        <EmptyState
          title="No hay dominios"
          description="No se encontraron dominios que coincidan con los filtros aplicados."
          actions={[{
            label: 'Crear primer dominio',
            icon: 'Plus',
            onClick: handleNewDominioStepper,
            primary: true
          }]}
          className={styles.emptyState}
        />
      ) : viewMode === 'grid' ? (
        <div className={styles.content}>
          <div className={styles.cardsGrid}>
            {(() => {
              console.log('📋 [DOMINIOS DATA] Lista paginada de dominios para cards:', {
                totalDominios: dominios.length,
                paginacion: pagination,
                filtros: filters,
                dominios: dominios.map((d, index) => ({
                  index,
                  dominioId: d.dominioId,
                  nombre: d.nombre,
                  codigo: d.codigo,
                  descripcion: d.descripcion,
                  estado: d.estado,
                  tipoDominioId: d.tipoDominioId,
                  tipo: d.tipo,
                  gobernanzaId: d.gobernanzaId,
                  fechaCreacion: d.fechaCreacion,
                  subDominios: d.subDominios?.length || 0,
                  subDominiosData: d.subDominiosData?.length || 0,
                  objetoCompleto: d
                }))
              });
              return dominios;
            })().map((dominio) => (
              <div 
                key={dominio.dominioId} 
                className={styles.dominioCard}
                onClick={() => handleViewDominio(dominio)}
                title={`Dominio: ${dominio.nombre}\nCódigo: ${dominio.codigo || '—'}\nEstado: ${getEstadoDominioDataLabel(dominio.estado)}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.titleContainer}>
                    <h3 className={styles.cardTitle}>{dominio.nombre}</h3>
                    <span className={styles.cardCode}>{dominio.codigo || '—'}</span>
                  </div>
                  <div className={styles.headerActions}>
                    <StatusBadge
                      status={mapEstadoToBadge(dominio.estado)}
                      size="s"
                      variant="subtle"
                      className={styles.headerStatusBadge}
                      title={`Estado: ${getEstadoDominioDataLabel(dominio.estado)}`}
                    />
                    <div className={styles.actionsContainer}>
                      <Button
                        variant="ghost"
                        size="s"
                        className={styles.actionsButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionsId(openActionsId === dominio.dominioId ? null : dominio.dominioId);
                        }}
                        iconName="MoreVertical"
                        title="Acciones del dominio"
                      />

                      {openActionsId === dominio.dominioId && (
                        <div className={styles.actionsMenu}>
                          <button
                            className={styles.actionItem}
                            onClick={(e) => handleActionClick(e, () => handleViewDominio(dominio))}
                            title="Ver detalles del dominio"
                          >
                            <Eye size={14} />
                            Ver
                          </button>
                          <button
                            className={styles.actionItem}
                            onClick={(e) => handleActionClick(e, () => handleSeguimientoDominio(dominio))}
                            title="Ver seguimiento de aprobación del dominio"
                          >
                            <Activity size={14} />
                            Seguimiento
                          </button>
                          <button
                            className={styles.actionItem}
                            onClick={(e) => handleActionClick(e, () => handleSubDominiosStepper(dominio))}
                            title="Gestionar subdominios con stepper"
                          >
                            <Settings size={14} />
                            Subdominios
                          </button>
                          <button
                            className={styles.actionItem}
                            onClick={(e) => handleActionClick(e, () => handleEditDominio(dominio))}
                            title="Editar dominio"
                          >
                            <Edit size={14} />
                            Editar
                          </button>
                          <button
                            className={`${styles.actionItem} ${styles.deleteAction}`}
                            onClick={(e) => handleActionClick(e, () => handleDeleteDominio(dominio))}
                            title="Eliminar dominio"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.cardContentCustom}>
                  <p className={styles.cardDescription} title={dominio.descripcion}>
                    {dominio.descripcion || 'Sin descripción'}
                  </p>
                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Tipo:</span>
                      <span className={styles.metaValue}>{getTipoDominioDataLabel(dominio.tipo)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Sub-dominios:</span>
                      <span className={styles.metaValue}>{dominio.totalSubDominios ?? (dominio.subDominiosData?.length ?? 0)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.footerInfo}>
                    {dominio.dominioParent_Nombre ? (
                      <span className={styles.parentInfo} title={`Depende de: ${dominio.dominioParent_Nombre}`}>
                        Depende de: {dominio.dominioParent_Nombre}
                      </span>
                    ) : (
                      <span className={styles.parentInfo}>Dominio raíz</span>
                    )}
                  </div>
                  {/* Acciones movidas al menú contextual del header */}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación replicada de Sistemas */}
          {pagination && (
            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                <span className={styles.resultsText}>
                  {`Mostrando ${((pagination.currentPage - 1) * pagination.pageSize) + 1} - ${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} de ${pagination.totalCount} dominios`}
                </span>
                <div className={styles.pageSizeSelector}>
                  <span className={styles.pageSizeLabel}>Mostrar:</span>
                  <Select value={String(pagination.pageSize)} onValueChange={(value) => setPageSize(parseInt(value))}>
                    <SelectTrigger className={styles.pageSizeSelect}>
                      <SelectValue placeholder={String(pagination.pageSize)} />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50, 100].map(size => (
                        <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Controles con números y elipsis */}
              <div className={styles.pageButtons}>
                <Button
                  variant="outline"
                  size="s"
                  className={styles.pageButton}
                  disabled={pagination.currentPage <= 1}
                onClick={() => setPage(pagination.currentPage - 1)}
                  iconName="ChevronLeft"
                  iconPosition="left"
                >
                  Anterior
                </Button>

                <div className={styles.pageNumbers}>
                  {(() => {
                    const totalPages = Math.max(1, Math.ceil(pagination.totalCount / pagination.pageSize));
                    const current = pagination.currentPage;
                    const pages: (number | string)[] = [];

                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else if (current <= 3) {
                      for (let i = 1; i <= 4; i++) pages.push(i);
                      pages.push('...');
                      pages.push(totalPages);
                    } else if (current >= totalPages - 2) {
                      pages.push(1);
                      pages.push('...');
                      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      pages.push('...');
                      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
                      pages.push('...');
                      pages.push(totalPages);
                    }

                    return pages.map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className={styles.ellipsis}
                          >
                            ...
                          </span>
                        );
                      }
                      const num = p as number;
                      const isActive = num === current;
                      return (
                        <Button
                          key={num}
                          variant={isActive ? 'default' : 'outline'}
                          size="s"
                          className={styles.pageButton}
                          onClick={() => setPage(num)}
                        >
                          {num}
                        </Button>
                      );
                    });
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="s"
                  className={styles.pageButton}
                  disabled={pagination.currentPage >= Math.ceil(pagination.totalCount / pagination.pageSize)}
                onClick={() => setPage(pagination.currentPage + 1)}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.content}>
          <Grid
            data={dominios}
            columns={gridColumns}
            actions={gridActions}
            loading={loading}
            pagination={{
              page: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.totalCount,
              onPageChange: setPage,
              onPageSizeChange: setPageSize
            }}
            emptyMessage="No se encontraron dominios"
          />
        </div>
        )}
      {/* Modal de Confirmación de Eliminación */}
      <CRUDConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar Dominio"
        message={`¿Estás seguro de que deseas eliminar el dominio "${deletingDominio?.nombre}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="delete"
      />

      {/* Modal de Subdominios */}
      <SubDominiosModal
        isOpen={showSubDominiosModal}
        onClose={() => setShowSubDominiosModal(false)}
        dominio={selectedDominioForSubDominios}
        onSuccess={() => {
          refresh();
          AlertService.success('Operación completada exitosamente');
        }}
        onError={(error) => {
          AlertService.error(`Error: ${error}`);
        }}
        onGovernance={handleDominioGovernance}
      />

      {/* Modal de Jerarquía */}
      <DominiosHierarchyModal
        isOpen={showHierarchyModal}
        onClose={() => setShowHierarchyModal(false)}
      />

      {/* Modal de Gobernanza */}
      {showGobernanzaForm && (
        <GobernanzaForm
          isOpen={showGobernanzaForm}
          mode={gobernanzaData ? 'view' : 'create'}
          initialData={gobernanzaData ? {
            gobernanzaId: gobernanzaData.gobernanzaId,
            tipoGobiernoId: gobernanzaData.tipoGobiernoId || '',
            tipoEntidadId: gobernanzaData.tipoEntidadId || '',
            entidadId: gobernanzaData.entidadId || '',
            organizacionId: gobernanzaData.organizacionId || '',
            nombre: gobernanzaData.nombre || '',
            fechaAsignacion: gobernanzaData.fechaAsignacion || '',
            fechaVencimiento: gobernanzaData.fechaVencimiento || '',
            observaciones: gobernanzaData.observaciones || '',
            gobernanzaRoles: gobernanzaData.gobernanzaRoles || []
          } : undefined}
          source="Data"
          onClose={() => {
            setShowGobernanzaForm(false);
            setSelectedDominioForGovernance(null);
            setGobernanzaData(null);
          }}
          onSubmit={async (data) => {
            try {
              // Aquí podrías implementar la lógica de actualización si es necesario
              setShowGobernanzaForm(false);
              setSelectedDominioForGovernance(null);
              setGobernanzaData(null);
              refresh();
              AlertService.success('Gobernanza actualizada exitosamente');
            } catch (error: any) {
              AlertService.error(`Error en gobernanza: ${error.message || error}`);
            }
          }}
          onCancel={() => {
            setShowGobernanzaForm(false);
            setSelectedDominioForGovernance(null);
            setGobernanzaData(null);
          }}
        />
      )}
      {/* Modal de Vista de Dominio (solo lectura) */}
      <DominioViewModal
        isOpen={showDominioViewModal}
        onClose={() => {
          setShowDominioViewModal(false);
          setSelectedDominioForView(null);
        }}
        dominio={selectedDominioForView}
      />

      {/* Modal del Stepper de Dominio */}
      <StepperDominioDataForm
        isOpen={showStepperModal}
        mode={editingDominioForStepper ? 'edit' : 'create'}
        organizacionId={user?.organizacionId || 1}
        onClose={handleStepperCancel}
        onSubmit={handleStepperComplete}
        isSubmitting={loading}
        editingDominio={editingDominioForStepper}
      />

      {/* Modal del Stepper de Subdominios */}
      <StepperSubDominioForm
        isOpen={showSubDominioStepperModal}
        mode="create"
        dominioId={selectedDominioForSubDominioStepper?.dominioId || 0}
        organizacionId={user?.organizacionId || 1}
        onClose={handleSubDominioStepperCancel}
        onSubmit={handleSubDominioStepperComplete}
        isSubmitting={loading}
        subDominios={selectedDominioForSubDominioStepper?.subDominiosData || []}
      />

      {/* Modal de Seguimiento de Aprobación */}
      <Modal
        isOpen={showApprovalTrackingModal}
        onClose={() => {
          setShowApprovalTrackingModal(false);
          setSelectedDominioForApproval(null);
        }}
        title={`Seguimiento de Aprobación - ${selectedDominioForApproval?.nombre || 'Dominio'}`}
        size="l"
        hideFooter={true}
        className="approval-tracking-modal"
      >
        {selectedDominioForApproval && (
          <ApprovalTracker
            dominioId={selectedDominioForApproval.dominioId}
            showDetailed={true}
            onApprovalAction={(dominioId, accion, comentarios) => {
              AlertService.info(`Acción "${accion}" registrada para dominio #${dominioId}`);
            }}
          />
        )}
      </Modal>
      
      {/* Debug info */}
      {console.log('🔧 [DOMINIOS DATA RENDER] showSubDominioStepperModal:', showSubDominioStepperModal, 'selectedDominio:', selectedDominioForSubDominioStepper)}
    </div>
  );
};

export default DominiosData;