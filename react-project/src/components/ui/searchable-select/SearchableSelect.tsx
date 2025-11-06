import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  /** Etiqueta del campo */
  label?: string;
  /** Valor seleccionado actualmente */
  value?: string | number | null;
  /** Función que se ejecuta cuando cambia la selección */
  onChange?: (value: string | number) => void;
  /** Lista de opciones disponibles */
  options: SearchableSelectOption[];
  /** Texto placeholder */
  placeholder?: string;
  /** Si el campo está deshabilitado */
  disabled?: boolean;
  /** Componente de icono a mostrar */
  icon?: React.ComponentType<any>;
  /** Si el campo es requerido */
  required?: boolean;
  /** Función personalizada para filtrar opciones */
  filterFn?: (option: SearchableSelectOption, searchTerm: string) => boolean;
  /** Función personalizada para renderizar cada opción */
  renderOption?: (option: SearchableSelectOption, isSelected: boolean) => React.ReactNode;
  /** Texto a mostrar cuando no hay resultados */
  noResultsText?: string;
  /** Placeholder del campo de búsqueda */
  searchPlaceholder?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Estilos inline adicionales */
  style?: React.CSSProperties;
  /** ID único del componente */
  id?: string;
  /** Nombre del campo para formularios */
  name?: string;
  /** Función que se ejecuta al abrir/cerrar el dropdown */
  onOpenChange?: (isOpen: boolean) => void;
  /** Función que se ejecuta al cambiar el término de búsqueda */
  onSearchChange?: (searchTerm: string) => void;
  /** Permite crear nuevos elementos cuando no hay resultados */
  allowCreate?: boolean;
  /** Texto para la opción de crear nuevo elemento */
  createText?: string;
  /** Función que se ejecuta al crear un nuevo elemento */
  onCreateNew?: (searchTerm: string) => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seleccione una opción",
  disabled = false,
  icon: IconComponent,
  required = false,
  filterFn,
  renderOption,
  noResultsText = "No se encontraron resultados",
  searchPlaceholder,
  className = '',
  style = {},
  id,
  name,
  onOpenChange,
  onSearchChange,
  allowCreate = false,
  createText = "Crear nuevo",
  onCreateNew
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Función para obtener colores optimizados por tema
  const getThemeColors = () => {
         if (isDark) {
       return {
         background: disabled ? '#2d3748' : '#374151',
         border: disabled ? '#4a5568' : '#4b5563',
         text: disabled ? '#a0aec0' : '#f1f5f9',
         textSecondary: disabled ? '#718096' : '#6b7280',
         surface: '#374151',
         borderFocus: '#3b82f6',
         shadowFocus: '0 0 0 2px rgba(59, 130, 246, 0.3)',
         borderHover: '#6b7280',
         backgroundHover: '#4b5563',
         dropdownBackground: '#374151',
         dropdownBorder: '#4b5563'
       };
    } else {
      return {
        background: disabled ? colors.surface : colors.background,
        border: colors.border,
        text: disabled ? colors.textSecondary : colors.text,
        textSecondary: colors.textSecondary,
        surface: colors.surface,
        borderFocus: colors.primary,
        shadowFocus: '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09), 0 0 0 2px rgba(22, 24, 39, 0.1)',
        borderHover: colors.primary,
        backgroundHover: colors.background,
        dropdownBackground: colors.surface,
        dropdownBorder: colors.border
      };
    }
  };
  
  const themeColors = getThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Función de filtrado por defecto
  const defaultFilterFn = (option: SearchableSelectOption, term: string): boolean => {
    return option.label.toLowerCase().includes(term.toLowerCase());
  };

  // Filtrar opciones basado en la búsqueda
  const filteredOptions = options.filter(option => {
    // Si hay onSearchChange, significa que el filtrado se hace en el servidor
    // por lo que mostramos todas las opciones que vienen del servidor
    if (onSearchChange) {
      return true;
    }
    
    // Si no hay término de búsqueda, mostrar todas las opciones
    if (!searchTerm) return true;
    
    // Usar función de filtrado personalizada o la por defecto
    const filterFunction = filterFn || defaultFilterFn;
    return filterFunction(option, searchTerm);
  });
  


  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string | number) => {
    // Primero cerrar el dropdown y notificar
    setIsOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
    setSearchTerm('');
    
    // Ejecutar onChange después de un microtask para evitar conflictos de timing
    Promise.resolve().then(() => {
      if (onChange) {
        onChange(optionValue);
      }
    });
  };

  const calculateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      const newIsOpen = !isOpen;
      if (newIsOpen) {
        calculateDropdownPosition();
      }
      setIsOpen(newIsOpen);
      if (onOpenChange) {
        onOpenChange(newIsOpen);
      }
      if (!newIsOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    if (onSearchChange) {
      onSearchChange(newSearchTerm);
    }
  };

  // Actualizar posición cuando se redimensiona la ventana o se hace scroll
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      calculateDropdownPosition();
    };

    const handleScroll = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // ⛔ SOLUCIÓN NUCLEAR: Si estamos en un formulario de edición, NO cerrar el dropdown por clicks fuera
      const isInEditForm = (target as Element).closest('.editForm') !== null;
      if (isInEditForm) {
        return; // NO hacer nada si estamos en un formulario de edición
      }
      
      // Verificar si estamos dentro de un modal
      const isInModal = (target as Element).closest('[class*="overlay"], [class*="modal"]') !== null;
      
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        // Verificar si el click fue dentro del dropdown
        const dropdownElement = document.getElementById(`dropdown-${id || 'searchable-select'}`);
        if (dropdownElement && !dropdownElement.contains(target)) {
          // Si estamos en un modal, solo cerrar si el click es en el contenido del modal, no en el overlay
          if (isInModal) {
            const clickedInModalContent = (target as Element).closest('[class*="modal"]') !== null && 
                                         !(target as Element).closest('[class*="overlay"]');
            if (clickedInModalContent) {
              setIsOpen(false);
              setSearchTerm('');
            }
          } else {
            setIsOpen(false);
            setSearchTerm('');
          }
        }
      }
    };

    // Usar capture para interceptar el evento antes que otros listeners
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, id]);

  // Función de renderizado por defecto
  const defaultRenderOption = (option: SearchableSelectOption, isSelected: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
      {IconComponent && <IconComponent size={16} color={themeColors.textSecondary} />}
      <span style={{ flex: 1 }}>{option.label}</span>
      {isSelected && <Check size={16} color={isDark ? '#3b82f6' : colors.primary} />}
    </div>
  );

  const renderOptionContent = renderOption || defaultRenderOption;

  // Generar placeholder de búsqueda dinámico
  const dynamicSearchPlaceholder = searchPlaceholder || (label ? `Buscar ${label.toLowerCase()}...` : "Buscar...");

  // Generar ID único para el dropdown
  const dropdownId = `dropdown-${id || 'searchable-select'}`;

  // Renderizar dropdown usando portal
  const renderDropdown = () => {
    if (!isOpen || disabled) return null;

    return createPortal(
      <div 
        id={dropdownId}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 99999, // Z-index más alto que los modales (que usan 1000)
          backgroundColor: themeColors.dropdownBackground,
          border: `1px solid ${themeColors.dropdownBorder}`,
          borderRadius: '8px',
          boxShadow: isDark 
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          maxHeight: '300px',
          overflow: 'hidden'
        }}
      >
        {/* Search Input */}
        <div style={{
          padding: '12px',
          borderBottom: `1px solid ${themeColors.dropdownBorder}`
        }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              color={themeColors.textSecondary}
              style={{ 
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} 
            />
            <input
              type="text"
              placeholder={dynamicSearchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: `1px solid ${themeColors.dropdownBorder}`,
                borderRadius: '6px',
                backgroundColor: isDark ? '#1f2937' : colors.background,
                color: isDark ? '#f1f5f9' : colors.text,
                fontSize: '14px',
                outline: 'none'
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Options */}
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option.value);
                }}
                disabled={option.disabled}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: value === option.value 
                    ? (isDark ? '#4b5563' : `${colors.primary}15`) 
                    : 'transparent',
                  color: option.disabled 
                    ? themeColors.textSecondary 
                    : (isDark ? '#e2e8f0' : colors.text),
                  fontSize: '14px',
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                  opacity: option.disabled ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!option.disabled && value !== option.value) {
                    e.currentTarget.style.backgroundColor = isDark 
                      ? '#4b5563' 
                      : `${colors.primary}08`;
                    e.currentTarget.style.color = isDark ? '#f1f5f9' : colors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!option.disabled && value !== option.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDark ? '#e2e8f0' : colors.text;
                  }
                }}
              >
                {renderOptionContent(option, value === option.value)}
              </button>
            ))
          ) : (
            <div>
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: themeColors.textSecondary,
                fontSize: '14px'
              }}>
                {noResultsText}
              </div>
              {allowCreate && searchTerm.trim() && onCreateNew && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNew(searchTerm.trim());
                    setIsOpen(false);
                    setSearchTerm('');
                    if (onOpenChange) {
                      onOpenChange(false);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: isDark ? '#3b82f6' : colors.primary,
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textAlign: 'center',
                    transition: 'background-color 0.15s ease',
                    borderTop: `1px solid ${themeColors.dropdownBorder}`,
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark 
                      ? '#1e3a8a20' 
                      : `${colors.primary}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  + {createText}: "{searchTerm.trim()}"
                </button>
              )}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        ...style
      }}
      className={className}
      id={id}
    >
      {/* Label */}
      {label && (
        <label style={{ 
          fontSize: '14px', 
          fontWeight: '500',
          color: isDark ? '#f1f5f9' : colors.text 
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        disabled={disabled}
        name={name}
        style={{
          width: '100%',
          height: '32px',
          padding: '0 12px',
          borderRadius: '8px',
          border: `0.5px solid ${themeColors.border}`,
          backgroundColor: themeColors.background,
          color: themeColors.text,
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'left',
          opacity: disabled ? (isDark ? 0.7 : 0.6) : 1,
          transition: 'all 0.2s ease-in-out',
          boxShadow: isDark 
            ? 'inset 0 1px 2px rgba(0, 0, 0, 0.1)' 
            : '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09)'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = themeColors.borderHover;
            e.currentTarget.style.backgroundColor = themeColors.backgroundHover;
            e.currentTarget.style.boxShadow = isDark 
              ? 'inset 0 1px 2px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3)'
              : '1px 1px 4px 1px rgba(196, 186, 186, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = themeColors.border;
            e.currentTarget.style.backgroundColor = themeColors.background;
            e.currentTarget.style.boxShadow = isDark 
              ? 'inset 0 1px 2px rgba(0, 0, 0, 0.1)' 
              : '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09)';
          }
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = themeColors.borderFocus;
            e.currentTarget.style.backgroundColor = themeColors.background;
            e.currentTarget.style.boxShadow = isDark 
              ? `inset 0 1px 2px rgba(0, 0, 0, 0.1), ${themeColors.shadowFocus}`
              : themeColors.shadowFocus;
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = themeColors.border;
            e.currentTarget.style.backgroundColor = themeColors.background;
            e.currentTarget.style.boxShadow = isDark 
              ? 'inset 0 1px 2px rgba(0, 0, 0, 0.1)' 
              : '1px 1px 2px 0.5px rgba(196, 186, 186, 0.09)';
          }
        }}
      >
        {IconComponent && <IconComponent size={16} color={themeColors.textSecondary} />}
        <span style={{ 
          flex: 1,
          color: selectedOption ? themeColors.text : themeColors.textSecondary
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          color={themeColors.textSecondary}
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>

      {/* Dropdown renderizado usando portal */}
      {renderDropdown()}

      {/* Input hidden para validación HTML5 nativa */}
      {required && (
        <input
          type="text"
          value={value ? value.toString() : ''}
          onChange={() => {}} // 🔧 FIX: Agregar onChange vacío para evitar warnings
          required
          style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            pointerEvents: 'none'
          }}
          onInvalid={(e) => {
            e.preventDefault();
            // Aquí podrías agregar lógica adicional de manejo de errores si es necesario
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
};