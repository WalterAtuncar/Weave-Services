import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Input } from '../input';
import { Button } from '../button';
export interface EntityFilterBarProps {
  value?: {
    search?: string;
    categoria?: string;
    estado?: string | number;
    conDependencias?: boolean;
    tieneGobernanzaPropia?: boolean;
    tipo?: string | number;
  };
  onChange?: (next: EntityFilterBarProps['value']) => void;
  onClear?: () => void;
  className?: string;
}
export const EntityFilterBar: React.FC<EntityFilterBarProps> = ({ value = {}, onChange, onClear, className = '' }) => {
  const { colors } = useTheme();
  const update = (patch: Partial<NonNullable<EntityFilterBarProps['value']>>) => {
    const next = { ...value, ...patch };
    onChange?.(next);
  };
  return (
    <div className={className} style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) auto auto auto', gap: '12px', alignItems: 'end', padding: '12px 0' }}>
      <div>
        <Input
          label="Buscar"
          placeholder="Buscar por código, nombre o descripción..."
          value={value.search || ''}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ display:'flex', alignItems:'center', gap:8, color: colors.text }}>
          <input type="checkbox" checked={!!value.conDependencias} onChange={(e) => update({ conDependencias: e.target.checked })} />
          Con dependencias
        </label>
        <label style={{ display:'flex', alignItems:'center', gap:8, color: colors.text }}>
          <input type="checkbox" checked={!!value.tieneGobernanzaPropia} onChange={(e) => update({ tieneGobernanzaPropia: e.target.checked })} />
          Gobernanza propia
        </label>
      </div>
      <div style={{ justifySelf: 'end' }}>
        <Button variant="outline" onClick={onClear}>Limpiar</Button>
      </div>
    </div>
  );
};
export default EntityFilterBar;
