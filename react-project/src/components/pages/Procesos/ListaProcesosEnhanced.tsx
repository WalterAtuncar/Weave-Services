import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Eye, Edit, MoreHorizontal, Download, FileText } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { AlertService } from '../../ui/alerts';
import { SuperWizardProcesos } from './SuperWizardProcesos';
import type { WizardCompleteData } from './SuperWizardProcesos';

interface ListaProcesosEnhancedProps {
  onCreateProcess?: () => void;
  onEditProcess?: (proceso: any) => void;
  onViewProcess?: (proceso: any) => void;
  onViewDiagram?: (proceso: any) => void;
  hideHeader?: boolean;
  hideInternalFilters?: boolean;
}

interface Proceso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: string;
  nivel: string;
  criticidad: string;
  organizacion: string;
  fechaCreacion: string;
  ultimaModificacion: string;
  actividades: number;
}

// Datos mock mejorados
const PROCESOS_MOCK: Proceso[] = [
  {
    id: '1',
    codigo: 'P000001',
    nombre: 'Pago de Factura',
    descripcion: 'Proceso para gestionar el pago de facturas de proveedores',
    categoria: 'Financiero',
    estado: 'Activo',
    nivel: 'Alto',
    criticidad: 'Crítico',
    organizacion: 'Finanzas',
    fechaCreacion: '2024-01-15',
    ultimaModificacion: '2024-01-20',
    actividades: 8
  },
  {
    id: '2',
    codigo: 'P000002',
    nombre: 'Gestión de Inventario',
    descripcion: 'Control y seguimiento del inventario de productos',
    categoria: 'Operativo',
    estado: 'Activo',
    nivel: 'Medio',
    criticidad: 'Importante',
    organizacion: 'Logística',
    fechaCreacion: '2024-01-10',
    ultimaModificacion: '2024-01-18',
    actividades: 12
  },
  {
    id: '3',
    codigo: 'P000003',
    nombre: 'Selección de Personal',
    descripcion: 'Proceso de reclutamiento y selección de nuevo personal',
    categoria: 'Estratégico',
    estado: 'Por aplicar',
    nivel: 'Alto',
    criticidad: 'Importante',
    organizacion: 'Recursos Humanos',
    fechaCreacion: '2024-01-12',
    ultimaModificacion: '2024-01-16',
    actividades: 6
  },
  {
    id: '4',
    codigo: 'P000004',
    nombre: 'Mantenimiento Preventivo',
    descripcion: 'Rutinas de mantenimiento preventivo de equipos',
    categoria: 'Soporte',
    estado: 'En proceso',
    nivel: 'Medio',
    criticidad: 'Normal',
    organizacion: 'Mantenimiento',
    fechaCreacion: '2024-01-08',
    ultimaModificacion: '2024-01-14',
    actividades: 4
  }
];

const CATEGORIAS = ['Todos', 'Financiero', 'Operativo', 'Estratégico', 'Soporte'];
const ESTADOS = ['Todos', 'Activo', 'Por aplicar', 'En proceso', 'Inactivo'];

