import React from 'react';
import { Chip, ChipProps } from './chip';
import { Plus } from 'lucide-react';
import './chip.css';

// =============================================
// INTERFACES
// =============================================

export interface ChipItem {
  id: string | number;
  label: string;
  description?: string;
  color?: string;
  type?: 'server' | 'system' | 'default';
}

export interface ChipGroupProps {
  /** Lista de chips a mostrar */
  chips: ChipItem[];
  /** Función cuando se remueve un chip */
  onRemove?: (id: string | number) => void;
  /** Función cuando se hace click en un chip */
  onChipClick?: (id: string | number) => void;
  /** Función cuando se hace click en el botón de agregar */
  onAddClick?: () => void;
  /** Texto del botón de agregar */
  addButtonText?: string;
  /** Si mostrar el botón de agregar */
  showAddButton?: boolean;
  /** Tamaño de los chips */
  size?: 'xs' | 's' | 'm' | 'l';
  /** Variante de los chips */
  variant?: 'filled' | 'outline' | 'subtle';
  /** Si los chips son removibles */
  removable?: boolean;
  /** Si los chips están deshabilitados */
  disabled?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Título/tooltip del grupo */
  title?: string;
  /** Si mostrar ícono de servidor por defecto */
  showServerIcon?: boolean;
  /** Máximo número de chips a mostrar */
  maxChips?: number;
  /** Texto para mostrar cuando hay más chips de los que se pueden mostrar */
  moreText?: string;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  onRemove,
  onChipClick,
  onAddClick,
  addButtonText = 'Agregar',
  showAddButton = false,
  size = 'm',
  variant = 'filled',
  removable = false,
  disabled = false,
  className = '',
  title,
  showServerIcon = false,
  maxChips,
  moreText = 'más...'
}) => {
  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const handleRemove = (id: string | number) => {
    onRemove?.(id);
  };

  const handleChipClick = (id: string | number) => {
    onChipClick?.(id);
  };

  const handleAddClick = () => {
    onAddClick?.();
  };

  // Determinar qué chips mostrar
  const chipsToShow = maxChips ? chips.slice(0, maxChips) : chips;
  const hasMoreChips = maxChips && chips.length > maxChips;
  const remainingCount = maxChips ? chips.length - maxChips : 0;

  // =============================================
  // RENDER
  // =============================================

  const groupClasses = [
    'chip-group',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={groupClasses}
      title={title}
    >
      {/* Chips */}
      {chipsToShow.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          description={chip.description}
          color={chip.color}
          size={size}
          variant={variant}
          removable={removable}
          onRemove={() => handleRemove(chip.id)}
          disabled={disabled}
          showServerIcon={showServerIcon}
          onClick={() => handleChipClick(chip.id)}
          type={chip.type}
        />
      ))}

      {/* Indicador de más chips */}
      {hasMoreChips && (
        <span
          className="chip-group-more"
          title={`${remainingCount} elementos más`}
        >
          +{remainingCount} {moreText}
        </span>
      )}

      {/* Botón de agregar */}
      {showAddButton && (
        <button
          className="chip-group-add-button"
          onClick={handleAddClick}
          disabled={disabled}
          title="Agregar elemento"
        >
          <Plus size={16} />
          {addButtonText}
        </button>
      )}
    </div>
  );
}; 