import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Input } from '../input/input';
import { Badge } from '../badge/badge';
import { 
  User, 
  Search, 
  X, 
  Check,
  Users,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// =============================================
// INTERFACES
// =============================================

export interface Usuario {
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  activo?: boolean;
  avatar?: string;
  rol?: string;
  departamento?: string;
}

export interface UserSelectorProps {
  /** Lista de usuarios disponibles */
  usuarios: Usuario[];
  /** Usuario(s) seleccionado(s) */
  selectedUsers?: Usuario[];
  /** Si permite selección múltiple */
  multiple?: boolean;
  /** Placeholder del campo de búsqueda */
  placeholder?: string;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Si es requerido */
  required?: boolean;
  /** Función cuando cambia la selección */
  onSelectionChange: (users: Usuario[]) => void;
  /** Función de filtro personalizada */
  customFilter?: (user: Usuario, searchTerm: string) => boolean;
  /** Máximo número de usuarios seleccionables */
  maxSelection?: number;
  /** Si debe mostrar avatares */
  showAvatars?: boolean;
  /** Si debe mostrar información adicional */
  showExtraInfo?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Etiqueta del campo */
  label?: string;
  /** Mensaje de error */
  error?: string;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const UserSelector: React.FC<UserSelectorProps> = ({
  usuarios = [],
  selectedUsers = [],
  multiple = false,
  placeholder = 'Buscar usuarios...',
  disabled = false,
  required = false,
  onSelectionChange,
  customFilter,
  maxSelection,
  showAvatars = true,
  showExtraInfo = true,
  className = '',
  label,
  error
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // =============================================
  // EFECTOS
  // =============================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const defaultFilter = (user: Usuario, term: string): boolean => {
    const lowerTerm = term.toLowerCase();
    return (
      user.nombreCompleto.toLowerCase().includes(lowerTerm) ||
      user.email.toLowerCase().includes(lowerTerm) ||
      (user.rol && user.rol.toLowerCase().includes(lowerTerm)) ||
      (user.departamento && user.departamento.toLowerCase().includes(lowerTerm))
    );
  };

  const filteredUsers = usuarios.filter(user => {
    if (!searchTerm) return true;
    
    const filterFn = customFilter || defaultFilter;
    return filterFn(user, searchTerm);
  }).filter(user => 
    // Filtrar usuarios ya seleccionados si no es múltiple
    multiple || !selectedUsers.some(selected => selected.usuarioId === user.usuarioId)
  );

  const isUserSelected = (user: Usuario): boolean => {
    return selectedUsers.some(selected => selected.usuarioId === user.usuarioId);
  };

  const canSelectMore = (): boolean => {
    if (!maxSelection) return true;
    return selectedUsers.length < maxSelection;
  };

  // =============================================
  // HANDLERS
  // =============================================

  const handleToggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleUserSelect = (user: Usuario) => {
    if (disabled) return;

    let newSelection: Usuario[];

    if (multiple) {
      if (isUserSelected(user)) {
        // Remover usuario
        newSelection = selectedUsers.filter(selected => selected.usuarioId !== user.usuarioId);
      } else {
        // Agregar usuario (si no excede el máximo)
        if (canSelectMore()) {
          newSelection = [...selectedUsers, user];
        } else {
          return; // No hacer nada si ya se alcanzó el máximo
        }
      }
    } else {
      // Selección única
      newSelection = isUserSelected(user) ? [] : [user];
      setIsOpen(false);
      setSearchTerm('');
    }

    onSelectionChange(newSelection);
  };

  const handleRemoveUser = (user: Usuario, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    const newSelection = selectedUsers.filter(selected => selected.usuarioId !== user.usuarioId);
    onSelectionChange(newSelection);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredUsers.length) {
          handleUserSelect(filteredUsers[highlightedIndex]);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  // =============================================
  // RENDER FUNCTIONS
  // =============================================

  const renderSelectedUsers = () => {
    if (selectedUsers.length === 0) return null;

    if (multiple) {
      return (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '8px'
        }}>
          {selectedUsers.map(user => (
            <Badge
              key={user.usuarioId}
              label={user.nombreCompleto}
              color={colors.primary}
              size="s"
              variant="subtle"
              removable={!disabled}
              onRemove={() => handleRemoveUser(user)}
              icon={showAvatars ? <User size={12} /> : undefined}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const renderUserItem = (user: Usuario, index: number) => {
    const isSelected = isUserSelected(user);
    const isHighlighted = index === highlightedIndex;

    return (
      <div
        key={user.usuarioId}
        style={{
          padding: '12px',
          cursor: 'pointer',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: isHighlighted 
            ? `${colors.primary}10` 
            : isSelected 
              ? `${colors.primary}05` 
              : 'transparent',
          border: isSelected ? `1px solid ${colors.primary}40` : '1px solid transparent',
          transition: 'all 0.15s ease'
        }}
        onClick={() => handleUserSelect(user)}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        {/* Avatar o ícono */}
        {showAvatars && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: user.avatar ? 'transparent' : `${colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundImage: user.avatar ? `url(${user.avatar})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!user.avatar && <User size={16} color={colors.primary} />}
          </div>
        )}

        {/* Información del usuario */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: colors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {user.nombreCompleto}
          </div>
          
          <div style={{
            fontSize: '12px',
            color: colors.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {user.email}
          </div>

          {/* Información adicional */}
          {showExtraInfo && (user.rol || user.departamento) && (
            <div style={{
              fontSize: '11px',
              color: colors.textSecondary,
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user.rol && user.departamento 
                ? `${user.rol} • ${user.departamento}`
                : user.rol || user.departamento
              }
            </div>
          )}
        </div>

        {/* Indicador de selección */}
        {isSelected && (
          <Check size={16} color={colors.primary} />
        )}
      </div>
    );
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    return (
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          marginTop: '4px',
          maxHeight: '300px',
          overflow: 'hidden'
        }}
      >
        {/* Campo de búsqueda */}
        <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              color={colors.textSecondary} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: colors.background,
                color: colors.text
              }}
            />
          </div>
        </div>

        {/* Lista de usuarios */}
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {filteredUsers.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: colors.textSecondary,
              fontSize: '14px'
            }}>
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
            </div>
          ) : (
            filteredUsers.map((user, index) => renderUserItem(user, index))
          )}
        </div>

        {/* Información de límite */}
        {maxSelection && multiple && (
          <div style={{
            padding: '8px 12px',
            borderTop: `1px solid ${colors.border}`,
            fontSize: '12px',
            color: colors.textSecondary,
            textAlign: 'center'
          }}>
            {selectedUsers.length} / {maxSelection} usuarios seleccionados
          </div>
        )}
      </div>
    );
  };

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: colors.text,
          marginBottom: '6px'
        }}>
          {label}
          {required && (
            <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
          )}
        </label>
      )}

      {/* Selected users (for multiple selection) */}
      {renderSelectedUsers()}

      {/* Selector principal */}
      <div 
        ref={dropdownRef}
        style={{ position: 'relative' }}
      >
        <div
          onClick={handleToggleDropdown}
          style={{
            padding: '10px 14px',
            border: `1px solid ${error ? '#ef4444' : isOpen ? colors.primary : colors.border}`,
            borderRadius: '8px',
            backgroundColor: disabled ? `${colors.textSecondary}10` : colors.background,
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <Users size={16} color={colors.textSecondary} />
            <span style={{
              color: selectedUsers.length > 0 ? colors.text : colors.textSecondary,
              fontSize: '14px'
            }}>
              {selectedUsers.length === 0 
                ? 'Seleccionar usuario(s)...'
                : multiple 
                  ? `${selectedUsers.length} usuario(s) seleccionado(s)`
                  : selectedUsers[0].nombreCompleto
              }
            </span>
          </div>
          
          {isOpen ? (
            <ChevronUp size={16} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={16} color={colors.textSecondary} />
          )}
        </div>

        {renderDropdown()}
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          fontSize: '12px',
          color: '#ef4444',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <X size={12} />
          {error}
        </div>
      )}
    </div>
  );
};