export const ListaProcesosEnhanced: React.FC<ListaProcesosEnhancedProps> = ({
  onCreateProcess,
  onEditProcess,
  onViewProcess,
  onViewDiagram,
  hideHeader = false,
  hideInternalFilters = false
}) => {
  const { colors } = useTheme();
  const [procesos, setProcesos] = useState<Proceso[]>(PROCESOS_MOCK);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [showWizard, setShowWizard] = useState(false);

  // Filtrado y búsqueda
  const procesosFiltrados = useMemo(() => {
    return procesos.filter(proceso => {
      const matchSearch = searchTerm === '' || 
        proceso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proceso.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proceso.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategoria = categoriaFilter === 'Todos' || proceso.categoria === categoriaFilter;
      const matchEstado = estadoFilter === 'Todos' || proceso.estado === estadoFilter;
      
      return matchSearch && matchCategoria && matchEstado;
    });
  }, [procesos, searchTerm, categoriaFilter, estadoFilter]);

  // Handlers
  const handleCreateProcess = () => {
    setShowWizard(true);
    if (onCreateProcess) onCreateProcess();
  };

  const handleWizardComplete = (data: WizardCompleteData) => {
    const nuevoProceso: Proceso = {
      id: (procesos.length + 1).toString(),
      codigo: data.configuracion.codigo,
      nombre: data.configuracion.nombre,
      descripcion: data.configuracion.descripcion,
      categoria: data.configuracion.categoria,
      estado: data.estado,
      nivel: data.configuracion.nivel,
      criticidad: data.configuracion.criticidad,
      organizacion: data.configuracion.organizacion,
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimaModificacion: new Date().toISOString().split('T')[0],
      actividades: data.actividades.actividades.length
    };

    setProcesos(prev => [nuevoProceso, ...prev]);
    setShowWizard(false);
    
    AlertService.success(`Proceso ${nuevoProceso.nombre} creado exitosamente`, {
      title: 'Proceso creado'
    });
  };

  const handleEditProcess = (proceso: Proceso) => {
    AlertService.info(`Editando proceso: ${proceso.nombre}`, {
      title: 'Editor de procesos'
    });
    if (onEditProcess) onEditProcess(proceso);
  };

  const handleViewProcess = (proceso: Proceso) => {
    AlertService.info(`Visualizando proceso: ${proceso.nombre}`, {
      title: 'Vista de proceso'
    });
    if (onViewProcess) onViewProcess(proceso);
  };

  const handleViewDiagram = (proceso: Proceso) => {
    AlertService.info(`Abriendo diagrama de: ${proceso.nombre}`, {
      title: 'Diagrama BPMN'
    });
    if (onViewDiagram) onViewDiagram(proceso);
  };

  const handleExportData = () => {
    AlertService.info('Funcionalidad de exportación próximamente disponible', {
      title: 'Exportar datos'
    });
  };

  // Componentes auxiliares
  const getEstadoBadge = (estado: string) => {
    const colors_map = {
      'Activo': { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      'Por aplicar': { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      'En proceso': { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
      'Inactivo': { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
    };
    
    const colorSet = colors_map[estado as keyof typeof colors_map] || colors_map['Inactivo'];
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: colorSet.bg,
        color: colorSet.text,
        border: `1px solid ${colorSet.border}`
      }}>
        {estado}
      </span>
    );
  };

  const getCriticidadIcon = (criticidad: string) => {
    const iconStyle = { width: '16px', height: '16px' };
    switch (criticidad) {
      case 'Crítico': return <span style={{ ...iconStyle, color: '#ef4444' }}>🔥</span>;
      case 'Importante': return <span style={{ ...iconStyle, color: '#f59e0b' }}>⚠️</span>;
      case 'Normal': return <span style={{ ...iconStyle, color: '#10b981' }}>✅</span>;
      default: return <span style={{ ...iconStyle, color: '#6b7280' }}>⚪</span>;
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      {!hideHeader && (
        <Card style={{ marginBottom: '24px' }}>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={28} style={{ color: colors.primary }} />
                  Gestión de Procesos de Negocio
                </CardTitle>
                <p style={{ color: colors.textSecondary, margin: '8px 0 0 0' }}>
                  Administra y controla todos los procesos organizacionales
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  iconName="Download"
                  variant="outline"
                  onClick={handleExportData}
                >
                  Exportar
                </Button>
                <Button
                  iconName="Plus"
                  onClick={handleCreateProcess}
                >
                  Nuevo Proceso
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      {!hideInternalFilters && (
        <Card style={{ marginBottom: '24px' }}>
          <CardContent style={{ padding: '20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(300px, 1fr) auto auto auto',
              gap: '16px',
              alignItems: 'end'
            }}>
              {/* Búsqueda */}
              <div>
                <Input
                  label="Buscar procesos"
                  icon="Search"
                  placeholder="Buscar por código, nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filtro categoría */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: colors.text, 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Categoría
                </label>
                <select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    fontSize: '14px',
                    minWidth: '140px'
                  }}
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtro estado */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: colors.text, 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Estado
                </label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    fontSize: '14px',
                    minWidth: '140px'
                  }}
                >
                  {ESTADOS.map(est => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>

              {/* Botón limpiar filtros */}
              <Button
                variant="outline"
                iconName="Filter"
                onClick={() => {
                  setSearchTerm('');
                  setCategoriaFilter('Todos');
                  setEstadoFilter('Todos');
                }}
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de procesos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Procesos ({procesosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {procesosFiltrados.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: colors.textSecondary 
            }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0', color: colors.text }}>No se encontraron procesos</h3>
              <p style={{ margin: 0 }}>
                {searchTerm || categoriaFilter !== 'Todos' || estadoFilter !== 'Todos' 
                  ? 'Prueba ajustando los filtros de búsqueda' 
                  : 'Comienza creando tu primer proceso'
                }
              </p>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.background }}>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: colors.text,
                      borderBottom: `1px solid ${colors.border}`
                    }}>
                      Proceso
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      color: colors.text,
                      borderBottom: `1px solid ${colors.border}`
                    }}>
                      Categoría
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      color: colors.text,
                      borderBottom: `1px solid ${colors.border}`
                    }}>
                      Estado
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      color: colors.text,
                      borderBottom: `1px solid ${colors.border}`
                    }}>
                      Criticidad
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      color: colors.text,
                      borderBottom: `1px solid ${colors.border}`
                    }}>
                      Actividades
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      color: colors.text,
                      borderBottom: `1px solid ${colors.border}`
                    }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {procesosFiltrados.map((proceso) => (
                    <tr 
                      key={proceso.id}
                      style={{ 
                        borderBottom: `1px solid ${colors.border}`,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.background;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ 
                              color: colors.text, 
                              fontWeight: '600',
                              fontSize: '14px'
                            }}>
                              {proceso.nombre}
                            </span>
                            <span style={{ 
                              color: colors.textSecondary, 
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              backgroundColor: colors.background,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {proceso.codigo}
                            </span>
                          </div>
                          <p style={{ 
                            color: colors.textSecondary, 
                            fontSize: '13px',
                            margin: 0,
                            lineHeight: '1.4'
                          }}>
                            {proceso.descripcion}
                          </p>
                          <p style={{ 
                            color: colors.textSecondary, 
                            fontSize: '12px',
                            margin: '4px 0 0 0',
                            fontStyle: 'italic'
                          }}>
                            {proceso.organizacion} • Actualizado: {proceso.ultimaModificacion}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'left' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: colors.background,
                          color: colors.text,
                          border: `1px solid ${colors.border}`
                        }}>
                          {proceso.categoria}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {getEstadoBadge(proceso.estado)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {getCriticidadIcon(proceso.criticidad)}
                          <span style={{ fontSize: '13px', color: colors.text }}>
                            {proceso.criticidad}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: colors.primary + '20',
                          color: colors.primary,
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {proceso.actividades}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <Button
                            size="s"
                            variant="outline"
                            iconName="Eye"
                            onClick={() => handleViewProcess(proceso)}
                            title="Ver proceso"
                          />
                          <Button
                            size="s"
                            variant="outline"
                            iconName="Edit"
                            onClick={() => handleEditProcess(proceso)}
                            title="Editar proceso"
                          />
                          <Button
                            size="s"
                            variant="outline"
                            iconName="FileText"
                            onClick={() => handleViewDiagram(proceso)}
                            title="Ver diagrama"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Super Wizard */}
      {showWizard && (
        <SuperWizardProcesos
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
};