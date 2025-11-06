import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Download, Upload, Grid, List, Server, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input/input';
import { Modal } from '../../ui/modal/Modal';
import { Grid as DataGrid, GridColumn, GridAction } from '../../ui/grid/Grid';
import { StatusBadge } from '../../ui/status-badge';

import { ServidorModal } from '../../ui/servidor-modal';
import { useServidores } from '../../../hooks/useServidores';
import { 
  Servidor, 
  CreateServidorDto, 
  UpdateServidorDto,
  TipoServidor,
  AmbienteServidor,
  EstadoServidor,
  ProveedorCloud,
  getTipoServidorLabel,
  getSistemaOperativoLabel,
  getAmbienteServidorLabel,
  getEstadoServidorLabel,
  getProveedorCloudLabel,
  getServidorDisplayName,
  getServidorIcon,
  getAmbienteColor
} from '../../../models/Servidores';
import { AlertService } from '../../ui/alerts';
import styles from './Servidores.module.css';

export interface ServidoresProps {
  className?: string;
  onNavigate?: (page: string) => void; // Para navegación interna
}

export const Servidores: React.FC<ServidoresProps> = ({
  className = '',
  onNavigate
}) => {
  const { colors } = useTheme();
  
  // Hook de servidores - organizacionId se obtiene internamente desde useAuth
  const {
    servidores,
    loading,
    error,
    filters,
    obtenerServidores,
    crearServidor,
    actualizarServidor,
    eliminarServidor,
    // cambiarEstado, // ❌ REMOVIDO: No se realizan acciones directas en servidores
    buscarServidores,
    // obtenerEstadisticas, // ❌ REMOVIDO: No se usa el botón de estadísticas
    setFilters
  } = useServidores();
  
  // Estados para modales
  const [servidorModalOpen, setServidorModalOpen] = useState(false);
  const [selectedServidorForEdit, setSelectedServidorForEdit] = useState<Servidor | null>(null);
  const [isReadonlyMode, setIsReadonlyMode] = useState(false); // Para controlar modo de solo lectura
  // const [servidorDetailModalOpen, setServidorDetailModalOpen] = useState(false); // YA NO SE USA
  // const [selectedServidorForView, setSelectedServidorForView] = useState<Servidor | null>(null); // YA NO SE USA

  // const [estadisticasModalOpen, setEstadisticasModalOpen] = useState(false); // REMOVIDO: Ya no se usa

  
  // Solo mantenemos el filtro de búsqueda básico
  
  // Estados para vista
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedServidoresForBatch, setSelectedServidoresForBatch] = useState<number[]>([]);
  
  // Cargar servidores al montar el componente
  useEffect(() => {
    obtenerServidores();
  }, []);

  // Hook personalizado para debounce
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms de delay

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    if (debouncedSearchTerm.length > 2) {
      // Búsqueda con endpoint paginado
      buscarServidores(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      // Obtener todos los servidores cuando no hay búsqueda
      obtenerServidores();
    }
    // Si length es 1 o 2, no hacemos nada (mantenemos los resultados actuales)
  }, [debouncedSearchTerm, buscarServidores, obtenerServidores]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setFilters({ search: value });
  }, [setFilters]);

  const handleNewServidor = () => {
    setSelectedServidorForEdit(null);
    setIsReadonlyMode(false); // Modo edición normal
    setServidorModalOpen(true);
  };

  const handleEditServidor = (servidor: Servidor) => {
    setSelectedServidorForEdit(servidor);
    setIsReadonlyMode(false); // Modo edición normal
    setServidorModalOpen(true);
  };

  const handleDeleteServidor = async (servidor: Servidor) => {
    const confirmed = await AlertService.confirm(
      `¿Estás seguro de que deseas eliminar el servidor "${servidor.nombreServidor}"?`,
      {
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar'
      }
    );
    
    if (confirmed) {
      try {
        const success = await eliminarServidor(servidor.servidorId);
        if (success) {
          // ✅ REFRESH: Actualizar la grilla después de eliminar
          obtenerServidores();
          // Notificaciones delegadas al hook (useServidores.eliminarServidor)
        }
      } catch (error) {
        // La notificación de error ya es gestionada por el hook/interceptor
        console.error('Error al eliminar el servidor', error);
      }
    }
  };

  const handleViewServidor = (servidor: Servidor) => {
    // ✅ USAR EL MISMO MODAL: Usar ServidorModal en modo readonly
    setSelectedServidorForEdit(servidor);
    setServidorModalOpen(true);
    setIsReadonlyMode(true); // Marcar como modo de solo lectura
  };

  // ❌ FUNCIÓN ELIMINADA: handleCambiarEstado - No se realizan acciones directas en servidores



  const handleSistemas = () => {
    // ✅ NAVEGACIÓN INTERNA: Usar el mismo mecanismo que el sidebar
    if (onNavigate) {
      onNavigate('sistemas');
    } else {
      console.warn('handleSistemas: onNavigate no disponible - agregar prop al componente');
    }
  };

  const handleServidorSuccess = (servidor: Servidor) => {
    const isEdit = selectedServidorForEdit !== null;
    setServidorModalOpen(false);
    setSelectedServidorForEdit(null);
    
    // ✅ REFRESH: Actualizar la grilla después de crear/editar
    obtenerServidores();
    
    // Notificaciones de éxito delegadas al hook (useServidores)
  };



  const handleCRUDError = (error: string) => {
    // Notificaciones visuales delegadas al hook/interceptor para evitar duplicados
    console.warn('CRUD error:', error);
  };



  // Configuración de columnas para la tabla
  const columns: GridColumn<Servidor>[] = [
    {
      id: 'nombreServidor',
      header: 'Servidor',
      accessor: 'nombreServidor',
      sortable: true,
      render: (value: any, servidor: Servidor) => (
        <div className={styles.servidorCell}>
          <div className={styles.servidorIcon}>
            {getServidorIcon(servidor.tipoServidor)}
          </div>
          <div className={styles.servidorInfo}>
            <div className={styles.servidorNombre}>{servidor.nombreServidor}</div>
            <div className={styles.servidorCodigo}>{servidor.codigoServidor}</div>
          </div>
        </div>
      )
    },
    {
      id: 'tipoServidor',
      header: 'Tipo',
      accessor: 'tipoServidor',
      sortable: true,
      render: (value: any, servidor: Servidor) => getTipoServidorLabel(servidor.tipoServidor)
    },
    {
      id: 'ambiente',
      header: 'Ambiente',
      accessor: 'ambiente',
      sortable: true,
      render: (value: any, servidor: Servidor) => (
        <StatusBadge 
          status="active"
        />
      )
    },
    {
      id: 'sistemaOperativo',
      header: 'S.O.',
      accessor: 'sistemaOperativo',
      sortable: true,
      render: (value: any, servidor: Servidor) => getSistemaOperativoLabel(servidor.sistemaOperativo)
    },
    {
      id: 'direccionIP',
      header: 'IP',
      accessor: 'direccionIP',
      sortable: true
    },
    {
      id: 'estado',
      header: 'Estado',
      accessor: 'estado',
      sortable: true,
      render: (value: any, servidor: Servidor) => (
        <StatusBadge 
          status={servidor.estado === EstadoServidor.ACTIVO ? 'active' : 'inactive'}
        />
      )
    },
    {
      id: 'fechaCreacion',
      header: 'Creado',
      accessor: 'fechaCreacion',
      sortable: true,
      render: (value: any, servidor: Servidor) => new Date(servidor.fechaCreacion).toLocaleDateString()
    },
    {
      id: 'acciones',
      header: 'Acciones',
      accessor: 'servidorId',
      width: '140px',
      sortable: false,
      render: (value: any, servidor: Servidor) => (
        <div 
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewServidor(servidor);
            }}
            title="Ver detalles"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              transition: 'all 0.2s ease'
            }}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditServidor(servidor);
            }}
            title="Editar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              transition: 'all 0.2s ease'
            }}
          >
            <Edit size={16} />
          </button>
          {/* ❌ BOTÓN ELIMINADO: Activar/Desactivar - Solo es un mantenedor, no acciones directas */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteServidor(servidor);
            }}
            title="Eliminar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              transition: 'all 0.2s ease'
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Estadísticas para mostrar en el header
  const estadisticas = useMemo(() => {
    const total = servidores.length;
    const activos = servidores.filter(s => s.estado === EstadoServidor.ACTIVO).length;
    const inactivos = servidores.filter(s => s.estado === EstadoServidor.INACTIVO).length;
    
    return { total, activos, inactivos };
  }, [servidores]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando servidores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Server size={32} />
            <div>
              <h1>Servidores</h1>
              <p>Gestión de servidores de la organización</p>
            </div>
          </div>
          
          <div className={styles.headerStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{estadisticas.total}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{estadisticas.activos}</span>
              <span className={styles.statLabel}>Activos</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{estadisticas.inactivos}</span>
              <span className={styles.statLabel}>Inactivos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchContainer}>
            <Search size={20} />
            <Input
              placeholder="Buscar por nombre, IP o sistema operativo..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.toolbarRight}>

          <Button
            variant="outline"
            onClick={handleSistemas}
            className={styles.statsButton}
          >
            <Server size={16} />
            Sistemas
          </Button>
          
          <Button
            variant="default"
            onClick={handleNewServidor}
            className={styles.newButton}
          >
            <Plus size={16} />
            Nuevo Servidor
          </Button>
        </div>
      </div>

      {/* Tabla de servidores */}
      <div className={styles.content}>
        <DataGrid
          data={servidores}
          columns={columns}
          loading={loading}
          emptyMessage="No hay servidores para mostrar"
          className={styles.grid}
        />
      </div>

      {/* Modales */}
      {servidorModalOpen && (
        <ServidorModal
          open={servidorModalOpen}
          onClose={() => {
            setServidorModalOpen(false);
            setIsReadonlyMode(false); // Resetear modo readonly al cerrar
          }}
          servidor={selectedServidorForEdit}
          onSuccess={handleServidorSuccess}
          onError={handleCRUDError}
          readonly={isReadonlyMode}
        />
      )}

      {/* ✅ REEMPLAZADO: ServidorDetailModal ahora usa ServidorModal con readonly={true} */}

      {/* Modal de confirmación personalizado para servidores usando AlertService */}



      {/* ❌ REMOVIDO: ServidorEstadisticasModal - No se implementan estadísticas */}
    </div>
  );
};

export default Servidores;