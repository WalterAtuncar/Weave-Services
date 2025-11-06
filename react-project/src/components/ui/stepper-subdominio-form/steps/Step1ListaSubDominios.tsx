import React, { useMemo, useCallback } from 'react';
import { Database, Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Button } from '../../button/button';
import { Input } from '../../input/input';
import { Grid, GridColumn, GridAction } from '../../grid/Grid';
import { StatusBadge } from '../../status-badge';
import { EmptyState } from '../../empty-state/EmptyState';
import { Step1ListaSubDominiosProps } from '../types';
import { SubDominioData, getEstadoDominioDataLabel, EstadoDominioData } from '../../../../models/DominiosData';
import styles from '../StepperSubDominioForm.module.css';
import sysStyles from '../../stepper-system-form/StepperSystemForm.module.css';

const Step1ListaSubDominios: React.FC<Step1ListaSubDominiosProps> = ({
  formData,
  onDataChange,
  errors,
  isLoading = false,
  disabled = false,
  organizacionId,
  subDominios,
  onNewSubDominio,
  onEditSubDominio,
  onDeleteSubDominio,
  loadingSubDominios = false
}) => {
  const { colors } = useTheme();

  // ===== ESTADO LOCAL =====
  const [searchTerm, setSearchTerm] = React.useState('');

  // ===== DATOS FILTRADOS =====
  const filteredSubDominios = useMemo(() => {
    if (!subDominios) return [];
    
    return subDominios.filter(subdominio => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        subdominio.nombre?.toLowerCase().includes(searchLower) ||
        subdominio.codigo?.toLowerCase().includes(searchLower) ||
        (subdominio.descripcion?.toLowerCase().includes(searchLower) ?? false)
      );
    });
  }, [subDominios, searchTerm]);

  // ===== HANDLERS =====
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleViewSubDominio = useCallback((subdominio: SubDominioData) => {
    // TODO: Implementar vista de detalles
    console.log('Ver subdominio:', subdominio);
  }, []);

  // Helper: mapear estado de Subdominio a StatusBadge
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
      onClick: (row) => handleViewSubDominio(row as SubDominioData)
    },
    {
      icon: 'Edit',
      color: colors.primary,
      tooltip: 'Editar',
      onClick: (row) => onEditSubDominio(row as SubDominioData)
    },
    {
      icon: 'Trash2',
      color: '#EF4444',
      tooltip: 'Eliminar',
      onClick: (row) => onDeleteSubDominio(row as SubDominioData)
    }
  ], [handleViewSubDominio, onEditSubDominio, onDeleteSubDominio, colors.primary]);

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

  return (
    <div className={styles.stepContainer}>
      {/* Header del Step */}
      <div className={sysStyles.stepHeader}>
        <div className={sysStyles.stepIcon}>
          <Database size={20} />
        </div>
        <div>
          <h2 className={sysStyles.stepTitle}>
            Subdominios ({filteredSubDominios.length})
          </h2>
          <p className={sysStyles.stepDescription}>
            Gestiona los subdominios existentes o crea uno nuevo
          </p>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className={styles.toolbarSection}>
        <div className={styles.searchContainer}>
          <Input
            icon="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar subdominios..."
            disabled={disabled || loadingSubDominios}
          />
        </div>
        
        <Button
          onClick={onNewSubDominio}
          variant="primary"
          size="m"
          iconName="Plus"
          iconPosition="left"
          disabled={disabled || loadingSubDominios}
        >
          Nuevo Subdominio
        </Button>
      </div>

      {/* Contenido principal */}
      <div className={styles.formSection}>
        {loadingSubDominios ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <span>Cargando subdominios...</span>
          </div>
        ) : filteredSubDominios.length > 0 ? (
          <div className={styles.gridContainer}>
            <Grid
              data={filteredSubDominios}
              columns={gridColumns}
              actions={gridActions}
              loading={loadingSubDominios}
              emptyMessage="No se encontraron subdominios"
              pagination={{
                page: 1,
                pageSize: 10,
                total: filteredSubDominios.length,
                onPageChange: () => {},
                onPageSizeChange: () => {}
              }}
            />
          </div>
        ) : (
          <EmptyState
            icon={Database}
            title="No hay subdominios"
            description={
              searchTerm 
                ? "No se encontraron subdominios que coincidan con tu búsqueda"
                : "Este dominio no tiene subdominios definidos. Crea el primer subdominio para comenzar."
            }
            action={
              !searchTerm ? (
                <Button
                  onClick={onNewSubDominio}
                  variant="primary"
                  size="m"
                  iconName="Plus"
                  iconPosition="left"
                  disabled={disabled}
                >
                  Crear Primer Subdominio
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      {/* Información adicional */}
      {filteredSubDominios.length > 0 && (
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <Database size={16} />
            <span>
              Total de subdominios: <strong>{subDominios.length}</strong>
              {searchTerm && (
                <> | Mostrando: <strong>{filteredSubDominios.length}</strong></>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Errores generales */}
      {errors.general && (
        <div className={styles.errorContainer}>
          <span className={styles.fieldError}>{errors.general}</span>
        </div>
      )}
    </div>
  );
};

export default Step1ListaSubDominios;