import React, { useState } from 'react';
import { Search, Filter, Plus, User, ChevronDown } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './Procesos.module.css';

interface Proceso {
  id: string;
  codigo: string;
  nombre: string;
  owner: string;
  descripcion: string;
  estado: 'En proceso' | 'Activo' | 'Borrador' | 'Inactivo';
}

interface ListaProcesosProps {
  onCrearProceso: () => void;
  onSeleccionarProceso: (proceso: Proceso) => void;
}

const procesosData: Proceso[] = [
  {
    id: '1',
    codigo: 'P000001',
    nombre: 'Pago de Factura',
    owner: 'Erick Machuca',
    descripcion: 'Este proceso corresponde al pago de una factura dentro del vencimiento',
    estado: 'En proceso'
  },
  {
    id: '2',
    codigo: 'P000002',
    nombre: 'Aprobación de Presupuesto',
    owner: 'María González',
    descripcion: 'Proceso de aprobación de presupuestos anuales por departamento',
    estado: 'Activo'
  },
  {
    id: '3',
    codigo: 'P000003',
    nombre: 'Gestión de Compras',
    owner: 'Juan Pérez',
    descripcion: 'Proceso completo de gestión de compras y adquisiciones',
    estado: 'Borrador'
  }
];

export const ListaProcesos: React.FC<ListaProcesosProps> = ({ 
  onCrearProceso, 
  onSeleccionarProceso 
}) => {
  const { colors } = useTheme();
  const [filtroEstado, setFiltroEstado] = useState('En proceso');
  const [busqueda, setBusqueda] = useState('');
  const [procesoExpandido, setProcesoExpandido] = useState<string | null>(null);

  const procesosFilteredData = procesosData.filter(proceso => 
    proceso.estado === filtroEstado && 
    (proceso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
     proceso.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
     proceso.owner.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'En proceso': return '#f59e0b';
      case 'Activo': return '#10b981';
      case 'Borrador': return '#6b7280';
      case 'Inactivo': return '#ef4444';
      default: return colors.textSecondary;
    }
  };

  return (
    <div className={styles.container} style={{ backgroundColor: colors.background }}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: colors.text }}>Procesos</h1>
        
        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={styles.select}
              style={{ 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }}
            >
              <option value="En proceso">En proceso</option>
              <option value="Activo">Activo</option>
              <option value="Borrador">Borrador</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <ChevronDown size={16} style={{ color: colors.textSecondary }} />
          </div>

          <div className={styles.searchGroup}>
            <Search size={16} style={{ color: colors.textSecondary }} />
            <input
              type="text"
              placeholder="Buscar procesos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.searchInput}
              style={{ 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.processTable}>
        <div className={styles.tableHeader}>
          <span style={{ color: colors.text }}>¿Qué?</span>
          <span style={{ color: colors.text }}>Owner</span>
          <span style={{ color: colors.text }}>Descripción</span>
        </div>

        <div className={styles.processList}>
          {procesosFilteredData.map((proceso) => (
            <div key={proceso.id} className={styles.processItem} style={{ backgroundColor: colors.surface }}>
              <div 
                className={styles.processRow}
                onClick={() => onSeleccionarProceso(proceso)}
              >
                <div className={styles.processName}>
                  <ChevronDown 
                    size={16} 
                    className={`${styles.expandIcon} ${procesoExpandido === proceso.id ? styles.expanded : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProcesoExpandido(procesoExpandido === proceso.id ? null : proceso.id);
                    }}
                    style={{ color: colors.textSecondary }}
                  />
                  <span style={{ color: colors.text }}>{proceso.nombre}</span>
                </div>
                
                <div className={styles.processOwner}>
                  <User size={16} style={{ color: colors.primary }} />
                  <span style={{ color: colors.text }}>{proceso.owner}</span>
                </div>
                
                <div className={styles.processDescription}>
                  <span style={{ color: colors.text }}>{proceso.descripcion}</span>
                </div>
              </div>

              {procesoExpandido === proceso.id && (
                <div className={styles.processDetails} style={{ backgroundColor: colors.background }}>
                  <div className={styles.detailItem}>
                    <span style={{ color: colors.textSecondary }}>Código:</span>
                    <span style={{ color: colors.text }}>{proceso.codigo}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span style={{ color: colors.textSecondary }}>Estado:</span>
                    <span 
                      className={styles.estadoBadge}
                      style={{ 
                        backgroundColor: getEstadoColor(proceso.estado) + '20',
                        color: getEstadoColor(proceso.estado)
                      }}
                    >
                      {proceso.estado}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onCrearProceso}
        className={styles.addButton}
        style={{ 
          backgroundColor: colors.primary,
          color: 'white'
        }}
      >
        <Plus size={20} />
        Agregar proceso
      </button>
    </div>
  );
}; 