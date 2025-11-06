import React, { useMemo } from 'react';
import { Button } from '../../ui/button/Button';
import { Input } from '../../ui/input/Input';
import { StatusBadge } from '../../ui/badge/StatusBadge';
import { Card } from '../../ui/card/Card';
import { Table } from '../../ui/table/Table';
import { Icon } from '../../ui/icon/Icon';
import { AlertService } from '../../../services/alert/AlertService';
import { ThemeContext } from '../../ui/theme/ThemeContext';
export interface Proceso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  organizacion?: string;
  categoria?: string;
  estado?: string;
  criticidad?: 'Baja' | 'Media' | 'Alta';
  actividades?: number;
}
const PROCESOS_MOCK: Proceso[] = [
  { id: '1', codigo: 'PRC-001', nombre: 'Onboarding de Clientes', descripcion: 'Alta nivel', organizacion: 'Org 1', categoria: 'Operativo', estado: 'Activo', criticidad: 'Alta', actividades: 12 },
  { id: '2', codigo: 'PRC-002', nombre: 'Facturación', descripcion: 'Ciclo de cobros', organizacion: 'Org 2', categoria: 'Financiero', estado: 'Activo', criticidad: 'Media', actividades: 8 },
  { id: '3', codigo: 'PRC-003', nombre: 'Soporte', descripcion: 'Atención tickets', organizacion: 'Org 1', categoria: 'Operativo', estado: 'Borrador', criticidad: 'Baja', actividades: 5 },
];
export interface ListaProcesosEnhancedControlledProps {
  filters?: { search?: string; categoria?: string; estado?: string };
  onFiltersChange?: (next: { search?: string; categoria?: string; estado?: string }) => void;
  hideInternalFilters?: boolean;
  onCreateProcess?: () => void;
  onEditProcess?: (p: Proceso) => void;
  onViewProcess?: (p: Proceso) => void;
  onViewDiagram?: (p: Proceso) => void;
}
export const ListaProcesosEnhancedControlled: React.FC<ListaProcesosEnhancedControlledProps> = ({
  filters,
  onFiltersChange,
  hideInternalFilters = true,
  onCreateProcess,
  onEditProcess,
  onViewProcess,
  onViewDiagram,
}) => {
  const theme = React.useContext(ThemeContext);
  const applied = filters || {};
  const filtered = useMemo(() => {
    let list = PROCESOS_MOCK.slice();
    if (applied.search) {
      const s = applied.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(s) ||
          p.codigo.toLowerCase().includes(s) ||
          (p.descripcion || '').toLowerCase().includes(s)
      );
    }
    if (applied.categoria) {
      list = list.filter((p) => p.categoria === applied.categoria);
    }
    if (applied.estado) {
      list = list.filter((p) => p.estado === applied.estado);
    }
    return list;
  }, [applied.search, applied.categoria, applied.estado]);
  return (
    <Card className="lista-procesos-enhanced">
      <div className="card-header">
        <div className="title">
          <Icon name="GitBranch" />
          <span>Procesos</span>
        </div>
        <div className="actions">
          <Button variant="secondary" onClick={() => AlertService.info('Exportar aún no implementado')}>Exportar</Button>
          <Button variant="primary" onClick={onCreateProcess}>Nuevo Proceso</Button>
        </div>
      </div>
      {!hideInternalFilters && (
        <div className="filters" style={{ gap: theme.spacing?.sm || 8 }}>
          <Input
            value={applied.search || ''}
            onChange={(e) => onFiltersChange?.({ ...applied, search: (e.target as HTMLInputElement).value })}
            placeholder="Buscar procesos..."
          />
          <Input
            value={applied.categoria || ''}
            onChange={(e) => onFiltersChange?.({ ...applied, categoria: (e.target as HTMLInputElement).value })}
            placeholder="Categoría"
          />
          <Input
            value={applied.estado || ''}
            onChange={(e) => onFiltersChange?.({ ...applied, estado: (e.target as HTMLInputElement).value })}
            placeholder="Estado"
          />
          <Button onClick={() => onFiltersChange?.({})}>Limpiar</Button>
        </div>
      )}
      <Table
        columns={[
          { key: 'codigo', header: 'Código' },
          { key: 'nombre', header: 'Nombre' },
          { key: 'descripcion', header: 'Descripción' },
          { key: 'organizacion', header: 'Organización' },
          { key: 'categoria', header: 'Categoría' },
          { key: 'estado', header: 'Estado' },
          { key: 'criticidad', header: 'Criticidad' },
          { key: 'actividades', header: 'Actividades' },
          { key: 'acciones', header: 'Acciones' },
        ]}
        data={filtered.map((p) => ({
          ...p,
          estado: <StatusBadge status={p.estado || 'Desconocido'} />,
          acciones: (
            <div className="row-actions" style={{ display: 'flex', gap: theme.spacing?.xs || 6 }}>
              <Button size="sm" onClick={() => onViewProcess?.(p)}>Ver</Button>
              <Button size="sm" onClick={() => onEditProcess?.(p)} variant="secondary">Editar</Button>
              <Button size="sm" onClick={() => onViewDiagram?.(p)} variant="ghost">Diagrama</Button>
            </div>
          ),
        }))}
        emptyMessage={applied.search ? 'Sin resultados para tu búsqueda.' : 'Aún no hay procesos.'}
      />
    </Card>
  );
};
export default ListaProcesosEnhancedControlled;
